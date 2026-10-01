---
title: "ETag usage: introduction and scenarios"
source: pdf pp. 161-164, sec 5, 5.1, 5.2
summary: What ETag and optimistic concurrency are in the Service Layer, and how ETag and If-Match behave on entity creation, retrieval, update, delete and action requests.
---

# ETag usage: introduction and scenarios

- [ETag Introduction](#etag-introduction)
- [ETag Scenarios](#etag-scenarios)

## ETag Introduction

Optimistic concurrency control is a concurrency methodology typically applied to transactional systems. It is generally used in relational database management systems with rare data update conflicts, in which transactions can complete without the expense of managing locks, leading to a higher throughput.

Although the stateless nature of HTTP makes locking infeasible for web user interfaces, HTTP does provide an alternative form of built-in optimistic concurrency control. The response to an initial `GET` request can include an ETag for subsequent `PATCH` requests to use in the `If-Match` header. Any `PATCH` requests with an out-of-date ETag in the `If-Match` header can then be rejected.

In HTTP protocol, ETag is short for entity tag and is used for identifying specific versions of a resource. It is an opaque identifier whose exact values are implementation dependent. ETag values occur in two varieties: strong and weak validation. For more information about ETag, see https://msdn.microsoft.com/library/dd541486.aspx.

In the Service Layer, we use weak validation, which guarantees the resource representation is semantically equivalent to the same ETag value. The format is as follows:

```text
ETag: W/"hashed string"
```

As of SAP Business One 10.0 FP 2102, the Service Layer can support Etag mechanisms compliant with the OData spec, mainly for the purpose of avoiding blind concurrent updates on an object.

## ETag Scenarios

### ETag in Entity Creation

For this scenario, the ETag information is available in the response, reflecting the version of the newly created resource in a hashed string.

For example, send such a request to create an item:

```http
POST https://hanaserver:50000/b1s/v2/Items HTTP/1.1
Content-Type: text/plain;charset=UTF-8
{"ItemCode": "i002"}
```

Upon success, the Service Layer responds with the ETag in the response header and body.

```http
HTTP/1.1 201 Created
Location: https://hanaserver:50000/b1s/v2/Items('i002')
ETag: W/"356A192B7913B04C54574D18C28D46E6395428AB"
{
    "@odata.context" : "https://hanaserver:50000/b1s/v2/$metadata#Items/$entity",
    "@odata.etag" : "W/\"356A192B7913B04C54574D18C28D46E6395428AB\"",
    "ItemCode" : "i002",
    "ItemName" : null,
    ...
}
```

### ETag in Entity Retrieval

The ETag can be applied to the entity retrieval scenario as well and allows you to get the latest resource version.

For example, send such a request to retrieve an item:

```http
GET https://hanaserver:50000/b1s/v2/Items('i002') HTTP/1.1
```

Upon success, the Service Layer responds with the ETag in the response header and body.

```http
HTTP/1.1 200 OK
ETag: W/"356A192B7913B04C54574D18C28D46E6395428AB"
{
    "@odata.context" : "https://hanaserver:50000/b1s/v2/$metadata#Items/$entity",
    "@odata.etag" : "W/\"356A192B7913B04C54574D18C28D46E6395428AB\"",
    "ItemCode" : "i002",
    "ItemName" : null,
    ...
}
```

### ETag in Entity Update

The default behavior when you PATCH an entity is to directly change the entity, no matter whether the entity has already been changed by someone else. However, for most scenarios, just like theSAP Business One client, we do not want this override behavior to happen.

To achieve this, we need to specify the `If-Match` header with the value of the ETag in the request. In this way, the Service Layer would prevent the override from happening by returning an error message.

For example, assume the item with key 'i002' is changed by somebody just before you send a PATCH request:

```http
PATCH https://hanaserver:50000/b1s/v2/Items('i002') HTTP/1.1
If-Match: W/"356A192B7913B04C54574D18C28D46E6395428AB"
{"ItemName": "name2"}
```

The Service Layer responds:

```http
HTTP/1.1 412 Precondition Failed
Content-Type: application/json;charset=utf-8
{
    "error": {
        "code": "-2039",
        "message": "Another user or another operation modified data; to
continue, open the window again (ODBC -2039)"
    }
}
```

If no changes happen, the Service Layer responds with the following, indicating that the update is successful:

```http
HTTP/1.1 204 No Content
```

### ETag in Entity Delete

The default behavior when you DELETE an entity is to directly delete the entity if the entity exists or to return a 404 error, indicating the entity is Not Found. For some scenarios, you just want to delete an entity with a specific version and prompt up an error message if the version does not exist. To achieve this, specify the `If-Match` header with the value of the ETag in the request.

For example, you send a request to get an item as follows:

```http
GET https://hanaserver:50000/b1s/v2/Items('i002') HTTP/1.1
```

Upon success, the Service Layer responds:

```http
HTTP/1.1 200 OK
Content-Type: application/json;charset=utf-8
{
    "@odata.context": "https://hanaserver:50000/b1s/v2/$metadata#Items/$entity",
    "@odata.etag": "W/\"356A192B7913B04C54574D18C28D46E6395428AB\"",
    "ItemCode": "i002",
    "ItemName": "i002",
    ...
}
```

Then another user happens to send a PATCH request to update this item:

```http
PATCH https://hanaserver:50000/b1s/v2/Items('i002') HTTP/1.1
{
    "ItemName": "new name"
}
```

After you check some basic information with this item, you send a request to delete this item with ETag:

```http
DELETE https://hanaserver:50000/b1s/v2/Items('i002') HTTP/1.1
If-Match: W/"356A192B7913B04C54574D18C28D46E6395428AB"
```

The Service Layer responds with the following error message as the entity you wish to delete has already been updated by others:

```http
HTTP/1.1 412 Precondition Failed
Content-Type: application/json;charset=utf-8
{
    "error": {
        "code": "-2039",
        "message": "Another user or another operation modified data; to
continue, open the window again (ODBC -2039)"
    }
}
```

### ETag in Entity Action

The default behavior of a bindable action is to directly apply the action to the bound entity, no matter if the entity has already been changed by someone else.

However, for some scenarios, you just want to do the action on an entity with a specific version and expect the service to return an error message if the version does not exist or was updated by another. To achieve this, specify the `If-Match` header with the value of the ETag in the request.

For example, you send a request to get an order as follows:

```http
GET https://hanaserver:50000/b1s/v2/Orders(8) HTTP/1.1
```

Upon success, the Service Layer responds:

```http
HTTP/1.1 200 OK
Content-Type: application/json;charset=utf-8
{
    "@odata.context": "https://hanaserver:50000/b1s/v2/$metadata#Orders/$entity",
    "@odata.etag": "W/\"356A192B7913B04C54574D18C28D46E6395428AB\"",
    "DocEntry": 8,
    "DocNum": 8,
    ...
}
```

Then another user happens to send a PATCH request to update this order:

```http
PATCH https://hanaserver:50000/b1s/v2/Orders(8) HTTP/1.1
{
    "Comments": "it is my order"
}
```

After you check some basic information with this order, you send a request to cancel this order with the ETag:

```http
POST https://hanaserver:50000/b1s/v2/Orders(8)/Cancel HTTP/1.1
If-Match: W/"356A192B7913B04C54574D18C28D46E6395428AB"
```

The Service Layer responds with the following error message as the entity to cancel has already been updated by others:

```http
HTTP/1.1 412 Precondition Failed
Content-Type: application/json;charset=utf-8
{
    "error": {
        "code": "-2039",
        "message": "Another user or another operation modified data; to
continue, open the window again (ODBC -2039)"
    }
}
```
