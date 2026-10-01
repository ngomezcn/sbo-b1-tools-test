---
title: Other Configuration Options for Service Layer
source: pdf pp. 174-174, sec 6.2
summary: The options of the b1s.conf file that control Service Layer behavior (Server, SLDAddress, Schema, PageSize, EnableAudienceValidation).
---

# Other Configuration Options for Service Layer

You can also specify the configuration options to control the behavior of the service in the file `/ ServiceLayer/conf/b1s.conf`. The file is in the JSON format and the options are case-sensitive. Once you save the changes, all configuration options take effect after you restart Service Layer.

> **Note**
>
> The configuration file applies only to local Service Layer components. If you have installed some load balancer members on different machines from the load balancer, you must ensure a copy of the schema file exists also on each member machine.

<!-- table: t174-01 -->
- `Server`
  - **Type**: String
  - **Description and Default Values**: The database server.
- `SLDAddress`
  - **Type**: String
  - **Description and Default Values**: This option takes effect as of 9.1 patch level 05 for working with the license server and the SLD server. The license server and the SLD server share the same address.
- `Schema`
  - **Type**: String
  - **Description and Default Values**:

    Available as of 9.1 patch level 03.

    The value is a file name under the conf folder, which defines the required properties for each type in metadata. For more information, see [User-Defined Schemas](../consuming-service-layer/user-defined-schemas.md) [page 84].

    Default value is empty.

- `PageSize`
  - **Type**: Integer
  - **Description and Default Values**:

    Defines the page size when paging is applied for a query.

    Default value is 20.

- `EnableAudienceValidation`
  - **Description and Default Values**: This configuration determines whether the audience claim in a token should be validated when the token is issued by extensions, such as Single Page Applications (SPAs). By default, audience validation is enabled (set to true), ensuring that only tokens intended for the application are accepted. You can set this option to false if you do not want to validate the audience, for example, in development or testing environments.
