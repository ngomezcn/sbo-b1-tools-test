---
title: Transaction APIs
source: pdf pp. 233-234, sec 11.3
summary: How DI API transactions map to a Service Layer batch request with a change set, and the limits of that equivalent.
---

# Transaction APIs

Service Layer does not explicitly provide APIs about transaction because OData protocol is stateless. However, the **batch** request can be posted to perform the comparable functionality.

## DI API

> **Sample Code**
>
```csharp
oCompany.StartTransaction();
SAPbobsCOM.Items items = oCompany.GetBusinessObject(BoObjectTypes.oItems);
items.ItemCode = "item_001";
items.ItemName = "item_001_name";
items.Add();
if (items.GetByKey("item_001"))
{
    items.ItemName = "item_001_name new";
    items.Update();
    oCompany.EndTransaction(BoWfTransOpt.wf_Commit);
}
else
{
    oCompany.EndTransaction(BoWfTransOpt.wf_RollBack);
}
```

## Service Layer

> **Sample Code**
>
```http
POST /$batch
Content-Type: multipart/mixed;boundary=batch_36522ad7-
fc75-4b56-8c71-56071383e77b
--batch_36522ad7-fc75-4b56-8c71-56071383e77b
Content-Type: multipart/mixed;boundary=changeset_77162fcd-b8da-41ac-
a9f8-9357efbbd
--changeset_77162fcd-b8da-41ac-a9f8-9357efbbd
Content-Type: application/http
Content-Transfer-Encoding: binary
Content-ID: 1
POST /b1s/v1/Items
Content-Type: application/json
{"ItemCode":"item_001", "ItemName":"item_001_name"}
--changeset_77162fcd-b8da-41ac-a9f8-9357efbbd
Content-Type: application/http
Content-Transfer-Encoding: binary
Content-ID: 2
PATCH /b1s/v1/Items('item_001')
Content-Type: application/json
{"ItemName":"item_001_name new"}
--changeset_77162fcd-b8da-41ac-a9f8-9357efbbd--
--batch_36522ad7-fc75-4b56-8c71-56071383e77b--
```

> **Note**
>
> The first two lines indicate that this request is a batch request and the request header should be set to 'Content-Type: multipart/mixed;boundary=batch_36522ad7-fc75-4b56-8c71-56071383e77b'.
>
> The remaining part is the exact batch body.
>
> - Multiple operations in the batch body should be enclosed in a change set so as to be treated as an atomic operation.
> - The batch request does not provide a chance for clients to rollback transactions. If all operations are successful, the batch automatically performs this transaction.
> - You can enclose complex business logic in one transaction via DI API, while you cannot do it via Service Layer.
>
> For more information about batch specifications, see [Batch operations](../consuming-service-layer/batch-operations.md).
