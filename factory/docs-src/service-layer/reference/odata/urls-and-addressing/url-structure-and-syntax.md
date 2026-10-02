---
title: OData URL structure and syntax
source: external OData: oasis-p2@v4.01-os 2, 3 + ms@3ca8f5b url-components; retrieved 2026-10-02
summary: The three parts of an OData URL (service root, resource path, query options), the service root rules, how a URL is parsed and percent-decoded, and how to write valid URLs (quotes and slashes in string keys).
---
# OData URL structure and syntax

In Service Layer: reference/consuming-service-layer/overview-key-elements.md

## The three parts of a URL

A URL used by an OData service has at most three significant parts: the service root URL, the resource path, and query options. Other URL constructs (such as a fragment) can be present, but the specification gives them no further meaning.

Example 2: OData URL broken down into its component parts:

```text
http://host:port/path/SampleService.svc/Categories(1)/Products?$top=2&$orderby=Name
 \______________________________________/\____________________/ \__________________/
                   |                               |                       |
           service root URL                  resource path           query options
```

URLs represent individual resources, collections of resources, or operations. Clients interact with them using the standard GET, PUT, PATCH, POST and DELETE methods.

### Service root URL

The service root URL identifies the root of an OData service. It is the base URL of the service.

- The service root URL MUST terminate in a forward slash.
- A `GET` request to the service root URL returns the format-specific service document, see [OData-JSON].
- The service document defines the resources available through the service and lets simple hypermedia-driven clients enumerate and explore them.

### Resource path

A resource is an object accessible over HTTP with the standard methods GET, POST, PUT, PATCH and DELETE. It can be a single object or a collection of similar objects, ordered or unordered. Addressable aspects of resources exposed by the data model include collections of entities, a single entity, properties, links and operations.

Examples:

```text
http://host/service/Products
```

```text
http://host/service/ProductsByCategoryId(catId=2)
```

- The first URL accesses an entity set.
- The second URL executes a function.

### Query options

Query options are standardized query-string parameters that can be passed to an OData service to run queries on the requested resource. They perform operations such as `select`, `filter`, `count`, `skip`, `order`, `search` and `format`.

- All OData query options are prefixed by a `$` sign and are case-insensitive.

Example that selects a product by color:

```text
https://server/products?$filter=color eq 'red'
```

## URL parsing

OData follows the URI syntax rules of [RFC3986] and also assigns special meaning to several of the sub-delimiters defined there, so parsing and percent-decoding need care.

[RFC3986] defines three steps that MUST be performed before percent-decoding:

1. Split the undecoded URL into the components scheme, hier-part, query, and fragment.
2. Split the undecoded hier-part into authority and path.
3. Split the undecoded path into path segments.

After those steps, the following steps MUST be performed:

1. Split the undecoded query at `&` into query options, and split each query option at the first `=` into query option name and query option value.
2. Percent-decode path segments, query option names, and query option values exactly once.
3. Interpret path segments, query option names, and query option values according to OData rules.

## URL syntax

The OData syntax rules for URLs are defined in the URL Conventions document and in [OData-ABNF].

- The ABNF is not expressive enough to define a correct OData URL in every case. The URL Conventions document defines additional rules that a correct OData URL MUST fulfill. In case of doubt, the rules in that document take precedence.
- The ABNF rules assume that URLs and URL parts have been percent-encoding normalized as described in section 6.2.2.2 of [RFC3986] before the grammar is applied: all characters in the unreserved set (rule `unreserved` in [OData-ABNF]) are plain literals and not percent-encoded.
- For characters outside the unreserved set that are significant to OData, the ABNF rules state whether the percent-encoded representation is treated as identical to the plain literal. This keeps the ABNF test inputs readable.

One of the rules: a single quote within a string literal is represented as two consecutive single quotes.

Example 3: valid OData URLs:

```text
http://host/service/People('O''Neil')
http://host/service/People(%27O%27%27Neil%27)
http://host/service/People%28%27O%27%27Neil%27%29
http://host/service/Categories('Smartphone%2FTablet')
```

Example 4: invalid OData URLs:

```text
http://host/service/People('O'Neil')
http://host/service/People('O%27Neil')
http://host/service/Categories('Smartphone/Tablet')
```

- The first and second URLs are invalid because a single quote in a string literal must be represented as two consecutive single quotes.
- The third URL is invalid because forward slashes are interpreted as path segment separators, and `Categories('Smartphone` is not a valid OData path segment, nor is `Tablet')`.
