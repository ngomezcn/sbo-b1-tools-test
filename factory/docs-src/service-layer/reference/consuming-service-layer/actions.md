---
title: Actions
source: pdf pp. 28-31, sec 3.5
summary: Bound and global OData actions called with POST, with examples for Close, the Activity global actions and previewing an order.
---

# Actions

Besides the basic entity CRUD operations, Service Layer provides you with two kinds of actions:

- Bound action (bound to entity for operations other than CRUD)
- Global action (mainly used to expose SAP Business One services)

The request and response for each action are described in the metadata. For example, the login function that was introduced above is a global action. You can find its definition in metadata.

> **Note**
>
> "Action" is an OData version 4 concept. In OData version 3, it is called "FunctionImport".

You can use the HTTP verb `POST` for OData actions.

> **Example**
>
> **How to use the bound action**
>
> In the metadata section 2.1, you can see a bindable action named "Close" with the first parameter bound to the `Document` type:
>
> ```xml
> <!-- section 2.1 -->
> <Action IsBindable="true" Name="Close">
>   <Parameter Name="Document" Type="SAPB1.Document"/>
> </Action>
> ```
>
> As orders are of type Document, that means orders have a "Close" action. You can send the following HTTP request to close the document No. 22:
>
> ```http
> POST /Orders(22)/Close
> ```

> **Example**
>
> **How to use the global action**
>
> In SAP Business One DI API, you can use the `SAPbobsCOM.Activity` object to operate the activities in SAP Business One. However, in SAP Business One 9.1 patch level 01, from Service Layer, you cannot find the `Activity` entity.
>
> By searching in metadata, you can find the action definitions, as follows:
>
> ```xml
> <Action Name="ActivitiesService_GetActivity">
>   <Parameter Name="ActivityParams" Type="SAPB1.ActivityParams"/>
>   <ReturnType Type="SAPB1.Activity"/>
> </Action>
> <Action Name="ActivitiesService_AddActivity">
>   <Parameter Name="Activity" Type="SAPB1.Activity"/>
>   <ReturnType Type="SAPB1.ActivityParams"/>
> </Action>
> ```
>
> Note that the example follows the format of OData version 4. For OData version 3, "FunctionImport" is used instead of "Action". The result is as follows:
>
> ```xml
> <FunctionImport Name="ActivitiesService_GetActivity">
>   <Parameter Name="ActivityParams" Type="SAPB1.ActivityParams"/>
>   <ReturnType Type="SAPB1.Activity"/>
> </FunctionImport>
> <FunctionImport Name="ActivitiesService_AddActivity">
>   <Parameter Name="Activity" Type="SAPB1.Activity"/>
>   <ReturnType Type="SAPB1.ActivityParams"/>
> </FunctionImport>
> ```
>
> It shows that you can use `ActivitiesService` to get and add activity objects. The related types are also defined in metadata, as follows:
>
> ```xml
> <ComplexType Name="ActivityParams">
>   <Property Name="ActivityCode" Nullable="false" Type="Edm.Int32"/>
> </ComplexType>
> <ComplexType Name="Activity">
>   <Property Name="ActivityCode" Nullable="false" Type="Edm.Int32"/>
>   <Property Name="CardCode" Type="Edm.String"/>
>   <Property Name="Notes" Type="Edm.String"/>
>   ...
> </ComplexType>
> ```
>
> To add an activity, send the HTTP request:
>
> ```http
> POST /ActivitiesService_AddActivity
> {
>     "Activity":{
>         "ActivityCode": 1,
>         "CardCode": "c1"
>     }
> }
> ```
>
> On success, it returns the content of type `SAPB1.ActivityParams` as defined.
>
> To get an activity, send the HTTP request:
>
> ```http
> POST /ActivitiesService_GetActivity
> {
>     "ActivityParams": {
>         "ActivityCode": 1
>     }
> }
> ```
>
> On success, it returns the content of type `SAPB1.Activity` as defined.
>
> Note that from SAP Business One 9.1 patch level 02 and later, "Activity" has been exposed as an entity, and, therefore, the global actions were hidden by default.

> **Example**
>
> **Previewing an order**
>
> A hidden action named `OrdersService_Preview` allows you to preview an order to create without actually creating it. Its metadata is as follows:
>
> ```xml
> <Action Name="OrdersService_Preview">
>   <Parameter Name="Document" Type="SAPB1.Document"/>
>   <ReturnType Type="SAPB1.Document"/>
> </Action>
> ```
>
> An order to create can be previewed this way:
>
> ```http
> POST /b1s/v1/OrdersService_Preview
> {
>   "Document": {
>     "CardCode": "c1",
>     "DocDate": "2014-04-01",
>     "DocDueDate": "2014-04-01",
>     "DocumentLines": [
>       {
>         "ItemCode": "i1",
>         "UnitPrice": 100,
>         "Quantity": 10,
>         "TaxCode": ""
>       }
>     ]
>   }
> }
> ```
>
> On success, the server returns HTTP code 200 (OK) and part of the response is as follows:
>
> ```http
> HTTP/1.1 200 OK
> {
>   "DocEntry": null,
>   "DocNum": null,
>   "DocType": "dDocument_Items",
>   "Printed": "psNo",
>   "DocDate": "2014-04-01",
>   "DocDueDate": "2014-04-01",
>   "CardCode": "c1",
>   "CardName": "customer 1",
>   "DocTotal": 1000,
>   "DocCurrency": "$",
>   "JournalMemo": "Sales Orders - 0af75168-60cd-4",
>   "TaxDate": "2014-04-01",
>   "DocObjectCode": "17",
>   "DocTotalSys": 1000,
>   "DocumentStatus": "bost_Open",
>   "TotalDiscount": 0,
>   "DocumentLines": [
>     {
>       "LineNum": 0,
>       "ItemCode": "i1",
>       "ItemDescription": "i01",
>       "Quantity": 10,
>       "ShipDate": "2014-04-01",
>       "Price": 100,
>       "PriceAfterVAT": 100,
>       "Currency": "$",
>       "WarehouseCode": "01",
>       "AccountCode": "_SYS00000000081",
>       "TaxCode": "",
>       "LineTotal": 1000,
>       "TaxTotal": 0,
>       "UnitPrice": 100,
>       "LineStatus": "bost_Open",
>       "PackageQuantity": 10,
>       "LineType": "dlt_Regular",
>       "OpenAmountSC": 1000,
>       "DocEntry": null,
>       "UoMCode": "Manual",
>       "InventoryQuantity": 10,
>     ......
>     }
>   ],
>   ......
> }
> ```
