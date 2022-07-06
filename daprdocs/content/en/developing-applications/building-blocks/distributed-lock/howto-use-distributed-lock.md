---
type: docs
title: "How-To: Use a lock"
linkTitle: "How-To: Use a lock"
weight: 2000
description: "Learn how to use distributed locks to provide exclusive access to a resource"
---

Now that you've learned what the Dapr distributed lock API building block provides, learn how it can work in your service. The example below describes an application that aquires a lock. This example uses the Redis lock component to demonstrate how to lock resources.

<img src="/images/building-block-lock-example.png" width=1000 alt="Diagram showing aquiring a lock from multiple instances of same application">
<img src="/images/building-block-lock-unlock-example.png" width=1000 alt="Diagram showing releasing a lock from multiple instances of same application">
<img src="/images/building-block-lock-multiple-example.png" width=1000 alt="Diagram showing aquiring multiple locks from different applications">

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