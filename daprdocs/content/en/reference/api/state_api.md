---
type: docs
title: "State management API reference"
linkTitle: "State management API"
description: "Detailed documentation on the state management API"
weight: 200
---

## Component file

A Dapr `statestore.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.<TYPE>
  version: v1
  metadata:
  - name:<KEY>
    value:<VALUE>
  - name: <KEY>
    value: <VALUE>
```

| Setting | Description |
| ------- | ----------- |
| `metadata.name` | The name of the state store. |
| `spec/metadata` | An open key value pair metadata that allows a binding to define connection properties. |

## Key scheme

Dapr state stores are key/value stores. To ensure data compatibility, Dapr requires these data stores follow a fixed key scheme. For general states, the key format is:

```
<App ID>||<state key>
```

For Actor states, the key format is:

```
<App ID>||<Actor type>||<Actor id>||<state key>
```

## Save state

This endpoint lets you save an array of state objects.

### HTTP Request

```
POST http://localhost:<daprPort>/v1.0/state/<storename>
```

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port
`storename` | The `metadata.name` field in the user-configured `statestore.yaml` component file. Refer to the [Dapr state store configuration structure](#component-file) mentioned above.

The optional request metadata is passed via URL query parameters. For example,
```
POST http://localhost:3500/v1.0/state/myStore?metadata.contentType=application/json
```
> All URL parameters are case-sensitive.

#### Request Body

A JSON array of state objects. Each state object is comprised with the following fields:

Field | Description
---- | -----------
`key` | State key
`value` | State value, which can be any byte array
`etag` | (optional) State ETag
`metadata` | (optional) Additional key-value pairs to be passed to the state store
`options` | (optional) State operation options; see [state operation options](#optional-behaviors)

> **ETag format:** Dapr runtime treats ETags as opaque strings. The exact ETag format is defined by the corresponding data store.

#### Metadata

Metadata can be sent via query parameters in the request's URL. It must be prefixed with `metadata.`, as shown below.

Parameter | Description
--------- | -----------
`metadata.ttlInSeconds` | The number of seconds for the message to expire, as [described here]({{< ref state-store-ttl.md >}})

> **TTL:** Only certain state stores support the TTL option, according the [supported state stores]({{< ref supported-state-stores.md >}}).

### HTTP Response

#### Response Codes

Code | Description
---- | -----------
`204`  | State saved
`400`  | State store is missing or misconfigured or malformed request
`500`  | Failed to save state

#### Response Body

None.

### Example

```shell
curl -X POST http://localhost:3500/v1.0/state/starwars?metadata.contentType=application/json \
  -H "Content-Type: application/json" \
  -d '[
        {
          "key": "weapon",
          "value": "DeathStar",
          "etag": "1234"
        },
        {
          "key": "planet",
          "value": {
            "name": "Tatooine"
          }
        }
      ]'
```

## Get state

This endpoint lets you get the state for a specific key.

### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/state/<storename>/<key>
```

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port
`storename` | `metadata.name` field in the user-configured statestore.yaml component file. Refer to the [Dapr state store configuration structure](#component-file) mentioned above.
`key` | The key of the desired state
`consistency` | (optional) Read consistency mode; see [state operation options](#optional-behaviors)
`metadata` | (optional) Metadata as query parameters to the state store

The optional request metadata is passed via URL query parameters. For example,
```
GET http://localhost:3500/v1.0/state/myStore/myKey?metadata.contentType=application/json
```

> Note, all URL parameters are case-sensitive.

### HTTP Response

#### Response Codes

Code | Description
---- | -----------
`200`  | Get state successful
`204`  | Key is not found
`400`  | State store is missing or misconfigured
`500`  | Get state failed

#### Response Headers

Header | Description
--------- | -----------
`ETag` | ETag of returned value

#### Response Body

JSON-encoded value

### Example

```shell
curl http://localhost:3500/v1.0/state/starwars/planet?metadata.contentType=application/json
```

> The above command returns the state:

```json
{
  "name": "Tatooine"
}
```

To pass metadata as query parameter:

```
GET http://localhost:3500/v1.0/state/starwars/planet?metadata.partitionKey=mypartitionKey&metadata.contentType=application/json
```

## Get bulk state

This endpoint lets you get a list of values for a given list of keys.

### HTTP Request

```
POST/PUT http://localhost:<daprPort>/v1.0/state/<storename>/bulk
```

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port
`storename` | `metadata.name` field in the user-configured statestore.yaml component file. Refer to the [Dapr state store configuration structure](#component-file) mentioned above.
`metadata` | (optional) Metadata as query parameters to the state store

The optional request metadata is passed via URL query parameters. For example,
```
POST/PUT http://localhost:3500/v1.0/state/myStore/bulk?metadata.partitionKey=mypartitionKey
```

> Note, all URL parameters are case-sensitive.

### HTTP Response

#### Response Codes

Code | Description
---- | -----------
`200`  | Get state successful
`400`  | State store is missing or misconfigured
`500`  | Get bulk state failed

#### Response Body

An array of JSON-encoded values

### Example

```shell
curl http://localhost:3500/v1.0/state/myRedisStore/bulk \
  -H "Content-Type: application/json" \
  -d '{
          "keys": [ "key1", "key2" ],
          "parallelism": 10
      }'
```

> The above command returns an array of key/value objects:

```json
[
  {
    "key": "key1",
    "value": "value1",
    "etag": "1"
  },
  {
    "key": "key2",
    "value": "value2",
    "etag": "1"
  }
]
```

To pass metadata as query parameter:

```
POST http://localhost:3500/v1.0/state/myRedisStore/bulk?metadata.partitionKey=mypartitionKey
```

## Delete state

This endpoint lets you delete the state for a specific key.

### HTTP Request

```
DELETE http://localhost:<daprPort>/v1.0/state/<storename>/<key>
```

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port
`storename` | `metadata.name` field in the user-configured statestore.yaml component file. Refer to the [Dapr state store configuration structure](#component-file) mentioned above.
`key` | The key of the desired state
`concurrency` | (optional) Either *first-write* or *last-write*; see [state operation options](#optional-behaviors)
`consistency` | (optional) Either *strong* or *eventual*; see [state operation options](#optional-behaviors)

The optional request metadata is passed via URL query parameters. For example,
```
DELETE http://localhost:3500/v1.0/state/myStore/myKey?metadata.contentType=application/json
```

> Note, all URL parameters are case-sensitive.

#### Request Headers

Header | Description
--------- | -----------
If-Match | (Optional) ETag associated with the key to be deleted

### HTTP Response

#### Response Codes

Code | Description
---- | -----------
`204`  | Delete state successful
`400`  | State store is missing or misconfigured
`500`  | Delete state failed

#### Response Body

None.

### Example

```shell
curl -X DELETE http://localhost:3500/v1.0/state/starwars/planet -H "If-Match: xxxxxxx"
```

## Query state

This endpoint lets you query the key/value state.

{{% alert title="alpha" color="warning" %}}
This API is in alpha stage.
{{% /alert %}}

### HTTP Request

```
POST/PUT http://localhost:<daprPort>/v1.0-alpha1/state/<storename>/query
```

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port
`storename` | `metadata.name` field in the user-configured statestore.yaml component file. Refer to the [Dapr state store configuration structure](#component-file) mentioned above.
`metadata` | (optional) Metadata as query parameters to the state store

The optional request metadata is passed via URL query parameters. For example,
```
POST http://localhost:3500/v1.0-alpha1/state/myStore/query?metadata.contentType=application/json
```

> Note, all URL parameters are case-sensitive.

#### Response Codes

Code | Description
---- | -----------
`200`  | State query successful
`400`  | State store is missing or misconfigured
`500`  | State query failed

#### Response Body

An array of JSON-encoded values

### Example

```shell
curl -X POST http://localhost:3500/v1.0-alpha1/state/myStore/query?metadata.contentType=application/json \
  -H "Content-Type: application/json" \
  -d '{
        "filter": {
          "OR": [
            {
              "EQ": { "person.org": "Dev Ops" }
            },
            {
              "AND": [
                {
                  "EQ": { "person.org": "Finance" }
                },
                {
                  "IN": { "state": [ "CA", "WA" ] }
                }
              ]
            }
          ]
        },
        "sort": [
          {
            "key": "state",
            "order": "DESC"
          },
          {
            "key": "person.id"
          }
        ],
        "page": {
          "limit": 3
        }
      }'
```

> The above command returns an array of objects along with a token:

```json
{
  "results": [
    {
      "key": "1",
      "data": {
        "person": {
          "org": "Dev Ops",
          "id": 1036
        },
        "city": "Seattle",
        "state": "WA"
      },
      "etag": "6f54ad94-dfb9-46f0-a371-e42d550adb7d"
    },
    {
      "key": "4",
      "data": {
        "person": {
          "org": "Dev Ops",
          "id": 1042
        },
        "city": "Spokane",
        "state": "WA"
      },
      "etag": "7415707b-82ce-44d0-bf15-6dc6305af3b1"
    },
    {
      "key": "10",
      "data": {
        "person": {
          "org": "Dev Ops",
          "id": 1054
        },
        "city": "New York",
        "state": "NY"
      },
      "etag": "26bbba88-9461-48d1-8a35-db07c374e5aa"
    }
  ],
  "token": "3"
}
```

To pass metadata as query parameter:

```
POST http://localhost:3500/v1.0-alpha1/state/myStore/query?metadata.partitionKey=mypartitionKey
```

## State transactions

Persists the changes to the state store as a [transactional operation]({{< ref "state-management-overview.md#transactional-operations" >}}).

> This API depends on a state store component that supports transactions.

Refer to the [state store component spec]({{< ref "supported-state-stores.md" >}}) for a full, current list of state stores that support transactions.

#### HTTP Request

```
POST/PUT http://localhost:<daprPort>/v1.0/state/<storename>/transaction
```

#### HTTP Response Codes

Code | Description
---- | -----------
`204`  | Request successful
`400`  | State store is missing or misconfigured or malformed request
`500`  | Request failed

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port
`storename` | `metadata.name` field in the user-configured statestore.yaml component file. Refer to the [Dapr state store configuration structure](#component-file) mentioned above.

The optional request metadata is passed via URL query parameters. For example,
```
POST http://localhost:3500/v1.0/state/myStore/transaction?metadata.contentType=application/json
```

> Note, all URL parameters are case-sensitive.

#### Request Body

Field | Description
---- | -----------
`operations` | A JSON array of state `operation`
`metadata` | (optional) The `metadata` for the transaction that applies to all operations

All transactional databases implement the following required operations:

Operation | Description
--------- | -----------
`upsert` | Adds or updates the value
`delete` | Deletes the value

Each operation has an associated `request` that is comprised of the following fields:

Request | Description
---- | -----------
`key` | State key
`value` | State value, which can be any byte array
`etag` | (optional) State ETag
`metadata` | (optional) Additional key-value pairs to be passed to the state store that apply for this operation
`options` | (optional) State operation options; see [state operation options](#optional-behaviors)

#### Examples
The example below shows an `upsert` operation for `key1` and a `delete` operation for `key2`. This is applied to the partition named 'planet' in the state store. Both operations either succeed or fail in the transaction.

```shell
curl -X POST http://localhost:3500/v1.0/state/starwars/transaction \
  -H "Content-Type: application/json" \
  -d '{
        "operations": [
          {
            "operation": "upsert",
            "request": {
              "key": "key1",
              "value": "myData"
            }
          },
          {
            "operation": "delete",
            "request": {
              "key": "key2"
            }
          }
        ],
        "metadata": {
          "partitionKey": "planet"
        }
      }'
```

## Configuring state store for actors

Actors don't support multiple state stores and require a transactional state store to be used with Dapr. [View which services currently implement the transactional state store interface]({{< ref "supported-state-stores.md" >}}).

Specify which state store to be used for actors with a `true` value for the property `actorStateStore` in the metadata section of the `statestore.yaml` component file.
For example, the following components yaml will configure Redis to be used as the state store for Actors.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: <redis host>
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"

```

## Optional behaviors

### Key scheme

A Dapr-compatible state store shall use the following key scheme:

* *\<App ID>||\<state key>* key format for general states
* *\<App ID>||\<Actor type>||\<Actor id>||\<state key>* key format for Actor states.

### Concurrency

Dapr uses Optimized Concurrency Control (OCC) with ETags. Dapr makes the following requirements optional on state stores:

* A Dapr-compatible state store may support optimistic concurrency control using ETags. The store allows the update when an ETag:
  * Is associated with an *save* or *delete* request.
  * Matches the latest ETag in the database.
* When ETag is missing in the write requests, the state store shall handle the requests in a *last-write-wins* fashion. This allows optimizations for high-throughput write scenarios, in which data contingency is low or has no negative effects.
* A store shall *always* return ETags when returning states to callers.

### Consistency

Dapr allows clients to attach a consistency hint to *get*, *set*, and *delete* operation. Dapr supports two consistency levels: **strong** and **eventual**.

#### Eventual Consistency

Dapr assumes data stores are eventually consistent by default. A state should:

* For *read* requests, return data from any of the replicas.
* For *write* requests, asynchronously replicate updates to configured quorum after acknowledging the update request.

#### Strong Consistency

When a strong consistency hint is attached, a state store should:

* For *read* requests, return the most up-to-date data consistently across replicas.
* For *write*/*delete* requests, synchronously replicate updated data to configured quorum before completing the write request.

### Example: Complete options request example

The following is an example *set* request with a complete `options` definition:

```shell
curl -X POST http://localhost:3500/v1.0/state/starwars \
  -H "Content-Type: application/json" \
  -d '[
        {
          "key": "weapon",
          "value": "DeathStar",
          "etag": "xxxxx",
          "options": {
            "concurrency": "first-write",
            "consistency": "strong"
          }
        }
      ]'
```

### Example: Working with ETags

The following is an example walk-through of an ETag usage when *setting*/*deleting* an object in a compatible state store. This sample defines Redis as `statestore`.

1. Store an object in a state store:

   ```shell
   curl -X POST http://localhost:3500/v1.0/state/statestore \
       -H "Content-Type: application/json" \
       -d '[
               {
                   "key": "sampleData",
                   "value": "1"
               }
       ]'
   ```

1. Get the object to find the ETag set automatically by the state store:

   ```shell
   curl http://localhost:3500/v1.0/state/statestore/sampleData -v
   * Connected to localhost (127.0.0.1) port 3500 (#0)
   > GET /v1.0/state/statestore/sampleData HTTP/1.1
   > Host: localhost:3500
   > User-Agent: curl/7.64.1
   > Accept: */*
   >
   < HTTP/1.1 200 OK
   < Server: fasthttp
   < Date: Sun, 14 Feb 2021 04:51:50 GMT
   < Content-Type: application/json
   < Content-Length: 3
   < Etag: 1
   < Traceparent: 00-3452582897d134dc9793a244025256b1-b58d8d773e4d661d-01
   <
   * Connection #0 to host localhost left intact
   "1"* Closing connection 0
   ```

   The returned ETag above was 1. If you send a new request to update or delete the data with the wrong ETag, it will return an error. Omitting the ETag will allow the request.

   ```shell
   # Update
   curl -X POST http://localhost:3500/v1.0/state/statestore \
       -H "Content-Type: application/json" \
       -d '[
               {
                   "key": "sampleData",
                   "value": "2",
                   "etag": "2"
               }
       ]'
   {"errorCode":"ERR_STATE_SAVE","message":"failed saving state in state store statestore: possible etag mismatch. error from state store: ERR Error running script (call to f_83e03ec05d6a3b6fb48483accf5e594597b6058f): @user_script:1: user_script:1: failed to set key nodeapp||sampleData"}
   
   # Delete
   curl -X DELETE -H 'If-Match: 5' http://localhost:3500/v1.0/state/statestore/sampleData
   {"errorCode":"ERR_STATE_DELETE","message":"failed deleting state with key sampleData: possible etag mismatch. error from state store: ERR Error running script (call to f_9b5da7354cb61e2ca9faff50f6c43b81c73c0b94): @user_script:1: user_script:1: failed to delete node
   app||sampleData"}
   ```

1. Update or delete the object by simply matching the ETag in either the request body (update) or the `If-Match` header (delete). When the state is updated, it receives a new ETag that future updates or deletes will need to use.

   ```shell
   # Update
   curl -X POST http://localhost:3500/v1.0/state/statestore \
       -H "Content-Type: application/json" \
       -d '[
           {
               "key": "sampleData",
               "value": "2",
               "etag": "1"
           }
       ]'
   
   # Delete
   curl -X DELETE -H 'If-Match: 1' http://localhost:3500/v1.0/state/statestore/sampleData
   ```

## Next Steps

- [State management overview]({{< ref state-management-overview.md >}})
- [How-To: Save & get state]({{< ref howto-get-save-state.md >}})
