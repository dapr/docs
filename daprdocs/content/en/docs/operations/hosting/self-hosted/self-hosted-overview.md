---
title: "Overview of Dapr in self-hosted mode"
linkTitle: "Overview"
weight: 10000
description: "Overview of how to get Dapr running on your local machine"
---

Dapr can be configured to run on your local developer machine in self hosted mode. Each running service has a Dapr runtime process (or sidecar) which is configured to use state stores, pub/sub, binding components and the other building blocks. 

In self hosted mode, Redis is running locally in a container and is configured to serve as both the default component for state store and for pub/sub. A Zipkin container is also configured for diagnostics and tracing.  After running `dapr init`, see the `$HOME/.dapr/components` directory (Mac/Linux) or `%USERPROFILE%\.dapr\components` on Windows.

The `dapr-placement` service is responsible for managing the actor distribution scheme and key range settings. This service is only required if you are using Dapr actors. For more information on the actor `Placement` service read [actor overview]({{< ref "actors-overview.md" >}}). 

<img src="/images/overview_standalone.png" width=800>

You can use the [Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app) to run a Dapr enabled application on your local machine.