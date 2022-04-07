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
The actor runtime validates correctess of the scheduling configuration and returns error on invalid input.

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

## Actor runtime configuration

You can configure the Dapr actor runtime configuration to modify the default runtime behavior.

### Configuration parameters
- `entities` - The actor types supported by this host.
- `actorIdleTimeout` - The timeout before deactivating an idle actor. Checks for timeouts occur every `actorScanInterval` interval. **Default: 60 minutes**
- `actorScanInterval` - The duration which specifies how often to scan for actors to deactivate idle actors. Actors that have been idle longer than actor_idle_timeout will be deactivated. **Default: 30 seconds**
- `drainOngoingCallTimeout` - The duration when in the process of draining rebalanced actors. This specifies the timeout for the current active actor method to finish. If there is no current actor method call, this is ignored. **Default: 60 seconds**
- `drainRebalancedActors` - If true, Dapr will wait for `drainOngoingCallTimeout` duration to allow a current actor call to complete before trying to deactivate an actor. **Default: true**
- `reentrancy` (ActorReentrancyConfig) - Configure the reentrancy behavior for an actor. If not provided, reentrancy is diabled. **Default: disabled**
**Default: 0**
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
        // reentrancy not implemented in the .NET SDK at this time
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
            // This actor type must have a matching value in the base level 'entities' field. If it does not, the configuration will be ignored.
            // If there is a matching entity, the values here will be used to overwrite any values specified in the root configuration.
            // In the case of this actor, it will have reentrancy enabled and 'defaultActorType' will not have reentrancy enabled.
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

{{% alert title="Preview feature" color="warning" %}}
Actor reminders partitioning is currently in [preview]({{< ref preview-features.md >}}). Use this feature if you are runnining into issues due to a high number of reminders registered.
{{% /alert %}}

Actor reminders are persisted and continue to be triggered after sidecar restarts. Prior to Dapr runtime version 1.3, reminders were persisted on a single record in the actor state store:

| Key      | Value |
| ----------- | ----------- |
| `actors\|\|<actor type>` | `[ <reminder 1>, <reminder 2>, ... , <reminder n> ]` |

Applications that register many reminders can experience the following issues:

* Low throughput on reminders registration and deregistration
* Limit on total number of reminders registered based on the single record size limit on the state store

Since version 1.3, applications can now enable partitioning of actor reminders in the state store. As data is distributed in multiple keys in the state store. First, there is a metadata record in `actors\|\|<actor type>\|\|metadata` that is used to store persisted configuration for a given actor type. Then, there are multiple records that stores subsets of the reminders for the same actor type.

| Key      | Value |
| ----------- | ----------- |
| `actors\|\|<actor type>\|\|metadata` | `{ "id": <actor metadata identifier>, "actorRemindersMetadata": { "partitionCount": <number of partitions for reminders> } }` |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|1` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-n> ]` |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|2` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-m> ]` |
| ... | ... |

If the number of partitions is not enough, it can be changed and Dapr's sidecar will automatically redistribute the reminders's set.

### Enabling actor reminders partitioning
Actor reminders partitioning is currently in preview, so enabling it is a two step process.

#### Preview feature configuration
Before using reminders partitioning, actor type metadata must be enabled in Dapr. For more information on preview configurations, see [the full guide on opting into preview features in Dapr]({{< ref preview-features.md >}}). Below is an example of the configuration:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myconfig
spec:
  features:
    - name: Actor.TypeMetadata
      enabled: true
```

#### Actor runtime configuration
Once actor type metadata is enabled as an opt-in preview feature, the actor runtime must also provide the appropriate configuration to partition actor reminders. This is done by the actor's endpoint for `GET /dapr/config`, similar to other actor configuration elements.

{{< tabs Java Dotnet Python Go >}}

{{% codetab %}}
```java
// import io.dapr.actors.runtime.ActorRuntime;
// import java.time.Duration;

ActorRuntime.getInstance().getConfig().setActorIdleTimeout(Duration.ofMinutes(60));
ActorRuntime.getInstance().getConfig().setActorScanInterval(Duration.ofSeconds(30));
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
        options.RemindersStoragePartitions = 7;
        // reentrancy not implemented in the .NET SDK at this time
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

The following, is an example of a valid configuration for reminder partitioning:

```json
{
	"entities": [ "MyActorType", "AnotherActorType" ],
	"remindersStoragePartitions": 7
}
```

#### Handling configuration changes
For production scenarios, there are some points to be considered before enabling this feature:

* Enabling actor type metadata can only be reverted if the number of partitions remains zero, otherwise the reminders' set will be reverted to an previous state.
* Number of partitions can only be increased and not decreased. This allows Dapr to automatically redistribute the data on a rolling restart where one or more partition configurations might be active.

#### Demo
* [Actor reminder partitioning community call video](https://youtu.be/ZwFOEUYe1WA?t=1493)