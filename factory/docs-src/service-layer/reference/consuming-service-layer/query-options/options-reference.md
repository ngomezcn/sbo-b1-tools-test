---
title: Supported query options
source: pdf pp. 31-33, sec 3.6
summary: The query options Service Layer supports in the request URL ($filter, $select, $orderby, $top, $skip, $count, $inlinecount), with their supported functions, operators and examples.
---

# Supported query options

Query options within the request URL can control how a particular request is processed by Service Layer. The following table shows the query options supported by Service Layer.

<!-- table: t032-01 -->
- **Option**: `$filter`
  - **Description**:

    Queries collections of entities.

    Currently supported functions for `$filter` are:

    - `startswith`
    - `endswith`
    - `contains`
    - `substringof`

    Currently supported logical and relational operators include:

    - `and`
    - `or`
    - `le` (less than or equal to)
    - `lt` (less than)
    - `ge` (greater than or equal to)
    - `gt` (greater than)
    - `eq` (equal to)
    - `ne` (not equal to)
    - `not`

    > **Note**
    >
    > The operator `not` is supported as of 9.1 patch level 01.

    Parentheses are also supported.

  - **Example**:

    `/Orders?$filter=DocTotal gt 3000`

    `/Orders?$filter=DocEntry lt 8 and (DocEntry lt 8 or DocEntry gt 116) and CardCode eq 'c1'`

    `/Orders?$filter=DocEntry lt 8 and ((DocEntry lt 8 or DocEntry gt 116) and startswith(CardCode,'c1'))`

    `/Items?$filter=not (startswith(ItemName, 'item') and ForeignName eq null)`

- **Option**: `$select`
  - **Description**: Returns the properties that are explicitly requested.
  - **Example**: `/Orders?$select=DocEntry, DocTotal`
- **Option**: `$orderby`
  - **Description**: Specifies the order in which entities are returned.
  - **Example**: `/Orders?$orderby=DocTotal asc, DocEntry desc`
- **Option**: `$top`
  - **Description**: Returns the first n (non-negative integer) records.
  - **Example**: `/Orders?$top=3`
- **Option**: `$skip`
  - **Description**: Specifies the result excluding the first n entities.
  - **Example**:

    `/Orders?$top=3&$skip=2`

    Where `$top` and `$skip` are used together, the `$skip` is applied before the `$top`, regardless of the order of appearance in the request.

- **Option**: `$count`
  - **Description**: Returns the count of an entity collection.
  - **Example**:

    `/Orders/$count`

    `/Items/$count?&filter=ItemCode eq 'test'`

<!-- table: t033-01 -->
- **Option**: `$inlinecount`
  - **Description**:

    Allows clients to request the number of matching resources inline with the resources in the response.

    > **Note**
    >
    > `$inlinecount` query option applies to OData 3.0 protocols only. This feature is available in SAP Business One 9.1 patch level 06 and later.

  - **Example**: For more information, see [inlinecount](aggregation.md#inlinecount) [page 39].

The combination of query options enables Service Layer to support any complex query scenarios, while keeping the API interface as simple as possible.
