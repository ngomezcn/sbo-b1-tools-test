---
title: Query with Permission Control
source: pdf pp. 157-159, sec 4.11
summary: How SQL query authorization works for normal users and superusers, the 403 response, and how to grant Full Authorization in the General Authorizations window.
---

# Query with Permission Control

Like semantic layer views, only authorized users have the authorization to access the corresponding queries.

By default, a normal user has no permission to run queries. Attempting to do so would end in failure. For example, login to the Service Layer with a normal user (user1) and then send a request to invoke the List function on an existing SQLQueries (for example, with key = 'SalesQuery1'):

```http
GET https://server:50000/b1s/v1/SQLQueries('SalesQuery1')/List HTTP/1.1
```

As expected, service returns:

> **Output Code**
>
> ```http
> HTTP/1.1 403 Forbidden
> {
>     "error": {
>         "code": -6006,
>         "message": {
>             "lang": "en-us",
>             "value": "You are not permitted to perform this action"
>         }
>     }
> }
> ```

To grant permission to a normal user, log on the SAP Business One client with a super user, then open the *General Authorizations* window from the menu *Administration* > *System Initialization* > *Authorizations*, find the specific SQL Query from *Service Layer SQL Query* subject, and then change *No Authorization* to *Full Authorization*.

Figure: The General Authorizations window with the Service Layer SQL Query subject.

The Users tab shows `user1` selected. In the Subject grid the *Service Layer SQL Query* group is expanded, with Authorization *Various Authorizations*. It lists the individual queries *SalesQuery1 Partner1*, *SalesQuery2 Partner1*, *SalesQuery3 Partner1*, *BPQuery1 Partner2*, *BPQuery2 Partner2* and *BPQuery3 Partner2*. Only *SalesQuery1 Partner1* is set to *Full Authorization*; the rest are *No Authorization*. This is where an administrator grants a normal user access to specific SQL queries.

To grant a normal user the authorization to create, update, remove and read Service Layer SQL queries, login to the SAP Business One client with a super user, then open the *General Authorizations* window from the menu *Administration* > *System Initialization* > *Authorizations*, and grant *Full Authorization* to the user on the subject *Modify SQL Queries in Service Layer*.

Figure: The General Authorizations window with the Modify SQL Queries in Service Layer subject highlighted.

The Users tab shows `APCN_A1` selected and the Subject grid lists the authorizations. The row *Modify SQL Queries in Service Layer* is outlined in red, with Authorization and Effective Authorization both set to *Full Authorization*.

> **Note**
>
> - Superusers have full permission to carry out any operations on SQL queries.
> - By design, the normal users do not have permission to create/delete/update SQL queries as well. However, the retrieval authorization is granted.
> - For the sake of performance, the updated authorization for the normal user might not take effect immediately. To get the latest data, wait for a while (for example, one minute) to allow the internal permission cache mechanism to refresh.
