---
title: Literals, Variables and Operators
source: pdf pp. 203-207, sec 7.7, 7.7.1, 7.7.2, 7.7.3, 7.7.4, 7.7.5, 7.7.6, 7.7.7
summary: What a webhook formula (the FilterExpr filter) is made of, and the literals, variables, relational, logical, parenthesis, arithmetic and overloaded operators with examples.
---

# Literals, Variables and Operators

Available as of SAP Business One 10.0 FP 2608

The `FilterExpr` property in the EventCollection lets you specify a webhook formula to filter events for subscription. The filter formula is a boolean expression that evaluates event data fields.

A formula is an expression made up of literals, variables, operators, and functions used to compute a value. Formulas perform calculations or operations, construct conditions, manipulate data, and evaluate expressions.

**Related Information**

Literals [page 204] TODO(link: sec 7.7.1)
Variables [page 204] TODO(link: sec 7.7.2)
Relational Operators [page 204] TODO(link: sec 7.7.3)
Logical Operators [page 205] TODO(link: sec 7.7.4)
Parenthesis Operators [page 205] TODO(link: sec 7.7.5)
Arithmetic Operators [page 205] TODO(link: sec 7.7.6)
Overloaded Operators [page 205] TODO(link: sec 7.7.7)
String Functions [page 207] TODO(link: sec 7.7.8)
Date Functions [page 211] TODO(link: sec 7.7.9)
Time Functions [page 214] TODO(link: sec 7.7.10)
Math Functions [page 216] TODO(link: sec 7.7.11)
Logical Functions [page 219] TODO(link: sec 7.7.12)
App-Level Variables [page 220] TODO(link: sec 7.7.13)

## Literals

Literals in an expression refer to the specific, fixed pieces of data that are manipulated or interpreted by the operations in the expression. These can be:

- numbers (for example, 3, 45.6, -20)
- text strings (for example, 'hello', 'SAP')
- boolean true/false values

## Variables

Variables in a formula represent any type of value, such as numbers, strings, boolean (true/false), or more complex data types like dates or times. They are useful when you want to compute values that you don't know ahead of time, or that change each time you run your program. For webhook formulas, a variable typically refers to the property of a business object. It should be stable, unique, and understandable, with a semantic meaning and consistent naming convention.

## Relational Operators

Relational operators are used to compare one operand (usually a value or a data point) with another. These operators are fundamental for setting conditions or creating certain rules within the application. The evaluation result is a boolean: true or false.

Examples of relational operators:

- Equal to (==)
- Not equal to (!=)
- Greater than (>)
- Less than (<)
- Greater than or equal to (>=)
- Less than or equal to (<=)

For example:

```text
1+2 >= 3
CardCode != CardName
```

## Logical Operators

Logical operators are symbols used to connect two or more expressions, resulting in a true or false value.

- The logical OR (||) operator returns true if either of the operands is true.
- The logical AND (&&) operator returns true only if both operands are true.
- The logical NOT (!) operator reverses the result of an expression.

For example:

```text
DocEntry > 1024 && CardCode != CardName || DocTotal <= 1000
```

## Parenthesis Operators

Parenthesis operators define precedence in a formula or condition. The operations within parentheses are executed first. You can also use them to make formulas or conditions more explicit. For example:

```text
DocNum > DocEntry && (DocDueDate >= DocDate || DocTotal <= 1000)
```

## Arithmetic Operators

Arithmetic operators are symbols that indicate a mathematical operation to be performed on one or more operands (values). The most common arithmetic operators are addition (+), subtraction (-), multiplication (*), and division (/). For example:

```text
100 + Quantity * UnitPrice * 0.1
```

## Overloaded Operators

Operator overloading is a feature in some programming languages (such as C++ and C#) that lets developers redefine or "overload" the behavior of operators (such as +, -, and *) for user-defined types (such as classes or structs). The same operator can have different meanings based on the context in which it's used, typically based on the types of its operands.

A key point about operator overloading is custom behavior: you can customize how operators work for your own data types. To make formulas more intuitive and readable, operator overloading is adopted for + and - in some string and date operations.

### String Concatenation

The + operation connects two or more strings. For example:

```text
CardCode + " and " + CardName
```

If numbers and strings are mixed with +, the number is converted to a string silently, like JavaScript syntax.

For example, the following formula evaluates to `abc1`:

```text
'abc' + 1 == 'abc1'
```

### Date Operations

To add a number of days to a date, add that number directly to the date. For example, to add five days to `DocDueDate`, the formula is `DocDueDate + 5` or `5 + DocDueDate`. To subtract five days from the date, the formula is `DocDueDate - 5`.

To find the number of days between two dates, subtract the earlier date (for example, `DocDate`) from the later date (for example, `DocDueDate`). The formula is `DocDueDate — DocDate`.

To specify a constant date, use the `DATE` function in the formula. For example, `DATE(2026, 7, 28)`.

### Time Operations

To add a number of seconds to a Time object, add that number directly to the Time. For example, to add 300 seconds to `StartTime`, the formula is `StartTime + 300` or `300 + StartTime`. To subtract five minutes from the Time, the formula is `StartTime - 300`.

To find the number of seconds between two Time values, subtract the earlier Time (for example, `StartTime`) from the later Time (for example, `EndTime`). The formula is `EndTime — StartTime`.

To specify a constant Time, use the `TIME` function in the formula. For example, `TIME(19, 28, 59)`.
