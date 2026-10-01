---
title: CRUD APIs: Service Layer versus DI API
source: pdf pp. 229-232, sec 11, 11.1
summary: Side-by-side DI API and Service Layer samples for creating, retrieving, updating and deleting an Order entity.
---

# CRUD APIs: Service Layer versus DI API

This section explains the differences in how to invoke the APIs to finish the corresponding functionalities in SAP Business One Service Layer versus in SAP Business One DI API.

The APIs fall into different categories in terms of the operations for entity CRUD, Transaction, Query, Company Service and UDO.

## CRUD APIs

We take the object **Order** as a typical example to illustrate how to invoke CRUD APIs.

### Creating Entities

#### DI API

> **Sample Code**
>
```csharp
SAPbobsCOM.Company oCompany;
...
SAPbobsCOM.Documents order =
(Documents)oCompany.GetBusinessObject(BoObjectTypes.oOrders);
order.CardCode = "c001";
order.DocDate = DateTime.Today;
order.DocDueDate = DateTime.Today;
//Add items lines
order.Lines.ItemCode = "i001";
order.Lines.Quantity = 1;
order.Lines.TaxCode = "T1";
order.Lines.UnitPrice = 100;
order.Lines.Add();
//Add this newly created order
int retCode = order.Add();
```

#### Service Layer

> **Sample Code**
>
```http
POST /Orders
{
    "CardCode": "c001",
    "DocDate": "2014-04-01",
    "DocDueDate": "2014-04-01",
    "DocumentLines": [
        {
            "ItemCode": "i001",
            "UnitPrice": 100,
            "Quantity": 1,
            "TaxCode": "T1"
        }
    ]
}
```

### Retrieving Entities

#### DI API

> **Sample Code**
>
```csharp
SAPbobsCOM.Documents order =
(Documents)oCompany.GetBusinessObject(BoObjectTypes.oOrders);
bool bRet = order.GetByKey(2);
if (bRet)
{
  Console.WriteLine(order.GetAsXML());
}
```

#### Service Layer

> **Sample Code**
>
```http
GET /Orders(2)
```

### Updating Entities

#### DI API

> **Sample Code**
>
```csharp
SAPbobsCOM.Documents order =
(Documents)oCompany.GetBusinessObject(BoObjectTypes.oOrders);
order.GetByKey(2);
order.Comments = "New comments";
order.Update();
```

#### Service Layer

> **Sample Code**
>
```http
PATCH /Orders(2)
{
  "Comments":"New comments"
}
```

### Deleting Entities

#### DI API

> **Sample Code**
>
```csharp
SAPbobsCOM.Documents order =
(Documents)oCompany.GetBusinessObject(BoObjectTypes.oOrders);
order.GetByKey(2);
order.Remove();
```

#### Service Layer

> **Sample Code**
>
```http
DELETE /Orders(2)
```
