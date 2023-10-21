---
type: docs
title: "Actor runtime configuration parameters"
linkTitle: "Runtime configuration"
weight: 30
description: Modify the default Dapr actor runtime configuration behavior
---

You can modify the default Dapr actor runtime behavior using the following configuration parameters. 

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `entities` | The actor types supported by this host. | N/A |
| `actorIdleTimeout` | The timeout before deactivating an idle actor. Checks for timeouts occur every `actorScanInterval` interval. | 60 minutes |
| `actorScanInterval` | The duration which specifies how often to scan for actors to deactivate idle actors. Actors that have been idle longer than actor_idle_timeout will be deactivated. | 30 seconds |
| `drainOngoingCallTimeout` | The duration when in the process of draining rebalanced actors. This specifies the timeout for the current active actor method to finish. If there is no current actor method call, this is ignored. | 60 seconds |
| `drainRebalancedActors` | If true, Dapr will wait for `drainOngoingCallTimeout` duration to allow a current actor call to complete before trying to deactivate an actor. | true |
| `reentrancy` (`ActorReentrancyConfig`) | Configure the reentrancy behavior for an actor. If not provided, reentrancy is disabled. | disabled, false |
| `remindersStoragePartitions` | Configure the number of partitions for actor's reminders. If not provided, all reminders are saved as a single record in actor's state store. | 0 |
| `entitiesConfig` | Configure each actor type individually with an array of configurations. Any entity specified in the individual entity configurations must also be specified in the top level `entities` field. | N/A |

## Examples

{{< tabs ".NET" JavaScript Python Java Go >}}

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
[See the .NET SDK documentation on registering actors]({{< ref "dotnet-actors-usage.md#registring-actors" >}}).

{{% /codetab %}}

{{% codetab %}}

<!--javascript-->

```js
import { CommunicationProtocolEnum, DaprClient, DaprServer } from "@dapr/dapr";

// Configure the actor runtime with the DaprClientOptions.
const clientOptions = {
  actor: {
    actorIdleTimeout: "1h",
    actorScanInterval: "30s",
    drainOngoingCallTimeout: "1m",
    drainRebalancedActors: true,
    reentrancy: {
      enabled: true,
      maxStackDepth: 32,
    },
    remindersStoragePartitions: 0,
  },
};

// Use the options when creating DaprServer and DaprClient.

// Note, DaprServer creates a DaprClient internally, which needs to be configured with clientOptions.
const server = new DaprServer(serverHost, serverPort, daprHost, daprPort, clientOptions);

const client = new DaprClient(daprHost, daprPort, CommunicationProtocolEnum.HTTP, clientOptions);
```

[See the documentation on writing actors with the JavaScript SDK]({{< ref "js-actors.md#registering-actors" >}}).

{{% /codetab %}}

{{% codetab %}}

<!--python-->

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

[See the documentation on running actors with the Python SDK]({{< ref "python-actor.md" >}})

{{% /codetab %}}

{{% codetab %}}

<!--java-->

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

[See the documentation on writing actors with the Java SDK]({{< ref "java.md#actors" >}}).

{{% /codetab %}}

{{% codetab %}}
<!--go-->

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

[See an example for using actors with the Go SDK](https://github.com/dapr/go-sdk/tree/main/examples/actor).

{{% /codetab %}}

{{< /tabs >}}

## Next steps

{{< button text="Enable actor reminder partitioning >>" page="howto-actors-partitioning.md" >}}

## Related links

- Refer to the [Dapr SDK documentation and examples]({{< ref "developing-applications/sdks/#sdk-languages" >}}).
- [Actors API reference]({{< ref actors_api.md >}})
- [Actors overview]({{< ref actors-overview.md >}})