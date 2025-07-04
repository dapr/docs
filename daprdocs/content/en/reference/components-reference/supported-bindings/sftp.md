---
type: docs
title: "SFTP binding spec"
linkTitle: "SFTP"
description: "Detailed documentation on the Secure File Transfer Protocol (SFTP) binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/sftp/"
---

## Component format

To set up the SFTP binding, create a component of type `bindings.sftp`. See [this guide]({{< ref bindings-overview.md >}}) on how to create and apply a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.sftp
  version: v1
  metadata:
  - name: rootPath
    value: "<string>"
  - name: address
    value: "<string>"
  - name: username
    value: "<string>"
  - name: password
    value: "*****************"
  - name: privateKey
    value: "*****************"
  - name: privateKeyPassphrase
    value: "*****************"
  - name: hostPublicKey
    value: "*****************"
  - name: knownHostsFile
    value: "<string>"
  - name: insecureIgnoreHostKey
    value: "<bool>"
```

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| `rootPath` | Y | Output | Root path for default working directory | `"/path"` |
| `address`             | Y        | Output |  Address of SFTP server | `"localhost:22"` |
| `username`           | Y        | Output | Username for authentication | `"username"` |
| `password`          | N        | Output | Password for username/password authentication | `"password"` |
| `privateKey`          | N        | Output | Private key for public key authentication | <pre>"\|-<br>-----BEGIN OPENSSH PRIVATE KEY-----<br>*****************<br>-----END OPENSSH PRIVATE KEY-----"</pre> |
| `privateKeyPassphrase`       | N        | Output | Private key passphrase for public key authentication | `"passphrase"`    |
| `hostPublicKey`       | N        | Output | Host public key for host validation | `"ecdsa-sha2-nistp256 *** root@openssh-server"`    |
| `knownHostsFile`       | N        | Output | Known hosts file for host validation | `"/path/file"` |
| `insecureIgnoreHostKey`       | N        | Output | Allows to skip host validation. Defaults to `"false"` | `"true"`, `"false"` |

## Binding support

This component supports **output binding** with the following operations:

- `create` : [Create file](#create-file)
- `get` : [Get file](#get-file)
- `list` : [List files](#list-files)
- `delete` : [Delete file](#delete-file)

### Create file

To perform a create file operation, invoke the SFTP binding with a `POST` method and the following JSON body:

```json
{
  "operation": "create",
  "data": "<YOUR_BASE_64_CONTENT>",
  "metadata": {
    "fileName": "<filename>",
  }
}
```

#### Example

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"YOUR_BASE_64_CONTENT\", \"metadata\": { \"fileName\": \"my-test-file.jpg\" } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "YOUR_BASE_64_CONTENT", "metadata": { "fileName": "my-test-file.jpg" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### Response

The response body contains the following JSON:

```json
{
   "fileName": "<filename>"
}

```

### Get file

To perform a get file operation, invoke the SFTP binding with a `POST` method and the following JSON body:

```json
{
  "operation": "get",
  "metadata": {
    "fileName": "<filename>"
  }
}
```

#### Example

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"get\", \"metadata\": { \"fileName\": \"filename\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "get", "metadata": { "fileName": "filename" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### Response

The response body contains the value stored in the file.

### List files

To perform a list files operation, invoke the SFTP binding with a `POST` method and the following JSON body:

```json
{
  "operation": "list"
}
```

If you only want to list the files beneath a particular directory below the `rootPath`, specify the relative directory name as the `fileName` in the metadata.

```json
{
  "operation": "list",
  "metadata": {
    "fileName": "my/cool/directory"
  }
}
```

#### Example

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"list\", \"metadata\": { \"fileName\": \"my/cool/directory\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "list", "metadata": { "fileName": "my/cool/directory" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### Response

The response is a JSON array of file names.

### Delete file

To perform a delete file operation, invoke the SFTP binding with a `POST` method and the following JSON body:

```json
{
  "operation": "delete",
  "metadata": {
    "fileName": "myfile"
  }
}
```

#### Example

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"fileName\": \"myfile\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "fileName": "myfile" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### Response

An HTTP 204 (No Content) and empty body is returned if successful.

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
