# BusinessPartners

- Fetched: 2026-10-02T15:55:52.088Z
- OData version: v2 (B1 FP 2608)
- Entity type: BusinessPartner · Key: CardCode
- Legend: fields are grouped by type; `!` after a name = Nullable=false in $metadata (not always the same as mandatory when writing), any other field may be left empty. A type followed by (a | b) is an enumeration and those are its valid values. `[]` = collection. $metadata gives no size for standard fields.

## Standard fields
- DateTimeOffset: DeductionValidUntil, CreditCardExpiration, ValidFrom, ValidTo, FrozenFrom, FrozenTo, DunningDate, ExemptionValidityDateFrom, ExemptionValidityDateTo, ExpirationDate, RelationshipDateFrom, RelationshipDateTill, UpdateDate, CreateDate
- Double: CreditLimit, MaxCommitment, DiscountPercent, DeductionPercent, IntrestRatePercent, CommissionPercent, MinIntrest, CurrentAccountBalance, OpenDeliveryNotesBalance, OpenOrdersBalance, OpenChecksBalance, MaxAmountOfExemption
- Int32: GroupCode, PayTermsGrpCode, PriceListNum, CommissionGroupCode, SalesPersonCode, AvarageLate, ShippingType, CreditCardCode, OpenOpportunities, Priority, FormCode1099, DunningLevel, PaymentBlockDescription, LastMultiReconciliationNum, DefaultTechnician, Territory, LanguageCode, WithholdingTaxDeductionGroup, ClosingDateProcedureNumber, Remark1, Industry, ETaxWebSite, Series, CampaignNumber, DefaultBlanketAgreementNumber, AttachmentEntry, OwnerCode, EDocBuildingNumber, DefaultTransporterEntry, DefaultTransporterLineNumber, MainUsage, EBooksVATExemptionCause, DataVersion
- String: CardCode!, CardName, Address, ZipCode, MailAddress, MailZipCode, Phone1, Phone2, Fax, ContactPerson, Notes, FederalTaxID, FreeText, Currency, RateDiffAccount, Cellular, City, County, Country, MailCity, MailCounty, MailCountry, EmailAddress, Picture, DefaultAccount, DefaultBranch, DefaultBankCode, AdditionalID, Pager, FatherCard, CardForeignName, DeductionOffice, ExportCode, VatGroup, Password, Indicator, IBAN, CreditCardNum, DebitorAccount, ValidRemarks, FrozenRemarks, Block, BillToState, ShipToState, ExemptNum, Box1099, PeymentMethodCode, BankCountry, HouseBank, HouseBankCountry, HouseBankAccount, ShipToDefault, DME, InstructionKey, ISRBillerID, ReferenceDetails, HouseBankBranch, OwnerIDNumber, TaxExemptionLetterNum, LinkedBusinessPartner, CertificateNumber, NationalInsuranceNum, WTCode, BillToBuildingFloorRoom, DownPaymentClearAct, ChannelBP, BilltoDefault, CustomerBillofExchangDisc, ShipToBuildingFloorRoom, CustomerBillofExchangPres, ProjectCode, VatGroupLatinAmerica, DunningTerm, Website, OtherReceivablePayable, BillofExchangeonCollection, UnpaidBillofExchange, Profession, BankChargesAllocationCode, CompanyRegistrationNumber, VerificationNumber, ConCerti, DownPaymentInterimAccount, PlanningGroup, VatIDNum, DatevAccount, GTSRegNo, GTSBankAccountNo, GTSBillingAddrTel, HouseBankIBAN, VATRegistrationNumber, RepresentativeName, IndustryType, BusinessType, InterestAccount, FeeAccount, AliasName, GlobalLocationNumber, EDISenderID, EDIRecipientID, RelationshipCode, UnifiedFederalTaxID, AgentCode, EDocStreet, EDocStreetNumber, EDocZipCode, EDocCity, EDocCountry, EDocDistrict, EDocRepresentativeFirstName, EDocRepresentativeSurname, EDocRepresentativeCompany, EDocRepresentativeFiscalCode, EDocRepresentativeAdditionalId, EDocPECAddress, IPACodeForPA, ECommerceMerchantID, LegalText, CertificateDetails, DefaultCurrency, EORINumber, SirenNumber, SiretNumber, VATExemptionReason, RoutingCode
- TimeOfDay: UpdateTime, CreateTime
- AssesseeTypeEnum (atCompany | atOthers): TypeReport
- AutomaticPostingEnum (apNo | apInterestAndFee | apInterestOnly | apFeeOnly): AutomaticPosting
- BoCardCompanyTypes (cCompany | cPrivate | cGovernment | cEmployee | cSoleTaxableSubject): CompanyPrivate
- BoCardTypes (cCustomer | cSupplier | cLid): CardType
- BoFatherCardTypes (cPayments_sum | cDelivery_sum): FatherType
- BoPublicDirectoryStatusTypes (pds_ActivePrivateEntry | pds_ActivePublicEntry | pds_InactivePrivateEntry | pds_InactivePublicEntry | pds_NotRegistered): PublicDirectoryStatus
- BoTaxRoundingRuleTypes (trr_RoundDown | trr_RoundUp | trr_RoundOff | trr_CompanyDefault): TaxRoundingRule
- BoVatStatus (vExempted | vLiable | vEC): VatLiable
- BoYesNoEnum (tNO | tYES): DeductibleAtSource, Valid, Frozen, BackOrder, PartialDelivery, BlockDunning, CollectionAuthorization, SinglePayment, PaymentBlock, DeferredTax, Equalization, AccrualCriteria, Properties1-64, ThresholdOverlook, SurchargeOverlook, InsuranceOperation347, HierarchicalDeduction, WithholdingTaxCertified, BookkeepingCertified, Affiliate, DatevFirstDataEntry, UseShippedGoodsAccount, NoDiscounts, EffectivePriceConsidersPriceBeforeDiscount, EndorsableChecksFromBP, AcceptsEndorsedChecks, BlockSendingMarketingContent, UseBillToAddrToDetermineTax, FCERelevant, FCEValidateBaseDelivery, ExchangeRateForIncomingPayment, ExchangeRateForOutgoingPayment, FCEAsPaymentMeans, NotRelevantForMonthlyInvoice, NaturalPer
- BoYesNoNoneEnum (boNO | boYES | boNONE): SubjectToWithholdingTax
- DiscountGroupBaseObjectEnum (dgboNone | dgboItemGroups | dgboItemProperties | dgboManufacturer | dgboItems): DiscountBaseObject
- DiscountGroupRelationsEnum (dgrLowestDiscount | dgrHighestDiscount | dgrAverageDiscount | dgrDiscountTotals | dgrMultipliedDiscount): DiscountRelations, EffectiveDiscount
- EDocGenerationTypeEnum (edocGenerate | edocGenerateLater | edocNotRelevant | edocGenerateOffline): EDocGenerationType
- EffectivePriceEnum (epDefaultPriority | epLowestPrice | epHighestPrice): EffectivePrice
- ExemptionMaxAmountValidationTypeEnum (emaIndividual | emaAccumulated): ExemptionMaxAmountValidationType
- OperationCode347Enum (ocGoodsOrServiciesAcquisitions | ocPublicEntitiesAcquisitions | ocTravelAgenciesPurchases | ocSalesOrServicesRevenues | ocPublicSubsidies | ocTravelAgenciesSales): OperationCode347
- PriceModeEnum (pmNet | pmGross): PriceMode
- ResidenceNumberTypeEnum (rntSpanishFiscalID | rntVATRegistrationNumber | rntPassport | rntFiscalIDIssuedbytheResidenceCountry | rntCertificateofFiscalResidence | rntOtherDocument): ResidenNumber
- ShaamGroupEnum (sgServicesAndAsset | sgAgriculturalProducts | sgInsuranceCommissions | sgWHTaxInstructions | sgInterestExchangeRateDiffs | sgRentalFees): ShaamGroup
- TypeOfOperationEnum (tooProfessionalServices | tooRentingAssets | tooOthers | tooDisposalOfGoods | tooImportOfGoodsAndServices | tooImportByVirtualTransfer | tooGlobalOperations): TypeOfOperation

## User fields (OCRD)
U_SBOCTX: alpha(10) ! — default "A" — ctx test — values: A=Alpha | B=Beta

## ElectronicProtocols: ElectronicProtocol[]
- DateTimeOffset: FPASendDateSDI, EBooksDispatchDate
- Int32: MappingID, EDocType, FPASequenceNumber
- RelatedDocument[]: RelatedDocuments
- String: Confirmation, CFDiCancellationReason, CFDiCancellationResponse, EBooksMARK, EBooksMARKofNegative, EBooksInvoiceType, EBooksInvoiceTypeofNegative, EBillingIRN, EETPKP, EETBKP, SignatureInputMessage, SignatureDigest, FechaTimbrado, SelloSAT, PaymentMethod, RfcProvCertif, NoCertificadoSAT, FPAProgressivo, ProtocolDescription, CFDiExport, EBillingAckNo, EBillingAckDt, EBillingSignedInvoice, EBillingSignedQRCode, EBillingResponseStatus, CFDiCancellationReference, EBooksQRCodePath, EBooksQRCodePathofNegative, CartaPorteID
- TimeOfDay: EBooksDispatchTime
- BoYesNoEnum (tNO | tYES): TestingMode, EBooksRelevant
- ElectronicDocGenTypeEnum (edgt_NotRelevant | edgt_Generate | edgt_GenerateLater | edgt_GenerateOffline): GenerationType
- ElectronicDocProtocolCodeEnum (edpc_Invalid | edpc_GEN | edpc_EET | edpc_CFDI | edpc_FPA | edpc_MTD | edpc_EWB | edpc_PEPPOL | edpc_HOI | edpc_MYF | edpc_EIS | edpc_IIS | edpc_IIS_Annual | edpc_DIGIPOORT | edpc_EBooks | edpc_DOX | edpc_RTIE | edpc_EBilling | edpc_TaxService | edpc_AFE | edpc_DocSign | edpc_KSeF | edpc_GSTReturn | edpc_PTDocSign | edpc_SkatDK | edpc_EII | edpc_NFe | edpc_PTeInvoicing | edpc_PTeCom | edpc_VeriFactu | edpc_BAS | edpc_PDFwithXML | edpc_FReINV | edpc_euBP | edpc_ILOI | edpc_EDGT | edpc_EDCR | edpc_NAV): ProtocolCode

## BPAddresses: BPAddress[]
- DateTimeOffset: CreateDate
- Int32: RowNum
- String: AddressName, Street, Block, ZipCode, City, County, Country, State, FederalTaxID, TaxCode, BuildingFloorRoom, AddressName2, AddressName3, TypeOfAddress, StreetNo, BPCode, GlobalLocationNumber, Nationality, TaxOffice, GSTIN, SiretNumber, RoutingCode, Suffix
- TimeOfDay: CreateTime
- BoAddressType (bo_ShipTo | bo_BillTo): AddressType
- BoGSTRegnTypeEnum (invalid | gstRegularTDSISD | gstCasualTaxablePerson | gstCompositionLevy | gstGoverDepartPSU | gstNonResidentTaxablePerson | gstUNAgencyEmbassy): GstType
- BoMYFTypeEnum (myft_WholesaleSales | myft_RetailSales | myft_WholesalePurchases | myft_OtherExpenseTransactions): MYFType
- BoYesNoEnum (tNO | tYES): TaasEnabled
User fields (CRD1):
U_B1SYS_DIR3_01: alpha(100) — Oficina Contable
U_B1SYS_DIR3_02: alpha(100) — Organo Gestor
U_B1SYS_DIR3_03: alpha(100) — Unidad Tramitadora

## ContactEmployees: ContactEmployee[]
- ContactEmployeeBlockSendingMarketingContent[]: ContactEmployeeBlockSendingMarketingContents
- DateTimeOffset: DateOfBirth, CreateDate, UpdateDate
- Int32: InternalCode
- String: CardCode, Name, Position, Address, Phone1, Phone2, MobilePhone, Fax, E_Mail, Pager, Remarks1, Remarks2, Password, PlaceOfBirth, Profession, Title, CityOfBirth, FirstName, MiddleName, LastName, EmailGroupCode, ConnectedAddressName, ForeignCountry, GenderEx
- TimeOfDay: CreateTime, UpdateTime
- BoAddressType (bo_ShipTo | bo_BillTo): ConnectedAddressType
- BoGenderTypes (gt_Female | gt_Male | gt_Undefined | gt_Masked | gt_Invalid): Gender
- BoYesNoEnum (tNO | tYES): Active, BlockSendingMarketingContent, NaturalPer
User fields (OCPR):
None.

## BPAccountReceivablePaybleCollection: BPAccountReceivablePayble[]
- String: AccountCode, BPCode
- BoBpAccountTypes (bpat_General | bpat_DownPayment | bpat_AssetsAccount | bpat_Receivable | bpat_Payable | bpat_OnCollection | bpat_Presentation | bpat_AssetsPayable | bpat_Discounted | bpat_Unpaid | bpat_OpenDebts | bpat_Domestic | bpat_Foreign | bpat_CashDiscountInterim | bpat_ExchangeRateInterim): AccountType

## BPPaymentMethods: BPPaymentMethod[]
- Int32: RowNumber
- String: PaymentMethodCode, BPCode

## BPWithholdingTaxCollection: BPWithholdingTax[]
- String: WTCode, BPCode

## BPPaymentDates: BPPaymentDate[]
- String: PaymentDate, BPCode

## BPBranchAssignment: BPBranchAssignmentItem[]
- Int32: BPLID
- String: BPCode
- BoYesNoEnum (tNO | tYES): DisabledForBP

## BPBankAccounts: BPBankAccount[]
- DateTimeOffset: SignatureDate, MandateExpDate
- Int32: LogInstance, InternalKey, ISRType
- String: UserNo4, BPCode, County, State, UserNo2, IBAN, ZipCode, City, Block, Branch, Country, Street, ControlKey, UserNo3, BankCode, AccountNo, UserNo1, BuildingFloorRoom, BIK, AccountName, CorrespondentAccount, Phone, Fax, CustomerIdNumber, ISRBillerID, BICSwiftCode, ABARoutingNumber, MandateID
- SEPASequenceTypeEnum (sstOOFF | sstFRST | sstRCUR | sstFNAL): SEPASeqType

## BPFiscalTaxIDCollection: BPFiscalTaxID[]
- Int32: CNAECode
- String: Address, TaxId0-11, BPCode, TaxId12, TaxId13, TaxId14
- BoAddressType (bo_ShipTo | bo_BillTo): AddrType
- BoYesNoEnum (tNO | tYES): AToRetrNFe

## DiscountGroups: DiscountGroup[]
- Double: DiscountPercentage
- String: ObjectEntry, BPCode
- DiscountGroupBaseObjectEnum (dgboNone | dgboItemGroups | dgboItemProperties | dgboManufacturer | dgboItems): BaseObjectType

## BPIntrastatExtension: BPIntrastatExtension
- Int32: TransportMode, Incoterms, NatureOfTransactions, StatisticalProcedure, CustomsProcedure, PortOfEntryOrExit
- String: CardCode, DomesticOrForeignID
- BoYesNoEnum (tNO | tYES): IntrastatRelevant

## BPBlockSendingMarketingContents: BPBlockSendingMarketingContent[]
- Int32: CommunicationMediaId
- String: CardCode
- BoYesNoEnum (tNO | tYES): Choose

## BPCurrenciesCollection: BPCurrencies[]
- String: CurrencyCode
- BoYesNoEnum (tNO | tYES): Include

## BPTributaryInfoCollection: BPTributaryInfo[]
- DateTimeOffset: TTStartDat, TTEndDate, TRCStartD, TRCEndDate
- Int32: TributID, TributType, TribRegCod
- String: CardCode, Address

## Expand (navigation properties)
CorrectionPurchaseInvoiceReversal, Drafts, StockTransferDrafts, Activities, PartnersSetups, DeductionTaxHierarchies, VendorPayments, MaterialRevaluation, ProductionOrders, InventoryTransferRequests, BlanketAgreements, Invoices, ExportDeterminations, LandedCosts, PurchaseDeliveryNotes, GoodsReturnRequest, PurchaseRequests, CreditNotes, PaymentDrafts, InventoryGenEntries, DepreciationAreas, GLAccountAdvancedRules, Orders, OpeningBalance1099s, DeliveryNotes, PurchaseDownPayments, Returns, ReturnRequest, CorrectionPurchaseInvoice, CorrectionInvoice, CorrectionInvoiceReversal, DownPayments, EmployeesInfo, CustomerEquipmentCards, PurchaseInvoices, PurchaseCreditNotes, ServiceContracts, ServiceCalls, BusinessPartnerGroup, PaymentTermsType, PriceList, CommissionGroup, SalesPerson, Currency2, ChartOfAccount, Country2, VatGroup2, ShippingType2, FactoringIndicator, CreditCard, BPPriority, Forms1099, WizardPaymentMethod, DunningLetter, PaymentBlock2, WithholdingTaxCode, EmployeeInfo, Territory2, Project, SalesTaxCode, DunningTerm2, UserLanguage, DeductionTaxGroup, ClosingDateProcedure, BankChargesAllocationCode2, Remark12, Industry2, TaxWebSite, Campaign, BlanketAgreement, AgentName, EWBTransporter, EBooksVATExemptionCause2, PurchaseReturns, PurchaseOrders, Quotations, ProjectManagements, BPVatExemptions, InventoryGenExits, SalesTaxInvoices, IncomingPayments, SpecificWTHAmountsService, SalesOpportunities, BusinessPlaces, SelfInvoices, SelfCreditMemos, Contacts, PurchaseTaxInvoices, BankPages, Items, RecurringTransactionTemplates, PurchaseQuotations, Warehouses, StockTransfers, SpecialPrices, AlternateCatNum, UserDefaultGroups
