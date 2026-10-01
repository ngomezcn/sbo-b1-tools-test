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

## [Monitoring Service Layer Logs](monitoring-logs.md)
Use when: reading normal and error request logs in the Service Layer Controller, viewing request/response details, or enabling detailed logs.
Terms: Monitor tab, Duration, normal request, error request, Request & Response Logs
Sections: [List view of normal requests](monitoring-logs.md#list-view-of-normal-requests) · [Detailed view of normal requests](monitoring-logs.md#detailed-view-of-normal-requests) · [List view of error requests](monitoring-logs.md#list-view-of-error-requests) · [Detailed view of error requests](monitoring-logs.md#detailed-view-of-error-requests) · [Request/Response detailed logs](monitoring-logs.md#requestresponse-detailed-logs)
Not here: SQL query log modification → [sql-query](../sql-query/index.md)
