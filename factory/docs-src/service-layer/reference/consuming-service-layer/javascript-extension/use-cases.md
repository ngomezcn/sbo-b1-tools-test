---
title: Typical use cases of scripting and consuming a script service from .NET
source: pdf pp. 132-136, sec 3.19.9, 3.19.10
summary: Script examples for complex transactions and UDO business logic, and how to call a script service from a .NET application with Web Http.
---

# Typical use cases of scripting and consuming a script service from .NET

- [Typical User Cases of Applying Script](#typical-user-cases-of-applying-script)
- [Consume Script Service from .Net Application](#consume-script-service-from-net-application)

## Typical User Cases of Applying Script

### Complex Transactions

Scripting can be used in transaction scenarios, which is an important complement to the OData Batch operations. The following is an example for adding an order and a delivery based on the order in one transaction, which would be impossible without scripting.

> **Example**
>
> ```javascript
> var ServiceLayerContext = require('ServiceLayerContext.js');
> var http = require('HttpModule.js');
> var Order = require('EntityType/Document.js');
> var DeliveryNote = require('EntityType/Document.js');
> /*
>  * Entry function for the POST http request.
>  *
>  */
> function POST() {
>     var order = new Order();
>
>     order.CardCode = 'c1';
>     order.DocDate = new Date();
>     order.DocDueDate = new Date();
>     var line = new Order.DocumentLine();
>     line.ItemCode = 'i1';
>     line.Quantity = 1;
>     line.UnitPrice = 10;
>
>     var line2 = new Order.DocumentLine();
>     line2.ItemCode = 'i2';
>     line2.Quantity = 1;
>     line2.UnitPrice = 10;
>
>     order.DocumentLines = new Order.DocumentLineCollection();
>     order.DocumentLines.add(line);
>     order.DocumentLines.add(line2);
>
>     var slContext = new ServiceLayerContext();
>
>     //start the transaction
>     slContext.startTransaction();
>     var res = slContext.Orders.add(order);
>     if (!res.isOK()) {
>         slContext.rollbackTransaction();
>         return http.response.send(http.HttpStatus.HTTP_BAD_REQUEST, res.body);
>     }
>     //get the newly created order from the response body.
>     var newOrder = Order.create(res.body);
>     //create a delivery based on the order
>     var deliveryNote = new DeliveryNote();
>     deliveryNote.DocDate = newOrder.DocDate;
>     deliveryNote.DocDueDate = newOrder.DocDueDate;
>     deliveryNote.CardCode = newOrder.CardCode;
>     deliveryNote.DocumentLines = new DeliveryNote.DocumentLineCollection();
>     for (var lineNum = 0; lineNum < order.DocumentLines.length; ++lineNum) {
>         var line = new DeliveryNote.DocumentLine();
>         line.BaseType = 17;
>         line.BaseEntry = newOrder.DocEntry;
>         line.BaseLine = lineNum;
>         deliveryNote.DocumentLines.add(line);
>     }
>
>     res = slContext.DeliveryNotes.add(deliveryNote);
>     if (!res.isOK()) {
>         slContext.rollbackTransaction();
>         return http.response.send(http.HttpStatus.HTTP_BAD_REQUEST, res.body);
>     }else{
>         slContext.commitTransaction();
>         return http.response.send(http.HttpStatus.HTTP_CREATED, res.body);
>     }
> }
> ```

### Customized Business Logic (e.g. UDO)

Another typical case for scripting is to add customized business logic during the process of operating userdefined objects (UDO). The following is an example for performing some validations and calculating the `DocTotal` when creating the UDO named `MyOrder`.

> **Example**
>
> ```http
> POST /b1s/v1/script/mtcsys/test_myorder
> {
>   "U_CustomerName": "c1",
>   "U_DocTotal": 0,
>   "MyOrderLinesCollection": [
>     {
>       "U_ItemName": "i1",
>       "U_Price": 100,
>       "U_Quantity": 3
>     },
>     {
>       "U_ItemName": "i2",
>       "U_Price": 80,
>       "U_Quantity": 4
>     }
>   ]
> }
> ```
>
> Apply the following script to handle the above request:
>
> ```javascript
> function POST() {
> //Before creating the UDO, users are allowed to add extra logic.
>     var myOrder = http.request.getJsonObj();
>     var slContext = new ServiceLayerContext();
>
> //Example 1 : added logic to validate if each item exists and the item stock
> is enough.
>     myOrder.MyOrderLinesCollection.forEach(function (line) {
>         var dataSvcRes = slContext.Items.get(line.U_ItemName);
>         if (!dataSvcRes.isOK()) {
>             throw new http.ScriptException(http.HttpStatus.HTTP_NOT_FOUND,
> "item not found");
>         } else {
>             //Convert weak type to strong type by calling Item.create. The
> conversion is not a must.
>             //You can also use dataSvcRes.body.QuantityOnStock
>             var item = Item.create(dataSvcRes.body);
>             if (item.QuantityOnStock < line.U_Quantity) {
>                 throw new
> http.ScriptException(http.HttpStatus.HTTP_BAD_REQUEST, "not enough items on
> stock");
>             }
>         }
>     });
> //Example 2 : added logic to calculate the DocTotal
>     myOrder.U_DocTotal = 0;
>     myOrder.MyOrderLinesCollection.forEach(function (line) {
>         myOrder.U_DocTotal += (line.U_Price * line.U_Quantity);
>     });
>
> //Add this UDO
>     var res = slContext.add("MyOrder", myOrder);
>     if (res.isOK()) {
>         http.response.send(http.HttpStatus.HTTP_CREATED, res.body);
>     } else {
>         http.response.send(http.HttpStatus.HTTP_BAD_REQUEST, res.body);
>     }
> }
> ```

## Consume Script Service from .Net Application

For purposes of flexibility, SL allows the response from the script to be highly-customized. It is not appropriate to define the fixed metadata for the scripting, and as such, using the single `WCF` framework is not possible to consume the script service. As an alternative, it is suggested to program with the .NET Web Http library mixed with WCF, illustrated with the below code snippet.

```csharp
[TestFixture]
    class ScriptOrdersTest : AppCommon.GeneralTestGroup
    {
        [SetUp]
        public void setup()
        {
            ServicePointManager.ServerCertificateValidationCallback +=
delegate(object sender, X509Certificate cert, X509Chain chain, SslPolicyErrors
ssl) { return true; };
            ServicePointManager.Expect100Continue = false;
            ServicePointManager.MaxServicePointIdleTime = 2000;
        }
        private string m_cookie = AppCommon.WebConnection.Instance.SessionID;
        private Uri m_baseUri = new Uri(AppCommon.ConfigInfo.Instance().SL_URL);
        private int m_docEntry = 0;
        [Test]
        public void test01_create()
        {
            Document order = new Document();
            order.CardCode = "c1";
            order.DocDate = DateTime.Now;
            order.DocDueDate = DateTime.Now;
            {
                DocumentLine line = new DocumentLine();
                line.LineNum = 1;
                line.ItemCode = "i1";
                line.Quantity = 1;
                line.UnitPrice = 10;
                order.DocumentLines.Add(line);
            }
            {
                DocumentLine line = new DocumentLine();
                line.LineNum = 2;
                line.ItemCode = "i2";
                line.Quantity = 1;
                line.UnitPrice = 10;
                order.DocumentLines.Add(line);
            }
            try
            {
                var setting = new JsonSerializerSettings() { NullValueHandling =
NullValueHandling.Ignore };
                string json = JsonConvert.SerializeObject(order, setting);
                var data = Encoding.ASCII.GetBytes(json);
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(new
Uri(m_baseUri, "script/test/test_orders"));
                request.CachePolicy = new
System.Net.Cache.RequestCachePolicy(System.Net.Cache.RequestCacheLevel.NoCacheNoS
tore);
                request.Method = "POST";
                request.KeepAlive = false;
                request.Headers["Cookie"] = m_cookie;
                request.ContentType = "application/json;odata=minimalmetadata";
                request.ContentLength = data.Length;
                using (var stream = request.GetRequestStream())
                {
                    stream.Write(data, 0, data.Length);
                }
                HttpWebResponse response =
(HttpWebResponse)request.GetResponse();
                Assert.AreEqual(response.StatusCode, HttpStatusCode.Created);
                var responseString = new
StreamReader(response.GetResponseStream()).ReadToEnd();
                Document newEntity =
JsonConvert.DeserializeObject<Document>(responseString);
                Assert.IsTrue(newEntity.DocEntry > 0);
                Assert.AreEqual(newEntity.DocumentLines.Count(),
order.DocumentLines.Count());
                response.Close();
                m_docEntry = newEntity.DocEntry;
            }
            catch (WebException ex)
            {
                WebResponse response = ex.Response;
                if (response == null)
                {
                    throw SetResultMessage(ex);
                }
                var responseString = new
StreamReader(response.GetResponseStream()).ReadToEnd();
                throw SetResultMessage(new Exception(responseString));
            }
            catch (Exception ex)
            {
                throw SetResultMessage(ex);
            }
        }
```
