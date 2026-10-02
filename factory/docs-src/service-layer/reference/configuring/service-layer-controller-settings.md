---
title: Service Layer Controller and settings
source: pdf pp. 167-173, sec 6, 6.1
summary: The SAP Business One Service Layer Controller, its Service Layer Settings tab, the load balancer node management fields and the Service Layer configuration options (CORS, logs, session, access log, sticky session).
---

# Service Layer Controller and settings

- [Managing Service Layer Settings](#managing-service-layer-settings)
- [Node Management](#node-management)
- [Service Layer Configuration](#service-layer-configuration)

The installation wizard sets the common configuration options when you install the Service Layer load balancer or balancer members. The configuration options are in the configuration file `conf/b1s.conf`.

As of SAP Business One 10.0 (PL00 for SAP HANA version and PL02 for Microsoft SQL version), a configuration controller for Service Layer is available. It provides a user-friendly interface to update configuration parameters and have them take effect.

> **Note**
>
> In SAP Business One (Microsoft SQL version), before you use the controller, run the Windows PowerShell execution policy check, and make sure that the execution policy is "Unrestricted". To do so, perform the following:
>
> Open Windows PowerShell (64bit), and use the `Get-ExecutionPolicy` command to check the current execution policy. If it is not “Unrestricted”, use the `Set-ExecutionPolicy Unrestricted` command to set it.

You can access the SAP Business One Service Layer Controller after you install the Service Layer, using the URL `https://<Server Name/IP>:<port>/ServiceLayerController`.

In the SAP Business One Service Layer Controller, you can:

- [Managing Service Layer Settings](#managing-service-layer-settings)
- [Monitoring Service Layer Logs](monitoring-logs.md)

> **Note**
>
> **Limitation**: Service Layer Controller does not support managing all nodes in distribution installation mode (that is, some nodes are installed on one machine, while the load balancer is installed on another machine). This limitation applies for both the SAP HANA version and the Microsoft SQL version.

## Managing Service Layer Settings

On the *Service Layer Settings* tab of the SAP Business One Service Layer Controller, you can:

- Stop or force restart of the Service Layer service.
- Dynamically add and remove Service Layer nodes.
- Specify the configuration options to control the behavior of Service Layer.
- Download Service Layer logs and dump files.

> **Note**
>
> As a configuration controller for the Service Layer, it allows you to add and remove Service Layer nodes. For the Service Layer running on SAP HANA, it is installed as a series of Linux services named `b1s` and `b1s<port>`. The Apache HTTP Web server's `httpd` programs automatically run as daemons, executing continuously in the background. These daemons handle requests based on the load balancer nodes configured in the landscape, ensuring optimal performance and resource utilization.
>
> Additionally, some commonly used Linux tools, such as `ps`, `ss`, `grep`, and `awk` will be utilized to fetch and filter dynamic information from the cache or files maintained by the OS, or from the configuration files of the Service Layer. These processes are transient, the parent process of these transient processes can be identified through programmatic means, such as scripts or other methods. In the configuration controller, these tools will be used periodically to refresh the information at intervals, with the frequency depending on the configuration. These tools only fetch read-only information for viewing and do not make any changes to the system or configuration files. The lifespan of these processes is very short each time, so the usage of these tools will not introduce potential damage to the system or cause other performance issues.

## Node Management

<!-- table: t168-01 -->
- **Option**: `Max Members`
  - **Description and Default Values**: Number of members configured for the balancer.
- **Option**: `Sticky Session`
  - **Description and Default Values**:

    Sticky Session status. It can be enabled/disabled from the configuration section.

    If enabled, it is set to ON, else OFF.

- **Option**: `Disable Failover`
  - **Description and Default Values**:

    Default: Off

    Cannot be modified.

- **Option**: `Timeout`
  - **Description and Default Values**:

    Balancer timeout in seconds. If set, this will be the maximum time to wait for a free worker.

    Default: 0

    The default is to not wait and cannot be modified.

- **Option**: `Failover Attempts`
  - **Description and Default Values**:

    Maximum number of failovers attempts before giving up.

    Default: One less than the number of workers or 1 with a single worker.

- **Option**: `Method`
  - **Description and Default Values**:

    Load balancer scheduler algorithm.

    Default: Bybusyness

- **Option**: `Active`
  - **Description and Default Values**:

    Yes. If load balancer service is running.

    No. If load balancer service is stopped.

    Default: Yes

- **Option**: `Worker URL`
  - **Description and Default Values**: Lists the members to a load balancing group.
- **Option**: `RouteRedir`
  - **Description and Default Values**: Redirection Route of the worker.
- **Option**: `Factor`
  - **Description and Default Values**: This is the member load factor - a decimal number between 1.0 (default) and 100.0, which defines the weighted load to be applied to the member.
- **Option**: `Status`
  - **Description and Default Values**:

    - Ok: Worker is available
    - Init: Worker has been initialized
    - Dis: Worker is disabled and will not accept any requests; will be automatically retried.
    - Stop: Worker is administratively stopped; will not accept requests and will not be automatically retried
    - Ign: Worker is in ignore-errors mode and will always be considered available.
    - Spar: Worker is a hot spare. For each worker in a given lbset that is unusable (draining, stopped, in error, etc.), a usable hot spare with the same lbset will be used in its place. Hot spares can help ensure that a specific number of workers are always available for use by a balancer.
    - Stby: Worker is in hot-standby mode and will only be used if no other viable workers or spares are available in the balancer set.
    - Err: Worker is in an error state, usually due to failing pre-request check; requests will not be proxied to this worker, but it will be retried depending on the retry setting of the worker.
    - Drn: Worker is in drain mode and will only accept existing sticky sessions destined for itself and ignore all other requests.
    - HcFl: Worker has failed dynamic health check and will not be used until it passes subsequent health checks.

- **Option**: `Set`
  - **Description and Default Values**: Shows the load balancer cluster set that the worker is a member of.
- **Option**: `Elected`
  - **Description and Default Values**: Number of requests processed by the member after restart of the service.
- **Option**: `Busy`
  - **Description and Default Values**: Indicates whether the member is busy processing the request. If the member is busy, then it shows 1 else 0.
- **Option**: `Load`
  - **Description and Default Values**: Shows how many requests each worker is currently assigned, based on the Apache `bybusyness` load balancing algorithm (Pending Request Counting, provided by `mod_lbmethod_bybusyness` for `mod_proxy_balancer`). It is enabled via `lbmethod=bybusyness`. The scheduler keeps track of how many requests each worker is currently assigned, and a new request is automatically assigned to the worker with the lowest number of active requests. This is useful for workers that queue incoming requests independently of Apache: it keeps queue length even and gives each request to the worker most likely to service it fastest, reducing latency. When several workers are equally least busy, the statistics and weightings used by the Request Counting method (`byrequests`) break the tie, so over time the distribution of work resembles that of `byrequests`.
- **Option**: `From`
  - **Description and Default Values**: Data outflow (size) – Usually this is the response size.
- **Option**: `To`
  - **Description and Default Values**: Data inflow (size) – Usually this is the request size.

> **Note**
>
> All above definitions are based on the Apache HTTP Server documentation (`mod_proxy_balancer` and its load balancing modules).

## Service Layer Configuration

<!-- table: t170-01 -->
- **Option**: `CorsEnable`
  - **Description and Default Values**:

    Default value is unchecked.

    It functions as a switch to enable CORS (Cross Origin Resource Sharing). If this item is set to true, Service Layer will check the value of `CorsAllowedOrigins`.

    Configuration is saved in `/ServiceLayer/conf/b1s.conf`.

    For example:

    `"CorsEnable": false`

- **Option**: `CorsAllowedOrigins`
  - **Description and Default Values**:

    Default value is empty ("").

    This item takes effect only if `CorsEnable` is checked. It is a semi-colon-separated string list where each string is a representation of a trusted origin.

    For example:

    `"CorsAllowedOrigins": http://host1:8080;https://host2:8443`

    `CorsAllowedOrigins` can also be configured as "*" to support requests from all origins. However, in production environments, it is not recommended due to security issues.

    Configuration is saved in `/ServiceLayer/conf/b1s.conf`.

    For example:

    `"CorsAllowedOrigins": "*"`

- **Option**: `CorsAllowedHeaders`
  - **Description and Default Values**:

    Default value is `"content-type, accept"`.

    This item takes effect only if `CorsEnable` is checked. It is a comma-separated string list where each string is a representation of a request header name.

    For example:

    `"CorsAllowedHeaders": "content-type, accept, B1S-PageSize"`

    Configuration is saved in `/ServiceLayer/conf/b1s.conf`.

    For example:

    `"CorsAllowedHeaders": "content-type, accept, B1S-CaseInsensitive"`

<!-- table: t171-01 -->
- **Option**: `Request & Response Logs`
  - **Description and Default Values**:

    Default value is unchecked.

    If enabled, a log file containing all the request and response handled by the Apache server is created. There will be one log file generated per day in the format `dumphttp.log_%Y_%m_%d`.

    Logs are located under:

    - Linux: `/usr/sap/SAPBusinessOne/ServiceLayer/logs/`
    - Windows: `C:\Program Files\SAP\SAP Business One ServerTools\ServiceLayer\logs`

    You can download logs using the *Download* button from *SAP Business One Service Layer Controller* > *Download Logs*.

    Configuration is saved in `/ServiceLayer/conf/httpd-b1s-lb.conf`.

- **Option**: `WCFCompatible`
  - **Description and Default Values**:

    Default value is unchecked.

    If enabled, the Microsoft WCF component can consume Service Layer. The application works around some limitations of WCF and the application behavior is as follows:

    - `EnumType` is replaced by `Edm.String`, since `EnumType` is not supported by WCF in metadata.
    - The property name cannot be the same as the type name. For example, `BatchNumber.BatchNumber` is automatically renamed to `BatchNumber.BatchNumberProperty`.
    - Use type `Edm.DateTime` instead of `Edm.Time`, as Microsoft .net does not have a `Time` type and uses `TimeSpan` instead, which is not compatible with SAP Business One.

    Configuration is saved in `ServiceLayer/conf/b1s.conf`.

    For example:

    `"WCFCompatible": true`

- **Option**: `Max Connections Per Child`
  - **Description and Default Values**:

    Default value is 1024.

    Controls how frequently the server recycles processes by killing old ones and launching new ones.

    Configuration is saved in `ServiceLayer/conf/httpd-b1s-lb-member.conf`.

<!-- table: t172-01 -->
- **Option**: `Log Levels`
  - **Description and Default Values**:

    Default value is `Error`.

    Generates SAP Business One logs for the Service Layer process. There are 2 types of log files generated in the format.

    - `httpd.servicelayer.YYYYMMDD_HHMMSS.pidxxxxx.log`
    - `httpd.b1logger.YYYYMMDD_HHMMSS.pidxxxxx.log`

    Logs are located under:

    - Linux: `/usr/sap/SAPBusinessOne/home/b1service0/SAP/SAP Business One/Log/BusinessOne/`
    - Windows: `C:\ProgramData\SAP\SAP Business One\Log\SAP Business One\<ServiceUserName>\BusinessOne`

    Configuration is saved in `ServiceLayer/conf/b1s.conf`.

    For example:

    `"LogLevel": "Error"`

- **Option**: `Session Timeout`
  - **Description and Default Values**:

    Default value is 30 (minutes).

    Defines the idle timeout period for each session, specified in minutes.

    Configuration is saved in `ServiceLayer/conf/b1s.conf`.

    For example:

    `"SessionTimeout": 30`

- **Option**: `CoreDump`
  - **Description and Default Values**:

    Default value is unchecked.

    When enabled, a core dump file will be created with the snapshot of information on the event of service layer process crash.

    Core dump files are located under:

    - Linux: `/var/lib/systemd/coredump`
    - Windows: `C:\Program Files\SAP\SAP Business One ServerTools\ServiceLayer\logs\`

    Configuration is saved in `ServiceLayer/conf/b1s.conf`.

    For example:

    `"EnableCoreDump": true`

<!-- table: t173-01 -->
- **Option**: `Enable Access Log`
  - **Description and Default Values**:

    Default value is unchecked.

    Prior toSAP Business One 10.0 FP 2305, access logs are enabled by default in Service Layer. After upgrade to SAP Business One 10.0 FP 2305, if you intend to check access logs, you can select the checkbox to enable access logs.

    Logs are located under:

    - Linux: `/usr/sap/SAPBusinessOne/ServiceLayer/logs/`
    - Windows: `C:\Program Files\SAP\SAP Business One ServerTools\ServiceLayer\logs`

    You can download logs using the *Download* button from *SAP Business One Service Layer Controller* > *Download Logs*.

    Configuration is saved in `ServiceLayer/conf/b1s.conf`.

    For example:

    `"EnableAccessLog": true`

    > **Note**
    >
    > How to log the HTTP header in the Apache access log
    >
    > 1. Change the `LogFormat` setting in the file `\ServiceLayer\Conf\httpd-b1s-lb`.
    > 2. For the attributes of the HTTP header which need to be logged, customize the log format by adding "`%{Attribute}i`". For example, add **Host** into the log:
    >
    > ```xml
    > <IfModule log_config_module>
    >     LogFormat "%t %h %D \"%r\" %>s %b ssl=%
    > {SSL_PROTOCOL}x t=%Ts pid=%P sid=%{B1SESSION}C
    > n=%{ROUTEID}C %X host=%{Host}i" common
    > </IfModule>
    > ```
    >
    > 3. Restart the Service Layer.

- **Option**: `Session Sticky`
  - **Description and Default Values**:

    Default value is checked.

    The session manager implements session stickiness by default, working with the Service Layer load balancer, so that requests from the same client will be handled by the same Service Layer node.

    If disabled, the load will be distributed equally to all available service layer nodes.

    Configuration is saved in `ServiceLayer/conf/ httpd-b1s-lb.conf`.

> **Note**
>
> All configuration options take effect after you restart Service Layer.

For Service Layer log file configuration, please refer to SAP Knowledge Base Article 3157498 (https://me.sap.com/notes/3157498). Its content is summarized in [log-file-configuration](log-file-configuration.md).
