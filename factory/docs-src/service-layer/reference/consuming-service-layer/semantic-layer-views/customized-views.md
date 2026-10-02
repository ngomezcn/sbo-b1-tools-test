---
title: Customized Views Exposure and Query
source: pdf pp. 63-66, sec 3.7.8, 3.7.9
summary: How to expose customer-designed SAP HANA views through the Semantic Layer service (model packaging, deployment) and how to query them.
---

# Customized Views Exposure and Query

## Customized Views Exposure

Besides the system built-in views, the customer designed views are also able to be exposed as OData service.

To achieve this, first use the latest **SAP HANA Model Package Tool** to generate a compressed model package after exporting the designed SAP HANA models from SAP HANA Studio. As for how to download and use this tool, see this blog (https://blogs.sap.com/2014/07/24/how-to-export-and-deploy-hana-model-for-sap-business-one/).

Compared to the old versions, in the *SAP HANA Model Packaging Wizard for SAP Business One*, a column named as *Enable for Service Layer* is added with checkbox type.

For this newly introduced column, the behaviors are described as follows:

- It is disabled for all views, except the views with calculation type.
- The default value is unchecked.
- If it is checked, a new parameter `SLEnable="Y"` is added to SAP HANA Model information file `Info.XML`.
- The new version packaging tool is compatible with the old version exported views. `<Model name="xxxx" type="CalculationView" menu="mymenu" IAEnable="N" SLEnable="Y" SLExpose="Y" />`
- If `SLEnable = "N"` or no `SLEnable` tag in `Info.XML`, the corresponding views should be disabled in the *SAP HANA Model Management* window.

Once the model package is ready, open the *SAP HANA Model Management* window in the SAP Business One client, import the package and click the *Deploy* button to start the deployment process as follows:

Figure: The SAP HANA Model Management window.

Screenshot of the *SAP HANA Model Management* window. The top grid has two rows: `SAP HANA Model Package` (author `SAP`, version `1.2`, status `Deployed`) and the highlighted row `partner_model` (author `andy`, version `1`, status `Imported`), whose description reads "it is a test". The lower grid lists five views: `MyItem` and `SalesExView` (*Calculation View*), `AN_MY_INVOICE` (*Analytic View*), and `DIM_MYBP` and `DIM_MYDATE` (*Attribute View*). The *Service Layer Expose* cell of the first row (`MyItem`) is highlighted and its checkbox is unchecked. The *OK*, *Deploy* and *Import* buttons are at the bottom.

> **Note**
>
> - Customized views are not allowed to have the same name as the system built-in view, even with a different package path. Otherwise, the service will respond with an error.
> - Likewise, the authorization mechanism can also be applied to customized views.
> - One significant functionality of exposing customized views is to provide an alternative to the `RecordSet` in DI API, which is not allowed to expose in Service Layer for security and compatibility considerations.

## Customized Views Query

Likewise, all queries supported on system built-in views can be performed on customized views as well. See the following examples:

### Get all records from view

```http
GET https://databaseserver:50000/b1s/v1/sml.svc/MyItem
```

### Query one record from view

```http
GET GET https://databaseserver:50000/b1s/v1/sml.svc/MyItem(2)
```

### Get data with projection, filter and orderby

```http
GET https://databaseserver:50000/b1s/v1/sml.svc/MyItem?$select=ItemGroup,
ItemCode&$filter=ItemCode ne 'FA10004'&$orderby=ItemCode desc,ItemGroup
```

### Get data with aggregation

```http
GET https://databaseserver:50000/b1s/v1/sml.svc/MyItem?$apply=aggregate(ItemCode
with countdistinct as CountDistinctItemCode)

GET https://databaseserver:50000/b1s/v1/sml.svc/MyItem?$apply=filter(IsPurchaseItem
eq 'N')/groupby((ItemGroup), aggregate(ItemCode with max as MaxItemCode))
```
