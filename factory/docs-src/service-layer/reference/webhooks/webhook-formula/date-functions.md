---
title: Date functions
source: pdf pp. 211-213, sec 7.7.9
summary: Date functions usable in webhook formulas: DATE, TODAY, YEAR, MONTH and DAY, with usage, parameters and examples.
---

# Date functions

- [DATE](#date)
- [TODAY](#today)
- [YEAR](#year)
- [MONTH](#month)
- [DAY](#day)

## DATE

Returns a date value for a specific date. The string representation of the date is in `YYYYMMDD` format.

### Usage

```text
DATE(year, month, day)
```

### Parameters

<!-- table: t211-03 -->
| Parameter | Type | Description |
|---|---|---|
| year | number | The year component of the date (1970-9999) |
| month | number | The month component of the date (1-12) |
| day | number | The day component of the date |

### Examples


<!-- table: t212-01 -->
| Formula | Return value |
|---|---|
| `DATE(2020, 2, 28) + 1` | `DATE(2020, 2, 29)` |
| `DATE(2020, 2, 29) + 1` | `DATE(2020, 3, 1)` |
| `DATE(2020, 2, 29) + 365` | `DATE(2021, 2, 28)` |

## TODAY

Returns the current local `DATE` value on the client machine.

### Usage

```text
TODAY()
```

### Examples

<!-- table: t212-02 -->
| Formula | Return value |
|---|---|
| `TODAY()` | `DATE(2026, 7, 17)` |

## YEAR

Extracts the year from a given date or a string value in `YYYYMMDD` format.

### Usage

```text
YEAR(date)
```

### Parameters

<!-- table: t212-03 -->
| Parameter | Type | Description |
|---|---|---|
| date | DATE, string | A date or a string date in `YYYYMMDD` format |

### Examples

<!-- table: t212-04 -->
| Formula | Return value |
|---|---|
| `YEAR('20000101')` | 2000 |
| `YEAR(TODAY())` | 2026 |
| `YEAR(DATE(2026, 7, 17))` | 2026 |


## MONTH

Extracts the month from a given date or a string value in `YYYYMMDD` format.

### Usage

```text
MONTH(date)
```

### Parameters

<!-- table: t213-01 -->
| Parameter | Type | Description |
|---|---|---|
| date | DATE, string | A date or a string date in `YYYYMMDD` format |

### Examples

<!-- table: t213-02 -->
| Formula | Return value |
|---|---|
| `MONTH('20000101')` | 1 |
| `MONTH(DATE(2026, 7, 17))` | 7 |

## DAY

Extracts the day from a given date or a string value in `YYYYMMDD` format.

### Usage

```text
DAY(date)
```

### Parameters

<!-- table: t213-03 -->
| Parameter | Type | Description |
|---|---|---|
| date | DATE, string | A date or a string date in `YYYYMMDD` format |

### Examples

<!-- table: t213-04 -->
| Formula | Return value |
|---|---|
| `DAY('20000101')` | 1 |
| `DAY(DATE(2026, 7, 17))` | 17 |
