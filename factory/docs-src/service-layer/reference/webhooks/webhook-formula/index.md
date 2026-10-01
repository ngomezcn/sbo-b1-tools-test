# Webhook formula

A webhook formula is the boolean expression in `FilterExpr` that decides which events trigger a notification. It has its own operators and functions, which are not OData `$filter` or SQL.

## [Literals, variables and operators](formula-basics.md)
Use when: writing a formula: literals, variables, relational, logical, parenthesis, arithmetic and overloaded operators, string concatenation, date and time arithmetic.
Terms: `FilterExpr`, literal, relational operator, logical operator, `+`, `-`
Sections: [Literals](formula-basics.md#literals) · [Variables](formula-basics.md#variables) · [Relational Operators](formula-basics.md#relational-operators) · [Logical Operators](formula-basics.md#logical-operators) · [Parenthesis Operators](formula-basics.md#parenthesis-operators) · [Arithmetic Operators](formula-basics.md#arithmetic-operators) · [Overloaded Operators](formula-basics.md#overloaded-operators)

## [String functions](string-functions.md)
Use when: manipulating text in a formula.
Terms: `UPPER`, `LOWER`, `CONTAINS`, `TRIM`, `LEN`, `LEFT`, `RIGHT`, `MID`, `SUBSTITUTE`
Sections: [UPPER](string-functions.md#upper) · [LOWER](string-functions.md#lower) · [CONTAINS](string-functions.md#contains) · [TRIM](string-functions.md#trim) · [LEN](string-functions.md#len) · [LEFT](string-functions.md#left) · [RIGHT](string-functions.md#right) · [MID](string-functions.md#mid) · [SUBSTITUTE](string-functions.md#substitute)

## [Date functions](date-functions.md)
Use when: building or reading dates in a formula.
Terms: `DATE`, `TODAY`, `YEAR`, `MONTH`, `DAY`
Sections: [DATE](date-functions.md#date) · [TODAY](date-functions.md#today) · [YEAR](date-functions.md#year) · [MONTH](date-functions.md#month) · [DAY](date-functions.md#day)

## [Time functions](time-functions.md)
Use when: building or reading times in a formula.
Terms: `TIME`, `NOW`, `HOUR`, `MINUTE`, `SECOND`
Sections: [TIME](time-functions.md#time) · [NOW](time-functions.md#now) · [HOUR](time-functions.md#hour) · [MINUTE](time-functions.md#minute) · [SECOND](time-functions.md#second)

## [Math functions](math-functions.md)
Use when: doing numeric operations and rounding in a formula.
Terms: `ABS`, `FLOOR`, `CEILING`, `ROUND`, `MIN`, `MAX`
Sections: [ABS](math-functions.md#abs) · [FLOOR](math-functions.md#floor) · [CEILING](math-functions.md#ceiling) · [ROUND](math-functions.md#round) · [MIN](math-functions.md#min) · [MAX](math-functions.md#max)

## [Logical functions](logical-functions.md)
Use when: handling null values in a formula.
Terms: `IFNULL`

## [App-level variables](app-level-variables.md)
Use when: using application context in a formula (current user, company, application name, version, operating system).
Terms: `app.CurrentUser`, `app.CurrentCompany`, `app.Name`, `app.VersionStr`, `app.OS`
Sections: [app.CurrentUser](app-level-variables.md#appcurrentuser) · [app.CurrentCompany](app-level-variables.md#appcurrentcompany) · [app.Name](app-level-variables.md#appname) · [app.VersionStr](app-level-variables.md#appversionstr) · [app.OS](app-level-variables.md#appos)
