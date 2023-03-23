---
type: docs
title: "How-to: Use virtual actors in Dapr"
linkTitle: "How-To: Virtual actors"
weight: 20
description: Learn more about the actor pattern
---

The Dapr actor runtime provides support for [virtual actors]({{< ref actors-overview.md >}}) through following capabilities:

## Actor method invocation

You can interact with Dapr to invoke the actor method by calling HTTP/gRPC endpoint.

```html
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/method/<method>
```

You can provide any data for the actor method in the request body and the response for the request is in response body which is data from actor method call.

Refer [api spec]({{< ref "actors_api.md#invoke-actor-method" >}}) for more details.

Alternatively, you can use the Dapr SDK in [.NET]({{< ref "dotnet-actors" >}}), [Java]({{< ref "java#actors" >}}), or [Python]({{< ref "python-actor" >}}).

## Actor state management

Actors can save state reliably using state management capability.
You can interact with Dapr through HTTP/gRPC endpoints for state management.

To use actors, your state store must support multi-item transactions.  This means your state store [component](https://github.com/dapr/components-contrib/tree/master/state) must implement the [TransactionalStore](https://github.com/dapr/components-contrib/blob/master/state/transactional_store.go) interface.  The list of components that support transactions/actors can be found here: [supported state stores]({{< ref supported-state-stores.md >}}). Only a single state store component can be used as the statestore for all actors.

## Actor timers and reminders

Actors can schedule periodic work on themselves by registering either timers or reminders. Set timers or reminders for your actors using the [Actors Timers and Reminders]({{< ref actors-timers-reminders.md >}}) guide.

## Actor runtime configuration

You can configure the Dapr actor runtime configuration to modify the default runtime behavior.

### Configuration parameters
- `entities` - The actor types supported by this host.
- `actorIdleTimeout` - The timeout before deactivating an idle actor. Checks for timeouts occur every `actorScanInterval` interval. **Default: 60 minutes**
- `actorScanInterval` - The duration which specifies how often to scan for actors to deactivate idle actors. Actors that have been idle longer than actor_idle_timeout will be deactivated. **Default: 30 seconds**
- `drainOngoingCallTimeout` - The duration when in the process of draining rebalanced actors. This specifies the timeout for the current active actor method to finish. If there is no current actor method call, this is ignored. **Default: 60 seconds**
- `drainRebalancedActors` - If true, Dapr will wait for `drainOngoingCallTimeout` duration to allow a current actor call to complete before trying to deactivate an actor. **Default: true**
- `reentrancy` (ActorReentrancyConfig) - Configure the reentrancy behavior for an actor. If not provided, reentrancy is disabled. **Default: disabled**
**Default: false**
- `remindersStoragePartitions` - Configure the number of partitions for actor's reminders. If not provided, all reminders are saved as a single record in actor's state store. **Default: 0**
- `entitiesConfig` - Configure each actor type individually with an array of configurations. Any entity specified in the individual entity configurations must also be specified in the top level `entities` field. **Default: None**

{{< tabs Java Dotnet Python Go >}}

{{% codetab %}}
```java
// import io.dapr.actors.runtime.ActorRuntime;
// import java.time.Duration;

ActorRuntime.getInstance().getConfig().setActorIdleTimeout(Duration.ofMinutes(60));
ActorRuntime.getInstance().getConfig().setActorScanInterval(Duration.ofSeconds(30));
ActorRuntime.getInstance().getConfig().setDrainOngoingCallTimeout(Duration.ofSeconds(60));
ActorRuntime.getInstance().getConfig().setDrainBalancedActors(true);
ActorRuntime.getInstance().getConfig().setActorReentrancyConfig(false, null);
ActorRuntime.getInstance().getConfig().setRemindersStoragePartitions(7);
```

See [this example](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/actors/DemoActorService.java)
{{% /codetab %}}

{{% codetab %}}
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
        options.DrainOngoingCallTimeout = TimeSpan.FromSeconds(60);
        options.DrainRebalancedActors = true;
        options.RemindersStoragePartitions = 7;
        options.ReentrancyConfig = new() { Enabled = false };

        // Add a configuration for a specific actor type.
        // This actor type must have a matching value in the base level 'entities' field. If it does not, the configuration will be ignored.
        // If there is a matching entity, the values here will be used to overwrite any values specified in the root configuration.
        // In this example, `ReentrantActor` has reentrancy enabled; however, 'MyActor' will not have reentrancy enabled.
        options.Actors.RegisterActor<ReentrantActor>(typeOptions: new()
        {
            ReentrancyConfig = new()
            {
                Enabled = true,
            }
        });
    });

    // Register additional services for use with actors
    services.AddSingleton<BankService>();
}
```
See the .NET SDK [documentation](https://github.com/dapr/dotnet-sdk/blob/master/daprdocs/content/en/dotnet-sdk-docs/dotnet-actors/dotnet-actors-usage.md#registering-actors).
{{% /codetab %}}

{{% codetab %}}
```python
from datetime import timedelta
from dapr.actor.runtime.config import ActorRuntimeConfig, ActorReentrancyConfig

ActorRuntime.set_actor_config(
    ActorRuntimeConfig(
        actor_idle_timeout=timedelta(hours=1),
        actor_scan_interval=timedelta(seconds=30),
        drain_ongoing_call_timeout=timedelta(minutes=1),
        drain_rebalanced_actors=True,
        reentrancy=ActorReentrancyConfig(enabled=False),
        remindersStoragePartitions=7
    )
)
```
{{% /codetab %}}

{{% codetab %}}
```go
const (
    defaultActorType = "basicType"
    reentrantActorType = "reentrantType"
)

type daprConfig struct {
	Entities                []string                `json:"entities,omitempty"`
	ActorIdleTimeout        string                  `json:"actorIdleTimeout,omitempty"`
	ActorScanInterval       string                  `json:"actorScanInterval,omitempty"`
	DrainOngoingCallTimeout string                  `json:"drainOngoingCallTimeout,omitempty"`
	DrainRebalancedActors   bool                    `json:"drainRebalancedActors,omitempty"`
	Reentrancy              config.ReentrancyConfig `json:"reentrancy,omitempty"`
	EntitiesConfig          []config.EntityConfig   `json:"entitiesConfig,omitempty"`
}

var daprConfigResponse = daprConfig{
	Entities:                []string{defaultActorType, reentrantActorType},
	ActorIdleTimeout:        actorIdleTimeout,
	ActorScanInterval:       actorScanInterval,
	DrainOngoingCallTimeout: drainOngoingCallTimeout,
	DrainRebalancedActors:   drainRebalancedActors,
	Reentrancy:              config.ReentrancyConfig{Enabled: false},
	EntitiesConfig: []config.EntityConfig{
		{
            // Add a configuration for a specific actor type.
            // This actor type must have a matching value in the base level 'entities' field. If it does not, the configuration will be ignored.
            // If there is a matching entity, the values here will be used to overwrite any values specified in the root configuration.
            // In this example, `reentrantActorType` has reentrancy enabled; however, 'defaultActorType' will not have reentrancy enabled.
			Entities: []string{reentrantActorType},
			Reentrancy: config.ReentrancyConfig{
				Enabled:       true,
				MaxStackDepth: &maxStackDepth,
			},
		},
	},
}

func configHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(daprConfigResponse)
}
```
{{% /codetab %}}

{{< /tabs >}}

Refer to the documentation and examples of the [Dapr SDKs]({{< ref "developing-applications/sdks/#sdk-languages" >}}) for more details.

## Partitioning reminders

Actor reminders are persisted and continue to be triggered after sidecar restarts. Applications with multiple reminders registered can experience the following issues:

- Low throughput on reminders registration and de-registration
- Limit on the total number of reminders registered based on the single record size limit on the state store

Applications can enable partitioning of actor reminders while data is distributed in multiple keys in the state store.

1. A metadata record in `actors\|\|<actor type>\|\|metadata` is used to store persisted configuration for a given actor type. 
1. Multiple records store subsets of the reminders for the same actor type.

| Key      | Value |
| ----------- | ----------- |
| `actors\|\|<actor type>\|\|metadata` | `{ "id": <actor metadata identifier>, "actorRemindersMetadata": { "partitionCount": <number of partitions for reminders> } }` |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|1` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-n> ]` |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|2` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-m> ]` |
| ... | ... |

If you need to change the number of partitions, Dapr's sidecar will automatically redistribute the reminders's set.

### Enabling actor reminders partitioning

#### Actor runtime configuration for actor reminders partitioning

Similar to other actor configuration elements, the actor runtime provides the appropriate configuration to partition actor reminders via the actor's endpoint for `GET /dapr/config`.

{{< tabs Java Dotnet Python Go >}}

{{% codetab %}}

```java
// import io.dapr.actors.runtime.ActorRuntime;
// import java.time.Duration;

ActorRuntime.getInstance().getConfig().setActorIdleTimeout(Duration.ofMinutes(60));
ActorRuntime.getInstance().getConfig().setActorScanInterval(Duration.ofSeconds(30));
ActorRuntime.getInstance().getConfig().setRemindersStoragePartitions(7);
```

For more information, see [the Java actors example](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/actors/DemoActorService.java)
{{% /codetab %}}

{{% codetab %}}

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

See the .NET SDK [documentation for registering actors](https://github.com/dapr/dotnet-sdk/blob/master/daprdocs/content/en/dotnet-sdk-docs/dotnet-actors/dotnet-actors-usage.md#registering-actors).
{{% /codetab %}}

{{% codetab %}}

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

{{% /codetab %}}

{{% codetab %}}

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

{{% /codetab %}}

{{< /tabs >}}

The following is an example of a valid configuration for reminder partitioning:

```json
{
	"entities": [ "MyActorType", "AnotherActorType" ],
	"remindersStoragePartitions": 7
}
```

#### Handling configuration changes

To configure actor reminders partitioning, Dapr persists the actor type metadata in the actor's state store. This allows the configuration changes to be applied globally, not just in a single sidecar instance. 

Also, **you can only increase the number of partitions**, not decrease. This allows Dapr to automatically redistribute the data on a rolling restart where one or more partition configurations might be active.

#### Demo

Watch [this video for a demo of actor reminder partitioning](https://youtu.be/ZwFOEUYe1WA?t=1493):

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/ZwFOEUYe1WA?start=1495" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
