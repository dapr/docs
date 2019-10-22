# Dapr Actors Runtime 

Dapr Actors runtime provides following capabilities:

## Actor State Management
 Actors can save state reliably using state management capability.

 You can interact with Dapr through Http/gRPC endpoints for state management.

 ### Save the Actor State

You can save the Actor state of a given key of actorId of type actorType by calling

```
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/state/<key>
```

Value of the key is passed as request body.

```
{
  "key": "value"
}
```

If you want to save multiple items in a single transaction, you can call 

```
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/state
```

### Retrieve the Actor State

Once you have saved the actor state, you can retrieve the saved state by calling 

```
GET http://localhost:3500/v1.0/actors/<actorType>/<actorId>/state/<key>
```

### Remove the Actor State

You can remove state permanently from the saved Actor state by calling

```
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/state/<key>
```

Refer [dapr spec](../../reference/api/actors.md) for more details.

## Actor Timers and Reminders
Actors can schedule periodic work on themselves by registering either timers or reminders.

### Actor timers

You can register a callback on actor to be executed based on timer.

Dapr Actor runtime ensures that the callback methods respect the turn-based concurrency guarantees.This means that no other actor methods or timer/reminder callbacks will be in progress until this callback completes execution.

The next period of the timer starts after the callback completes execution. This implies that the timer is stopped while the callback is executing and is started when the callback finishes.

The Dapr Actors runtime saves changes made to the actor's state when the callback finishes. If an error occurs in saving the state, that actor object will be deactivated and a new instance will be activated.

All timers are stopped when the actor is deactivated as part of garbage collection. No timer callbacks are invoked after that. Also, the Dapr Actors runtime does not retain any information about the timers that were running before deactivation. It is up to the actor to register any timers that it needs when it is reactivated in the future.

You can create a timer for an actor by calling the Http/gRPC request to Dapr.

```
POST,PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

You can provide the timer due time and callback in the request body.

You can remove the actor timer by calling

```
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

Refer [dapr spec](../../reference/api/actors.md) for more details.

### Actor reminders

Reminders are a mechanism to trigger persistent callbacks on an actor at specified times. Their functionality is similar to timers. But unlike timers, reminders are triggered under all circumstances until the actor explicitly unregisters them or the actor is explicitly deleted. Specifically, reminders are triggered across actor deactivations and failovers because the Dapr Actors runtime persists information about the actor's reminders using Dapr actor state provider. 

You can create a persistent reminder for an actor by calling the Http/gRPC request to Dapr.

```
POST,PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

You can provide the reminder due time and period in the request body.

#### Retrieve Actor Reminder

You can retrieve the actor reminder by calling

```
GET http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### Remove the Actor Reminder

You can remove the actor reminder by calling

```
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

Refer [dapr spec](../../reference/api/actors.md) for more details.








