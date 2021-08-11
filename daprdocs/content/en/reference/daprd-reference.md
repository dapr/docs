---
type: docs
title: "daprd reference"
linkTitle: "daprd reference"
weight: 300
description: "Detailed information on daprd and usage"
---

## Overview

The daprd process is what you think of as "Dapr". It is the process that offers the various Dapr [building blocks]({{< ref building-blocks >}}) through HTTP and gRPC APIs to your application.

The daprd process runs alongside your application as a [sidecar]({{< ref "overview.md#sidecar-architecture" >}}), either as a process in a self-hosted environment or as a container within the application pods in a Kubernetes environment.

## Installation

When initializing Dapr in self-hosted mode via `dapr init`, the daprd binary is installed to the`.dapr/bin` directory within your home directory. Running `dapr run` will launch a daprd process alongside your application.

On Kubernetes, `dapr init -k` will install the [dapr-sidecar-injector service]({{< ref kubernetes-overview.md >}}), which will watch for new pods with the `dapr.io/enabled` annotation and inject a container with the daprd process within the pod.

In most cases you would not need to run daprd explicitly, as the sidecar is either launched by the CLI (self-hosted mode) or by the Dapr control plane (Kubernetes). Examples of times when launching daprd directly may be useful include debugging, to find the application the sidecar is attached to or if the environment being used makes it unfeasible to use `dapr run` (e.g. automating sidecar launch on a VM) .

For a detailed list of all available arguments run `daprd --help` or see this [table]({{< ref arguments-annotations-overview.md >}}).

### Examples

1. Start a sidecar along an application by specifying its unique ID. Note `--app-id` is a required field:

```bash
~/.dapr/bin/daprd --app-id myapp
```

2. Specify the port your application is listening to

```bash
~/.dapr/bin/daprd --app-id --app-port 5000
```
3. If you are using several custom components and want to specify the location of the component definition files, use the `--components-path` argument:

```bash
~/.dapr/bin/daprd --app-id myapp --components-path ~/.dapr/components
```

4. Enable collection of Prometheus metrics while running your app

```bash
~/.dapr/bin/daprd --app-id myapp --enable-metrics
```
