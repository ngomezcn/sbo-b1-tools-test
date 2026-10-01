---
title: Transaction API
source: pdf pp. 125-127, sec 3.19.5.5
summary: The startTransaction, commitTransaction, rollbackTransaction and isInTransaction APIs, with a transactional create example and the 10-operation limit.
---

# Transaction API

Transaction APIs, such as those listed below, are packaged in the module `ServiceLayerContext.js`, which is an essential module, required to control transactions.

<!-- table: t126-01 -->
| API Name | API Description |
|---|---|
| `startTransaction` | Starts a transaction. |
| `commitTransaction` | Commits a transaction. |
| `rollbackTransaction` | Rollbacks a transaction. |
| `isInTransaction` | Returns true if the current operation is in a transaction. |

> **Example**
>
> To handle a request such as the one below,
>
> **Sample Code**
>
> ```http
> POST /b1s/v1/script/mtcsys/test_create_businesspartner
> [
>   {
>     "CardCode": "c001",
>     "CardName": "c001"
>   },
>   {
>     "CardCode": "c002",
>     "CardName": "c002"
>   },
>   {
>     "CardCode": "c003",
>     "CardName": "c003"
>   },
>   {
>     "CardCode": "c004",
>     "CardName": "c004"
>   },
>   {
>     "CardCode": "c005",
>     "CardName": "c005"
>   }
> ]
> ```
>
> apply the following script:
>
> **Sample Code**
>
> ```javascript
> var ServiceLayerContext = require('ServiceLayerContext.js');
> var http = require('HttpModule.js');
> var BusinessPartner = require('EntityType/BusinessPartner.js');
> function POST() {
>
>     var slContext = new ServiceLayerContext();
>     var bpList = http.request.getJsonObj();
>     if (!(bpList instanceof Array)) {
>         throw http.ScriptException(http.HttpStatus.HTTP_BAD_REQUEST,
> "invalid format of payload");
>     }
>     slContext.startTransaction();
>     for (var i = 0; i < bpList.length; ++i) {
>         var res = slContext.BusinessPartners.add(bpList[i]);
>         if (!res.isOK()) {
>             slContext.rollbackTransaction();
>             throw http.ScriptException(http.HttpStatus.HTTP_BAD_REQUEST,
> res.getErrMsg());
>         }
>     };
>     slContext.commitTransaction();
>     http.response.setContentType(http.ContentType.TEXT_PLAIN);
>     http.response.send(http.HttpStatus.HTTP_OK, "transaction committed");
> }
> ```
>
> On Success, Service Layer returns:
>
> **Output Code**
>
> ```http
> HTTP/1.1 200 OK
> transaction committed
> ```
>
> Send this request again, Service Layer returns:
>
> **Output Code**
>
> ```http
> HTTP/1.1 400 Bad Request
> {
>    "error" : {
>       "code" : 600,
>       "message" : {
>          "lang" : "en-us",
>          "value" : "1320000140 - Business partner code 'c001' already
> assigned to a business partner; enter a unique business partner code"
>       }
>    }
> }
> ```

> **Note**
>
> - Programmers should be aware that transaction operations are expensive and big transactions degrade Web service throughput. Thus, Service Layer imposes a limitation on the transaction size. The total operations in one transaction should be no more than 10.
> - Please keep in mind that the following transactions should be called as pairs: `startTransaction/commitTransaction or startTransaction/rollbackTransaction.`
