---
type: docs
title: "Configuration API reference"
linkTitle: "Configuration API"
description: "Detailed documentation on the configuration API"
weight: 650
---

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

If no query parameters are provided, all configuration items are returned.
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
`204`  | Get operation successful
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

## Subscribe Configuration

This endpoint lets you subscribe to configuration changes.

### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/configuration/<storename>/subscribe
```

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port
`storename` | The `metadata.name` field in the user-configured `configuration.yaml` component file. Refer to the [Dapr configuration store component file structure](#component-file) mentioned above.

#### Query Parameters

If no query parameters are provided, all configuration items will subscribed to.
To specifiy the keys of the configuration items to subscribe to, use one or more `key` query parameters. For example:

```
GET http://localhost:3500/v1.0/configuration/mystore/subscribe?key=config1&key=config2
```

#### Request Body

None

### HTTP Response

#### Response Codes

Code | Description
---- | -----------
`200`  | Subscribe operation successful
`400`  | Configuration store is missing or misconfigured or malformed request
`500`  | Failed to subscribe to configuration changes

#### Response Body

JSON-encoded value

### Example

```shell
curl -X GET 'http://localhost:3500/v1.0-alpha1/configuration/subscribe?key=myConfigKey' 
```

> The above command returns the following JSON:

```json
{
  "id": "<unique-id>"
}
```

The returned `id` parameter can be used to unsubscribe to the keys provided on the API call.

## Unsubscribe Configuration

This endpoint lets you unsubscribe to configuration changes.

### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/configuration/<subscription-id>/unsubscribe
```

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port
`subscription-id` | The value from the `id` field returned from the response of the subscribe endpoint

#### Query Parameters

None

#### Request Body

None

### HTTP Response

#### Response Codes

Code | Description
---- | -----------
`204`  | Unsubscribe operation successful
`400`  | Configuration store is missing or misconfigured or malformed request
`500`  | Failed to unsubscribe to configuration changes

#### Response Body

None

### Example

```shell
curl -X GET 'http://localhost:3500/v1.0-alpha1/configuration/bf3aa454-312d-403c-af95-6dec65058fa2/unsubscribe' 
```

## Optional Application (User Code) Routes

### Provide a route for Dapr to send configuration changes

When subscribing to configuration changes, Dapr will invoke the application whenever a configuration item changes.

#### HTTP Request

```
POST http://localhost:<appPort>/configuration/<store-name>/<key>
```

#### URL Parameters

Parameter | Description
--------- | -----------
`appPort` | The application port
`storename` | The `metadata.name` field in the user-configured `configuration.yaml` component file. Refer to the [Dapr configuration store component file structure](#component-file) mentioned above
`key` | The key of the changed configuration item

#### Request Body

```json
{
    "id": "<subscription-id>",
    "items": [
        "key": "<key-of-configuration-item>",
        "value": "<new-value>",
        "version": "<version-of-item>"
    ]
}
```

#### Example

```json
{
    "id": "bf3aa454-312d-403c-af95-6dec65058fa2",
    "items": [
        "key": "config-1",
        "value": "abcdefgh",
        "version": "1.1"
    ]
}
```


## Next Steps

- [Configuration api overview]({{< ref configuration-api-overview.md >}})
- [How-To: Manage configuration]({{< ref howto-manage-configuration.md >}})