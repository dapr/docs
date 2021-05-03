---
type: docs
title: "Overview of Dapr in self-hosted mode"
linkTitle: "Overview"
weight: 10000
description: "Overview of how to get Dapr running on a Windows/Linux/MacOS machine"
---

## Overview

Dapr can be configured to run in self-hosted mode on your local developer machine or on production VMs. Each running service has a Dapr runtime process (or sidecar) which is configured to use state stores, pub/sub, binding components and the other building blocks. 

## Initialization

Dapr can be initialized [with Docker]({{< ref self-hosted-with-docker.md >}}) (default) or in [slim-init mode]({{< ref self-hosted-no-docker.md >}}). The default Docker setup provides out of the box functionality with the following containers and configuration:
- A Redis container configured to serve as the default component for both state management and publish/subscribe.
- A Zipkin container for diagnostics and tracing.
- A default Dapr configuration and components installed in `$HOME/.dapr/` (Mac/Linux) or `%USERPROFILE%\.dapr\` (Windows).

The `dapr-placement` service is responsible for managing the actor distribution scheme and key range settings. This service is not launched as a container and is only required if you are using Dapr actors. For more information on the actor `Placement` service read [actor overview]({{< ref "actors-overview.md" >}}). 

<img src="/images/overview-standalone-docker.png" width=1000 alt="Diagram of Dapr in self-hosted Docker mode" />

## Launching applications with Dapr

You can use the [`dapr run` CLI command]({{< ref dapr-run.md >}}) to a Dapr sidecar process along with your application.

