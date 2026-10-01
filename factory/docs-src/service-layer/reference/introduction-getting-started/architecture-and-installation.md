---
title: Architecture and Installation
source: pdf pp. 12-14, sec 2.2, 2.3
summary: The 3-tier architecture and components of Service Layer, the recommended multi-instance load balancer setup, and the supported installation layouts.
---

# Architecture and Installation

## Architecture Overview

SAP Business One Service Layer has a 3-tier architecture: the clients communicate with the Web server using HTTP/OData, and the Web server relies on the database for data persistence.

Within the Web server, several key components are involved in handling incoming OData-based HTTP requests:

- The OData Parser looks at the requested URL and HTTP methods (`GET`/`POST`/`PATCH`/`DELETE`), translates them into the business objects to be operated on, and calls each object's respective method for create/ retrieve/update/delete (CRUD) operations. In reverse, the OData Parser also receives the returned data from business objects, translates them into HTTP return code and JSON data representatives, and responds to the original client.
- The DI Core is the interface for accessing SAP Business One objects and services, the same one that is used by SAP Business One DI API. As a result, Service Layer API and DI API have identical definitions for objects and object properties, smoothing the learning curve for developers who have already acquired DI API development experience.
- The session manager implements session stickiness, working with the Service Layer load balancer, so that requests from the same client will be handled by the same Service Layer node.
- OBServer is the body of business logic dealing with the actual work, for example, tax calculation, posting, and so on. Service Layer achieves high performance and scalability by leveraging multi-processing.

```text
   ┌───────────────────────┐
 ┌───────────────────────┐ │
 │        Client         │ │
 │    (HTML5, Mobile)    │─┘
 └───────────────────────┘
             │
HTTP / OData ○ R
             │ ▼
┌────────────┴──────────────────────────────────────────────────────────────┐
│                                  Apache                                   │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ Apache module                                                         │ │
│ │                     ┌───────────┐    ┌───────────┐    ┌───────────┐   │ │
│ │                     │   OData   │    │  DI Core  │    │  Session  │   │ │
│ │                     │  Parser   │ ...│           │ ...│  Manager  │   │ │
│ │                     └───────────┘    └───────────┘    └───────────┘   │ │
│ │                                                                       │ │
│ │ ┌───────────────────────────────────────────────────────────────────┐ │ │
│ │ │ OBServer                                                          │ │ │
│ │ │ (multi-threading  ┌───────────┐    ┌───────────┐    ┌───────────┐ │ │ │
│ │ │ enabled)          │    C++    │    │    C++    │    │    C++    │ │ │ │
│ │ │                   │ business  │ ...│ business  │ ...│ business  │ │ │ │
│ │ │                   │  object   │    │  object   │    │  object   │ │ │ │
│ │ │                   └───────────┘    └───────────┘    └───────────┘ │ │ │
│ │ │                                                                   │ │ │
│ │ └───────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                       │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
└────────────┬──────────────────────────────────────────────────────────────┘
             │
             ○ R
             │ ▼
             │
┌────────────┴──────────────────────────────────────────────────────────────┐
│                             SAP HANA Database                             │
└───────────────────────────────────────────────────────────────────────────┘
```

Figure: The Service Layer architecture, from client through Apache to the SAP HANA database. A client (HTML5, Mobile) connects over HTTP/OData to Apache. Inside Apache, the Apache module hosts the OData Parser, the DI Core and the Session Manager (among other components), and the OBServer (multi-threading enabled) hosts several C++ business objects. Apache in turn connects to the SAP HANA Database.

In order to achieve even higher availability and scalability, we recommend deploying multiple Service Layer instances with a load balancer in the front. The benefits include the following:

- Client requests can be dispatched to different Service Layer instances and executed in parallel.
- If Service Layer is installed in a distributed mode, and there is a hardware failure in one host machine, Service Layer is smart enough to re-dispatch client requests to another live instance without asking users to log on again.

## Installing SAP Business One Service Layer

The Service Layer is an application server that provides Web access to SAP Business One services and objects and uses the Apache HTTP Server (or simply Apache) as the load balancer, which works as a transit point for requests between the client and various load balancer members. The architecture of the Service Layer is illustrated below:

Figure: The Service Layer architecture with a load balancer and load balancer members.

```text
                                             ┌──────────────────────────┐
                                     ┌─HTTP─>│ Service Layer            │
                                     │       │ Load Balancer Member 1   │
                                     │       └──────────────────────────┘
┌────────┐        ┌───────────────┐  │       ┌──────────────────────────┐
│ Client │─HTTPS─>│ Service Layer │──┼─HTTP─>│          ......          │
└────────┘        │ Load Balancer │  │       └──────────────────────────┘
                  └───────────────┘  │       ┌──────────────────────────┐
                                     └─HTTP─>│ Service Layer            │
                                             │ Load Balancer Member n   │
                                             └──────────────────────────┘
```

The client connects to the Service Layer Load Balancer over HTTPS. The load balancer forwards requests over plain HTTP to the Service Layer Load Balancer Members, numbered 1 to n; the `......` box stands for any number of additional members. Only the client-facing leg is encrypted, which is why the Recommendation below restricts member access by firewall.

> **Recommendation**
>
> As the communication between the load balancer and the load balancer members is transmitted via HTTP instead of HTTPS, you should configure the firewall on each load balancer member machine in such a way that only visits from the load balancer are allowed to the load balancer members.

You may set up Service Layer in one of the following ways:

- [Recommended] The load balancer and all load balancer members are installed on the same machine.
- The load balancer and load balancer members are all installed on different physical machines. Note that at least one load balancer member must be installed on the same machine as the load balancer.

Remote installation of Service Layer is **not** supported. For example, if you intend to install the load balancer on server A and two load balancer members on servers B and C, you must run the server components setup wizard on each server separately.

For more information, see the *Installing the Service Layer* charpter in the *SAP Business One Administrator’s Guides (version for SQL and version for SAP HANA)*.
