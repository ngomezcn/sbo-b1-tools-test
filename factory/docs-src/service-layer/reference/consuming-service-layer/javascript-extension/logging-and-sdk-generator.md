---
title: Logging and SDK generator tool
source: pdf pp. 129-130, sec 3.19.6, 3.19.7
summary: Logging from scripts with console.log, and generating the JavaScript SDK from metadata with the Metadata2JavaScript tool on Linux and Windows.
---

# Logging and SDK generator tool

- [Logging](#logging)
- [JavaScript SDK Generator Tool](#javascript-sdk-generator-tool)

## Logging

Currently, debugging script is not supported. However, users are allowed to log the key information during script programming by using the `API console.log`:

```text
console.log('Hello, Service Layer Scripting!');
```

> **Note**
>
> `console` is a global object. Literally, the output of this object should be printed in the console. However, considering Service Layer is a backend service, the output is redirected to log files under `{SL Installation Path}/logs/script/`.

## JavaScript SDK Generator Tool

Considering that in each patch there might be new business objects exposed or new changes made on the existing objects, the SDK would be adjusted accordingly to adapt to the changes.

To manually maintain the SDK would not only need huge efforts, but also would be error-prone. To automatically address this issue, a tool named `Metadata2JavaScript` is provided to generate the SDK according to the metadata, as metadata reflects all changes on the business objects.

This tool supports generating the SDK in two ways (let's take the Linux environment as an example):

- From a local metadata file: `Metadata2JavaScript -a {local metadata file} -o {output folder, default is ./ b1s_sdk}` or `Metadata2JavaScript --addr {local metadata file} --output {output folder, default is ./b1s_sdk}`

  For example: `Metadata2JavaScript -a metadata.xml -o ./output`

- From a remote Service Layer instance: `Metadata2JavaScript -a {SL base url} -u {user} -p {password} -c {company} -o {output folder, default is ./b1s_sdk}` or `Metadata2JavaScript --addr {SL base url} --user {user} --password {password} -- company {company} --output {output folder, default is ./b1s_sdk}` For example: `Metadata2JavaScript --addr https://databaseserver:50000/b1s/v1/ --user manager --password 1234 --company SBODEMOUS`

> **Note**
>
> This tool is released together with Service Layer and is available in the `bin` folder of the Service Layer installation path.
>
> As this tool depends on JAVA JRE, before running it, make sure the relevant JAVA environment variables are correctly exported.
>
> In the Linux environment, set `JAVA_HOME` as below:
>
> ```text
> export JAVA_HOME=/usr/sap/SAPBusinessOne/Common/sapjvm_8/jre
>
> export PATH=$JAVA_HOME/bin:$PATH
> ```

Previously, the `Metadata2Javascript` tool is available in the Linux environment only. As of SAP Business One 10.0 FP 2011, this tool is also available in the Microsoft Windows environment. There are slight differences when you use the tool:

- In the Linux environment, you enter the command starting with `Metadata2JavaScript`.
- In the Microsoft Windows environment, you enter the command starting with `java -jar Metadata2JavaScript.jar`.

In the above examples, for the Microsoft Windows environment, change the command to the following:

```text
java -jar Metadata2JavaScript.jar -a metadata.xml -o ./output

java -jar Metadata2JavaScript.jar --addr https://databaseserver:50000/b1s/v1/ --
user manager --password 1234 --company SBODEMOUS
```
