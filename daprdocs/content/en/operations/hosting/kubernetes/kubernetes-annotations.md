---
type: docs
title: "Dapr Kubernetes pod annotations spec"
linkTitle: "Kubernetes annotations"
weight: 50000
description: "The available annotations available when configuring Dapr in your Kubernetes environment"
---

The following table shows all the supported pod Spec annotations supported by Dapr.

| Annotation                                        | Description |
|---------------------------------------------------|-------------|
| `dapr.io/enabled`                                 | Setting this paramater to `true` injects the Dapr sidecar into the pod
| `dapr.io/app-port`                                | This parameter tells Dapr which port your application is listening on
| `dapr.io/app-id`                                  | The unique ID of the application. Used for service discovery, state encapsulation and the pub/sub consumer ID
| `dapr.io/log-level`                               | Sets the log level for the Dapr sidecar. Allowed values are `debug`, `info`, `warn`, `error`. Default is `info`
| `dapr.io/config`                                  | Tells Dapr which Configuration CRD to use
| `dapr.io/log-as-json`                             | Setting this parameter to `true` outputs logs in JSON format. Default is `false`
| `dapr.io/enable-profiling`                        | Setting this paramater to `true` starts the Dapr profiling server on port `7777`. Default is `false`
| `dapr.io/api-token-secret`                        | Tells Dapr which Kubernetes secret to use for token based API authentication. By default this is not set.
| `dapr.io/app-protocol`                            | Tells Dapr which protocol your application is using. Valid options are `http` and `grpc`. Default is `http`
| `dapr.io/app-max-concurrency`                     | Limit the concurrency of your application. A valid value is any number larger than `0`
| `dapr.io/app-ssl`   | Tells Dapr to invoke the app over an insecure SSL connection. Applies to both HTTP and gRPC. Traffic between your app and the Dapr sidecar is encrypted with a certificate issued by a non-trusted certificate authority, which is considered insecure. Default is `false`.
| `dapr.io/metrics-port`                            | Sets the port for the sidecar metrics server. Default is `9090`
| `dapr.io/sidecar-cpu-limit`                       | Maximum amount of CPU that the Dapr sidecar can use. See valid values [here](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/). By default this is not set
| `dapr.io/sidecar-memory-limit`                    | Maximum amount of Memory that the Dapr sidecar can use. See valid values [here](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/). By default this is not set
| `dapr.io/sidecar-cpu-request`                     | Amount of CPU that the Dapr sidecar requests. See valid values [here](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/). By default this is not set
| `dapr.io/sidecar-memory-request`                  | Amount of Memory that the Dapr sidecar requests .See valid values [here](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/). By default this is not set
| `dapr.io/sidecar-liveness-probe-delay-seconds`    | Number of seconds after the sidecar container has started before liveness probe is initiated. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `3`
| `dapr.io/sidecar-liveness-probe-timeout-seconds`  | Number of seconds after which the sidecar liveness probe times out. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `3`
| `dapr.io/sidecar-liveness-probe-period-seconds`   | How often (in seconds) to perform the sidecar liveness probe. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `6`
| `dapr.io/sidecar-liveness-probe-threshold`        | When the sidecar liveness probe fails, Kubernetes will try N times before giving up. In  this case, the Pod will be marked Unhealthy. Read more about `failureThreshold` [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `3`
| `dapr.io/sidecar-readiness-probe-delay-seconds`   | Number of seconds after the sidecar container has started before readiness probe is initiated. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `3`
| `dapr.io/sidecar-readiness-probe-timeout-seconds` | Number of seconds after which the sidecar readiness probe times out. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `3`
| `dapr.io/sidecar-readiness-probe-period-seconds`  | How often (in seconds) to perform the sidecar readiness probe. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `6`
| `dapr.io/sidecar-readiness-probe-threshold`       | When the sidecar readiness probe fails, Kubernetes will try N times before giving up. In  this case, the Pod will be marked Unready. Read more about `failureThreshold` [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). Default is `3`
| `dapr.io/http-max-request-size`                   | Increasing max size of request body http and grpc servers parameter in MB to handle uploading of big files. Default is `4` MB
| `dapr.io/env`                                     | List of environment variable to be injected into the sidecar. Strings consisting of key=value pairs separated by a comma.
