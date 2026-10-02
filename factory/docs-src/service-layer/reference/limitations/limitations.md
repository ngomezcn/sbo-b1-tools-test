---
title: Service Layer limitations
source: pdf pp. 225-225, sec 8, 8.1, 8.2
summary: What Service Layer does not support, both in its OData protocol implementation and compared with the SAP Business One DI API.
---

# Service Layer limitations

This section lists the limitations of SAP Business One Service Layer.

## OData Protocol Implementation Limitations

In the OData protocol implementation perspective, the Service Layer has the following limitations:

- OData Version 1.0 and OData Version 2.0 are not supported.
- Request/Response of XML format is not supported for the general entity CRUD operations.
- Accessing the property of a complex type is not allowed (details in section [Retrieving Individual Properties](../consuming-service-layer/individual-properties.md)).
- Managing values and properties directly is not supported.
- OData-batch: rollback, an OData batch operation, is not supported.
- Metadata option `odata=fullmetadata` for OData version 3 is not supported.
- Metadata option `odata.metadata=full` for OData version 4 is not supported.
- OData-query: arithmetic operators (for example, add/sub/mul/div/mod) in OData queries are not supported yet.
- OData-query: some OData query functions are not supported yet, for example, data functions, math functions, type case functions, string functions. For the standard OData query options and expressions, see [Query options overview](../odata/query-options/query-options-overview.md).

## Functional Limitations versus SAP Business One DI API

Compared to the functionalities of SAP Business One DI API, Service Layer has the following limitations:

- Business object RecordSet (direct SQL) is not supported.
- Service Layer does not support the operation of ImportFromXML and ExportToXML.
- Newly created UDO/UDF/UDT is not accessible unless Service Layer is restarted.
- User transactions are not supported. There is no DI-like operation StartTransaction/EndTransaction. Transactions are internally used in each request (including OData batch request), but they cannot cross requests.

> **Note**
>
> Service layer does not support JSONP, since this feature is optional.
