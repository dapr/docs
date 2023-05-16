---
type: docs
title: "How to: Enable partitioning of actor reminders"
linkTitle: "How to: Partition reminders"
weight: 50
description: "Enable actor reminders partitioning for your application"
aliases:
  - "/developing-applications/building-blocks/actors/actors-background"
---

[Actor reminders]({{< ref "howto-actors-partitioning.md#actor-reminders" >}}) are persisted and continue to be triggered after sidecar restarts. Applications with multiple reminders registered can experience the following issues:

- Low throughput on reminders registration and de-registration
- Limited number of reminders registered based on the single record size limit on the state store

To sidestep these issues, applications can enable partitioning of actor reminders while data is distributed in multiple keys in the state store.

1. A metadata record in `actors\|\|<actor type>\|\|metadata` is used to store the persisted configuration for a given actor type. 
1. Multiple records store subsets of the reminders for the same actor type.

| Key         | Value       |
| ----------- | ----------- |
| `actors\|\|<actor type>\|\|metadata` | `{ "id": <actor metadata identifier>, "actorRemindersMetadata": { "partitionCount": <number of partitions for reminders> } }` |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|1` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-n> ]` |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|2` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-m> ]` |

If you need to change the number of partitions, Dapr's sidecar will automatically redistribute the reminders' set.

## Configure the actor runtime to partition actor reminders

Similar to other actor configuration elements, the actor runtime provides the appropriate configuration to partition actor reminders via the actor's endpoint for `GET /dapr/config`. Select your preferred language for an actor runtime configuration example.

{{< tabs ".NET" JavaScript Python Java Go >}}

{{% codetab %}}

<!--dotnet-->

```csharp
// In Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    // Register actor runtime with DI
    services.AddActors(options =>
    {
        // Register actor types and configure actor settings
        options.Actors.RegisterActor<MyActor>();

        // Configure default settings
        options.ActorIdleTimeout = TimeSpan.FromMinutes(60);
        options.ActorScanInterval = TimeSpan.FromSeconds(30);
        options.RemindersStoragePartitions = 7;
    });

    // Register additional services for use with actors
    services.AddSingleton<BankService>();
}
```

[See the .NET SDK documentation on registring actors]({{< ref "dotnet-actors-usage.md#registring-actors" >}}).

{{% /codetab %}}

{{% codetab %}}
<!--javascript-->

```js
import { CommunicationProtocolEnum, DaprClient, DaprServer } from "@dapr/dapr";

// Configure the actor runtime with the DaprClientOptions.
const clientOptions = {
  actor: {
    remindersStoragePartitions: 0,
  },
};

const actor = builder.build(new ActorId("my-actor"));

// Register a reminder, it has a default callback: `receiveReminder`
await actor.registerActorReminder(
  "reminder-id", // Unique name of the reminder.
  Temporal.Duration.from({ seconds: 2 }), // DueTime
  Temporal.Duration.from({ seconds: 1 }), // Period
  Temporal.Duration.from({ seconds: 1 }), // TTL
  100, // State to be sent to reminder callback.
);

// Delete the reminder
await actor.unregisterActorReminder("reminder-id");
```

[See the documentation on writing actors with the JavaScript SDK]({{< ref "js-actors.md#registering-actors" >}}).

{{% /codetab %}}

{{% codetab %}}

<!--python-->

```python
from datetime import timedelta

ActorRuntime.set_actor_config(
    ActorRuntimeConfig(
        actor_idle_timeout=timedelta(hours=1),
        actor_scan_interval=timedelta(seconds=30),
        remindersStoragePartitions=7
    )
)
```

[See the documentation on running actors with the Python SDK]({{< ref "python-actor.md" >}})

{{% /codetab %}}

{{% codetab %}}
<!--java-->

```java
// import io.dapr.actors.runtime.ActorRuntime;
// import java.time.Duration;

ActorRuntime.getInstance().getConfig().setActorIdleTimeout(Duration.ofMinutes(60));
ActorRuntime.getInstance().getConfig().setActorScanInterval(Duration.ofSeconds(30));
ActorRuntime.getInstance().getConfig().setRemindersStoragePartitions(7);
```

[See the documentation on writing actors with the Java SDK]({{< ref "java.md#actors" >}}).

{{% /codetab %}}

{{% codetab %}}
<!--go-->

```go
type daprConfig struct {
	Entities                   []string `json:"entities,omitempty"`
	ActorIdleTimeout           string   `json:"actorIdleTimeout,omitempty"`
	ActorScanInterval          string   `json:"actorScanInterval,omitempty"`
	DrainOngoingCallTimeout    string   `json:"drainOngoingCallTimeout,omitempty"`
	DrainRebalancedActors      bool     `json:"drainRebalancedActors,omitempty"`
	RemindersStoragePartitions int      `json:"remindersStoragePartitions,omitempty"`
}

var daprConfigResponse = daprConfig{
	[]string{defaultActorType},
	actorIdleTimeout,
	actorScanInterval,
	drainOngoingCallTimeout,
	drainRebalancedActors,
	7,
}

func configHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(daprConfigResponse)
}
```

[See an example for using actors with the Go SDK](https://github.com/dapr/go-sdk/tree/main/examples/actor).

{{% /codetab %}}

{{< /tabs >}}

The following is an example of a valid configuration for reminder partitioning:

```json
{
	"entities": [ "MyActorType", "AnotherActorType" ],
	"remindersStoragePartitions": 7
}
```

## Handle configuration changes

To configure actor reminders partitioning, Dapr persists the actor type metadata in the actor's state store. This allows the configuration changes to be applied globally, not just in a single sidecar instance. 

In addition, **you can only increase the number of partitions**, not decrease. This allows Dapr to automatically redistribute the data on a rolling restart, where one or more partition configurations might be active.

## Demo

Watch [this video for a demo of actor reminder partitioning](https://youtu.be/ZwFOEUYe1WA?t=1493):

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/ZwFOEUYe1WA?start=1495" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Next steps

{{< button text="Interact with virtual actors >>" page="howto-actors.md" >}}

## Related links

- [Actors API reference]({{< ref actors_api.md >}})
- [Actors overview]({{< ref actors-overview.md >}})