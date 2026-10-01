---
title: Uploading an Attachment
source: pdf pp. 104-106, sec 3.16.2
summary: Uploading attachments to Service Layer from a local source path or as a multipart/form-data POST from a remote machine.
---

# Uploading an Attachment

Considering that the source file to upload may be on the same machine as Service Layer or on a separate machine, Service Layer has to support both of these two cases.

## Uploading Source File to the Local Service Layer

[Applicable for Service Layer on both SAP HANA and SQL Server]

This case is similar as the attachment handling by the SAP Business One client, as the source file and the SAP Business One client are always in the same machine.

> **Note**
>
> The file to upload in this case is on Linux. It can also be applied to the Windows files.

For this case, upload the source file (for example, `/home/builder/src_attachment/my_attach_1.dat`) as an attachment by sending a request such as:

> **Sample Code**
>
> ```http
> POST /b1s/v1/Attachments2
> {
>     "Attachments2_Lines": [
>         {
>             "SourcePath": "/home/builder/src_attachment",
>             "FileName": "my_attach_1",
>             "FileExtension": "dat"
>         }
>     ]
> }
> ```

On success, the response is as follows:

> **Output Code**
>
> ```http
> HTTP/1.1 201 Created
> {
>     "AbsoluteEntry": "1",
>     "Attachments2_Lines": [
>         {
>             "SourcePath": "/home/builder/src_attachment",
>             "FileName": "my_attach_1",
>             "FileExtension": "dat",
>             "AttachmentDate": "2016-03-25",
>             "UserID": "1",
>             "Override": "tNO"
>         }
>     ]
> }
> ```

The source file is saved in the destination attachment folder on Linux (`/mnt/attachments2`).

Listing the directory (for example, with `ls -l /mnt/attachments2`) shows the uploaded file, such as `my_attach_1.dat`.

Open the Windows folder (`\\<databaseserver>\temp\SL\attachments`); the source file is saved there as well.

The folder contains the uploaded file, such as `my_attach_1.dat`.

## Uploading Source File to a Remote Service Layer

[Applicable for Service Layer on both SAP HANA and SQL Server]

As a Web service, most times Service Layer and the source file to upload may be on separate machines, which is quite different than the attachment case in the SAP Business One client.

One way to add an attachment for this case is to use the HTTP `POST` method. The request **must** contain a `Content-Type` header specifying a content type of `multipart/form-data` and a boundary specification as:

```text
Content-Type: multipart/form-data;boundary=<Boundary>
```

The body is separated by the boundary defined in the Content-Type header, such as:

> **Sample Code**
>
> ```text
> --<Boundary>
> Content-Disposition: form-data; name="files"; filename="<file1>"
> Content-Type: <content type of file1>
> <file1 content>
> --<Boundary>
> Content-Disposition: form-data; name="files"; filename="<file2>"
> Content-Type: <content type of file2>
> <file2 content>
> --<Boundary>--
> ```

For example, if you want to pack two files into one attachment to post, send the request as follows:

> **Sample Code**
>
> ```http
> POST /b1s/v1/Attachments2 HTTP/1.1
> Content-Type: multipart/form-data; boundary=WebKitFormBoundaryUmZoXOtOBNCTLyxT
> --WebKitFormBoundaryUmZoXOtOBNCTLyxT
> Content-Disposition: form-data; name="files"; filename="line1.txt"
> Content-Type: text/plain
> Introduction
> B1 Service Layer (SL) is a new generation of extension API for consuming B1
> objects and services
> via web service with high scalability and high availability.
> --WebKitFormBoundaryUmZoXOtOBNCTLyxT
> Content-Disposition: form-data; name="files"; filename="line2.jpg"
> Content-Type: image/jpeg
> <image binary data>
> --WebKitFormBoundaryUmZoXOtOBNCTLyxT--
> ```

On success, the response is as follows:

> **Output Code**
>
> ```http
> HTTP/1.1 201 Created
> {
>    "odata.metadata" : "https://
> databaseserver:50000/b1s/v1/$metadata#Attachments2/@Element",
>    "AbsoluteEntry" : "3",
>    "Attachments2_Lines" : [
>       {
>          "SourcePath" : "/tmp/sap_b1_i066088/ServiceLayer/Attachments2/",
>          "FileName" : "line1",
>          "FileExtension" : "txt",
>          "AttachmentDate" : "2016-04-06",
>          "UserID" : "1",
>          "Override" : "tNO"
>       },
>       {
>          "SourcePath" : "/tmp/sap_b1_i066088/ServiceLayer/Attachments2/",
>          "FileName" : "line2",
>          "FileExtension" : "png",
>          "AttachmentDate" : "2016-04-06",
>          "UserID" : "1",
>          "Override" : "tNO"
>       }
>    ]
> }
> ```

> **Note**
>
> - The boundary MUST be prepended with two dashes (--) in the request body.
> - The last boundary in the request body MUST be appended with two extra dashes (--).
> - o If Service Layer returns a message about creating a file error on Linux, it indicates the permission of temporary attachment directory has been changed by someone accidentally. For this case, open a Linux terminal with root user privilege and run the below commands to recover the permission.
>
>   ```text
>   sudo chown -R b1service0:b1service0 /tmp/sap_b1_b1service0
>   sudo chmod -R 755 /tmp/sap_b1_b1service0
>   ```
