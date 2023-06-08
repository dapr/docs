---
type: docs
title: "Quickstart: State Management"
linkTitle: "State Management"
weight: 72
description: "Get started with Dapr's State Management building block"
---

Let's take a look at Dapr's [State Management building block]({{< ref state-management >}}). In this Quickstart, you will save, get, and delete state using a Redis state store, but you can swap this out for any one of the [supported state stores]({{< ref supported-state-stores.md >}}).

<img src="/images/state-management-quickstart.png" width=1000 style="padding-bottom:15px;">

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

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/state_management).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Manipulate service state

In a terminal window, navigate to the `order-processor` directory.

```bash
cd state_management/python/sdk/order-processor
```

Install the dependencies:

```bash
pip3 install -r requirements.txt
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- python3 app.py
```

> **Note**: Since Python3.exe is not defined in Windows, you may need to use `python app.py` instead of `python3 app.py`.

The `order-processor` service writes, reads, and deletes an `orderId` key/value pair to the `statestore` instance [defined in the `statestore.yaml` component]({{< ref "#statestoreyaml-component-file" >}}). As soon as the service starts, it performs a loop.

```python
with DaprClient() as client:

    # Save state into the state store
    client.save_state(DAPR_STORE_NAME, orderId, str(order))
    logging.info('Saving Order: %s', order)

    # Get state from the state store
    result = client.get_state(DAPR_STORE_NAME, orderId)
    logging.info('Result after get: ' + str(result.data))

    # Delete state from the state store
    client.delete_state(store_name=DAPR_STORE_NAME, key=orderId)
    logging.info('Deleting Order: %s', order)
```

### Step 3: View the order-processor outputs

Notice, as specified in the code above, the code saves application state in the Dapr state store, reads it, then deletes it.

Order-processor output:
```
== APP == INFO:root:Saving Order: {'orderId': '1'}
== APP == INFO:root:Result after get: b"{'orderId': '1'}"
== APP == INFO:root:Deleting Order: {'orderId': '1'}
== APP == INFO:root:Saving Order: {'orderId': '2'}
== APP == INFO:root:Result after get: b"{'orderId': '2'}"
== APP == INFO:root:Deleting Order: {'orderId': '2'}
== APP == INFO:root:Saving Order: {'orderId': '3'}
== APP == INFO:root:Result after get: b"{'orderId': '3'}"
== APP == INFO:root:Deleting Order: {'orderId': '3'}
== APP == INFO:root:Saving Order: {'orderId': '4'}
== APP == INFO:root:Result after get: b"{'orderId': '4'}"
== APP == INFO:root:Deleting Order: {'orderId': '4'}
```

#### `statestore.yaml` component file

When you run `dapr init`, Dapr creates a default Redis `statestore.yaml` and runs a Redis container on your local machine, located:

- On Windows, under `%UserProfile%\.dapr\components\statestore.yaml`
- On Linux/MacOS, under `~/.dapr/components/statestore.yaml`

With the `statestore.yaml` component, you can easily swap out the [state store](/reference/components-reference/supported-state-stores/) without making code changes.

The Redis `statestore.yaml` file included for this quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
```

In the YAML file:

- `metadata/name` is how your application talks to the component (called `DAPR_STORE_NAME` in the code sample).
- `spec/metadata` defines the connection to the Redis instance used by the component.

{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest Node.js installed](https://nodejs.org/download/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/state_management).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Manipulate service state

In a terminal window, navigate to the `order-processor` directory.

```bash
cd state_management/javascript/sdk/order-processor
```

Install dependencies, which will include the `@dapr/dapr` package from the JavaScript SDK:

```bash
npm install
```

Verify you have the following files included in the service directory:

- `package.json`
- `package-lock.json`

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- npm run start
```
The `order-processor` service writes, reads, and deletes an `orderId` key/value pair to the `statestore` instance [defined in the `statestore.yaml` component]({{< ref "#statestoreyaml-component-file" >}}). As soon as the service starts, it performs a loop.

```js
const client = new DaprClient()

// Save state into a state store
await client.state.save(DAPR_STATE_STORE_NAME, order)
console.log("Saving Order: ", order)

// Get state from a state store
const savedOrder = await client.state.get(DAPR_STATE_STORE_NAME, order.orderId)
console.log("Getting Order: ", savedOrder)

// Delete state from the state store
await client.state.delete(DAPR_STATE_STORE_NAME, order.orderId)
console.log("Deleting Order: ", order)
```
### Step 3: View the order-processor outputs

Notice, as specified in the code above, the code saves application state in the Dapr state store, reads it, then deletes it.

Order-processor output:
```
== APP == > order-processor@1.0.0 start
== APP == > node index.js
== APP == Saving Order:  { orderId: 1 }
== APP == Saving Order:  { orderId: 2 }
== APP == Saving Order:  { orderId: 3 }
== APP == Saving Order:  { orderId: 4 }
== APP == Saving Order:  { orderId: 5 }
== APP == Getting Order:  { orderId: 1 }
== APP == Deleting Order:  { orderId: 1 }
== APP == Getting Order:  { orderId: 2 }
== APP == Deleting Order:  { orderId: 2 }
== APP == Getting Order:  { orderId: 3 }
== APP == Deleting Order:  { orderId: 3 }
== APP == Getting Order:  { orderId: 4 }
== APP == Deleting Order:  { orderId: 4 }
== APP == Getting Order:  { orderId: 5 }
== APP == Deleting Order:  { orderId: 5 }
```

#### `statestore.yaml` component file

When you run `dapr init`, Dapr creates a default Redis `statestore.yaml` and runs a Redis container on your local machine, located:

- On Windows, under `%UserProfile%\.dapr\components\statestore.yaml`
- On Linux/MacOS, under `~/.dapr/components/statestore.yaml`

With the `statestore.yaml` component, you can easily swap out the [state store](/reference/components-reference/supported-state-stores/) without making code changes.

The Redis `statestore.yaml` file included for this quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
```

In the YAML file:

- `metadata/name` is how your application talks to the component (called `DAPR_STORE_NAME` in the code sample).
- `spec/metadata` defines the connection to the Redis instance used by the component.

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

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/state_management).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Manipulate service state

In a terminal window, navigate to the `order-processor` directory.

```bash
cd state_management/csharp/sdk/order-processor
```

Recall NuGet packages:

```bash
dotnet restore
dotnet build
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- dotnet run
```

The `order-processor` service writes, reads, and deletes an `orderId` key/value pair to the `statestore` instance [defined in the `statestore.yaml` component]({{< ref "#statestoreyaml-component-file" >}}). As soon as the service starts, it performs a loop.

```cs
var client = new DaprClientBuilder().Build();

// Save state into the state store
await client.SaveStateAsync(DAPR_STORE_NAME, orderId.ToString(), order.ToString());
Console.WriteLine("Saving Order: " + order);

// Get state from the state store
var result = await client.GetStateAsync<string>(DAPR_STORE_NAME, orderId.ToString());
Console.WriteLine("Getting Order: " + result);

// Delete state from the state store
await client.DeleteStateAsync(DAPR_STORE_NAME, orderId.ToString());
Console.WriteLine("Deleting Order: " + order);
```
### Step 3: View the order-processor outputs

Notice, as specified in the code above, the code saves application state in the Dapr state store, reads it, then deletes it.

Order-processor output:
```
== APP == Saving Order: Order { orderId = 1 }
== APP == Getting Order: Order { orderId = 1 }
== APP == Deleting Order: Order { orderId = 1 }
== APP == Saving Order: Order { orderId = 2 }
== APP == Getting Order: Order { orderId = 2 }
== APP == Deleting Order: Order { orderId = 2 }
== APP == Saving Order: Order { orderId = 3 }
== APP == Getting Order: Order { orderId = 3 }
== APP == Deleting Order: Order { orderId = 3 }
== APP == Saving Order: Order { orderId = 4 }
== APP == Getting Order: Order { orderId = 4 }
== APP == Deleting Order: Order { orderId = 4 }
== APP == Saving Order: Order { orderId = 5 }
== APP == Getting Order: Order { orderId = 5 }
== APP == Deleting Order: Order { orderId = 5 }
```

#### `statestore.yaml` component file

When you run `dapr init`, Dapr creates a default Redis `statestore.yaml` and runs a Redis container on your local machine, located:

- On Windows, under `%UserProfile%\.dapr\components\statestore.yaml`
- On Linux/MacOS, under `~/.dapr/components/statestore.yaml`

With the `statestore.yaml` component, you can easily swap out the [state store](/reference/components-reference/supported-state-stores/) without making code changes.

The Redis `statestore.yaml` file included for this quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
```

In the YAML file:

- `metadata/name` is how your application talks to the component (called `DAPR_STORE_NAME` in the code sample).
- `spec/metadata` defines the connection to the Redis instance used by the component.

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 11 (or greater):
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads), or
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html), version 3.x.
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/state_management).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Manipulate service state

In a terminal window, navigate to the `order-processor` directory.

```bash
cd state_management/java/sdk/order-processor
```

Install the dependencies:

```bash
mvn clean install
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --resources-path ../../../resources -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

The `order-processor` service writes, reads, and deletes an `orderId` key/value pair to the `statestore` instance [defined in the `statestore.yaml` component]({{< ref "#statestoreyaml-component-file" >}}). As soon as the service starts, it performs a loop.

```java
try (DaprClient client = new DaprClientBuilder().build()) {
  for (int i = 1; i <= 10; i++) {
    int orderId = i;
    Order order = new Order();
    order.setOrderId(orderId);

    // Save state into the state store
    client.saveState(DAPR_STATE_STORE, String.valueOf(orderId), order).block();
    LOGGER.info("Saving Order: " + order.getOrderId());

    // Get state from the state store
    State<Order> response = client.getState(DAPR_STATE_STORE, String.valueOf(orderId), Order.class).block();
    LOGGER.info("Getting Order: " + response.getValue().getOrderId());

    // Delete state from the state store
    client.deleteState(DAPR_STATE_STORE, String.valueOf(orderId)).block();
    LOGGER.info("Deleting Order: " + orderId);
    TimeUnit.MILLISECONDS.sleep(1000);
  }
```
### Step 3: View the order-processor outputs

Notice, as specified in the code above, the code saves application state in the Dapr state store, reads it, then deletes it.

Order-processor output:
```
== APP == INFO:root:Saving Order: {'orderId': '1'}
== APP == INFO:root:Result after get: b"{'orderId': '1'}"
== APP == INFO:root:Deleting Order: {'orderId': '1'}
== APP == INFO:root:Saving Order: {'orderId': '2'}
== APP == INFO:root:Result after get: b"{'orderId': '2'}"
== APP == INFO:root:Deleting Order: {'orderId': '2'}
== APP == INFO:root:Saving Order: {'orderId': '3'}
== APP == INFO:root:Result after get: b"{'orderId': '3'}"
== APP == INFO:root:Deleting Order: {'orderId': '3'}
== APP == INFO:root:Saving Order: {'orderId': '4'}
== APP == INFO:root:Result after get: b"{'orderId': '4'}"
== APP == INFO:root:Deleting Order: {'orderId': '4'}
```

#### `statestore.yaml` component file

When you run `dapr init`, Dapr creates a default Redis `statestore.yaml` and runs a Redis container on your local machine, located:

- On Windows, under `%UserProfile%\.dapr\components\statestore.yaml`
- On Linux/MacOS, under `~/.dapr/components/statestore.yaml`

With the `statestore.yaml` component, you can easily swap out the [state store](/reference/components-reference/supported-state-stores/) without making code changes.

The Redis `statestore.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
```

In the YAML file:

- `metadata/name` is how your application talks to the component (called `DAPR_STORE_NAME` in the code sample).
- `spec/metadata` defines the connection to the Redis instance used by the component.

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

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/state_management).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Manipulate service state

In a terminal window, navigate to the `order-processor` directory.

```bash
cd state_management/go/sdk/order-processor
```

Install the dependencies and build the application:

```bash
go build .
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --resources-path ../../../resources -- go run .
```

The `order-processor` service writes, reads, and deletes an `orderId` key/value pair to the `statestore` instance [defined in the `statestore.yaml` component]({{< ref "#statestoreyaml-component-file" >}}). As soon as the service starts, it performs a loop.

```go
  client, err := dapr.NewClient()

  // Save state into the state store
  _ = client.SaveState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId), []byte(order))
  log.Print("Saving Order: " + string(order))

  // Get state from the state store
  result, _ := client.GetState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId))
  fmt.Println("Getting Order: " + string(result.Value))

  // Delete state from the state store
  _ = client.DeleteState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId))
  log.Print("Deleting Order: " + string(order))
```

### Step 3: View the order-processor outputs

Notice, as specified in the code above, the code saves application state in the Dapr state store, reads it, then deletes it.

Order-processor output:
```
== APP == dapr client initializing for: 127.0.0.1:53689
== APP == 2022/04/01 09:16:03 Saving Order: {"orderId":1}
== APP == Getting Order: {"orderId":1}
== APP == 2022/04/01 09:16:03 Deleting Order: {"orderId":1}
== APP == 2022/04/01 09:16:03 Saving Order: {"orderId":2}
== APP == Getting Order: {"orderId":2}
== APP == 2022/04/01 09:16:03 Deleting Order: {"orderId":2}
== APP == 2022/04/01 09:16:03 Saving Order: {"orderId":3}
== APP == Getting Order: {"orderId":3}
== APP == 2022/04/01 09:16:03 Deleting Order: {"orderId":3}
== APP == 2022/04/01 09:16:03 Saving Order: {"orderId":4}
== APP == Getting Order: {"orderId":4}
== APP == 2022/04/01 09:16:03 Deleting Order: {"orderId":4}
== APP == 2022/04/01 09:16:03 Saving Order: {"orderId":5}
== APP == Getting Order: {"orderId":5}
== APP == 2022/04/01 09:16:03 Deleting Order: {"orderId":5}
```

#### `statestore.yaml` component file

When you run `dapr init`, Dapr creates a default Redis `statestore.yaml` and runs a Redis container on your local machine, located:

- On Windows, under `%UserProfile%\.dapr\components\statestore.yaml`
- On Linux/MacOS, under `~/.dapr/components/statestore.yaml`

With the `statestore.yaml` component, you can easily swap out the [state store](/reference/components-reference/supported-state-stores/) without making code changes.

The Redis `statestore.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
```

In the YAML file:

- `metadata/name` is how your application talks to the component (called `DAPR_STORE_NAME` in the code sample).
- `spec/metadata` defines the connection to the Redis instance used by the component.

{{% /codetab %}}

{{< /tabs >}}

## Tell us what you think!
We're continuously working to improve our Quickstart examples and value your feedback. Did you find this quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps

- Use Dapr State Management with HTTP instead of an SDK.
  - [Python](https://github.com/dapr/quickstarts/tree/master/state_management/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/state_management/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/state_management/csharp/http)
  - [Java](https://github.com/dapr/quickstarts/tree/master/state_management/java/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/state_management/go/http)
- Learn more about [State Management building block]({{< ref state-management >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
