---
title: Key Elements and Terms
source: pdf pp. 15-15, sec 3
summary: Overview of consuming Service Layer and the key elements of a request (service root URL, resource path, query options, HTTP verb, JSON representation) with sample URLs.
---

# Key Elements and Terms

This section explains how to consume SAP Business One Service Layer and provides examples. For a full list of exposed entities and actions, refer to metadata returned by your service or the API reference of SAP Business One Service Layer.

Before interacting with Service Layer, refer to the following table for the key elements and terms:

<!-- table: t015-01 -->
- **Key Elements and Terms**: Service Root URL
  - **Description/Activity**: Identifies the root of Service Layer API. Service layer supports HTTPS by default.
  - **URL/Sample Code**:

    `https://<server>:<port>/b1s/<version>`

    Example: `https://databaseserver:50000/b1s/v1`

    > **Note**
    >
    > To use OData version 3, send the following HTTP request: `https://databaseserver:50000/b1s/v1`
    >
    > To use OData version 4, send the following HTTP request: `https://databaseserver:50000/b1s/v2`

- **Key Elements and Terms**: Resource Path
  - **Description/Activity**: Identifies the resource to be interacted with. It can be a collection of entities or a single entity.
  - **URL/Sample Code**:

    `https://<server>:<port>/b1s/<version>/<resource_path>`

    Example: `https://databaseserver:50000/b1s/v1/Items`

- **Key Elements and Terms**: Query Options
  - **Description/Activity**: Specifies multiple query options and operation parameters.
  - **URL/Sample Code**:

    `https://<server>:<port>/b1s/<version>/<resource_path>?<query_options>`

    Example: `https://databaseserver:50000/b1s/v1/Items?$top=2&$orderby=itemcode`

- **Key Elements and Terms**: HTTP Verb
  - **Description/Activity**: Indicates the action to be taken against the resource, in accordance with the RESTful architectural principles.
  - **URL/Sample Code**:

    In the following example, the 2 requests are equivalent:

    - `POST https://databaseserver/b1s/v1/Login`
    - `POST /Login`

- **Key Elements and Terms**: JSON Resource Representation
  - **Description/Activity**: Represents and interacts with structured content, embedded in Service Layer requests and responses.
  - **URL/Sample Code**: `{"key1": "value1", "arr1": [100, 200], "key2": "value2"}`
