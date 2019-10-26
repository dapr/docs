# Actors

Dapr has a native, cross platform and cross-language virtual actor capabilities.
Besides the language specific Dapr SDKs, a developer can invoke an actor using the API endpoints below.

## Specifications for user service code calling to Dapr

### Invoke a method on an Actor

This endpoint lets you invoke a method on a remote Actor.

#### HTTP Request

`POST/GET/PUT/DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/method/<method>`

#### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
actorType | the actor type
actorId | the actor id
method | the name of the method to invoke on the remote actor

> Example of invoking a method on a remote actor:

```shell
curl -X POST http://localhost:3500/v1.0/actors/stormtrooper/50/method/shoot \
	-H "Content-Type: application/json"
```

> Example of invoking a method on a remote actor with a payload:

```shell
curl -X POST http://localhost:3500/v1.0/actors/x-wing/33/method/fly \
	-H "Content-Type: application/json"
  -d '{
        "destination": "Hoth"
      }'
```

> The response from the remote endpoint will be returned in the request body.

### Save actor state

This endpoint lets you save state for a given actor for a given key.

#### HTTP Request

`POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/state/<key>`

#### HTTP Response codes

Code | Description
---- | -----------
201  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
actorType | the actor type
actorId | the actor id
key | key for the state value

```shell
curl -X POST http://localhost:3500/v1.0/actors/stormtrooper/50/state/location \
	-H "Content-Type: application/json"
  -d '{
        "location": "Alderaan"
      }'
```

### Save actor state - transaction

This endpoint lets you save an actor's state as a multi item transaction.

***Note that this operation is dependant on a state store that supports multi item transactions.***

#### HTTP Request

`POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/state`

#### HTTP Response codes

Code | Description
---- | -----------
201  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
actorType | the actor type
actorId | the actor id

```shell
curl -X POST http://localhost:3500/v1.0/actors/stormtrooper/50/state \
	-H "Content-Type: application/json"
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

This endpoint lets you get the state of a given actor for a given key.

#### HTTP Request

`GET http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/state/<key>`

#### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
actorType | the actor type
actorId | the actor id
key | key for the state value

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/state/location \
	-H "Content-Type: application/json"
```

> The above command returns the state:

```json
{
  "location": "Alderaan"
}
```

### Delete actor state

This endpoint lets you delete the state of a given actor for a given key.

#### HTTP Request

`DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/state/<key>`

#### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
actorType | the actor type
actorId | the actor id
key | key for the state value

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/state/location \
	-X "Content-Type: application/json"
```

### Set actor reminder

This endpoint lets you create a persistent reminder for an actor.

#### HTTP Request

`POST,PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/reminders/<name>`

#### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
actorType | the actor type
actorId | the actor id
name | the name of the reminder

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
	-H "Content-Type: application/json"
-d '{
        "data": "someData",
	"dueTime": "1m",
	"period": "20s"
    }'
```

### Get actor reminder

This endpoint lets get a reminder for an actor

#### HTTP Request

`GET http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/reminders/<name>`

#### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
actorType | the actor type
actorId | the actor id
name | the name of the reminder to get

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
	 "Content-Type: application/json"
```

> The above command returns the reminder:

```json
{
  "dueTime": "1s",
  "period": "5s",
  "data": "0",
}
```

### Delete actor reminder

This endpoint lets delete a reminder for an actor

#### HTTP Request

`DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/reminders/<name>`

#### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
actorType | the actor type
actorId | the actor id
name | the name of the reminder to delete

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
	-X "Content-Type: application/json"
```

### Set actor timer

This endpoint lets you create a timer for an actor.

#### HTTP Request

`POST,PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/timers/<name>`

#### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
actorType | the actor type
actorId | the actor id
name | the name of the timer

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/timers/checkRebels \
	-H "Content-Type: application/json"
-d '{
        "data": "someData",
	"dueTime": "1m",
	"period": "20s",
	"callback": "myEventHandler"
    }'
```

### Delete actor timer

This endpoint lets delete a timer for an actor

#### HTTP Request

`DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/timers/<name>`

#### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
actorType | the actor type
actorId | the actor id
name | the name of the timer to delete

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/timers/checkRebels \
	-X "Content-Type: application/json"
```

## Specifications for Dapr calling to user service code

### Get Registered Actors

This endpoint lets you get the registered actors in Dapr.

#### HTTP Request

`GET http://localhost:<appPort>/dapr/config`

#### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed

#### URL Parameters

Parameter | Description
--------- | -----------
appPort | the application port

> Example of getting the registered actors:

```shell
curl -X GET http://localhost:3000/dapr/config \
	-H "Content-Type: application/json"
```

> The above command returns the config (all fields are optional):

```json
{
  "entities":["actorType1", "actorType2"],
  "actorIdleTimeout": "1h",
  "actorScanInterval": "30s",
  "drainOngoingCallTimeout": "30s",
  "drainRebalancedActors": true
}
```

### Activate the Actors

This endpoint lets you activate the actor.

#### HTTP Request

`POST http://localhost:<appPort>/actors/<actorType>/<actorId>`

#### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
appPort | the application port
actorType | the actor type
actorId | the actor id

> Example of activating the actor:

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50 \
	-H "Content-Type: application/json"
```

### Deactivate the Actors

This endpoint lets you deactivate the actor.

#### HTTP Request

`DELETE http://localhost:<appPort>/actors/<actorType>/<actorId>`

#### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
appPort | the application port
actorType | the actor type
actorId | the actor id

> Example of deactivating the actor:

```shell
curl -X DELETE http://localhost:3000/actors/stormtrooper/50 \
	-H "Content-Type: application/json"
```

### Invoke the Reminders

This endpoint lets you invokes the actor reminders.

#### HTTP Request

`PUT http://localhost:<appPort>/actors/<actorType>/<actorId>/method/remind/<reminderName>`

#### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
appPort | the application port
actorType | the actor type
actorId | the actor id
reminderName | the name of the reminder

> Example of invoking the actor reminder:

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/remind/checkRebels \
	-H "Content-Type: application/json"
```

### Invoke the Timers

This endpoint lets you invokes the actor timers.

#### HTTP Request

`PUT http://localhost:<appPort>/actors/<actorType>/<actorId>/method/timer/<timerName>`

#### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed
404  | Actor not found

#### URL Parameters

Parameter | Description
--------- | -----------
appPort | the application port
actorType | the actor type
actorId | the actor id
timerName | the name of the timer

> Example of invoking the actor timer:

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/timer/checkRebels \
	-H "Content-Type: application/json"
```

## Querying actor state externally

In order to promote visibility into the state of an actor and allow for complex scenarios such as state aggregation, Dapr saves actor state in external databases.

As such, it is possible to query for an actor state externally by composing the correct key or query.
The state namespace created by Dapr for actors is composed of the following items:

* Dapr ID - represents the unique ID given to the Dapr application.
* Actor Type - represents the type of the actor
* Actor ID - represents the unique ID of the actor instance for an actor type
* Key - A key for the specific state value. An actor ID can hold multiple state keys.

The following example shows how to construct a key for the state of an actor instance under the `myapp` Dapr ID namespace:
``
myapp-cat-hobbit-food
``

In the example above, we are getting the value for the state key `food`, for the actor ID `hobbit` with an actor type of `cat`, under the Dapr ID namespace of `myapp`.
