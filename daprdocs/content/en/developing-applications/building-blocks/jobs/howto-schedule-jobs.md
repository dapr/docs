---
type: docs
title: "How-To: Schedule jobs"
linkTitle: "How-To: Schedule jobs"
weight: 2000
description: "Learn how to use the jobs API to schedule jobs"
---

Now that you've learned what the [jobs building block]({{< ref jobs-overview.md >}}) provides, let's look at an example of how to use the API. The code example below describes an application that schedules jobs for a **TBD** application.

<!-- 
Include a diagram or image, if possible. 
-->



## Set up the Scheduler service

When you run `dapr init` in either self-hosted mode or on Kubernetes, the Dapr scheduler service is started. 

## Run the Dapr sidecar 

Run the Dapr sidecar alongside your application. 

```bash
dapr run --app-id=jobs --app-port 50070 --app-protocol grpc --log-level debug -- go run main.go
```

## Next steps

- [Learn more about the Scheduler control plane service]({{< ref "concepts/dapr-services/scheduler.md" >}})
- [Jobs API reference]({{< ref jobs_api.md >}})