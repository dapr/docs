---
type: docs
title: "Pub/sub performance"
linkTitle: "Pub/sub performance"
weight: 20000
description: ""
---
This article provides pub/sub API performance benchmarks and resource utilization in Dapr on Kubernetes.

## System overview

Dapr consists of a data plane, the sidecar that runs next to your app, and a control plane that configures the sidecars and provides capabilities such as cert and identity management.

### Kubernetes components

* Sidecar (data plane)
* Placement (required for actors, control plane mapping actor types to hosts)
* Operator (control plane)
* Sidecar Injector (control plane)
* Sentry (optional, control plane)
* Kafka cluster with 3 replicas

## Performance summary for Dapr v1.12

The Pub/Sub API is used to publish messages to a message broker. Dapr accepts requests from the app via HTTP or gRPC, wraps them in a cloud event if needed, and sends the request to the message broker.

Performance varies based on the underlying message broker. The Pub/Sub performance test measures the added latency when publishing a message with Dapr compared with the baseline latency when publishing directly to the message broker.

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
* Added latency for 90th percentile was 0.64ms for gRPC and 0.49ms for HTTP
* Added latency for 99th percentile was 1.91ms for gRPC and 1.21ms for HTTP
* Dapr app consumed ~0.2 vCPU and ~30Mb of Memory for both gRPC and HTTP
* No app restarts
* No sidecar restarts
