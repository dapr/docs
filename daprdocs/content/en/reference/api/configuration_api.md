---
type: docs
title: "Configuration API reference"
linkTitle: "Configuration API"
description: "Detailed documentation on the configuration API"
weight: 700
---

## Component file

A Dapr `configuration.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: configuration.<TYPE>
  version: v1
  metadata:
  - name:<KEY>
    value:<VALUE>
```

| Setting | Description                                                                            |
| ------- |----------------------------------------------------------------------------------------|
| `metadata.name` | The name of the configuration store.                                                   |
| `spec.metadata` | An open key value pair metadata that allows a binding to define connection properties. |

## Get Configuration

This endpoint lets you get configuration from a store.

### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/configuration/<storename>
```

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port
`storename` | The `metadata.name` field in the user-configured `configuration.yaml` component file. Refer to the [Dapr configuration store component file structure](#component-file) mentioned above.

#### Query Parameters

If no query parameters are provided, all configuration items will be returned.
To specifiy the keys of the configuration items to get, use one or more `key` query parameters. For example:

```
GET http://localhost:3500/v1.0/configuration/mystore?key=config1&key=config2
```

#### Request Body

None

### HTTP Response

#### Response Codes

Code | Description
---- | -----------
`200`  | Get operation successful
`400`  | Configuration store is missing or misconfigured or malformed request
`500`  | Failed to get configuration

#### Response Body

JSON-encoded value

### Example

```shell
curl -X GET 'http://localhost:3500/v1.0-alpha1/configuration/example-config?key=myConfigKey' 
```

> The above command returns the following JSON:

```json
[{"key":"myConfigKey","value":"myConfigValue"}]
```

## Next Steps

- [Configuration api overview]({{< ref configuration-api-overview.md >}})
- [How-To: Manage configuration]({{< ref howto-manage-configuration.md >}})
