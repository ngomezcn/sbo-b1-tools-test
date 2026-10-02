---
title: Entity container, entity sets and singletons
source: external OData: oasis-csdl@v4.01-os 13.2, 13.3, 13.4; retrieved 2026-10-02
summary: How entity sets, singletons and navigation property bindings are declared in the entity container of a metadata document, and what each attribute means.
---
# Entity container, entity sets and singletons

In Service Layer: reference/consuming-service-layer/metadata-document.md

## Entity set

Entity sets are top-level collection-valued resources.

- An entity set is identified by its name, a simple identifier that MUST be unique within its entity container.
- An entity set MUST specify a type that MUST be an entity type in scope.
- An entity set MUST contain only instances of its specified entity type or its subtypes. The entity type MAY be abstract but MUST have a key defined.
- An entity set MAY indicate whether it is included in the service document. If not explicitly indicated, it is included.
- Entity sets that cannot be queried without specifying additional query options SHOULD NOT be included in the service document.

Element `edm:EntitySet`:

- MUST contain the attributes `Name` and `EntityType`, and MAY contain the `IncludeInServiceDocument` attribute.
- MAY contain `edm:NavigationPropertyBinding` elements.
- MAY contain `edm:Annotation` elements.

| Attribute | Value |
|---|---|
| `Name` | The entity set's name. |
| `EntityType` | The qualified name of an entity type in scope. |
| `IncludeInServiceDocument` | One of the Boolean literals `true` or `false`. Absence of the attribute means `true`. |

## Singleton

Singletons are top-level single-valued resources.

- A singleton is identified by its name, a simple identifier that MUST be unique within its entity container.
- A singleton MUST specify a type that MUST be an entity type in scope.
- A singleton MUST reference an instance of its entity type.

Element `edm:Singleton`:

- MUST include the attributes `Name` and `Type`, and MAY contain the `Nullable` attribute.
- MAY contain `edm:NavigationPropertyBinding` elements.
- MAY contain `edm:Annotation` elements.

| Attribute | Value |
|---|---|
| `Name` | The singleton's name. |
| `Type` | The qualified name of an entity type in scope. |
| `Nullable` | One of the Boolean literals `true` or `false`. If no value is specified, it defaults to `false`. In OData 4.0 responses this attribute MUST NOT be specified. |

## Navigation property binding

If the entity type of an entity set or singleton declares navigation properties, a navigation property binding describes which entity set or singleton will contain the related entities.

An entity set or a singleton SHOULD contain a navigation property binding for each navigation property of its entity type, including navigation properties defined on complex typed properties.

If omitted, clients MUST assume that the target entity set or singleton can vary per related entity.

Element `edm:NavigationPropertyBinding` MUST contain the attributes `Path` and `Target`.

| Attribute | Value |
|---|---|
| `Path` | A path expression. |
| `Target` | A target path. |

### Path

A navigation property binding MUST specify a path to a navigation property of the entity set's or singleton's declared entity type, or a navigation property reached through a chain of type casts, complex properties, or containment navigation properties.

- If the navigation property is defined on a subtype, the path MUST contain the qualified name of the subtype, followed by a forward slash, followed by the navigation property name.
- If the navigation property is defined on a complex type used in the definition of the entity set's entity type, the path attribute MUST contain a forward-slash separated list of complex property names and qualified type names that describe the path leading to the navigation property.
- The path can traverse one or more containment navigation properties, but the last navigation property segment MUST be a non-containment navigation property and there MUST NOT be any non-containment navigation properties prior to the final navigation property segment.
- If the path traverses collection-valued complex properties or collection-valued containment navigation properties, the binding applies to all items of these collections.
- If the path contains a recursive sub-path (a path leading back to the same structured type), the binding applies recursively to any positive number of cycles through that sub-path.
- OData 4.01 services MAY have a type-cast segment as the last path segment, allowing to bind instances of different sub-types to different targets.
- The same navigation property path MUST NOT be specified in more than one navigation property binding; navigation property bindings are only used when all related entities are known to come from a single entity set. Paths that differ only in a type-cast segment are allowed, binding instances of different sub-types to different targets. If paths differ only in type-cast segments, the most specific path applies.

### Target

A navigation property binding MUST specify a target via a simple identifier or target path. It specifies the entity set, singleton, or containment navigation property that contains the entities.

- If the target is a simple identifier, it MUST resolve to an entity set or singleton defined in the same entity container as the enclosing element.
- If the target is a target path, it MUST resolve to an entity set, singleton, or direct or indirect containment navigation property of a singleton in scope. The path can traverse single-valued containment navigation properties or single-valued complex properties before ending in a containment navigation property, and there MUST NOT be any non-containment navigation properties prior to the final segment.

Example 35: for an entity set in the same container as the enclosing entity set `Categories`

```xml
<EntitySet Name="Categories" EntityType="self.Category">
   <NavigationPropertyBinding Path="Products"
                             Target="SomeSet" />
</EntitySet>
```

Example 36: for an entity set in any container in scope

```xml
<EntitySet Name="Categories" EntityType="self.Category">
   <NavigationPropertyBinding Path="Products"
                             Target="SomeModel.SomeContainer/SomeSet" />
</EntitySet>
```

Example 37: binding `Supplier` on `Products` contained within `Categories`, binding applies to all suppliers of all products of all categories

```xml
<EntitySet Name="Categories" EntityType="self.Category">
   <NavigationPropertyBinding Path="Products/Supplier"
                             Target="Suppliers" />
</EntitySet>
```
