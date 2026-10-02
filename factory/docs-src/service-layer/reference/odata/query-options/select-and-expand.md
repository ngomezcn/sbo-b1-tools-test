---
title: $select and $expand (including expand options)
source: external OData: oasis-p1@v4.01-os 11.2.5 + oasis-p2@v4.01-os 5.1.3, 5.1.4; retrieved 2026-10-02
summary: Which properties a response contains with $select, how to include related entities and streams with $expand, which options can be nested inside both, and what $ref, $count, $levels and the star operator do.
---
# $select and $expand (including expand options)

In Service Layer: reference/consuming-service-layer/query-options/expand-enhancements.md; reference/consuming-service-layer/associations.md; reference/consuming-service-layer/query-options/basic-queries.md

- [Choosing properties with $select](#choosing-properties-with-select)
- [Select item grammar](#select-item-grammar)
- [Including related entities with $expand](#including-related-entities-with-expand)
- [Expand item grammar](#expand-item-grammar)
- [Expand options](#expand-options)
- [Counting and referencing expanded entities](#counting-and-referencing-expanded-entities)
- [Star operator, streams and $value](#star-operator-streams-and-value)
- [Recursive expansion with $levels](#recursive-expansion-with-levels)

The `$select` and `$expand` system query options let the client specify the set of structural properties and navigation properties to include in a response. The service MAY include additional properties not specified in `$select` and `$expand`, including properties not defined in the metadata document.

## Choosing properties with $select

`$select` requests that the service return only the properties, dynamic properties, actions and functions explicitly requested by the client. The service returns the specified content, if available, along with any available expanded navigation or stream properties, and MAY return additional information.

The value of `$select` is a comma-separated list of select items: properties, qualified action names, qualified function names, the star operator (`*`), or the star operator prefixed with the namespace or alias of the schema in order to specify all operations defined in the schema. Only aliases defined in the metadata document of the service can be used in URLs.

`$select` is interpreted relative to the entity type or complex type of the resources identified by the resource path section of the URL. Each select item indicates that the response MUST include the declared or dynamic properties, actions and functions it identifies. The simplest select item names a property defined on the entity type of the resources identified by the resource path.

Example 33: request only the `Rating` and `ReleaseDate` for the matching Products

```http
GET http://host/service/Products?$select=Rating,ReleaseDate
```

The star operator requests all structural properties, including any dynamic properties. It SHOULD NOT introduce navigation properties, actions or functions not otherwise requested.

Example 34:

```http
GET http://host/service/Products?$select=*
```

Properties of related entities can be specified by including `$select` within `$expand`.

Example 35:

```http
GET http://host/service/Products?$expand=Category($select=Name)
```

### Default properties and navigation properties

- If `$select` is not specified, the service returns the full set of properties or a default set of properties. The default set MUST include all key properties.
- Services may change the default set: they may return new properties by default and omit properties previously returned by default. Clients that rely on specific properties in the response MUST use `$select` with the required properties or with `*`.
- Expanded navigation properties MUST be returned, even if they are not specified in `$select`. The properties specified in `$select` are represented in addition to any expanded navigation or stream properties.
- If a navigation property is a select item, the corresponding navigation link is represented in the response. If it also appears in `$expand`, it is additionally represented as inline content. That inline content can itself be restricted with a nested `$select`; see System Query Option $filter for the nesting of query options.
- If the service returns less than the full set of properties, whether because the client specified a select or because the service chose a subset without one, the context URL MUST reflect the set of selected properties and projected expanded navigation properties.

Example 36: for each category, return the `CategoryName` and the `Products` navigation link

```http
GET http://host/service/Categories?$select=CategoryName,Products
```

Example 129: name and description of all products, plus name of expanded category

```text
http://host/service/Products?$select=Name,Description&$expand=Category($select=Name)
```

### Actions and functions

- Any structural property, non-expanded navigation property, or operation not requested as a select item (explicitly or via a star) SHOULD be omitted from the response.
- If any select item (including a star) is specified, actions and functions SHOULD be omitted unless explicitly requested.
- If an action or function is requested, either by its qualified name or implicitly by requesting all operations in a schema, the service includes information about how to invoke that operation for each entity identified by the last path segment of the request URL for which the operation can be bound.
- If an action or function is requested by its qualified name and cannot be bound to the requested entities, the service MUST ignore the select item.
- When multiple select items exist, the total set of properties, open properties, navigation properties, actions and functions returned is the union of the sets identified by each select item.

Example 37: all actions or functions available for each returned entity

```http
GET http://host/service/Products?$select=DemoService.*
```

Example 132: the `ID` property, the `ActionName` action defined in `Model` and all actions and functions defined in the `Model2` for each product if those actions and functions can be bound to that product

```text
http://host/service/Products?$select=ID,Model.ActionName,Model2.*
```

### Annotations

Annotations requested in `$select` MUST be included in the response; `$select` overrules the `include-annotations` preference for the explicitly requested annotations. Additional annotations matching the preference can be included even if not requested via `$select`. The `Preference-Applied` response header only reflects the set of annotations included due to the `include-annotations` preference and not those only included due to `$select`.

## Select item grammar

The formal grammar is the `select` rule of the ABNF construction rules. Each select item is one of:

- a path, to include a property,
- a star (`*`), to include all declared or dynamic properties of the type, or
- a qualified schema name followed by a dot (`.`) followed by a star (`*`) to request all applicable actions or functions from that schema.

A path consists of segments separated by a forward slash (`/`). Segments are names of single- or collection-valued complex properties, instance annotations, or type-cast segments consisting of the qualified name of a structured type derived from the type identified by the preceding path segment, to reach properties defined on the derived type.

A path can end with:

- the name of a property or non-entity-valued instance annotation of the identified structured instance,
- the qualified name of a bound action,
- the qualified name of a bound function, to include all matching overloads, or
- the qualified name of a bound function followed by parentheses containing the comma-separated lists of non-binding parameters identifying a single overload.

Rules for select items:

- If the select item is not defined for the type of the resource and that type supports dynamic properties or instance annotations, the property is treated as null for all instances on which it is not defined.
- If the select item is not defined for the type of the resource and that type supports neither, the request is considered malformed.
- If the select item is an instance annotation of type entity or collection of entities, the request is considered malformed. Entity-valued annotations can be included using `$expand`.
- The select item MUST be prefixed with a qualified structured type name in order to select a property defined on a type derived from the type of the resource segment.
- A select item that is a complex type or collection of complex type can be followed by a forward slash, an optional type-cast segment, and the name of a property of the complex type (and so on for nested complex types).
- If a select item is a path requesting a component of a complex property and the complex property is `null` on an instance, the component is treated as `null` as well.

Example 130: the `AccountRepresentative` property of any supplier that is of the derived type `Namespace.PreferredSupplier`, together with the `Street` property of the complex property `Address`, and the `Location` property of the derived complex type `Namespace.AddressWithLocation`

```text
http://host/service/Suppliers?$select=Namespace.PreferredSupplier/AccountRepresentative,Address/Street,Address/Namespace.AddressWithLocation/Location
```

### Select options

Query options can be applied to a select item by appending a semicolon-separated list of query options, enclosed in parentheses, to the item. This applies to a select item that is a path to a single complex value or a collection of primitive or complex values. Allowed system query options are `$select` and `$compute` for complex properties, plus `$filter`, `$search`, `$count`, `$orderby`, `$skip`, and `$top` for collection-valued properties; the allowed options depend on the type of the resource identified by the select item, with the exception of `$expand`.

A property MUST NOT have select options specified in more than one place in a request, MUST NOT have both select options and expand options specified, and MUST NOT be specified in more than one expand.

Example 131: select up to five addresses whose `City` starts with an `H`, sorted, and with the `Country` expanded

```text
http://host/service/Customers?$select=Addresses($filter=startswith(City,'H');$top=5;$orderby=Country/Name,City,Street)&$expand=Addresses/Country
```

## Including related entities with $expand

`$expand` indicates the related entities and stream values that MUST be represented inline. The service MUST return the specified content, and MAY choose to return additional information.

The value of `$expand` is a comma-separated list of navigation property names, stream property names, or `$value` indicating the stream content of a media entity. For navigation properties, the name is optionally followed by a `/$ref` or a `/$count` path segment, and optionally a parenthesized set of expand options (for filtering, sorting, selecting, paging, or expanding the related entities). The formal grammar is the `expand` rule of the ABNF construction rules.

Example 38: for each customer entity within the Customers entity set the value of all related Orders will be represented inline

```http
GET http://host/service.svc/Customers?$expand=Orders
```

Example 39: for each customer entity within the Customers entity set the references to the related Orders will be represented inline

```http
GET http://host/service.svc/Customers?$expand=Orders/$ref
```

Example 40: for each customer entity within the Customers entity set the media stream representing the customer photo will be represented inline

```http
GET http://host/service.svc/Customers?$expand=Photo
```

Example 43: for each customer entity in the Customers entity set, the value of all related InHouseStaff will be represented inline if the entity is of type VipCustomer or a subtype of that. For entities that are not of type `VipCustomer`, or any of its subtypes, that entity may be returned with no inline representation for the expanded navigation property `InHouseStaff (the service can always send more than requested)`

```http
GET http://host/service.svc/Customers?$expand=SampleModel.VipCustomer/InHouseStaff
```

## Expand item grammar

The value of `$expand` is a comma-separated list of expand items. Each expand item is evaluated relative to the retrieved resource being expanded. An expand item is either a path or one of the symbols `*` or `$value`.

A path consists of segments separated by a forward slash (`/`). Segments are names of single- or collection-valued complex properties, instance annotations, or type-cast segments consisting of the qualified name of a structured type derived from the type identified by the preceding path segment, to reach properties defined on the derived type.

A path can end with:

- the name of a stream property, to include that stream property,
- a star (`*`), to expand all navigation properties of the identified structured instance, optionally followed by `/$ref` to expand only entity references,
- a navigation property, to expand the related entity or entities, optionally followed by a type-cast segment to expand only related entities of that derived type or one of its sub-types, optionally followed by `/$ref` to expand only entity references, or
- an entity-valued instance annotation, to expand the related entity or entities, optionally followed by a type-cast segment to expand only related entities of that derived type or one of its sub-types.

If a structured type traversed by the path supports neither dynamic properties nor instance annotations, a corresponding property segment MUST specify a declared property of that structured type. Otherwise, if a traversed type does support dynamic navigation properties or instance annotations and the property segment does not specify a declared property, the expanded property appears only for those instances on which it has a value.

A property MUST NOT appear in more than one expand item.

Example 115: expand a navigation property of a complex type

```text
http://host/service/Customers?$expand=Addresses/Country
```

## Expand options

The set of expanded entities can be further refined by expand options: a semicolon-separated list of system query options, enclosed in parentheses, appended to the navigation property name. Allowed system query options are `$filter`, `$select`, `$orderby`, `$skip`, `$top`, `$count`, `$search`, `$expand`, `$compute`, and `$levels`.

Example 41: for each customer entity within the `Customers` entity set, the value of those related `Orders` whose `Amount` is greater than 100 will be represented inline

```http
GET http://host/service.svc/Customers?$expand=Orders($filter=Amount gt 100)
```

Example 116: all categories and for each category all related products with a discontinued date equal to `null`

```text
http://host/service/Categories? $expand=Products($filter=DiscontinuedDate eq null)
```

Example 42: for each order within the `Orders` entity set, the following will be represented inline:

- The `Items` related to the `Orders` identified by the resource path section of the URL and the products related to each order item.

The `Customer` related to each order returned.

```http
GET http://host/service.svc/Orders?$expand=Items($expand=Product),Customer
```

## Counting and referencing expanded entities

The `$count` segment can be appended to a navigation property name, or to a type-cast segment following a navigation property name, to return just the count of the related entities. The `$filter` and `$search` system query options can be used to limit the number of related entities included in the count.

Example 117: all categories and for each category the number of all related products

```text
http://host/service/Categories?$expand=Products/$count
```

Example 118: all categories and for each category the number of all related blue products

```text
http://host/service/Categories?$expand=Products/$count($search=blue)
```

To retrieve entity references instead of the related entities, append `/$ref` to the navigation property name or to a type-cast segment following a navigation property name. The system query options `$filter`, `$search`, `$skip`, `$top`, and `$count` can be used to limit the number of expanded entity references.

Example 120: all categories and for each category the references of all related products of the derived type `Sales.PremierProduct`

```text
http://host/service/Categories?$expand=Products/Sales.PremierProduct/$ref
```

Example 121: all categories and for each category the references of all related premier products with a current promotion equal to `null`

```text
http://host/service/Categories? $expand=Products/Sales.PremierProduct/$ref($filter=CurrentPromotion eq null)
```

## Star operator, streams and $value

A star (`*`) expands all declared and dynamic navigation properties. To retrieve references to all related entities use `*/$ref`, and to expand all related entities with a certain distance use the star operator with the `$levels` option. The star operator can be combined with explicitly named navigation properties, which take precedence over the star operator. The star operator does not implicitly include stream properties.

Example 123: expand `Supplier` and include references for all other related entities

```text
http://host/service/Categories?$expand=*/$ref,Supplier
```

Example 124: expand all related entities and their related entities

```text
http://host/service/Categories?$expand=*($levels=2)
```

Specifying a stream property includes the media stream inline according to the specified format (see Example 40). Specifying `$value` for a media entity includes the media entity's stream value inline according to the specified format.

Example 126: Include the `Product's` media stream along with other properties of the product

```text
http://host/service/Products?$expand=$value
```

## Recursive expansion with $levels

The `$levels` expand option specifies the number of levels of recursion for a hierarchy in which the related entity type is the same as, or can be cast to, the source entity type (cyclic navigation properties). Its value is either a positive integer to specify the number of levels to expand, or the literal string `max` to specify the maximum expansion level supported by that service. A `$levels` option with a value of 1 specifies a single expand with no recursion. The same expand options are applied at each level of the hierarchy.

Services MAY support the symbolic value `max` in addition to numeric values. In that case they MUST solve circular dependencies by injecting an entity reference somewhere in the circular dependency. Clients using `$levels=max` MUST be prepared to handle entity references in cases where a circular reference would occur otherwise.

4.01 services that support `max` SHOULD do so in a case-insensitive manner. Clients that want to work with 4.0 services MUST use lower case.

Example 44: return each employee from the Employees entity set and, for each employee that is a manager, return all direct reports, recursively to four levels

```http
GET http://host/service/Employees?$expand=Model.Manager/DirectReports($levels=4)
```

Example 122: all employees with their manager, manager's manager, and manager's manager's manager

```text
http://host/service/Employees?$expand=ReportsTo($levels=3)
```
