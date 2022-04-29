---
type: docs
title: "Actors API reference"
linkTitle: "Actors API"
description: "Detailed documentation on the actors API"
weight: 500
---

Dapr provides native, cross-platform, and cross-language virtual actor capabilities.
Besides the [language specific SDKs]({{<ref sdks>}}), a developer can invoke an actor using the API endpoints below.

## User service code calling Dapr

### Invoke actor method

Invoke an actor method through Dapr.

#### HTTP Request

```
POST/GET/PUT/DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/method/<method>
```

#### HTTP Response Codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
XXX  | Status code from upstream call

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port.
`actorType` | The actor type.
`actorId` | The actor ID.
`method` | The name of the method to invoke.

> Note, all URL parameters are case-sensitive.

#### Examples

Example of invoking a method on an actor:

```shell
curl -X POST http://localhost:3500/v1.0/actors/stormtrooper/50/method/shoot \
  -H "Content-Type: application/json"
```

You can provide the method parameters and values in the body of the request, for example in curl using `-d "{\"param\":\"value\"}"`. Example of invoking a method on an actor that takes parameters:

```shell
curl -X POST http://localhost:3500/v1.0/actors/x-wing/33/method/fly \
  -H "Content-Type: application/json" \
  -d '{
        "destination": "Hoth"
      }'
```

or

```shell
curl -X POST http://localhost:3500/v1.0/actors/x-wing/33/method/fly \
  -H "Content-Type: application/json" \
  -d "{\"destination\":\"Hoth\"}"
```

The response (the method return) from the remote endpoint is returned in the request body.

### Actor state transactions

Persists the change to the state for an actor as a multi-item transaction.

***Note that this operation is dependant on a using state store component that supports multi-item transactions.***

#### HTTP Request

```
POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/state
```

#### HTTP Response Codes

Code | Description
---- | -----------
204  | Request successful
400  | Actor not found
500  | Request failed

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port.
`actorType` | The actor type.
`actorId` | The actor ID.

> Note, all URL parameters are case-sensitive.

#### Examples

```shell
curl -X POST http://localhost:3500/v1.0/actors/stormtrooper/50/state \
  -H "Content-Type: application/json" \
  -d '[
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
      ]'
```

### Get actor state

Gets the state for an actor using a specified key.

#### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/state/<key>
```

#### HTTP Response Codes

Code | Description
---- | -----------
200  | Request successful
204  | Key not found, and the response will be empty
400  | Actor not found
500  | Request failed

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port.
`actorType` | The actor type.
`actorId` | The actor ID.
`key` | The key for the state value.

> Note, all URL parameters are case-sensitive.

#### Examples

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/state/location \
  -H "Content-Type: application/json"
```

The above command returns the state:

```json
{
  "location": "Alderaan"
}
```

### Create actor reminder

Creates a persistent reminder for an actor.

#### HTTP Request

```
POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### Request Body

A JSON object with the following fields:

| Field | Description |
|-------|--------------|
| `dueTime` | Specifies the time after which the reminder is invoked. Its format should be [time.ParseDuration](https://pkg.go.dev/time#ParseDuration)
| `period` | Specifies the period between different invocations. Its format should be [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) or ISO 8601 duration format with optional recurrence.

`period` field supports `time.Duration` format and ISO 8601 format with some limitations. For `period`, only duration format of ISO 8601 duration `Rn/PnYnMnWnDTnHnMnS` is supported. `Rn/` specifies that the reminder will be invoked `n` number of times. 

- `n` should be a positive integer greater than 0. 
- If certain values are 0, the `period` can be shortened; for example, 10 seconds can be specified in ISO 8601 duration as `PT10S`. 

If `Rn/` is not specified, the reminder will run an infinite number of times until deleted.

The following specifies a `dueTime` of 3 seconds and a period of 7 seconds.

```json
{
  "dueTime":"0h0m3s0ms",
  "period":"0h0m7s0ms"
}
```

A `dueTime` of 0 means to fire immediately. The following body means to fire immediately, then every 9 seconds.

```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m9s0ms"
}
```

To configure the reminder to fire only once, the period should be set to empty string. The following specifies a `dueTime` of 3 seconds with a period of empty string, which means the reminder will fire in 3 seconds and then never fire again.

```json
{
  "dueTime":"0h0m3s0ms",
  "period":""
}
```

#### HTTP Response Codes

Code | Description
---- | -----------
204  | Request successful
500  | Request failed
400  | Actor not found or malformed request

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port.
`actorType` | The actor type.
`actorId` | The actor ID.
`name` | The name of the reminder to create.

> Note, all URL parameters are case-sensitive.

#### Examples

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
  -H "Content-Type: application/json" \
-d '{
      "data": "someData",
      "dueTime": "1m",
      "period": "20s"
    }'
```

### Get actor reminder

Gets a reminder for an actor.

#### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### HTTP Response Codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port.
`actorType` | The actor type.
`actorId` | The actor ID.
`name` | The name of the reminder to get.

> Note, all URL parameters are case-sensitive.

#### Examples

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
  "Content-Type: application/json"
```

The above command returns the reminder:

```json
{
  "dueTime": "1s",
  "period": "5s",
  "data": "0",
}
```

### Delete actor reminder

Deletes a reminder for an actor.

#### HTTP Request

```
DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### HTTP Response Codes

Code | Description
---- | -----------
204  | Request successful
500  | Request failed

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port.
`actorType` | The actor type.
`actorId` | The actor ID.
`name` | The name of the reminder to delete.

> Note, all URL parameters are case-sensitive.

#### Examples

```shell
curl -X DELETE http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
  -H "Content-Type: application/json"
```

### Create actor timer

Creates a timer for an actor.

#### HTTP Request

```
POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

Body:

The following specifies a `dueTime` of 3 seconds and a period of 7 seconds.

```json
{
  "dueTime":"0h0m3s0ms",
  "period":"0h0m7s0ms"
}
```

A `dueTime` of 0 means to fire immediately.  The following body means to fire immediately, then every 9 seconds.

```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m9s0ms"
}
```

#### HTTP Response Codes

Code | Description
---- | -----------
204  | Request successful
500  | Request failed
400  | Actor not found or malformed request

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port.
`actorType` | The actor type.
`actorId` | The actor ID.
`name` | The name of the timer to create.

> Note, all URL parameters are case-sensitive.

#### Examples

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/timers/checkRebels \
    -H "Content-Type: application/json" \
-d '{
      "data": "someData",
      "dueTime": "1m",
      "period": "20s",
      "callback": "myEventHandler"
    }'
```

### Delete actor timer

Deletes a timer for an actor.

#### HTTP Request

```
DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

#### HTTP Response Codes

Code | Description
---- | -----------
204  | Request successful
500  | Request failed

#### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port.
`actorType` | The actor type.
`actorId` | The actor ID.
`name` | The name of the timer to delete.

> Note, all URL parameters are case-sensitive.

```shell
curl -X DELETE http://localhost:3500/v1.0/actors/stormtrooper/50/timers/checkRebels \
  -H "Content-Type: application/json"
```

## Dapr calling to user service code

### Get registered actors

Get the registered actors types for this app and the Dapr actor configuration settings.

#### HTTP Request

```
GET http://localhost:<appPort>/dapr/config
```

#### HTTP Response Codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed

#### URL Parameters

Parameter | Description
--------- | -----------
`appPort` | The application port.

#### Examples

Example of getting the registered actors:

```shell
curl -X GET http://localhost:3000/dapr/config \
  -H "Content-Type: application/json"
```

The above command returns the config (all fields are optional):

Parameter | Description
----------|------------
`entities`  | The actor types this app supports.
`actorIdleTimeout` | Specifies how long to wait before deactivating an idle actor.  An actor is idle if no actor method calls and no reminders have fired on it.
`actorScanInterval` | A duration which specifies how often to scan for actors to deactivate idle actors.  Actors that have been idle longer than the actorIdleTimeout will be deactivated.
`drainOngoingCallTimeout` | A duration used when in the process of draining rebalanced actors.  This specifies how long to wait for the current active actor method to finish.  If there is no current actor method call, this is ignored.
`drainRebalancedActors` | A bool.  If true, Dapr will wait for `drainOngoingCallTimeout` to allow a current actor call to complete before trying to deactivate an actor.  If false, do not wait.
`reentrancy` | A configuration object that holds the options for actor reentrancy.
`enabled` | A flag in the reentrancy configuration that is needed to enable reentrancy.
`maxStackDepth` | A value in the reentrancy configuration that controls how many reentrant calls be made to the same actor.
`entitiesConfig` | Array of entity configurations that allow per actor type settings. Any configuration defined here must have an entity that maps back into the root level entities.

```json
{
  "entities":["actorType1", "actorType2"],
  "actorIdleTimeout": "1h",
  "actorScanInterval": "30s",
  "drainOngoingCallTimeout": "30s",
  "drainRebalancedActors": true,
  "reentrancy": {
    "enabled": true,
    "maxStackDepth": 32
  },
  "entitiesConfig": [
      {
          "entities": ["actorType1"],
          "actorIdleTimeout": "1m",
          "drainOngoingCallTimeout": "10s",
          "reentrancy": {
              "enabled": false
          }
      }
  ]
}
```

### Deactivate actor

Deactivates an actor by persisting the instance of the actor to the state store with the specified actorId.

#### HTTP Request

```
DELETE http://localhost:<appPort>/actors/<actorType>/<actorId>
```

#### HTTP Response Codes

Code | Description
---- | -----------
200  | Request successful
400  | Actor not found
500  | Request failed

#### URL Parameters

Parameter | Description
--------- | -----------
`appPort` | The application port.
`actorType` | The actor type.
`actorId` | The actor ID.

> Note, all URL parameters are case-sensitive.

#### Examples

The following example deactivates the actor type `stormtrooper` that has `actorId` of 50.

```shell
curl -X DELETE http://localhost:3000/actors/stormtrooper/50 \
  -H "Content-Type: application/json"
```

### Invoke actor method

Invokes a method for an actor with the specified `methodName` where:

- Parameters to the method are passed in the body of the request message.
- Return values are provided in the body of the response message.  

If the actor is not already running, the app side should [activate](#activating-an-actor) it.

#### HTTP Request

```
PUT http://localhost:<appPort>/actors/<actorType>/<actorId>/method/<methodName>
```

#### HTTP Response Codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
`appPort` | The application port.
`actorType` | The actor type.
`actorId` | The actor ID.
`methodName` | The name of the method to invoke.

> Note, all URL parameters are case-sensitive.

#### Examples

The following example calls the `performAction` method on the actor type `stormtrooper` that has `actorId` of 50.

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/performAction \
  -H "Content-Type: application/json"
```

### Invoke reminder

Invokes a reminder for an actor with the specified reminderName. If the actor is not already running, the app side should [activate](#activating-an-actor) it.

#### HTTP Request

```
PUT http://localhost:<appPort>/actors/<actorType>/<actorId>/method/remind/<reminderName>
```

#### HTTP Response Codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
`appPort` | The application port.
`actorType` | The actor type.
`actorId` | The actor ID.
`reminderName` | The name of the reminder to invoke.

> Note, all URL parameters are case-sensitive.

#### Examples

The following example calls the `checkRebels` reminder method on the actor type `stormtrooper` that has `actorId` of 50.

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/remind/checkRebels \
  -H "Content-Type: application/json"
```

### Invoke timer

Invokes a timer for an actor with the specified `timerName`. If the actor is not already running, the app side should [activate](#activating-an-actor) it.

#### HTTP Request

```
PUT http://localhost:<appPort>/actors/<actorType>/<actorId>/method/timer/<timerName>
```

#### HTTP Response Codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
`appPort` | The application port.
`actorType` | The actor type.
`actorId` | The actor ID.
`timerName` | The name of the timer to invoke.

> Note, all URL parameters are case-sensitive.

#### Examples

The following example calls the `checkRebels` timer method on the actor type `stormtrooper` that has `actorId` of 50.

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/timer/checkRebels \
  -H "Content-Type: application/json"
```

### Health check

Probes the application for a response to signal to Dapr that the app is healthy and running.
Any response status code other than `200` will be considered an unhealthy response.

A response body is not required.

#### HTTP Request

```
GET http://localhost:<appPort>/healthz
```

#### HTTP Response Codes

Code | Description
---- | -----------
200  | App is healthy

#### URL Parameters

Parameter | Description
--------- | -----------
`appPort` | The application port.

#### Examples

Example of getting a health check response from the app:

```shell
curl -X GET http://localhost:3000/healthz \
```

## Activating an Actor

Conceptually, activating an actor means creating the actor's object and adding the actor to a tracking table. [Review an example from the .NET SDK](https://github.com/dapr/dotnet-sdk/blob/6c271262231c41b21f3ca866eb0d55f7ce8b7dbc/src/Dapr.Actors/Runtime/ActorManager.cs#L199).

## Querying actor state externally

To enable visibility into the state of an actor and allow for complex scenarios like state aggregation, Dapr saves actor state in external state stores, such as databases. As such, it is possible to query for an actor state externally by composing the correct key or query.

The state namespace created by Dapr for actors is composed of the following items:

- App ID: Represents the unique ID given to the Dapr application.
- Actor Type: Represents the type of the actor.
- Actor ID: Represents the unique ID of the actor instance for an actor type.
- Key: A key for the specific state value. An actor ID can hold multiple state keys.

The following example shows how to construct a key for the state of an actor instance under the `myapp` App ID namespace:

`myapp||cat||hobbit||food`

In the example above, we are getting the value for the state key `food`, for the actor ID `hobbit` with an actor type of `cat`, under the App ID namespace of `myapp`.
