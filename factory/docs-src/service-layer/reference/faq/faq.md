---
title: Frequently asked questions
source: pdf pp. 227-228, sec 10
summary: Answers to common Service Layer questions - differences from DI API and DI Server, REST implications, PUT versus PATCH, overriding PATCH with POST, auto start of the Linux services, and a non-default SAP HANA client location.
---

# Frequently asked questions

- [What are the differences between Service Layer and other SAP Business One extension APIs, such as DI API and DI Server?](#what-are-the-differences-between-service-layer-and-other-sap-business-one-extension-apis-such-as-di-api-and-di-server)
- [Service Layer is OData-compliant and RESTful, what are the other implications of moving to such Web-services architecture?](#service-layer-is-odata-compliant-and-restful-what-are-the-other-implications-of-moving-to-such-web-services-architecture)
- [Why does Service Layer support two types of update?](#why-does-service-layer-support-two-types-of-update)
- [What if my HTTP client does not support the `PATCH` method?](#what-if-my-http-client-does-not-support-the-patch-method)
- [Does the service auto start with system?](#does-the-service-auto-start-with-system)
- [Does it work if SAP HANA client is not installed at the default location?](#does-it-work-if-sap-hana-client-is-not-installed-at-the-default-location)

## What are the differences between Service Layer and other SAP Business One extension APIs, such as DI API and DI Server?

Service Layer is built on the DI core technology, which is also the foundation of DI API and DI Server. Therefore, all three extension APIs share similar business object definitions. However, their differences are significant:

- DI API derives from Microsoft COM technology and fits best in the Windows native environment;
- DI Server targets SOAP-based data integration scenarios and prefers Web-services architecture;
- Service Layer is an OData-compliant data service with a smoother learning curve, which enables easy Web Mashup, or effortless add-on development in various languages (Java, JavaScript, .NET) using 3rd-party libraries. Service Layer is also a full-featured web application server with capabilities of high availability and scalable performance.

## Service Layer is OData-compliant and RESTful, what are the other implications of moving to such Web-services architecture?

Service Layer provides lightweight and faster results and simple transactions (for example, CRUD operations). Querying objects is just a matter of changing URI in a uniform fashion. Batch operation is to support advanced transaction scenarios where multiple requests need to be applied in an atomic way.

Service Layer may not be a good choice to implement complex or distributed transactions where server-side state management is a must-have requirement.

## Why does Service Layer support two types of update?

The two types of update differ in the HTTP verb that is sent in the request:

- A `PUT` request indicates a replacement update. All property values specified in the request body are replaced. Missing properties are set to their default values.
- A `PATCH` request indicates a differential update. Only exactly those property values in the request body are replaced. Missing properties are not altered.

In most cases, Patch request is the recommended approach to update object data.

## What if my HTTP client does not support the `PATCH` method?

As of 9.1 patch level 04, you can use the `POST` method to override the `PATCH` method. To do so, use the `POST` method and specify in the HTTP header `X-HTTP-Method-Override` the method to be overridden. For example, the following two requests are equal:

- `PATCH /Orders(1)`
- `POST /Orders(1) X-HTTP-Method-Override: PATCH`

Note that the `POST` method can also override the `PUT`, `MERGE`, and `DELETE` methods.

## Does the service auto start with system?

Yes, for Service Layer running on SAP HANA. As Service Layer is installed as a series of Linux services named b1s and b1s<port>, you can check those services via this command (run as `root` user):

```text
# chkconfig | grep b1s
```

On my environment it returns:

```text
b1s off

b1s50000 on

b1s50001 on

b1s50002 on

b1s50003 on

sapb1servertools on
```

b1s50000 is for the load balancer and others, such as 50001~50003, are for the 3 service nodes. "on" means the service is able to start automatically with the system.

You can turn it off for each node:

```text
# chkconfig b1s50000 off

# chkconfig b1s50001 off

# chkconfig b1s50002 off

# chkconfig b1s50003 off
```

Of course you can turn on it again:

```text
# chkconfig b1s50003 on
```

## Does it work if SAP HANA client is not installed at the default location?

By default, SAP HANA client x64 version is installed at /usr/sap/hdbclient. As of 9.1 patch level 04, Service layer can work even if SAP HANA client is not installed at the default location.

Note: This is done by detecting SAP HANA client in this file:

```text
/var/opt/.hdb/{hostname}/installations.client
```

In prior versions, please work around this issue by creating a symbol link at the default location to your new location, e.g.

```text
# mkdir /usr/sap

# ln -s /your/path/hdbclient /usr/sap/hdbclient
```

Or add the HANA client path in the system path: find file `/etc/ld.so.conf`, append your path at the end and run:

```text
# ldconfig
```
