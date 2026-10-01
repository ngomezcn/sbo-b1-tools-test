---
title: Authorize a SQL View
source: pdf pp. 73-74, sec 3.8.5
summary: How normal users are denied access to exposed SQL views by default and how a superuser grants view permission in the Authorizations window.
---

# Authorize a SQL View

As in SAP Business One, only authorized users have the privilege to access the corresponding views.

By default, a normal user has no permission to access views; attempting to do so would end in failure. For example, log in to Service Layer with a normal user and then send a request to retrieve **B1_ItemPriceB1SLQuery**:

```http
GET /b1s/v1/view.svc/B1_ItemPriceB1SLQuery
```

As expected, the service returns:

```http
HTTP/1.1 403 Forbidden
{
"error" : {
"code" : 804,
"message" : {
"lang" : "en-us",
"value" : "No permission to access this view
'B1_ItemPriceB1SLQuery' for the current user."
}
}
}
```

To grant the view permission to a normal user, perform the following:

1. Log on to SAP Business One client with a superuser.
2. Open the *Authorizations* window (*System Initialization* -> *Authorizations*).
3. Change *No Authorization* to *Full Authorization*.

> **Note**
>
> - Superusers have full permission to access all exposed views.
> - The updated authorization for the normal user might not take effect immediately. To get the latest data, wait for a while (for example, one minute) to allow the internal permission cache mechanism to get refreshed.
> - The view's authorization is reset to *No Authorization* if the view is updated to **unexposed** status.
