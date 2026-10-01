---
title: Query APIs
source: pdf pp. 234-235, sec 11.4
summary: How a DI API Recordset SQL query maps to a Service Layer OData query on BusinessPartners.
---

# Query APIs

DI API exposes the object **Recordset** to execute native SQL to implement a query, while Service Layer makes use of OData query to finish the equivalent functionality.

## DI API

> **Sample Code**
>
```csharp
SAPbobsCOM.Recordset oRecordSet =
oCompany.GetBusinessObject(BoObjectTypes.BoRecordset);
oRecordSet.DoQuery("Select \"CardCode\", \"CardName\" from OCRD where
\"CardCode\" >= 'C001'");
while (!oRecordSet.EoF)
{
    Console.WriteLine("{0}={1},{2}={3}", oRecordSet.Fields.Item(0).Name,
oRecordSet.Fields.Item(0).Value,
        oRecordSet.Fields.Item(1).Name, oRecordSet.Fields.Item(1).Value);
    oRecordSet.MoveNext();
}
```

## Service Layer

> **Sample Code**
>
```http
GET /BusinessPartners?$select=CardCode, CardName&$filter=CardCode ge 'C001'
{
    "odata.metadata": "https://
databaseserver:50000/b1s/v1/$metadata#BusinessPartners",
    "value": [
        {
            "CardCode": "ce7a456e-ead4-4",
            "CardName": "bb72965f-b076-4a81-859f-a2bde7b5b356"
        },
        ...
        {
            "CardCode": "ce8da8a1-d674-4",
            "CardName": "cbdb91d7-1a29-4e64-9ce8-0bd0a72704b8"
        }
    ]
}
```

> **Note**
>
> The response of Service Layer is in JSON format. If you want to iterate the result set as DI API does, you have to make use of OData client libraries (for example, WCF).
