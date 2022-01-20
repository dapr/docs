---
type: docs
title: "How-To: Manage configuration from a store"
linkTitle: "How-To: Manage configuration from a store"
weight: 2000
description: "Learn how to get application configuration and subscribe for changes"
---

## Introduction
This HowTo uses the Redis configuration store component as an example on how to retrieve a configuration item.

*This API is currently in `Alpha` state and only available on gRPC. An HTTP1.1 supported version with this URL syntax `/v1.0/configuration` will be available before the API is certified into `Stable` state.*

## Example:

The below code examples loosely describe an application that processes orders. In the examples, there is an order processing service which has a Dapr sidecar. The order processing service uses Dapr to get the configuration from redis configuration store.

<img src="/images/building-block-configuration-example.png" width=1000 alt="Diagram showing get configuration of example service">

## Step 1: Create a configuration item in store

First, create a configuration item in a supported configuration store. This can be a simple key-value item, with any key of your choice. For this example, we'll use the Redis configuration store component.

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
SET orderId "100||1"
```

### Configure a Dapr configuration store

Save the following component file, for example to the [default components folder]({{<ref "install-dapr-selfhost.md#step-5-verify-components-directory-has-been-initialized">}}) on your machine. You can use this as the Dapr component YAML for Kubernetes using `kubectl` or when running with the Dapr CLI. Note: The Redis configuration component has identical metadata to the Redis state store component, so you can simply copy and change the Redis state store component type if you already have a Redis state store YAML file. 

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: configurationstore
spec:
  type: configuration.redis
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: <PASSWORD>
```

### Get configuration items using gRPC API

Using your [favorite language](https://grpc.io/docs/languages/), create a Dapr gRPC client from the [Dapr proto](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto).

{{< tabs Dotnet Java Python Javascript >}}

{{% codetab %}}
```csharp

var call = client.GetConfigurationAlpha1(new GetConfigurationRequest { StoreName = "redisconfigstore", Keys = new String[]{"myconfig"} });
```
{{% /codetab %}}

{{% codetab %}}
```java

Dapr.ServiceBlockingStub stub = Dapr.newBlockingStub(channel);
stub.GetConfigurationAlpha1(new GetConfigurationRequest{ StoreName = "redisconfigstore", Keys = new String[]{"myconfig"} });
```
{{% /codetab %}}

{{% codetab %}}
```python
#dependencies
from dapr.clients import DaprClient
#code
with DaprClient() as d:
        storeName = 'configurationstore'
        key = 'orderId'
        d.wait(20)
        configuration = d.get_configuration(store_name=storeName, keys=[key], config_metadata={})
        print(f"Got key={configuration.items[0].key} value={configuration.items[0].value} version={configuration.items[0].version}")
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing python3 OrderProcessingService.py
```

{{% /codetab %}}

{{< /tabs >}}

### Watch configuration items

Create a Dapr gRPC client from the [Dapr proto](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto) using your [preferred language](https://grpc.io/docs/languages/). Then use the proto method `SubscribeConfigurationAlpha1` on your client stub to start subscribing to events. The method accepts the following request object:

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

## Next steps
* Read [configuration API overview]({{< ref configuration-api-overview.md >}})
