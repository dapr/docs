---
type: docs
title: "Actors timers and reminders"
linkTitle: "Timers and reminders"
weight: 50
description: "Setting timers and reminders and performing error handling for your actors"
aliases:
  - "/developing-applications/building-blocks/actors/actors-background"
---

Actors can schedule periodic work on themselves by registering either timers or reminders.

The functionality of timers and reminders is very similar. The main difference is that Dapr actor runtime is not retaining any information about timers after deactivation, while persisting the information about reminders using Dapr [Scheduler]({{% ref scheduler.md %}}).

This distinction allows users to trade off between light-weight but stateless timers vs. more resource-demanding but stateful reminders.

The scheduling configuration of timers and reminders is summarized below:

---
`data` is an optional parameter that contains the data passed to the reminder callback method when invoked

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
- time.Duration format (Sub-second precision is supported when using duration values), e.g. `2h30m`, `500ms`
- [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) format, e.g. `PT2H30M`, `R5/PT1M30S`

---
`ttl` is an optional parameter that sets time at which or time interval after which the timer/reminder will be expired and deleted. If `ttl` is omitted, no restrictions are applied.

Supported formats:
* RFC3339 date format, e.g. `2020-10-02T15:00:00Z`
* time.Duration format, e.g. `2h30m`
* [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) format. Example: `PT2H30M`

---
Only available on **reminders**.

`overwrite` is an optional boolean parameter that indicates whether to overwrite an existing reminder with the same name.
If `overwrite` is set to `true`, any existing reminder with the same name will be replaced by the new configuration.
If `overwrite` is set to `false` or omitted, and a reminder with the same name already exists, the operation will fail with a already exists error.
Note that overwriting an existing reminder will reset its an error.state, including the number of invocations and the next trigger time, just like creating a new reminder.

---
Only available on **reminders**.

`failurePolicy` is an optional parameter that defines the behavior when a reminder invocation fails.
The supported failure policies are:
- `drop`: The failed invocation is dropped, and the reminder continues with the next scheduled invocation, as if the failure did not occur.
- `constant`: The reminder will retry the failed invocation a specified number of times with a fixed interval between each attempt.
  * `interval`: The time interval between each retry attempt. If not specified, the interval becomes "0s", meaning retries is attempted immediately.
  * `maxRetries`: The maximum number of retry attempts. If not specified, the invocation will be retried indefinitely at the specified interval until it succeeds.

If no failure policy is specified, the default failure policy of 3 retries with an interval of 1 second will be applied.

---

The actor runtime validates correctness of the scheduling configuration and returns error on invalid input.

When you specify both the number of repetitions in `period` as well as `ttl`, the timer/reminder will be stopped when either condition is met, whichever occurs first.

## Actor timers

You can register a callback on the actor to be executed based on a timer.

The Dapr actor runtime ensures that the callback methods respect the turn-based concurrency guarantees. This means that no other actor methods or timer/reminder callbacks will be in progress until this callback completes execution.

The Dapr actor runtime saves changes made to the actor's state when the callback finishes. If an error occurs in saving the state, that actor object is deactivated and a new instance will be activated.

All timers are stopped when the actor is deactivated as part of garbage collection. No timer callbacks are invoked after that. Also, the Dapr actor runtime does not retain any information about the timers that were running before deactivation. It is up to the actor to register any timers that it needs when it is reactivated in the future.

You can create a timer for an actor by calling the HTTP/gRPC request to Dapr as shown below, or via Dapr SDK.

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

### Examples

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

Refer [api spec]({{% ref "actors_api#invoke-timer" %}}) for more details.

## Actor reminders

Reminders are a mechanism to trigger *persistent* callbacks on an actor at specified times. Their functionality is similar to timers. But unlike timers, reminders are triggered under all circumstances until the actor explicitly unregisters them or the number in invocations is exhausted. Specifically, reminders are triggered across actor deactivations and failovers because the Dapr actor runtime persists the information about the actors' reminders using the Dapr [Scheduler service]({{% ref scheduler.md %}}).

You can create a persistent reminder for an actor by calling the HTTP/gRPC request to Dapr as shown below, or via Dapr SDK.

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

Unlike timers, reminders support an `overwrite` option that allows you to replace an existing reminder with the same name, as well as a `failurePolicy` option that defines the behavior when a reminder invocation fails.

### Retrieve actor reminder

You can retrieve the actor reminder by calling

```md
GET http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

### Remove the actor reminder

You can remove the actor reminder by calling

```md
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

If an actor reminder is triggered and the app does not return a 2** code to the runtime (for example, because of a connection issue), actor reminders will be retried according to its failure policy, which by default is three times with a backoff interval of one second between each attempt.
There may be additional retries attempted in accordance with any optionally applied [actor resiliency policy]({{% ref "override-default-retries" %}}).

Refer [api spec]({{% ref "actors_api#invoke-reminder" %}}) for more details.

## Error handling

When an actor's method completes successfully, the runtime continues to invoke the method at the specified timer or reminder schedule.
To allow actors to recover from failures and retry after a crash or restart, you can persist an actor's state by configuring a state store, like Redis or Azure Cosmos DB.

If an invocation of the method fails, the timer is not removed. Timers are only removed when:
- The sidecar terminates
- The executions run out
- You delete it explicitly

## Managing reminders with the CLI

Actor reminders are persisted in the Scheduler.
You can manage them with the dapr scheduler CLI commands.

#### List actor reminders

```bash
dapr scheduler list --filter actor
NAME                                  BEGIN     COUNT  LAST TRIGGER
actor/MyActorType/actorid1/test1      -3.89s    1      2025-10-03T16:58:55Z
actor/MyActorType/actorid2/test2      -3.89s    1      2025-10-03T16:58:55Z
```

Get reminder details

```bash
dapr scheduler get actor/MyActorType/actorid1/test1 -o yaml
```

#### Delete reminders

Delete a single reminder:

```bash
dapr scheduler delete actor/MyActorType/actorid1/test1
```

Delete all reminders for a given actor type:

```bash
dapr scheduler delete-all actor/MyActorType
```

## Managing reminders with the CLI

Actor reminders are persisted in the Scheduler.
You can manage them with the dapr scheduler CLI commands.

#### List actor reminders

```bash
dapr scheduler list --filter actor
NAME                                  BEGIN     COUNT  LAST TRIGGER
actor/MyActorType/actorid1/test1      -3.89s    1      2025-10-03T16:58:55Z
actor/MyActorType/actorid2/test2      -3.89s    1      2025-10-03T16:58:55Z
```

Get reminder details

```bash
dapr scheduler get actor/MyActorType/actorid1/test1 -o yaml
```

#### Delete reminders

Delete a single reminder:

```bash
dapr scheduler delete actor/MyActorType/actorid1/test1
```

Delete all reminders for a given actor type:

```bash
dapr scheduler delete-all actor/MyActorType
```

Delete all reminders for a specific actor instance:

```bash
dapr scheduler delete-all actor/MyActorType/actorid1
```

Delete all reminders for a specific actor type:

```bash
dapr scheduler delete-all actor/MyActorType
```

Delete all reminders

```bash
dapr scheduler delete-all actor
```


#### Backup and restore reminders

Export all reminders:

```bash
dapr scheduler export -o reminders-backup.bin
```

Restore from a backup file:

```bash
dapr scheduler import -f reminders-backup.bin
```

#### Summary

- Reminders are stored in the Dapr Scheduler, not in the app.
- Create reminders via the Actors API
- Manage existing reminders (list, get, delete, backup/restore) using the `dapr scheduler` CLI.

## Next steps

{{< button text="Configure actor runtime behavior >>" page="actors-runtime-config.md" >}}

## Related links

- [Actors API reference]({{% ref actors_api %}})
- [Actors overview]({{% ref actors-overview %}})
