---
type: docs
title: "daprd"
linkTitle: "daprd"
weight: 100
---

Dapr runs along side of an application as a [sidecar](https://docs.dapr.io/concepts/overview/#sidecar-architecture). This sidecar is exposed as a process or a container depending on the environment it is being hosted on. For self hosted environments, the cli command `dapr run` starts the sidecar and for kubernetes environment dapr-sidecar-injector does that. Both of these are basically wrappers around the sidecar process - daprd. daprd is present in your dapr/bin folder

Most of the time one would not need to use daprd explicitly as long as sidecar is being started by one of the above dapr methods. However, there could be use cases where a one would want to use daprd explicity. For example, while debugging, to find the application the sidecar is attached to or if the environment being used makes it unfeasible to use `dapr run`. The section below explores examples to use daprd along with some of its arguments.

## Usage

daprd can be used with many arguments for different scenarios. To know the list of all the arguments you can run a cli command `~/.dapr/bin/daprd --help` or checkout this [table](https://docs.dapr.io/reference/arguments-annotations-overview/) for comprehensive comparison between daprd options with cli and K8 annotation options

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


