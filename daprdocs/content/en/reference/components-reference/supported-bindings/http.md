---
type: docs
title: "HTTP binding spec"
linkTitle: "HTTP"
description: "Detailed documentation on the HTTP binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/http/"
---

## Alternative

The [service invocation API]({{< ref service_invocation_api.md >}}) allows for the invocation of non-Dapr HTTP endpoints and is the recommended approach. Read ["How-To: Invoke Non-Dapr Endpoints using HTTP"]({{< ref howto-invoke-non-dapr-endpoints.md >}}) for more information.

## Setup Dapr component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.http
  version: v1
  metadata:
  - name: url
    value: "http://something.com"
  - name: MTLSRootCA
    value: "/Users/somepath/root.pem" # OPTIONAL Secret store ref, <path to root CA>, or <pem encoded string>
  - name: MTLSClientCert
    value: "/Users/somepath/client.pem" # OPTIONAL Secret store ref, <path to client cert>, or <pem encoded string>
  - name: MTLSClientKey
    value: "/Users/somepath/client.key" # OPTIONAL Secret store ref, <path to client key>, or <pem encoded string>
  - name: MTLSRenegotiation
    value: "RenegotiateOnceAsClient" # OPTIONAL one of: RenegotiateNever, RenegotiateOnceAsClient, RenegotiateFreelyAsClient
  - name: securityToken # OPTIONAL <token to include as a header on HTTP requests>
    secretKeyRef:
      name: mysecret
      key: "mytoken"
  - name: securityTokenHeader
    value: "Authorization: Bearer" # OPTIONAL <header name for the security token>
  - name: direction # OPTIONAL
    value: "output"
  - name: errorIfNot2XX
    value: "false" # OPTIONAL
```

## Spec metadata fields

| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|--------|--------|---------|
| `url`                | Y        | Output |The base URL of the HTTP endpoint to invoke | `http://host:port/path`, `http://myservice:8000/customers`
| `MTLSRootCA`         | N        | Output |Secret store reference, path to root ca certificate, or pem encoded string |
| `MTLSClientCert`     | N        | Output |Secret store reference, path to client certificate, or pem encoded string  |
| `MTLSClientKey`      | N        | Output |Secret store reference, path client private key, or pem encoded string |
| `MTLSRenegotiation`  | N        | Output |Type of TLS renegotiation to be used | `RenegotiateOnceAsClient`
| `securityToken`      | N        | Output |The value of a token to be added to an HTTP request as a header. Used together with `securityTokenHeader` |
| `securityTokenHeader`| N        | Output |The name of the header for `securityToken` on an HTTP request that | 
| `direction`| N        | Output |The direction of the binding | `"output"` 
| `errorIfNot2XX`| N        | Output |If a binding error should be thrown when the response is not in the 2xx range. Defaults to `true` | `false`, `true` 

### How to configure MTLS related fields in Metadata
The values for **MTLSRootCA**, **MTLSClientCert** and **MTLSClientKey** can be provided in three ways:
1. Secret store reference
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.http
  version: v1
  metadata:
  - name: url
    value: http://something.com
  - name: MTLSRootCA
    secretKeyRef:
      name: mysecret
      key: myrootca
auth:
  secretStore: <NAME_OF_SECRET_STORE_COMPONENT>
```
2. Path to the file: The absolute path to the file can be provided as a value for the field.
3. PEM encoded string: The PEM encoded string can also be provided as a value for the field.

{{% alert title="Note" color="primary" %}}
Metadata fields **MTLSRootCA**, **MTLSClientCert** and **MTLSClientKey** are used to configure TLS(m) authentication.
To use mTLS authentication, you must provide all three fields. See [mTLS]({{< ref "#using-mtls-or-enabling-client-tls-authentication-along-with-https" >}}) for more details. You can also provide only **MTLSRootCA**, to enable **HTTPS** connection. See [HTTPS]({{< ref "#install-the-ssl-certificate-in-the-sidecar" >}}) section for more details.
{{% /alert %}}


## Binding support

This component supports **output binding** with the following [HTTP methods/verbs](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html):

- `create` : For backward compatibility and treated like a post
- `get` :  Read data/records
- `head` : Identical to get except that the server does not return a response body
- `post` : Typically used to create records or send commands
- `put` : Update data/records
- `patch` : Sometimes used to update a subset of fields of a record
- `delete` : Delete a data/record
- `options` : Requests for information about the communication options available (not commonly used)
- `trace` : Used to invoke a remote, application-layer loop- back of the request message (not commonly used)

### Request

#### Operation metadata fields

All of the operations above support the following metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| path               | N        | The path to append to the base URL. Used for accessing specific URIs     | `"/1234"`, `"/search?lastName=Jones"`
| Headers*           | N        | Any fields that have a capital first letter are sent as request headers  | `"Content-Type"`, `"Accept"`

#### Retrieving data

To retrieve data from the HTTP endpoint, invoke the HTTP binding with a `GET` method and the following JSON body:

```json
{
  "operation": "get"
}
```

Optionally, a path can be specified to interact with resource URIs:

```json
{
  "operation": "get",
  "metadata": {
    "path": "/things/1234"
  }
}
```

### Response

The response body contains the data returned by the HTTP endpoint.  The `data` field contains the HTTP response body as a byte slice (Base64 encoded via curl). The `metadata` field contains:

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| statusCode         | Y        | The [HTTP status code](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) | `200`, `404`, `503`
| status             | Y        | The status description | `"200 OK"`, `"201 Created"`
| Headers*           | N        | Any fields that have a capital first letter are sent as request headers  | `"Content-Type"`

#### Example

**Requesting the base URL**

{{< tabs Windows Linux >}}

{{% codetab %}}
```bash
curl -d "{ \"operation\": \"get\" }" \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{% codetab %}}
```bash
curl -d '{ "operation": "get" }' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{< /tabs >}}

**Requesting a specific path**

{{< tabs Windows Linux >}}

{{% codetab %}}
```bash
curl -d "{ \"operation\": \"get\", \"metadata\": { \"path\": \"/things/1234\" } }" \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{% codetab %}}
```bash
curl -d '{ "operation": "get", "metadata": { "path": "/things/1234" } }' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{< /tabs >}}

### Sending and updating data

To send data to the HTTP endpoint, invoke the HTTP binding with a `POST`, `PUT`, or `PATCH` method and the following JSON body:

{{% alert title="Note" color="primary" %}}
Any metadata field that starts with a capital letter is passed as a request header.
For example, the default content type is `application/json; charset=utf-8`. This can be overridden be setting the `Content-Type` metadata field.
{{% /alert %}}

```json
{
  "operation": "post",
  "data": "content (default is JSON)",
  "metadata": {
    "path": "/things",
    "Content-Type": "application/json; charset=utf-8"
  }
}
```

#### Example

**Posting a new record**

{{< tabs Windows Linux >}}

{{% codetab %}}
```bash
curl -d "{ \"operation\": \"post\", \"data\": \"YOUR_BASE_64_CONTENT\", \"metadata\": { \"path\": \"/things\" } }" \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{% codetab %}}
```bash
curl -d '{ "operation": "post", "data": "YOUR_BASE_64_CONTENT", "metadata": { "path": "/things" } }' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{< /tabs >}}

## Using HTTPS

The HTTP binding can also be used with HTTPS endpoints by configuring the Dapr sidecar to trust the server's SSL certificate.


1. Update the binding URL to use `https` instead of `http`.
1. Refer [How-To: Install certificates in the Dapr sidecar]({{< ref install-certificates >}}), to install the SSL certificate in the sidecar.

### Example

#### Update the binding component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.http
  version: v1
  metadata:
  - name: url
    value: https://my-secured-website.com # Use HTTPS
```

#### Install the SSL certificate in the sidecar


{{< tabs Self-Hosted Kubernetes >}}

{{% codetab %}}
When the sidecar is not running inside a container, the SSL certificate can be directly installed on the host operating system.

Below is an example when the sidecar is running as a container. The SSL certificate is located on the host computer at `/tmp/ssl/cert.pem`.

```yaml
version: '3'
services:
  my-app:
    # ...
  dapr-sidecar:
    image: "daprio/daprd:1.8.0"
    command: [
      "./daprd",
     "-app-id", "myapp",
     "-app-port", "3000",
     ]
    volumes:
        - "./components/:/components"
        - "/tmp/ssl/:/certificates" # Mount the certificates folder to the sidecar container at /certificates
    environment:
      - "SSL_CERT_DIR=/certificates" # Set the environment variable to the path of the certificates folder
    depends_on:
      - my-app
```

{{% /codetab %}}

{{% codetab %}}

The sidecar can read the SSL certificate from a variety of sources. See [How-to: Mount Pod volumes to the Dapr sidecar]({{< ref kubernetes-volume-mounts >}}) for more. In this example, we store the SSL certificate as a Kubernetes secret.

```bash
kubectl create secret generic myapp-cert --from-file /tmp/ssl/cert.pem
```

The YAML below is an example of the Kubernetes deployment that mounts the above secret to the sidecar and sets `SSL_CERT_DIR` to install the certificates.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: default
  labels:
    app: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "myapp"
        dapr.io/app-port: "8000"
        dapr.io/volume-mounts: "cert-vol:/certificates" # Mount the certificates folder to the sidecar container at /certificates
        dapr.io/env: "SSL_CERT_DIR=/certificates" # Set the environment variable to the path of the certificates folder
    spec:
      volumes:
        - name: cert-vol
          secret:
            secretName: myapp-cert
...
```

{{% /codetab %}}

{{< /tabs >}}

#### Invoke the binding securely

{{< tabs Windows Linux >}}

{{% codetab %}}
```bash
curl -d "{ \"operation\": \"get\" }" \
      https://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{% codetab %}}
```bash
curl -d '{ "operation": "get" }' \
      https://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{< /tabs >}}

{{% alert title="Note" color="primary" %}}
HTTPS binding support can also be configured using the **MTLSRootCA** metadata option. This will add the specified certificate to the list of trusted certificates for the binding. There's no specific preference for either method. While the **MTLSRootCA** option is easy to use and doesn't require any changes to the sidecar, it accepts only one certificate. If you need to trust multiple certificates, you need to [install them in the sidecar by following the steps above]({{< ref "#install-the-ssl-certificate-in-the-sidecar" >}}).
{{% /alert %}}

## Using mTLS or enabling client TLS authentication along with HTTPS
You can configure the HTTP binding to use mTLS or client TLS authentication along with HTTPS by providing the `MTLSRootCA`, `MTLSClientCert`, and `MTLSClientKey` metadata fields in the binding component.

These fields can be passed as a file path or as a pem encoded string. 
- If the file path is provided, the file is read and the contents are used. 
- If the pem encoded string is provided, the string is used as is.
When these fields are configured, the Dapr sidecar uses the provided certificate to authenticate itself with the server during the TLS handshake process.

If the remote server is enforcing TLS renegotiation, you also need to set the metadata field `MTLSRenegotiation`. This field accepts one of following options: 
- `RenegotiateNever`
- `RenegotiateOnceAsClient`
- `RenegotiateFreelyAsClient`. 

For more details see [the Go `RenegotiationSupport` documentation](https://pkg.go.dev/crypto/tls#RenegotiationSupport).

### When to use:
You can use this when the server with which the HTTP binding is configured to communicate requires mTLS or client TLS authentication.


## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
- [How-To: Install certificates in the Dapr sidecar]({{< ref install-certificates >}})
