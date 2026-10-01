---
title: Metadata Naming Differences
source: pdf pp. 245-248, sec 12
summary: How Service Layer metadata names differ from DI API names for collection objects, business objects and properties, with the full name mapping tables.
---

# Metadata Naming Differences

- [Collection Object Naming Difference](#collection-object-naming-difference)
- [Business Object Naming Difference](#business-object-naming-difference)
- [Property Naming Difference](#property-naming-difference)

Service Layer is built on top of DI Core and reuses its metadata. Actually, to follow OData protocol, Service Layer slightly modifies the metadata. The differences are reflected in the following aspects.

## Collection Object Naming Difference

For Service Layer, the collection object metadata can be found by checking /b1s/v1/$metadata while for DI API, GetBusinessObjectXmlSchema can be invoked to retrieve the metadata.

From the table below, it can be inferred that Service Layer takes more sensible names.

<!-- table: t245-01 -->
| Service Layer | DI API |
|---|---|
| AccountSegmentationsCategories | Categories |
| BPAccountReceivablePaybleCollection | BPAccountReceivablePayble |
| BPFiscalTaxIDCollection | BPFiscalTaxID |
| BPWithholdingTaxCollection | BPWithholdingTax |
| BillOfExchangeTransBankPages | BillOfExchangeTrans_BankPages |
| BillOfExchangeTransDeposits | BillOfExchangeTrans_Deposits |
| BillOfExchangeTransactionLines | BillOfExchangeTransaction_Lines |
| BudgetCostAccountingLines | BudgetCostAccounting_Lines |
| BudgetLines | Budget_Lines |
| BusinessPlaceIENumbers | IENumbers |
| BusinessPlaceTributaryInfos | TributaryInfos |
| CashFlowAssignments | PrimaryFormItems |
| CheckInListParams | CheckIns |
| DocFreightEBooksDetails | Doc_Freight_EBooks_Doc_Details |
| DocsInWTGroupsCollection | DocsInWTGroups |
| DocumentAdditionalExpenses | DocumentsAdditionalExpenses |
| DocumentInstallments | Document_Installments |
| DocumentLineAdditionalExpenses | Document_LinesAdditionalExpenses |
| DocumentLines | Document_Lines |
| DocumentReferences | DocumentReference |
| DocumentSpecialLines | Document_SpecialLines |
| EBooksDetails | Line_EBooks_Doc_Details |
| EmployeeAbsenceInfoLines | EmployeeAbsenceInfo |
| EmployeeEducationInfoLines | EmployeeEducationInfo |
| EmployeePreviousEmpoymentInfoLines | EmployeePrevEmpoymentInfo |
| EmployeeReviewsInfoLines | EmployeeReviewsInfo |
| EmployeeRolesInfoLines | EmployeeRolesInfo |
| EmployeeSavingsPaymentInfoLines | EmployeeSavingsPaymentInfo |
| FieldIDs | FormattedSearchFields |
| InventoryCountingDocumentReferencesCollection | InventoryCountingDocumentReferences |
| InventoryPostingDocumentReferencesCollection | InventoryPostingDocumentReferences |
| ItemBarCodeCollection | ItemBarCodes |
| ItemCycleCounts | ItemCycleCount |
| ItemDepreciationParameters | ItemDepreciationParam |
| ItemDistributionRules | ItemDistributionRule |
| ItemGroupsWarehouseInfos | ItemGroups_WarehouseInfo |
| ItemLocalizationInfos | LocalizationInfos |
| ItemPeriodControls | ItemPeriodControl |
| ItemPrices | Items_Prices |
| ItemUnitOfMeasurementCollection | ItemUnitOfMeasurement |
| ItemUoMPackageCollection | ItemUoMPackage |
| ItemWarehouseInfoCollection | ItemWarehouseInfo |
| JournalEntryLines | JournalEntries_Lines |
| LineFreightEBooksDetails | Line_Freight_EBooks_Doc_Details |
| MaterialRevaluationDocumentReferencesCollection | MaterialRevaluationDocumentReferences |
| MaterialRevaluationLines | MaterialRevaluation_lines |
| PaymentAccounts | Payments_Accounts |
| PaymentChecks | Payments_Checks |
| PaymentCreditCards | Payments_CreditCards |
| PaymentDocumentReferencesCollection | Payments_DocumentReferences |
| PaymentInvoices | Payments_Invoices |
| PickListsLines | PickLists_Lines |
| ProductTreeLines | ProductTrees_Lines |
| ProductTreeStages | ProductTrees_Stages |
| ProductionOrderLines | ProductionOrders_Lines |
| ProductionOrdersDocumentReferences | ProductionOrders_DocumentReferences |
| ProductionOrdersSalesOrderLines | ProductionOrders_SalesOrderLines |
| ProductionOrdersStages | ProductionOrders_Stages |
| ProgressiveTax_Lines | WithholdingTaxCodes_ProgressiveTax_Lines |
| SNBLinesCollection | SNBLines |
| SalesForecastLines | SalesForecast_Lines |
| SpecialPriceDataAreas | SpecialPricesDataAreas |
| SpecialPriceQuantityAreas | SpecialPricesQuantityAreas |
| StockTransferLines | StockTransfer_Lines |
| StockTransferTaxExtension | StockTransfer_TaxExtension |
| UserPermission | UserPermissionItem |
| WTGroupsCollection | WTGroups |
| WithholdingTaxCertificatesCollection | WithholdingTaxCertificates |
| WithholdingTaxDataCollection | WithholdingTaxData |
| WithholdingTaxDataWTXCollection | WithholdingTaxDataWTX |

## Business Object Naming Difference

To conform to OData naming convention, Service Layer adopts plural format if the BO name is of singular format.

<!-- table: t247-02 -->
| Service Layer | DI API |
|---|---|
| InventoryGenExits | InventoryGenExit |
| InventoryGenEntries | InventoryGenEntry |

## Property Naming Difference

To follow OData protocol, Service Layer changes a property name by appending 'Property' if it is the same as its residing object.

<!-- table: t248-01 -->
| Service Layer | DI API |
|---|---|
| BatchNumber.BatchNumberProperty | BatchNumber.BatchNumber |
| Activity.ActivityProperty | Activity.Activity |
| PeriodCategory.PeriodCategoryProperty | PeriodCategory.PeriodCategory |
