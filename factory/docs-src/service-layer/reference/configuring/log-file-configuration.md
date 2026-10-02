---
title: Service Layer Log File Configuration
source: external SAP Knowledge Base Article 3157498 (version 12, released 2026-07-08); https://me.sap.com/notes/3157498
summary: How to enable, configure, locate and collect the Service Layer log files (access, error, SSL, request and response, OBServer debug and performance, core dump) for troubleshooting.
---

# Service Layer Log File Configuration

- [1. Service Layer Access Logs](#1-service-layer-access-logs)
- [2. Service Layer Error Logs](#2-service-layer-error-logs)
- [3. Service Layer SSL Logs](#3-service-layer-ssl-logs)
- [4. Service Layer Request and Response Logs](#4-service-layer-request-and-response-logs)
- [5. OBServer Debug Logs](#5-observer-debug-logs-for-service-layer)
- [6. OBServer Performance Logs](#6-observer-performance-logs-for-service-layer)
- [7. Service Layer Core Dump](#7-service-layer-core-dump)
- [See also](#see-also)

Source: SAP Knowledge Base Article [3157498 - Service Layer Log File Configuration](https://me.sap.com/notes/3157498) (applies to SAP Business One and SAP Business One version for SAP HANA).

This article explains how to enable and collect log files for better troubleshooting in Service Layer (SL). `${SL_LB_PORT}` is the load balancer port of Service Layer.

Common steps used below:

- **Open the Controller**: `https://<servername/IP>:<port>/ServiceLayerController`, then use the **Service Layer Configuration** section and press **Save**.
- **Restart** the Service Layer service after changing any setting.
- **Collect logs** that are under the Service Layer `logs` folder by going to `https://<servername/IP>:<port>/ServiceLayerController`, then **Download Logs**, then **Download**.
- **Service Layer `logs` folder**:
    - Linux: `/usr/sap/SAPBusinessOne/ServiceLayer/logs/`
    - Windows: `C:\Program Files\SAP\SAP Business One ServerTools\ServiceLayer\logs`

> **Note**
>
> Request and Response, OBServer debug, OBServer performance and core dump settings consume more disk space. Revert them once you have collected the logs.

## 1. Service Layer Access Logs

The access logs contain all requests processed by Service Layer. One file is generated per node for each day, named `access_${SL_LB_PORT}_log_%Y_%m_%d`.

These logs must be enabled only from SAP Business One 10.0 FP 2305. In versions before SAP Business One 10.0 FP 2305 they are enabled by default.

To enable:

1. Open the Service Layer Controller.
2. Under **Service Layer Configuration**, check **Enable Access Log**.
3. Press **Save**.
4. Restart the Service Layer service.

Each entry records the following information:

```
[14/Aug/2018:14:07:52 -0400] [192.100.1.1] [2098999] ["POST /b1s/v1/Login HTTP/1.1"] [200] [167] [t=2s] [pid=18365] [sid=] [n=]  [-]
```

| Field | Content |
|---|---|
| 1 | Time when the request is received, in the format `[dd/mmm/yyyy:hh:mm:ss +\|-hh:mm]`. The last number is the timezone offset from Greenwich Mean Time (GMT). |
| 2 | Remote hostname. It logs the IP address of the machine where the Service Layer service is running. |
| 3 | Time taken to serve the request, in microseconds. |
| 4 | First line of the request. |
| 5 | Final status of the request. |
| 6 | Size of the response in bytes, excluding HTTP headers. |
| 7 | Time to process the request, in seconds. |
| 8 | Process ID of the httpd process. |
| 9 | Session ID. |
| 10 | Contents of the cookie `VARNAME` in the request sent to the server. |
| 11 | Connection status when the response is completed: `X` = connection aborted before the response completed; `+` = connection may be kept alive after the response is sent; `-` = connection will be closed after the response is sent. |

Location: the Service Layer `logs` folder. Collect them with **Download Logs** in the Controller.

## 2. Service Layer Error Logs

All technical errors related to the httpd process are recorded here. One file is generated per node for each day, named `error_${SL_LB_PORT}_log_%Y_%m_%d`.

By default each entry records the following information:

```
[Fri Sep 09 10:42:29.902022 2011] [core:error] [pid 35708:tid 4328636416] [client 72.15.99.187] [File does not exist: /usr/local/apache2/htdocs/favicon.ico]
```

| Field | Content |
|---|---|
| 1 | Time when the request is received, in the format `[dd mmm yyyy:hh:mm:ss +\|-hh:mm]`. The last number is the timezone offset from GMT. |
| 2 | Module producing the message (`core` in this case) and the severity level of the message. |
| 3 | Process ID and, if appropriate, the thread ID of the process that experiences the condition. |
| 4 | Client address that makes the request. |
| 5 | Detailed error message. |

To change the log level:

1. Go to the configuration directory:
    - Linux: `/usr/sap/SAPBusinessOne/ServiceLayer/conf/`
    - Windows: `C:\Program Files\SAP\SAP Business One ServerTools\ServiceLayer\Conf`
2. Edit the file `httpd-b1s-lb.conf`.
3. Change the property `LogLevel` from `warn` to `LogLevel debug`.
4. Save the change and exit the file.
5. Restart the Service Layer service.

Location: the Service Layer `logs` folder. Collect them with **Download Logs** in the Controller.

## 3. Service Layer SSL Logs

Secure Sockets Layer (SSL) cipher suite information is recorded for each request. One file is generated for the load balancer port per day, named `ssl_${SL_LB_PORT}_request_log_%Y_%m_%d`.

By default each entry records the following information:

```
[17/Aug/2021:14:51:14 +0530] [10.128.112.139] [TLSv1.2] [ECDHE-RSA-AES256-GCM-SHA384] ["GET /screen.css HTTP/1.1"] [4768]
```

| Field | Content |
|---|---|
| 1 | Time when the request is received, in the format `[dd/mmm/yyyy:hh:mm:ss +\|-hh:mm]`. The last number is the timezone offset from GMT. |
| 2 | Remote hostname. It logs the IP address where the Service Layer service is running. |
| 3 | TLS version. |
| 4 | Cipher suite. |
| 5 | Request line (`"GET /screen.css HTTP/1.1"` in the example). |
| 6 | Size of the response in bytes, excluding HTTP headers. |

The source article lists five fields but its example has six values; the request line sits between the cipher suite and the size.

Location: the Service Layer `logs` folder. Collect them with **Download Logs** in the Controller.

## 4. Service Layer Request and Response Logs

These logs are not enabled by default. They contain the complete request and response information processed by the Service Layer httpd process. One file is generated per day, named `dumphttp.log_%Y_%m_%d`.

To enable:

1. Open the Service Layer Controller.
2. Under the **Service Layer Configuration** section, check **Request and Response Logs**.
3. Press **Save**.
4. Restart the Service Layer service.

Location: the Service Layer `logs` folder. Collect them with **Download Logs** in the Controller.

## 5. OBServer Debug Logs for Service Layer

These logs are not enabled by default. They contain SAP Business One logic flow debug information.

To enable:

1. Open the Service Layer Controller.
2. Under the **Service Layer Configuration** section, choose Log Levels `Debug`.
3. Press **Save**.
4. Restart the Service Layer service.

Two types of log files are generated:

```
httpd.servicelayer.YYYYMMDD_HHMMSS.pidxxxxx.log
httpd.b1logger.YYYYMMDD_HHMMSS.pidxxxxx.log
```

Location:

- Linux: `/usr/sap/SAPBusinessOne/home/b1service0/SAP/SAP Business One/Log/BusinessOne/`
- Windows, before SAP Business One 10.0 FP2311: `C:\ProgramData\SAP\SAP Business One\Log\SAP Business One\<ServiceUserName>\BusinessOne`
- Windows, SAP Business One 10.0 FP2311 and later: `C:\Windows\ServiceProfiles\NetworkService\AppData\Local\SAP\SAP Business One\Log\BusinessOne`

Collect these logs manually from the location above; **Download Logs** does not cover them.

## 6. OBServer Performance Logs for Service Layer

These logs are not enabled by default. They contain SAP Business One logic flow performance information.

To enable:

1. Open `b1LogConfig.xml`, located under:
    - Windows: `C:\Program Files\SAP\SAP Business One ServerTools\ServiceLayer\Conf`
    - Linux: `/usr/sap/SAPBusinessOne/ServiceLayer/lib/Conf/`
2. Change the configuration as below and save the file.

```xml
<log FolderSize="50">
<servicelayer Mode="S" MaxFileSize="5" MaxNumOfMsg="500" LogStack="0" Activate = "1" SaveToRepository="0">
<Components Sys="0" Sql="1" Tr="0" Genl="1" StkTol="0" Upg="0" Perf="1" GUI="0"></Components>
<Severities Note="1" Warn="1" Err="1" CritErr="1" BeProt="0" AditFail="0"/>
</servicelayer>
<DILogger Mode="DI" MaxFileSize="5" MaxNumOfMsg="500" LogStack="0" Activate = "1" SaveToRepository="0">
<Components DI="1"/>
<Severities Tr="0" Err="1" FullInfo="0"/>
</DILogger>
</log>
```

3. Restart the Service Layer service.
4. Reproduce the issue.

Two types of log files are generated, with the same names and locations as the OBServer debug logs (section 5):

```
httpd.servicelayer.YYYYMMDD_HHMMSS.pidxxxxx.log
httpd.b1logger.YYYYMMDD_HHMMSS.pidxxxxx.log
```

Collect these logs manually from that location.

## 7. Service Layer Core Dump

Core dumps are not enabled by default.

To enable:

1. Open the Service Layer Controller.
2. Under **Service Layer Configuration**, check **Core Dump**.
3. Press **Save**.
4. Restart the Service Layer service.

Location:

- Linux: `/var/lib/systemd/coredump`
- Windows: `C:\Program Files\SAP\SAP Business One ServerTools\ServiceLayer\logs\`

Collect them manually, or use **Download Logs** in the Controller to collect logs for a specific period.

## See also

Related SAP Knowledge Base Articles:

- KBA 3538414 - Service Layer OBServer logs are not deleted automatically
- KBA 3543181 - How to deactivate Service Layer OBServer log files
- KBA 3603745 - How to use service layer logs to analyze performance issue
- KBA 3608113 - How to use Service Layer logs to analyze business logic related error messages
- KBA 3607657 - How to use Service Layer logs to analyze technical error messages
- KBA 3655778 - How to enable SLD Apache Tomcat access log files
- Webinar - Demystifying Service Layer Logs
