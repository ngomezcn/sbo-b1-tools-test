---
title: App-level variables
source: pdf pp. 220-221, sec 7.7.13
summary: The app namespace variables available in webhook formulas: CurrentUser, CurrentCompany, Name, VersionStr and OS.
---

# App-level variables

App-level variables are defined in the application or system scope. The naming pattern is: `app.<variable name>`, where `app` is the namespace for the SAP Business One core application.

The following variables are available in the `app` namespace.


- [app.CurrentUser](#appcurrentuser)
- [app.CurrentCompany](#appcurrentcompany)
- [app.Name](#appname)
- [app.VersionStr](#appversionstr)
- [app.OS](#appos)

## app.CurrentUser

Gets the user code of the currently logged-in user.

### Examples

<!-- table: t220-03 -->
| Formula | Return value |
|---|---|
| `app.CurrentUser` | `'manager'` |
| `'Current user is: ' + app.CurrentUser` | `'Current user is: manager'` |

## app.CurrentCompany

Gets the company name of the currently logged-in company.

### Examples

<!-- table: t220-04 -->
| Formula | Return value |
|---|---|
| `app.CurrentCompany` | `'SQLTA OEC Computers'` |
| `'Current company is: ' + app.CurrentCompany` | `'Current company is: SQLTA OEC Computers'` |

## app.Name

Gets the process name of the current application. This returns the executable name of the process without the file extension.

### Examples

<!-- table: t221-02 -->
| Formula | Return value | Application |
|---|---|---|
| `app.Name` | `'SAP Business One'` | SAP Business One Desktop Client |
| `app.Name` | `'httpd'` | Service Layer |

## app.VersionStr

Gets the version string of the current application.

### Examples

<!-- table: t221-03 -->
| Formula | Return value |
|---|---|
| `app.VersionStr` | `'10.00.340'` |

## app.OS

Gets the operating system name that the current application is running on.

### Examples

<!-- table: t221-04 -->
| Formula | Return value |
|---|---|
| `app.OS` | `'WIN'` or `'LINUX'` |
