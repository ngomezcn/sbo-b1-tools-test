---
title: Entity CRUD API
source: pdf pp. 121-123, sec 3.19.5.3
summary: The create, get, update and remove APIs on EntitySet and ServiceLayerContext, with a full CRUD script example.
---

# Entity CRUD API

Each exposed entity supports CRUD operations by default. The relevant APIs are packaged in the module `ServiceLayerContext.js`.

- For most cases, to perform CRUD operations on an entity, you first must create an entity instance, if the entity name is known in advance. Then call the following group of APIs defined in the prototype of `EntitySet`:

### Prototype of EntitySet

<!-- table: t121-01 -->
| API Name | API Description |
|---|---|
| `add(content, callback)` | Creates an entity by the content and the optional callback function on creation. |
| `get(key, callback)` | Retrieves an entity by the key and the optional callback function on retrieval. |
| `update(content, key, callback)` | Updates an entity by the content, key and the optional callback function on update. |
| `remove(key, callback)` | Removes an entity by the key and the optional callback function on removal. |
| `...` | ... |

- For the scenario where the entity name is not know in advance or the entity is a dynamically created UDO, you first must create a `ServiceLayerContext` instance. Then call the following group of APIs against this instance.

### Prototype of ServiceLayerContext

<!-- table: t122-01 -->
| API Name | API Description |
|---|---|
| `add(name, content, callback)` | Creates an entity by the name, content and the optional callback function on creation. |
| `get(name, key, callback)` | Retrieves an entity by the name, key, and the optional callback function on retrieval. |
| `update(name, content, key, callback)` | Updates an entity by the name, content and key and the optional callback function on update. |
| `remove(name, key, callback)` | Removes an entity by the name, key and the optional callback function on removal. |
| `...` | ... |

> **Example**
>
> To handle a request such as the one below,
>
> ```http
> POST /b1s/v1/script/mtcsys/test_items_more
> ```
>
> apply the following script:
>
> **Sample Code**
>
> ```javascript
> var ServiceLayerContext = require('ServiceLayerContext.js');
> var Item = require('EntityType/Item.js');
> var http = require('HttpModule.js');
> var test_item_code = "i001";
> function POST() {
>     var slContext = new ServiceLayerContext();
>     var ret = [];
>
>     var item = new Item();
>     item.ItemCode = test_item_code;
>
>     var dataSrvRes = slContext.Items.add(item);
>     if (!dataSrvRes.isOK()) {
>         throw http.ScriptException(http.HttpStatus.HTTP_BAD_REQUEST,
> "create entity failure")
>     }
>     ret.push({ "operation": dataSrvRes.operation, "status":
> dataSrvRes.status });
>
>     var key = test_item_code;
>     var dataSrvRes = slContext.Items.get(key);
>     if (!dataSrvRes.isOK()) {
>         throw
> http.ScriptException(http.HttpStatus.HTTP_INTERNAL_SERVER_ERROR,
> "retrieve entity failure")
>     }
>     ret.push({ "operation": dataSrvRes.operation, "status":
> dataSrvRes.status });
>
>     item.ItemName = 'new_item_name';
>     dataSrvRes = slContext.update("Items", item, key);//equivalent to
> slContext.Items.update(item, key);
>     if (!dataSrvRes.isOK()) {
>         throw
> http.ScriptException(http.HttpStatus.HTTP_INTERNAL_SERVER_ERROR,
> "update entity failure")
>     }
>     ret.push({ "operation": dataSrvRes.operation, "status":
> dataSrvRes.status });
>
>     dataSrvRes = slContext.remove("Items", key);//equivalent to
> slContext.Items.remove(key);
>     if (!dataSrvRes.isOK()) {
>         throw
> http.ScriptException(http.HttpStatus.HTTP_INTERNAL_SERVER_ERROR,
> "delete entity failure")
>     }
>     ret.push({ "operation": dataSrvRes.operation, "status":
> dataSrvRes.status });
>
>     http.response.send(http.HttpStatus.HTTP_OK, ret);
> }
> ```
>
> On success, Service Layer returns:
>
> **Output Code**
>
> ```http
> HTTP/1.1 200 OK
> [
>     {
>         "operation": "add",
>         "status": 201
>     },
>     {
>         "operation": "get",
>         "status": 200
>     },
>     {
>         "operation": "update",
>         "status": 204
>     },
>     {
>         "operation": "remove",
>         "status": 204
>     }
> ]
> ```
