---
type: docs
title: "Dapr sidecar (daprd) overview"
linkTitle: "Sidecar"
weight: 100
description: "Overview of the Dapr sidecar process"
---

Dapr uses a [sidecar pattern]({{< ref "overview.md#sidecar-architecture" >}}), meaning the Dapr APIs are run and exposed on a separate process (i.e. the Dapr sidecar) running alongside your application. The Dapr sidecar process is named `daprd` and is launched in different ways depending on the hosting environment.

<img src="/images/overview-sidecar-model.png" width=700>

## Self-hosted with `dapr run`

When Dapr is installed in [self-hosted mode]({{<ref self-hosted>}}), the `daprd` binary is downloaded and placed under the user home directory (`$HOME/.dapr/bin` for Linux/MacOS or `%USERPROFILE%\.dapr\bin\` for Windows). In self-hosted mode, running the Dapr CLI [`run` command]({{< ref dapr-run.md >}}) launches the `daprd` executable together with the provided application executable. This is the recommended way of running the Dapr sidecar when working locally in scenarios such as development and testing. The various arguments the CLI exposes to configure the sidecar can be found in the [Dapr run command reference]({{<ref dapr-run>}}).

## Kubernetes with `dapr-sidecar-injector`

On [Kubernetes]({{< ref kubernetes.md >}}), the Dapr control plane includes the [dapr-sidecar-injector service]({{< ref kubernetes-overview.md >}}), which watches for new pods with the `dapr.io/enabled` annotation and injects a container with the `daprd` process within the pod. In this case, sidecar arguments can be passed through annotations as outlined in the **Kubernetes annotations** column in [this table]({{<ref arguments-annotations-overview>}}).

## Running the sidecar directly

In most cases you do not need to run `daprd` explicitly, as the sidecar is either launched by the CLI (self-hosted mode) or by the dapr-sidecar-injector service (Kubernetes). For advanced use cases (debugging, scripted deployments, etc.) the `daprd` process can be launched directly.

For a detailed list of all available arguments run `daprd --help` or see this [table]({{< ref arguments-annotations-overview.md >}}) which outlines how the `daprd` arguments relate to the CLI arguments and Kubernetes annotations.

### Examples

1. Start a sidecar along an application by specifying its unique ID. Note `--app-id` is a required field:

   ```bash
   daprd --app-id myapp
   ```

2. Specify the port your application is listening to

   ```bash
   daprd --app-id --app-port 5000
   ```

3. If you are using several custom components and want to specify the location of the component definition files, use the `--components-path` argument:

   ```bash
   daprd --app-id myapp --components-path <PATH-TO-COMPONENTS-FILES>
   ```

4. Enable collection of Prometheus metrics while running your app

   ```bash
   daprd --app-id myapp --enable-metrics
   ```

5. Listen to IPv4 and IPv6 loopback only

   ```bash
   daprd --app-id myapp --dapr-listen-addresses '127.0.0.1,[::1]'
   ```
