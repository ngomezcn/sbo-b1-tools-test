# Appendix: DI API comparison

## [CRUD APIs](crud-apis.md)
Use when: porting DI API create, retrieve, update or delete code for an Order to Service Layer calls; reading the chapter 11 overview of API categories (CRUD, transaction, query, company service, UDO).
Terms: `Add`, `GetByKey`, `Update`, `Remove`, `POST /Orders`, `GET /Orders(2)`, `PATCH`, `DELETE`, `SAPbobsCOM`
Not here: Service Layer entity CRUD on its own → [consuming-service-layer](../consuming-service-layer/crud-operations.md); CRUD of stored queries → [sql-query](../sql-query/crud-operations.md)

## [Company Service APIs](company-service-apis.md)
Use when: translating DI API `CompanyService` calls (`GetCompanyInfo`, `UpdateCompanyInfo`) to Service Layer.
Terms: `CompanyService`, `GetCompanyInfo`, `UpdateCompanyInfo`, `CompanyService_GetCompanyInfo`, `CompanyService_UpdateCompanyInfo`, `FunctionImport`

## [Transaction APIs](transaction-apis.md)
Use when: porting DI API `StartTransaction` / `EndTransaction` code to Service Layer.
Terms: `StartTransaction`, `EndTransaction`, `$batch`, changeset
Not here: batch syntax and change sets → [batch-operations](../consuming-service-layer/batch-operations.md); the script Transaction API → [transaction-api](../consuming-service-layer/javascript-extension/transaction-api.md); unsupported transactions → [limitations](../limitations/index.md)

## [Query APIs](query-apis.md)
Use when: porting DI API `Recordset.DoQuery` code to Service Layer queries.
Terms: `Recordset`, `DoQuery`, `GET`, `$filter`
Not here: OData query options → [query-options](../consuming-service-layer/query-options/index.md); stored SQL queries → [sql-query](../sql-query/index.md)

## [UDO APIs](udo-apis.md)
Use when: comparing how a UDT and UDO (`MyOrder`) are created and used through the DI API and Service Layer.
Terms: `UserTablesMD`, `UserObjectsMD`, `MYORDER`, `MYORDERLINES`
Sections: [Creating UDOs](udo-apis.md#creating-udos) · [CRUD and Query Operations](udo-apis.md#crud-and-query-operations)
Not here: UDO management in Service Layer → [user-defined-objects](../consuming-service-layer/user-defined-objects/index.md)

## [UDF APIs](udf-apis.md)
Use when: comparing how UDFs are created and used on entities through the DI API and Service Layer.
Terms: `UserFieldsMD`, `U_` fields, `UserFields`
Sections: [CRUD Operations](udf-apis.md#crud-operations) · [Performing Operations on Entities with UDFs](udf-apis.md#performing-operations-on-entities-with-udfs)
Not here: UDFs in Service Layer → [user-defined-fields](../consuming-service-layer/user-defined-fields.md)

## [Metadata Naming Differences](metadata-naming-differences.md)
Use when: mapping a DI API object, collection or property name to its Service Layer name, or the reverse.
Terms: collection object names, business object names, property names, `BPFiscalTaxIDCollection`, `BillOfExchangeTrans_BankPages`
Sections: [Collection Object Naming Difference](metadata-naming-differences.md#collection-object-naming-difference) · [Business Object Naming Difference](metadata-naming-differences.md#business-object-naming-difference) · [Property Naming Difference](metadata-naming-differences.md#property-naming-difference)
Not here: reading `$metadata` → [metadata-document](../consuming-service-layer/metadata-document.md)
