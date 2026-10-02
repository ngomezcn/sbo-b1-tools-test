---
title: Invoking functions and bound operations
source: external OData: oasis-p1@v4.01-os 11.5.4, 11.5.1; retrieved 2026-10-02
summary: How to bind an operation to a resource, invoke a function with GET (inline parameters, aliases, function imports), empty results, and function overload resolution.
---
# Invoking functions and bound operations

In Service Layer: reference/consuming-service-layer/actions.md ; SL differs: SL documents bound and global operations as Actions with POST, while OData functions are invoked with GET and MUST have no observable side effects

- [Binding an operation to a resource](#binding-an-operation-to-a-resource)
- [Functions](#functions)
- [Inline parameter syntax](#inline-parameter-syntax)
- [Function overload resolution](#function-overload-resolution)

## Binding an operation to a resource

Actions and Functions MAY be bound to any type or collection, similar to defining a method in a class in object-oriented programming. The first parameter of a bound operation is the *binding parameter*.

The namespace- or alias-qualified name of a bound operation may be appended to any URL that identifies a resource whose type matches, or is derived from, the type of the binding parameter. The resource identified by that URL is used as the *binding parameter value*. Only aliases defined in the metadata document of the service can be used in URLs.

Example 83: the function `MostRecentOrder` can be bound to any URL that identifies a `SampleModel.Customer`

```xml
<Function Name="MostRecentOrder" IsBound="true">
     <Parameter Name="customer" Type="SampleModel.Customer" />
     <ReturnType Type="SampleModel.Order" /> 
 </Function>
```

Example 84: invoke the `MostRecentOrder` function with the value of the binding parameter `customer` being the entity identified by `http://host/service/Customers(6)`

```http
GET http://host/service/Customers(6)/SampleModel.MostRecentOrder()
```

Example 85: the function `Comparison` can be bound to any URL that identifies a collection of entities

```xml
<Function Name="Comparison" IsBound="true">
     <Parameter Name="in" Type="Collection(Edm.EntityType)" />
     <ReturnType Type="Diff.Overview" /> 
 </Function>
```

Example 86: invoke the `Comparison` function on the set of red products

```http
GET http://host/service/Products/$filter(Color eq 'Red')/Diff.Comparison()
```

## Functions

Functions are operations exposed by an OData service that MUST return data and MUST have no observable side effects.

### Invoking a function

To invoke a function bound to a resource, the client issues a `GET` request to a function URL. A function URL may be obtained from a previously returned entity representation or constructed by appending the namespace- or alias-qualified function name to a URL that identifies a resource whose type is the same as, or derived from, the type of the binding parameter of the function. The value for the binding parameter is the value of the resource identified by the URL prior to appending the function name, and additional parameter values are specified using inline parameter syntax. If the function URL is obtained from a previously returned entity representation, parameter aliases that are identical to the parameter name preceded by an at (`@`) sign MUST be used. Clients MUST check if the obtained URL already contains a query part and appropriately precede the parameters either with an ampersand (`&`) or a question mark (`?`).

Services MAY additionally support invoking functions using the unqualified function name by defining one or more default namespaces through the `Core.DefaultNamespace` term defined in [OData-VocCore].

Functions can be used within `$filter` or `$orderby` system query options. Such functions can be bound to a resource, as described above, or called directly by specifying the namespace- (or alias-) qualified function name. Parameter values for functions within `$filter` or `$orderby` are specified according to the inline parameter syntax.

To invoke a function through a function import the client issues a `GET` request to a URL identifying the function import and passing parameter values using inline parameter syntax. The canonical URL for a function import is the service root, followed by the name of the function import. Services MAY support omitting the parentheses when invoking a function import with no parameters, but for maximum interoperability MUST also support invoking the function import with empty parentheses.

If the function is composable, additional path segments may be appended to the URL that identifies the composable function (or function import) as appropriate for the type returned by the function (or function import). The last path segment determines the system query options and HTTP verbs that can be used with this this URL, e.g. if the last path segment is a multi-valued navigation property, a `POST` request may be used to create a new entity in the identified collection.

Example 90: add a new item to the list of items of the shopping cart returned by the composable `MyShoppingCart` function import

```http
POST http://host/service/MyShoppingCart()/Items

...
```

Parameter values passed to functions MUST be specified either as a URL literal (for primitive values) or as a JSON formatted OData object (for complex values, or collections of primitive or complex values). Entity typed values are passed as JSON formatted entities that MAY include a subset of the properties, or just the entity reference, as appropriate to the function.

If a collection-valued function has no result for a given parameter value combination, the response is the format-specific representation of an empty collection. If a single-valued function with a nullable return-type has no result, the service returns `204 No Content`.

If a single-valued function with a non-nullable return type has no result, the service returns `4xx`. For functions that return a single entity `404 Not Found` is the appropriate response code.

For a composable function the processing is stopped when the function result requires a `4xx` response, and continues otherwise.

Function imports preceded by the `$root` literal MAY be used in the `$filter` or `$orderby` system query options, see [OData-URL].

## Inline parameter syntax

Parameter values are specified inline by appending a comma-separated list of parameter values, enclosed by parenthesis to the function name.

Each parameter value is represented as a name/value pair in the format `Name=Value`, where `Name` is the name of the parameter to the function and `Value` is the parameter value.

Example 91: invoke a `Sales.EmployeesByManager` function which takes a single `ManagerID` parameter via the function import `EmployeesByManager`

```http
GET http://host/service/EmployeesByManager(ManagerID=3)
```

Example 92: return all `Customers` whose City property returns "Western" when passed to the `Sales.SalesRegion` function

```http
GET http://host/service/Customers?
                          $filter=Sales.SalesRegion(City=$it/City) eq 'Western'
```

A parameter alias can be used in place of an inline parameter value. The value for the alias is specified as a separate query option using the name of the parameter alias.

Example 93: invoke a `Sales.EmployeesByManager` function via the function import `EmployeesByManager`, passing 3 for the `ManagerID` parameter

```http
GET http://host/service/EmployeesByManager(ManagerID=@p1)?@p1=3
```

Services MAY in addition allow implicit parameter aliases for function imports and for functions that are the last path segment of the URL. An implicit parameter alias is the parameter name, optionally preceded by an at (`@`) sign. When using implicit parameter aliases, parentheses MUST NOT be appended to the function (import) name. The value for each parameter MUST be specified as a separate query option with the name of the parameter alias. If a parameter name is identical to a system query option name (without the optional `$` prefix), the parameter name MUST be prefixed with an at (`@`) sign.

Example 94: invoke a `Sales.EmployeesByManager` function via the function import `EmployeesByManager`, passing 3 for the `ManagerID` parameter using the implicit parameter alias

```http
GET http://host/service/EmployeesByManager?ManagerID=3
```

Non-binding parameters annotated with the term `Core.OptionalParameter` defined in [OData-VocCore] MAY be omitted. If it is annotated and the annotation specifies a `DefaultValue`, the omitted parameter is interpreted as having that default value. If omitted and the annotation does not specify a default value, the service is free on how to interpret the omitted parameter.

## Function overload resolution

The same function name may be used multiple times within a schema, each with a different set of parameters. For unbound overloads the combination of the function name and the unordered set of parameter names MUST identify a particular function overload. For bound overloads the combination of the function name, the binding parameter type, and the unordered set of names of the non-binding parameters MUST identify a particular function overload.

All unbound overloads MUST have the same return type. Also, all bound overloads with a given binding parameter type MUST have the same return type.

If the function is bound and the binding parameter type is part of an inheritance hierarchy, the function overload is selected based on the type of the URL segment preceding the function name. A type-cast segment can be used to select a function defined on a particular type in the hierarchy, see [OData-URL].

Non-binding parameters MAY be marked as optional by annotating them with the term `Core.OptionalParameter` defined in [OData-VocCore]. All parameters marked as optional MUST come after any parameters not marked as optional.

A function overload is selected if

- The set of specified parameters exactly matches a function overload, or else
- The set of specified parameters matches a subset of parameters that includes all non-optional parameters of exactly one function overload.

Services SHOULD avoid ambiguity, i.e. the combination of the function name, the unordered set of *non-optional* non-binding parameter names, plus the binding parameter type for bound overloads SHOULD identify a particular function overload. If there is ambiguity, then services MAY return `400 Bad Request` with an error response body stating that the request was ambiguous.
