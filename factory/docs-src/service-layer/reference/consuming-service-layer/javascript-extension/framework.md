---
title: JavaScript Parsing Engine, Framework, Entry Function and URL Mapping
source: pdf pp. 116-118, sec 3.19.1, 3.19.2, 3.19.3, 3.19.4
summary: The V8 parsing engine, the structure of the JavaScript extension framework, the HTTP-method entry functions of a script, and the /script URL mapping by partner and script name.
---

# JavaScript Parsing Engine, Framework, Entry Function and URL Mapping

- [JavaScript Parsing Engine](#javascript-parsing-engine)
- [JavaScript Extension Framework](#javascript-extension-framework)
- [JavaScript Entry Function](#javascript-entry-function)
- [JavaScript URL Mapping](#javascript-url-mapping)

## JavaScript Parsing Engine

Service Layer uses Chrome V8 Engine (hereafter referred to as V8) as the JavaScript parsing engine due to the following considerations:

- Parsing performance is of significant importance for Service Layer, and V8 is a script engine known for its excellent performance.
- Service Layer and V8 are both written in C++. This would make the integration more seamless and easier.

The V8 JavaScript engine is an open source JavaScript engine developed by The Chromium Project for the Google Chrome Web browser.

## JavaScript Extension Framework

To facilitate the development of an extension application, Service Layer provides a JavaScript framework for users to easily operate the business objects and services. The diagram below shows the basic structure of the framework.

```text
┌──────────────────────────────────────────────┐
│           Service Layer Extension            │
│                                              │
│ ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐ │
│ ┆     User's JavaScript Extension App      ┆ │
│ └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘ │
│ ┌──────────────────────────────────────────┐ │
│ │              JavaScript SDK              │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │              C++/JS Interop              │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────┐  ┌────────────────────┐ │
│ │      SLCore      │  │                    │ │
│ └──────────────────┘  │         V8         │ │
│ ┌──────────────────┐  │                    │ │
│ │      DICore      │  │                    │ │
│ └──────────────────┘  └────────────────────┘ │
└──────────────────────────────────────────────┘
```

Figure: Basic structure of the JavaScript extension framework. The Service Layer Extension is a layered stack. At the top is the user's JavaScript extension app (dashed box), which sits on the JavaScript SDK, which sits on the C++/JS Interop layer. Below the interop layer are SLCore and DICore stacked on the left, and V8 on the right spanning their full height. Extension apps reach SLCore and DICore only through the SDK and the interop layer, and V8 runs the JavaScript.

> **Note**
>
> - Besides the DICore and SLCore, V8, as a new C++ component, is integrated into Service Layer.
> - Service Layer adds the C++/JavaScript interop layer to be responsible for the interaction between JavaScript and C++.
> - On top of the interop layer, JavaScript SDK is designed to hide the interactive details and provide a high level and simplified API for the application layer.
> - Considering the fact that switching the context between C++ and JavaScript stack is not good for performance, one target of providing the SDK is to decrease the frequency of context switching.
> - Users' JavaScript Extension application is suggested to be developed based on the JavaScript SDK.

## JavaScript Entry Function

As each executable file has a `main` entry function, each script file has to define entry functions. Conventionally, it is better to define four entry functions in each script file, corresponding to the CRUD operations on entities.

Each entry function has a same-name HTTP method. On receiving a request, the entry function having the same name as the http method of this request is triggered.

> **Sample Code**
>
> ```javascript
> //The entry function for http request with the GET method
> function GET(){
>     ...
> }
> //The entry function for http request with the POST method
> function POST(){
>     ...
> }
> //The entry function for http request with the PATCH method
> function PATCH(){
>     ...
> }
> //The entry function for http request with the DELETE method
> function DELETE(){
>     ...
> }
> ```

> **Note**
>
> Due to a keyword compatibility issue in JavaScript, each entry function should be in uppercase; otherwise the function will not be recognized.

## JavaScript URL Mapping

Script files are triggered to run by sending requests to the specific script URL. To differentiate the script URL from a regular URL, Service Layer provides a specific URL resource path for scripts by appending `/script` to the original path `/b1s/v1 or /b1s/v2` as below:

```text
/b1s/v1/script/

/b1s/v2/script/
```

Considering the fact that different partners might define the script with the same name, Service Layer identifies which script to run by combining the partner name and the script name as the unique identifier. The mapping rule for the URL pattern is:

```text
/b1s/v1/script/{{partner name}}/{{script name}}
```

Requests sent to URLs with the above pattern are dispatched to the corresponding script function defined by the corresponding partner.

> **Example**
>
> The following request will trigger the execution of the function POST defined in `item.js` provided by partner `mtcsys`.
>
> ```http
> POST /b1s/v1/script/mtcsys/items
> ```

> **Note**
>
> A prerequisite is to ensure the script file with the corresponding ard file are deployed into SLD by the partner. For more details about how to deploy scripts, please refer to the chapter [JavaScript Deployment](deployment.md) [page 130].
