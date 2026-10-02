---
title: EventSubscription Permission Control
source: pdf pp. 192-193, sec 7.3.3
summary: Who may manipulate event subscriptions, and how to grant the Webhook Manipulation permission in the client or through SBOBobService_SetSystemPermission.
---

# EventSubscription Permission Control

Only authorized users can manipulate event subscriptions. By default, normal users don't have this permission. Attempting to do so results in a "403 Forbidden" error.

To grant permission to a normal user, log in to the SAP Business One client as a superuser. Open the *General Authorizations* window, search for the permission entry *Webhook Manipulation*, and change "No Authorization" to "Full Authorization" or "Read-Only."

Figure: The General Authorizations window with the Webhook Manipulation permission entry.

The window lists users on the left (AlertSvc, B1i, EDsUser, manager, Support, `user1`, Workflow) with `user1` selected. In the Subject/Authorization grid, *Webhook Manipulation* is outlined in red, with Authorization *Full Authorization* and Effective Authorization *Full Authorization*. Every other visible subject, such as *Modify SQL Queries in Service Layer* and *Disable DI API Permission Check*, is set to *No Authorization*.

The permission ID for this webhook permission entry is 2249. To grant permission programmatically as a superuser, use the Service Layer API `SBOBobService_SetSystemPermission` to update authorizations for a specific user. Here is an example of how to grant full authorization for webhook manipulation to a user with user ID "user1":

```http
POST SBOBobService_SetSystemPermission
{
    "PermissionID": "2249",
    "UserCode": "user1",
    "Permission": 1
}
```

<!-- supplement -->

`Permission` takes 1 for Full Authorization, 2 for Read-Only and 3 for No Authorization.

<!-- /supplement -->

> **Note**
>
> - Superusers have full permission to perform any operations on EventSubscription.
> - The updated permission might not take effect immediately due to an internal permission cache. Generally, you need to wait for a short period, such as one minute, for the permission cache to refresh.
