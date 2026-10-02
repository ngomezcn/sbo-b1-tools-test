---
title: Context URL
source: external OData: oasis-p1@v4.01-os 10, 10.1, 10.2, 10.3, 10.4, 10.11, 10.12, 10.13, 10.14, 10.15, 10.16; retrieved 2026-10-02
summary: How the context URL is built for each kind of payload (service document, entities, singletons, references, property values, operation results) so a response can be interpreted from its metadata fragment.
---
# Context URL

In Service Layer: reference/consuming-service-layer/metadata-document.md

- [Service Document](#service-document)
- [Collection of Entities](#collection-of-entities)
- [Entity](#entity)
- [Singleton](#singleton)
- [Collection of Entity References](#collection-of-entity-references)
- [Entity Reference](#entity-reference)
- [Property Value](#property-value)
- [Collection of Complex or Primitive Types](#collection-of-complex-or-primitive-types)
- [Complex or Primitive Type](#complex-or-primitive-type)
- [Operation Result](#operation-result)

The *context URL* describes the content of the payload. It consists of the canonical metadata document URL and a fragment identifying the relevant portion of the metadata document. The context URL makes response payloads "self-contained", allowing a recipient to retrieve metadata, resolve references, and construct canonical links omitted from response payloads in certain optimized formats.

Request payloads generally do not require context URLs as the type of the payload can generally be determined from the request URL.

For details on how the context URL is used to describe a payload, see the relevant sections in the particular format.

The following subsections describe how the context URL is constructed for each category of payload by providing a *context URL template*. The context URL template uses the following terms:

- `{context-url}` is the canonical resource path to the `$metadata` document,
- `{entity-set}` is the name of an entity set or path to a containment navigation property,
- `{entity}` is the canonical URL for an entity,
- `{singleton}` is the canonical URL for a singleton entity,
- `{select-list}` is an optional parenthesized comma-separated list of selected properties, instance annotations, functions, and actions,
- `{property-path}` is the path to a structural property of the entity,
- `{type-name}` is a qualified type name,
- `{/type-name}` is an optional type-cast segment containing the qualified name of a derived or implemented type prefixed with a forward slash.

The full grammar for the context URL is defined in [OData-ABNF]. Note that the syntax of the context URL is independent of whatever URL conventions the service uses for addressing individual entities.

## Service Document

Context URL template:

```json
{context-url}
```

The context URL of the service document is the metadata document URL of the service.

Example 10: resource URL and corresponding context URL

```text
http://host/service/
http://host/service/$metadata
```

## Collection of Entities

Context URL template:

```json
{context-url}#{entity-set}
{context-url}#Collection({type-name})
```

If all entities in the collection are members of one entity set, its name is the context URL fragment.

Example 11: resource URL and corresponding context URL

```text
http://host/service/Customers
http://host/service/$metadata#Customers
```

If the entities are contained, then `entity-set` is the top-level entity set or singleton followed by the path to the containment navigation property of the containing entity.

Example 12: resource URL and corresponding context URL for contained entities

```text
http://host/service/Orders(4711)/Items
http://host/service/$metadata#Orders(4711)/Items
```

If the entities in the response are not bound to a single entity set, such as from a function or action with no entity set path, a function import or action import with no specified entity set, or a navigation property with no navigation property binding, the context URL specifies the type of the returned entity collection.

## Entity

Context URL template:

```json
{context-url}#{entity-set}/$entity
{context-url}#{type-name}
```

If a response or response part is a single entity of the declared type of an entity set, `/$entity` is appended to the context URL.

Example 13: resource URL and corresponding context URL

```text
http://host/service/Customers(1)
http://host/service/$metadata#Customers/$entity
```

If the entity is contained, then `entity-set` is the canonical URL for the containment navigation property of the containing entity, e.g. Orders(4711)/Items.

Example 14: resource URL and corresponding context URL for contained entity

```text
http://host/service/Orders(4711)/Items(1)
http://host/service/$metadata#Orders(4711)/Items/$entity
```

If the response is not bound to a single entity set, such as an entity returned from a function or action with no entity set path, a function import or action import with no specified entity set, or a navigation property with no navigation property binding, the context URL specifies the type of the returned entity.

## Singleton

Context URL template:

```json
{context-url}#{singleton}
```

If a response or response part is a singleton, its name is the context URL fragment.

Example 15: resource URL and corresponding context URL

```text
http://host/service/MainSupplier
http://host/service/$metadata#MainSupplier
```

## Collection of Entity References

Context URL template:

```json
{context-url}#Collection($ref)
```

If a response is a collection of entity references, the context URL does not contain the type of the referenced entities.

Example 24: resource URL and corresponding context URL for a collection of entity references

```text
http://host/service/Customers('ALFKI')/Orders/$ref
http://host/service/$metadata#Collection($ref)
```

## Entity Reference

Context URL template:

```json
{context-url}#$ref
```

If a response is a single entity reference, `$ref` is the context URL fragment.

Example 25: resource URL and corresponding context URL for a single entity reference

```text
http://host/service/Orders(10643)/Customer/$ref
http://host/service/$metadata#$ref
```

## Property Value

Context URL templates:

```json
{context-url}#{entity}/{property-path}{select-list}
{context-url}#{type-name}{select-list}
```

If a response represents an individual property of an entity with a canonical URL, the context URL specifies the canonical URL of the entity and the path to the structural property of that entity. The path MUST include cast segments for properties defined on types derived from the expected type of the previous segment.

If the property value does not contain explicitly or implicitly selected navigation properties or operations, OData 4.01 responses MAY use the less specific second template.

Example 26: resource URL and corresponding context URL

```text
http://host/service/Customers(1)/Addresses
http://host/service/$metadata#Customers(1)/Addresses
```

## Collection of Complex or Primitive Types

Context URL template:

```json
{context-url}#Collection({type-name}){select-list}
```

If a response is a collection of complex types or primitive types that do not represent an individual property of an entity with a canonical URL, the context URL specifies the fully qualified type of the collection.

Example 27: resource URL and corresponding context URL

```text
http://host/service/TopFiveHobbies()
http://host/service/$metadata#Collection(Edm.String)
```

## Complex or Primitive Type

Context URL template:

```json
{context-url}#{type-name}{select-list}
```

If a response is a complex type or primitive type that does not represent an individual property of an entity with a canonical URL, the context URL specifies the fully qualified type of the result.

Example 28: resource URL and corresponding context URL

```text
http://host/service/MostPopularName()
http://host/service/$metadata#Edm.String
```

## Operation Result

Context URL templates:

```json
{context-url}#{entity-set}{/type-name}{select-list}
{context-url}#{entity-set}{/type-name}{select-list}/$entity
{context-url}#{entity}/{property-path}{select-list}
{context-url}#Collection({type-name}){select-list}
{context-url}#{type-name}{select-list}
```

If the response from an action or function is a collection of entities or a single entity that is a member of an entity set, the context URL identifies the entity set. If the response from an action or function is a property of a single entity, the context URL identifies the entity and property. Otherwise, the context URL identifies the type returned by the operation. The context URL will correspond to one of the former examples.

Example 29: resource URL and corresponding context URL

```text
http://host/service/TopFiveCustomers()
http://host/service/$metadata#Customers
```
