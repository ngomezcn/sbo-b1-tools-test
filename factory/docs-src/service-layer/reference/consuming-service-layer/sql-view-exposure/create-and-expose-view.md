---
title: Create, Expose and Locate a SQL View
source: pdf pp. 67-69, sec 3.8.1, 3.8.2, 3.8.3
summary: Creating a SQL view that Service Layer recognizes, exposing or unexposing it through the SQLViews entity, and the view.svc endpoint and metadata.
---

# Create, Expose and Locate a SQL View

## Create View

Open the SQL Server Management Studio, create a view (e.g. `B1_ItemPriceB1SLQuery`) in the company database (e.g. `SBODEMOUS`) in the following way:

```sql
USE [SBODEMOUS]
GO
/****** Object: View [dbo].[B1_ItemPriceB1SLQuery] Script Date:
12/13/2019 13:16:56 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[B1_ItemPriceB1SLQuery] AS
SELECT T0.[ItemCode], T0.[PriceList], T0.[UomEntry], T0.[Price], T0.[Currency],
T0.[PriceType]
FROM [dbo].[ITM1] T0
UNION ALL
SELECT T0.[ItemCode], T0.[PriceList], T0.[UomEntry], T0.[Price], T0.[Currency],
T0.[PriceType]
FROM [dbo].[ITM9] T0
GO
```

> **Note**
>
> To guarantee the view is recognized by Service Layer, it must fulfill the following requirements:
>
> - Make sure the view is under schema **dbo**.
> - Make sure the view name ends with **B1SLQuery**.

## Expose View

By default, customized views are not exposed in Service Layer. To expose customized views, Service Layer brings a new entity **SQLViews** to help accomplish this.

For example, post the below request without any payload to expose **B1_ItemPriceB1SLQuery**:

```http
POST /b1s/v1/SQLViews('B1_ItemPriceB1SLQuery')/Expose
```

On success, the service returns no content with response code 204.

To cancel the exposure, try the **Unexpose** command of **SQLViews**:

```http
POST /b1s/v1/SQLViews('B1_ItemPriceB1SLQuery')/Unexpose
```

In a practical environment, exposing views one by one might be time consuming. To manipulate all views at once, use the asterisk * to represent all:

```http
POST /b1s/v1/SQLViews('*')/Expose

POST /b1s/v1/SQLViews('*')/Unexpose
```

Since it is exposed as an entity, you are allowed to query the view's basic properties in the following way:

```http
GET /b1s/v1/SQLViews('B1_ItemPriceB1SLQuery')
```

On success, the response is like:

```http
HTTP/1.1 200 OK
{
"odata.metadata" :
"https://server:50000/b1s/v1/$metadata#SQLViews/@Element",
"Name" : "B1_ItemPriceB1SLQuery",
"DBType" : "MSSQL",
"SchemaName" : "dbo",
"CreateDate" : "2020-02-14"
}
```

And here is the relevant metadata:

```xml
<EntityType Name="SQLView">
<Key>
<PropertyRef Name="Name"/>
</Key>
<Property Name="Name" Nullable="false" Type="Edm.String"/>
<Property Name="DBType" Type="Edm.String"/>
<Property Name="SchemaName" Type="Edm.String"/>
<Property Name="CreateDate" Type="Edm.DateTime"/>
</EntityType>
<EntitySet EntityType="SAPB1.SQLView" Name="SQLViews"/>
<FunctionImport IsBindable="true" Name="Expose" m:HttpMethod="POST">
<Parameter Name="SQLViewParams" Type="SAPB1.SQLView"/>
</FunctionImport>
<FunctionImport IsBindable="true" Name="Unexpose" m:HttpMethod="POST">
<Parameter Name="SQLViewParams" Type="SAPB1.SQLView"/>
</FunctionImport>
```

## View Service Endpoint

As in the Semantic Layer service, a unique endpoint is used for the view service, as below:

```http
GET /b1s/v1/view.svc
```

To retrieve the metadata, append the `$metadata` to the endpoint:

```http
GET /b1s/v1/view.svc/$metadata
```

On success, the service returns:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/
edmx">
<edmx:DataServices m:DataServiceVersion="3.0"
m:MaxDataServiceVersion="3.0"
xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">
<Schema Namespace="SAPB1" xmlns="http://schemas.microsoft.com/ado/2009/11/edm">
<EntityType Name="B1_ItemPriceB1SLQuery">
<Key>
<PropertyRef Name="id__"/>
</Key>
<Property MaxLength="100" Name="ItemCode" Nullable="false" Type="Edm.String"/>
<Property Name="PriceList" Nullable="false" Type="Edm.Int16"/>
<Property Name="UomEntry" Nullable="true" Type="Edm.Int32"/>
<Property Name="Price" Nullable="true" Precision="19" Scale="6"
Type="Edm.Decimal"/>
<Property MaxLength="6" Name="Currency" Nullable="true" Type="Edm.String"/>
<Property MaxLength="1" Name="PriceType" Nullable="true" Type="Edm.String"/>
<Property Name="id__" Nullable="false" Type="Edm.Int32"/>
</EntityType>
<EntityContainer Name="B1SView">
<EntitySet EntityType="SAPB1.B1_ItemPriceB1SLQuery"
Name="B1_ItemPriceB1SLQuery"/>
</EntityContainer>
</Schema>
</edmx:DataServices>
</edmx:Edmx>
```

The view service supports OData V4 as well. Here are the V4 URLs for the the endpoint and metadata, respectively.

```http
GET /b1s/v2/view.svc

GET /b1s/v2/view.svc/$metadata
```

> **Note**
>
> - Please refer to **OData-CSDL** (Common Schema Definition Language) for more information on the metadata format.
> - All views are exposed as entities, as OData only allows to perform queries on entities. Due to the OData specification, each entity must at least have a primary key. However, this is contradictory to the fact that views do not have keys from the database perspective. To address this issue in a generic way, a virtual property **id__** is defined as the entity key for the typical views, as seen from the last property of entity type in the metadata.
