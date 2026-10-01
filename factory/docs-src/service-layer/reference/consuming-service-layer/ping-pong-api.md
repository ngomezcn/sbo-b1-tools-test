---
title: Ping Pong API
source: pdf pp. 137-139, sec 3.21
summary: The /ping endpoints answered directly by the Apache load balancer or a node, their use cases and example requests and responses.
---

# Ping Pong API

As of SAP Business One 9.3 patch level 10, version for SAP HANA, Service Layer provides a new Ping Pong API method which can improve debugging, support, network testing and component monitoring. The purpose of this API is to provide a direct response from the Apache server so that you can eliminate SAP Business One internal processing time from any network performance debugging. (This is different from all other Service Layer APIs which are passed through to SAP Business One core for processing before returning a result). In response to a PING request, the Apache server (load balancer or node) will respond directly with a simple PONG response.

This API could be used to fulfill the following scenarios:

- Isolate network latency from SAP Business One processing latency.
- Check server time accuracy.
- Monitor or debug Service Layer API availability.
- Monitor load balancer and nodes separately (important for multi-server deployment).

> **Example**
>
> The following scenarios are some examples of how to use the Ping Pong API:
>
> - **Scenario 1** - No endpoint specified, load balancer will respond Request: `https://<ServerName/IP>:<Port>/ping/` Response:
>
> ```http
> HTTP/1.1 200 OK
> {    "message": "pong",    "sender": "load balancer",    "timestamp":
> "1555998764.740"}
> ```
>
> - **Scenario 2** - Ping Service Layer load balancer Request: `https://<ServerName/IP>:<Port>/ping/load-balancer` Response:
>
> ```http
> HTTP/1.1 200 OK
> {    "message": "pong",    "sender": "load balancer",    "timestamp":
> "1555998785.080"}
> ```
>
> - **Scenario 3** - Specified node will respond Request: `https://<ServerName/IP>:<Port>/ping/node/1` Response:
>
> ```http
> HTTP/1.1 200 OK
> {    "message": "pong",    "sender": "node1",    "timestamp":
> "1554363811.386"}
> ```
>
> - **Scenario 4** - Specified node will respond Request: `https://<ServerName/IP>:<Port>/ping/node/2` Response:
>
> ```http
> HTTP/1.1 200 OK
> {    "message": "pong", "sender":"node2", "timestamp": "1552263107.648"}
> ```
>
> - **Scenario 5** - No node specified, node 1 will respond Request: `https://<ServerName/IP>:<Port>/ping/node` Response:
>
> ```http
> HTTP/1.1 200 OK
> {    "message": "pong",    "sender": "node1",    "timestamp":
> "1555998837.832"}
> ```
>
> - **Scenario 6** - Node 4 is down Request: `https://<ServerName/IP>:<Port>/ping/node/4` Response:
>
> ```http
> HTTP/1.1 503 Service Unavailable
> {    "message": "Service Unavailable"}
> ```
>
> - **Scenario 7** - Node 5 does not exist Request: `https://<ServerName/IP>:<Port>/ping/node/5` Response:
>
> ```http
> HTTP/1.1 503 Service Unavailable
> {    "message": "node 5 does not exist",    "sender": "load balancer",
> "timestamp": "1554363934.431"}
> ```
