---
title: JavaScript Deployment
source: pdf pp. 130-132, sec 3.19.8
summary: How to package a Service Layer script with an ard file, import it through the extension manager, assign it to a company and call it by URL.
---

# JavaScript Deployment

Service Layer reuses the extension manager to manage the life cycle of script files. Similar to the DIAPI add-on, extension applications developed by Service Layer are deployed to SLD as well.

Assume you have a script file `Items.js`; take the following steps to deploy it:

1. Create an `ard` file named `Items.ard` in the below format to describe the meta of this script file. Meanwhile, the `ard` file can also be used to determine the script URL path.

```xml
<?xml version="1.0" encoding="utf-8"?>
                    <AddOnRegData xmlns:xsi="http://www.w3.org/2001/XMLSchema-
instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                    SlientInstallation="" SlientUpgrade=""
Partnernmsp="mtcsysnm" SchemaVersion="3.0"
                    Type="ServiceLayerScript" OnDemand="" OnPremise=""
ExtName="ItemsExt"
                    ExtVersion="1.00" Contdata="sa" Partner="mtcsys"
DBType="HANA" ClientType="S">
                    <ServiceLayerScripts>
                    <Script Name="items" FileName="Items.js"></Script>
                    </ServiceLayerScripts>
                    <XApps>
                    <XApp Name="" Path="" FileName="" />
                    </XApps>
                    </AddOnRegData>
```

2. Compress the `ard` file and script file into a `zip` file (e.g. `Items.zip`).
3. Upload `Items.zip` to the extension manager from the *Extension Import Wizard*.

4. From the *Extension Assignment Wizard*, assign the extension application to one company.

5. Log in to the company with Service Layer and access the script with the following URL: `/b1s/v1/script/mtcsys/items`

> **Note**
>
> - The script URL is a combination of partner name and script name separated by a '/' appended to the Service Layer base URL `/b1s/v1/`.
> - Currently, Service Layer does not support compressing multiple script files into one `ard` file.
> - For more details about how to deploy extension applications, see the guide *How to Package and Deploy SAP Business One Extensions for Lightweight Deployment*.
> - In the `ard` file, do not name the value of the attribute `Partner` as `test`, as `test` is a reserved word for internal testing.
