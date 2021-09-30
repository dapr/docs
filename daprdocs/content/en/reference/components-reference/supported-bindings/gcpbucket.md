---
type: docs
title: "GCP Storage Bucket binding spec"
linkTitle: "GCP Storage Bucket"
description: "Detailed documentation on the GCP Storage Bucket binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/gcpbucket/"
---

## Component format

To setup GCP Storage Bucket binding create a component of type `bindings.gcp.bucket`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.gcp.bucket
  version: v1
  metadata:
  - name: bucket
    value: mybucket
  - name: type
    value: service_account
  - name: project_id
    value: project_111
  - name: private_key_id
    value: *************
  - name: client_email
    value: name@domain.com
  - name: client_id
    value: '1111111111111111'
  - name: auth_uri
    value: https://accounts.google.com/o/oauth2/auth
  - name: token_uri
    value: https://oauth2.googleapis.com/token
  - name: auth_provider_x509_cert_url
    value: https://www.googleapis.com/oauth2/v1/certs
  - name: client_x509_cert_url
    value: https://www.googleapis.com/robot/v1/metadata/x509/<project-name>.iam.gserviceaccount.com
  - name: private_key
    value: PRIVATE KEY
  - name: decodeBase64
    value: <bool>
  - name: encodeBase64
    value: <bool>
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| bucket | Y | Output | The bucket name | `"mybucket"` |
| type | Y | Output | Tge GCP credentials type | `"service_account"` |
| project_id     | Y | Output | GCP project id| `projectId`
| private_key_id | Y | Output | GCP private key id | `"privateKeyId"`
| private_key    | Y | Output | GCP credentials private key. Replace with x509 cert | `12345-12345`
| client_email   | Y | Output | GCP client email  | `"client@email.com"`
| client_id      | Y |  Output | GCP client id | `0123456789-0123456789`
| auth_uri       | Y | Output | Google account OAuth endpoint | `https://accounts.google.com/o/oauth2/auth`
| token_uri      | Y | Output | Google account token uri | `https://oauth2.googleapis.com/token`
| auth_provider_x509_cert_url | Y | Output | GCP credentials cert url | `https://www.googleapis.com/oauth2/v1/certs`
| client_x509_cert_url | Y | Output | GCP credentials project x509 cert url | `https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com`
| decodeBase64 | N | Output | Configuration to decode base64 file content before saving to bucket storage. (In case of saving a file with binary content). `true` is the only allowed positive value. Other positive variations like `"True", "1"` are not acceptable. Defaults to `false` | `true`, `false` |
| encodeBase64 | N | Output | Configuration to encode base64 file content before return the content. (In case of opening a file with binary content). `true` is the only allowed positive value. Other positive variations like `"True", "1"` are not acceptable. Defaults to `false` | `true`, `false` |

## Binding support

This component supports **output binding** with the following operations:

- `create` : [Create file](#create-file)
- `get` : [Get file](#get-file)
- `delete` : [Delete file](#delete-file)
- `list`: [List file](#list-files)

### Create file

To perform a create operation, invoke the GCP Storage Bucket binding with a `POST` method and the following JSON body:

> Note: by default, a random UUID is generated. See below for Metadata support to set the name

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT"
}
```
The metadata parameters are:
- `key` - (optional) the name of the object
- `decodeBase64` - (optional) configuration to decode base64 file content before saving to storage

#### Examples
##### Save text to a random generated UUID file

{{< tabs Windows Linux >}}
  {{% codetab %}}
  On Windows, utilize cmd prompt (PowerShell has different escaping mechanism)
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\" }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "Hello World" }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

##### Save text to a specific file

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\", \"metadata\": { \"key\": \"my-test-file.txt\" } }" \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "Hello World", "metadata": { "key": "my-test-file.txt" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}


##### Upload a file

To upload a file, pass the file contents as the data payload; you may want to encode this in e.g. Base64 for binary content.

Then you can upload it as you would normally:

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"(YOUR_FILE_CONTENTS)\", \"metadata\": { \"key\": \"my-test-file.jpg\" } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "$(cat my-test-file.jpg)", "metadata": { "key": "my-test-file.jpg" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}
#### Response

The response body will contain the following JSON:

```json
{
    "objectURL":"https://storage.googleapis.com/<your bucket>/<key>",
}
```

### Get object

To perform a get file operation, invoke the GCP bucket binding with a `POST` method and the following JSON body:

```json
{
  "operation": "get",
  "metadata": {
    "key": "my-test-file.txt"
  }
}
```

The metadata parameters are:

- `key` - the name of the object
- `encodeBase64` - (optional) configuration to encode base64 file content before return the content.


#### Example

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"get\", \"metadata\": { \"key\": \"my-test-file.txt\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "get", "metadata": { "key": "my-test-file.txt" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### Response

The response body contains the value stored in the object.


### Delete object

To perform a delete object operation, invoke the GCP bucket binding with a `POST` method and the following JSON body:

```json
{
  "operation": "delete",
  "metadata": {
    "key": "my-test-file.txt"
  }
}
```

The metadata parameters are:

- `key` - the name of the object


#### Examples

##### Delete object

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"key\": \"my-test-file.txt\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "key": "my-test-file.txt" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### Response
An HTTP 204 (No Content) and empty body will be retuned if successful.


### List objects

To perform a list object operation, invoke the S3  binding with a `POST` method and the following JSON body:

```json
{
  "operation": "list",
  "data": {
    "maxResults": 10,
    "prefix": "file",
    "delimiter": "i0FvxAn2EOEL6"
  }
}
```

The data parameters are:

- `maxResults` - (optional) sets the maximum number of keys returned in the response. By default the action returns up to 1,000 key names. The response might contain fewer keys but will never contain more.
- `prefix` - (optional) it can be used to filter objects starting with prefix.
- `delimiter` - (optional)  it can be used to restrict the results to only the kobjects in the given "directory". Without the delimiter, the entire tree under the prefix is returned

#### Response

The response body contains the list of found objects.

The list of objects will be returned as JSON array in the following form:

```json
[
	{
		"Bucket": "<your bucket>",
		"Name": "02WGzEdsUWNlQ",
		"ContentType": "image/png",
		"ContentLanguage": "",
		"CacheControl": "",
		"EventBasedHold": false,
		"TemporaryHold": false,
		"RetentionExpirationTime": "0001-01-01T00:00:00Z",
		"ACL": null,
		"PredefinedACL": "",
		"Owner": "",
		"Size": 5187,
		"ContentEncoding": "",
		"ContentDisposition": "",
		"MD5": "aQdLBCYV0BxA51jUaxc3pQ==",
		"CRC32C": 1058633505,
		"MediaLink": "https://storage.googleapis.com/download/storage/v1/b/<your bucket>/o/02WGzEdsUWNlQ?generation=1631553155678071&alt=media",
		"Metadata": null,
		"Generation": 1631553155678071,
		"Metageneration": 1,
		"StorageClass": "STANDARD",
		"Created": "2021-09-13T17:12:35.679Z",
		"Deleted": "0001-01-01T00:00:00Z",
		"Updated": "2021-09-13T17:12:35.679Z",
		"CustomerKeySHA256": "",
		"KMSKeyName": "",
		"Prefix": "",
		"Etag": "CPf+mpK5/PICEAE="
	}
]
```
## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
