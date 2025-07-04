---
type: docs
title: "Default resiliency policies"
linkTitle: "Default policies"
weight: 40
description: "Learn more about the default resiliency policies for timeouts, retries, and circuit breakers"
---

In resiliency, you can set default policies, which have a broad scope. This is done through reserved keywords that let Dapr know when to apply the policy. There are 3 default policy types:

- `DefaultRetryPolicy`
- `DefaultTimeoutPolicy`
- `DefaultCircuitBreakerPolicy`

If these policies are defined, they are used for every operation to a service, application, or component. They can also be modified to be more specific through the appending of additional keywords. The specific policies follow the following pattern, `Default%sRetryPolicy`, `Default%sTimeoutPolicy`, and `Default%sCircuitBreakerPolicy`. Where the `%s` is replaced by a target of the policy. 

Below is a table of all possible default policy keywords and how they translate into a policy name.

| Keyword                          | Target Operation                                     | Example Policy Name                                         |
| -------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| `App`                            | Service invocation.                                  | `DefaultAppRetryPolicy`                                     |
| `Actor`                          | Actor invocation.                                    | `DefaultActorTimeoutPolicy`                                 |
| `Component`                      | All component operations.                            | `DefaultComponentCircuitBreakerPolicy`                      |
| `ComponentInbound`               | All inbound component operations.                    | `DefaultComponentInboundRetryPolicy`                        |
| `ComponentOutbound`              | All outbound component operations.                   | `DefaultComponentOutboundTimeoutPolicy`                     |
| `StatestoreComponentOutbound`    | All statestore component operations.                 | `DefaultStatestoreComponentOutboundCircuitBreakerPolicy`    |
| `PubsubComponentOutbound`        | All outbound pubusub (publish) component operations. | `DefaultPubsubComponentOutboundRetryPolicy`                 |
| `PubsubComponentInbound`         | All inbound pubsub (subscribe) component operations. | `DefaultPubsubComponentInboundTimeoutPolicy`                |
| `BindingComponentOutbound`       | All outbound binding (invoke) component operations.  | `DefaultBindingComponentOutboundCircuitBreakerPolicy`       |
| `BindingComponentInbound`        | All inbound binding (read) component operations.     | `DefaultBindingComponentInboundRetryPolicy`                 |
| `SecretstoreComponentOutbound`   | All secretstore component operations.                | `DefaultSecretstoreComponentTimeoutPolicy`                  |
| `ConfigurationComponentOutbound` | All configuration component operations.              | `DefaultConfigurationComponentOutboundCircuitBreakerPolicy` |
| `LockComponentOutbound`          | All lock component operations.                       | `DefaultLockComponentOutboundRetryPolicy`                   |

## Policy hierarchy resolution

Default policies are applied if the operation being executed matches the policy type and if there is no more specific policy targeting it. For each target type (app, actor, and component), the policy with the highest priority is a Named Policy, one that targets that construct specifically.

If none exists, the policies are applied from most specific to most broad.

## How default policies and built-in retries work together

In the case of the [built-in retries]({{< ref override-default-retries.md >}}), default policies do not stop the built-in retry policies from running. Both are used together but only under specific circumstances.
 
For service and actor invocation, the built-in retries deal specifically with issues connecting to the remote sidecar (when needed). As these are important to the stability of the Dapr runtime, they are not disabled **unless** a named policy is specifically referenced for an operation. In some instances, there may be additional retries from both the built-in retry and the default retry policy, but this prevents an overly weak default policy from reducing the sidecar's availability/success rate. 

Policy resolution hierarchy for applications, from most specific to most broad:

1. Named Policies in App Targets
2. Default App Policies / Built-In Service Retries
3. Default Policies / Built-In Service Retries

Policy resolution hierarchy for actors, from most specific to most broad:

1. Named Policies in Actor Targets
2. Default Actor Policies / Built-In Actor Retries
3. Default Policies / Built-In Actor Retries

Policy resolution hierarchy for components, from most specific to most broad:

1. Named Policies in Component Targets
2. Default Component Type + Component Direction Policies / Built-In Actor Reminder Retries (if applicable)
3. Default Component Direction Policies / Built-In Actor Reminder Retries (if applicable)
4. Default Component Policies / Built-In Actor Reminder Retries (if applicable)
5. Default Policies / Built-In Actor Reminder Retries (if applicable)

As an example, take the following solution consisting of three applications, three components and two actor types:

Applications:

- AppA
- AppB
- AppC

Components:

- Redis Pubsub: pubsub
- Redis statestore: statestore
- CosmosDB Statestore: actorstore

Actors:

- EventActor
- SummaryActor

Below is policy that uses both default and named policies as applies these to the targets.

```yaml
spec:
  policies:
    retries:
      # Global Retry Policy
      DefaultRetryPolicy:
        policy: constant
        duration: 1s
        maxRetries: 3
      
      # Global Retry Policy for Apps
      DefaultAppRetryPolicy:
        policy: constant
        duration: 100ms
        maxRetries: 5

      # Global Retry Policy for Apps
      DefaultActorRetryPolicy:
        policy: exponential
        maxInterval: 15s
        maxRetries: 10

      # Global Retry Policy for Inbound Component operations
      DefaultComponentInboundRetryPolicy:
        policy: constant
        duration: 5s
        maxRetries: 5

      # Global Retry Policy for Statestores
      DefaultStatestoreComponentOutboundRetryPolicy:
        policy: exponential
        maxInterval: 60s
        maxRetries: -1

     # Named policy
      fastRetries:
        policy: constant
        duration: 10ms
        maxRetries: 3

     # Named policy
      retryForever:
        policy: exponential
        maxInterval: 10s
        maxRetries: -1

  targets:
    apps:
      appA:
        retry: fastRetries

      appB:
        retry: retryForever
    
    actors:
      EventActor:
        retry: retryForever

    components:
      actorstore:
        retry: fastRetries
```

The table below is a break down of which policies are applied when attempting to call the various targets in this solution.

| Target             | Policy Used                                     |
| ------------------ | ----------------------------------------------- |
| AppA               | fastRetries                                     |
| AppB               | retryForever                                    |
| AppC               | DefaultAppRetryPolicy / DaprBuiltInActorRetries |
| pubsub - Publish   | DefaultRetryPolicy                              |
| pubsub - Subscribe | DefaultComponentInboundRetryPolicy              |
| statestore         | DefaultStatestoreComponentOutboundRetryPolicy   |
| actorstore         | fastRetries                                     |
| EventActor         | retryForever                                    |
| SummaryActor       | DefaultActorRetryPolicy                         |

## Next steps

[Learn how to override default retry policies.]({{< ref override-default-retries.md >}})

## Related links

Try out one of the Resiliency quickstarts:
- [Resiliency: Service-to-service]({{< ref resiliency-serviceinvo-quickstart.md >}})
- [Resiliency: State Management]({{< ref resiliency-state-quickstart.md >}})