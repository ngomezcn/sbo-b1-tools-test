---
title: Metadata Document and Service Document
source: pdf pp. 17-23, sec 3.2, 3.3
summary: Retrieving the service metadata ($metadata) and the service document, including OData V4 metadata query options and annotations (scope, entityset, dependency, annotation).
---

# Metadata Document and Service Document

- [Metadata Document](#metadata-document)
- [Metadata Query with Annotation (OData V4)](#metadata-query-with-annotation-odata-v4)
- [Service Document](#service-document)

## Metadata Document

Metadata describes the capability of the service. It mainly defines types, entities (for example, SAP Business One objects) and actions (for example, SAP Business One services).

Send the following HTTP request to retrieve metadata:

```http
GET /$metadata
```

Using SAP Business One business partners and sales orders as examples, you can see the following sections in the metadata:

```xml
<!-- section 1.1 -->
<EnumType Name="BoCardTypes">
  <Member Name="cCustomer" Value="C"/>
  <Member Name="cSupplier" Value="S"/>
  <Member Name="cLid" Value="L"/>
</EnumType>
<!-- section 1.2 -->
<EntityType Name="BusinessPartner">
  <Key>
    <PropertyRef Name="CardCode"/>
  </Key>
  <Property Name="CardCode" Nullable="false" Type="Edm.String"/>
  <Property Name="CardName" Type="Edm.String"/>
  <Property Name="CardType" Type="SAPB1.BoCardTypes"/>
  ...
</EntityType>
<!-- section 1.3 -->
<ComplexType Name="DocumentParams">
  <Property Name="DocEntry" Nullable="false" Type="Edm.Int32"/>
</ComplexType>
<!-- section 1.4 -->
<EntityType Name="Document">
  <Key>
    <PropertyRef Name="DocEntry"/>
  </Key>
  <Property Name="DocEntry" Nullable="false" Type="Edm.Int32"/>
  <Property Name="DocNum" Type="Edm.Int32"/>
  <Property Name="DocType" Type="SAPB1.BoDocumentTypes"/>
  ...
  <Property Name="DocumentLines" Type="Collection(SAPB1.DocumentLine)"/>
  ...
</EntityType>
<!-- section 1.5 -->
<ComplexType Name="DocumentLine">
  <Property Name="LineNum" Nullable="false" Type="Edm.Int32"/>
  <Property Name="ItemCode" Type="Edm.String"/>
  <Property Name="ItemDescription" Type="Edm.String"/>
  <Property Name="Quantity" Type="Edm.Double"/>
  ...
</ComplexType>
<!-- section 2 -->
<Action IsBindable="true" Name="Close">
  <Parameter Name="Document" Type="SAPB1.Document"/>
</Action>
<!-- section 3 -->
<EntityContainer Name="ServiceLayer">
  <EntitySet EntityType="SAPB1.BusinessPartner" Name="BusinessPartners"/>
  <EntitySet EntityType="SAPB1.Document" Name="Orders"/>
  ...
</EntityContainer>
```

The above metadata sections indicate how the entities and actions are exposed:

- In Section 3, you can see that entities `BusinessPartners` and `Orders` are exposed. You can perform standard create/retrieve/update/delete (CRUD) operations on them.
- In Section 2, you can see that a bindable action named `Close` is defined and can be bound to type `SAPB1.Document`. As orders are of this entity type, therefore, orders have a `Close` action (`POST /Orders(id)/Close`).

> **Note**
>
> Metadata for UDFs/UDTs/UDOs:
>
> In SAP Business One 9.1 patch level 05 and later, information from the user-defined fields (UDFs), user-defined tables (UDTs) and user-defined objects (UDOs) is added to the metadata. As different SAP Business One company databases have different UDFs/UDTs/UDOs, the metadata of the service may vary if you connect to a different company database.
>
> For UDTs, only the "no object" type is added to the metadata. UDTs are treated as simple entities that have only one main table. Thus, third-party tools, such as MS WCF, can generate code for UDFs/UDTs/UDOs from the metadata.

## Metadata Query with Annotation (OData V4)

> **Note**
>
> This capability is mainly provided for the . The response content for metadata requests with query parameters may change in future revisions.
>
> Do not create Service Layer extensions based on this feature, as this may affect compatibility.

Starting from SAP Business One 10.0 FP 2608, metadata output in OData V4 is enhanced for lookup and mapping scenarios. This enhancement is achieved through explicit OData V4 annotations and new query options for selective metadata retrieval.

### Purpose

Metadata query with annotations gives partners a practical way to retrieve only the information they need for their current integration task. At the same time, they get business-friendly and technically precise mapping details that align with OData V4 annotation semantics.

In customer environments, full metadata can become very large because of the many business objects, UDTs, UDOs, and extensions. In SAP Business One 10.0 FP 2608, the query options address this challenge by enabling targeted metadata retrieval and providing richer annotation-driven context.

### Annotation Terms and Vocabulary References

To enrich metadata with business-friendly labels and technical mapping information, as of SAP Business One 10.0 FP 2608, the following annotation terms and vocabularies are available:

```text
Common.Label
```

A string annotation that provides a human-readable label for an entity set, property, or other model element. This is part of the Common vocabulary and is widely supported by OData clients for display purposes. The schema that defines this annotation term is imported in the metadata document as follows:

```xml
<edmx:Reference Uri="https://sap.github.io/odata-vocabularies/vocabularies/
Common.xml">
    <edmx:Include Namespace="Common" Alias="Common"/>
</edmx:Reference>
```

```text
SAPB1.TableName
```

A string annotation specific to SAP Business One that indicates the internal database table name associated with an entity set. This annotation helps you understand the underlying data structure and can be used for technical mapping and diagnostics. It is defined in the SAPB1 namespace as follows:

```xml
<Schema Namespace="SAPB1" xmlns="http://docs.oasis-open.org/odata/ns/edm">
    <Term AppliesTo="EntitySet" Name="TableName" Type="Edm.String">
        <Annotation String="Database table name" Term="Core.Description"/>
    </Term>
</Schema>
```

```text
SAPB1.ColumnName
```

A string annotation specific to SAP Business One that indicates the internal database column name associated with a property. This annotation provides technical mapping information for clients that need to correlate OData properties with database fields. It is defined in the SAPB1 namespace as follows:

```xml
<Schema Namespace="SAPB1" xmlns="http://docs.oasis-open.org/odata/ns/edm">
    <Term AppliesTo="Property" Name="ColumnName" Type="Edm.String">
        <Annotation String="Database column name" Term="Core.Description"/>
    </Term>
</Schema>
```

```text
SAPB1.ValidValue
```

A string annotation specific to SAP Business One that indicates the internal storage value for an enum member. This annotation is useful for clients that need to map semantic enum names to their persisted values in the database. It is defined in the SAPB1 namespace as follows:

```xml
<Schema Namespace="SAPB1" xmlns="http://docs.oasis-open.org/odata/ns/edm">
    <Term AppliesTo="Member" Name="ValidValue" Type="Edm.String">
        <Annotation String="Database storage value for this enum member"
Term="Core.Description"/>
    </Term>
</Schema>
```

### Query Options

To enable selective metadata output, you can use the following query options:

```text
scope=<value>
```

Scope metadata output to a specific aspect. Supported values:

- `entityset`: Scope metadata output to entity sets.
- `enum`: Scope metadata output to enum types.

```text
entityset=<EntitySetName>
```

Specify the target entity set name to retrieve metadata for. Use this together with `scope=entityset` to focus on one business object. If omitted, only the entity set list is returned.

```text
dependency=<true|false>
```

- `true`: Include dependent enum and complex types in the response when retrieving metadata for an entity set. This allows clients to get a complete model with all necessary type information in one call, which is especially useful for code generation and metadata caching scenarios.
- `false` (default): Do not include dependent enum and complex types. This results in a smaller metadata response focused on the specified entity set, but clients may need to make additional calls to retrieve related types if they are not already cached.

```text
annotation=<value>
```

Specify which annotations to include in the metadata response. Supported values:

- `label`: Include business-friendly labels for entity sets and properties using the `Common.Label` annotation.
- `labelWithTable`: Include both business-friendly labels and internal table name mappings for entity sets using the `Common.Label` and `SAPB1.TableName` annotations.
- `labelWithField`: Include business-friendly labels and internal column name mappings for properties using the `Common.Label` and `SAPB1.ColumnName` annotations. If you specify multiple annotation values, separate them with commas (for example, `annotation=labelWithField,labelWithTable`).

> **Note**
>
> These query options are designed to be used in combination to allow clients to retrieve the specific metadata they need for their integration scenarios while optimizing performance and payload size.
>
> These query options are not from the OData V4 standard but are custom extensions implemented by SAP Business One Service Layer to enhance metadata retrieval capabilities for partners. Clients should be aware that these options are specific to SAP Business One and may not be supported by other OData services.
>
> Properties that reference complex or collection types are not annotated. Only scalar and enum properties carry `Common.Label` and `SAPB1.ColumnName`.

### Examples

**Example 1: Retrieve entity set labels**

```http
GET /b1s/v2/$metadata?scope=entityset&annotation=label
```

Use this when you need business object names and display labels for UI lists, pickers, or object catalogs.

Simplified response sample:

```xml
<EntityContainer Name="ServiceLayer">
    <EntitySet Name="BusinessPartners" EntityType="SAPB1.BusinessPartner">
        <Annotation Term="Common.Label" String="Business Partners"/>
    </EntitySet>
    <EntitySet Name="Orders" EntityType="SAPB1.Document">
        <Annotation Term="Common.Label" String="Sales Order"/>
    </EntitySet>
</EntityContainer>
```

**Example 2: Retrieve entity set labels and table mapping**

```http
GET /b1s/v2/$metadata?scope=entityset&annotation=labelWithTable
```

Use this when you also need internal table names for technical mapping and diagnostics.

Simplified response sample:

```xml
<EntitySet Name="BusinessPartners" EntityType="SAPB1.BusinessPartner">
    <Annotation Term="Common.Label" String="Business Partners"/>
    <Annotation Term="SAPB1.TableName" String="OCRD"/>
</EntitySet>
```

**Example 3: Retrieve field-level metadata for one entity set**

```http
GET /b1s/v2/$metadata?
scope=entityset&annotation=labelWithField&entityset=BusinessPartners
```

Use this when you need property labels and internal column names for one business object or entity set. This approach is common for field mapping scenarios in integration tools and middleware.

Simplified response sample:

```xml
<EntityType Name="BusinessPartner">
    <Property Name="CardCode" Type="Edm.String">
        <Annotation Term="Common.Label" String="BP Code"/>
        <Annotation Term="SAPB1.ColumnName" String="CardCode"/>
    </Property>
    <Property Name="CardName" Type="Edm.String">
        <Annotation Term="Common.Label" String="BP Name"/>
        <Annotation Term="SAPB1.ColumnName" String="CardName"/>
    </Property>
</EntityType>
```

**Example 4: Retrieve complete metadata with annotations and dependencies**

```http
GET /b1s/v2/$metadata?
scope=entityset&annotation=labelWithField,labelWithTable&entityset=BusinessPartne
rs&dependency=true
```

Use this when your client needs a complete dependency-aware model in one call, including related complex types and enum types.

Simplified response sample:

```xml
<EnumType Name="BoCardTypes" UnderlyingType="Edm.Int32">
    <Member Name="cCustomer" Value="0">
        <Annotation Term="SAPB1.ValidValue" String="C"/>
    </Member>
    <Member Name="cSupplier" Value="1">
        <Annotation Term="SAPB1.ValidValue" String="S"/>
    </Member>
</EnumType>
<ComplexType Name="ContactEmployee" OpenType="true">
    <Property Name="Name" Type="Edm.String">
        <Annotation Term="Common.Label" String="Contact Person Name"/>
        <Annotation Term="SAPB1.ColumnName" String="Name"/>
    </Property>
    <Property Name="Phone1" Type="Edm.String">
        <Annotation Term="Common.Label" String="Telephone 1"/>
        <Annotation Term="SAPB1.ColumnName" String="Tel1"/>
    </Property>
</ComplexType>
<ComplexType Name="BPIntrastatExtension">
    <Property Name="CardCode" Type="Edm.String">
        <Annotation Term="Common.Label" String="BP Code"/>
        <Annotation Term="SAPB1.ColumnName" String="CardCode"/>
    </Property>
    <Property Name="TransportMode" Type="Edm.Int32">
        <Annotation Term="Common.Label" String="Intrastat Transport Mode"/>
        <Annotation Term="SAPB1.ColumnName" String="ISTransMod"/>
    </Property>
</ComplexType>
<EntityType Name="BusinessPartner" OpenType="true">
    <Key>
        <PropertyRef Name="CardCode"/>
    </Key>
    <Property Name="CardCode" Type="Edm.String" Nullable="false">
        <Annotation Term="Common.Label" String="BP Code"/>
        <Annotation Term="SAPB1.ColumnName" String="CardCode"/>
    </Property>
    <Property Name="CardType" Type="SAPB1.BoCardTypes">
        <Annotation Term="Common.Label" String="BP Type"/>
        <Annotation Term="SAPB1.ColumnName" String="CardType"/>
    </Property>
    <Property Name="ContactEmployees" Type="Collection(SAPB1.ContactEmployee)"/>
    <Property Name="BPIntrastatExtension" Type="SAPB1.BPIntrastatExtension"/>
</EntityType>
<EntityContainer Name="ServiceLayer">
    <EntitySet Name="BusinessPartners" EntityType="SAPB1.BusinessPartner">
        <Annotation Term="Common.Label" String="Business Partners"/>
        <Annotation Term="SAPB1.TableName" String="OCRD"/>
    </EntitySet>
</EntityContainer>
```

## Service Document

The service document is a list of exposed entities. Use the root service URL to retrieve the service document.

Send the HTTP request: `GET /`

The response is:

```http
HTTP/1.1 200 OK
{
    "value": [
        {
            "name": "ChartOfAccounts",
            "kind": "EntitySet",
            "url": "ChartOfAccounts"
        },
        {
            "name": "SalesStages",
            "kind": "EntitySet",
            "url": "SalesStages"
        },
        ...
    ]
}
```
