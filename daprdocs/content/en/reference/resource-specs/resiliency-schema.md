---
type: docs
title: "Resiliency spec"
linkTitle: "Resiliency spec"
weight: 3000
description: "The basic spec for a Dapr resiliency resource"
---

The `Resiliency` Dapr resource allows you to define and apply fault tolerance resiliency polcies. Resiliency specs are applied with the Dapr sidecar starts. 

```yml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: <REPLACE-WITH-RESOURCE-NAME>
scopes:
  - <REPLACE-WITH-SCOPED-APPIDS>
spec:
  policies: # Required
    timeouts: # Replce with any unique name
      timeoutName: <REPLACE-WITH-TIME-VALUE>
    retries:
      retryName: # Replace with any unique name
        policy: exponential
        maxInterval: <REPLACE-WITH-VALUE>
        maxRetries: <REPLACE-WITH-VALUE>
    circuitBreakers:
      circuitBreakerName: # Replace with any unique name
        maxRequests: <REPLACE-WITH-VALUE>
        timeout: <REPLACE-WITH-VALUE> 
        trip: <REPLACE-WITH-CONSECUTIVE-FAILURE-VALUE>
targets: # Required
    apps:
      appID: # Replace with scoped app ID
        timeout: <REPLACE-WITH-TIMEOUT-NAME>
        retry: <REPLACE-WITH-RETRY-NAME>
        circuitBreaker: <REPLACE-WITH-CIRCUIT-BREAKER-NAME>
    actors:
      myActorType: 
        timeout: <REPLACE-WITH-TIMEOUT-NAME>
        retry: <REPLACE-WITH-RETRY-NAME>
        circuitBreaker: <REPLACE-WITH-CIRCUIT-BREAKER-NAME>
        circuitBreakerCacheSize: <REPLACE-WITH-VALUE>
    components:
      componentName: # Replace with your component name
        outbound:
          timeout: <REPLACE-WITH-TIMEOUT-NAME>
          retry: <REPLACE-WITH-RETRY-NAME>
          circuitBreaker: <REPLACE-WITH-CIRCUIT-BREAKER-NAME>
```

## Spec fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| policies | Y | The configuration of resiliency policies, including: <br><ul><li>`timeouts`</li><li>`retries`</li><li>`circuitBreakers`</li></ul> | timeout: `general`<br>retry: `retryForever`<br>circuit breaker: `simpleCB` |
| targets | Y | The configuration for the applications, actors, or components that use the resiliency policies. |  |

## Related links
[Learn more about resiliency policies and targets]({{< ref resiliency >}})