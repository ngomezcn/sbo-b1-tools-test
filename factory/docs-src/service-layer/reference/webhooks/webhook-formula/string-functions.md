---
title: String Functions
source: pdf pp. 207-211, sec 7.7.8
summary: Webhook formula string functions (UPPER, LOWER, CONTAINS, TRIM, LEN, LEFT, RIGHT, MID, SUBSTITUTE) with usage, parameters and examples.
---

# String Functions

- [UPPER](#upper)
- [LOWER](#lower)
- [CONTAINS](#contains)
- [TRIM](#trim)
- [LEN](#len)
- [LEFT](#left)
- [RIGHT](#right)
- [MID](#mid)
- [SUBSTITUTE](#substitute)

## UPPER

Converts all letters in the specified text string to uppercase.

### Usage

```text
UPPER(text)
```

### Parameters

<!-- table: t207-01 -->
| Parameter | Type | Description |
|---|---|---|
| text | string | The text to convert to uppercase |

### Examples

<!-- table: t207-02 -->
| Formula | Return value |
|---|---|
| `UPPER("abcABC")` | 'ABCABC' |

## LOWER

Converts all letters in the specified text string to lowercase.

### Usage

```text
LOWER(text)
```

### Parameters

<!-- table: t207-03 -->
| Parameter | Type | Description |
|---|---|---|
| text | string | The text to convert to lowercase |

### Examples

<!-- table: t207-04 -->
| Formula | Return value |
|---|---|
| `LOWER("abcABC")` | 'abcabc' |

## CONTAINS

Compares two text arguments and returns `true` if the first argument contains the second argument. Otherwise, returns `false`.

### Usage

```text
CONTAINS(text, compare_text)
```

### Parameters

<!-- table: t208-01 -->
| Parameter | Type | Description |
|---|---|---|
| text | string | The main string to search within |
| compare_text | string | The substring to search for in text |

### Examples

<!-- table: t208-02 -->
| Formula | Return value |
|---|---|
| `CONTAINS('abcABC', 'ABC')` | true |
| `CONTAINS('ABC', 'CDE')` | false |

## TRIM

Removes all leading and trailing spaces from a text string.

### Usage

```text
TRIM(text)
```

### Parameters

<!-- table: t208-03 -->
| Parameter | Type | Description |
|---|---|---|
| text | string | The text to be trimmed |

### Examples

<!-- table: t208-04 -->
| Formula | Return value |
|---|---|
| `TRIM(' Hello World ')` | 'Hello World' |
| `TRIM('Multiple Spaces')` | 'Multiple Spaces' |

## LEN

Calculates the length of a text string, counting all characters including spaces and special characters.

### Usage

```text
LEN(text)
```

### Parameters

<!-- table: t209-01 -->
| Parameter | Type | Description |
|---|---|---|
| text | string | The text for which to calculate the length |

### Examples

<!-- table: t209-02 -->
| Formula | Return value |
|---|---|
| `LEN('')` | 0 |
| `LEN('Hello World')` | 11 |

## LEFT

Returns the specified number of characters from the start of a text string.

### Usage

```text
LEFT(text, num_chars)
```

### Parameters

<!-- table: t209-03 -->
| Parameter | Type | Description |
|---|---|---|
| text | string | The text from which to extract characters |
| num_chars | number | The number of characters to extract |

### Examples

<!-- table: t209-04 -->
| Formula | Return value |
|---|---|
| `LEFT('Hello World', 5)` | 'Hello' |
| `LEFT('Analytics', 0)` | '' |

## RIGHT

Returns the specified number of characters from the end of a text string.

### Usage

```text
RIGHT(text, num_chars)
```

### Parameters

<!-- table: t210-01 -->
| Parameter | Type | Description |
|---|---|---|
| text | string | The text from which to extract characters |
| num_chars | number | The number of characters to extract |

### Examples

<!-- table: t210-02 -->
| Formula | Return value |
|---|---|
| `RIGHT('Hello World', 5)` | 'World' |
| `RIGHT('Analytics', 0)` | '' |

## MID

Returns a specific number of characters from a text string, starting at the position specified.

### Usage

```text
MID(text, start_num, num_chars)
```

### Parameters

<!-- table: t210-03 -->
| Parameter | Type | Description |
|---|---|---|
| text | string | The text from which to extract characters |
| start_num | number | The position of the first character to extract |
| num_chars | number | The number of characters to extract |

### Examples

<!-- table: t210-04 -->
| Formula | Return value |
|---|---|
| `MID('Hello World', 6, 5)` | 'World' |
| `MID('Analytics', 3, 0)` | '' |
| `MID('Sample', 2, 10)` | 'mple' |
| `MID('Hello World', '6', '5')` | 'World' |

## SUBSTITUTE

Replaces occurrences of a specified substring within a text string with another substring.

### Usage

```text
SUBSTITUTE(text, old_text, new_text)
```

### Parameters

<!-- table: t211-01 -->
| Parameter | Type | Description |
|---|---|---|
| text | string | The text in which to substitute the old substring |
| old_text | string | The substring to be replaced |
| new_text | string | The substring to replace with |

### Examples

<!-- table: t211-02 -->
| Formula | Return value |
|---|---|
| `SUBSTITUTE('Hello World', 'World', 'There')` | 'Hello There' |
| `SUBSTITUTE('banana', 'a', 'o')` | 'bonono' |
| `SUBSTITUTE('Hello World', '', 'There')` | 'Hello World' |
| `SUBSTITUTE('Hello World', 'Hello', '')` | 'World' |
