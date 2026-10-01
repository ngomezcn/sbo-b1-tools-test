---
title: Exception API
source: pdf pp. 127-129, sec 3.19.5.6
summary: How Service Layer reports compile exceptions, runtime exceptions and user exceptions thrown with ScriptException in scripts.
---

# Exception API

- [Compile Exception](#compile-exception)
- [Runtime Exception](#runtime-exception)
- [User Exception](#user-exception)

## Compile Exception

Service Layer responds with an error message to the client if there is a compilation error in a user's script.

> **Example**
>
> ```javascript
> var Document = require('EntityType/Document.js');
> //type mistake: ';' should be ','
> var line = Document.DocumentLine.create({
>     ItemCode: 'i001'; Quantity: 2, UnitPrice: 10
> });
> var lines = new Document.DocumentLineCollection();
> lines.add(line);
> The above code would result in an error message such as the one below:
> {
>   "error": {
>     "code": 511,
>     "message": {
>       "lang": "en-us",
>       "value": "Script error: compile error [SyntaxError: Unexpected
> token ;]."
>     }
>   }
> }
> ```

## Runtime Exception

Service Layer responds with an error message to the client if there is a runtime error in a user's script.

> **Example**
>
> ```javascript
> var ServiceLayerContext = require('ServiceLayerContext.js');
> //var Bank = require('EntityType/Bank.js');
> var bank = new Bank();
> bank.BankCode = 'bank01';
> var res = new ServiceLayerContext().Banks.add(bank);
> if (!res.isOK) {
> }
> ```
>
> The above code would result in an error message such as the one below:
>
> ```http
> HTTP/1.1 400 Bad Request
> {
>   "error": {
>     "code": 512,
>     "message": {
>       "lang": "en-us",
>       "value": "Script error: runtime error [ReferenceError: Bank is not
> defined]."
>     }
>   }
> }
> ```

## User Exception

Service Layer also allows users to explicitly propagate exceptions by throwing `ScriptException` exported from the http module.

> **Example**
>
> ```javascript
> var ServiceLayerContext = require('ServiceLayerContext.js');
> var Order = require('EntityType/Document.js');
> var http = require('HttpModule.js');
> var slContext = new ServiceLayerContext();
> var res = slContext.Orders.get(10000);
> if (!res.isOK()) {
>     throw new http.ScriptException(http.HttpStatus.HTTP_NOT_FOUND, "the given
> order is not found");
> }
> ```
>
> The above code would result in an error message such as the one below:
>
> ```http
> HTTP/1.1 404 Not Found
> {
>   "error": {
>     "code": 600,
>     "message": {
>       "lang": "en-us",
>       "value": "the given order not found"
>     }
>   }
> }
> ```
