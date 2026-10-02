---
title: Semantic Layer Basic Authentication
source: pdf pp. 66-67, sec 3.7.10
summary: How to access Semantic Layer views through browser basic authentication by combining user name and company database in the user name.
---

# Semantic Layer Basic Authentication

Semantic Layer allows you to access views through basic authentication in browsers.

However, basic authentication only allows you to input user name and password. There is not a third input box for company database.

To address this issue, the solution combines the SAP Business One user name and company database together in a JSON format as the user name for basic authentication.

For example, for the browser Microsoft Edge, the sign-in dialog for `/b1s/v1/sml.svc/$metadata` takes the following values:

- **User name**: `{"CompanyDB": "US0926","UserName": "manager"}`
- **Password**: the password of the SAP Business One user (`manager` in this example).

> **Note**
>
> Basic authentication is another login mechanism just for Semantic Layer service. The authenticated session is not allowed to be reused to access the Service Layer resources (for example, BusinessPartners, Orders).
