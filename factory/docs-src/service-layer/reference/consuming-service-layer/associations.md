---
title: Associations and Navigation Properties
source: pdf pp. 81-84, sec 3.11
summary: How associations and navigation properties are defined in the metadata, and how to navigate them as entities or retrieve them with $expand.
---

# Associations and Navigation Properties

- [Metadata Definitions of Associations and Navigation Properties](#metadata-definitions-of-associations-and-navigation-properties)
- [Retrieving Navigation Properties as Entity](#retrieving-navigation-properties-as-entity)
- [Retrieving Navigation Properties via $expand](#retrieving-navigation-properties-via-expand)

> **Note**
>
> This feature is available in SAP Business One 9.1 patch level 05 and later.

Two entities may be associated (independently related) in one way or another. The association is optionally represented in the navigation property of each association end (one of the two associated entities).

For example, if an association and corresponding navigation properties have been defined for order and customer entities in the metadata, you can send the following HTTP request to get the customer associated with a particular order:

```http
GET Orders(1)/BusinessPartner
```

If you already knew that the CardCode property of the order is "c1", the above request is equal to `GET BusinessPartners('c1')`.

You can continue to operate on this entity as on `GET BusinessPartners('c1')`. For example, to get the foreign name of the customer, the following two requests are also equal:

- `GET Orders(1)/BusinessPartner/ForeignName`
- `GET BusinessPartners('c1')/ForeignName`

## Metadata Definitions of Associations and Navigation Properties

Associations and navigation properties are defined in the service metadata. Take orders and business partners, for example:

> **Sample Code**
>
> ```xml
> <!-- section 1 -->
> <Association Name="FK_Documents_BusinessPartners">
>   <End Type="SAPB1.BusinessPartner" Role="BusinessPartners"
> Multiplicity="0..1" />
>   <End Type="SAPB1.Document" Role="Documents" Multiplicity="*" />
>   <ReferentialConstraint>
>     <Principal Role="BusinessPartners">
>       <PropertyRef Name="CardCode" />
>     </Principal>
>     <Dependent Role="Documents">
>       <PropertyRef Name="CardCode" />
>     </Dependent>
>   </ReferentialConstraint>
> </Association>
> <!-- section 2 -->
> <EntityType Name="BusinessPartner">
>   <Key>
>     <PropertyRef Name="CardCode"/>
>   </Key>
>   <Property Name="CardCode" Nullable="false" Type="Edm.String"/>
>   <Property Name="CardName" Type="Edm.String"/>
>   <Property Name="CardType" Type="SAPB1.BoCardTypes"/>
>   ...
>   <NavigationProperty Name="Orders"
> Relationship="SAPB1.FK_Documents_BusinessPartners"
> FromRole="BusinessPartners" ToRole="Orders" />
>   <NavigationProperty Name="Invoices"
> Relationship="SAPB1.FK_Documents_BusinessPartners"
> FromRole="BusinessPartners" ToRole="Invoices" />
>   ...
> </EntityType>
> <!-- section 3 -->
> <EntityType Name="Document">
>   <Key>
>     <PropertyRef Name="DocEntry"/>
>   </Key>
>   <Property Name="DocEntry" Nullable="false" Type="Edm.Int32"/>
>   <Property Name="DocNum" Type="Edm.Int32"/>
>   <Property Name="DocType" Type="SAPB1.BoDocumentTypes"/>
>   ...
>   <NavigationProperty Name="BusinessPartner"
> Relationship="SAPB1.FK_Documents_BusinessPartners" FromRole="Documents"
> ToRole="BusinessPartners" />
> </EntityType>
> <!-- section 4 -->
> <AssociationSet Association="SAPB1.FK_Documents_BusinessPartners"
> Name="FK_Orders_BusinessPartners">
>   <End EntitySet="Orders" Role="Documents"/>
>   <End EntitySet="BusinessPartners" Role="BusinessPartners"/>
> </AssociationSet>
> <AssociationSet Association="SAPB1.FK_Documents_BusinessPartners"
> Name="FK_Invoices_BusinessPartners">
>   <End EntitySet="Invoices" Role="Documents"/>
>   <End EntitySet="BusinessPartners" Role="BusinessPartners"/>
> </AssociationSet>
> ```

The metadata defines the association between `BusinessPartners` and `Orders` as follows:

- Section 1 defines a "1:*" (1:n) association between `BusinessPartners` and `Documents`, joined on the condition `BusinessPartners.CardCode = Documents.CardCode`.
- Section 2 defines two navigation properties `Orders` and `Invoices` on entity type `BusinessPartner`.
- Section 3 defines a navigation property `BusinessPartner` on entity type `Document`.
- Section 4 defines two association sets with the same association `FK_Documents_BusinessPartners`. The first association set is `Orders` and `BusinessPartners` and the second is `Invoices` and `BusinessPartners`.

## Retrieving Navigation Properties as Entity

As long as navigation properties are defined on association ends, you can navigate back and forth between the association ends. The navigation is not necessarily bidirectional; it can be unidirectional.

According to the metadata (section 2 in [Metadata Definitions of Associations and Navigation Properties](associations.md#metadata-definitions-of-associations-and-navigation-properties) [page 81]), a navigation property `Orders` has been defined for entity type `BusinessPartner` (the type of entity set `BusinessPartners`). To get the orders associated with business partner "c1", send the following request:

```http
GET BusinessPartners('c1')/Orders
```

This request is equal to the following request:

```http
GET Orders?$filter=CardCode eq 'c1'
```

According to the metadata (section 3 in [Metadata Definitions of Associations and Navigation Properties](associations.md#metadata-definitions-of-associations-and-navigation-properties) [page 81]), entity type `Document` has a navigation property `BusinessPartners`. To get the customer associated with the order (`DocEntry: 1`), send the following request:

```http
GET Orders(1)/BusinessPartner
```

You can extend your request chain even further in the URL. For example, to get all orders of the customer who is associated with order 1, send the following request:

```http
GET Orders(1)/BusinessPartner/Orders
```

## Retrieving Navigation Properties via $expand

With OData query option $select and $expand, the navigation properties can be retrieved just as other properties. For example, to retrieve the customer as a property of an order, send the following request:

```http
GET Orders(1)?$select=*,BusinessPartner&$expand=BusinessPartner
```

You can get the customer code property from an order and the foreign name property from the associated customer by sending the following request:

```http
GET Orders(1)?$select=CardCode,BusinessPartner/ForeignName&$expand=BusinessPartner
```

$expand can be applied to collections as well. For instance, you can send the following request to retrieve the `BusinessPartner` properties of all orders:

```http
GET Orders?$select=*,BusinessPartner&$expand=BusinessPartner
```

> **Note**
>
> The following two requests have the same effect:
>
> ```http
> GET Orders(1)?$select=CardCode,BusinessPartner/ForeignName
>
> GET Orders(1)?$select=CardCode
> ```
>
> For the former, `BusinessPartner/ForeignName` is ignored as the navigation property `BusinessPartner` is not expanded.

> **Note**
>
> $expand working with collections may have performance issues. We recommend that you not send such requests frequently.
