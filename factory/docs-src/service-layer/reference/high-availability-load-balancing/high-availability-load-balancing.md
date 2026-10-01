---
title: High availability and load balancing
source: pdf pp. 226-226, sec 9
summary: How Service Layer is deployed as a load-balancing cluster with sticky sessions, and how it recovers when a working node fails.
---

# High availability and load balancing

In the context of Web-based mobile-accessible applications, providing highly available services becomes increasingly important. Service Layer is well-designed and thoroughly tested to ensure that it will be continuously operational for a significant length of time in a production system.

By default, Service Layer installs Apache Multi-Processing Modules (MPMs) and is configured as a load-balancing cluster. A central load balancer distributes HTTP loads amongst its nodes according to the number of requests. In addition, Service Layer implements sticky sessions to avoid an unnecessary login, which is considered a heavy job in SAP Business One, because same session requests will always be forwarded to the same working node. Those working nodes can be deployed in a clustered system, where hardware and software redundancy helps to scale performance and provide high availability.

```text
      Client      |   Load Balancer    |            Working Nodes            |       Database
                  |                    |                  Server 1           |
                  |                    |              ┌────────────────────┐ |
                  |                    |              │             Apache │ |
                  |                    |  Client4 ->  │   ┌────────────┐   │ |
                  |                    |              │   │ SL Apache  │   │ |
(:) Client1 -> -> |                    |  Client5 ->  │   │   Module   │   │ |
                  |                    |              │   └────────────┘   │ |
                  |                    |  Client4 ->  │                    │ |
                  |                    |              │   ┌────────────┐   │ |
                  |                    |  Client5 ->  │   │  Observer  │   │ |
                  |                    |              │   └────────────┘   │ |
(:) Client2 -> -> |                    |              │                    │ |
                  |                    |              └────────────────────┘ |
                  |                    |                                     |
                  |                    |                  Server 2           |  HANA
                  |                    |              ┌────────────────────┐ |  ╭──────────────╮
                  |  ┌──────────────┐  |              │             Apache │ |  ╰──────────────╯
(:) Client3 -> -> |  │    Apache    │  |  Client1 ->  │   ┌────────────┐   │ |  │              │
                  |  │     Load     │  |              │   │ SL Apache  │   │ |  │  ┌───────┐   │
                  |  │   Balancer   │  |  Client3 ->  │   │   Module   │   │ |  │  │Session│   │
                  |  └──────────────┘  |              │   └────────────┘   │ |  │  └───────┘   │
                  |                    |  Client3 ->  │                    │ |  │              │
                  |  *Session-sticky   |              │   ┌────────────┐   │ |  │              │
(:) Client4 -> -> |                    |  Client1 ->  │   │  Observer  │   │ |  ╰──────────────╯
                  |                    |              │   └────────────┘   │ |
                  |                    |              │                    │ |
                  |                    |              └────────────────────┘ |
                  |                    |                                     |
                  |                    |                  Server 3           |
(:) Client5 -> -> |                    |              ┌────────────────────┐ |
                  |                    |              │             Apache │ |
                  |                    |  Client2 ->  │   ┌────────────┐   │ |
                  |                    |              │   │ SL Apache  │   │ |
                  |                    |  Client2 ->  │   │   Module   │   │ |
                  |                    |              │   └────────────┘   │ |
                  |                    |              │                    │ |
                  |                    |              │   ┌────────────┐   │ |
                  |                    |              │   │  Observer  │   │ |
                  |                    |              │   └────────────┘   │ |
                  |                    |              │                    │ |
                  |                    |              └────────────────────┘ |
                  |                    |                                     |
```

Figure: Load-balancing architecture. Five clients (Client1 to Client5), each sending requests, connect to a session-sticky Apache load balancer, which distributes them to three working nodes (Server 1, Server 2 and Server 3). Each server runs an Apache process with an SL Apache Module and an Observer. All servers share one HANA database that stores the sessions. Arrow labels show which client each request belongs to: Server 1 receives Client4 and Client5, Server 2 Client1 and Client3, Server 3 Client2.

In an exceptional case, if the load balancer detects that one of its nodes has failed, it forwards subsequent requests to another valid node. The receiving node validates the session through the shared session info stored in the database. If valid, the receiving node automatically logs the user in, without interrupting the user actions or asking for user credentials. End-users will not notice the internal node failure, other than in a slight delay of the system response.
