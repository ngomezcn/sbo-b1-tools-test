---
title: What is OData
source: external OData: ms@3ca8f5b overview + oasis-p1@v4.01-os 2; retrieved 2026-10-02
summary: What OData is, what the protocol provides to a client (metadata, data, querying, editing, operations, vocabularies) and the design principles behind it.
---
# What is OData

In Service Layer: reference/introduction-getting-started/introduction.md

OData (Open Data Protocol) is an ISO/IEC approved, OASIS standard that defines a set of best practices for building and consuming REST APIs. It enables creation of REST-based services which allow resources identified using Uniform Resource Locators (URLs) and defined in a data model, to be published and edited by Web clients using simple HTTP messages.

OData helps applications to focus on business logic without worrying about the various API approaches to define request and response headers, status codes, HTTP methods, URL conventions, media types, payload formats, query options, etc. It provides guidance for tracking changes, defining functions/actions for reusable procedures, and sending asynchronous/batch requests.

## Protocol

The OData Protocol is an application-level protocol for interacting with data via RESTful interfaces. The protocol supports the description of data models and the editing and querying of data according to those models. REST APIs that are based on OData are easy to discover and consume due to the OData metadata, a machine-readable description of the data model which renders in a human readable format and enables the creation of powerful generic client proxies and tools.

It provides facilities for:

- Metadata: a machine-readable description of the data model exposed by a particular service.
- Data: sets of data entities and the relationships between them.
- Querying: requesting that the service perform a set of filtering and other transformations to its data, then return the results.
- Editing: creating, updating, and deleting data.
- Operations: invoking custom logic
- Vocabularies: attaching custom semantics

The OData Protocol is different from other REST-based web service approaches in that it provides a uniform way to describe both the data and the data model. This improves semantic interoperability between systems and allows an ecosystem to emerge.

## Design principles

- Follow REST principles.
- Keep it simple. Address the common cases and provide extensibility where necessary.
- Build incrementally. A very basic, compliant service should be easy to build, with additional work necessary only to support additional capabilities.
- Extensibility is important. Services should be able to support extended functionality without breaking clients unaware of those extensions.
- Prefer mechanisms that work on a variety of data sources. In particular, do not assume a relational data model.
