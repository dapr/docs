---
type: docs
title: "Service Invocation Performance"
linkTitle: "Service Invocation performance"
weight: 10000
description: ""
---
In this section you'll find an overview of the components needed to run Dapr in different hosting environments along with performance benchmarks and resource utilizations.

## System overview

Dapr consists of a data plane (the sidecar that runs next to your app) and a control plane that configures the sidecars and provides additional capabilities like cert management.

### Self-hosted components

* Sidecar (Data Plane)
* Sentry (Optional, Control Plane)
* Placement (Optional, Control Plane)

For more information on running Dapr in Self-Hosted mode, see [here]({{< ref self-hosted-overview.md >}}).

### Kubernetes components

* Sidecar (Data Plane)
* Sentry (Optional, Control Plane)
* Placement (Optional, Control Plane)
* Operator (Control Plane)
* Sidecar Injector (Control Plane)

For more information on running Dapr in Kubernetes, see [here]({{< ref kubernetes-overview.md >}}).

## Performance summary for Dapr v0.11.3

The Service Invocation API allows developers to use Dapr as a reverse proxy + discovery vehicle to connect in a secured manner to different services. This feature has out of the box telemetry and mTLS for in-transit encryption of traffic, together with resiliency in the form of retries for network partitions and connection errors.

Users can call the Service Invocation API to call from HTTP to HTTP, HTTP to gRPC, gRPC to HTTP, and gRPC to gRPC. Unlike other proxies, Dapr will not use HTTP for the communication between sidecars, and will always use gRPC while carrying over the semantics of the used protocol to the other side.

This API is also the underlying mechanism of Dapr Actors.

For more information on Service Invocation, see [here]({{< ref service-invocation-overview.md >}}).

### Kubernetes test setup

The test was conducted on a 3 node Kubernetes cluster, on commodity hardware running 4 cores and 8GB of RAM, without any network acceleration.
The setup included a load tester ([Fortio](https://github.com/fortio/fortio)) pod with a Dapr sidecar injected to it that called the service invocation API to reach a pod on a different node.

Test parameters:

* 1000 Requests per second
* Sidecar limited to 0.5 vCPU
* Sidecar mTLS enabled
* Sidecar telemetry enabled
* Payload of 1KB

The baseline test included a direct, non-encrypted traffic without telemetry directly from the load tester to the target app.

### Control plane performance

The Dapr control plane uses a total of 0.01 vCPU and 77 Mb.


| Component  | vCPU | Memory
| ------------- | ------------- | -------------
| Operator  | 0.001  | 12.5 Mb
| Sentry  | 0.005  | 13.6 Mb
| Sidecar Injector  | 0.002  | 14.6 Mb
| Placement | 0.001  | 20.9 Mb

There are a number of variants that affect the CPU and memory consumption for each of the system components:

| Component  | vCPU | Memory
| ------------- | ------------- | ------------------------
| Operator  | Number of pods requesting components, configurations and subscriptions  |
| Sentry  | Number of certificate requests  |
| Sidecar Injector | Number of admission requests |
| Placement | Number of actor rebalancing operations | Number of connected actor hosts

### Data plane performance

The Dapr sidecar uses 0.48 vCPU and 23M b per 1000 requests per second.
End to end, the Dapr sidecar adds 1.57 ms to the 90th percentile latency, and 2.36 ms to the 99th percentile latency.

### Latency

In the test setup, requests went through the Dapr sidecar both on the client side (serving requests from the load tester tool) and the server side (the target app).
mTLS and telemetry (tracing with a sampling rate of 0.1) and metris were enabled on the Dapr test, and disabled for the baseline test.

<img src="/images/perf_invocation_p90.png" alt="Latency for 90th percentile">

<br>

<img src="/images/perf_invocation_p99.png" alt="Latency for 99th percentile">
