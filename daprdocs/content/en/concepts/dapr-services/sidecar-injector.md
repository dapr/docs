---
type: docs
title: "Dapr Sidecar Injector control plane service overview"
linkTitle: "Sidecar injector"
description: "Overview of the Dapr sidecar injector process"
---

When running Dapr in [Kubernetes mode]({{< ref kubernetes >}}), a pod is created running the Dapr Sidecar Injector service, which looks for pods initialized with the [Dapr annotations]({{< ref arguments-annotations-overview.md >}}), and then creates another container in that pod for the [daprd service]({{< ref sidecar >}})

## Running the sidecar injector

The sidecar injector service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{< ref kubernetes >}}).

