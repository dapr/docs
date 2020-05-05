# State Management API Specification

## Endpoints 
- [Component File](#component-file)
- [Key Scheme](#key-scheme)
- [Save State](#save-state)
- [Get State](#get-state)
- [Delete State](#delete-state)
- [Configuring State Store for Actors](#configuring-state-store-for-actors)
- [Optional Behaviors](#optional-behaviors)

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

```http
POST http://localhost:<daprPort>/v1.0/state/<storename>
```

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
storename | ```metadata.name``` field in the user configured state store component yaml. Please refer Dapr State Store configuration structure mentioned above.

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
201  | State saved
400  | State store is missing or misconfigured
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
          "value": "DeathStar"
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

```http
GET http://localhost:<daprPor>/v1.0/state/<storename>/<key>

```

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
storename | ```metadata.name``` field in the user configured state store component yaml. Please refer Dapr State Store configuration structure mentioned above.
key | the key of the desired state
consistency | (optional) read consistency mode, see [state operation options](#optional-behaviors)

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

## Delete state

This endpoint lets you delete the state for a specific key.

### HTTP Request

```http
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
retryInterval | (optional) retry interval, in milliseconds, see [retry policy](#retry-policy)
retryPattern | (optional) retry pattern, can be either *linear* or *exponential*, see [retry policy](#retry-policy)
retryThreshold | (optional) number of retries, see [retry policy](#retry-policy)

#### Request Headers

Header | Description
--------- | -----------
If-Match | (Optional) ETag associated with the key to be deleted

### HTTP Response

#### Response Codes

Code | Description
---- | -----------
200  | Delete state successful
400  | State store is missing or misconfigured
500  | Delete state failed

#### Response Body
None.

### Example

```shell
curl -X "DELETE" http://localhost:3500/v1.0/state/starwars/planet -H "ETag: xxxxxxx"
```

## Configuring state store for actors

Actors don't support multiple state stores and require a transactional state store to be used with Dapr. Currently mongodb and redis implement the transactional state store interface.
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

### Retry Policy

Dapr allows clients to attach retry policies to *set* and *delete* operations. A retry policy is described by three fields:

Field | Description
---- | -----------
retryInterval | Initial delay between retries, in milliseconds. The interval remains constant for *linear* retry pattern. The interval is doubled after each retry for *exponential* retry pattern. So, for *exponential* pattern, the delay after attempt *n* will be interval*2^(n-1).
retryPattern | Retry pattern, can be either *linear* or *exponential*.
retryThreshold | Maximum number of retries.

### Example

The following is a sample *set* request with a complete operation option definition:

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
            "consistency": "strong",
            "retryPolicy": {
              "interval": 100,
              "threshold" : 3,
              "pattern": "exponential"
            }
          }
        }
      ]'
```
