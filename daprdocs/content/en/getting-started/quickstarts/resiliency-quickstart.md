---
type: docs
title: "Quickstart: Resiliency"
linkTitle: "Resiliency"
weight: 72
description: "Get started with Dapr's resiliency capabilities"
---
<img src="/images/resiliency-quickstart.png" width="1000" alt="Diagram showing the resiliency applied to Dapr APIs">

{{% alert title="Note" color="primary" %}}
 Resiliency is currently a preview feature.
{{% /alert %}}

In this Quickstart, you will observe Dapr resiliency capabilities by introducing toxic behavior to a microservice that continuously perists and retrieves state via Dapr's state management API. 

The resiliency policies used in this example are defined and applied via the [resiliency spec]() located in the components directory.

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest Node.js installed](https://nodejs.org/download/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/resiliency).

```bash
git clone https://github.com/dapr/quickstarts.git
```

In a terminal window, navigate to the `order-processor` directory.

```bash
cd quickstart/resiliency/javascript/order-processor
```

Install dependencies

```bash
npm install
```

### Step 2: Run the application with resiliency enabled

Run the `order-processor` service alongside a Dapr sidecar. The `--config` parameter applies a Dapr configuration that enables the resiliency feature.

The resilency spec is located in the components directory and is automatically discovered by the Dapr sidecar when run in standalone mode.

```bash
dapr run --app-id order-processor --config ../config.yaml --components-path ../components/ -- npm start
```

Once the application has started, the `order-processor`service writes and reads `orderId` key/value pairs to the `statestore` redis instance [defined in the `statestore.yaml` component]({{< ref "#statestoreyaml-component-file" >}}).

```bash
== APP == Saving Order:  { orderId: '1' }
== APP == Getting Order:  { orderId: '1' }
== APP == Saving Order:  { orderId: '2' }
== APP == Getting Order:  { orderId: '2' }
== APP == Saving Order:  { orderId: '3' }
== APP == Getting Order:  { orderId: '3' }
== APP == Saving Order:  { orderId: '4' }
== APP == Getting Order:  { orderId: '4' }
```
While the application is running continue to the next section. 

### Step 3: Introduce a fault

For example purposes, you will simulate a fault by stopping the Redis container that was initalized when executing `dapr init` on your development machine.

The Redis instance is configured as the state store component for the order-processor microservice. Once the redis instance is stopped, write and read operations from the order-processor service will begin to fail.

Since the `statestore` component is definied as a target in the resiliency spec applied to the order-processor service, all failed requests will apply retry and circuit breaker policies:

```yaml
  targets:
    components:
      statestore:
        outbound:
          retry: retryForever
          circuitBreaker: simpleCB
```

```bash
docker stop dapr_redis
```

Once the first request fails, the retry policy titled `retryForever` is applied:

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

Retries will continue for each failed request indefinitely, while waiting 5 seconds in between trying again. Once 5 consecutive retries have failed, the circuit breaker policy `simpleCB` is tripped and the breaker opens haulting all requests:

```bash
INFO[0026] Circuit breaker "simpleCB-statestore" changed state from closed to open
```

```yaml
circuitBreakers:
  simpleCB:
  maxRequests: 1
  timeout: 5s 
  trip: consecutiveFailures >= 5
```

After 5 seconds has surpassed, the circuit breaker will switch to a half-open state allowing one request through to verify if the fault has been resolved. If the request continues to fail, the circuit will trip back to the open state. This behavior will continue for as long as the Redis container is stopped. 

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

### Step 3: Remove the fault
Restart the redis container on your machine and the application will recover seamlessly, picking up where it left off with writing and reading orders to the Redis state store component.

```bash
docker start dapr_redis
```

```bash
INFO[0036] Recovered processing operation component[statestore] output.  
== APP == Saving Order:  { orderId: '5' }
== APP == Getting Order:  { orderId: '5' }
== APP == Saving Order:  { orderId: '6' }
== APP == Getting Order:  { orderId: '6' }
== APP == Saving Order:  { orderId: '7' }
== APP == Getting Order:  { orderId: '7' }
== APP == Saving Order:  { orderId: '8' }
== APP == Getting Order:  { orderId: '8' }
== APP == Saving Order:  { orderId: '9' }
== APP == Getting Order:  { orderId: '9' }
```

## Tell us what you think!
We're continuously working to improve our Quickstart examples and value your feedback. Did you find this quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps
Visit [this](https://docs.dapr.io/operations/resiliency/resiliency-overview//) link for more information about Dapr resiliency.

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
