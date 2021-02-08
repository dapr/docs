---
type: docs
title: "HTTP binding spec"
linkTitle: "HTTP"
description: "Detailed documentation on the HTTP binding component"
---

## Setup Dapr component

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
    value: http://something.com
```

- `url` is the HTTP url to invoke.

## Output Binding Supported Operations

### Retrieving data

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

#### Response

The response body will contain the data returned by the HTTP endpoint.  The `data` field contains the HTTP response body as a byte slice (Base64 encoded via curl). The `metadata` field contains the values from the HTTP response headers.

#### Example:

> We escape since ' is not supported on Windows
> On Windows, utilize CMD (PowerShell has different escaping mechanism)

**Requesting the base URL**

```bash
curl -d "{ \"operation\": \"get\" }" \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

**Requesting a specific path**

```bash
curl -d "{ \"operation\": \"get\", \"metadata\": { \"path\": \"/things/1234\" } }" \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

### Creating and Updating data

To send data to the HTTP endpoint, invoke the HTTP binding with a `POST`, `PUT`, or `PATCH` method and the following JSON body:

> Note: Any metadata field that starts with a capital letter is passed as a request header. For example, the default content type is `application/json; charset=utf-8`. This can be overriden be setting the `Content-Type` metadata field.

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

#### Example:

**Posting a new record**

```bash
curl -d "{ \"operation\": \"post\", \"data\": \"YOUR_BASE_64_CONTENT\", \"metadata\": { \"path\": \"/things\" } }" \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

## Related links
- [Bindings building block]({{< ref bindings >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})