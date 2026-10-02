---
title: Stream Entity Upload
source: pdf pp. 110-112, sec 3.17
summary: Uploading stream entities (Attachments2, Pictures) with the Slug header, with OData client and SAP UI5 samples.
---

# Stream Entity Upload

As of SAP Business One 10.0 FP 2202, Service Layer allows users to upload a stream entity with the Slug mechanism. Slug is an HTTP entity-header whose presence in a POST to a Collection constitutes a request by the client to use the header's value as part of any URIs that would normally be used to retrieve the to-be-created Entry or Media Resources.

In the Service Layer, the following entities have streaming capabilities and can be used to leverage the Slug mechanism:

- Attachments2
- Pictures

If you look at its metadata, you will see that such a streaming entity has a special attribute `HasStream="true"`, which means that the entity type is a media entity, and represents a media stream, such as a photo.

> **Sample Code**
>
> ```xml
> <EntityType HasStream="true" Name="Attachments2" OpenType="true">
>     <Key>
>         <PropertyRef Name="AbsoluteEntry"/>
>     </Key>
>     <Property Name="AbsoluteEntry" Nullable="false" Type="Edm.Int32"/>
>     <Property Name="Attachments2_Lines"
> Type="Collection(SAPB1.Attachments2_Line)"/>
> </EntityType>
> ```

The following section will give some samples that demonstrate how to use the Slug to work with Service Layer.

## OData Client Sample

The code snippet below uses the .NET OData client library (generated `slContext` proxy) to upload an attachment to the Service Layer.

> **Sample Code**
>
> ```javascript
> // POST /b1s/v2/Attachments2
> Attachments2 attachment = new Attachments2();
> slContext.AddToAttachments2(attachment);
> string path = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
> string imageFile = path + @".\SAP-logo.jpg";
> // Open an image file and save it as a stream.
> FileStream imageStream = new FileStream(imageFile, FileMode.Open);
> slContext.SetSaveStream(attachment, imageStream, true, "image/jpeg",
> "SAP.jpg");// image/jpeg => jpeg jpg jpe
> // Upload the file and get the response.
> ChangeOperationResponse changeResponse =
> slContext.SaveChanges().FirstOrDefault() as ChangeOperationResponse;
> // Get the entity created on the service and check if the entity is as
> expected.
> var entityDescriptor = changeResponse.Descriptor as EntityDescriptor;
> Uri editLink = entityDescriptor.EditLink;
> Regex regex = new Regex(@"/b1s/v2/attachments2\((?<entry>\d+)\)",
> RegexOptions.IgnoreCase);
> Match match = regex.Match(editLink.LocalPath);
> return match.Success ? Convert.ToInt32(match.Groups["entry"].Value) : 0;
> ```

Capture the request and you will find the Slug header is there to indicate the file name.

> **Sample Code**
>
> ```http
> POST https://servicelayerhost:50000/b1s/v2/Attachments2 HTTP/1.1
> Slug: SAP.jpg
> OData-Version: 4.0
> OData-MaxVersion: 4.0
> Accept: application/json;odata.metadata=minimal;
> Accept-Charset: UTF-8
> User-Agent: Microsoft.OData.Client/7.9.0
> Cookie: B1SESSION=3a8f8e84-e1f4-11eb-8000-0a0027000008;HttpOnly;
> Connection: Keep-Alive
> Content-Type: image/jpeg
> Host: servicelayerhost:50000
> Content-Length: 6315
> <the binary content of an image>
> ```

## SAP UI5 Sample

The following code snippet uses the SAP UI5 libaray to work with the Service Layer on the browser side.

### UI for the file uploader

> **Sample Code**
>
> ```xml
> <mvc:View
>     controllerName="sapb1.fioriservicelayerapp.controller.Attachment"
>     xmlns:l="sap.ui.layout"
>     xmlns:u="sap.ui.unified"
>     xmlns:mvc="sap.ui.core.mvc"
>     xmlns="sap.m"
>     xmlns:semantic="sap.f.semantic"
>     class="viewPadding">
>     <semantic:SemanticPage
>         id="page"
>         headerPinnable="false"
>         toggleHeaderOnTitleClick="false">
>         <semantic:titleHeading>
>             <Title text="{i18n>attachmentViewTitle}" />
>         </semantic:titleHeading>
>         <semantic:content>
>             <l:VerticalLayout>
>             <u:FileUploader
>                 id="attachmentUploader"
>                 name="attachemntFileUpload"
>                 uploadUrl="/b1s/v2/Attachments2"
>                 tooltip="Upload your attachment"
>                 uploadComplete="attachHandleUploadComplete"/>
>             <Button
>                 text="Upload Attachment"
>                 press="attachHandleUploadPress"/>
>             </l:VerticalLayout>
>         </semantic:content>
>     </semantic:SemanticPage>
> </mvc:View>
> ```

### Interaction for the file uploader

> **Sample Code**
>
> ```javascript
> sap.ui.define(['sap/m/MessageToast', 'sap/ui/core/mvc/Controller'],
>     function (MessageToast, Controller) {
>         "use strict";
>         return
> Controller.extend("sapb1.fioriservicelayerapp.controller.Attachment", {
>             attachHandleUploadPress: function (oEvent) {
>                 var oAttachmentUploader = this.byId("attachmentUploader");
>                 oAttachmentUploader.checkFileReadable().then(function () {
>                     oAttachmentUploader.setSendXHR(true);
>                     oAttachmentUploader.setUseMultipart(false);
>                     oAttachmentUploader.addHeaderParameter(new
> sap.ui.unified.FileUploaderParameter({
>                         name: "Slug",
>                         value: "SAP.jpg"
>                     }));
>                     oAttachmentUploader.upload();
>                     oAttachmentUploader.removeAllHeaderParameters();
>                 }, function (error) {
>                     MessageToast.show("The file cannot be read. It may have
> changed.");
>                 }).then(function () {
>                     oAttachmentUploader.clear();
>                 });
>             },
>         });
>     });
> ```
