---
title: Attachments
source: pdf pp. 100-100, sec 3.16
summary: Overview of attachment support in the Service Layer and the supported attachment file types.
---

# Attachments

As of SAP Business One 9.1 patch level 12, version for SAP HANA, attachment manipulation is supported through the Service Layer. The supported attachment type list is:

- pdf
- doc
- docx
- jpg
- jpeg
- png
- txt
- xls
- ppt

## [Setting up an attachment folder](setup-folder.md)
Use when: configuring the shared attachment folder on Windows or SAP HANA on Linux.
Terms: CIFS, `mount`, `/etc/fstab`, credentials file, permissions

## [Uploading an attachment](upload.md)
Use when: uploading from a local path or as a multipart/form-data POST.
Terms: `Attachments2`, `multipart/form-data`, source path

## [Downloading and updating attachments](download-and-update.md)
Use when: downloading attachment lines or adding and updating lines.
Terms: `$value`, `PATCH`, attachment lines, size limit
Not here: uploading stream entities with `Slug` → [stream-entity-upload](../stream-entity-upload.md)
