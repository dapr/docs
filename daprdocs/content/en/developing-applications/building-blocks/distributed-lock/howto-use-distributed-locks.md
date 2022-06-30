---
type: docs
title: "How-To: Manage configuration from a store"
linkTitle: "How-To: Manage configuration from a store"
weight: 2000
description: "Learn how to get application configuration and subscribe for changes"
---

Now that you've learned what the Dapr distributed lock API building block provides, learn how it can work in your service. The code example below describes an application that XXXXXX. This example uses the Redis lock component to demonstrate how to lock resources.

<img src="/images/building-block-distributed-lock-example.png" width=1000 alt="Diagram showing using a lock from multiple application instances">

### Configure a lock component

Save the following component file to the [default components folder]({{< ref "install-dapr-selfhost.md#step-5-verify-components-directory-has-been-initialized" >}}) on your machine.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: lock
spec:
  type: lock.redis
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: <PASSWORD>
```

### Get configuration items using Dapr SDKs

{{< tabs Dotnet Java Python>}}

{{% codetab %}}

```csharp

```

{{% /codetab %}}

{{% codetab %}}

```java

```

{{% /codetab %}}

{{% codetab %}}

```python

```

{{% /codetab %}}

{{< /tabs >}}


## Next steps

* Read [distributed lock API overview]({{< ref distributed-lock-api-overview.md >}})