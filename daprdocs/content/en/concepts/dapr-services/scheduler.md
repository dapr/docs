---
type: docs
title: "Dapr Scheduler control plane service overview"
linkTitle: "Scheduler"
description: "Overview of the Dapr scheduler process"
---

The Dapr Scheduler service is used to schedule jobs, running in [self-hosted mode]({{< ref self-hosted >}}) or on [Kubernetes]({{< ref kubernetes >}}).  

## Self-hosted mode

The scheduler service Docker container is started automatically as part of `dapr init`. It can also be run manually as a process if you are running in [slim-init mode]({{< ref self-hosted-no-docker.md >}}).

## Kubernetes mode

The scheduler service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{< ref kubernetes >}}).

## Related links

[Learn more about the Jobs API.]({{< ref jobs_api.md >}})