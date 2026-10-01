---
title: Time functions
source: pdf pp. 214-216, sec 7.7.10
summary: Time functions usable in webhook formulas: TIME, NOW, HOUR, MINUTE and SECOND, with usage, parameters and examples.
---

# Time functions

- [TIME](#time)
- [NOW](#now)
- [HOUR](#hour)
- [MINUTE](#minute)
- [SECOND](#second)

## TIME

Creates a time value using separate hour, minute, and second components. The string representation of the time is in `HHMMSS` format. The hour is represented in 24-hour format.

### Usage

```text
TIME(hours, minutes, seconds)
```

### Parameters

<!-- table: t214-01 -->
| Parameter | Type | Description |
|---|---|---|
| hours | number | The hours component of the time (0-23) |
| minutes | number | The minutes component of the time (0-59) |
| seconds | number | The seconds component of the time (0-59) |

### Examples

<!-- table: t214-02 -->
| Formula | Return value |
|---|---|
| `TIME(12, 12, 12) + 1` | `TIME(12, 12, 13)` |
| `TIME(23, 59, 59) + 1` | `TIME(0, 0, 0)` |

## NOW

Returns the current local `TIME` value on the client machine.

### Usage

```text
NOW()
```

### Examples

<!-- table: t214-03 -->
| Formula | Return value |
|---|---|
| `NOW()` | `TIME(12, 12, 13)` |


## HOUR

Extracts the hour from a given `TIME` value or a time string in `HHMMSS` or `HHMM` format.

### Usage

```text
HOUR(timeValue)
```

### Parameters

<!-- table: t215-01 -->
| Parameter | Type | Description |
|---|---|---|
| timeValue | TIME, string | A TIME value or a time string in `HHMMSS` or `HHMM` format |

### Examples

<!-- table: t215-02 -->
| Formula | Return value |
|---|---|
| `HOUR(TIME(12, 30, 45))` | 12 |
| `HOUR('123045')` | 12 |
| `HOUR('2359')` | 23 |

## MINUTE

Extracts the minute from a given `TIME` value or a time string in `HHMMSS` or `HHMM` format.

### Usage

```text
MINUTE(timeValue)
```

### Parameters

<!-- table: t215-03 -->
| Parameter | Type | Description |
|---|---|---|
| timeValue | TIME, string | A `TIME` value or a time string in `HHMMSS` or `HHMM` format |

### Examples

<!-- table: t215-04 -->
| Formula | Return value |
|---|---|
| `MINUTE(TIME(12, 30, 45))` | 30 |
| `MINUTE('123045')` | 30 |
| `MINUTE('2359')` | 59 |


## SECOND

Extracts the second from a given `TIME` value or a time string in `HHMMSS` or `HHMM` format.

### Usage

```text
SECOND(timeValue)
```

### Parameters

<!-- table: t216-01 -->
| Parameter | Type | Description |
|---|---|---|
| timeValue | TIME, string | A `TIME` value or a time string in `HHMMSS` or `HHMM` format |

### Examples

<!-- table: t216-02 -->
| Formula | Return value |
|---|---|
| `SECOND(TIME(12, 30, 45))` | 45 |
| `SECOND('123045')` | 45 |
| `SECOND('2359')` | 0 |
