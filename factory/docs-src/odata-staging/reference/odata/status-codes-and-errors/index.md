# Status codes and errors

## [HTTP status codes](status-codes.md)
Use when: interpreting 200/201/202/204, 3xx/304, 404/405/406/410/412/424, or 501 in an OData response.
Terms: `200`, `201`, `202`, `204`, `304`, `404`, `405`, `412`, `424`, `501`
Not here: error JSON body → [error-response](error-response.md)

## [Error response body](error-response.md)
Use when: reading the `error` object (`code`, `message`, `target`, `details`, `innererror`) after a failed request.
Terms: `error`, `code`, `message`, `target`, `details`, `innererror`, `Content-Language`
Not here: status code meanings → [status-codes](status-codes.md)

## [In-stream errors](in-stream-errors.md)
Use when: a response started with success status but the payload is cut off, or the trailing `OData-Error` header appears.
Terms: `OData-Error`, in-stream error, truncated payload
Not here: normal error bodies → [error-response](error-response.md)
