---
title: Setting Up an Attachment Folder
source: pdf pp. 100-103, sec 3.16.1
summary: How to configure the shared attachment folder for Service Layer on Windows and on SAP HANA on Linux (CIFS mount, permissions, auto mount).
---

# Setting Up an Attachment Folder

An attachment folder is generally a shared folder on the Windows platform for the SAP Business One client.

## Service Layer Running on Windows

Since Service Layer runs under the Network Service account by default, the shared folder must be configured to grant this account read and write permissions. Without these permissions, Service Layer may fail to recognize that the folder exists.

In the *Network access* dialog of the shared folder, add the `NETWORK SERVICE` account and set its permission level to *Read/Write*. The list of people with access then shows `Administrator` (Read/Write), `Administrators` (Owner), and `NETWORK SERVICE` (Read/Write).

## Service Layer Running on SAP HANA on Linux

For the Service Layer running on SAP HANA on Linux, directly accessing this shared folder is not allowed. In order to make the attachment folder accessible for Service Layer as well, the Common Internet File System (CIFS) is required.

Take the following steps to set up:

1. Create a network shared folder with read and write permissions on Windows (for example, `\\windows_server\SharedFolder\Attachment`) and configure it as the attachment folder in *General Settings* in the SAP Business One client (*Main Menu* > *Administration* > *System Initialization* > *General Settings*).

   In *General Settings*, on the *Path* tab, the *Attachments Folder* field contains `\\windows_server\SharedFolder\Attachment`.

2. Log in to the Linux server and create a corresponding attachment directory (for example, `/mnt/attachments`) by running the following command:

   ```text
   sudo mkdir -p /mnt/attachment
   ```

3. Open a Linux terminal and mount the Linux directory to the Windows folder using the Windows user identity with proper permission settings. For example, run the following command:

   ```text
   mount -t cifs -o username=<windows_user>,password=<windows_user_password>,
   sec=ntlmssp,file_mode=0644,dir_mode=0755,uid=b1service0,gid=b1service0 '//
   windows_server/SharedFolder/Attachment' /mnt/attachment
   ```

   > **Note**
   >
   > - Replace the backslash (`\`) in the Windows shared folder with a forward slash (`/`). Therefore, the shared folder path is `//windows_server/SharedFolder/Attachment`.
   > - Specify a proper security mode in the mount options to comply with corporate security standards. In mainline kernel versions prior to version 3.8, the default security mode is `sec=ntlm`. Starting from version 3.8, the default security mode was changed to `sec=ntlmssp`. For a comprehensive list of all parameters, please consult the `mount.cifs(8)` manual page (for example., `man mount.cifs`).
   > - Specify the user ID (`uid`) and group ID (`gid`) as `b1service0` for the files under the attachment directory, since the Service Layer on Linux runs with the user and group identity of `b1service0`.
   > - If your Windows user is part of a domain, you must include the domain option in the command as shown below:
   >
   >   ```text
   >   -o domain=<windows_domain_name>,username=<windows_user>
   >   ```
   >
   > - Ensure that you escape any special characters, such as backslashes (\) or dollar signs ($), in the event that they appear in the user name or password. For example:
   >
   >   ```text
   >   mount -t cifs -o username=alice,password=Initial\$1234,
   >   sec=ntlmssp,file_mode=0644,dir_mode=0755,uid=b1service0,gid=b1service0
   >   '//windows_server/SharedFolder/Attachment' /mnt/attachment
   >   ```
   >
   > - We recommend that you adhere to the password policy best practices provided by Microsoft Support.

4. Change the ownership of the attachment directory to `b1service0` by running the following commands:

   ```text
   sudo chown -R b1service0:b1service0 /mnt/attachment
   ```

5. Set proper permissions to the files and folders in the attachment directory by running the following commands:

   ```text
   sudo find /mnt/attachment -type d -exec chmod 0755 {} \;
   sudo find /mnt/attachment -type f -exec chmod 0644 {} \;
   ```

> **Note**
>
> To protect your privacy, it is recommended that you remove any Exchangeable Image File Format (EXIF) information from your images before uploading them.

### How to Auto Mount When Linux Server Starts

To facilitate the configuration convenience for customers, `/etc/fstab` can be leveraged to automatically mount to the Windows shared folder once the Linux server reboots. One approach to achieve this is as follows:

1. Log in as a `root` user and create a credentials file (for example, `/etc/samba/credentials` ) with the following content:

   ```text
   username=<windows_user>
   password=<windows_user_password>
   domain=<windows_domain_name>
   ```

2. Secure credentials using strict permission settings.

   ```text
   sudo chmod 600 /etc/samba/credentials
   ```

3. Open the system configuration file `/etc/fstab` and append one line as follows: `//windows_server/SharedFolder/Attachment /mnt/attachment cifs credentials=/etc/samba/credentials,file_mode=0644,dir_mode=0755,uid=b1service0,gid=b1service0,sec=ntlmssp 0 0`
4. Mount the share folder:

   ```text
   sudo mount -a
   ```

5. Reboot the Linux server to automatically mount the Windows shared folder.
