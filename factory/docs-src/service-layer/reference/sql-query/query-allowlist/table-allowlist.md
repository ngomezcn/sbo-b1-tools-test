---
title: Table allowlist
source: pdf pp. 145-147, sec 4.5, 4.5.1
summary: Why SQL queries are limited to an allowlist of tables, where the allowlist is configured, and the full list of accessible tables.
---

# Table allowlist

Due to data sensitivity and security considerations, not all tables and columns in the company database can be queried.

## Table Allowlist

The main tables in the database that are accessible are maintained in the following allowlist.

> **Note**
>
> The complete table allowlist can be found in the configuration file `b1s_sqltable.conf` located in the folder `<service layer installation folder>/conf/b1s_sqltable.conf`. The content is in JSON format.
>
> Tables that are not included in the configuration file are not supported. To meet enhanced security requirements, you can remove tables from the allowlist. Adding tables that are not on the allowlist is outside the scope of support and can compromise security.

- Company Info (`CINF`)
- Administration (`OADM`)
- Administration Extension (`ADM1`)
- Print Preferences (`OADP`)
- Currencies (`OCRN`)
- Business Partner Master Data (`OCRD, OCRP, CRD1`)
- Sales Documents (`OQUT+ QUT1-14, ORDR+RDR1-14, ODLN+DLN1-14, ORRR+RRR1-14, ORDN+RDN1-14, ODPI+DPI1-14, OINV+INV1-14, ORIN+RIN1-14`)
- Purchase Documents (`OPRQ+PRQ1-14, OPQT+PQT1-14, OPOR+POR1-14, OPDN+PDN1-14, OPRR+PRR1-14, ORPD+RPD1-14, ODPO+DPO1-14, OPCH+PCH1-14, ORPC+RPC1-14`)
- Drafts (`ODRF+DRF1-14`)
- Payments (`ORCT, RCT1, RCT2, RCT3, RCT4 + OVPM, VPM1, VPM2, VPM3, VPM4`)
- Bank Codes (`ODSC`)
- House Bank Accounts (`DSC1`)
- Hidden Features (`OHFC`)
- Posting Period (`OFPR`)
- Periods Category (`OACP`)
- Branch (`OBPL`)
- Holidays (`OHLD + HLD1`)
- Item master data, inventory and warehouse tables (`OITM, OITW, OIBQ, OBIN, OBTQ, OBBQ, OBTN, OSRQ, OSBQ, OSRN`)
- Activity Related Tables (`OCLG, OCLT, OCLS`)
- Attachments (`ATC1`)
- Exchange Rates (`ORTT`)
- Resource master data (`ORSC, RSC1, RSC2, RSC3, RSC4, RSC5, RSC6`)
- Route stage master data (`ORST`)
- Bill of materials (`OITT, ITT1, ITT2`)
- Production order (`OWOR, WOR1, WOR4`)
- Resource capacity (`ORCJ`)
- Order Recommendations (`ORCM`)
- Price List and Prices (`OPLN, ITM1`)
- Journal Entry (`OJDT, JDT1`)
- Credit Cards (`OCRC, OCRH`)
- Deposit (`ODPS`)
- Contact Persons (`OCPR`)
- Electronic Transactions (`ECM2`)
