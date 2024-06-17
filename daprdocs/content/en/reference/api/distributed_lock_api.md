---
type: docs
title: "Distributed Lock API reference"
linkTitle: "Distributed Lock API"
description: "Detailed documentation on the distributed lock API"
weight: 900
---

## Lock

This endpoint lets you acquire a lock by supplying a named lock owner and the resource ID to lock.

### HTTP Request

```
POST http://localhost:<daprPort>/v1.0-alpha1/lock/<storename>
```

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port
`storename` | The `metadata.name` field component file. Refer to the [component schema]({{< ref component-schema.md >}})

#### Query Parameters

None

### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
204  | Empty Response
400  | Malformed request
500  | Request failed

### HTTP Request Body

The lock endpoint receives the following JSON payload:

```json
{
    "resourceId": "",
    "lockOwner": "",
    "expiryInSeconds": 0
}
```

Field | Description
---- | -----------
resourceId  | The ID of the resource to lock. Can be any value
lockOwner  | The name of the lock owner. Should be set to a unique value per-request
expiryInSeconds  | The time in seconds to hold the lock before it expires

### HTTP Response Body

The lock endpoint returns the following payload:

```json
{
    "success": true
}
```

### Examples

```shell
curl -X POST http://localhost:3500/v1.0-alpha/lock/redisStore \
  -H "Content-Type: application/json" \
  -d '{
        "resourceId": "lock1",
        "lockOwner": "vader",
        "expiryInSeconds": 60
      }'

{
    "success": "true"
}
```

## Unlock

This endpoint lets you unlock an existing lock based on the lock owner and resource Id

### HTTP Request

```
POST http://localhost:<daprPort>/v1.0-alpha1/unlock/<storename>
```

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port
`storename` | The `metadata.name` field component file. Refer to the [component schema]({{< ref component-schema.md >}})

#### Query Parameters

None

### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
204  | Empty Response
400  | Malformed request
500  | Request failed

### HTTP Request Body

The unlock endpoint receives the following JSON payload:

```json
{
    "resourceId": "",
    "lockOwner": ""
}
```

### HTTP Response Body

The unlock endpoint returns the following payload:

```json
{
    "status": 0
}
```

The `status` field contains the following response codes:

Code | Description
---- | -----------
0  | Success
1  | Lock doesn't exist
2  | Lock belongs to another owner
3  | Internal error

### Examples

```shell
curl -X POST http://localhost:3500/v1.0-alpha/unlock/redisStore \
  -H "Content-Type: application/json" \
  -d '{
        "resourceId": "lock1",
        "lockOwner": "vader"
      }'

{
    "status": 0
}
```
