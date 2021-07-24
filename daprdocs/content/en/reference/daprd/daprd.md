---
type: docs
title: "daprd"
linkTitle: "daprd"
weight: 100
---

Dapr runs along side an application as a [sidecar](https://docs.dapr.io/concepts/overview/#sidecar-architecture). The sidecar is in practice a process running in the same environment as the application or in a separate container depending on where the application is hosted. For a self-hosted environment, the CLI command `dapr run` starts the sidecar as a process and for a Kubernetes environment the dapr-sidecar-injector does injects a container with a daprd process into the application's pod. After installing Dapr locally on your machine the `dapr init` command places the `daprd` executable in `.dapr/bin` under your home directory.

In most cases you would not need to run daprd explicitly, as the sidecar is either launched by the CLI (self-hosted mode) or by the Dapr control plane (Kubernetes). Examples of times when launching daprd directly may be useful include debugging, to find the application the sidecar is attached to or if the environment being used makes it unfeasible to use `dapr run` (e.g. automating sidecar launch on a VM) .

## Usage examples

daprd can be used with several arguments in different scenarios. For a detailed list of all available arguments run: `daprd --help` or see this [table](https://docs.dapr.io/reference/arguments-annotations-overview/) for a comprehensive comparison between daprd options with CLI and Kubernestes annotation options.

1. Start a sidecar along an application by specifying its unique ID. This is a required field

```bash
~/.dapr/bin/daprd --app-id myapp
```

2. Specify the port your application is listening to

```bash
~/.dapr/bin/daprd --app-id --app-port 5000
```
3. If you are using many different components and want your app to be pointed to a specific one, you can specify the component directory dapr should look into

```bash
~/.dapr/bin/daprd --app-id myapp --components-path ~/.dapr/components
```

4. Enable collection of Prometheus metrics while running your app

```bash
~/.dapr/bin/daprd --app-id myapp --enable-metrics
```
