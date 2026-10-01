---
title: Downloading and Updating Attachments
source: pdf pp. 107-110, sec 3.16.3, 3.16.4
summary: Downloading attachment lines with $value, updating or appending attachment lines with PATCH, and the attachment size limit.
---

# Downloading and Updating Attachments

## Downloading Attachments

By default, the first attachment line is downloaded if there are multiple attachment lines in one attachment. To download it, `$value` is required to be appended to the end of the attachment retrieval URL. For example:

```http
GET /b1s/v1/Attachments2(3)/$value
```

On success, the response in browser is as follows:

The browser displays the content of the first attachment line as plain text:

```text
Introduction
B1 Service Layer (SL) is a new generation of extension API for consuming B1 objects and services
via web service with high scalability and high availability.
```

If you want to download an attachment line other than the first attachment line, you need to specify the full file name (including the file extension) in the request URL. For example:

```http
GET /b1s/v1/Attachments2(3)/$value?filename='line2.png'
```

On success, the response in browser is as follows:

The browser displays the content of `line2.png` as an image (the SAP logo in this example).

## Updating Attachment

Service Layer allows you to update an attachment via PATCH and there are two typical cases for this operation.

> **Example**
>
> **How to update an existing attachment line**
>
> If the attachment line to update already exists, it is simply replaced by the new attachment line. For example:
>
> **Sample Code**
>
> ```http
> PATCH /b1s/v1/Attachments2(3) HTTP/1.1
> Content-Type: multipart/form-data;
> boundary=WebKitFormBoundaryUmZoXOtOBNCTLyxT
> --WebKitFormBoundaryUmZoXOtOBNCTLyxT
> Content-Disposition: form-data; name="files"; filename="line1.txt"
> Content-Type: text/plain
> Introduction (Updated)
> B1 Service Layer (SL) is a new generation of extension API for consuming
> B1 objects and services via web service with high scalability and high
> availability.
> --WebKitFormBoundaryUmZoXOtOBNCTLyxT--
> ```
>
> On success, HTTP code 204 is returned without content.
>
> ```http
> HTTP/1.1 204 No Content
> ```
>
> To check the updated attachment line, send a request such as:
>
> ```http
> GET /b1s/v1/Attachments2(3)/$value?filename='line1.txt'
> ```
>
> On success, the response in browser is as follows:
>
> The browser displays the updated text, whose first line is now `Introduction(Updated)`:
>
> ```text
> Introduction(Updated)
> B1 Service Layer (SL) is a new generation of extension API for consuming B1 objects and services
> via web service with high scalability and high availability.
> ```

> **Example**
>
> **How to add one attachment line if not existing**
>
> If the attachment line to update doesn't exist, the new attachment line is appended to the last existing attachment line. For example:
>
> **Sample Code**
>
> ```text
> Content-Type: multipart/form-data;
> boundary=WebKitFormBoundaryUmZoXOtOBNCTLyxT
> --WebKitFormBoundaryUmZoXOtOBNCTLyxT
> Content-Disposition: form-data; name="files"; filename="line3.png"
> Content-Type: image/jpeg
> <binary data>
> --WebKitFormBoundaryUmZoXOtOBNCTLyxT--
> ```
>
> On success, HTTP code 204 is returned without content.
>
> ```http
> HTTP/1.1 204 No Content
> ```
>
> To check the newly created attachment line, send a request as follows:
>
> ```http
> GET /b1s/v1/Attachments2(3)/$value?filename='line3.png'
> ```
>
> On success, the response in browser is as follows:
>
> **Note**
>
> - From the business logic perspective, it is not allowed to delete an attachment or attachment line.
> - Due to security considerations, the attachment to upload MUST be less than 50M. If not, SL responds with an error message as below:
>
> **Output Code**
>
> ```text
> 413 Request Entity Too Large
> <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
> <html>
>     <head>
>         <title>413 Request Entity Too Large</title>
>     </head>
>     <body>
>         <h1>Request Entity Too Large</h1>
>             The requested resource
>         <br />/b1s/v1/Attachments2
>         <br />
>         does not allow request data with POST requests, or the amount
> of data provided in
>         the request exceeds the capacity limit.
>         <p>
>             Additionally, a 413 Request Entity Too Large
>             error was encountered while trying to use an ErrorDocument
> to handle the request.
>         </p>
>     </body>
> </html>
> ```
