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

{{< tabs .NET Java Python Go Javascript "HTTP API (BASH)" "HTTP API (Powershell)">}}

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
import io.dapr.client.DaprClient;
import io.dapr.client.domain.ConfigurationItem;
import io.dapr.client.domain.GetConfigurationRequest;
import io.dapr.client.domain.SubscribeConfigurationRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

//code
private static final String CONFIG_STORE_NAME = "configstore";

public static void main(String[] args) throws Exception {
    try (DaprClient client = (new DaprClientBuilder()).build()) {
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

```js
import { DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPortDefault = "3500";

async function start() {
  const client = new DaprClient({ daprHost, daprPort: process.env.DAPR_HTTP_PORT ?? daprPortDefault });

  const config = await client.configuration.get("config-store", ["key1", "key2"]);
  console.log(config);

  console.log(JSON.stringify(config));
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
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

{{< tabs .NET "ASP.NET Core" Java Python Go Javascript>}}

{{% codetab %}}

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapr.Client;

const string DAPR_CONFIGURATION_STORE = "configstore";
var CONFIGURATION_KEYS = new List<string> { "orderId1", "orderId2" };
var client = new DaprClientBuilder().Build();

// Subscribe for configuration changes
SubscribeConfigurationResponse subscribe = await client.SubscribeConfiguration(DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS);

// Print configuration changes
await foreach (var items in subscribe.Source)
{
  // First invocation when app subscribes to config changes only returns subscription id
  if (items.Keys.Count == 0)
  {
    Console.WriteLine("App subscribed to config changes with subscription id: " + subscribe.Id);
    subscriptionId = subscribe.Id;
    continue;
  }
  var cfg = System.Text.Json.JsonSerializer.Serialize(items);
  Console.WriteLine("Configuration update " + cfg);
}
```

Navigate to the directory containing the above code, then run the following command to launch both a Dapr sidecar and the subscriber application:

```bash
dapr run --app-id orderprocessing -- dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```csharp
using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Dapr.Client;
using Dapr.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading;

namespace ConfigurationApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("Starting application.");
            CreateHostBuilder(args).Build().Run();
            Console.WriteLine("Closing application.");
        }

        /// <summary>
        /// Creates WebHost Builder.
        /// </summary>
        /// <param name="args">Arguments.</param>
        /// <returns>Returns IHostbuilder.</returns>
        public static IHostBuilder CreateHostBuilder(string[] args)
        {
            var client = new DaprClientBuilder().Build();
            return Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration(config =>
                {
                    // Get the initial value and continue to watch it for changes.
                    config.AddDaprConfigurationStore("configstore", new List<string>() { "orderId1","orderId2" }, client, TimeSpan.FromSeconds(20));
                    config.AddStreamingDaprConfigurationStore("configstore", new List<string>() { "orderId1","orderId2" }, client, TimeSpan.FromSeconds(20));
                    
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
        }
    }
}
```

Navigate to the directory containing the above code, then run the following command to launch both a Dapr sidecar and the subscriber application:

```bash
dapr run --app-id orderprocessing -- dotnet run
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

Navigate to the directory containing the above code, then run the following command to launch both a Dapr sidecar and the subscriber application:

```bash
dapr run --app-id orderprocessing -- python3 OrderProcessingService.py
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

Navigate to the directory containing the above code, then run the following command to launch both a Dapr sidecar and the subscriber application:

```bash
dapr run --app-id orderprocessing -- go run main.go
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