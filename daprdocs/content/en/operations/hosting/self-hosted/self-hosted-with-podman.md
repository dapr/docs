---
type: docs
title: "How-To: Run Dapr in self-hosted mode with Podman"
linkTitle: "Run with Podman"
weight: 20000
description: "How to deploy and run Dapr in self-hosted mode using Podman"
---

This article provides guidance on running Dapr with Podman on a Windows/Linux/macOS machine or VM.

## Prerequisites

- [Dapr CLI]({{< ref install-dapr-cli.md >}})
- [Podman](https://podman-desktop.io/downloads)

## Initialize Dapr environment

To initialize the Dapr control plane containers and create a default configuration file, run:

```bash
dapr init --container-runtime podman
```

## Run both app and sidecar as a process

The [`dapr run` CLI command]({{< ref dapr-run.md >}}) can be used to launch a Dapr sidecar along with your application:

```bash
dapr run --app-id myapp --app-port 5000 -- dotnet run
```

This command launches both the daprd sidecar and your application.

## Run app as a process and sidecar as a Docker container

Alternately, if you are running Dapr in a Docker container and your app as a process on the host machine, then you need to configure Podman to use the host network so that Dapr and the app can share a localhost network interface.

If you are running Podman on Linux host then you can run the following to launch Dapr:

```shell
podman run --network="host" --mount type=bind,source="$(pwd)"/components,target=/components daprio/daprd:edge ./daprd -app-id <my-app-id> -app-port <my-app-port>
```

Then you can run your app on the host and they should connect over the localhost network interface.

## Uninstall Dapr environment

To uninstall Dapr completely, run:

```bash
dapr uninstall --container-runtime podman --all
```
