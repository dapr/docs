---
type: docs
title: "Override default retry resiliency policies"
linkTitle: "Override default retries"
weight: 20
description: "Learn how to override the default retry resiliency policies for specific APIs"
---

Dapr provides [default retries]({{< ref default-policies.md >}}) for any unsuccessful request, such as failures and transient errors. Within a resiliency spec, you have the option to override Dapr's default retry logic by defining policies with reserved, named keywords. For example, defining a policy with the name `DaprBuiltInServiceRetries`, overrides the default retries for failures between sidecars via service-to-service requests. Policy overrides are not applied to specific targets.

> Note: Although you can override default values with more robust retries, you cannot override with lesser values than the provided default value, or completely remove default retries. This prevents unexpected downtime.

Below is a table that describes Dapr's default retries and the policy keywords to override them: 

| Capability | Override Keyword | Default Retry Behavior | Description |
| ------------------ | ------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Service Invocation | DaprBuiltInServiceRetries | Per call retries are performed with a backoff interval of 1 second, up to a threshold of 3 times. | Sidecar-to-sidecar requests (a service invocation method call) that fail and result in a gRPC code `Unavailable` or `Unauthenticated` |
| Actors | DaprBuiltInActorRetries | Per call retries are performed with a backoff interval of 1 second, up to a threshold of 3 times. | Sidecar-to-sidecar requests (an actor method call) that fail and result in a gRPC code `Unavailable` or `Unauthenticated` |
| Actor Reminders | DaprBuiltInActorReminderRetries | Per call retries are performed with an exponential backoff with an initial interval of 500ms, up to a maximum of 60s for a duration of 15mins | Requests that fail to persist an actor reminder to a state store |
| Initialization Retries | DaprBuiltInInitializationRetries | Per call retries are performed 3 times with an exponential backoff, an initial interval of 500ms and for a duration of 10s | Failures when making a request to an application to retrieve a given spec. For example, failure to retrieve a subscription, component or resiliency specification |


The resiliency spec example below shows overriding the default retries for _all_ service invocation requests by using the reserved, named keyword 'DaprBuiltInServiceRetries'. 

Also defined is a retry policy called 'retryForever' that is only applied to the appB target. appB uses the 'retryForever' retry policy, while all other application service invocation retry failures use the overridden 'DaprBuiltInServiceRetries' default policy.

```yaml
spec:
  policies:
    retries:
      DaprBuiltInServiceRetries: # Overrides default retry behavior for service-to-service calls
        policy: constant
        duration: 5s
        maxRetries: 10

      retryForever: # A user defined retry policy replaces default retries. Targets rely solely on the applied policy. 
        policy: exponential
        maxInterval: 15s
        maxRetries: -1 # Retry indefinitely

  targets:
    apps:
      appB: # app-id of the target service
        retry: retryForever
```

## Related links

Try out one of the Resiliency quickstarts:
- [Resiliency: Service-to-service]({{< ref resiliency-serviceinvo-quickstart.md >}})
- [Resiliency: State Management]({{< ref resiliency-state-quickstart.md >}})
