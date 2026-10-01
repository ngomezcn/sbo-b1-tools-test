---
title: Paginate the Selected Orders
source: pdf pp. 34-35, sec 3.6.6
summary: How Service Layer paginates results with top and skip, the odata.nextLink annotation, and how to change the page size.
---

# Paginate the Selected Orders

The pagination mechanism is implemented through top and skip. It allows the data to be fetched chunk by chunk. For example, after you send the HTTP request:

```http
GET /Orders
```

The service returns:

```http
HTTP/1.1 200 OK
{
    "value": [
        {"DocEntry": 7,"DocNum": 2,...},
        {"DocEntry": 8,"DocNum": 3,...},
        ...
        {"DocEntry": 26,"DocNum": 21,...}
    ],
    "odata.nextLink": "/b1s/v1/Orders?$skip=20"
}
```

Annotation `odata.nextLink` is contained in the body for the link of the next chunk.

> **Note**
>
> For OData V3, the next link annotation is `odata.nextLink`; For OData V4, the next link annotation is `@odata.nextLink`.
>
> The default page size is 20. You can customize the page size by changing the following options:
>
> - Set the configuration option `PageSize` in `conf/b1s.conf`.
> - Use the OData recommended annotation `odata.maxpagesize` in the `Prefer` header of the request:
>
> ```http
> GET /Orders
> Prefer:odata.maxpagesize=50
> ... (other headers)
> ```
>
> The response contains HTTP header `Preference-Applied` to indicate whether and how the request is accepted:
>
> ```http
> HTTP/1.1 200 OK
> Preference-Applied: odata.maxpagesize=50
> ...
> ```
>
> If `PageSize` or `odata.maxpagesize` is set to 0, the pagination mechanism is turned off.
>
> The by-request option `odata.maxpagesize` is prior to the configuration option `PageSize`.
