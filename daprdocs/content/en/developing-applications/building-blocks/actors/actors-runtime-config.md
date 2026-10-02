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
| `drainOngoingCallTimeout` | The timeout duration when in the process of draining rebalanced actors. This specifies the timeout for the current active actor method call to finish. If there is no current actor method call, this is ignored. The effective value is clamped against the placement dissemination budget (see [Drain timeout clamping](#drain-timeout-clamping)). | 2 seconds |
| `drainRebalancedActors` | If true, Dapr will wait for `drainOngoingCallTimeout` duration to allow a current actor call to complete before trying to deactivate an actor. | true |
| `reentrancy` (`ActorReentrancyConfig`) | Configure the reentrancy behavior for an actor. If not provided, reentrancy is disabled. | disabled, false |
| `entitiesConfig` | Configure each actor type individually with an array of configurations. Any entity specified in the individual entity configurations must also be specified in the top level `entities` field. Per-entity `drainOngoingCallTimeout` values are honored and subject to the same clamping rule as the top-level value. | N/A |

## Drain timeout clamping

During a placement dissemination round where actors get rebalanced to a new host (for example a rolling upgrade), the Dapr sidecar (daprd) drains all in-flight requests for the rebalanced actor types for up to the configured `drainOngoingCallTimeout` before force-cancelling the remaining actor requests. While draining, daprd delays its acknowledgement of the placement table update, so a long drain timeout can hold up the whole dissemination round.

This drain window is bound by two distinct dissemination timeouts:

- The daprd dissemination timeout, set with the `--actors-disseminate-timeout` argument (`dapr.io/actors-disseminate-timeout` annotation) which is by default 30 seconds. If a round exceeds it, daprd resets its own placement gRPC stream and halts its hosted actors.
- The placement service dissemination timeout, set with the placement `--disseminate-timeout` argument (`dapr_placement.disseminateTimeout` Helm value) which is by default 8 seconds. Dapr sidecars that have not acknowledged the update within this deadline are considered non-responsive and their gRPC stream is reset by Placement.

{{% alert title="Note" color="primary" %}}
With default settings the placement service's 8 second deadline always binds first, since it is far lower than daprd's 30 seconds. The daprd-side timeout acts as a failsafe: it lets daprd detect that a dissemination round has wedged (for example when the placement service becomes unresponsive mid-round) and recover on its own by resetting the stream and halting its hosted actors.
{{% /alert %}}

Starting in Dapr v1.17.7, the Dapr sidecar clamps the *effective* drain timeout against its own dissemination timeout:

- If `drainOngoingCallTimeout` is less than `actors-disseminate-timeout`, the configured value is used verbatim.
- If `drainOngoingCallTimeout` is greater than or equal to `actors-disseminate-timeout`, daprd logs a warning and reduces the effective value to **80%** of that dissemination timeout, with a floor of 2 seconds. With the default 30-second dissemination timeout, the clamp ceiling is 24 seconds. The default 2-second drain timeout is never clamped, it only applies to explicitly configured values.

The clamp is applied at both registration sites: the global `drainOngoingCallTimeout` and any per-actor-type `drainOngoingCallTimeout` set under `entitiesConfig` via the SDK. The configuration values your app reports to daprd via the actor config endpoint are unchanged and only the effective value used during drain is clamped.

The clamping only protects daprd from resetting its own placement stream. A drain timeout that doesn't get clamped can still exceed the placement service's dissemination timeout (8 seconds by default), in which case placement kicks the sidecar from the round and resets its gRPC stream, producing noisy reconnects and reschedules. It is recommended to keep `drainOngoingCallTimeout` comfortably below the Placement `disseminateTimeout` (for example, 5 seconds or lower), or raise `dapr_placement.disseminateTimeout` to accommodate a longer drain period.

Most Dapr SDKs leave `drainOngoingCallTimeout` unset unless your application configures it, so the 2-second default applies. The .NET Actors.Next SDK is an exception: it sets a 30-second default, which sits exactly at the clamp boundary; configure a lower value explicitly.

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
