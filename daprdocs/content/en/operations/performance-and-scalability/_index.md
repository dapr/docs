---
type: docs
title: "Performance and Scalability"
linkTitle: "Performance and Scalability"
weight: 300
description: "Benchmarks and guidelines"
---
Dapr allows developers to inject sidecars next to their apps that make it easy to write distribured applications. The Dapr APIs allow developers to manage state at scale, trigger their apps from external sources, fetch secrets, publish and consume messages, and call other apps in a secured manner with build in telemetry and resiliency.

Dapr is designed to be highly performant and consume minimal overhead in terms of compute resources.

## System overview

Dapr consists of a data plane (the sidecar that runs next to your app) and a control plane that configures the sidecars and provides additional capabilities like cert management.

### Self-hosted components

* Sidecar (Data Plane)
* Sentry (Optional, Control Plane)
* Placement (Optional, Control Plane)

### Kubernetes components

* Sidecar (Data Plane)
* Sentry (Optional, Control Plane)
* Placement (Optional, Control Plane)
* Operator (Control Plane)
* Sidecar Injector (Control Plane)


## Service Invocation Performance for Dapr v0.11.3

The Service Invocation API allows developers to use Dapr as a reverse proxy + discovery vehicle to connect in a secured manner to different services. This feature has out of the box telemetry and mTLS for in-transit encryption of traffic, together with resiliency in the form of retries for network partitions and connection errors.

Users can call the Service Invocation API to call from HTTP to HTTP, HTTP to gRPC, gRPC to HTTP, and gRPC to gRPC. Unlike other proxies, Dapr will not use HTTP for the communication between sidecars, and will always use gRPC while carrying over the semantics of the used protocol to the other side.

This API is also the underlying mechanism of Dapr Actors.

### Test setup

The test was conducted on a 3 node Kubernetes cluster, on commodity hardware running 4 cores and 8GB of RAM, without any network acceleration.
The setup included a load tester ([Fortio](https://github.com/fortio/fortio)) pod with a Dapr sidecar injected to it that called the Service Invocation API to reach a pod on a different node.

Test parameters:

* 1000 Requests per second
* Sidecar limited to 0.5 CPU
* Sidecar mTLS enabled
* Sidecar telemetry enabled
* Payload of 1KB

The baseline test included a direct, non-encrypted traffic without telemetry directly from the load tester to the target app.

### Control plane performance

The Dapr Control Plane uses a total of 0.01 vCPU and 77Mb.

Components breakdown:

* Operator - 1m, 12 Mi
* Placement - 5m, 20Mi
* Sentry - 2m, 13Mi
* Sidecar Injector - 1m, 14Mi 

### Data plane performance

The Dapr sidecar uses 0.48 CPU and 23Mb per 1000 requests per second.
End to end, the Dapr sidecar adds 1.57 ms to the 90th percentile latency, and 2.36 ms to the 99th percentile latency.

### Latency

In the test setup, requests went through the Dapr sidecar both on the client side (serving requests from the load tester tool) and the server side (the target app).
mTLS and telemetry (tracing with a sample rate of 0.10) and metris were enabled on the Dapr test, and disabled for the baseline test.

<img src="/images/perf_invocation_p90.png" alt="Latency for 90th percentile">

<br>

<img src="/images/perf_invocation_p99.png" alt="Latency for 99th percentile">

