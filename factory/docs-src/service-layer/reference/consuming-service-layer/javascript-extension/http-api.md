---
title: JavaScript SDK Overview, Http Request API and Http Response API
source: pdf pp. 119-121, sec 3.19.5, 3.19.5.1, 3.19.5.2
summary: What the JavaScript SDK offers, and the HttpModule.js request and response functions with a worked PATCH example.
---

# JavaScript SDK Overview, Http Request API and Http Response API

- [JavaScript SDK](#javascript-sdk)
- [Http Request API](#http-request-api)
- [Http Response API](#http-response-api)

## JavaScript SDK

Similar to the DIAPI, the JavaScript SDK is intended to provide a group of APIs for programmers to easily operate on business services and business Objects. The APIs consist of entity CRUD, entity query, transactions, exceptions and http request/response.

JavaScript, as a weak-typed programming language, has many built-in favorable dynamic features. However, for the sake of programming experience and coding efficiency, the JavaScript SDK is designed like a staticlanguage library, so as to make the most use of the auto-complete and IntelliSense functionalities provided by the modern IDE. The recommended one is the Visual Studio 2013/2015 with a `Node.js` plug-in.

Of course, you can also choose to program dynamically and enjoy the flexible features built-in with JavaScript.

> **Note**
>
> This SDK is designed to purposely follow the Common JavaScript Specification and approximates the Node.js grammar, which is exactly the reason why the `Node.js` plug-in is recommended.

## Http Request API

The http request functions listed below are packaged in the module `HttpModule.js`, which is an essential module, required to handle http requests.

<!-- table: t119-01 -->
| API Name | API Description |
|---|---|
| `getContet()` | Returns the raw content from the request payload. |
| `getJsonObject()` | Returns the JSON format of the request payload. |
| `getMethod()` | Returns the http Verb, e.g. GET, POST, PATCH, DELETE. |
| `getContentType()` | Returns the MIME type of the request body (e.g. APPLICA- TION/JSON) |
| `getParameter(name)` | Returns the value of a request parameter as a String, or null if the parameter does not exist. |
| `getParameterNames()` | Returns an array of String objects containing the names of the parameters contained in this request. |
| `getEntityKey()` | Returns the entity key from the URL resource part. |
| `getHeader(name)` | Returns the value of the specified request header as a String. |

## Http Response API

The http response functions listed below are packaged in the module `HttpModule.js`, which is an essential module, required to handle http response.

<!-- table: t120-01 -->
| API Name | API Description |
|---|---|
| `setHeader(name, value)` | Adds a response header with the given name and value. |
| `setContentType(contentType)` | Sets the content type of the response being sent to the client. |
| `setCharSet(charset)` | Sets the character encoding (MIME charset) of the response being sent to the client, for example, to UTF-8. |
| `setStatus(status)` | Sets the status code for this response. |
| `setContent(content)` | Sets the content in the response body |
| `send(status, content)` | Sends back the response to the client with the optional http status and content |

> **Example**
>
> To handle a request such as the one below,
>
> ```http
> PATCH /b1s/v1/script/mtcsys/items('i001')?key1=val1 & key2=val2
> DataServiceVersion:3.0
> {
>     "ItemName": "new name"
> }
> ```
>
> apply the following script:
>
> ```javascript
> var http = require('HttpModule.js');
> function PATCH() {
>     console.log("testing the http request and http response API...")
>
>     var ret = {};
>     ret.content = http.request.getJsonObj();
>     ret.method = http.request.getMethod();
>     ret.contentType = http.request.getContentType();
>     ret.dataServiceVersion = http.request.getHeader("DataServiceVersion");
>
>     ret.paramNames = http.request.getParameterNames();
>     if (ret.paramNames && ret.paramNames.length) {
>         ret.paramNames.forEach(function (param) {
>             ret[param] = http.request.getParameter(param);
>         });
>     }
>
>     ret.key = http.request.getEntityKey();
>
>     http.response.setContentType(http.ContentType.APPLICATION_JSON);
>     http.response.setStatus(http.HttpStatus.HTTP_OK);
>     http.response.setContent(ret);
>     http.response.send();
> }
> ```
>
> On success, Service Layer returns:
>
> ```http
> HTTP/1.1 200 OK
> {
>     "content": {
>         "ItemName": "new name"
>     },
>     "method": "PATCH",
>     "contentType": "text/plain;charset=UTF-8",
>     "dataServiceVersion": "3.0",
>     "paramNames": [
>         "key1",
>         "key2"
>     ],
>     "key1": "val1",
>     "key2": "val2",
>     "key": "'i001'"
> }
> ```

> **Note**
>
> - Similar to `Node.js`, `require` is a global function to import a module and return a reference to that module. The above example indicates `http` is a reference of the module `HttpModule.js.`
> - `request` and `response` are two members of `http`, representing a pre-created `HttpRequest` instance and an `HttpResponse` instance, respectively.
> - To facilitate HTTP programming, module `HttpModule.js` also defines HTTP utility constants, for example, `HttpStatus`, `ContentType`.
