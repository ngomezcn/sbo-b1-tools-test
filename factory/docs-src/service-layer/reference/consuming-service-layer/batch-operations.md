---
title: Batch Operations
source: pdf pp. 74-79, sec 3.9
summary: Sending several requests in one $batch call as a Multipart MIME message, change sets with Content-ID references, a complete sample, and the batch response formats.
---

# Batch Operations

- [Batch Request Method and URI](#batch-request-method-and-uri)
- [Batch Request Headers](#batch-request-headers)
- [Batch Request Body](#batch-request-body)
- [Change Sets](#change-sets)
- [Batch Request Sample Codes](#batch-request-sample-codes)
- [Batch Response](#batch-response)

Service Layer supports executing multiple operations sent in a single HTTP request through the use of batching. A batch request must be represented as a Multipart MIME (Multipurpose Internet Mail Extensions) v1.0 message.

## Batch Request Method and URI

Always use the HTTP `POST` method to send a batch request. A batch request is submitted as a single HTTP `POST` request to the batch endpoint of a service, located at the URI `$batch` relative to the service root.

```http
POST https://databaseserver:50000/b1s/v1/$batch
```

## Batch Request Headers

The batch request must contain a `Content-Type` header that specifies a content type of multipart/mixed and a boundary specification as:

```text
Content-Type: multipart/mixed;boundary=<Batch Boundary>
```

The boundary specification is used in the [Batch Request Body](batch-operations.md#batch-request-body) [page 75] section.

## Batch Request Body

The body of a batch request is composed of a series of individual requests and change sets, each represented as a distinct MIME part, and separated by the boundary defined in the `Content-Type` header.

```text
--<Batch Boundary>
<subrequest-1>
--<Batch Boundary>
<subrequest-2>
--<Batch Boundary>
Content-Type: multipart/mixed;boundary=<Changeset Boundary>
--<Changeset boundary>
<subchangeset-request-1>
--<Changeset boundary>
<subchangeset-request-2>
--<Changeset boundary>--
--<Batch Boundary>--
```

The service processes the requests within a batch request sequentially.

Each sub request must include a `Content-Type` header with value `application/http` and a `Content-Transfer-Encoding` header with value `binary`.

```text
Content-Type:application/http
Content-Transfer-Encoding:binary
```

```xml
<sub request body>
```

The sub request body includes the real request content.

> **Example**
>
> ```http
> POST /b1s/v1/Items
>
> <Json format Items Content>
> ```
>
> or
>
> ```http
> GET /b1s/v1/Item('i001')
> ```
>
> Note that two empty lines are necessary after the `GET` request line. The first empty line is part of the `GET` request header, and the second one is the empty body of the `GET` request, followed by a `CRLF`.

## Change Sets

A change set is an atomic unit of works. It means that any failed sub request in a change set will cause the whole change set to be rolled back. Change sets must not contain any `GET` requests or other change sets.

Sub change set requests basically have the same format as sub requests outside change sets, except for one additional feature: `Referencing Content ID`.

Referencing Content ID: New entities created by a `POST` request within a change set can be referenced by subsequent requests within the same change set by referring to the value of the `Content-ID` header prefixed with a `$` character. When used in this way, `$<Content-ID>` acts as an alias for the URI that identifies the new entity.

> **Example**
>
> **How to use change set with Content-ID**
>
> 1. Create an order.
> 2. Use `$<Content-ID>` to modify the order you just created.
>
> ```text
> --<Batch Boundary>
> Content-Type: multipart/mixed;boundary=<Changeset Boundary>
> --<Changeset boundary>
> Content-Type:application/http
> Content-Transfer-Encoding:binary
> Content-ID:1
> POST /b1s/v1/Items
> <Json format Items Content>
> --<Changeset boundary>
> Content-Type:application/http
> Content-Transfer-Encoding:binary
> Content-ID:2
> PATCH /b1s/v1/$1
> <Json format Item update content>
> --<Changeset boundary>--
> --<Batch Boundary>--
> ```
>
> Note that `Content-ID` only exists in change set sub requests:
>
> - For OData Version 3, it is not necessary to use `Content-ID` unless you need to use it for reference.
> - For OData Version 4, this header is a mandatory field, whether you use it or not.

## Batch Request Sample Codes

The sample codes in this section show a complete batch request that contains the following operations:

- A query request.
- A change set that contains the following requests:
  - Insert entity (with `Content-ID` = 1)
  - Update request (with `Content-ID` = 2)

**Sample Codes**

```http
POST https://databaseserver:50000/b1s/v1/$batch
OData-Version: 4.0
Content-Type: multipart/mixed;boundary=batch_36522ad7-fc75-4b56-8c71-56071383e77b
```

```text
--batch_36522ad7-fc75-4b56-8c71-56071383e77b
Content-Type: application/http
Content-Transfer-Encoding:binary
```

```http
GET /b1s/v1/Items('i001')
```

```text
--batch_36522ad7-fc75-4b56-8c71-56071383e77b
Content-Type: multipart/mixed;boundary=changeset_77162fcd-b8da-41ac-
a9f8-9357efbbd
```

```text
--changeset_77162fcd-b8da-41ac-a9f8-9357efbbd
Content-Type: application/http
Content-Transfer-Encoding: binary
Content-ID: 1
```

```http
POST /b1s/v1/Items('i002')
Content-Type: application/json
```

```xml
<Json format item(i002) body>
--changeset_77162fcd-b8da-41ac-a9f8-9357efbbd
Content-Type: application/http
Content-Transfer-Encoding: binary
Content-ID: 2
```

```http
PATCH /b1s/v1/$1
Content-Type: application/json
```

```xml
<Json format item(i002) update body>
--changeset_77162fcd-b8da-41ac-a9f8-9357efbbd--
--batch_36522ad7-fc75-4b56-8c71-56071383e77b--
```

## Batch Response

This section contains the batch responses after you execute the batch requests.

**[Batch Request Format Invalid]**

Service returns HTTP error code: `400 Bad Request` with error info in body if the request format is not valid.

> **Example**
>
> ```text
> "error" : {
>       "code" : -1000,
>       "innererror" : {
>          "context" : null,
>          "trace" : null
>       },
>       "message" : {
>          "lang" : "en-us",
>          "value" : "Incomplete Batch Request Body!"
>       }
>     }
> ```

**[Batch Request Format Valid]**

Service returns HTTP code: `202 Accept` (OData Version 3) or `200 OK` (OData Version 4) if the request format is valid. The response body that is returned to the client depends on the request execute result.

- If the batch request execution is successful, each sub request will have a corresponding sub response in the response body.

> **Example**
>
> ```text
> --batchresponse_d878cedc-a0ad-4025-823e-5ee1aaffa288
> Content-Type:application/http
> Content-Transfer-Encoding:binary
> HTTP/1.1 200 OK
> Content-Type:application/json;odata=minimalmetadata;charset=utf-8
> Content-Length:14729
> <Json format Item(i001) Body>
> --batchresponse_d878cedc-a0ad-4025-823e-5ee1aaffa288
> Content-Type:multipart/mixed;boundary=changesetresponse_8bfb3c36-dbf7-46a0-
> bdfe-670bbac86eb2
> --changesetresponse_8bfb3c36-dbf7-46a0-bdfe-670bbac86eb2
> Content-Type:application/http
> Content-Transfer-Encoding:binary
> Content-ID:1
> HTTP/1.1 201 Created
> Content-Type:application/json;odata=minimalmetadata;charset=utf-8
> Content-Length:14641
> Location:https://databaseserver:50000/b1s/v1/Items('i002')
> <Json format Item(i002) Body>
> --changesetresponse_8bfb3c36-dbf7-46a0-bdfe-670bbac86eb2
> Content-Type:application/http
> Content-Transfer-Encoding:binary
> Content-ID:2
> HTTP/1.1 204 No Content
> --changesetresponse_8bfb3c36-dbf7-46a0-bdfe-670bbac86eb2--
> --batchresponse_d878cedc-a0ad-4025-823e-5ee1aaffa288--
> ```

- If the batch request execution is not successful, the batch will stop executing once a sub request fails. Note that when there is a failure in the change set, only one response returns for this change set, no matter how many sub requests exist in this change set. For example, in the example below, the `CREATE` item operation fails because an item with the same item code already exists in the database.

> **Example**
>
> ```text
> --batchresponse_3aa0885d-245c-4164-b9a4-9c27f7a2c4d1
> Content-Type:application/http
> Content-Transfer-Encoding:binary
> HTTP/1.1 200 OK
> Content-Type:application/json;odata=minimalmetadata;charset=utf-8
> Content-Length:14729
> <Json format Item(i001) Body>
> --batchresponse_3aa0885d-245c-4164-b9a4-9c27f7a2c4d1
> Content-Type:application/http
> Content-Transfer-Encoding:binary
> HTTP/1.1 400 Bad Request
> Content-Type:application/json;odata=minimalmetadata;charset=utf-8
> Content-Length:233
> {
>    "error" : {
>       "code" : -10,
>       "innererror" : {
>          "context" : null,
>          "trace" : null
>       },
>       "message" : {
>          "lang" : "en-us",
>          "value" : "Item code 'i002' already exists"
>       }
>    }
> }
> --batchresponse_3aa0885d-245c-4164-b9a4-9c27f7a2c4d1--
> ```

> **Example**
>
> **Create an order and cancel it in one transaction**
>
> ```http
> POST https://databaseserver:50000/b1s/v1/$batch
> content-type: multipart/mixed;boundary=batch_36522ad7-
> fc75-4b56-8c71-56071383e77b
> --batch_36522ad7-fc75-4b56-8c71-56071383e77b
> content-type: multipart/mixed;boundary=changeset_77162fcd-b8da-41ac-
> a9f8-9357efbbd
> --changeset_77162fcd-b8da-41ac-a9f8-9357efbbd
> content-type: application/http
> content-transfer-encoding:binary
> content-id: 1
> post orders
> host:host
>
> {
>   "cardcode": "c1",
>   "docduedate": "2017-07-20",
>   "documentlines": [
>     {
>       "itemcode": "i1",
>       "quantity": "1",
>       "taxcode": "t1",
>       "unitprice": "30"
>     }
>   ]
> }
> --changeset_77162fcd-b8da-41ac-a9f8-9357efbbd
> content-type: application/http
> content-transfer-encoding:binary
> post $1/cancel
> host: host
> --changeset_77162fcd-b8da-41ac-a9f8-9357efbbd--
> --batch_36522ad7-fc75-4b56-8c71-56071383e77b--
> ```
