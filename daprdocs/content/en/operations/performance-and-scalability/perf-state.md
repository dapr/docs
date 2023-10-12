---
type: docs
title: "State performance"
linkTitle: "State performance"
weight: 20000
description: ""
---
This article provides state API performance benchmarks and resource utilization in Dapr on Kubernetes.

## System overview

Dapr consists of a data plane, the sidecar that runs next to your app, and a control plane that configures the sidecars and provides capabilities such as cert and identity management.

### Kubernetes components

* Sidecar (data plane)
* Placement (required for actors, control plane mapping actor types to hosts)
* Operator (control plane)
* Sidecar Injector (control plane)
* Sentry (optional, control plane)
* PosgreSQL database (single node)

## Performance summary for Dapr v1.12

The state API is used to persist state to a database, commonly called state store in Dapr.

Performance varies based on the underlying state store. The state API performance test measures the added latency when using Dapr to get state compared with the baseline latency when getting state directly from the state store.

### Kubernetes performance test setup

The test was conducted on a 3 node Kubernetes cluster, using commodity hardware running 4 cores and 8GB of RAM, without any network acceleration.

Test parameters:

* 1000 requests per second
* 1 replica
* 1 minute duration
* Sidecar limited to 0.5 vCPU
* Sidecar telemetry enabled (tracing with a sampling rate of 0.1)
* Payload of a 1kb size

### Results

* The requested throughput was 1000 qps
* The actual throughput was 1000 qps
* Added latency for 90th percentile was 0.75ms for gRPC
* Added latency for 99th percentile was 1.52ms for gRPC
* Dapr app consumed ~0.3 vCPU and ~48 of Memory for gRPC
* No app restarts
* No sidecar restarts
