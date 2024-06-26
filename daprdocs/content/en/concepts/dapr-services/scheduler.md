---
type: docs
title: "Dapr Scheduler control plane service overview"
linkTitle: "Scheduler"
description: "Overview of the Dapr scheduler service"
---

The Dapr Scheduler service is used to schedule jobs, running in [self-hosted mode]({{< ref self-hosted >}}) or on [Kubernetes]({{< ref kubernetes >}}).  

The diagram below shows how the Scheduler service is used via the jobs API when called from your application. All the jobs that are tracked by the Scheduler service are stored in an embedded Etcd database. 

<img src="/images/scheduler/scheduler-architecture.png" alt="Diagram showing the Scheduler control plane service and the jobs API">

## Self-hosted mode

The Scheduler service Docker container is started automatically as part of `dapr init`. It can also be run manually as a process if you are running in [slim-init mode]({{< ref self-hosted-no-docker.md >}}).

## Kubernetes mode

The Scheduler service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{< ref kubernetes >}}).

## Related links

[Learn more about the Jobs API.]({{< ref jobs_api.md >}})