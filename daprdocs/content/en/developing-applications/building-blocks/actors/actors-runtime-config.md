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
| `drainOngoingCallTimeout` | The duration when in the process of draining rebalanced actors. This specifies the timeout for the current active actor method to finish. If there is no current actor method call, this is ignored. The effective value is clamped against the placement dissemination budget (see [Drain timeout clamping](#drain-timeout-clamping)). | 2 seconds |
| `drainRebalancedActors` | If true, Dapr will wait for `drainOngoingCallTimeout` duration to allow a current actor call to complete before trying to deactivate an actor. | true |
| `reentrancy` (`ActorReentrancyConfig`) | Configure the reentrancy behavior for an actor. If not provided, reentrancy is disabled. | disabled, false |
| `entitiesConfig` | Configure each actor type individually with an array of configurations. Any entity specified in the individual entity configurations must also be specified in the top level `entities` field. Per-entity `drainOngoingCallTimeout` values are honored and subject to the same clamping rule as the top-level value. | N/A |

## Drain timeout clamping

During a placement dissemination round (for example after a rolling upgrade changes actor host membership), daprd drains in-flight calls for the rebalanced actor types for up to the configured `drainOngoingCallTimeout` before force-cancelling the remaining calls. While draining, daprd delays its acknowledgement of the placement table update, so a long drain timeout can hold up the whole dissemination round.

Two distinct dissemination timeouts bound this drain window:

- The daprd-side dissemination timeout, set with the `--actors-disseminate-timeout` daprd argument or the `dapr.io/actors-disseminate-timeout` annotation (default 30 seconds). If a round exceeds it, daprd resets its own placement stream and halts its hosted actors.
- The Placement service dissemination timeout, set with the Placement `--disseminate-timeout` argument or the `dapr_placement.disseminateTimeout` Helm value (default 8 seconds). Sidecars that have not acknowledged the update within this deadline are considered non-responsive and their stream is reset by Placement.

Starting in Dapr v1.17.7, daprd clamps the effective drain timeout against its own dissemination timeout:

- If the configured `drainOngoingCallTimeout` is less than the daprd-side dissemination timeout, the configured value is used verbatim.
- If it is greater than or equal to the daprd-side dissemination timeout, daprd logs a warning and reduces the effective value to **80%** of that dissemination timeout, with a floor of 2 seconds. With the default 30-second dissemination timeout, the clamp ceiling is 24 seconds. The default 2-second drain timeout is never clamped; the clamp only applies to explicitly configured values.

The clamp is applied at both registration sites: the global `drainOngoingCallTimeout` and any per-actor-type `drainOngoingCallTimeout` set under `entitiesConfig`. The configuration values your app reports to daprd via the actor config endpoint are unchanged; only the effective in-process value used during drain is clamped.

Note that the clamp only protects daprd from resetting its own stream. A drain timeout that passes the clamp can still exceed the Placement service's dissemination timeout (8 seconds by default), in which case Placement kicks the sidecar from the round and resets its stream, producing noisy reconnects and reschedules. Keep `drainOngoingCallTimeout` comfortably below the Placement `disseminateTimeout` (for example, 5 seconds or lower with the default settings), or raise `dapr_placement.disseminateTimeout` to accommodate a longer drain.

Most Dapr SDKs leave `drainOngoingCallTimeout` unset unless your application configures it, so the 2-second daprd default applies. The .NET Actors.Next SDK is an exception: it sets a 30-second default, which sits exactly at the clamp boundary; configure a lower value explicitly.

## Examples

{{< tabpane text=true >}}

{{% tab ".NET" %}}
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
        options.DrainOngoingCallTimeout = TimeSpan.FromSeconds(5);
        options.DrainRebalancedActors = true;
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
[See the .NET SDK documentation on registering actors]({{% ref "dotnet-actors-usage#registring-actors" %}}).

{{% /tab %}}

{{% tab "JavaScript" %}}

<!--javascript-->

```js
import { CommunicationProtocolEnum, DaprClient, DaprServer } from "@dapr/dapr";

// Configure the actor runtime with the DaprClientOptions.
const clientOptions = {
  actor: {
    actorIdleTimeout: "1h",
    actorScanInterval: "30s",
    drainOngoingCallTimeout: "5s",
    drainRebalancedActors: true,
    reentrancy: {
      enabled: true,
      maxStackDepth: 32,
    },
  },
};

// Use the options when creating DaprServer and DaprClient.

// Note, DaprServer creates a DaprClient internally, which needs to be configured with clientOptions.
const server = new DaprServer(serverHost, serverPort, daprHost, daprPort, clientOptions);

const client = new DaprClient(daprHost, daprPort, CommunicationProtocolEnum.HTTP, clientOptions);
```

[See the documentation on writing actors with the JavaScript SDK]({{% ref "js-actors#registering-actors" %}}).

{{% /tab %}}

{{% tab "Python" %}}

<!--python-->

```python
from datetime import timedelta
from dapr.actor.runtime.config import ActorRuntimeConfig, ActorReentrancyConfig

ActorRuntime.set_actor_config(
    ActorRuntimeConfig(
        actor_idle_timeout=timedelta(hours=1),
        actor_scan_interval=timedelta(seconds=30),
        drain_ongoing_call_timeout=timedelta(seconds=5),
        drain_rebalanced_actors=True,
        reentrancy=ActorReentrancyConfig(enabled=False),
    )
)
```

[See the documentation on running actors with the Python SDK]({{% ref "python-actor" %}})

{{% /tab %}}

{{% tab "Java" %}}

<!--java-->

```java
// import io.dapr.actors.runtime.ActorRuntime;
// import java.time.Duration;

ActorRuntime.getInstance().getConfig().setActorIdleTimeout(Duration.ofMinutes(60));
ActorRuntime.getInstance().getConfig().setActorScanInterval(Duration.ofSeconds(30));
ActorRuntime.getInstance().getConfig().setDrainOngoingCallTimeout(Duration.ofSeconds(5));
ActorRuntime.getInstance().getConfig().setDrainBalancedActors(true);
ActorRuntime.getInstance().getConfig().setActorReentrancyConfig(false, null);
```

[See the documentation on writing actors with the Java SDK]({{% ref "java#actors" %}}).

{{% /tab %}}

{{% tab "Go" %}}
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

{{% /tab %}}

{{< /tabpane >}}

## Related links

- Refer to the [Dapr SDK documentation and examples]({{% ref "developing-applications/sdks/_index.md#sdk-languages" %}}).
- [Actors API reference]({{% ref actors_api %}})
- [Actors overview]({{% ref actors-overview %}})
