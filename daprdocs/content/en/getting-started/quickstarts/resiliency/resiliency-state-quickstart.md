---
type: docs
title: "Quickstart: Service-to-component resiliency"
linkTitle: "Resiliency: Service-to-component"
weight: 110
description: "Get started with Dapr's resiliency capabilities via the state management API"
---

Observe Dapr resiliency capabilities by simulating a system failure. In this Quickstart, you will:

- Execute a microservice application that continuously persists and retrieves state via Dapr's state management API. 
- Trigger resiliency policies by simulating a system failure. 
- Resolve the failure and the microservice application will resume. 

<img src="/images/resiliency-quickstart-svc-component.png" width="1000" alt="Diagram showing the resiliency applied to Dapr APIs">

Select your preferred language-specific Dapr SDK before proceeding with the Quickstart.

{{< tabs "Python" "JavaScript" ".NET" "Java" "Go" >}}
 <!-- Python -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.7+ installed](https://www.python.org/downloads/).
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
cd ../state_management/python/sdk/order-processor
```

Install dependencies

```bash
pip3 install -r requirements.txt 
```

### Step 2: Run the application

Run the `order-processor` service alongside a Dapr sidecar. The Dapr sidecar then loads the resiliency spec located in the resources directory:


   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Resiliency
   metadata:
     name: myresiliency
   scopes:
     - order-processor

   spec:
     policies:
       retries:
         retryForever:
           policy: constant
           duration: 5s
           maxRetries: -1

       circuitBreakers:
         simpleCB:
           maxRequests: 1
           timeout: 5s
           trip: consecutiveFailures >= 5

     targets:
       components:
         statestore:
           outbound:
             retry: retryForever
             circuitBreaker: simpleCB
   ```


```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- python3
```

Once the application has started, the `order-processor`service writes and reads `orderId` key/value pairs to the `statestore` Redis instance [defined in the `statestore.yaml` component]({{< ref "statemanagement-quickstart.md#statestoreyaml-component-file" >}}).

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

### Step 3: Introduce a fault

Simulate a fault by stopping the Redis container instance that was initialized when executing `dapr init` on your development machine. Once the instance is stopped, write and read operations from the `order-processor` service begin to fail.

Since the `resiliency.yaml` spec defines `statestore` as a component target, all failed requests will apply retry and circuit breaker policies:

```yaml
  targets:
    components:
      statestore:
        outbound:
          retry: retryForever
          circuitBreaker: simpleCB
```

In a new terminal window, run the following command to stop Redis:

```bash
docker stop dapr_redis
```

Once Redis is stopped, the requests begin to fail and the retry policy titled `retryForever` is applied. The output below shows the logs from the `order-processor` service:

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

As per the `retryForever` policy, retries will continue for each failed request indefinitely, in 5 second intervals. 

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

Once 5 consecutive retries have failed, the circuit breaker policy, `simpleCB`, is tripped and the breaker opens, halting all requests:

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

After 5 seconds has surpassed, the circuit breaker will switch to a half-open state, allowing one request through to verify if the fault has been resolved. If the request continues to fail, the circuit will trip back to the open state. 

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

This half-open/open behavior will continue for as long as the Redis container is stopped. 

### Step 3: Remove the fault

Once you restart the Redis container on your machine, the application will recover seamlessly, picking up where it left off.

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

{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}

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
cd ../state_management/javascript/sdk/order-processor
```

Install dependencies

```bash
npm install
```

### Step 2: Run the application 

Run the `order-processor` service alongside a Dapr sidecar. The Dapr sidecar then loads the resiliency spec located in the resources directory:


   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Resiliency
   metadata:
     name: myresiliency
   scopes:
     - checkout
   
   spec:
     policies:
       retries:
         retryForever:
           policy: constant
           maxInterval: 5s
           maxRetries: -1 
   
       circuitBreakers:
         simpleCB:
           maxRequests: 1
           timeout: 5s 
           trip: consecutiveFailures >= 5
   
     targets:
       apps:
         order-processor:
           retry: retryForever
           circuitBreaker: simpleCB
   ```

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- npm start
```

Once the application has started, the `order-processor`service writes and reads `orderId` key/value pairs to the `statestore` Redis instance [defined in the `statestore.yaml` component]({{< ref "statemanagement-quickstart.md#statestoreyaml-component-file" >}}).

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

### Step 3: Introduce a fault

Simulate a fault by stopping the Redis container instance that was initialized when executing `dapr init` on your development machine. Once the instance is stopped, write and read operations from the `order-processor` service begin to fail.

Since the `resiliency.yaml` spec defines `statestore` as a component target, all failed requests will apply retry and circuit breaker policies:

```yaml
  targets:
    components:
      statestore:
        outbound:
          retry: retryForever
          circuitBreaker: simpleCB
```

In a new terminal window, run the following command to stop Redis:

```bash
docker stop dapr_redis
```

Once Redis is stopped, the requests begin to fail and the retry policy titled `retryForever` is applied. The output below shows the logs from the `order-processor` service:

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

As per the `retryForever` policy, retries will continue for each failed request indefinitely, in 5 second intervals. 

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

Once 5 consecutive retries have failed, the circuit breaker policy, `simpleCB`, is tripped and the breaker opens, halting all requests:

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

After 5 seconds has surpassed, the circuit breaker will switch to a half-open state, allowing one request through to verify if the fault has been resolved. If the request continues to fail, the circuit will trip back to the open state. 

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

This half-open/open behavior will continue for as long as the Redis container is stopped. 

### Step 3: Remove the fault

Once you restart the Redis container on your machine, the application will recover seamlessly, picking up where it left off.

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

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET SDK or .NET 6 SDK installed](https://dotnet.microsoft.com/download).
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
cd ../state_management/csharp/sdk/order-processor
```

Install dependencies

```bash
dotnet restore
dotnet build
```

### Step 2: Run the application

Run the `order-processor` service alongside a Dapr sidecar. The Dapr sidecar then loads the resiliency spec located in the resources directory:

   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Resiliency
   metadata:
     name: myresiliency
   scopes:
     - checkout
   
   spec:
     policies:
       retries:
         retryForever:
           policy: constant
           maxInterval: 5s
           maxRetries: -1 
   
       circuitBreakers:
         simpleCB:
           maxRequests: 1
           timeout: 5s 
           trip: consecutiveFailures >= 5
   
     targets:
       apps:
         order-processor:
           retry: retryForever
           circuitBreaker: simpleCB
   ```

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- dotnet run
```

Once the application has started, the `order-processor`service writes and reads `orderId` key/value pairs to the `statestore` Redis instance [defined in the `statestore.yaml` component]({{< ref "statemanagement-quickstart.md#statestoreyaml-component-file" >}}).

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

### Step 3: Introduce a fault

Simulate a fault by stopping the Redis container instance that was initialized when executing `dapr init` on your development machine. Once the instance is stopped, write and read operations from the `order-processor` service begin to fail.

Since the `resiliency.yaml` spec defines `statestore` as a component target, all failed requests will apply retry and circuit breaker policies:

```yaml
  targets:
    components:
      statestore:
        outbound:
          retry: retryForever
          circuitBreaker: simpleCB
```

In a new terminal window, run the following command to stop Redis:

```bash
docker stop dapr_redis
```

Once Redis is stopped, the requests begin to fail and the retry policy titled `retryForever` is applied. The output below shows the logs from the `order-processor` service:

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

As per the `retryForever` policy, retries will continue for each failed request indefinitely, in 5 second intervals. 

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

Once 5 consecutive retries have failed, the circuit breaker policy, `simpleCB`, is tripped and the breaker opens, halting all requests:

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

After 5 seconds has surpassed, the circuit breaker will switch to a half-open state, allowing one request through to verify if the fault has been resolved. If the request continues to fail, the circuit will trip back to the open state. 

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

This half-open/open behavior will continue for as long as the Redis container is stopped. 

### Step 3: Remove the fault

Once you restart the Redis container on your machine, the application will recover seamlessly, picking up where it left off.

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

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 11 (or greater):
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads), or
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html), version 3.x.
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
cd ../state_management/java/sdk/order-processor
```

Install dependencies

```bash
mvn clean install
```

### Step 2: Run the application

Run the `order-processor` service alongside a Dapr sidecar. The Dapr sidecar then loads the resiliency spec located in the resources directory:

   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Resiliency
   metadata:
     name: myresiliency
   scopes:
     - checkout
   
   spec:
     policies:
       retries:
         retryForever:
           policy: constant
           maxInterval: 5s
           maxRetries: -1 
   
       circuitBreakers:
         simpleCB:
           maxRequests: 1
           timeout: 5s 
           trip: consecutiveFailures >= 5
   
     targets:
       apps:
         order-processor:
           retry: retryForever
           circuitBreaker: simpleCB
   ```

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

Once the application has started, the `order-processor`service writes and reads `orderId` key/value pairs to the `statestore` Redis instance [defined in the `statestore.yaml` component]({{< ref "statemanagement-quickstart.md#statestoreyaml-component-file" >}}).

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

### Step 3: Introduce a fault

Simulate a fault by stopping the Redis container instance that was initialized when executing `dapr init` on your development machine. Once the instance is stopped, write and read operations from the `order-processor` service begin to fail.

Since the `resiliency.yaml` spec defines `statestore` as a component target, all failed requests will apply retry and circuit breaker policies:

```yaml
  targets:
    components:
      statestore:
        outbound:
          retry: retryForever
          circuitBreaker: simpleCB
```

In a new terminal window, run the following command to stop Redis:

```bash
docker stop dapr_redis
```

Once Redis is stopped, the requests begin to fail and the retry policy titled `retryForever` is applied. The output below shows the logs from the `order-processor` service:

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

As per the `retryForever` policy, retries will continue for each failed request indefinitely, in 5 second intervals. 

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

Once 5 consecutive retries have failed, the circuit breaker policy, `simpleCB`, is tripped and the breaker opens, halting all requests:

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

After 5 seconds has surpassed, the circuit breaker will switch to a half-open state, allowing one request through to verify if the fault has been resolved. If the request continues to fail, the circuit will trip back to the open state. 

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

This half-open/open behavior will continue for as long as the Redis container is stopped. 

### Step 3: Remove the fault

Once you restart the Redis container on your machine, the application will recover seamlessly, picking up where it left off.

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

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest version of Go](https://go.dev/dl/).
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
cd ../state_management/go/sdk/order-processor
```

Install dependencies

```bash
go build .
```

### Step 2: Run the application

Run the `order-processor` service alongside a Dapr sidecar. The Dapr sidecar then loads the resiliency spec located in the resources directory:

   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Resiliency
   metadata:
     name: myresiliency
   scopes:
     - checkout
   
   spec:
     policies:
       retries:
         retryForever:
           policy: constant
           maxInterval: 5s
           maxRetries: -1 
   
       circuitBreakers:
         simpleCB:
           maxRequests: 1
           timeout: 5s 
           trip: consecutiveFailures >= 5
   
     targets:
       apps:
         order-processor:
           retry: retryForever
           circuitBreaker: simpleCB
   ```

```bash
dapr run --app-id order-processor --resources-path ../../../resources -- go run .
```

Once the application has started, the `order-processor`service writes and reads `orderId` key/value pairs to the `statestore` Redis instance [defined in the `statestore.yaml` component]({{< ref "statemanagement-quickstart.md#statestoreyaml-component-file" >}}).

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

### Step 3: Introduce a fault

Simulate a fault by stopping the Redis container instance that was initialized when executing `dapr init` on your development machine. Once the instance is stopped, write and read operations from the `order-processor` service begin to fail.

Since the `resiliency.yaml` spec defines `statestore` as a component target, all failed requests will apply retry and circuit breaker policies:

```yaml
  targets:
    components:
      statestore:
        outbound:
          retry: retryForever
          circuitBreaker: simpleCB
```

In a new terminal window, run the following command to stop Redis:

```bash
docker stop dapr_redis
```

Once Redis is stopped, the requests begin to fail and the retry policy titled `retryForever` is applied. The output belows shows the logs from the `order-processor` service:

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

As per the `retryForever` policy, retries will continue for each failed request indefinitely, in 5 second intervals. 

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

Once 5 consecutive retries have failed, the circuit breaker policy, `simpleCB`, is tripped and the breaker opens, halting all requests:

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

After 5 seconds has surpassed, the circuit breaker will switch to a half-open state, allowing one request through to verify if the fault has been resolved. If the request continues to fail, the circuit will trip back to the open state. 

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

This half-open/open behavior will continue for as long as the Redis container is stopped. 

### Step 3: Remove the fault

Once you restart the Redis container on your machine, the application will recover seamlessly, picking up where it left off.

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

{{% /codetab %}}

{{< /tabs >}}

## Tell us what you think!
We're continuously working to improve our Quickstart examples and value your feedback. Did you find this quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps

Learn more about [the resiliency feature]({{< ref resiliency-overview.md >}}) and how it works with Dapr's building block APIs.

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
