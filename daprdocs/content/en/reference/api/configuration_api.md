---
type: docs
title: "Configuration API reference"
linkTitle: "Configuration API"
description: "Detailed documentation on the configuration API"
weight: 700
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
`storename` | The `metadata.name` field component file. Refer to the [component spec]({{< ref component-schema.md>}})

#### Query Parameters

If no query parameters are provided, all configuration items are returned.
To specify the keys of the configuration items to get, use one or more `key` query parameters. For example:

```
GET http://localhost:<daprPort>/v1.0/configuration/mystore?key=config1&key=config2
```

To retrieve all configuration items:

```
GET http://localhost:<daprPort>/v1.0/configuration/mystore
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

JSON-encoded value of key/value pairs for each configuration item.

### Example

```shell
curl -X GET 'http://localhost:3500/v1.0/configuration/mystore?key=myConfigKey' 
```

> The above command returns the following JSON:

```json
{
    "myConfigKey": {
        "value":"myConfigValue"
    }
}
```

## Subscribe Configuration

This endpoint lets you subscribe to configuration changes. Notifications happen when values are updated or deleted in the configuration store. This enables the application to react to configuration changes.

### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/configuration/<storename>/subscribe
```

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port
`storename` | The `metadata.name` field component file. Refer to the [component spec]({{< ref component-schema.md>}})

#### Query Parameters

If no query parameters are provided, all configuration items are subscribed to.
To specify the keys of the configuration items to subscribe to, use one or more `key` query parameters. For example:

```
GET http://localhost:<daprPort>/v1.0/configuration/mystore/subscribe?key=config1&key=config2
```

To subscribe to all changes:

```
GET http://localhost:<daprPort>/v1.0/configuration/mystore/subscribe
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
curl -X GET 'http://localhost:3500/v1.0/configuration/mystore/subscribe?key=myConfigKey' 
```

> The above command returns the following JSON:

```json
{
  "id": "<unique-id>"
}
```

The returned `id` parameter can be used to unsubscribe to the specific set of keys provided on the subscribe API call. This should be retained by the application.

## Unsubscribe Configuration

This endpoint lets you unsubscribe to configuration changes.

### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/configuration/<storename>/<subscription-id>/unsubscribe
```

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port
`storename` | The `metadata.name` field component file. Refer to the [component spec]({{< ref component-schema.md>}})
`subscription-id` | The value from the `id` field returned from the response of the subscribe endpoint

#### Query Parameters

None

#### Request Body

None

### HTTP Response

#### Response Codes

Code | Description
---- | -----------
`200`  | Unsubscribe operation successful
`400`  | Configuration store is missing or misconfigured or malformed request
`500`  | Failed to unsubscribe to configuration changes

#### Response Body

```json
{
    "ok" : true
}
```

### Example

```shell
curl -X GET 'http://localhost:3500/v1.0-alpha1/configuration/mystore/bf3aa454-312d-403c-af95-6dec65058fa2/unsubscribe'
```

> The above command returns the following JSON:

In case of successful operation:

```json
{
  "ok": true
}
```
In case of unsuccessful operation:

```json
{
  "ok": false,
  "message": "<dapr returned error message>"
}
```

## Optional application (user code) routes

### Provide a route for Dapr to send configuration changes

subscribing to configuration changes, Dapr invokes the application whenever a configuration item changes. Your application can have a `/configuration` endpoint that is called for all key updates that are subscribed to. The endpoint(s) can be made more specific for a given configuration store by adding `/<store-name>` and for a specific key by adding `/<store-name>/<key>` to the route.

#### HTTP Request

```
POST http://localhost:<appPort>/configuration/<store-name>/<key>
```

#### URL Parameters

Parameter | Description
--------- | -----------
`appPort` | The application port
`storename` | The `metadata.name` field component file. Refer to the [component spec]({{< ref component-schema.md>}})
`key` | The key subscribed to

#### Request Body

A list of configuration items for a given subscription id. Configuration items can have a version associated with them, which is returned in the notification.

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

- [Configuration API overview]({{< ref configuration-api-overview.md >}})
- [How-To: Manage configuration from a store]({{< ref howto-manage-configuration.md >}})
