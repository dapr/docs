---
type: docs
title: "How-To: Use a lock"
linkTitle: "How-To: Use a lock"
weight: 2000
description: "Learn how to use distributed locks to provide exclusive access to a resource"
---

Now that you've learned what the Dapr distributed lock API building block provides, learn how it can work in your service. In this guide, an example application acquires a lock using the Redis lock component to demonstrate how to lock resources. For a list of supported lock stores, see [this reference page](/reference/components-reference/supported-locks/).

In the diagram below, two instances of the same application acquire a lock, where one instance is successful and the other is denied.

<img src="/images/building-block-lock-example.png" width=1000 alt="The diagram below shows two instances of the same application acquiring a lock, where one instance is successful and the other is denied">

The diagram below shows two instances of the same application, where one instance releases the lock and the other instance is then able to acquire the lock.

<img src="/images/building-block-lock-unlock-example.png" width=1000 alt="Diagram showing releasing a lock from multiple instances of same application">

The diagram below shows two instances of different applications, acquiring different locks on the same resource.

<img src="/images/building-block-lock-multiple-example.png" width=1000 alt="The diagram below shows two instances of different applications, acquiring different locks on the same resource">

### Configure a lock component

Save the following component file to the [default components folder]({{< ref "install-dapr-selfhost.md#step-5-verify-components-directory-has-been-initialized" >}}) on your machine.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: lockstore
spec:
  type: lock.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: <PASSWORD>
```

### Acquire lock

{{< tabs HTTP Dotnet Go >}}

{{% codetab %}}

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/lock/lockstore
   -H 'Content-Type: application/json'
   -d '{"resourceId":"my_file_name", "lockOwner":"random_id_abc123", "expiryInSeconds": 60}'
```

{{% /codetab %}}

{{% codetab %}}

```csharp
using System;
using Dapr.Client;

namespace LockService
{
    class Program
    {
        [Obsolete("Distributed Lock API is in Alpha, this can be removed once it is stable.")]
        static async Task Main(string[] args)
        {
            string DAPR_LOCK_NAME = "lockstore";
            string fileName = "my_file_name";
            var client = new DaprClientBuilder().Build();
    
            await using (var fileLock = await client.Lock(DAPR_LOCK_NAME, fileName, "random_id_abc123", 60))
            {
                if (fileLock.Success)
                {
                    Console.WriteLine("Success");
                }
                else
                {
                    Console.WriteLine($"Failed to lock {fileName}.");
                }
            }
        }
    }
}
```

{{% /codetab %}}

{{% codetab %}}

```go
package main

import (
    "fmt"

    dapr "github.com/dapr/go-sdk/client"
)

func main() {
    client, err := dapr.NewClient()
    if err != nil {
        panic(err)
    }
    defer client.Close()
    
    resp, err := client.TryLockAlpha1(ctx, "lockstore", &dapr.LockRequest{
			LockOwner:         "random_id_abc123",
			ResourceID:      "my_file_name",
			ExpiryInSeconds: 60,
		})

    fmt.Println(resp.Success)
}
```

{{% /codetab %}}

{{< /tabs >}}

### Unlock existing lock

{{< tabs HTTP Dotnet Go >}}

{{% codetab %}}

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/unlock/lockstore
   -H 'Content-Type: application/json'
   -d '{"resourceId":"my_file_name", "lockOwner":"random_id_abc123"}'
```

{{% /codetab %}}

{{% codetab %}}

```csharp
using System;
using Dapr.Client;

namespace LockService
{
    class Program
    {
        static async Task Main(string[] args)
        {
            string DAPR_LOCK_NAME = "lockstore";
            var client = new DaprClientBuilder().Build();

            var response = await client.Unlock(DAPR_LOCK_NAME, "my_file_name", "random_id_abc123"));
            Console.WriteLine(response.status);
        }
    }
}
```

{{% /codetab %}}

{{% codetab %}}

```go
package main

import (
    "fmt"

    dapr "github.com/dapr/go-sdk/client"
)

func main() {
    client, err := dapr.NewClient()
    if err != nil {
        panic(err)
    }
    defer client.Close()
    
    resp, err := client.UnlockAlpha1(ctx, "lockstore", &UnlockRequest{
			LockOwner:    "random_id_abc123",
			ResourceID: "my_file_name",
		})

    fmt.Println(resp.Status)
}
```

{{% /codetab %}}

{{< /tabs >}}

## Next steps

Read [the distributed lock API overview]({{< ref distributed-lock-api-overview.md >}}) to learn more.