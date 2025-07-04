---
type: docs
title: "Quickstart: Service-to-service resiliency"
linkTitle: "Resiliency: Service-to-service"
weight: 120
description: "Get started with Dapr's resiliency capabilities via the service invocation API"
---

Observe Dapr resiliency capabilities by simulating a system failure. In this Quickstart, you will:

- Run two microservice applications: `checkout` and `order-processor`. `checkout` will continuously make Dapr service invocation requests to `order-processor`. 
- Trigger the resiliency spec by simulating a system failure. 
- Remove the failure to allow the microservice application to recover. 

<img src="/images/resiliency-quickstart-svc-invoke.png" width="1000" alt="Diagram showing the resiliency applied to Dapr APIs">

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

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/service_invocation/python/http).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Run `order-processor` service

In a terminal window, from the root of the Quickstart directory, navigate to `order-processor` directory.

```bash
cd service_invocation/python/http/order-processor
```

Install dependencies:

```bash
pip3 install -r requirements.txt
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-port 8001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- python3 app.py
```

### Step 3: Run the `checkout` service application 

In a new terminal window, from the root of the Quickstart directory, navigate to the `checkout` directory.

```bash
cd service_invocation/python/http/checkout
```

Install dependencies:

```bash
pip3 install -r requirements.txt
```

Run the `checkout` service alongside a Dapr sidecar. 

```bash
dapr run --app-id checkout --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3500 -- python3 app.py
```

The Dapr sidecar then loads the resiliency spec located in the resources directory:

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

### Step 4: View the Service Invocation outputs
When both services and sidecars are running, notice how orders are passed from the `checkout` service to the `order-processor` service using Dapr service invoke. 

`checkout` service output:

```
== APP == Order passed: {"orderId": 1}
== APP == Order passed: {"orderId": 2}
== APP == Order passed: {"orderId": 3}
== APP == Order passed: {"orderId": 4}
```

`order-processor` service output:

```
== APP == Order received: {"orderId": 1}
== APP == Order received: {"orderId": 2}
== APP == Order received: {"orderId": 3}
== APP == Order received: {"orderId": 4}
```

### Step 5: Introduce a fault
Simulate a fault by stopping the `order-processor` service. Once the instance is stopped, service invoke operations from the `checkout` service begin to fail.

Since the `resiliency.yaml` spec defines the `order-processor` service as a resiliency target, all failed requests will apply retry and circuit breaker policies:

```yaml
  targets:
    apps:
      order-processor:
        retry: retryForever
        circuitBreaker: simpleCB
```

In the `order-processor` window, stop the service:

```script
CTRL + C
```

Once the first request fails, the retry policy titled `retryForever` is applied:

```bash
INFO[0005] Error processing operation endpoint[order-processor, order-processor:orders]. Retrying...  
```

Retries will continue for each failed request indefinitely, in 5 second intervals. 

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

Once 5 consecutive retries have failed, the circuit breaker policy, `simpleCB`, is tripped and the breaker opens, halting all requests:

```bash
INFO[0025] Circuit breaker "order-processor:orders" changed state from closed to open  
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
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open   
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open     
```

This half-open/open behavior will continue for as long as the `order-processor` service is stopped. 

### Step 6: Remove the fault

Once you restart the `order-processor` service, the application will recover seamlessly, picking up where it left off with accepting order requests.

In the `order-processor` service terminal, restart the application:

```bash
dapr run --app-port 8001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- python3 app.py
```

`checkout` service output:

```
== APP == Order passed: {"orderId": 5}
== APP == Order passed: {"orderId": 6}
== APP == Order passed: {"orderId": 7}
== APP == Order passed: {"orderId": 8}
== APP == Order passed: {"orderId": 9}
== APP == Order passed: {"orderId": 10}
```

`order-processor` service output:

```
== APP == Order received: {"orderId": 5}
== APP == Order received: {"orderId": 6}
== APP == Order received: {"orderId": 7}
== APP == Order received: {"orderId": 8}
== APP == Order received: {"orderId": 9}
== APP == Order received: {"orderId": 10}
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

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/service_invocation/javascript/http).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Run the `order-processor` service

In a terminal window, from the root of the Quickstart directory,
navigate to `order-processor` directory.

```bash
cd service_invocation/javascript/http/order-processor
```

Install dependencies:

```bash
npm install
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-port 5001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- npm start
```

### Step 3: Run the `checkout` service application 

In a new terminal window, from the root of the Quickstart directory, 
navigate to the `checkout` directory.

```bash
cd service_invocation/javascript/http/checkout
```

Install dependencies:

```bash
npm install
```

Run the `checkout` service alongside a Dapr sidecar. 

```bash
dapr run --app-id checkout --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3500 -- npm start
```

The Dapr sidecar then loads the resiliency spec located in the resources directory:


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

### Step 4: View the Service Invocation outputs
When both services and sidecars are running, notice how orders are passed from the `checkout` service to the `order-processor` service using Dapr service invoke. 

`checkout` service output:

```
== APP == Order passed: {"orderId": 1}
== APP == Order passed: {"orderId": 2}
== APP == Order passed: {"orderId": 3}
== APP == Order passed: {"orderId": 4}
```

`order-processor` service output:

```
== APP == Order received: {"orderId": 1}
== APP == Order received: {"orderId": 2}
== APP == Order received: {"orderId": 3}
== APP == Order received: {"orderId": 4}
```

### Step 5: Introduce a fault
Simulate a fault by stopping the `order-processor` service. Once the instance is stopped, service invoke operations from the `checkout` service begin to fail.

Since the `resiliency.yaml` spec defines the `order-processor` service as a resiliency target, all failed requests will apply retry and circuit breaker policies:

```yaml
  targets:
    apps:
      order-processor:
        retry: retryForever
        circuitBreaker: simpleCB
```

In the `order-processor` window, stop the service:

{{< tabs "MacOs" "Windows" >}}

 <!-- MacOS -->

{{% codetab %}}

```script
CMD + C
```

{{% /codetab %}}

 <!-- Windows -->

{{% codetab %}}

```script
CTRL + C
```

{{% /codetab %}}

{{< /tabs >}}


Once the first request fails, the retry policy titled `retryForever` is applied:

```bash
INFO[0005] Error processing operation endpoint[order-processor, order-processor:orders]. Retrying...  
```

Retries will continue for each failed request indefinitely, in 5 second intervals. 

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

Once 5 consecutive retries have failed, the circuit breaker policy, `simpleCB`, is tripped and the breaker opens, halting all requests:

```bash
INFO[0025] Circuit breaker "order-processor:orders" changed state from closed to open  
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
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open   
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open     
```

This half-open/open behavior will continue for as long as the Redis container is stopped. 

### Step 6: Remove the fault

Once you restart the `order-processor` service, the application will recover seamlessly, picking up where it left off. 

In the `order-processor` service terminal, restart the application:

```bash
dapr run --app-port 5001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- npm start
```

`checkout` service output:

```
== APP == Order passed: {"orderId": 5}
== APP == Order passed: {"orderId": 6}
== APP == Order passed: {"orderId": 7}
== APP == Order passed: {"orderId": 8}
== APP == Order passed: {"orderId": 9}
== APP == Order passed: {"orderId": 10}
```

`order-processor` service output:

```
== APP == Order received: {"orderId": 5}
== APP == Order received: {"orderId": 6}
== APP == Order received: {"orderId": 7}
== APP == Order received: {"orderId": 8}
== APP == Order received: {"orderId": 9}
== APP == Order received: {"orderId": 10}
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

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/service_invocation/csharp/http).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Run the `order-processor` service

In a terminal window, from the root of the Quickstart directory,
navigate to `order-processor` directory.


```bash
cd service_invocation/csharp/http/order-processor
```

Install dependencies:

```bash
dotnet restore
dotnet build
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-port 7001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- dotnet run
```

### Step 3: Run the `checkout` service application 

In a new terminal window, from the root of the Quickstart directory,
navigate to the `checkout` directory.

```bash
cd service_invocation/csharp/http/checkout
```

Install dependencies:

```bash
dotnet restore
dotnet build
```

Run the `checkout` service alongside a Dapr sidecar. 

```bash
dapr run --app-id checkout --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3500 -- dotnet run
```

The Dapr sidecar then loads the resiliency spec located in the resources directory:

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

### Step 4: View the Service Invocation outputs
When both services and sidecars are running, notice how orders are passed from the `checkout` service to the `order-processor` service using Dapr service invoke. 

`checkout` service output:

```
== APP == Order passed: {"orderId": 1}
== APP == Order passed: {"orderId": 2}
== APP == Order passed: {"orderId": 3}
== APP == Order passed: {"orderId": 4}
```

`order-processor` service output:

```
== APP == Order received: {"orderId": 1}
== APP == Order received: {"orderId": 2}
== APP == Order received: {"orderId": 3}
== APP == Order received: {"orderId": 4}
```

### Step 5: Introduce a fault
Simulate a fault by stopping the `order-processor` service. Once the instance is stopped, service invoke operations from the `checkout` service begin to fail.

Since the `resiliency.yaml` spec defines the `order-processor` service as a resiliency target, all failed requests will apply retry and circuit breaker policies:

```yaml
  targets:
    apps:
      order-processor:
        retry: retryForever
        circuitBreaker: simpleCB
```

In the `order-processor` window, stop the service:

{{< tabs "MacOs" "Windows" >}}

 <!-- MacOS -->

{{% codetab %}}

```script
CMD + C
```

{{% /codetab %}}

 <!-- Windows -->

{{% codetab %}}

```script
CTRL + C
```

{{% /codetab %}}

{{< /tabs >}}


Once the first request fails, the retry policy titled `retryForever` is applied:

```bash
INFO[0005] Error processing operation endpoint[order-processor, order-processor:orders]. Retrying...  
```

Retries will continue for each failed request indefinitely, in 5 second intervals. 

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

Once 5 consecutive retries have failed, the circuit breaker policy, `simpleCB`, is tripped and the breaker opens, halting all requests:

```bash
INFO[0025] Circuit breaker "order-processor:orders" changed state from closed to open  
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
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open   
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open     
```

This half-open/open behavior will continue for as long as the Redis container is stopped. 

### Step 6: Remove the fault

Once you restart the `order-processor` service, the application will recover seamlessly, picking up where it left off. 

In the `order-processor` service terminal, restart the application:

```bash
dapr run --app-port 7001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- dotnet run
```

`checkout` service output:

```
== APP == Order passed: {"orderId": 5}
== APP == Order passed: {"orderId": 6}
== APP == Order passed: {"orderId": 7}
== APP == Order passed: {"orderId": 8}
== APP == Order passed: {"orderId": 9}
== APP == Order passed: {"orderId": 10}
```

`order-processor` service output:

```
== APP == Order received: {"orderId": 5}
== APP == Order received: {"orderId": 6}
== APP == Order received: {"orderId": 7}
== APP == Order received: {"orderId": 8}
== APP == Order received: {"orderId": 9}
== APP == Order received: {"orderId": 10}
```

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 17 (or greater):
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads), or
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html), version 3.x.
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/service_invocation/java/http).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Run the `order-processor` service

In a terminal window, from the root of the Quickstart directory,
navigate to `order-processor` directory.

```bash
cd service_invocation/java/http/order-processor
```

Install dependencies:

```bash
mvn clean install
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ --app-port 9001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

### Step 3: Run the `checkout` service application 

In a new terminal window, from the root of the Quickstart directory,
navigate to the `checkout` directory.

```bash
cd service_invocation/java/http/checkout
```

Install dependencies:

```bash
mvn clean install
```

Run the `checkout` service alongside a Dapr sidecar. 

```bash
dapr run --app-id checkout --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3500 -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar
```

The Dapr sidecar then loads the resiliency spec located in the resources directory:


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

### Step 4: View the Service Invocation outputs
When both services and sidecars are running, notice how orders are passed from the `checkout` service to the `order-processor` service using Dapr service invoke. 

`checkout` service output:

```
== APP == Order passed: {"orderId": 1}
== APP == Order passed: {"orderId": 2}
== APP == Order passed: {"orderId": 3}
== APP == Order passed: {"orderId": 4}
```

`order-processor` service output:

```
== APP == Order received: {"orderId": 1}
== APP == Order received: {"orderId": 2}
== APP == Order received: {"orderId": 3}
== APP == Order received: {"orderId": 4}
```

### Step 5: Introduce a fault
Simulate a fault by stopping the `order-processor` service. Once the instance is stopped, service invoke operations from the `checkout` service begin to fail.

Since the `resiliency.yaml` spec defines the `order-processor` service as a resiliency target, all failed requests will apply retry and circuit breaker policies:

```yaml
  targets:
    apps:
      order-processor:
        retry: retryForever
        circuitBreaker: simpleCB
```

In the `order-processor` window, stop the service:

{{< tabs "MacOs" "Windows" >}}

 <!-- MacOS -->

{{% codetab %}}

```script
CMD + C
```

{{% /codetab %}}

 <!-- Windows -->

{{% codetab %}}

```script
CTRL + C
```

{{% /codetab %}}

{{< /tabs >}}


Once the first request fails, the retry policy titled `retryForever` is applied:

```bash
INFO[0005] Error processing operation endpoint[order-processor, order-processor:orders]. Retrying...  
```

Retries will continue for each failed request indefinitely, in 5 second intervals. 

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

Once 5 consecutive retries have failed, the circuit breaker policy, `simpleCB`, is tripped and the breaker opens, halting all requests:

```bash
INFO[0025] Circuit breaker "order-processor:orders" changed state from closed to open  
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
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open   
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open     
```

This half-open/open behavior will continue for as long as the Redis container is stopped. 

### Step 6: Remove the fault

Once you restart the `order-processor` service, the application will recover seamlessly, picking up where it left off. 

In the `order-processor` service terminal, restart the application:

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ --app-port 9001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

`checkout` service output:

```
== APP == Order passed: {"orderId": 5}
== APP == Order passed: {"orderId": 6}
== APP == Order passed: {"orderId": 7}
== APP == Order passed: {"orderId": 8}
== APP == Order passed: {"orderId": 9}
== APP == Order passed: {"orderId": 10}
```

`order-processor` service output:

```
== APP == Order received: {"orderId": 5}
== APP == Order received: {"orderId": 6}
== APP == Order received: {"orderId": 7}
== APP == Order received: {"orderId": 8}
== APP == Order received: {"orderId": 9}
== APP == Order received: {"orderId": 10}
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

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/service_invocation/go/http).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Run the `order-processor` service

In a terminal window, from the root of the Quickstart directory,
navigate to `order-processor` directory.

```bash
cd service_invocation/go/http/order-processor
```

Install dependencies:

```bash
go build .
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-port 6001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- go run .
```

### Step 3: Run the `checkout` service application 

In a new terminal window, from the root of the Quickstart directory,
navigate to the `checkout` directory.

```bash
cd service_invocation/go/http/checkout
```

Install dependencies:

```bash
go build .
```

Run the `checkout` service alongside a Dapr sidecar. 

```bash
dapr run --app-id checkout --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3500 -- go run .
```

The Dapr sidecar then loads the resiliency spec located in the resources directory:


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

### Step 4: View the Service Invocation outputs
When both services and sidecars are running, notice how orders are passed from the `checkout` service to the `order-processor` service using Dapr service invoke. 

`checkout` service output:

```
== APP == Order passed: {"orderId": 1}
== APP == Order passed: {"orderId": 2}
== APP == Order passed: {"orderId": 3}
== APP == Order passed: {"orderId": 4}
```

`order-processor` service output:

```
== APP == Order received: {"orderId": 1}
== APP == Order received: {"orderId": 2}
== APP == Order received: {"orderId": 3}
== APP == Order received: {"orderId": 4}
```

### Step 5: Introduce a fault
Simulate a fault by stopping the `order-processor` service. Once the instance is stopped, service invoke operations from the `checkout` service begin to fail.

Since the `resiliency.yaml` spec defines the `order-processor` service as a resiliency target, all failed requests will apply retry and circuit breaker policies:

```yaml
  targets:
    apps:
      order-processor:
        retry: retryForever
        circuitBreaker: simpleCB
```

In the `order-processor` window, stop the service:

{{< tabs "MacOs" "Windows" >}}

 <!-- MacOS -->

{{% codetab %}}

```script
CMD + C
```

{{% /codetab %}}

 <!-- Windows -->

{{% codetab %}}

```script
CTRL + C
```

{{% /codetab %}}

{{< /tabs >}}


Once the first request fails, the retry policy titled `retryForever` is applied:

```bash
INFO[0005] Error processing operation endpoint[order-processor, order-processor:orders]. Retrying...  
```

Retries will continue for each failed request indefinitely, in 5 second intervals. 

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

Once 5 consecutive retries have failed, the circuit breaker policy, `simpleCB`, is tripped and the breaker opens, halting all requests:

```bash
INFO[0025] Circuit breaker "order-processor:orders" changed state from closed to open  
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
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open   
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open     
```

This half-open/open behavior will continue for as long as the Redis container is stopped. 

### Step 6: Remove the fault

Once you restart the `order-processor` service, the application will recover seamlessly, picking up where it left off. 

In the `order-processor` service terminal, restart the application:

```bash
dapr run --app-port 6001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- go run .
```

`checkout` service output:

```
== APP == Order passed: {"orderId": 5}
== APP == Order passed: {"orderId": 6}
== APP == Order passed: {"orderId": 7}
== APP == Order passed: {"orderId": 8}
== APP == Order passed: {"orderId": 9}
== APP == Order passed: {"orderId": 10}
```

`order-processor` service output:

```
== APP == Order received: {"orderId": 5}
== APP == Order received: {"orderId": 6}
== APP == Order received: {"orderId": 7}
== APP == Order received: {"orderId": 8}
== APP == Order received: {"orderId": 9}
== APP == Order received: {"orderId": 10}
```

{{% /codetab %}}

{{< /tabs >}}

## Tell us what you think!
We're continuously working to improve our Quickstart examples and value your feedback. Did you find this quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps
Visit [this](https://docs.dapr.io/operations/resiliency/resiliency-overview//) link for more information about Dapr resiliency.

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
