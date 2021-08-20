---
type: docs
title: "Dapr placement service overview"
linkTitle: "Placement"
description: "Overview of the Dapr placement process"
---

The Dapr placement service is used to calculate and distribute distributed hash tables for the location of [Dapr actors]({{< ref actors >}}) running in [self-hosted mode]({{< ref self-hosted >}}) or on [Kubernetes]({{< ref kubernetes >}}). This hash table maps actor IDs to pods or processes so a Dapr application can communicate with the actor.Anytime a Dapr application activates a Dapr actor, the placement updates the hash tables with the latest actor locations.

## Self-hosted mode

The placement service Docker container is started automatically as part of [`dapr init`]({{< ref self-hosted-with-docker.md >}}). It can also be run manually as a process if you are running in [slim-init mode]({{< ref self-hosted-no-docker.md >}}).

## Kubernetes mode

The placement service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{< ref kubernetes >}}).
