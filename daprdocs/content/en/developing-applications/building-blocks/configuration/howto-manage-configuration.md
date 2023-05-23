---
type: docs
title: "How-To: Manage configuration from a store"
linkTitle: "How-To: Manage configuration from a store"
weight: 2000
description: "Learn how to get application configuration and subscribe for changes"
---

This example uses the Redis configuration store component to demonstrate how to retrieve a configuration item.

<img src="/images/building-block-configuration-example.png" width=1000 alt="Diagram showing get configuration of example service">

{{% alert title="Note" color="primary" %}}
 If you haven't already, [try out the configuration quickstart]({{< ref configuration-quickstart.md >}}) for a quick walk-through on how to use the configuration API.

{{% /alert %}}


## Create a configuration item in store

Create a configuration item in a supported configuration store. This can be a simple key-value item, with any key of your choice. As mentioned earlier, this example uses the Redis configuration store component.

### Run Redis with Docker

```
docker run --name my-redis -p 6379:6379 -d redis:6
```

### Save an item 

Using the [Redis CLI](https://redis.com/blog/get-redis-cli-without-installing-redis-server/), connect to the Redis instance:

```
redis-cli -p 6379 
```

Save a configuration item:

```
MSET orderId1 "101||1" orderId2 "102||1"
```

## Configure a Dapr configuration store

Save the following component file to the [default components folder]({{< ref "install-dapr-selfhost.md#step-5-verify-components-directory-has-been-initialized" >}}) on your machine. You can use this as the Dapr component YAML:

- For Kubernetes using `kubectl`.
- When running with the Dapr CLI. 

{{% alert title="Note" color="primary" %}}
 Since the Redis configuration component has identical metadata to the Redis `statestore.yaml` component, you can simply copy/change the Redis state store component type if you already have a Redis `statestore.yaml`. 

{{% /alert %}}

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: configstore
spec:
  type: configuration.redis
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: <PASSWORD>
```

## Retrieve Configuration Items
### Get configuration items

The following example shows how to Get a saved configuration item using the Dapr Configuration API.

{{< tabs ".NET" Java Python Go Javascript "HTTP API (BASH)" "HTTP API (Powershell)">}}

{{% codetab %}}

```csharp
//dependencies
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapr.Client;

//code
namespace ConfigurationApi
{
    public class Program
    {
        private static readonly string CONFIG_STORE_NAME = "configstore";

        public static async Task Main(string[] args)
        {
            using var client = new DaprClientBuilder().Build();
            var configuration = await client.GetConfiguration(CONFIG_STORE_NAME, new List<string>() { "orderId1", "orderId2" });
            Console.WriteLine($"Got key=\n{configuration[0].Key} -> {configuration[0].Value}\n{configuration[1].Key} -> {configuration[1].Value}");
        }
    }
}
```

{{% /codetab %}}

{{% codetab %}}

```java
//dependencies
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.ConfigurationItem;
import io.dapr.client.domain.GetConfigurationRequest;
import io.dapr.client.domain.SubscribeConfigurationRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

//code
private static final String CONFIG_STORE_NAME = "configstore";

public static void main(String[] args) throws Exception {
    try (DaprPreviewClient client = (new DaprClientBuilder()).buildPreviewClient()) {
      List<String> keys = new ArrayList<>();
      keys.add("orderId1");
      keys.add("orderId2");
      GetConfigurationRequest req = new GetConfigurationRequest(CONFIG_STORE_NAME, keys);
      try {
        Mono<List<ConfigurationItem>> items = client.getConfiguration(req);
        items.block().forEach(ConfigurationClient::print);
      } catch (Exception ex) {
        System.out.println(ex.getMessage());
      }
    }
}
```

{{% /codetab %}}

{{% codetab %}}

```python
#dependencies
from dapr.clients import DaprClient
#code
with DaprClient() as d:
        CONFIG_STORE_NAME = 'configstore'
        keys = ['orderId1', 'orderId2']
        #Startup time for dapr
        d.wait(20)
        configuration = d.get_configuration(store_name=CONFIG_STORE_NAME, keys=[keys], config_metadata={})
        print(f"Got key={configuration.items[0].key} value={configuration.items[0].value} version={configuration.items[0].version}")
```

{{% /codetab %}}

{{% codetab %}}

```go
package main

import (
	"context"
  "fmt"

	dapr "github.com/dapr/go-sdk/client"
)

func main() {
	ctx := context.Background()
	client, err := dapr.NewClient()
	if err != nil {
		panic(err)
	}
	items, err := client.GetConfigurationItems(ctx, "configstore", ["orderId1","orderId2"])
	if err != nil {
		panic(err)
	}
  for key, item := range items {
    fmt.Printf("get config: key = %s value = %s version = %s",key,(*item).Value, (*item).Version)
  }
}
```

{{% /codetab %}}

{{% codetab %}}

Launch a dapr sidecar:

```bash
dapr run --app-id orderprocessing --dapr-http-port 3601
```

In a separate terminal, get the configuration item saved earlier:

```bash
curl http://localhost:3601/v1.0/configuration/configstore?key=orderId1
```

{{% /codetab %}}

{{% codetab %}}

Launch a Dapr sidecar:

```bash
dapr run --app-id orderprocessing --dapr-http-port 3601
```

In a separate terminal, get the configuration item saved earlier:

```powershell
Invoke-RestMethod -Uri 'http://localhost:3601/v1.0/configuration/configstore?key=orderId1'
```

{{% /codetab %}}

{{< /tabs >}}


### Subscribe to configuration item updates

Below are code examples that leverage SDKs to subscribe to keys `[orderId1, orderId2]` using `configstore` store component. 

{{< tabs ".NET", "ASP.NET Core", Java, Python, Go, Javascript>}}
{{% codetab %}}

```csharp
public static void Main(string[] args)
{
    CreateHostBuilder(args).Build().Run();
}

public static IHostBuilder CreateHostBuilder(string[] args)
{
    var client = new DaprClientBuilder().Build();
    return Host.CreateDefaultBuilder(args)
        .ConfigureAppConfiguration(config =>
        {
            // Get the initial value from the configuration component.
            config.AddDaprConfigurationStore("redisconfig", new List<string>() { "withdrawVersion" }, client, TimeSpan.FromSeconds(20));

            // Watch the keys in the configuration component and update it in local configurations.
            config.AddStreamingDaprConfigurationStore("redisconfig", new List<string>() { "withdrawVersion", "source" }, client, TimeSpan.FromSeconds(20));
        })
        .ConfigureWebHostDefaults(webBuilder =>
        {
            webBuilder.UseStartup<Startup>();
        });
}
```

{{% /codetab %}}

{{% codetab %}}

```csharp
public IDictionary<string, string> Data { get; set; } = new Dictionary<string, string>();
public string Id { get; set; } = string.Empty;

public async Task WatchConfiguration(DaprClient daprClient, string store, IReadOnlyList<string> keys, Dictionary<string, string> metadata, CancellationToken token = default)
{
    // Initialize the gRPC Stream that will provide configuration updates.
    var subscribeConfigurationResponse = await daprClient.SubscribeConfiguration(store, keys, metadata, token);

    // The response contains a data source which is an IAsyncEnumerable, so it can be iterated through via an awaited foreach.
    await foreach (var items in subscribeConfigurationResponse.Source.WithCancellation(token))
    {
        // Each iteration from the stream can contain all the keys that were queried for, so it must be individually iterated through.
        var data = new Dictionary<string, string>(Data);
        foreach (var item in items)
        {
            // The Id in the response is used to unsubscribe.
            Id = subscribeConfigurationResponse.Id;
            data[item.Key] = item.Value;
        }
        Data = data;
    }
}
```

{{% /codetab %}}

{{% codetab %}}
```python
#dependencies
from dapr.clients import DaprClient
#code

def handler(id: str, resp: ConfigurationResponse):
    for key in resp.items:
        print(f"Subscribed item received key={key} value={resp.items[key].value} "
              f"version={resp.items[key].version} "
              f"metadata={resp.items[key].metadata}", flush=True)

def executeConfiguration():
    with DaprClient() as d:
        storeName = 'configurationstore'
        keys = ['orderId1', 'orderId2']
        id = d.subscribe_configuration(store_name=storeName, keys=keys,
                          handler=handler, config_metadata={})
        print("Subscription ID is", id, flush=True)
        sleep(20)

executeConfiguration()
```

Run the subscriber app along with Dapr Sidecar

```bash
dapr run --app-id orderprocessing -- python3 OrderProcessingService.py
```

In another terminal, update a key using redis-cli:

```bash
redis-cli -p 6379 MSET orderId1 "201||1" orderId2 "202||1"
```

Verify that the subscriber receives the updates:
```
Subscribed item received key=orderId1 value=201 version=1 metadata={}
Subscribed item received key=orderId2 value=202 version=1 metadata={}
```

{{% /codetab %}}

{{% codetab %}}
```go 
package main

import (
	"context"
  "fmt"
  "time"

	dapr "github.com/dapr/go-sdk/client"
)

func main() {
	ctx := context.Background()
	client, err := dapr.NewClient()
	if err != nil {
		panic(err)
	}
  subscribeID, err := client.SubscribeConfigurationItems(ctx, "configstore", []string{"orderId1", "orderId2"}, func(id string, items map[string]*dapr.ConfigurationItem) {
  for k, v := range items {
    fmt.Printf("get updated config key = %s, value = %s version = %s \n", k, v.Value, v.Version)
  }
  })
	if err != nil {
		panic(err)
	}
	time.Sleep(20*time.Second)
}
```

Run the subscriber app along with Dapr sidecar

```bash
dapr run --app-id orderprocessing -- go run main.go
```

In another terminal, update a key using redis-cli:

```bash
redis-cli -p 6379 MSET orderId1 "201||1" orderId2 "202||1"
```

Verify that the subscriber receives the updates:
```
get updated config key=orderId1 value=201 version=1
get updated config key=orderId2 value=202 version=1
```

{{% /codetab %}}
{{< /tabs >}}


### Unsubscribe from configuration item updates

After you've subscribed to watch configuration items, you will receive updates for all of the subscribed keys. To stop receiving updates, you need to explicitly call the unsubscribe API.

Following are the code examples unsubscribing using the subscription ID:

{{< tabs Dotnet Java Python Go Javascript "HTTP API (BASH)" "HTTP API (Powershell)">}}

{{% codetab %}}
```python
with DaprClient() as d:
  isSuccess = d.unsubscribe_configuration(store_name='configstore', id=subscriptionID)
  print(f"Unsubscribed successfully? {isSuccess}", flush=True)
```
{{% /codetab %}}

{{% codetab %}}
```go
if err := client.UnsubscribeConfigurationItems(ctx, "configstore" , subscriptionID); err != nil {
  panic(err)
}
```
{{% /codetab %}}

{{% codetab %}}
```bash
curl 'http://localhost:3601/v1.0/configuration/configstore/<subscription-id>/unsubscribe'
```
{{% /codetab %}}

{{% codetab %}}
```powershell
Invoke-RestMethod -Uri 'http://localhost:3601/v1.0/configuration/configstore/<subscription-id>/unsubscribe'
```
{{% /codetab %}}

## Next steps

* Read [configuration API overview]({{< ref configuration-api-overview.md >}})