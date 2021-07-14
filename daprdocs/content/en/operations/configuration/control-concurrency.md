---
type: docs
title: "How-To: Control concurrency and rate limit applications"
linkTitle: "Concurrency & rate limits"
weight: 2000
description: "Control how many requests and events will invoke your application simultaneously"
---

A common scenario in distributed computing is to only allow for a given number of requests to execute concurrently.
Using Dapr, you can control how many requests and events will invoke your application simultaneously.

*Note that this rate limiing is guaranteed for every event that's coming from Dapr, meaning Pub/Sub events, direct invocation from other services, bindings events etc. Dapr can't enforce the concurrency policy on requests that are coming to your app externally.*

*Note that rate limiting per second can be achieved by using the **middleware.http.ratelimit** middleware. However, there is an imporant difference between the two approaches. The rate limit middlware is time bound and limits the number of requests per second, while the `app-max-concurrency` flag specifies the number of concurrent requests (and events) at any point of time. See [Rate limit middleware]({{< ref middleware-rate-limit.md >}}). *

Watch this [video](https://youtu.be/yRI5g6o_jp8?t=1710) on how to control concurrency and rate limiting ".
<iframe width="764" height="430" src="https://www.youtube.com/embed/yRI5g6o_jp8?t=1710" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Setting app-max-concurrency

Without using Dapr, a developer would need to create some sort of a semaphore in the application and take care of acquiring and releasing it.
Using Dapr, there are no code changes needed to an app.

### Setting app-max-concurrency in Kubernetes

To set app-max-concurrency in Kubernetes, add the following annotation to your pod:

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
...
```

### Setting app-max-concurrency using the Dapr CLI

To set app-max-concurrency with the Dapr CLI for running on your local dev machine, add the `app-max-concurrency` flag:

```bash
dapr run --app-max-concurrency 1 --app-port 5000 python ./app.py
```

The above examples will effectively turn your app into a single concurrent service.
