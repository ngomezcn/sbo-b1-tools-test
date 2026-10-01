---
title: Security Considerations
source: pdf pp. 159-160, sec 4.12
summary: SQL injection protection for bound parameters, where SQL query modifications are logged (ASQL), and column allowlists for sensitive data.
---

# Security Considerations

## SQL Injection

SQL injection would probably occur in case of parameter binding. To prevent this, internally the Service Layer validates the input parameter value by tokenizing or using the SQL statements preparation technique.

For example, there is an SQL Query with id = 'sql08' and has the following SQL text:

```sql
select [ItemCode], [ItemName], [ItmsGrpCod] from OITM where ItemCode = :itemCode
```

Such requests as below would results in error.

**Request**

> **Sample Code**
>
> ```http
> POST https://server:50000/b1s/v1/SQLQueries('sql08')/List HTTP/1.1
> {
>     "ParamList": "itemCode='i001';truncate table OITM"
> }
> ```

**Response**

> **Sample Code**
>
> ```http
> HTTP/1.1 400 Bad Request
> {
>     "error": {
>         "code": 704,
>         "message": {
>             "lang": "en-us",
>             "value": "Parameter error."
>         }
>     }
> }
> ```

## Log SQL Query Modification

According to product standards, SQL is a type of programming code and therefore should have logs for the code change.

To track the SQL Query modification, the history can be found in table `ASQL`, which is the log table for the SQL Query business object.

## Sensitive Data Accessibility

Besides business data, in the database, there is also some internally sensitive data we do not want to show to end users. To prohibit users from accessing the information, partners can define a column allowlist for each table to achieve this purpose.
