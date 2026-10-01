---
title: Monitoring Service Layer Logs
source: pdf pp. 175-178, sec 6.4, 6.4.1, 6.4.2, 6.4.3, 6.4.4, 6.4.5
summary: The Monitor tab of the Service Layer Controller: list and detail views of normal and error requests, and request/response detailed logs.
---

# Monitoring Service Layer Logs

- [List View of Normal Requests](#list-view-of-normal-requests)
- [Detailed View of Normal Requests](#detailed-view-of-normal-requests)
- [List View of Error Requests](#list-view-of-error-requests)
- [Detailed View of Error Requests](#detailed-view-of-error-requests)
- [Request/Response Detailed Logs](#requestresponse-detailed-logs)

As of SAP Business One 10.0 FP 2202, the Service Layer Controller is enhanced to support the Service Layer log monitor with the following functionalities:

- A list view for normal requests
- A detail view for groups of normal requests
- A list view for error requests
- A detail view for groups of error requests
- Request/response detailed logs for troubleshooting purposes

On the Service Layer Controller home page, a new *Monitor* tab is added to display the logs, and you can choose a recent day of logs by selecting from a dropdown list. For example, the days range from 1 day to 10 days.

For all views, a pagination control is displayed to allow you to browse the requests page-by-page. By default, 20 rows are displayed per page.

## List View of Normal Requests

The list view of normal requests shows the basic information for a given group of requests.

<!-- table: t176-01 -->
| Field | Description |
|---|---|
| No. | The number of the request in the list view. |
| Method | The HTTP method for a request. |
| URL | The URL for a request. |
| Count | The number of occurrences for a given request. |
| Detail | A clickable link for the detailed view. |

The list view is grouped by **Method** and **URL**. You can click the refresh icon on the right upper corner to get the latest logs.

## Detailed View of Normal Requests

The detailed view of a group of normal requests shows more detailed information.

<!-- table: t176-02 -->
| Field | Description |
|---|---|
| Time | The time when the request is served. |
| URL | The URL for the request. |
| Duration | The time taken by the server to handle the request. |
| Sid | The session ID for the request. |
| Node | The ID of the node which handles the request. |
| HTTP Code | The HTTP code for the request. |
| Pid | The process number which handles the request. |
| Client IP | The IP of the client from which the request is sent. |

## List View of Error Requests

The list view of error requests shows the basic information of a group of error requests.

<!-- table: t177-01 -->
| Field | Description |
|---|---|
| No. | The number of the request in the list view. |
| Method | The HTTP method for a request. |
| URL | The URL for a request. |
| Count | The number of occurrences for a given request. |
| Details | A clickable link for the detailed view. |

The list view is grouped by **Method** and **URL**. You can choose the refresh icon on the right upper corner to get the latest logs.

## Detailed View of Error Requests

The detailed view of a group of error requests shows more detailed information.

<!-- table: t178-01 -->
| Field | Description |
|---|---|
| Time | The time when the request is served. |
| URL | The URL for a request. |
| Duration | The time taken by the server to handle the request. |
| Sid | The session ID for the request. |
| Node | The ID of the node which handles the request. |
| HTTP Code | The HTTP code for the request. |
| Pid | The process number which handles the request. |
| Client IP | The IP of the client from which the request is sent. |

## Request/Response Detailed Logs

This logging is for trouble shooting purposes. In the Service Layer Configuration, click the *Request & Response Logs* checkbox to enable/disable the logging. A dropdown list is available to allow you to download log files according to the selected duration.

