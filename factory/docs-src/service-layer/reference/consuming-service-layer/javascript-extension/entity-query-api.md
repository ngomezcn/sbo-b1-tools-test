---
title: Entity Query API
source: pdf pp. 123-125, sec 3.19.5.4
summary: The query and count APIs on EntitySet and ServiceLayerContext, case-insensitive queries on SAP HANA, and script and B1S-CaseInsensitive examples.
---

# Entity Query API

Query APIs are packaged in the module `ServiceLayerContext.js`, and similar to the CRUD API, they are defined both on the `EntitySet` and the `ServiceLayerContext` prototype.

### Prototype of EntitySet

<!-- table: t123-01 -->
| API Name | API Description |
|---|---|
| `query(queryOption, isCaseInsensitive)` | Performs a case-sensitive or case-insensitive query and return the entities satisfying the query options. |
| `count(queryOption, isCaseInsensitive)` | Performs a case-sensitive or case-insensitive query and return the number of the entities satisfying the query options. |
| `...` | ... |

### Prototype of ServiceLayerContext

<!-- table: t124-02 -->
| API Name | API Name API Description |
|---|---|
| `query(name, queryOption, isCaseInsensitive)` | Performs a case-sensitive or case-insensitive query and return the entities with the given name and satisfying the query options. |
| `count(name, queryOption, isCaseInsensitive)` | Performs a case-sensitive or case-insensitive query and return the number of the entities with the given name and satisfying the query options. |
| `...` | ... |

> **Note**
>
> The paramenter `isCaseInsensitive` is for SAP HANA database only. If you are working with SAP HANA database, by default, the query is case-sensitive, due to the default Unicode collation for SAP HANA database. Specifying the flag `isCaseInsensitive` as true would issue a case insensitive query. However, the query performance would not be as efficient as with a case-insensitive query.
>
> As of SAP Business One 9.2 PL07, version for SAP HANA, case-insensitive query is supported.

> **Example**
>
> To handle a request such as the one below,
>
> ```http
> GET /b1s/v1/script/mtcsys/test_query_businesspartner
> ```
>
> apply the following script:apply the following script:
>
> ```javascript
> var ServiceLayerContext = require('ServiceLayerContext.js');
> var http = require('HttpModule.js');
> function GET() {
>     var queryOption = "$select=CardName, CardCode &
> $filter=contains(CardCode, 'c1') & $top=5 & $orderby=CardCode";
>     var slContext = new ServiceLayerContext();
>     var retCaseSensitive = slContext.BusinessPartners.query(queryOption);
>     var retCaseInsensitive = slContext.query("BusinessPartners", queryOption,
> true);
>     http.response.setStatus(http.HttpStatus.HTTP_OK);
>     http.response.setContent({ "CaseSensitive": retCaseSensitive.toArray(),
> "CaseInsensitive": retCaseInsensitive.toArray() });
>     http.response.send();
> }
> ```
>
> On Success, Service Layer returns:
>
> **Output Code**
>
> ```http
> HTTP/1.1 200 OK
> {
>     "CaseSensitive": [
>         {
>             "CardCode": "c1",
>             "CardName": "customer c11"
>         }
>     ],
>     "CaseInsensitive": [
>         {
>             "CardCode": "c1",
>             "CardName": "customer c11"
>         },
>         {
>             "CardCode": "C11",
>             "CardName": null
>         },
>         {
>             "CardCode": "C12",
>             "CardName": null
>         }
>     ]
> }
> ```

> **Example**
>
> To handle a case insensitive request:
>
> ```http
> GET /b1s/v1/BusinessPartners?$filter=contains(CardCode,
> 'c2')&$select=CardCode
> B1S-CaseInsensitive: true
> ```
>
> On success, Service Layer returns:
>
> **Output Code**
>
> ```http
> HTTP/1.1 200 OK
> {
>     "value": [
>         {
>             "CardCode": "C20000"
>         },
>         {
>             "CardCode": "C23900"
>         },
>         {
>             "CardCode": "c21"
>         },
>         {
>             "CardCode": "c22"
>         }
>     ]
> }
> ```
