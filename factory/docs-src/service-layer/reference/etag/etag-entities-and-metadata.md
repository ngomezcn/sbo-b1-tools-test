---
title: Entities with ETag and ETag metadata
source: pdf pp. 164-166, sec 5.3, 5.4
summary: Which business objects support ETag as of FP 2102, and how ETag is expressed in OData V4 and V3 metadata.
---

# Entities with ETag and ETag metadata

## Entities with ETag

As of SAP Business One 10.0 FP 2102, the following business objects are enabled with the Etag mechanism:

- PurchaseDeliveryNotes
- CorrectionPurchaseInvoiceReversal
- Drafts
- CreditNotes
- Invoices
- GoodsReturnRequest
- PurchaseRequests
- InventoryGenEntries
- InventoryGenExits
- Orders
- DeliveryNotes
- PurchaseDownPayments
- Returns
- CorrectionInvoice
- CorrectionInvoiceReversal
- CorrectionPurchaseInvoice
- PurchaseInvoices
- PurchaseCreditNotes
- DownPayments
- PurchaseReturns
- PurchaseOrders
- ReturnRequest
- Quotations
- PurchaseQuotations
- Activities
- AdditionalExpenses
- Items
- BusinessPartners

## ETag Metadata

In OData V4, the Etag is represented by an annotation in the entity set.

```xml
<EntitySet EntityType="SAPB1.BusinessPartner" Name="BusinessPartners">
    <Annotation Term="Org.OData.Core.V1.OptimisticConcurrency">
        <Collection>
            <PropertyPath>DataVersion</PropertyPath>
        </Collection>
    </Annotation>
    ...
</EntitySet>
```

The annotation is with the term attribute `Org.OData.Core.V1.OptimisticConcurrency`, indicating the internal concurrency mode is optimistic.

Inside the annotation, a collection of properties is presented to indicate the relevant properties used to achieve the optimistic concurrency.

However, OData V3 uses different metadata to reflect the ETag, as below.

```xml
<EntityType Name="BusinessPartner">
    <Key>
        <PropertyRef Name="CardCode"/>
    </Key>
    ...
    <Property ConcurrencyMode="Fixed" Name="DataVersion" Type="Edm.Int32"/>
</EntityType>
```

`ConcurrencyMode` specifies that the value of that declared property should be used for optimistic concurrency checks. Essentially, declared properties marked with a fixed `ConcurrencyMode` become part of a concurrency token.

As OData V4 is the prevalent protocol nowadays, it is strongly recommended that you use OData V4 to consume the Service Layer.
