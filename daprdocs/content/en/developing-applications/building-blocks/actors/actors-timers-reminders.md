---
type: docs
title: "Actors timers and reminders"
linkTitle: "Timers and reminders"
weight: 30
description: "Setting timers and reminders and performing error handling for your actors"
aliases:
  - "/developing-applications/building-blocks/actors/actors-background"
---

## Actor timers and reminders

Actors can schedule periodic work on themselves by registering either timers or reminders.

The functionality of timers and reminders is very similar. The main difference is that Dapr actor runtime is not retaining any information about timers after deactivation, while persisting the information about reminders using Dapr actor state provider.

This distinction allows users to trade off between light-weight but stateless timers vs. more resource-demanding but stateful reminders.

The scheduling configuration of timers and reminders is identical, as summarized below:

---
`dueTime` is an optional parameter that sets time at which or time interval before the callback is invoked for the first time. If `dueTime` is omitted, the callback is invoked immediately after timer/reminder registration.

Supported formats:
- RFC3339 date format, e.g. `2020-10-02T15:00:00Z`
- time.Duration format, e.g. `2h30m`
- [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) format, e.g. `PT2H30M`

---
`period` is an optional parameter that sets time interval between two consecutive callback invocations. When specified in `ISO 8601-1 duration` format, you can also configure the number of repetition in order to limit the total number of callback invocations.
If `period` is omitted, the callback will be invoked only once.

Supported formats:
- time.Duration format, e.g. `2h30m`
- [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) format, e.g. `PT2H30M`, `R5/PT1M30S`

---
`ttl` is an optional parameter that sets time at which or time interval after which the timer/reminder will be expired and deleted. If `ttl` is omitted, no restrictions are applied.

Supported formats:
* RFC3339 date format, e.g. `2020-10-02T15:00:00Z`
* time.Duration format, e.g. `2h30m`
* [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) format. Example: `PT2H30M`

---
The actor runtime validates correctness of the scheduling configuration and returns error on invalid input.

When you specify both the number of repetitions in `period` as well as `ttl`, the timer/reminder will be stopped when either condition is met.

### Actor timers

You can register a callback on actor to be executed based on a timer.

The Dapr actor runtime ensures that the callback methods respect the turn-based concurrency guarantees. This means that no other actor methods or timer/reminder callbacks will be in progress until this callback completes execution.

The Dapr actor runtime saves changes made to the actor's state when the callback finishes. If an error occurs in saving the state, that actor object is deactivated and a new instance will be activated.

All timers are stopped when the actor is deactivated as part of garbage collection. No timer callbacks are invoked after that. Also, the Dapr actor runtime does not retain any information about the timers that were running before deactivation. It is up to the actor to register any timers that it needs when it is reactivated in the future.

You can create a timer for an actor by calling the HTTP/gRPC request to Dapr as shown below, or via Dapr SDK.

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

**Examples**

The timer parameters are specified in the request body.

The following request body configures a timer with a `dueTime` of 9 seconds and a `period` of 3 seconds. This means it will first fire after 9 seconds, then every 3 seconds after that.
```json
{
  "dueTime":"0h0m9s0ms",
  "period":"0h0m3s0ms"
}
```

The following request body configures a timer with a `period` of 3 seconds (in ISO 8601 duration format). It also limits the number of invocations to 10. This means it will fire 10 times: first, immediately after registration, then every 3 seconds after that.
```json
{
  "period":"R10/PT3S",
}
```

The following request body configures a timer with a `period` of 3 seconds (in ISO 8601 duration format) and a `ttl` of 20 seconds. This means it fires immediately after registration, then every 3 seconds after that for the duration of 20 seconds.
```json
{
  "period":"PT3S",
  "ttl":"20s"
}
```

The following request body configures a timer with a `dueTime` of 10 seconds, a `period` of 3 seconds, and a `ttl` of 10 seconds. It also limits the number of invocations to 4. This means it will first fire after 10 seconds, then every 3 seconds after that for the duration of 10 seconds, but no more than 4 times in total.
```json
{
  "dueTime":"10s",
  "period":"R4/PT3S",
  "ttl":"10s"
}
```

You can remove the actor timer by calling

```md
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

Refer [api spec]({{< ref "actors_api.md#invoke-timer" >}}) for more details.

### Actor reminders

Reminders are a mechanism to trigger *persistent* callbacks on an actor at specified times. Their functionality is similar to timers. But unlike timers, reminders are triggered under all circumstances until the actor explicitly unregisters them or the actor is explicitly deleted or the number in invocations is exhausted. Specifically, reminders are triggered across actor deactivations and failovers because the Dapr actor runtime persists the information about the actors' reminders using Dapr actor state provider.

You can create a persistent reminder for an actor by calling the HTTP/gRPC request to Dapr as shown below, or via Dapr SDK.

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

The request structure for reminders is identical to those of actors. Please refer to the [actor timers examples]({{< ref "#actor-timers" >}}).

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

## Error handling

When an actor's method completes successfully, the runtime will contineu to invoke the method at the specified timer or reminder schedule. However, if the method throws an exception, the runtime catches it and logs the error message, without retrying. 
todo: where is logged? 

To allow actors to recover from failures and retry after a crash or restart, you can persist an actor's state by configuring a state store, like Redis or Azure Cosmos DB. 
todo: how is the actor state updated? or is it not?
todo: does the timer get removed if not configured by a state store? example of configuring?

## Next steps

{{< button text="Use virtual actors >>" page="howto-actors.md" >}}

## Related links

- [Actors API reference]({{< ref actors_api.md >}})
- [Actors overview]({{< ref actors-overview.md >}})
- Actors using the:
  - [.NET SDK]({{< ref dotnet-actors.md >}})
  - [Python SDK]({{< ref python-actor.md >}})
  - [Java SDK]({{< ref js-actors.md >}})
