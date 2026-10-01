---
title: Math functions
source: pdf pp. 216-219, sec 7.7.11
summary: Math functions usable in webhook formulas: ABS, FLOOR, CEILING, ROUND, MIN and MAX, with usage, parameters and examples.
---

# Math functions

- [ABS](#abs)
- [FLOOR](#floor)
- [CEILING](#ceiling)
- [ROUND](#round)
- [MIN](#min)
- [MAX](#max)

## ABS

Calculates the absolute value of a number. If the number is negative, the positive value is returned.

### Usage

```text
ABS(numeric)
```

### Parameters

<!-- table: t216-03 -->
| Parameter | Type | Description |
|---|---|---|
| numeric | number | The numeric value for which to find the absolute value |

### Examples

<!-- table: t216-04 -->
| Formula | Return value |
|---|---|
| `ABS(-10)` | 10 |
| `ABS(5)` | 5 |
| `ABS(0)` | 0 |

## FLOOR

Rounds a numeric value down, toward zero, to the nearest integer.

### Usage

```text
FLOOR(numeric)
```

### Parameters

<!-- table: t217-02 -->
| Parameter | Type | Description |
|---|---|---|
| numeric | number | The numeric value to round down |

### Examples

<!-- table: t217-03 -->
| Formula | Return value |
|---|---|
| `FLOOR(4.5)` | 4 |
| `FLOOR(-4.5)` | -5 |
| `FLOOR(0)` | 0 |

## CEILING

Rounds a numeric value up, away from zero, to the nearest integer.

### Usage

```text
CEILING(numeric)
```

### Parameters

<!-- table: t217-04 -->
| Parameter | Type | Description |
|---|---|---|
| numeric | number | The numeric value to round up |

### Examples

<!-- table: t217-05 -->
| Formula | Return value |
|---|---|
| `CEILING(4.5)` | 5 |
| `CEILING(-4.5)` | -4 |
| `CEILING(0)` | 0 |

## ROUND

Rounds a numeric value to the nearest integer.

### Usage

```text
ROUND(numeric)
```

### Parameters

<!-- table: t218-02 -->
| Parameter | Type | Description |
|---|---|---|
| numeric | number | The numeric value to round |

### Examples

<!-- table: t218-03 -->
| Formula | Return value |
|---|---|
| `ROUND(4.5)` | 5 |
| `ROUND(4.4)` | 4 |
| `ROUND(-4.5)` | -4 |

## MIN

Returns the smallest element in a set of elements.

### Usage

```text
MIN(e1, [e2], ...)
```

### Parameters

<!-- table: t218-04 -->
| Parameter | Type | Description |
|---|---|---|
| e1 | string or number | The first element in the set |
| e2 | string or number | (Optional) Additional elements to compare |

### Examples


<!-- table: t219-01 -->
| Formula | Return value |
|---|---|
| `MIN(3, 5, 7)` | 3 |
| `MIN('a', 'b')` | 'a' |
| `MIN(0)` | 0 |

## MAX

Returns the largest element in a set of elements.

### Usage

```text
MAX(e1, [e2], ...)
```

### Parameters

<!-- table: t219-02 -->
| Parameter | Type | Description |
|---|---|---|
| e1 | string or number | The first element in the set |
| e2 | string or number | (Optional) Additional elements to compare |

### Examples

<!-- table: t219-03 -->
| Formula | Return value |
|---|---|
| `MAX(3, 5, 7)` | 7 |
| `MAX('a', 'b')` | 'b' |
| `MAX(0)` | 0 |
