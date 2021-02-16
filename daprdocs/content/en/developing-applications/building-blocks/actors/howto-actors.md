---
type: docs
title: "How-to: Use virtual actors in Dapr"
linkTitle: "How-To: Virtual actors"
weight: 20
description: Learn more about the actor pattern
---

The Dapr actors runtime provides support for [virtual actors]({{< ref actors-overview.md >}}) through following capabilities:

## Actor method invocation

You can interact with Dapr to invoke the actor method by calling HTTP/gRPC endpoint

```html
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/method/<method>
```

You can provide any data for the actor method in the request body and the response for the request is in response body which is data from actor method call.

Refer [api spec]({{< ref "actors_api.md#invoke-actor-method" >}}) for more details.

## Actor state management

Actors can save state reliably using state management capability.

You can interact with Dapr through HTTP/gRPC endpoints for state management.

To use actors, your state store must support multi-item transactions.  This means your state store [component](https://github.com/dapr/components-contrib/tree/master/state) must implement the [TransactionalStore](https://github.com/dapr/components-contrib/blob/master/state/transactional_store.go) interface.  The list of components that support transactions/actors can be found here: [supported state stores]({{< ref supported-state-stores.md >}}).

## Actor timers and reminders

Actors can schedule periodic work on themselves by registering either timers or reminders.

### Actor timers

You can register a callback on actor to be executed based on a timer.

The Dapr actor runtime ensures that the callback methods respect the turn-based concurrency guarantees.This means that no other actor methods or timer/reminder callbacks will be in progress until this callback completes execution.

The next period of the timer starts after the callback completes execution. This implies that the timer is stopped while the callback is executing and is started when the callback finishes.

The Dapr actors runtime saves changes made to the actor's state when the callback finishes. If an error occurs in saving the state, that actor object is deactivated and a new instance will be activated.

All timers are stopped when the actor is deactivated as part of garbage collection. No timer callbacks are invoked after that. Also, the Dapr actors runtime does not retain any information about the timers that were running before deactivation. It is up to the actor to register any timers that it needs when it is reactivated in the future.

You can create a timer for an actor by calling the HTTP/gRPC request to Dapr.

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

The timer `duetime` and callback are specified in the request body.  The due time represents when the timer will first fire after registration.  The `period` represents how often the timer fires after that.  A due time of 0 means to fire immediately.  Negative due times and negative periods are invalid.

The following request body configures a timer with a `dueTime` of 9 seconds and a `period` of 3 seconds.  This means it will first fire after 9 seconds, then every 3 seconds after that.
```json
{
  "dueTime":"0h0m9s0ms",
  "period":"0h0m3s0ms"
}
```

The following request body configures a timer with a `dueTime` 0 seconds and a `period` of 3 seconds.  This means it fires immediately after registration, then every 3 seconds after that.
```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m3s0ms"
}
```

You can remove the actor timer by calling

```md
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

Refer [api spec]({{< ref "actors_api.md#invoke-timer" >}}) for more details.

### Actor reminders

Reminders are a mechanism to trigger *persistent* callbacks on an actor at specified times. Their functionality is similar to timers. But unlike timers, reminders are triggered under all circumstances until the actor explicitly unregisters them or the actor is explicitly deleted. Specifically, reminders are triggered across actor deactivations and failovers because the Dapr actors runtime persists the information about the actors' reminders using Dapr actor state provider.

You can create a persistent reminder for an actor by calling the Http/gRPC request to Dapr.

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

The reminder `duetime` and callback can be specified in the request body.  The due time represents when the reminder first fires after registration.  The `period` represents how often the reminder will fire after that.  A due time of 0 means to fire immediately.  Negative due times and negative periods are invalid.  To register a reminder that fires only once, set the period to an empty string.

The following request body configures a reminder with a `dueTime` 9 seconds and a `period` of 3 seconds.  This means it will first fire after 9 seconds, then every 3 seconds after that.
```json
{
  "dueTime":"0h0m9s0ms",
  "period":"0h0m3s0ms"
}
```

The following request body configures a reminder with a `dueTime` 0 seconds and a `period` of 3 seconds.  This means it will fire immediately after registration, then every 3 seconds after that.
```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m3s0ms"
}
```

The following request body configures a reminder with a `dueTime` 15 seconds and a `period` of empty string.  This means it will first fire after 15 seconds, then never fire again.
```json
{
  "dueTime":"0h0m15s0ms",
  "period":""
}
```

#### Retrieve actor reminder

You can retrieve the actor reminder by calling

```md
GET http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### Remove the actor reminder

You can remove the actor reminder by calling

```md
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

Refer [api spec]({{< ref "actors_api.md#invoke-reminder" >}}) for more details.
