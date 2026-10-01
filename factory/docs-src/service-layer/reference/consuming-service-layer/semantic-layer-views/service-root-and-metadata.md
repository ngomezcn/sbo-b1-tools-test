---
title: Semantic Layer Service Root and Metadata
source: pdf pp. 53-56, sec 3.7.4, 3.7.5
summary: The /b1s/v1/sml.svc service root, its $metadata document, the virtual id__ key, and how views with placeholders are exposed through parameter entities and navigation.
---

# Semantic Layer Service Root and Metadata

## Semantic Layer Service Root

To distinguish Semantic Layer service from Service Layer, the root URL for this service is `/b1s/v1/sml.svc`.

Upon successfully accessing this URL, the response is as follows:

```http
HTTP/1.1 200 OK
{
    "@odata.context": "https://databaseserver:50000/b1s/v1/sml.svc/$metadata",
    "value": [
        {
            "name": "PurchaseOrderFulfillmentCycleTimeQuery",
            "kind": "EntitySet",
            "url": "PurchaseOrderFulfillmentCycleTimeQuery"
        },
        {
            "name": "VendorBalanceAnalysisQuery",
            "kind": "EntitySet",
            "url": "VendorBalanceAnalysisQuery"
        },
        {
            "name": "AveragePurchasingPriceQuery",
            "kind": "EntitySet",
            "url": "AveragePurchasingPriceQuery"
        },
    ...
}
```

> **Note**
>
> `@odata.context` is one annotation from OData 4.

## Semantic Layer Service Metadata

The service metadata URL is as follows:

```http
GET /b1s/v1/sml.svc/$metadata
```

Upon successfully accessing the metadata, the service returns:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<edmx:Edmx Version="4.0"
    xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">
    <edmx:DataServices>
        <Schema Namespace="SAPB1"
            xmlns="http://docs.oasis-open.org/odata/ns/edm">
            <EntityType Name="AveragePurchasingPriceQuery">
                <Key>
                    <PropertyRef Name="id__"/>
                </Key>
                <Property MaxLength="160" Name="LineDocumentOwner"
Nullable="true" Type="Edm.String"/>
                <Property MaxLength="15" Name="PaymentMethodCode"
Nullable="true" Type="Edm.String"/>
                <Property Name="PostingDateSQL" Nullable="true"
Type="Edm.DateTime"/>
                       ...
                <Property Name="id__" Nullable="false" Type="Edm.Int32"/>
            </EntityType>
            <EntityType Name="OnTimeReceiptStatisticsQuery">
                <Key>
                    <PropertyRef Name="id__"/>
                </Key>
                <Property MaxLength="160" Name="DocumentOwner" Nullable="true"
Type="Edm.String"/>
                <Property Name="NumberOfPurchaseOrder" Nullable="true"
Type="Edm.Int32"/>
                <Property Name="id__" Nullable="false" Type="Edm.Int32"/>
            </EntityType>

            <EntityContainer Name="SemanticLayer">
                <EntitySet
EntityType="SAPB1.PurchaseOrderFulfillmentCycleTimeQuery"
Name="PurchaseOrderFulfillmentCycleTimeQuery"/>
            ...
                <EntitySet
EntityType="SAPB1.BalanceSheetComparisonQueryParameter"
Name="BalanceSheetComparisonQueryParameters">
                    <NavigationPropertyBinding
Path="BalanceSheetComparisonQuery" Target="BalanceSheetComparisonQuery"/>
                </EntitySet>
            ...
        <EntitySet EntityType="SAPB1.KPICashFlowStatementQueryParameter"
Name="KPICashFlowStatementQueryParameters">
                    <NavigationPropertyBinding Path="KPICashFlowStatementQuery"
Target="KPICashFlowStatementQuery"/>
                </EntitySet>
            </EntityContainer>
        </Schema>
    </edmx:DataServices>
</edmx:Edmx>
```

> **Note**
>
> Please refer to **OData-CSDL** (Common Schema Definition Language) for more information on the metadata format.
>
> `Version="4.0"` in the metadata indicates the service exposes resources with OData 4.

All Semantic Layer views are exposed as entities, as OData only allows to perform queries on entities. Due to the OData specification, each entity must at least have a primary key. However, this is contradictory to the fact that views do not have keys from the database perspective. To address this issue in a generic way, a virtual property **id__** is defined as the entity key for the typical views, as seen from the following example.

```xml
<!-->For the view sap.sbodemous.ar.doc/SalesOrderDetailQuery<-->
     <EntityType Name="SalesOrderDetailQuery">
             <Key>
                    <PropertyRef Name="id__"/>
                </Key
                <Property Name="DocumentNumber" Nullable="true"
Type="Edm.Int32"/>
                <Property Name="Owner" Nullable="true" Type="Edm.String"/>
                <Property Name="ShippingType" Nullable="true" Type="Edm.String"/>
        ......
                <Property Name="DueQuarter" Nullable="true" Type="Edm.String"/>
                <Property Name="DueMonth" Nullable="true" Type="Edm.String"/>
                <Property Name="GrossProfitLC" Nullable="true"
Type="Edm.Double"/>
                <Property Name="LineTotalAmountLC" Nullable="true"
Type="Edm.Double"/>
        <Property Name="id__" Nullable="false" Type="Edm.Int32"/>
            </EntityType>
        <EntitySet EntityType="SalesOrderDetailQuery"
Name="SalesOrderDetailQuery"/>
```

The entity type and entity set of view *SalesOrderDetailQuery* are both in the name of *SalesOrderDetailQuery*. No other metadata are needed for this view. However, not all views are as simple as that. Some views have placeholders, for example, *sap.sbodemous.fin.fi/BalanceSheetQuery*, such as below:

```sql
SELECT * FROM "_SYS_BIC"."sap.sbodemous.fin.fi/BalanceSheetQuery"('PLACEHOLDER'=('$
$P_AddVoucher$$','N'),'PLACEHOLDER'=('$$P_FinancialPeriod$$','2017'))"
```

To expose this sort of view, only one entity type and one entity set are not enough to express it. The corresponding placeholders must be exposed in an appropriate way as well. Another characteristic of this view is that it cannot be executed directly in the SAP HANA studio. Only with the placeholder parameters can this view be accessed.
To cope with this situation, it is sensible to separate this view into two entity types, expose them respectively and then associate them with `navigation`.

```xml
<EntityType Name="BalanceSheetQuery">
        <Key>
            <PropertyRef Name="id__"/>
        </Key>
        <Property MaxLength="15" Name="AccountCode" Nullable="true"
Type="Edm.String"/>
        <Property MaxLength="20" Name="FinancialPeriodCode" Nullable="true"
Type="Edm.String"/>
        <Property Name="FiscalYear" Nullable="true" Type="Edm.Int16"/>
        <Property MaxLength="100" Name="AccountName" Nullable="true"
Type="Edm.String"/>
        <Property MaxLength="200" Name="SegmentationAccountCode" Nullable="true"
Type="Edm.String"/>
        <Property Name="FiscalYearOpeningBalanceLC" Nullable="true"
Type="Edm.Double"/>
        <Property Name="FiscalYearOpeningBalanceSC" Nullable="true"
Type="Edm.Double"/>
        <Property Name="FinancialPeriodClosingBalanceLC" Nullable="true"
Type="Edm.Double"/>
        <Property Name="FinancialPeriodClosingBalanceSC" Nullable="true"
Type="Edm.Double"/>
        <Property Name="id__" Nullable="false" Type="Edm.Int32"/>
    </EntityType>
    <EntitySet EntityType="BalanceSheetQuery" Name="BalanceSheetQuery"/>
    <EntityType Name="BalanceSheetQueryParameter">
        <Key>
            <PropertyRef Name="P_FinancialPeriod"/>
            <PropertyRef Name="P_AddVoucher"/>
        </Key>
        <Property MaxLength="20" Name="P_FinancialPeriod" Nullable="false"
Type="Edm.String"/>
        <Property DefaultValue="N" MaxLength="1" Name="P_AddVoucher"
Nullable="false" Type="Edm.String"/>
        <NavigationProperty
Name="BalanceSheetQuery" Partner="BalanceSheetQueryParameters"
Type="Collection(SAPB1.BalanceSheetQuery)"/>
    </EntityType>
    <EntitySet EntityType="SAPB1.BalanceSheetQueryParameter"
Name="BalanceSheetQueryParameters">
        <NavigationPropertyBinding Path="BalanceSheetQuery"
Target="BalanceSheetQuery"/>
    </EntitySet>
```

In this way, *BalanceSheetQuery* can be navigated from *BalanceSheetQueryParameters* with placeholders in the following way.

```http
GET /b1s/v1/sml.svc/
BalanceSheetQueryParameters(P_FinancialPeriod='2017',P_AddVoucher='N')/
BalanceSheetQuery
```

> **Note**
>
> `NavigationPropertyBinding`, `Path` and `Target` are three attributes introduced in OData version 4 to describe the navigation properties of an entity set.
>
> Directly accessing *BalanceSheetQuery* and *BalanceSheetQueryParameters* without keys would result in error.
