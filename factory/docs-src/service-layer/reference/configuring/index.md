# Configuring

## [Service Layer Controller and settings](service-layer-controller-settings.md)
Use when: opening the Service Layer Controller, managing load balancer nodes (members, status, Apache algorithms), or setting Service Layer options from its Service Layer Settings tab (CORS, request and response logs, log levels, session timeout, access log, sticky session, core dump).
Terms: `conf/b1s.conf`, `/ServiceLayerController`, `CorsEnable`, `CorsAllowedOrigins`, `SessionTimeout`, `B1S-CaseInsensitive`, `LogFormat`, `httpd-b1s-lb.conf`, Node Management
Sections: [Managing Service Layer Settings](service-layer-controller-settings.md#managing-service-layer-settings) · [Node Management](service-layer-controller-settings.md#node-management) · [Service Layer Configuration](service-layer-controller-settings.md#service-layer-configuration)
Not here: sticky sessions and load balancing concepts → [high-availability-load-balancing](../high-availability-load-balancing/index.md)

## [Other Configuration Options for Service Layer](b1s-conf-options.md)
Use when: editing options directly in `b1s.conf` (schema file name, audience validation, CORS and similar options).
Terms: `b1s.conf`, `EnableAudienceValidation`, default schema, `CorsEnable`
Not here: using CORS from a browser → [cors](../consuming-service-layer/cors.md); schema files → [user-defined-schemas](../consuming-service-layer/user-defined-schemas.md)

## [Configuration by Request](configuration-by-request.md)
Use when: changing behaviour for a single request with HTTP headers.
Terms: `B1S-WCFCompatible`, `B1S-PageSize`, request headers
Not here: server-wide settings → [b1s-conf-options](b1s-conf-options.md); webhook configuration → [webhooks](../webhooks/index.md)

## [Service Layer Log File Configuration](log-file-configuration.md)
Use when: enabling, configuring, locating or collecting Service Layer log files for troubleshooting (access, error, SSL, request and response, OBServer debug and performance, core dump), or reading the format of an access, error or SSL log entry.
Terms: `access_${SL_LB_PORT}_log`, `error_${SL_LB_PORT}_log`, `ssl_${SL_LB_PORT}_request_log`, `dumphttp.log`, `httpd.servicelayer`, `httpd.b1logger`, `b1LogConfig.xml`, `httpd-b1s-lb.conf`, `LogLevel`, Enable Access Log, Core Dump, Download Logs, KBA 3157498
Sections: [Access Logs](log-file-configuration.md#1-service-layer-access-logs) · [Error Logs](log-file-configuration.md#2-service-layer-error-logs) · [SSL Logs](log-file-configuration.md#3-service-layer-ssl-logs) · [Request and Response Logs](log-file-configuration.md#4-service-layer-request-and-response-logs) · [OBServer Debug Logs](log-file-configuration.md#5-observer-debug-logs-for-service-layer) · [OBServer Performance Logs](log-file-configuration.md#6-observer-performance-logs-for-service-layer) · [Core Dump](log-file-configuration.md#7-service-layer-core-dump)
Not here: reading request logs in the Controller Monitor tab → [monitoring-logs](monitoring-logs.md); SQL query log modification → [sql-query](../sql-query/index.md)

## [Monitoring Service Layer Logs](monitoring-logs.md)
Use when: reading normal and error request logs in the Service Layer Controller, viewing request/response details, or enabling detailed logs.
Terms: Monitor tab, Duration, normal request, error request, Request & Response Logs
Sections: [List view of normal requests](monitoring-logs.md#list-view-of-normal-requests) · [Detailed view of normal requests](monitoring-logs.md#detailed-view-of-normal-requests) · [List view of error requests](monitoring-logs.md#list-view-of-error-requests) · [Detailed view of error requests](monitoring-logs.md#detailed-view-of-error-requests) · [Request/Response detailed logs](monitoring-logs.md#requestresponse-detailed-logs)
Not here: SQL query log modification → [sql-query](../sql-query/index.md)
