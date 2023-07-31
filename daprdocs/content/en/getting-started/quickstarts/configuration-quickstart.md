---
type: docs
title: "Quickstart: Configuration"
linkTitle: Configuration
weight: 76
description: Get started with Dapr's Configuration building block
---

Let's take a look at Dapr's [Configuration building block]({{< ref configuration-api-overview.md >}}). A configuration item is often dynamic in nature and tightly coupled to the needs of the application that consumes it. Configuration items are key/value pairs containing configuration data, such as:
- App ids
- Partition keys
- Database names, etc

In this quickstart, you'll run an `order-processor` microservice that utilizes the Configuration API. The service:
1. Gets configuration items from the configuration store.
1. Subscribes for configuration updates.

<img src="/images/configuration-quickstart/configuration-quickstart-flow.png" width=1000 alt="Diagram that demonstrates the flow of the configuration API quickstart with key/value pairs used.">

Select your preferred language-specific Dapr SDK before proceeding with the Quickstart.

{{< tabs "Python" "JavaScript" ".NET" "Java" "Go" >}}
 <!-- Python -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.7+ installed](https://www.python.org/downloads/).
<!-- IGNORE_LINKS --> 
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/configuration).

```bash
git clone https://github.com/dapr/quickstarts.git
```

Once cloned, open a new terminal and run the following command to set values for configuration items `orderId1` and `orderId2`.

```bash
docker exec dapr_redis redis-cli MSET orderId1 "101" orderId2 "102"
```

### Step 2: Run the `order-processor` service

From the root of the Quickstarts clone directory, navigate to the `order-processor` directory.

```bash
cd configuration/python/sdk/order-processor
```

Install the dependencies:

```bash
pip3 install -r requirements.txt
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --components-path ../../../components/ --app-port 6001 -- python3 app.py
```

> **Note**: Since Python3.exe is not defined in Windows, you may need to use `python app.py` instead of `python3 app.py`.

The expected output:

```
== APP == Configuration for orderId1 : value: "101"
== APP ==
== APP == Configuration for orderId2 : value: "102"
== APP ==
== APP == App unsubscribed from config changes
```

### (Optional) Step 3: Update configuration item values

Once the app has unsubscribed, try updating the configuration item values. Change the `orderId1` and `orderId2` values using the following command:

```bash
docker exec dapr_redis redis-cli MSET orderId1 "103" orderId2 "104"
```

Run the `order-processor` service again:

```bash
dapr run --app-id order-processor --components-path ../../../components/ --app-port 6001 -- python3 app.py
```

> **Note**: Since Python3.exe is not defined in Windows, you may need to use `python app.py` instead of `python3 app.py`.

The app will return the updated configuration values:

```
== APP == Configuration for orderId1 : value: "103"
== APP ==
== APP == Configuration for orderId2 : value: "104"
== APP ==
```

### The `order-processor` service

The `order-processor` service includes code for:
- Getting the configuration items from the config store
- Subscribing to configuration updates (which you made in the CLI earlier)
- Unsubscribing from configuration updates and exiting the app after 20 seconds of inactivity.

Get configuration items:

```python
# Get config items from the config store
for config_item in CONFIGURATION_ITEMS:
    config = client.get_configuration(store_name=DAPR_CONFIGURATION_STORE, keys=[config_item], config_metadata={})
    print(f"Configuration for {config_item} : {config.items[config_item]}", flush=True)
```

Subscribe to configuration updates: 

```python
# Subscribe for configuration changes
configuration = await client.subscribe_configuration(DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS)
```

Unsubscribe from configuration updates and exit the application:

```python
# Unsubscribe from configuration updates
unsubscribed = True
for config_item in CONFIGURATION_ITEMS:
    unsub_item = client.unsubscribe_configuration(DAPR_CONFIGURATION_STORE, config_item)
    #...
if unsubscribed == True:
    print("App unsubscribed from config changes", flush=True)
```


{{% /codetab %}}


<!-- JavaScript -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.7+ installed](https://www.python.org/downloads/).
<!-- IGNORE_LINKS --> 
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/configuration).

```bash
git clone https://github.com/dapr/quickstarts.git
```

Once cloned, open a new terminal and run the following command to set values for configuration items `orderId1` and `orderId2`.

```bash
docker exec dapr_redis redis-cli MSET orderId1 "101" orderId2 "102"
```

### Step 2: Run the `order-processor` service

From the root of the Quickstarts clone directory, navigate to the `order-processor` directory.

```bash
cd configuration/javascript/sdk/order-processor
```

Install the dependencies:

```bash
npm install
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --components-path ../../../components/ --app-protocol grpc --dapr-grpc-port 3500 -- node index.js
```

The expected output:

```
== APP == Configuration for orderId1: {"key":"orderId1","value":"101","version":"","metadata":{}}
== APP == Configuration for orderId2: {"key":"orderId2","value":"102","version":"","metadata":{}}
== APP == App unsubscribed to config changes
```

### (Optional) Step 3: Update configuration item values

Once the app has unsubscribed, try updating the configuration item values. Change the `orderId1` and `orderId2` values using the following command:

```bash
docker exec dapr_redis redis-cli MSET orderId1 "103" orderId2 "104"
```

Run the `order-processor` service again:

```bash
dapr run --app-id order-processor --components-path ../../../components/ --app-protocol grpc --dapr-grpc-port 3500 -- node index.js
```

The app will return the updated configuration values:

```
== APP == Configuration for orderId1: {"key":"orderId1","value":"103","version":"","metadata":{}}
== APP == Configuration for orderId2: {"key":"orderId2","value":"104","version":"","metadata":{}}
```

### The `order-processor` service

The `order-processor` service includes code for:
- Getting the configuration items from the config store
- Subscribing to configuration updates (which you made in the CLI earlier)
- Unsubscribing from configuration updates and exiting the app after 20 seconds of inactivity.

Get configuration items:

```javascript
// Get config items from the config store
//...
  const config = await client.configuration.get(DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS);
  Object.keys(config.items).forEach((key) => {
    console.log("Configuration for " + key + ":", JSON.stringify(config.items[key]));
  });
```

Subscribe to configuration updates: 

```javascript
// Subscribe to config updates
try {
  const stream = await client.configuration.subscribeWithKeys(
    DAPR_CONFIGURATION_STORE,
    CONFIGURATION_ITEMS,
    (config) => {
      console.log("Configuration update", JSON.stringify(config.items));
    }
  );
```

Unsubscribe from configuration updates and exit the application:

```javascript
// Unsubscribe to config updates and exit app after 20 seconds
setTimeout(() => {
  stream.stop();
  console.log("App unsubscribed to config changes");
  process.exit(0);
},
```

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET SDK or .NET 6 SDK installed](https://dotnet.microsoft.com/download).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/configuration).

```bash
git clone https://github.com/dapr/quickstarts.git
```

Once cloned, open a new terminal and run the following command to set values for configuration items `orderId1` and `orderId2`.

```bash
docker exec dapr_redis redis-cli MSET orderId1 "101" orderId2 "102"
```

### Step 2: Run the `order-processor` service

From the root of the Quickstarts clone directory, navigate to the `order-processor` directory.

```bash
cd configuration/csharp/sdk/order-processor
```

Recall NuGet packages:

```bash
dotnet restore
dotnet build
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor-http --components-path ../../../components/ --app-port 7001 -- dotnet run --project .
```

The expected output:

```
== APP == Configuration for orderId1: {"Value":"101","Version":"","Metadata":{}}
== APP == Configuration for orderId2: {"Value":"102","Version":"","Metadata":{}}
== APP == App unsubscribed from config changes
```

### (Optional) Step 3: Update configuration item values

Once the app has unsubscribed, try updating the configuration item values. Change the `orderId1` and `orderId2` values using the following command:

```bash
docker exec dapr_redis redis-cli MSET orderId1 "103" orderId2 "104"
```

Run the `order-processor` service again:

```bash
dapr run --app-id order-processor-http --components-path ../../../components/ --app-port 7001 -- dotnet run --project .
```

The app will return the updated configuration values:

```
== APP == Configuration for orderId1: {"Value":"103","Version":"","Metadata":{}}
== APP == Configuration for orderId2: {"Value":"104","Version":"","Metadata":{}}
```

### The `order-processor` service

The `order-processor` service includes code for:
- Getting the configuration items from the config store
- Subscribing to configuration updates (which you made in the CLI earlier)
- Unsubscribing from configuration updates and exiting the app after 20 seconds of inactivity.

Get configuration items:

```csharp
// Get config from configuration store
GetConfigurationResponse config = await client.GetConfiguration(DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS);
foreach (var item in config.Items)
{
  var cfg = System.Text.Json.JsonSerializer.Serialize(item.Value);
  Console.WriteLine("Configuration for " + item.Key + ": " + cfg);
}
```

Subscribe to configuration updates: 

```csharp
// Subscribe to config updates
SubscribeConfigurationResponse subscribe = await client.SubscribeConfiguration(DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS);
```

Unsubscribe from configuration updates and exit the application:

```csharp
// Unsubscribe to config updates and exit the app
try
{
  client.UnsubscribeConfiguration(DAPR_CONFIGURATION_STORE, subscriptionId);
  Console.WriteLine("App unsubscribed from config changes");
  Environment.Exit(0);
}
```

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 11 (or greater):
  - [Oracle JDK](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11), or
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html), version 3.x.
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/configuration).

```bash
git clone https://github.com/dapr/quickstarts.git
```

Once cloned, open a new terminal and run the following command to set values for configuration items `orderId1` and `orderId2`.

```bash
docker exec dapr_redis redis-cli MSET orderId1 "101" orderId2 "102"
```

### Step 2: Run the `order-processor` service

From the root of the Quickstarts clone directory, navigate to the `order-processor` directory.

```bash
cd configuration/java/sdk/order-processor
```

Install the dependencies:

```bash
mvn clean install
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --components-path ../../../components -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

The expected output:

```
== APP == Configuration for orderId1: {'value':'101'}
== APP == Configuration for orderId2: {'value':'102'}
== APP == App unsubscribed to config changes
```

### (Optional) Step 3: Update configuration item values

Once the app has unsubscribed, try updating the configuration item values. Change the `orderId1` and `orderId2` values using the following command:

```bash
docker exec dapr_redis redis-cli MSET orderId1 "103" orderId2 "104"
```

Run the `order-processor` service again:

```bash
dapr run --app-id order-processor --components-path ../../../components -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

The app will return the updated configuration values:

```
== APP == Configuration for orderId1: {'value':'103'}
== APP == Configuration for orderId2: {'value':'104'}
```

### The `order-processor` service

The `order-processor` service includes code for:
- Getting the configuration items from the config store
- Subscribing to configuration updates (which you made in the CLI earlier)
- Unsubscribing from configuration updates and exiting the app after 20 seconds of inactivity.

Get configuration items:

```java
// Get config items from the config store
try (DaprPreviewClient client = (new DaprClientBuilder()).buildPreviewClient()) {
    for (String configurationItem : CONFIGURATION_ITEMS) {
        ConfigurationItem item = client.getConfiguration(DAPR_CONFIGURATON_STORE, configurationItem).block();
        System.out.println("Configuration for " + configurationItem + ": {'value':'" + item.getValue() + "'}");
    }
```

Subscribe to configuration updates: 

```java
// Subscribe for config changes
Flux<SubscribeConfigurationResponse> subscription = client.subscribeConfiguration(DAPR_CONFIGURATON_STORE,
        CONFIGURATION_ITEMS.toArray(String[]::new));
```

Unsubscribe from configuration updates and exit the application:

```java
// Unsubscribe from config changes
UnsubscribeConfigurationResponse unsubscribe = client
        .unsubscribeConfiguration(subscriptionId, DAPR_CONFIGURATON_STORE).block();
if (unsubscribe.getIsUnsubscribed()) {
    System.out.println("App unsubscribed to config changes");
}
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest version of Go](https://go.dev/dl/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/configuration).

```bash
git clone https://github.com/dapr/quickstarts.git
```

Once cloned, open a new terminal and run the following command to set values for configuration items `orderId1` and `orderId2`.

```bash
docker exec dapr_redis redis-cli MSET orderId1 "101" orderId2 "102"
```

### Step 2: Run the `order-processor` service

From the root of the Quickstarts clone directory, navigate to the `order-processor` directory.

```bash
cd configuration/go/sdk/order-processor
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --app-port 6001 --components-path ../../../components -- go run .
```

The expected output:

```
== APP == Configuration for orderId1: {"Value":"101","Version":"","Metadata":null}
== APP == Configuration for orderId2: {"Value":"102","Version":"","Metadata":null}
== APP == dapr configuration subscribe finished.
== APP == App unsubscribed to config changes
```

### (Optional) Step 3: Update configuration item values

Once the app has unsubscribed, try updating the configuration item values. Change the `orderId1` and `orderId2` values using the following command:

```bash
docker exec dapr_redis redis-cli MSET orderId1 "103" orderId2 "104"
```

Run the `order-processor` service again:

```bash
dapr run --app-id order-processor --app-port 6001 --components-path ../../../components -- go run .
```

The app will return the updated configuration values:

```
== APP == Configuration for orderId1: {"Value":"103","Version":"","Metadata":null}
== APP == Configuration for orderId2: {"Value":"104","Version":"","Metadata":null}
```

### The `order-processor` service

The `order-processor` service includes code for:
- Getting the configuration items from the config store
- Subscribing to configuration updates (which you made in the CLI earlier)
- Unsubscribing from configuration updates and exiting the app after 20 seconds of inactivity.

Get configuration items:

```go
// Get config items from config store
for _, item := range CONFIGURATION_ITEMS {
	config, err := client.GetConfigurationItem(ctx, DAPR_CONFIGURATION_STORE, item)
	//...
	c, _ := json.Marshal(config)
	fmt.Println("Configuration for " + item + ": " + string(c))
}
```

Subscribe to configuration updates: 

```go
// Subscribe for config changes
err = client.SubscribeConfigurationItems(ctx, DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS, func(id string, config map[string]*dapr.ConfigurationItem) {
	// First invocation when app subscribes to config changes only returns subscription id
	if len(config) == 0 {
		fmt.Println("App subscribed to config changes with subscription id: " + id)
		subscriptionId = id
		return
	}
})
```

Unsubscribe from configuration updates and exit the application:

```go
// Unsubscribe to config updates and exit app after 20 seconds
select {
case <-ctx.Done():
	err = client.UnsubscribeConfigurationItems(context.Background(), DAPR_CONFIGURATION_STORE, subscriptionId)
    //...
	{
		fmt.Println("App unsubscribed to config changes")
	}
```

{{% /codetab %}}

{{< /tabs >}}

## Tell us what you think!

We're continuously working to improve our Quickstart examples and value your feedback. Did you find this quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps

- Use Dapr Configuration with HTTP instead of an SDK.
  - [Python](https://github.com/dapr/quickstarts/tree/master/configuration/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/configuration/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/configuration/csharp/http)
  - [Java](https://github.com/dapr/quickstarts/tree/master/configuration/java/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/configuration/go/http)
- Learn more about [Configuration building block]({{< ref configuration-api-overview >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}