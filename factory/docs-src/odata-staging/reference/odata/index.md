# OData reference

## Attribution
Copyright © OASIS Open 2020. All Rights Reserved.
Derived from OData Version 4.01. Part 1: Protocol, OData Version 4.01. Part 2: URL Conventions, OData JSON Format Version 4.01, and OData Common Schema Definition Language (CSDL) XML Representation Version 4.01, OASIS Standard, 23 April 2020. This explanatory work is made under the OASIS Document Notices.
Also derived from the Microsoft Learn OData documentation (MicrosoftDocs/OData-docs, CC-BY-4.0, commit 3ca8f5b), author madansr7 (ms.author saumadan), ms.date 7/1/2019.

## [Overview and data model](overview-and-data-model/index.md)
Use when: asking what OData is, what the entity data model concepts mean, or what the service document and entity-ids are.
Terms: OData, Entity Data Model, entity set, singleton, service document, metadata document, entity-id
Not here: CSDL XML element reference → [metadata-and-annotations](metadata-and-annotations/index.md)

## [URLs and addressing](urls-and-addressing/index.md)
Use when: building or parsing an OData URL, addressing entities by key, or writing canonical URLs.
Terms: service root, resource path, key predicate, canonical URL, singleton
Not here: query option behaviour → [query-options](query-options/index.md)

## [Reading data](reading-data/index.md)
Use when: GETting entities, properties, related entities, `/$count`, context URLs, JSON control information, or invoking functions.
Terms: `GET`, `$value`, `/$ref`, `@odata.context`, `@odata.nextLink`, function
Not here: `$filter`/`$select`/`$expand` details → [query-options](query-options/index.md)

## [Modifying data](modifying-data/index.md)
Use when: creating, updating, upserting or deleting entities, or changing relationships with `/$ref`.
Terms: `POST`, `PATCH`, `PUT`, `DELETE`, upsert, deep insert, `@odata.bind`
Not here: Prefer / ETag headers → [headers-and-versioning](headers-and-versioning/index.md)

## [Query options](query-options/index.md)
Use when: applying `$filter`, `$orderby`, `$top`, `$skip`, `$count`, `$select`, `$expand`, or understanding evaluation order.
Terms: `$filter`, `$select`, `$expand`, `$orderby`, `$top`, `$skip`, `$count`, parameter alias
Not here: `/$count` path and nextLink annotations → [reading-data](reading-data/index.md)

## [Headers and versioning](headers-and-versioning/index.md)
Use when: using ETag concurrency headers, Prefer, OData-Version / OData-MaxVersion, Location or OData-EntityId.
Terms: `ETag`, `If-Match`, `Prefer`, `OData-Version`, `OData-MaxVersion`, `Location`, `OData-EntityId`
Not here: status code catalogue → [status-codes-and-errors](status-codes-and-errors/index.md)

## [Status codes and errors](status-codes-and-errors/index.md)
Use when: interpreting HTTP status codes, the error JSON body, or in-stream / trailing `OData-Error`.
Terms: `200`, `201`, `204`, `412`, `error`, `code`, `message`, `OData-Error`
Not here: Prefer / ETag request headers → [headers-and-versioning](headers-and-versioning/index.md)

## [Metadata and annotations](metadata-and-annotations/index.md)
Use when: reading `$metadata` structure — EntityType, Property, NavigationProperty, EnumType, EntityContainer, Term, Annotation.
Terms: `$metadata`, `EntityType`, `Property`, `NavigationProperty`, `EnumType`, `Annotation`, `Term`
Not here: runtime GET of entities → [reading-data](reading-data/index.md)
