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

Dapr can be initialized [with Docker]({{< ref self-hosted-with-docker.md >}}) (default) or in [slim-init mode]({{< ref self-hosted-no-docker.md >}}). It can also be initialized and run in [offline or airgap environments]({{< ref self-hosted-airgap.md >}}). 

{{% alert title="Note" color="warning" %}}
You can also use [Podman](https://podman.io/) in place of Docker as container runtime. Please refer [dapr init with Podman]({{< ref self-hosted-with-podman.md >}}) for more details. It can be useful in the scenarios where docker cannot be installed due to various networking constraints.
{{% /alert %}}

The default Docker setup provides out of the box functionality with the following containers and configuration:
- A Redis container configured to serve as the default component for both state management and publish/subscribe.
- A Zipkin container for diagnostics and tracing.
- A default Dapr configuration and components installed in `$HOME/.dapr/` (Mac/Linux) or `%USERPROFILE%\.dapr\` (Windows).

The `dapr-placement` service is responsible for managing the actor distribution scheme and key range settings. This service is not launched as a container and is only required if you are using Dapr actors. For more information on the actor `Placement` service read [actor overview]({{< ref "actors-overview.md" >}}).

<img src="/images/overview-standalone-docker.png" width=1000 alt="Diagram of Dapr in self-hosted Docker mode" />

## Launching applications with Dapr

You can use the [`dapr run` CLI command]({{< ref dapr-run.md >}}) to a Dapr sidecar process along with your application. Additional arguments and flags can be found [here]({{< ref arguments-annotations-overview.md >}}).

## Name resolution

Dapr uses a [name resolution component]({{< ref supported-name-resolution >}}) for service discovery within the [service invocation]({{< ref service-invocation >}}) building block. By default Dapr uses mDNS when in self-hosted mode.

If you are running Dapr on virtual machines or where mDNS is not available, then you can use the [HashiCorp Consul]({{< ref setup-nr-consul.md >}}) component for name resolution.
