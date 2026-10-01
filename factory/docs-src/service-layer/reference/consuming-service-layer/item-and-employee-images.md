---
title: Item Image and Employee Image
source: pdf pp. 112-116, sec 3.18
summary: Setting up the item image folder, and getting, updating, uploading and deleting item images (and getting employee images) through Service Layer.
---

# Item Image and Employee Image

- [Setting up an Item Image Folder](#setting-up-an-item-image-folder)
- [Getting an Item Image or an Employee Image](#getting-an-item-image-or-an-employee-image)
- [Updating or Uploading an Item Image](#updating-or-uploading-an-item-image)
- [Deleting an Item Image](#deleting-an-item-image)

As of SAP Business One 9.1 patch level 12, version for SAP HANA, Service Layer introduces a new stream entity `ItemImages` to support the CRUD operations of entity `ItemImages`. The metadata of this entity is:

> **Sample Code**
>
> ```xml
> <EntityType Name="ItemImage" m:HasStream="true">
>   <Key>
>     <PropertyRef Name="ItemCode"/>
>   </Key>
>     <Property Name="ItemCode" Nullable="false" Type="Edm.String"/>
>   <Property Name="Picture" Nullable="false" Type="Edm.String"/>
> </EntityType>
> ```

As of SAP Business Onee 9.3 patch level 12, version for SAP HANA, `EmployeeImages` are availabe for you in the Service Layer.

## Setting up an Item Image Folder

The item image folder is a shared folder on Windows platform for the SAP Business One client. To make it accessible for Service Layer on Linux, `CIFS` is required. The setup steps for the item image folder are similar to those of the attachment folder, as follows:

1. Create a shared folder with read and write permissions on Windows (for example, `\\windows_server\SharedFolder\Images`) and configure it as the item image folder in *General Settings* of the SAP Business One client (*Main Menu* > *Administration* > *System Initialization* > *General Settings*). Make sure the folder path is a network path.
2. Create a folder on Linux, (for example, `/mnt/images`).
3. Mount the Linux folder to the Windows folder by running a command such as:

```text
   mount -t cifs -o username=<windows_user>,password=<windows_user_password>,
   sec=ntlmssp,file_mode=0644,dir_mode=0755,uid=b1service0,gid=b1service0
   '//windows_server/SharedFolder/Images' /mnt/images
```

To auto mount when the Linux server starts, use the same steps as for the attachment folder.

**Related Information**

[Setting Up an Attachment Folder](attachments/setup-folder.md) [page 100]

## Getting an Item Image or an Employee Image

From the SAP Business One client, you can specify an item image for an item or an employee image for an employee.

To get the item image via Service Layer, send a request such as:

```http
GET /b1s/v1/ItemImages('i001')/$value
```

On success, the response in the browser is as follows:

> **Note**
>
> `$value` is required to be appended to the end of the `ItemImages` retrieval URL.
>
> If `$value` is omitted, the response is as follows:
>
> **Output Code**
>
> ```json
> {
>     "odata.metadata": "https://
> databaseserver:50000/b1s/v1/$metadata#ItemImages/@Element",
>     "odata.mediaReadLink": "ItemImages('i001')/$value",
>     "odata.mediaContentType": "image/jpeg",
>     "ItemCode": "'i001'",
>     "Picture": "sap_1.jpg"
> }
> ```

To get the employee image via Service Layer, send a request such as:

```http
GET b1s/v1/EmployeeImages('EmployeeID')
```

## Updating or Uploading an Item Image

Service Layer also allows you to upload or update an item image via `PATCH`. The request **must** contain a Content-Type header specifying a content type of multipart/mixed and a boundary specification as:

```text
Content-Type: multipart/form-data;boundary=<Boundary>
```

The body is separated by the boundary defined in the Content-Type header, such as:

```text
--<Boundary>
Content-Disposition: form-data; name="files"; filename="<file>"
Content-Type: <content type of file>
<file content>
--<Boundary>--
```

The prerequisite is the item must exist. If the item does not have an image, for example, the item with `ItemCode= 'i001'`, a `Patch` request such as the one below uploads an image. Otherwise, the request replaces the existing item image.

```http
PATCH /b1s/v1/ItemImages('i001') HTTP/1.1
Content-Type: multipart/form-data; boundary=----
WebKitFormBoundaryUmZoXOtOBNCTLyxT
------WebKitFormBoundaryUmZoXOtOBNCTLyxT
Content-Disposition: form-data; name="files"; filename="sap_2.jpg"
Content-Type: image/jpeg
<image binary data>
------WebKitFormBoundaryUmZoXOtOBNCTLyxT--
```

On success, HTTP code 204 is returned without content.

```http
HTTP/1.1 204 No Content
```

To check the updated one, send a request such as:

```http
GET /b1s/v1/ItemImages('i001')/$value
```

On success, the response in the browser is as follows:

The browser displays the updated image of item `i001` (a "Powered by SAP HANA" logo in this example).

> **Note**
>
> For test purposes only, you can use the Chrome plug-in `POSTMAN` to update an item image.

## Deleting an Item Image

To delete an item image, send a request such as:

```http
DELETE /b1s/v1/ItemImages('i001')
```

On success, HTTP code 204 is returned without content.

```http
HTTP/1.1 204 No Content
```

> **Note**
>
> It is not allowed to post an item image. You can work around that limitation by uploading an item image via `PATCH`.
>
> It is not allowed to query item images. To work around this issue, query the `ItemCode` and `Picure` of the entity Items instead.

