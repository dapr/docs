---
type: docs
title: "annotate CLI command reference"
linkTitle: "annotate"
description: "Add Dapr annotatations to a Kubernetes configuration"
---

### Description

Add Dapr annotations to a Kubernetes configuration. This enables you to add/change the Dapr annotations on a deployment files. See [Kubernetes annotations]({{< ref arguments-annotations-overview >}}) for a full description of each annotation available in the following list of flags.

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr annotate [flags] CONFIG-FILE
```

### Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--kubernetes, -k` | | | Apply annotations to Kubernetes resources. Required |
| `--api-token-secret` | | | The secret to use for the API token |
| `--app-id, -a` | | | The app id to annotate |
| `--app-max-concurrency` | | `-1` | The maximum number of concurrent requests to allow |
| `--app-port, -p` | | `-1` | The port to expose the app on |
| `--app-protocol` | | | The protocol to use for the app |
| `--app-ssl` | | `false` | Enable SSL for the app |
| `--app-token-secret` | | | The secret to use for the app token |
| `--config, -c` | | | The config file to annotate |
| `--cpu-limit` | | |  The CPU limit to set for the sidecar. See valid values [here](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/). |
| `--cpu-request` | | | The CPU request to set for the sidecar. See valid values [here](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/). |
| `--dapr-image` | | | The image to use for the dapr sidecar container |
| `--enable-debug` | | `false` | Enable debug |
| `--enable-metrics` | | `false` | Enable metrics |
| `--enable-profile` | | `false` | Enable profiling |
| `--env` | | | Environment variables to set (key value pairs, comma separated) |
| `--graceful-shutdown-seconds` | | `-1` | The number of seconds to wait for the app to shutdown |
| `--help, -h` | | | help for annotate |
| `--listen-addresses` | | | The addresses for sidecar to listen on. To listen to all IPv4 addresses, use `0.0.0.0`. To listen to all IPv6 addresses, use `[::]`. |
| `--liveness-probe-delay` | | `-1` | The delay for sidecar to use for the liveness probe. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). |
| `--liveness-probe-period` | | `-1` | The period used by the sidecar for the liveness probe. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). |
| `--liveness-probe-threshold` | | `-1` | The threshold used by the sidecar for the liveness probe. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). |
| `--liveness-probe-timeout` | | `-1` | The timeout used by the sidecar for the liveness probe. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). |
| `--log-level` | | | The log level to use |
| `--max-request-body-size` | | `-1` | The maximum request body size to use |
| `--http-read-buffer-size` | | `-1` | The maximum size of HTTP header read buffer in kilobytes | 
| `--memory-limit` | | | The memory limit to set for the sidecar. See valid values [here](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/) |
| `--memory-request`| | | The memory request to set for the sidecar |
| `--metrics-port` | | `-1` | The port to expose the metrics on |
| `--namespace, -n` | | | The namespace the resource target is in (can only be set if `--resource` is also set) |
| `--readiness-probe-delay` | | `-1` | The delay to use for the readiness probe in the sidecar. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes).|
| `--readiness-probe-period` | | `-1` | The period to use for the readiness probe in the sidecar. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). |
| `--readiness-probe-threshold` | | `-1` | The threshold to use for the readiness probe in the sidecar. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). |
| `--readiness-probe-timeout` | | `-1` | The timeout to use for the readiness probe in the sidecar. Read more [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes). |
| `--resource, -r` | | | The Kubernetes resource target to annotate |
| `--enable-api-logging` | | | Enable API logging for the Dapr sidecar |
| `--unix-domain-socket-path` | | | Linux domain socket path to use for communicating with the Dapr sidecar | 
| `--volume-mounts` | | | List of pod volumes to be mounted to the sidecar container in read-only mode | 
| `--volume-mounts-rw` | | | List of pod volumes to be mounted to the sidecar container in read-write mode | 
| `--disable-builtin-k8s-secret-store` | | | Disable the built-in Kubernetes secret store |
| `--placement-host-address` | | | Comma separated list of addresses for Dapr actor placement servers |

{{% alert title="Warning" color="warning" %}}
If an application ID is not provided using `--app-id, -a`, an ID is generated using the format `<namespace>-<kind>-<name>`.
{{% /alert %}}

### Examples

```bash 
# Annotate the first deployment found in the input
kubectl get deploy -l app=node -o yaml | dapr annotate -k - | kubectl apply -f -

# Annotate multiple deployments by name in a chain
kubectl get deploy -o yaml | dapr annotate -k -r nodeapp - | dapr annotate -k -r pythonapp - | kubectl apply -f -

# Annotate deployment in a specific namespace from file or directory by name
dapr annotate -k -r nodeapp -n namespace mydeploy.yaml | kubectl apply -f -

# Annotate deployment from url by name
dapr annotate -k -r nodeapp --log-level debug https://raw.githubusercontent.com/dapr/quickstarts/master/tutorials/hello-kubernetes/deploy/node.yaml | kubectl apply -f -
```

