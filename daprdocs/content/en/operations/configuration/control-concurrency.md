---
type: docs
title: "How-To: Control concurrency and rate limit applications"
linkTitle: "Concurrency & rate limits"
weight: 2000
description: "Learn how to control how many requests and events can invoke your application simultaneously"
---

Typically, in distributed computing, you may only want to allow for a given number of requests to execute concurrently. Using Dapr's `app-max-concurrency`, you can control how many requests and events can invoke your application simultaneously.

Default `app-max-concurreny` is set to `-1`, meaning no concurrency limit is enforced.

## Different approaches

Dapr provides several approaches to concurrency and rate limiting. It's important to understand the differences:

| Approach | What it controls | Scope |
|----------|-----------------|-------|
| `app-max-concurrency` | Max concurrent requests and events to an app | Per-sidecar |
| `middleware.http.ratelimit` | HTTP requests per second by remote IP | Per-sidecar |
| [Workflow concurrency limits]({{% ref workflow-concurrency.md %}}) | Workflow and activity executions, with per-name granularity | Per-sidecar or global (across all replicas) |

This guide focuses on `app-max-concurrency`. See [Rate limit middleware]({{% ref middleware-rate-limit.md %}}) and [Workflow Concurrency Limits]({{% ref workflow-concurrency.md %}}) for the other approaches.

## Demo

Watch this [video](https://youtu.be/yRI5g6o_jp8?t=1710) on how to control concurrency and rate limiting.

{{< youtube id=yRI5g6o_jp8 start=1710 >}}

## Configure `app-max-concurrency`

Without using Dapr, you would need to create some sort of a semaphore in the application and take care of acquiring and releasing it.

Using Dapr, you don't need to make any code changes to your application.

Select how you'd like to configure `app-max-concurrency`.

{{< tabpane text=true >}}

 <!-- CLI -->
{{% tab "CLI" %}}

To set concurrency limits with the Dapr CLI for running on your local dev machine, add the `app-max-concurrency` flag:

```bash
dapr run --app-max-concurrency 1 --app-port 5000 python ./app.py
```

The above example effectively turns your app into a sequential processing service.

{{% /tab %}}

 <!-- Kubernetes -->
{{% tab "Kubernetes" %}}

To configure concurrency limits in Kubernetes, add the following annotation to your pod:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodesubscriber
  namespace: default
  labels:
    app: nodesubscriber
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nodesubscriber
  template:
    metadata:
      labels:
        app: nodesubscriber
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "nodesubscriber"
        dapr.io/app-port: "3000"
        dapr.io/app-max-concurrency: "1"
#...
```

{{% /tab %}}

{{< /tabpane >}}

## Limitations

### Controlling concurrency on external requests
Rate limiting is guaranteed for every event coming _from_ Dapr, including pub/sub events, direct invocation from other services, bindings events, etc. However, Dapr can't enforce the concurrency policy on requests that are coming _to_ your app externally.

## Related links

[Arguments and annotations]({{% ref arguments-annotations-overview.md %}})

## Next steps

{{< button text="Limit secret store access" page="secret-scope.md" >}}
