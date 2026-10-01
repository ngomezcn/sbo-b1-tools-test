---
title: Semantic Layer View Authorization
source: pdf pp. 57-58, sec 3.7.6
summary: Why a normal user gets 401 on Semantic Layer views by default and how to grant view permission in General Authorizations.
---

# Semantic Layer View Authorization

For SAP Business One forms, only authorized users have the privilege to access the corresponding views.

By default, a normal user has no permission to access views. Attempting to access would result in failure.

For example, log in to Service Layer with a normal user (e.g. **user1**) and then send a request to retrieve *BalanceSheetQuery*.

```http
GET /b1s/v1/sml.svc/
BalanceSheetQueryParameters(P_FinancialPeriod='2017',P_AddVoucher='N')/
BalanceSheetQuery
```

Service returns:

```http
HTTP/1.1 401 Unauthorized
{
    "error": {
        "code": -1,
        "message": {
            "lang": "en-us",
            "value": "No permission to access this view 'BalanceSheetQuery' for
the current user 'user1'"
        }
    }
}
```

To grant the view permission to a normal user, log on to the SAP Business One client with the superuser and then open the *General Authorizations* window from *System Initialization* > *Authorizations*.

Figure: The General Authorizations window.

Screenshot of the *Authorizations* window with the user `andy` selected in the *Users* list on the left. The tree on the right is expanded along *Analytics > Semantic Layer > Financials > Financial Accounting*. The *Balance Sheet Query* row is highlighted: its *Authorization* column is set to `Full Authorization` and its *Effective Authorization* column also shows `Full Authorization`. The other visible rows, such as *Balance Sheet Comparison Query* and *Cash Flow Statement Query*, show `No Authorization`. The *Full Authorization*, *Read Only* and *No Authorization* buttons are at the bottom right.

> **Note**
>
> Superusers have permission to access all exposed views.
>
> The updated authorization for the normal user would not take effect immediately. To get the latest data, log off and log on to the service again or simply restart the service.
