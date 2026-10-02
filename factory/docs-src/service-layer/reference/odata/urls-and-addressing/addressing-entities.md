---
title: Addressing entities and collections
source: external OData: oasis-p2@v4.01-os 4.3, 4.9; retrieved 2026-10-02
summary: How OData URLs address an entity set, a single entity by key, a singleton, a related entity or a related collection, and how members of a collection are addressed by key.
---
# Addressing entities and collections

In Service Layer: reference/consuming-service-layer/associations.md; reference/consuming-service-layer/crud-operations.md

The rules for addressing a collection of entities, a single entity within a collection, a singleton and a property of an entity are the `resourcePath` syntax rule in [OData-ABNF]. A non-normative snippet from [OData-ABNF]:

```abnf
resourcePath = entitySetName                  [collectionNavigation]
              / singleton                      [singleNavigation] 
              / actionImportCall 
              / entityColFunctionImportCall    [ collectionNavigation ]
              / entityFunctionImportCall       [ singleNavigation ]
              / complexColFunctionImportCall   [ collectionPath ]
              / complexFunctionImportCall      [ complexPath ]
              / primitiveColFunctionImportCall [ collectionPath ] 
              / primitiveFunctionImportCall    [ singlePath ] 
              / functionImportCallNoParens 
              / crossjoin
              / '$all'                  [ "/" qualifiedEntityTypeName ]
```

OData has a uniform, composable URL syntax, so there are many ways to address a collection or a single entity. The rules are recursive: a single entity can be addressed via another single entity, a collection via a single entity, and a collection via a collection.

## Addressing a collection

A collection of entities can be addressed, among other ways:

- Via an entity set (rule `entitySetName`).
- By navigating a collection-valued navigation property (rule `entityColNavigationProperty`).
- By invoking a function that returns a collection of entities (rule `entityColFunctionCall`).
- By invoking an action that returns a collection of entities (rule `actionCall`).

Example 8:

```text
http://host/service/Products
```

Example 9: function with parameters in resource path

```text
http://host/service/ProductsByCategoryId(categoryId=2)
```

Example 10: function with parameters as query options

```text
http://host/service/ProductsByColor(color=@color)?@color='red'
```

## Addressing a single entity

Sometimes a single entity is accessed directly, by:

- Invoking a function that returns a single entity (rule `entityFunctionCall`).
- Invoking an action that returns a single entity (rule `actionCall`).
- Addressing a singleton.

Example 11:

```text
http://host/service/BestProductEverCreated
```

Often, however, a single entity is accessed by composing more path segments onto a `resourcePath` that identifies a collection, for example by using an entity key to select a single entity (rules `collectionNavigation` and `keyPredicate`).

Example 12:

```text
http://host/service/Categories(1)
```

An action or a function bound to a collection of entities that returns a single entity can also be appended (rule `boundOperation`).

Example 13:

```text
http://host/service/Products/Model.MostExpensive()
```

## Composing paths from a single entity

Starting from a single entity, path segments can be composed to reach:

- Another related entity, by following a navigation (rule `entityNavigationProperty`).
- A related collection of entities, by following a navigation (rule `entityColNavigationProperty`).
- A single entity or a collection of entities returned by an action or function bound to the single entity (rule `boundOperation`).

Example 14:

```text
http://host/service/Products(1)/Supplier
```

Example 15:

```text
http://host/service/Products(1)/Model.MostRecentOrder()
```

Example 16:

```text
http://host/service/Categories(1)/Products
```

Example 17:

```text
http://host/service/Categories(1)/Model.TopTenProducts()
```

An action or function bound to a collection of entities can likewise return a collection of entities (rule `boundOperation`).

Example 18:

```text
http://host/service/Categories(1)/Products/Model.AllOrders()
```

Finally, path segments can be composed onto a resource path that identifies a primitive, a complex instance, a collection of primitives or a collection of complex instances, and an action or function that returns an entity or a collection of entities can be bound to it.

## Addressing a member within an entity collection

Collections of entities are modeled as entity sets, collection-valued navigation properties, or operation results.

For entity sets, results of operations associated with an entity set through an `EntitySet` or `EntitySetPath` declaration, or collection-valued navigation properties with a `NavigationPropertyBinding` or `ContainsTarget=true` specification, members of the collection can be addressed by convention by appending the parenthesized key to the URL specifying the collection of entities, or by using the key-as-segment convention if supported by the service.

For collection-valued navigation properties with navigation property bindings that end in a type-cast segment, a type-cast segment MUST be appended to the collection URL before appending the key segment.

> **Note**: Entity sets or collection-valued navigation properties annotated with term `Capabilities.IndexableByKey` defined in [OData-VocCap] and a value of `false` do not support addressing their members by key.
