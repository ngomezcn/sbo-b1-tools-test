---
title: Company Service APIs
source: pdf pp. 232-233, sec 11.2
summary: How GetCompanyInfo and UpdateCompanyInfo are invoked in the DI API and in Service Layer.
---

# Company Service APIs

We take the objects **GetCompanyInfo** and **UpdateCompanyInfo** as examples to show how to invoke company service APIs.

## DI API

### GetCompanyInfo

> **Sample Code**
>
```csharp
SAPbobsCOM.CompanyService companyService = oCompany.GetCompanyService();
SAPbobsCOM.CompanyInfo companyInfo = companyService.GetCompanyInfo();
Console.WriteLine("initial: company version:{0}, company name: {1}, company
name: {2},",
   companyInfo.Version, companyInfo.CompanyName,
companyInfo.AutoCreateCustomerEqCard);
```

### UpdateCompanyInfo

> **Sample Code**
>
```csharp
...//following the above code snippet
companyInfo.AutoCreateCustomerEqCard = BoYesNoEnum.tYES;
companyService.UpdateCompanyInfo(companyInfo);
companyInfo = companyService.GetCompanyInfo();
Console.WriteLine("updated: company version:{0}, company name: {1}, company
name: {2},",
   companyInfo.Version, companyInfo.CompanyName,
companyInfo.AutoCreateCustomerEqCard);
```

## Service Layer

### GetCompanyInfo

> **Sample Code**
>
```http
POST /CompanyService_GetCompanyInfo
```

### UpdateCompanyInfo

> **Sample Code**
>
```http
POST /CompanyService_UpdateCompanyInfo
{
  "CompanyInfo": {
    "Version": 910160,
    "EnableExpensesManagement": "tYES",
    ...
    "AutoCreateCustomerEqCard": "tYES",
        ...
  }
}
```

> **Note**
>
> This kind of APIs in Service Layer is called `FunctionImport` or `Action` in OData terminology.
