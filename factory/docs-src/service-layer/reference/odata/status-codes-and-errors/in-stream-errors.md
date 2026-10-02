---
title: In-stream errors
source: external OData: oasis-json@v4.01-os 21.2 + oasis-p1@v4.01-os 9.5; retrieved 2026-10-02
summary: What happens when a service fails after already sending a success status, and how the OData-Error trailing header carries the error.
---
# In-stream errors

In Service Layer: no equivalent hoja

If the service encounters an error after sending a success status to the client, the service MUST leave the response malformed. This can be achieved by immediately stopping response serialization and thus omitting (among others) the end-object character of the top-level JSON object in the response. Clients MUST treat the entire response as being in error.

Services MAY include the header `OData-Error` as a trailing header if supported by the transport protocol (e.g. with HTTP/1.1 and chunked transfer encoding, or with HTTP/2), see [OData-Protocol].

The value of the `OData-Error` trailing header is an OData error object as defined in Error response body, represented in a header-appropriate way:

- All optional whitespace (indentation and line breaks) is removed, especially (in hex notation) `09`, `0A` and `0D`
- Control characters (`00` to `1F` and `7F`) and Unicode characters beyond `00FF` within JSON strings are encoded as `\uXXXX` or `\uXXXX\uXXXX` (see [RFC8259], section 7)

Example 55: note that this is one HTTP header line without any line breaks or optional whitespace

```text
OData-error: {"code":"err123","message":"Unsupported functionality","target":"query","details":[{"code":"forty-two","target":"$search","message":"$search query option not supported"}]}
```
