---
title: Error response body
source: external OData: oasis-json@v4.01-os 21.1 + oasis-p1@v4.01-os 9.4; retrieved 2026-10-02
summary: What an OData error response body contains (error object with code, message, target, details, innererror), which parts are required, and the Content-Language rule.
---
# Error response body

In Service Layer: reference/sql-query/query-errors.md; reference/etag/etag-usage.md; reference/consuming-service-layer/batch-operations.md ; SL differs: in SQL Query errors (reference/sql-query/query-errors.md) the code is numeric and the message is an object {lang, value}

## Structure

The error response MUST be a single JSON object with a single name/value pair named `error`. Its value is an OData error object.

The OData error object MUST contain `code` and `message`. It MAY contain `target`, `details` and `innererror`. Error responses MAY contain annotations in any of their JSON objects.

| Member | Required | Value |
|---|---|---|
| `code` | MUST | Non-empty, language-independent string; a service-defined error code that serves as a sub-status for the HTTP error code of the response. Cannot be `null`. |
| `message` | MUST | Non-empty, language-dependent, human-readable string describing the error. Cannot be `null`. |
| `target` | MAY | Potentially empty string indicating the target of the error (for example, the name of the property in error). Can be `null`. |
| `details` | MAY | Potentially empty array of JSON objects; each MUST contain `code` and `message`, and MAY contain `target`, following the same rules. |
| `innererror` | MAY | Object with service-defined content; usually information that helps debug the service. |

The `Content-Language` header MUST contain the language code from [RFC5646] corresponding to the language in which the value of `message` is written.

Service implementations SHOULD carefully consider which information to include in production environments to guard against potential security concerns around information disclosure.

Example 54:

```json
{
  "error": {
    "code": "err123",
    "message": "Unsupported functionality",
    "target": "query",
    "details": [
      {
       "code": "forty-two",
       "target": "$search",
       "message": "$search query option not supported"
      }
    ],
    "innererror": {
      "trace": [...],
      "context": {...}
    }
  }
}
```
