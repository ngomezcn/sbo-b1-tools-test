---
title: Navigation properties
source: external OData: oasis-csdl@v4.01-os 8; retrieved 2026-10-02
summary: Rules and metadata shape for navigation properties in CSDL, including type, nullability, partner, containment, referential constraints, and on-delete behavior.
---
# Navigation properties

In Service Layer: reference/consuming-service-layer/associations.md

- [Core rules and metadata element](#core-rules-and-metadata-element)
- [Type and cardinality](#type-and-cardinality)
- [Nullable](#nullable)
- [Partner](#partner)
- [Containment](#containment)
- [Referential constraints](#referential-constraints)
- [On-delete action](#on-delete-action)

## Core rules and metadata element

A navigation property enables navigation to related entities. It MUST define a unique name and a type.

The navigation property name:

- MUST be a simple identifier.
- MUST be unique within the declaring structured type across structural and navigation properties.
- MUST NOT match any structural property name in base types.
- For OData 4.0 responses, MUST NOT match any structural or navigation property name from base types.
- If a base type defines a navigation property with the same name, the derived type's navigation property type MUST be derived from the base property type.

Names are case-sensitive, but service authors SHOULD NOT choose names that differ only by case.

Element `edm:NavigationProperty`:

- MUST contain `Name` and `Type`.
- MAY contain `Nullable`, `Partner`, and `ContainsTarget`.
- MAY contain `edm:ReferentialConstraint`.
- MAY contain at most one `edm:OnDelete`.
- MAY contain `edm:Annotation`.

Attribute `Name` is the navigation property name.

Example 22: navigation properties between `Product` and `Category`

```xml
<EntityType Name="Product">
   … 
   <NavigationProperty Name="Category" Type="self.Category" Nullable="false"
                      Partner="Products" />
   <NavigationProperty Name="Supplier" Type="self.Supplier" />
 </EntityType>

<EntityType Name="Category">
   …
   <NavigationProperty Name="Products" Type="Collection(self.Product)"
                      Partner="Category" />
 </EntityType>
```

## Type and cardinality

The navigation property type MUST be:

- an entity type in scope,
- the abstract type `Edm.EntityType`, or
- a collection of one of these.

If type is a collection, any number of related entities can exist; otherwise there is at most one related entity.

Related entities MUST be of the declared type or one of its subtypes.

For collection-valued containment navigation properties, the declared entity type MUST define a key.

A collection-valued navigation property MAY be annotated with:

- `Core.Ordered` to state stable ordering support.
- `Core.PositionalInsert` to state insertion at a specific ordinal position.

Attribute `Type`:

- Single-valued: qualified name of the target type.
- Collection-valued: `Collection(` + qualified item type name + `)`.

## Nullable

`Nullable` indicates whether the declaring type MAY have no related entity. If `false`, instances MUST always have a related entity.

`Nullable` MUST NOT be specified for collection-valued navigation properties (a collection may have zero items).

Attribute `Nullable` accepts `true` or `false`; if absent, it defaults to `true`.

## Partner

Entity-type navigation properties MAY specify a partner; complex-type navigation properties MUST NOT specify one.

If present, `Partner` is a path relative to the navigation property type and:

- MUST resolve to a navigation property on that type or a derived type.
- MAY traverse complex types (including derived complex types).
- MUST NOT traverse navigation properties.
- Partner navigation property type MUST be the declaring entity type of the current property or one of its parent entity types.

Partner consistency:

- If partner is single-valued, it MUST lead back to the source entity from all related entities.
- If partner is collection-valued, the source entity MUST be part of that collection.
- If no partner is specified, no assumption can be made that any target-side navigation property leads back.
- If a partner is specified, that partner MUST either reference back this current navigation property, or MUST NOT declare a partner.

Attribute `Partner` is the path to the partner navigation property.

## Containment

A navigation property MAY declare containment (`ContainsTarget=true`). Then instances of the declaring structured type contain target entities.

Containment defines an implicit entity set per containing instance, identified by the navigation property's read URL on that instance.

Canonical URL for a contained entity is: canonical URL of containing instance + navigation segment + contained entity key (see [OData-URL]).

Containment rules:

- Entity types used in collection-valued containment navigation properties MUST define a key.
- In OData 4.0 responses, complex types declaring a containment navigation property MUST NOT be used as the type of a collection-valued property.
- An entity cannot be referenced by more than one containment relationship.
- An entity cannot both belong to an entity set declared in the entity container and be referenced by containment.
- Containment navigation properties MUST NOT be the last segment in a navigation property binding path.

For ordered collections of complex types (`Core.Ordered`), the canonical URL of an item appends its zero-based ordinal. Items in unordered collections of complex types do not have a canonical URL; services supporting such collections and declaring containment MUST provide navigation-link URLs in payloads according to format-specific rules.

Containment partner constraints:

- Containment navigation properties MAY specify a partner navigation property.
- If containment is recursive (same inheritance hierarchy), the relationship is a tree: partner MUST be `Nullable` and single-valued.
- If containment is not recursive, partner MUST NOT be nullable.
- An entity type inheritance chain MUST NOT contain more than one navigation property whose partner is a containment navigation property.

> **Note**
> Without a partner navigation property, clients cannot reliably determine which entity contains a given contained entity.

Attribute `ContainsTarget` accepts `true` or `false`; if absent, it defaults to `false`.

## Referential constraints

A single-valued navigation property MAY define one or more referential constraints.

A referential constraint states that the dependent property (on the declaring structured type) MUST equal the principal property (on the target entity type).

Constraint rules:

- Dependent and principal types MUST match, or both MUST be complex types.
- If the principal property references an entity, dependent property must reference that same entity.
- If the principal property's value is a complex instance, dependent property must be a complex instance with the same property values.
- If navigation property is nullable, or principal property is nullable, dependent property MUST also be nullable.
- If both navigation property and principal property are non-nullable, dependent property MUST NOT be nullable.

Element `edm:ReferentialConstraint`:

- MUST contain `Property` and `ReferencedProperty`.
- MAY contain `edm:Annotation`.

Attribute `Property`:

- Path to dependent structured type property (or recursively nested complex property).
- Segments are joined by `/`.
- Path is relative to the dependent structured type declaring the navigation property.

Attribute `ReferencedProperty`:

- Path to principal entity type property (or recursively nested complex property).
- Referenced property type MUST match the dependent property type.
- Path is relative to the target entity type.

Example 23: referential constraints from `Product` to `Category`

```xml
<EntityType Name="Product">
   … 
   <Property Name="CategoryID" Type="Edm.String" Nullable="false"/>
  <Property Name="CategoryKind" Type="Edm.String" Nullable="true" />
  <NavigationProperty Name="Category" Type="self.Category" Nullable="false">
     <ReferentialConstraint Property="CategoryID" ReferencedProperty="ID" />
     <ReferentialConstraint Property="CategoryKind" ReferencedProperty="Kind">
      <Annotation Term="Core.Description"
                  String="Referential Constraint to non-key property" />
    </ReferentialConstraint>
  </NavigationProperty>
</EntityType>

<EntityType Name="Category">
  <Key>
    <PropertyRef Name="ID" />
  </Key>
   <Property Name="ID" Type="Edm.String" Nullable="false" />
   <Property Name="Kind" Type="Edm.String" Nullable="true" />
   …
</EntityType>
```

## On-delete action

A navigation property MAY define an on-delete action describing what the service does with related entities when the source entity is deleted.

Allowed action values:

- `Cascade`: delete related entities when source is deleted.
- `None`: `DELETE` on source with related entities fails.
- `SetNull`: properties tied through referential constraints (and not participating in other referential constraints) are set to null.
- `SetDefault`: those properties are set to their default value.

If no on-delete action is defined, behavior is not predictable for clients and may vary by entity.

Element `edm:OnDelete`:

- MUST contain `Action`.
- MAY contain `edm:Annotation`.

Attribute `Action` MUST be one of: `Cascade`, `None`, `SetNull`, `SetDefault`.

Example 24: deleting a category cascades to related products

```xml
<EntityType Name="Category">
   … 
   <NavigationProperty Name="Products" Type="Collection(self.Product)">
     <OnDelete Action="Cascade">
      <Annotation Term="Core.Description" 
                   String="Delete all products in this category" />
    </OnDelete
   </NavigationProperty>
</EntityType>
```
