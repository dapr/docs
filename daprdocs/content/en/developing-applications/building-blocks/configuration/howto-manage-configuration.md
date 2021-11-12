---
type: docs
title: "How-To: Manage application configuration"
linkTitle: "How-To: Manage application configuration"
weight: 2000
description: "Learn how to get application configuration and watch for changes"
---

## Introduction

Consuming application configuration is a common task when writing applications and frequently configuration stores are used to manage this configuration data. A configuration item is often dynamic in nature and is tightly coupled to the needs of the application that consumes it. For example, common uses for application configuration include names of secrets that need to be retrieved, different identifiers, partition or consumer IDs, names of databased to connect to etc. These configuration items are typically stored as key-value items in a database.

Dapr provides a [State Management API]({{<ref "state-management-overview.md">}})) that is based on key-value stores. However, application configuration can be changed by either developers or operators at runtime and the developer needs to be notified of these changes in order to take the required action and load the new configuration. Also the configuration data may want to be read only. Dapr's Configuration API allows developers to consume configuration items that are returned as key/value pair and subscribe to changes whenever a configuration item changes.

*This API is currently in `Alpha state` and only available on gRPC. An HTTP1.1 supported version with this URL `/v1.0/configuration` will be available before the API becomes stable. *

This HowTo uses the Redis configuration store component as an exmaple to retrieve a configuration item.

## Step 1: Save a configuration item

First, create a configuration item in a supported configuration store. This can be a simple key-value item, with any key of your choice. For this example, we'll use the Redis configuration store component

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
set myconfig "wookie"
```

### Configure a Dapr configuration store

Save the following file component file, for example to the default components folder on your machine. You can use this as the Dapr component YAML for Kubernetes using kubectl or when running with the Dapr CLI. Hint: The Redis configuration component has identical metadata to the Redis statestore component, so you can simply copy and change the component type if you already have a Redis statestore YAML file. 

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: redisconfiguration
spec:
  type: configuration.redis
  metadata:
  - name: redisHost
    value: localhost:6379
```

### Get configuration items using gRPC API

Using your [favorite language](https://grpc.io/docs/languages/), create a Dapr gRPC client from the [Dapr proto](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto). The following examples show Java, C#, Python and Javascript clients.

{{< tabs Java Dotnet Python Javascript >}}

{{% codetab %}}
```java

Dapr.ServiceBlockingStub stub = Dapr.newBlockingStub(channel);
stub.GetConfigurationAlpha1(new GetConfigurationRequest{ StoreName = "redisconfig", Keys = new String[]{"myconfig"} });
```
{{% /codetab %}}

{{% codetab %}}
```csharp

var call = client.GetConfigurationAlpha1(new GetConfigurationRequest { StoreName = "redisconfig", Keys = new String[]{"myconfig"} });
```
{{% /codetab %}}

{{% codetab %}}
```python
response = stub.GetConfigurationAlpha1(request={ StoreName: 'redisconfig', Keys = ['myconfig'] })
```
{{% /codetab %}}

{{% codetab %}}
```javascript
client.GetConfigurationAlpha1({ StoreName: 'redisconfig', Keys = ['myconfig'] })
```
{{% /codetab %}}

{{< /tabs >}}

### Watch configuration items

Using your [favorite language](https://grpc.io/docs/languages/), create a Dapr gRPC client from the [Dapr proto](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto).
Use the proto method `SubscribeConfigurationAlpha1` on your client stub to start subscribing to events. The method accepts the following request object:

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
