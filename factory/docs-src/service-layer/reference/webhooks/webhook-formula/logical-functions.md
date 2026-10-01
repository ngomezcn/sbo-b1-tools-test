---
title: Logical functions
source: pdf pp. 219-220, sec 7.7.12
summary: Logical functions usable in webhook formulas: IFNULL, with usage, parameters and examples.
---

# Logical functions

- [IFNULL](#ifnull)

## IFNULL

Returns the specified value if the expression is NULL. Otherwise, returns the expression.

### Usage

```text
IFNULL(expression, alt_value)
```

### Parameters


<!-- table: t220-01 -->
| Parameter | Type | Description |
|---|---|---|
| expression | any | The expression to test for NULL |
| alt_value | any | The value to return if the expression is NULL |

### Examples

<!-- table: t220-02 -->
| Formula | Return value |
|---|---|
| `IFNULL(null, 'default')` | 'default' |
| `IFNULL(1, 'default')` | 1 |
| `IFNULL('value', 'default')` | 'value' |
