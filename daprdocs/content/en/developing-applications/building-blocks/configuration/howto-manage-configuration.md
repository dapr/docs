---
type: docs
title: "How-To: Manage configuration from a store"
linkTitle: "How-To: Manage configuration from a store"
weight: 2000
description: "Learn how to get application configuration and subscribe for changes"
---

This example uses the Redis configuration store component to demonstrate how to retrieve a configuration item.

{{% alert title="Note" color="primary" %}}
This API is currently in `Alpha` state and only available on gRPC. An HTTP1.1 supported version with this URL syntax `/v1.0/configuration` will be available before the API is certified into `Stable` state.

{{% /alert %}}

<img src="/images/building-block-configuration-example.png" width=1000 alt="Diagram showing get configuration of example service">

## Create a configuration item in store

Create a configuration item in a supported configuration store. This can be a simple key-value item, with any key of your choice. As mentioned earlier, this example uses the Redis configuration store component.

### Run Redis with Docker

```
docker run --name my-redis -p 6379:6379 -d redis
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

### Configure a Dapr configuration store

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

### Get configuration items using Dapr SDKs

{{< tabs Dotnet Java Python>}}

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

        [Obsolete]
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

{{< /tabs >}}

### Get configuration items using gRPC API

Using your [favorite language](https://grpc.io/docs/languages/), create a Dapr gRPC client from the [Dapr proto](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto). The following examples show Java, C#, Python and Javascript clients.

{{< tabs Java Dotnet Python Javascript >}}

{{% codetab %}}

```java

Dapr.ServiceBlockingStub stub = Dapr.newBlockingStub(channel);
stub.GetConfigurationAlpha1(new GetConfigurationRequest{ StoreName = "redisconfigstore", Keys = new String[]{"myconfig"} });
```

{{% /codetab %}}

{{% codetab %}}

```csharp

var call = client.GetConfigurationAlpha1(new GetConfigurationRequest { StoreName = "redisconfigstore", Keys = new String[]{"myconfig"} });
```

{{% /codetab %}}

{{% codetab %}}

```python
response = stub.GetConfigurationAlpha1(request={ StoreName: 'redisconfigstore', Keys = ['myconfig'] })
```

{{% /codetab %}}

{{% codetab %}}

```javascript
client.GetConfigurationAlpha1({ StoreName: 'redisconfigstore', Keys = ['myconfig'] })
```

{{% /codetab %}}

{{< /tabs >}}

#### Watch configuration items

Create a Dapr gRPC client from the [Dapr proto](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto) using your [preferred language](https://grpc.io/docs/languages/). Use the `SubscribeConfigurationAlpha1` proto method on your client stub to start subscribing to events. The method accepts the following request object:

```proto
message SubscribeConfigurationRequest {
  // The name of configuration store.
  string store_name = 1;

  // Optional. The key of the configuration item to fetch.
  // If set, only query for the specified configuration items.
  // Empty list means fetch all.
  repeated string keys = 2;

  // The metadata which will be sent to configuration store components.
  map<string,string> metadata = 3;
}
```

Using this method, you can subscribe to changes in specific keys for a given configuration store. gRPC streaming varies widely based on language - see the [gRPC examples here](https://grpc.io/docs/languages/) for usage.

Below are the examples in sdks:

{{< tabs Python>}}

{{% codetab %}}
```python
#dependencies
import asyncio
from dapr.clients import DaprClient
#code
async def executeConfiguration():
    with DaprClient() as d:
        CONFIG_STORE_NAME = 'configstore'
        key = 'orderId'
        # Subscribe to configuration by key.
        configuration = await d.subscribe_configuration(store_name=CONFIG_STORE_NAME, keys=[key], config_metadata={})
        if configuration != None:
            items = configuration.get_items()
            for item in items:
                print(f"Subscribe key={item.key} value={item.value} version={item.version}", flush=True)
        else:
            print("Nothing yet")
asyncio.run(executeConfiguration())
```

```bash
dapr run --app-id orderprocessing --components-path components/ -- python3 OrderProcessingService.py
```

{{% /codetab %}}

{{< /tabs >}}

#### Stop watching configuration items

After you've subscribed to watch configuration items, the gRPC-server stream starts. Since this stream thread does not close itself, you have to explicitly call the `UnSubscribeConfigurationRequest` API to unsubscribe. This method accepts the following request object:

```proto
// UnSubscribeConfigurationRequest is the message to stop watching the key-value configuration.
message UnSubscribeConfigurationRequest {
  // The name of configuration store.
  string store_name = 1;
  // Optional. The keys of the configuration item to stop watching.
  // Store_name and keys should match previous SubscribeConfigurationRequest's keys and store_name.
  // Once invoked, the subscription that is watching update for the key-value event is stopped
  repeated string keys = 2;
}
```

Using this unsubscribe method, you can stop watching configuration update events. Dapr locates the subscription stream based on the `store_name` and any optional keys supplied and closes it.

## Next steps

* Read [configuration API overview]({{< ref configuration-api-overview.md >}})