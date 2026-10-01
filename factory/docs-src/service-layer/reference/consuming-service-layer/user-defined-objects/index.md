---
title: User-Defined Objects (UDOs)
source: pdf pp. 92-92, sec 3.15
summary: Overview of user-defined objects in Service Layer, the versions that support each UDO capability, and how a UDO is composed of user-defined tables.
---

# User-Defined Objects (UDOs)

> **Note**
>
> CRUD operations are possible for UDOs in SAP Business One 9.1 patch level 03 and later.
>
> You can manage UDO metadata in Service Layer in SAP Business One 9.1 patch level 04 and later.
>
> You can access UDTs via Service Layer directly in SAP Business One 9.1 patch level 05 and later.
>
> In SAP Business One 9.1 patch level 05 and later, information from UDTs, UDOs and UDFs is included in OData metadata `https://databaseserver:50000/b1s/v1/$metadata`.
>
> In SAP Business One 9.2 patch level 11 and later, UDO Cancel/Close function is supported.

Depending on your business needs, you can create your own objects for managing custom data and creating custom functionality. Each user-defined object must be registered with one main user-defined table and, optionally, with one or more child UDTs. Each UDT contains one or more user-defined fields (UDFs). The object type of a main UDT must be either Master Data or Document, while the object type of a child UDT must be either Master Data Rows or Document Rows.

## [Managing metadata of UDOs](udo-metadata.md)
Use when: creating the UDTs, UDFs and user keys and registering a UDO.
Terms: `UserTablesMD`, `UserFieldsMD`, `UserObjectsMD`, `UserKeysMD`

## [Create, retrieve, update, delete, cancel and close UDO entities](udo-entity-operations.md)
Use when: doing CRUD, queries, cancel or close on a UDO entity.
Terms: `MyOrder`, `Cancel`, `Close`, `B1S-Schema`
