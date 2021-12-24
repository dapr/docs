---
type: docs
title: "State management API reference"
linkTitle: "State management API"
description: "Detailed documentation on the state management API"
weight: 200
---

## Component file

A Dapr State Store component yaml file has the following structure:

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

The ```metadata.name``` is the name of the state store.

the ```spec/metadata``` section is an open key value pair metadata that allows a binding to define connection properties.

Starting with 0.4.0 release, support for multiple state stores was added. This is a breaking change from previous releases as the state APIs were changed to support this new scenario.

Please refer https://github.com/dapr/dapr/blob/master/docs/decision_records/api/API-008-multi-state-store-api-design.md for more details.

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
daprPort | the Dapr port
storename | ```metadata.name``` field in the user configured state store component yaml. Please refer Dapr State Store configuration structure mentioned above.

> Note, all URL parameters are case-sensitive.

#### Request Body

A JSON array of state objects. Each state object is comprised with the following fields:

Field | Description
---- | -----------
key | state key
value | state value, which can be any byte array
etag | (optional) state ETag
metadata | (optional) additional key-value pairs to be passed to the state store
options | (optional) state operation options, see [state operation options](#optional-behaviors)

> **ETag format** Dapr runtime treats ETags as opaque strings. The exact ETag format is defined by the corresponding data store.

### HTTP Response

#### Response Codes

Code | Description
---- | -----------
204  | State saved
400  | State store is missing or misconfigured or malformed request
500  | Failed to save state

#### Response Body

None.

### Example

```shell
curl -X POST http://localhost:3500/v1.0/state/starwars \
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
daprPort | the Dapr port
storename | ```metadata.name``` field in the user configured state store component yaml. Please refer Dapr State Store configuration structure mentioned above.
key | the key of the desired state
consistency | (optional) read consistency mode, see [state operation options](#optional-behaviors)
metadata | (optional) metadata as query parameters to the state store

> Note, all URL parameters are case-sensitive.

### HTTP Response

#### Response Codes

Code | Description
---- | -----------
200  | Get state successful
204  | Key is not found
400  | State store is missing or misconfigured
500  | Get state failed

#### Response Headers

Header | Description
--------- | -----------
ETag | ETag of returned value

#### Response Body
JSON-encoded value

### Example

```shell
curl http://localhost:3500/v1.0/state/starwars/planet \
  -H "Content-Type: application/json"
```

> The above command returns the state:

```json
{
  "name": "Tatooine"
}
```

To pass metadata as query parammeter:

```
GET http://localhost:3500/v1.0/state/starwars/planet?metadata.partitionKey=mypartitionKey
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
daprPort | the Dapr port
storename | ```metadata.name``` field in the user configured state store component yaml. Please refer Dapr State Store configuration structure mentioned above.
metadata | (optional) metadata as query parameters to the state store

> Note, all URL parameters are case-sensitive.

### HTTP Response

#### Response Codes

Code | Description
---- | -----------
200  | Get state successful
400  | State store is missing or misconfigured
500  | Get bulk state failed

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
    "data": "value1",
    "etag": "1"
  },
  {
    "key": "key2",
    "data": "value2",
    "etag": "1"
  }
]
```
To pass metadata as query parammeter:

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
daprPort | the Dapr port
storename | ```metadata.name``` field in the user configured state store component yaml. Please refer Dapr State Store configuration structure mentioned above.
key | the key of the desired state
concurrency | (optional) either *first-write* or *last-write*, see [state operation options](#optional-behaviors)
consistency | (optional) either *strong* or *eventual*, see [state operation options](#optional-behaviors)

> Note, all URL parameters are case-sensitive.

#### Request Headers

Header | Description
--------- | -----------
If-Match | (Optional) ETag associated with the key to be deleted

### HTTP Response

#### Response Codes

Code | Description
---- | -----------
204  | Delete state successful
400  | State store is missing or misconfigured
500  | Delete state failed

#### Response Body
None.

### Example

```shell
curl -X "DELETE" http://localhost:3500/v1.0/state/starwars/planet -H "If-Match: xxxxxxx"
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
daprPort | the Dapr port
storename | ```metadata.name``` field in the user configured state store component yaml. Refer to the Dapr state store configuration structure mentioned above.
metadata | (optional) metadata as query parameters to the state store

> Note, all URL parameters are case-sensitive.

#### Response Codes

Code | Description
---- | -----------
200  | State query successful
400  | State store is missing or misconfigured
500  | State query failed

#### Response Body
An array of JSON-encoded values

### Example

```shell
curl http://localhost:3500/v1.0-alpha1/state/myStore/query \
  -H "Content-Type: application/json" \
  -d '{
        "query": {
          "filter": {
            "OR": [
              {
                "EQ": { "value.person.org": "Dev Ops" }
              },
              {
                "AND": [
                  {
                    "EQ": { "value.person.org": "Finance" }
                  },
                  {
                    "IN": { "value.state": [ "CA", "WA" ] }
                  }
                ]
              }
            ]
          },
          "sort": [
            {
              "key": "value.state",
              "order": "DESC"
            },
            {
              "key": "value.person.id"
            }
          ],
          "pagination": {
            "limit": 3
          }
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
To pass metadata as query parammeter:

```
POST http://localhost:3500/v1.0-alpha1/state/myStore/query?metadata.partitionKey=mypartitionKey
```

## State transactions

Persists the changes to the state store as a multi-item transaction.

***Note that this operation is dependant on a using state store component that supports multi-item transactions.***

List of state stores that support transactions:

* Redis
* MongoDB
* PostgreSQL
* SQL Server
* Azure CosmosDB

#### HTTP Request

```
POST/PUT http://localhost:<daprPort>/v1.0/state/<storename>/transaction
```

#### HTTP Response Codes

Code | Description
---- | -----------
204  | Request successful
400  | State store is missing or misconfigured or malformed request
500  | Request failed

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
storename | ```metadata.name``` field in the user configured state store component yaml. Please refer Dapr State Store configuration structure mentioned above.

> Note, all URL parameters are case-sensitive.

#### Request Body

Field | Description
---- | -----------
operations | A JSON array of state operation
metadata | (optional) the metadata for transaction that applies to all operations

Each state operation is comprised with the following fields:

Field | Description
---- | -----------
key | state key
value | state value, which can be any byte array
etag | (optional) state ETag
metadata | (optional) additional key-value pairs to be passed to the state store
options | (optional) state operation options, see [state operation options](#optional-behaviors)


#### Examples

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

Actors don't support multiple state stores and require a transactional state store to be used with Dapr. Currently Mongodb, Redis, PostgreSQL, SQL Server, and Azure CosmosDB implement the transactional state store interface.

To specify which state store to be used for actors, specify value of property `actorStateStore` as true in the metadata section of the state store component yaml file.
Example: Following components yaml will configure redis to be used as the state store for Actors.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
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

Dapr uses Optimized Concurrency Control (OCC) with ETags. Dapr makes optional the following requirements on state stores:

* An Dapr-compatible state store may support optimistic concurrency control using ETags. When an ETag is associated with an *save* or *delete*  request, the store shall allow the update only if the attached ETag matches with the latest ETag in the database.
* When ETag is missing in the write requests, the state store shall handle the requests in a last-write-wins fashion. This is to allow optimizations for high-throughput write scenarios in which data contingency is low or has no negative effects.
* A store shall **always** return ETags when returning states to callers.

### Consistency

Dapr allows clients to attach a consistency hint to *get*, *set* and *delete* operation. Dapr support two consistency level: **strong** and **eventual**, which are defined as the follows:

#### Eventual Consistency

Dapr assumes data stores are eventually consistent by default. A state should:

* For read requests, the state store can return data from any of the replicas
* For write request, the state store should asynchronously replicate updates to configured quorum after acknowledging the update request.

#### Strong Consistency

When a strong consistency hint is attached, a state store should:

* For read requests, the state store should return the most up-to-date data consistently across replicas.
* For write/delete requests, the state store should synchronisely replicate updated data to configured quorum before completing the write request.

### Example - Complete options request example

The following is an example *set* request with a complete options definition:

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

### Example - Working with ETags
The following is an example which walks through the usage of an ETag when setting/deleting an object in a compatible statestore.

First, store an object in a statestore (this sample uses Redis that has been defined as 'statestore'):

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

Get the object to find the ETag that was set automatically by the statestore:

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

The returned ETag here was 1. Sending a new request to update or delete the data with the wrong ETag will return an error (omitting the ETag will allow the request):

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

In order to update or delete the object, simply match the ETag in either the request body (update) or the `If-Match` header (delete). Note, when the state is updated, it receives a new ETag so further updates or deletes will need to use the new ETag.

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
