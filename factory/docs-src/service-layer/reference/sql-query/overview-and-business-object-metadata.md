---
title: SQL Query overview and SQLQuery business object metadata
source: pdf pp. 140-141, sec 4, 4.1
summary: What the Service Layer SQL Query feature is for, and the metadata of the SQLQuery entity and its bound List function.
---

# SQL Query overview and SQLQuery business object metadata

As of SAP Business One 10.0 FP 2011, the Service Layer on Microsoft SQL Server and SAP HANA supports a highly flexible SQL Query.

Via the Service Layer, database views are allowed to be consumed to retrieve unexposed data, which is a good complement to the OData Query. However, it is impossible to deploy these views automatically, so various manual steps are needed to require full access to the SAP HANA-box.

To reduce the manual effort to deploy views, a solution is provided to further enhance service layer's query capability, with the aim to:

- Provide a more dynamic way to do a query in a secure and controllable manner.
- Provide a more lightweight way to do a query than the Semantic/SQL view deployment.
- Provide a more straightforward way to do a query using a limited subset of SQL, without the need to learn a new query language similar to LINQ, HQL or DBQI/DBD.

## Business Object Metadata

The entity `SQLQuery` is exposed in the Service Layer, with the following metadata:

```xml
<EntityType Name="SQLQuery">
    <Key>
        <PropertyRef Name="SqlCode"/>
    </Key>
    <Property Name="SqlCode" Nullable="false" Type="Edm.String"/>
    <Property Name="SqlName" Type="Edm.String"/>
    <Property Name="SqlText" Type="Edm.String"/>
    <Property Name="ParamList" Type="Edm.String"/>
    <Property Name="CreateDate" Type="Edm.DateTime"/>
    <Property Name="UpdateDate" Type="Edm.DateTime"/>
</EntityType>
<EntitySet EntityType="SAPB1.SQLQuery" Name="SQLQueries"/>
```

Besides the ordinary CRUD methods, an additional bounded function `List` is exposed as below, for the purpose of performing the SQL statement execution represented by this entity.

```xml
<FunctionImport IsBindable="true" Name="List" ReturnType="SAPB1.SQLQueryResult">
    <Parameter Name="SQLQueryParams" Type="SAPB1.SQLQuery"/>
    <Parameter Name="ParamList" Type="Edm.String"/>
</FunctionImport>
<ComplexType Name="SQLQueryParams">
    <Property Name="SqlCode" Type="Edm.String"/>
</ComplexType>
<ComplexType Name="SQLQueryResult" OpenType="true">
    <Property Name="SqlText" Type="Edm.String"/>
</ComplexType>
```
