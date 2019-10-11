# Metadata

## Get Dapr metadata

This endpoint lets you inspect additional data related to the running Dapr runtime instance.

### HTTP Request

`GET http://localhost:3500/v1.0/metadata`

### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed

```shell
curl http://localhost:3500/v1.0/metadata \
	-H "Content-Type: application/json"
```

> The above command returns the following JSON:

```json
{
  "id": "myApp",
  "protocol": "gRPC",
  "stateStore": "redis",
  "appAddress": "http://localhost:8080",
  "healthy": true,
  "stateItemsCount": 1000,
  "actors": [
    {
      "actorType": "sith",
      "activatedContexts": [
        "darth-vader",
        "darth-nihilus",
        "darth sidious"
      ]
    }
  ]
}
```