---
type: docs
title: "Dapr arguments and annotations for daprd, CLI, and Kubernetes"
linkTitle: "Arguments and annotations"
description: "The arguments and annotations available when configuring Dapr in different environments"
weight: 300
aliases:
  - "/operations/hosting/kubernetes/kubernetes-annotations/"
---

This table is meant to help users understand the equivalent options for running Dapr sidecars in different contexts--via the [CLI]({{< ref cli-overview.md >}}) directly, via daprd, or on [Kubernetes]({{< ref kubernetes-overview.md >}}) via annotations.

| daprd | Dapr CLI | CLI shorthand | Kubernetes annotations | Description|
|----- | ------- | -----------| ----------| ------------ |
| `--allowed-origins`  | not supported |  | not supported | Allowed HTTP origins (default "*") |
| `--app-id` | `--app-id` | `-i` | `dapr.io/app-id`  | The unique ID of the application. Used for service discovery, state encapsulation and the pub/sub consumer ID |
| `--app-port` | `--app-port` | `-p` | `dapr.io/app-port` | This parameter tells Dapr which port your application is listening on |
| `--app-ssl` | `--app-ssl` | | `dapr.io/app-ssl` | Sets the URI scheme of the app to https and attempts an SSL connection |
| `--components-path`  | `--components-path` | `-d` | not supported | Path for components directory. If empty, components will not be loaded. |
| `--config`  | `--config` | `-c` | `dapr.io/config` | Tells Dapr which Configuration CRD to use |
| `--control-plane-address` | not supported | | not supported | Address for a Dapr control plane |
| `--dapr-grpc-port` | `--dapr-grpc-port` | | not supported | gRPC port for the Dapr API to listen on (default "50001") |
| `--dapr-http-port` | `--dapr-http-port` | | not supported | The HTTP port for the Dapr API |
| `--dapr-http-max-request-size` | --dapr-http-max-request-size | | `dapr.io/http-max-request-size` | Increasing max size of request body http and grpc servers parameter in MB to handle uploading of big files. Default is `4` MB |
| `--dapr-http-read-buffer-size` | --dapr-http-read-buffer-size | | `dapr.io/http-read-buffer-size` | Increasing max size of http header read buffer in KB to handle when sending multi-KB headers. The default 4 KB.  When sending bigger than default 4KB http headers, you should set this to a larger value, for example 16 (for 16KB) |
| not supported | `--image` | | `dapr.io/sidecar-image` | Dapr sidecar image. Default is `daprio/daprd:latest` |
| `--internal-grpc-port` | not supported | | not supported | gRPC port for the Dapr Internal API to listen on |
| `--enable-metrics` | not supported | | configuration spec | Enable prometheus metric (default true) |
| `--enable-mtls` | not supported | | configuration spec | Enables automatic mTLS for daprd to daprd communication channels |
| `--enable-profiling` | `--enable-profiling` | | `dapr.io/enable-profiling` | Enable profiling |
| `--unix-domain-socket` | `--unix-domain-socket` | `-u` | `dapr.io/unix-domain-socket-path`  | On Linux, when communicating with the Dapr sidecar, use unix domain sockets for lower latency and greater throughput compared to TCP ports. Not available on Windows OS |
| `--log-as-json` | not supported | | `dapr.io/log-as-json` | Setting this parameter to `true` outputs logs in JSON format. Default is `false` |
| `--log-level` | `--log-level` | | `dapr.io/log-level` | Sets the log level for the Dapr sidecar. Allowed values are `debug`, `info`, `warn`, `error`. Default is `info` |
| `--enable-api-logging` | `--enable-api-logging` | | `dapr.io/enable-api-logging` | Enables API logging for the Dapr sidecar |
| `--app-max-concurrency` | `--app-max-concurrency` | | `dapr.io/app-max-concurrency` | Limit the concurrency of your application. A valid value is any number larger than `0`|
| `--metrics-port` | `--metrics-port` | | `dapr.io/metrics-port` | Sets the port for the sidecar metrics server. Default is `9090` |
| `--mode` | not supported | | not supported | Runtime mode for Dapr (default "standalone") |
| `--placement-address` | `--placement-address` | | dapr.io/placement-addresses | Comma separated list of addresses for Dapr Actor Placement servers. When no annotation is set, the default value is set by the Sidecar Injector. When the annotation is set and the value is empty, the sidecar does not connect to Placement server. This can be used when there are no actors running in the sidecar. When the annotation is set and the value is not empty, the sidecar connects to the configured address. For example: `127.0.0.1:50057,127.0.0.1:50058` |
| `--profiling-port` | `--profiling-port` | | not supported | The port for the profile server (default "7777") |
| `--app-protocol` | `--app-protocol` | `-P` | `dapr.io/app-protocol` | Tells Dapr which protocol your application is using. Valid options are `http` and `grpc`. Default is `http` |
| `--sentry-address` | `--sentry-address` | | not supported | Address for the Sentry CA service |
| `--version` | `--version` | `-v` | not supported | Prints the runtime version |
| `--dapr-graceful-shutdown-seconds` | not supported | | `dapr.io/graceful-shutdown-seconds` | Graceful shutdown duration in seconds for Dapr, the maximum duration before forced shutdown when waiting for all in-progress requests to complete. Defaults to `5`. If you are running in Kubernetes mode, this value should not be larger than the Kubernetes termination grace period, who's default value is `30`.|
| not supported | not supported | | `dapr.io/enabled` | Setting this paramater to true injects the Dapr sidecar into the pod |
| not supported | not supported | | `dapr.io/api-token-secret` | Tells Dapr which Kubernetes secret to use for token based API authentication. By default this is not set |
| `--dapr-listen-addresses` | not supported  | | `dapr.io/sidecar-listen-addresses`                       | Comma separated list of IP addresses that sidecar will listen to. Defaults to all in standalone mode. Defaults to `[::1],127.0.0.1` in Kubernetes. To listen to all IPv4 addresses, use `0.0.0.0`. To listen to all IPv6 addresses, use `[::]`.|
| not supported | not supported  | | `dapr.io/sidecar-cpu-limit`                       | Maximum amount of CPU that the Dapr sidecar can use. See valid values [here](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/). By default this is not set|
| not supported | not supported | | `dapr.io/sidecar-memory-limit`                    | Maximum amount of Memory that the Dapr sidecar can use. See valid values [here](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/). By default this is not set|
| not supported | not supported | | `dapr.io/sidecar-cpu-request`                     | Amount of CPU that the Dapr sidecar requests. See valid values [here](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/). By default this is not set|
| not supported | not supported | | `dapr.io/sidecar-memory-request`                  | Amount of Memory that the Dapr sidecar requests .See valid values [here](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/). By default this is not set|
| not supported | not supported | | `dapr.io/sidecar-liveness-probe-delay-seconds`    | Number of seconds after the sidecar container has started before liveness probe is initiated. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `3`|
| not supported | not supported | | `dapr.io/sidecar-liveness-probe-timeout-seconds`  | Number of seconds after which the sidecar liveness probe times out. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `3`|
| not supported | not supported | | `dapr.io/sidecar-liveness-probe-period-seconds`   | How often (in seconds) to perform the sidecar liveness probe. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `6`|
| not supported | not supported | | `dapr.io/sidecar-liveness-probe-threshold`        | When the sidecar liveness probe fails, Kubernetes will try N times before giving up. In  this case, the Pod will be marked Unhealthy. Read more about `failureThreshold` [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `3`|
| not supported | not supported | | `dapr.io/sidecar-readiness-probe-delay-seconds`   | Number of seconds after the sidecar container has started before readiness probe is initiated. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `3`|
| not supported | not supported | | `dapr.io/sidecar-readiness-probe-timeout-seconds` | Number of seconds after which the sidecar readiness probe times out. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `3`|
| not supported | not supported | | `dapr.io/sidecar-readiness-probe-period-seconds`  | How often (in seconds) to perform the sidecar readiness probe. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `6`|
| not supported | not supported | | `dapr.io/sidecar-readiness-probe-threshold`       | When the sidecar readiness probe fails, Kubernetes will try N times before giving up. In  this case, the Pod will be marked Unready. Read more about `failureThreshold` [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `3`|
| not supported | not supported | | `dapr.io/env`                                     | List of environment variable to be injected into the sidecar. Strings consisting of key=value pairs separated by a comma.|
