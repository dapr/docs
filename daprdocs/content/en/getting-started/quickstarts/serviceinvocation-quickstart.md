---
type: docs
title: "Quickstart: Service Invocation"
linkTitle: "Service Invocation"
weight: 71
description: "Get started with Dapr's Service Invocation building block"
---

With [Dapr's Service Invocation building block](https://docs.dapr.io/developing-applications/building-blocks/service-invocation), your application can communicate reliably and securely with other applications.

<img src="/images/serviceinvocation-quickstart/service-invocation-overview.png" width=800 alt="Diagram showing the steps of service invocation" style="padding-bottom:25px;">

Dapr offers several methods for service invocation, which you can choose depending on your scenario. For this Quickstart, you'll enable the checkout service to invoke a method using HTTP proxy in the order-processor service and by either:
- [Running all applications in this sample simultaneously with the Multi-App Run template file]({{< ref "#run-using-multi-app-run" >}}), or
- [Running one application at a time]({{< ref "#run-one-application-at-a-time" >}})

Learn more about Dapr's methods for service invocation in the [overview article]({{< ref service-invocation-overview.md >}}).

## Run using Multi-App Run

Select your preferred language before proceeding with the Quickstart.

{{< tabs "Python" "JavaScript" ".NET" "Java" "Go" >}}
 <!-- Python -->
{{% codetab %}}

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.7+ installed](https://www.python.org/downloads/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/service_invocation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstart clone directory, navigate to the quickstart directory.

```bash
cd service_invocation/python/http
```

### Step 3: Run the `order-processor` and `checkout` services

With the following command, simultaneously run the following services alongside their own Dapr sidecars:
- The `order-processor` service
- The `checkout` service 

```bash
dapr run -f .
```
> **Note**: Since Python3.exe is not defined in Windows, you may need to change  `python3` to `python` in the  [`dapr.yaml`]({{< ref "#dapryaml-multi-app-run-template-file" >}}) file before running `dapr run -f .`

**Expected output**

```
== APP - order-processor == Order received : Order { orderId = 1 }
== APP - checkout == Order passed: Order { OrderId = 1 }
== APP - order-processor == Order received : Order { orderId = 2 }
== APP - checkout == Order passed: Order { OrderId = 2 }
== APP - order-processor == Order received : Order { orderId = 3 }
== APP - checkout == Order passed: Order { OrderId = 3 }
== APP - order-processor == Order received : Order { orderId = 4 }
== APP - checkout == Order passed: Order { OrderId = 4 }
== APP - order-processor == Order received : Order { orderId = 5 }
== APP - checkout == Order passed: Order { OrderId = 5 }
== APP - order-processor == Order received : Order { orderId = 6 }
== APP - checkout == Order passed: Order { OrderId = 6 }
== APP - order-processor == Order received : Order { orderId = 7 }
== APP - checkout == Order passed: Order { OrderId = 7 }
== APP - order-processor == Order received : Order { orderId = 8 }
== APP - checkout == Order passed: Order { OrderId = 8 }
== APP - order-processor == Order received : Order { orderId = 9 }
== APP - checkout == Order passed: Order { OrderId = 9 }
== APP - order-processor == Order received : Order { orderId = 10 }
== APP - checkout == Order passed: Order { OrderId = 10 }
== APP - order-processor == Order received : Order { orderId = 11 }
== APP - checkout == Order passed: Order { OrderId = 11 }
== APP - order-processor == Order received : Order { orderId = 12 }
== APP - checkout == Order passed: Order { OrderId = 12 }
== APP - order-processor == Order received : Order { orderId = 13 }
== APP - checkout == Order passed: Order { OrderId = 13 }
== APP - order-processor == Order received : Order { orderId = 14 }
== APP - checkout == Order passed: Order { OrderId = 14 }
== APP - order-processor == Order received : Order { orderId = 15 }
== APP - checkout == Order passed: Order { OrderId = 15 }
== APP - order-processor == Order received : Order { orderId = 16 }
== APP - checkout == Order passed: Order { OrderId = 16 }
== APP - order-processor == Order received : Order { orderId = 17 }
== APP - checkout == Order passed: Order { OrderId = 17 }
== APP - order-processor == Order received : Order { orderId = 18 }
== APP - checkout == Order passed: Order { OrderId = 18 }
== APP - order-processor == Order received : Order { orderId = 19 }
== APP - checkout == Order passed: Order { OrderId = 19 }
== APP - order-processor == Order received : Order { orderId = 20 }
== APP - checkout == Order passed: Order { OrderId = 20 }
Exited App successfully
```

### What happened? 

Running `dapr run -f .` in this Quickstart started both the [subscriber]({{< ref "#order-processor-service" >}}) and [publisher]({{< ref "#checkout-service" >}}) applications using the `dapr.yaml` Multi-App Run template file.

##### `dapr.yaml` Multi-App Run template file

Running the [Multi-App Run template file]({{< ref multi-app-dapr-run >}}) with `dapr run -f .` starts all applications in your project. In this Quickstart, the `dapr.yaml` file contains the following:

```yml
version: 1
apps:
  - appDirPath: ./order-processor/
    appID: order-processor
    appPort: 8001
    command: ["python3", "app.py"]
  - appID: checkout
    appDirPath: ./checkout/
    command: ["python3", "app.py"]
```

##### `order-processor` service

The `order-processor` service receives the call from the `checkout` service: 

```py
@app.route('/orders', methods=['POST'])
def getOrder():
    data = request.json
    print('Order received : ' + json.dumps(data), flush=True)
    return json.dumps({'success': True}), 200, {
        'ContentType': 'application/json'}


app.run(port=8001)
```

#### `checkout` service

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header, which specifies the ID of the target service.

```python
headers = {'dapr-app-id': 'order-processor'}

result = requests.post(
    url='%s/orders' % (base_url),
    data=json.dumps(order),
    headers=headers
)
```

{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest Node.js installed](https://nodejs.org/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/service_invocation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstart clone directory, navigate to the quickstart directory.

```bash
cd service_invocation/javascript/http
```

### Step 3: Run the `order-processor` and `checkout` services

With the following command, simultaneously run the following services alongside their own Dapr sidecars:
- The `order-processor` service
- The `checkout` service 

```bash
dapr run -f .
```

**Expected output**

```
== APP - order-processor == Order received : Order { orderId = 1 }
== APP - checkout == Order passed: Order { OrderId = 1 }
== APP - order-processor == Order received : Order { orderId = 2 }
== APP - checkout == Order passed: Order { OrderId = 2 }
== APP - order-processor == Order received : Order { orderId = 3 }
== APP - checkout == Order passed: Order { OrderId = 3 }
== APP - order-processor == Order received : Order { orderId = 4 }
== APP - checkout == Order passed: Order { OrderId = 4 }
== APP - order-processor == Order received : Order { orderId = 5 }
== APP - checkout == Order passed: Order { OrderId = 5 }
== APP - order-processor == Order received : Order { orderId = 6 }
== APP - checkout == Order passed: Order { OrderId = 6 }
== APP - order-processor == Order received : Order { orderId = 7 }
== APP - checkout == Order passed: Order { OrderId = 7 }
== APP - order-processor == Order received : Order { orderId = 8 }
== APP - checkout == Order passed: Order { OrderId = 8 }
== APP - order-processor == Order received : Order { orderId = 9 }
== APP - checkout == Order passed: Order { OrderId = 9 }
== APP - order-processor == Order received : Order { orderId = 10 }
== APP - checkout == Order passed: Order { OrderId = 10 }
== APP - order-processor == Order received : Order { orderId = 11 }
== APP - checkout == Order passed: Order { OrderId = 11 }
== APP - order-processor == Order received : Order { orderId = 12 }
== APP - checkout == Order passed: Order { OrderId = 12 }
== APP - order-processor == Order received : Order { orderId = 13 }
== APP - checkout == Order passed: Order { OrderId = 13 }
== APP - order-processor == Order received : Order { orderId = 14 }
== APP - checkout == Order passed: Order { OrderId = 14 }
== APP - order-processor == Order received : Order { orderId = 15 }
== APP - checkout == Order passed: Order { OrderId = 15 }
== APP - order-processor == Order received : Order { orderId = 16 }
== APP - checkout == Order passed: Order { OrderId = 16 }
== APP - order-processor == Order received : Order { orderId = 17 }
== APP - checkout == Order passed: Order { OrderId = 17 }
== APP - order-processor == Order received : Order { orderId = 18 }
== APP - checkout == Order passed: Order { OrderId = 18 }
== APP - order-processor == Order received : Order { orderId = 19 }
== APP - checkout == Order passed: Order { OrderId = 19 }
== APP - order-processor == Order received : Order { orderId = 20 }
== APP - checkout == Order passed: Order { OrderId = 20 }
Exited App successfully
```

### What happened? 

Running `dapr run -f .` in this Quickstart started both the [subscriber]({{< ref "#order-processor-service" >}}) and [publisher]({{< ref "#checkout-service" >}}) applications using the `dapr.yaml` Multi-App Run template file.

##### `dapr.yaml` Multi-App Run template file

Running the [Multi-App Run template file]({{< ref multi-app-dapr-run >}}) with `dapr run -f .` starts all applications in your project. In this Quickstart, the `dapr.yaml` file contains the following:

```yml
version: 1
apps:
  - appDirPath: ./order-processor/
    appID: order-processor
    appPort: 5001
    command: ["npm", "start"]
  - appID: checkout
    appDirPath: ./checkout/
    command: ["npm", "start"]
```

##### `order-processor` service

The `order-processor` service receives the call from the `checkout` service: 

```javascript
app.post('/orders', (req, res) => {
    console.log("Order received:", req.body);
    res.sendStatus(200);
});
```

##### `checkout` service

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header, which specifies the ID of the target service.

```javascript
let axiosConfig = {
  headers: {
      "dapr-app-id": "order-processor"
  }
};
const res = await axios.post(`${DAPR_HOST}:${DAPR_HTTP_PORT}/orders`, order , axiosConfig);
console.log("Order passed: " + res.config.data);
```

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET SDK or .NET 7 SDK installed](https://dotnet.microsoft.com/download).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/service_invocation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstart clone directory, navigate to the quickstart directory.

```bash
cd service_invocation/csharp/http
```

### Step 3: Run the `order-processor` and `checkout` services

With the following command, simultaneously run the following services alongside their own Dapr sidecars:
- The `order-processor` service
- The `checkout` service 

```bash
dapr run -f .
```

**Expected output**

```
== APP - order-processor == Order received : Order { orderId = 1 }
== APP - checkout == Order passed: Order { OrderId = 1 }
== APP - order-processor == Order received : Order { orderId = 2 }
== APP - checkout == Order passed: Order { OrderId = 2 }
== APP - order-processor == Order received : Order { orderId = 3 }
== APP - checkout == Order passed: Order { OrderId = 3 }
== APP - order-processor == Order received : Order { orderId = 4 }
== APP - checkout == Order passed: Order { OrderId = 4 }
== APP - order-processor == Order received : Order { orderId = 5 }
== APP - checkout == Order passed: Order { OrderId = 5 }
== APP - order-processor == Order received : Order { orderId = 6 }
== APP - checkout == Order passed: Order { OrderId = 6 }
== APP - order-processor == Order received : Order { orderId = 7 }
== APP - checkout == Order passed: Order { OrderId = 7 }
== APP - order-processor == Order received : Order { orderId = 8 }
== APP - checkout == Order passed: Order { OrderId = 8 }
== APP - order-processor == Order received : Order { orderId = 9 }
== APP - checkout == Order passed: Order { OrderId = 9 }
== APP - order-processor == Order received : Order { orderId = 10 }
== APP - checkout == Order passed: Order { OrderId = 10 }
== APP - order-processor == Order received : Order { orderId = 11 }
== APP - checkout == Order passed: Order { OrderId = 11 }
== APP - order-processor == Order received : Order { orderId = 12 }
== APP - checkout == Order passed: Order { OrderId = 12 }
== APP - order-processor == Order received : Order { orderId = 13 }
== APP - checkout == Order passed: Order { OrderId = 13 }
== APP - order-processor == Order received : Order { orderId = 14 }
== APP - checkout == Order passed: Order { OrderId = 14 }
== APP - order-processor == Order received : Order { orderId = 15 }
== APP - checkout == Order passed: Order { OrderId = 15 }
== APP - order-processor == Order received : Order { orderId = 16 }
== APP - checkout == Order passed: Order { OrderId = 16 }
== APP - order-processor == Order received : Order { orderId = 17 }
== APP - checkout == Order passed: Order { OrderId = 17 }
== APP - order-processor == Order received : Order { orderId = 18 }
== APP - checkout == Order passed: Order { OrderId = 18 }
== APP - order-processor == Order received : Order { orderId = 19 }
== APP - checkout == Order passed: Order { OrderId = 19 }
== APP - order-processor == Order received : Order { orderId = 20 }
== APP - checkout == Order passed: Order { OrderId = 20 }
Exited App successfully
```

### What happened? 

Running `dapr run -f .` in this Quickstart started both the [subscriber]({{< ref "#order-processor-service" >}}) and [publisher]({{< ref "#checkout-service" >}}) applications using the `dapr.yaml` Multi-App Run template file.

##### `dapr.yaml` Multi-App Run template file

Running the [Multi-App Run template file]({{< ref multi-app-dapr-run >}}) with `dapr run -f .` starts all applications in your project. In this Quickstart, the `dapr.yaml` file contains the following:

```yml
version: 1
apps:
  - appDirPath: ./order-processor/
    appID: order-processor
    appPort: 7001
    command: ["dotnet", "run"]
  - appID: checkout
    appDirPath: ./checkout/
    command: ["dotnet", "run"]
```

##### `order-processor` service

The `order-processor` service receives the call from the `checkout` service: 

```csharp
app.MapPost("/orders", (Order order) =>
{
    Console.WriteLine("Order received : " + order);
    return order.ToString();
});
```

##### `checkout` service

In the Program.cs file for the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header, which specifies the ID of the target service.

```csharp
var client = new HttpClient();
client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

client.DefaultRequestHeaders.Add("dapr-app-id", "order-processor");

var response = await client.PostAsync($"{baseURL}/orders", content);
    Console.WriteLine("Order passed: " + order);
```

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 11 (or greater):
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads), or
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html), version 3.x.
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/service_invocation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstart clone directory, navigate to the quickstart directory.

```bash
cd service_invocation/java/http
```

### Step 3: Run the `order-processor` and `checkout` services

With the following command, simultaneously run the following services alongside their own Dapr sidecars:
- The `order-processor` service
- The `checkout` service 

```bash
dapr run -f .
```

**Expected output**

```
== APP - order-processor == Order received : Order { orderId = 1 }
== APP - checkout == Order passed: Order { OrderId = 1 }
== APP - order-processor == Order received : Order { orderId = 2 }
== APP - checkout == Order passed: Order { OrderId = 2 }
== APP - order-processor == Order received : Order { orderId = 3 }
== APP - checkout == Order passed: Order { OrderId = 3 }
== APP - order-processor == Order received : Order { orderId = 4 }
== APP - checkout == Order passed: Order { OrderId = 4 }
== APP - order-processor == Order received : Order { orderId = 5 }
== APP - checkout == Order passed: Order { OrderId = 5 }
== APP - order-processor == Order received : Order { orderId = 6 }
== APP - checkout == Order passed: Order { OrderId = 6 }
== APP - order-processor == Order received : Order { orderId = 7 }
== APP - checkout == Order passed: Order { OrderId = 7 }
== APP - order-processor == Order received : Order { orderId = 8 }
== APP - checkout == Order passed: Order { OrderId = 8 }
== APP - order-processor == Order received : Order { orderId = 9 }
== APP - checkout == Order passed: Order { OrderId = 9 }
== APP - order-processor == Order received : Order { orderId = 10 }
== APP - checkout == Order passed: Order { OrderId = 10 }
== APP - order-processor == Order received : Order { orderId = 11 }
== APP - checkout == Order passed: Order { OrderId = 11 }
== APP - order-processor == Order received : Order { orderId = 12 }
== APP - checkout == Order passed: Order { OrderId = 12 }
== APP - order-processor == Order received : Order { orderId = 13 }
== APP - checkout == Order passed: Order { OrderId = 13 }
== APP - order-processor == Order received : Order { orderId = 14 }
== APP - checkout == Order passed: Order { OrderId = 14 }
== APP - order-processor == Order received : Order { orderId = 15 }
== APP - checkout == Order passed: Order { OrderId = 15 }
== APP - order-processor == Order received : Order { orderId = 16 }
== APP - checkout == Order passed: Order { OrderId = 16 }
== APP - order-processor == Order received : Order { orderId = 17 }
== APP - checkout == Order passed: Order { OrderId = 17 }
== APP - order-processor == Order received : Order { orderId = 18 }
== APP - checkout == Order passed: Order { OrderId = 18 }
== APP - order-processor == Order received : Order { orderId = 19 }
== APP - checkout == Order passed: Order { OrderId = 19 }
== APP - order-processor == Order received : Order { orderId = 20 }
== APP - checkout == Order passed: Order { OrderId = 20 }
Exited App successfully
```

### What happened? 

Running `dapr run -f .` in this Quickstart started both the [subscriber]({{< ref "#order-processor-service" >}}) and [publisher]({{< ref "#checkout-service" >}}) applications using the `dapr.yaml` Multi-App Run template file.

##### `dapr.yaml` Multi-App Run template file

Running the [Multi-App Run template file]({{< ref multi-app-dapr-run >}}) with `dapr run -f .` starts all applications in your project. In this Quickstart, the `dapr.yaml` file contains the following:

```yml
version: 1
apps:
  - appDirPath: ./order-processor/
    appID: order-processor
    appPort: 9001
    command: ["java", "-jar", "target/OrderProcessingService-0.0.1-SNAPSHOT.jar"]
  - appID: checkout
    appDirPath: ./checkout/
    command: ["java", "-jar", "target/CheckoutService-0.0.1-SNAPSHOT.jar"]
```

##### `order-processor` service

The `order-processor` service receives the call from the `checkout` service: 

```java
public String processOrders(@RequestBody Order body) {
        System.out.println("Order received: "+ body.getOrderId());
        return "CID" + body.getOrderId();
    }
```

##### `checkout` service

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header, which specifies the ID of the target service.

```java
.header("Content-Type", "application/json")
.header("dapr-app-id", "order-processor")

HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println("Order passed: "+ orderId)
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest version of Go](https://go.dev/dl/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/service_invocation).


```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstart clone directory, navigate to the quickstart directory.

```bash
cd service_invocation/go/http
```

### Step 3: Run the `order-processor` and `checkout` services

With the following command, simultaneously run the following services alongside their own Dapr sidecars:
- The `order-processor` service
- The `checkout` service 

```bash
dapr run -f .
```

**Expected output**

```
== APP - order-processor == Order received : Order { orderId = 1 }
== APP - checkout == Order passed: Order { OrderId = 1 }
== APP - order-processor == Order received : Order { orderId = 2 }
== APP - checkout == Order passed: Order { OrderId = 2 }
== APP - order-processor == Order received : Order { orderId = 3 }
== APP - checkout == Order passed: Order { OrderId = 3 }
== APP - order-processor == Order received : Order { orderId = 4 }
== APP - checkout == Order passed: Order { OrderId = 4 }
== APP - order-processor == Order received : Order { orderId = 5 }
== APP - checkout == Order passed: Order { OrderId = 5 }
== APP - order-processor == Order received : Order { orderId = 6 }
== APP - checkout == Order passed: Order { OrderId = 6 }
== APP - order-processor == Order received : Order { orderId = 7 }
== APP - checkout == Order passed: Order { OrderId = 7 }
== APP - order-processor == Order received : Order { orderId = 8 }
== APP - checkout == Order passed: Order { OrderId = 8 }
== APP - order-processor == Order received : Order { orderId = 9 }
== APP - checkout == Order passed: Order { OrderId = 9 }
== APP - order-processor == Order received : Order { orderId = 10 }
== APP - checkout == Order passed: Order { OrderId = 10 }
== APP - order-processor == Order received : Order { orderId = 11 }
== APP - checkout == Order passed: Order { OrderId = 11 }
== APP - order-processor == Order received : Order { orderId = 12 }
== APP - checkout == Order passed: Order { OrderId = 12 }
== APP - order-processor == Order received : Order { orderId = 13 }
== APP - checkout == Order passed: Order { OrderId = 13 }
== APP - order-processor == Order received : Order { orderId = 14 }
== APP - checkout == Order passed: Order { OrderId = 14 }
== APP - order-processor == Order received : Order { orderId = 15 }
== APP - checkout == Order passed: Order { OrderId = 15 }
== APP - order-processor == Order received : Order { orderId = 16 }
== APP - checkout == Order passed: Order { OrderId = 16 }
== APP - order-processor == Order received : Order { orderId = 17 }
== APP - checkout == Order passed: Order { OrderId = 17 }
== APP - order-processor == Order received : Order { orderId = 18 }
== APP - checkout == Order passed: Order { OrderId = 18 }
== APP - order-processor == Order received : Order { orderId = 19 }
== APP - checkout == Order passed: Order { OrderId = 19 }
== APP - order-processor == Order received : Order { orderId = 20 }
== APP - checkout == Order passed: Order { OrderId = 20 }
Exited App successfully
```

### What happened? 

Running `dapr run -f .` in this Quickstart started both the [subscriber]({{< ref "#order-processor-service" >}}) and [publisher]({{< ref "#checkout-service" >}}) applications using the `dapr.yaml` Multi-App Run template file.

##### `dapr.yaml` Multi-App Run template file

Running the [Multi-App Run template file]({{< ref multi-app-dapr-run >}}) with `dapr run -f .` starts all applications in your project. In this Quickstart, the `dapr.yaml` file contains the following:

```yml
version: 1
apps:
  - appDirPath: ./order-processor/
    appID: order-processor
    appPort: 6006
    command: ["go", "run", "."]
  - appID: checkout
    appDirPath: ./checkout/
    command: ["go", "run", "."]
```

##### `order-processor` service

In the `order-processor` service, each order is received via an HTTP POST request and processed by the `getOrder` function.

```go
func getOrder(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Order received : %s", string(data))
}
```

##### `checkout` service

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header, which specifies the ID of the target service.

```go
req.Header.Add("dapr-app-id", "order-processor")

response, err := client.Do(req)
```

{{% /codetab %}}

{{% /tabs %}}

## Run one application at a time 

Select your preferred language before proceeding with the Quickstart.

{{< tabs "Python" "JavaScript" ".NET" "Java" "Go" >}}
 <!-- Python -->
{{% codetab %}}

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.7+ installed](https://www.python.org/downloads/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/service_invocation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 3: Run `order-processor` service

In a terminal window, from the root of the Quickstart clone directory
navigate to `order-processor` directory.

```bash
cd service_invocation/python/http/order-processor
```

Install the dependencies and build the application:

```bash
pip3 install -r requirements.txt 
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-port 8001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- python3 app.py
```

> **Note**: Since Python3.exe is not defined in Windows, you may need to use `python app.py` instead of `python3 app.py`.

```py
@app.route('/orders', methods=['POST'])
def getOrder():
    data = request.json
    print('Order received : ' + json.dumps(data), flush=True)
    return json.dumps({'success': True}), 200, {
        'ContentType': 'application/json'}


app.run(port=8001)
```

### Step 4: Run `checkout` service

In a new terminal window, from the root of the Quickstart clone directory
navigate to the `checkout` directory.

```bash
cd service_invocation/python/http/checkout
```

Install the dependencies and build the application:

```bash
pip3 install -r requirements.txt 
```

Run the `checkout` service alongside a Dapr sidecar.

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- python3 app.py
```

> **Note**: Since Python3.exe is not defined in Windows, you may need to use `python app.py` instead of `python3 app.py`.

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header, which specifies the ID of the target service.

```python
headers = {'dapr-app-id': 'order-processor'}

result = requests.post(
    url='%s/orders' % (base_url),
    data=json.dumps(order),
    headers=headers
)
```

### Step 5: Use with Multi-App Run

You can run the Dapr applications in this quickstart with the [Multi-App Run template]({{< ref multi-app-dapr-run >}}). Instead of running two separate `dapr run` commands for the `order-processor` and `checkout` applications, run the following command:

```sh
dapr run -f .
```

To stop all applications, run:

```sh
dapr stop -f .
```

### Step 6: View the Service Invocation outputs

Dapr invokes an application on any Dapr instance. In the code, the sidecar programming model encourages each application to talk to its own instance of Dapr. The Dapr instances then discover and communicate with one another.

`checkout` service output:

```
== APP == Order passed: {"orderId": 1}
== APP == Order passed: {"orderId": 2}
== APP == Order passed: {"orderId": 3}
== APP == Order passed: {"orderId": 4}
== APP == Order passed: {"orderId": 5}
== APP == Order passed: {"orderId": 6}
== APP == Order passed: {"orderId": 7}
== APP == Order passed: {"orderId": 8}
== APP == Order passed: {"orderId": 9}
== APP == Order passed: {"orderId": 10}
```

`order-processor` service output:

```
== APP == Order received: {"orderId": 1}
== APP == Order received: {"orderId": 2}
== APP == Order received: {"orderId": 3}
== APP == Order received: {"orderId": 4}
== APP == Order received: {"orderId": 5}
== APP == Order received: {"orderId": 6}
== APP == Order received: {"orderId": 7}
== APP == Order received: {"orderId": 8}
== APP == Order received: {"orderId": 9}
== APP == Order received: {"orderId": 10}
```

{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest Node.js installed](https://nodejs.org/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/service_invocation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 3: Run `order-processor` service

In a terminal window, from the root of the Quickstart clone directory
navigate to `order-processor` directory.

```bash
cd service_invocation/javascript/http/order-processor
```

Install the dependencies:

```bash
npm install
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-port 5001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- npm start
```

```javascript
app.post('/orders', (req, res) => {
    console.log("Order received:", req.body);
    res.sendStatus(200);
});
```

### Step 4: Run `checkout` service

In a new terminal window, from the root of the Quickstart clone directory
navigate to the `checkout` directory.

```bash
cd service_invocation/javascript/http/checkout
```

Install the dependencies:

```bash
npm install
```

Run the `checkout` service alongside a Dapr sidecar.

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- npm start
```

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header, which specifies the ID of the target service.

```javascript
let axiosConfig = {
  headers: {
      "dapr-app-id": "order-processor"
  }
};
const res = await axios.post(`${DAPR_HOST}:${DAPR_HTTP_PORT}/orders`, order , axiosConfig);
console.log("Order passed: " + res.config.data);
```

### Step 5: Use with Multi-App Run

You can run the Dapr applications in this quickstart with the [Multi-App Run template]({{< ref multi-app-dapr-run >}}). Instead of running two separate `dapr run` commands for the `order-processor` and `checkout` applications, run the following command:

```sh
dapr run -f .
```

To stop all applications, run:

```sh
dapr stop -f .
```

### Step 6: View the Service Invocation outputs

Dapr invokes an application on any Dapr instance. In the code, the sidecar programming model encourages each application to talk to its own instance of Dapr. The Dapr instances then discover and communicate with one another.

`checkout` service output:

```
== APP == Order passed: {"orderId": 1}
== APP == Order passed: {"orderId": 2}
== APP == Order passed: {"orderId": 3}
== APP == Order passed: {"orderId": 4}
== APP == Order passed: {"orderId": 5}
== APP == Order passed: {"orderId": 6}
== APP == Order passed: {"orderId": 7}
== APP == Order passed: {"orderId": 8}
== APP == Order passed: {"orderId": 9}
== APP == Order passed: {"orderId": 10}
```

`order-processor` service output:

```
== APP == Order received: {"orderId": 1}
== APP == Order received: {"orderId": 2}
== APP == Order received: {"orderId": 3}
== APP == Order received: {"orderId": 4}
== APP == Order received: {"orderId": 5}
== APP == Order received: {"orderId": 6}
== APP == Order received: {"orderId": 7}
== APP == Order received: {"orderId": 8}
== APP == Order received: {"orderId": 9}
== APP == Order received: {"orderId": 10}
```

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET SDK or .NET 7 SDK installed](https://dotnet.microsoft.com/download).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/service_invocation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 3: Run `order-processor` service

In a terminal window, from the root of the Quickstart clone directory
navigate to `order-processor` directory.

```bash
cd service_invocation/csharp/http/order-processor
```

Install the dependencies:

```bash
dotnet restore
dotnet build
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-port 7001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- dotnet run
```

Below is the working code block from the order processor's `Program.cs` file.

```csharp
app.MapPost("/orders", (Order order) =>
{
    Console.WriteLine("Order received : " + order);
    return order.ToString();
});
```

### Step 4: Run `checkout` service

In a new terminal window, from the root of the Quickstart clone directory
navigate to the `checkout` directory.

```bash
cd service_invocation/csharp/http/checkout
```

Install the dependencies:

```bash
dotnet restore
dotnet build
```

Run the `checkout` service alongside a Dapr sidecar.

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- dotnet run
```

In the Program.cs file for the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header, which specifies the ID of the target service.

```csharp
var client = new HttpClient();
client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

client.DefaultRequestHeaders.Add("dapr-app-id", "order-processor");

var response = await client.PostAsync($"{baseURL}/orders", content);
    Console.WriteLine("Order passed: " + order);
```

### Step 5: Use with Multi-App Run

You can run the Dapr applications in this quickstart with the [Multi-App Run template]({{< ref multi-app-dapr-run >}}). Instead of running two separate `dapr run` commands for the `order-processor` and `checkout` applications, run the following command:

```sh
dapr run -f .
```

To stop all applications, run:

```sh
dapr stop -f .
```

### Step 6: View the Service Invocation outputs

Dapr invokes an application on any Dapr instance. In the code, the sidecar programming model encourages each application to talk to its own instance of Dapr. The Dapr instances then discover and communicate with one another.

`checkout` service output:

```
== APP == Order passed: Order { OrderId: 1 }
== APP == Order passed: Order { OrderId: 2 }
== APP == Order passed: Order { OrderId: 3 }
== APP == Order passed: Order { OrderId: 4 }
== APP == Order passed: Order { OrderId: 5 }
== APP == Order passed: Order { OrderId: 6 }
== APP == Order passed: Order { OrderId: 7 }
== APP == Order passed: Order { OrderId: 8 }
== APP == Order passed: Order { OrderId: 9 }
== APP == Order passed: Order { OrderId: 10 }
```

`order-processor` service output:

```
== APP == Order received: Order { OrderId: 1 }
== APP == Order received: Order { OrderId: 2 }
== APP == Order received: Order { OrderId: 3 }
== APP == Order received: Order { OrderId: 4 }
== APP == Order received: Order { OrderId: 5 }
== APP == Order received: Order { OrderId: 6 }
== APP == Order received: Order { OrderId: 7 }
== APP == Order received: Order { OrderId: 8 }
== APP == Order received: Order { OrderId: 9 }
== APP == Order received: Order { OrderId: 10 }
```

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 11 (or greater):
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads), or
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html), version 3.x.
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/service_invocation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 3: Run `order-processor` service

In a terminal window, from the root of the Quickstart clone directory
navigate to `order-processor` directory.

```bash
cd service_invocation/java/http/order-processor
```

Install the dependencies:

```bash
mvn clean install
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --app-port 9001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

```java
public String processOrders(@RequestBody Order body) {
        System.out.println("Order received: "+ body.getOrderId());
        return "CID" + body.getOrderId();
    }
```

### Step 4: Run `checkout` service

In a new terminal window, from the root of the Quickstart clone directory
navigate to the `checkout` directory.

```bash
cd service_invocation/java/http/checkout
```

Install the dependencies:

```bash
mvn clean install
```

Run the `checkout` service alongside a Dapr sidecar.

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar
```

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header, which specifies the ID of the target service.

```java
.header("Content-Type", "application/json")
.header("dapr-app-id", "order-processor")

HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println("Order passed: "+ orderId)
```

### Step 5: Use with Multi-App Run

You can run the Dapr applications in this quickstart with the [Multi-App Run template]({{< ref multi-app-dapr-run >}}). Instead of running two separate `dapr run` commands for the `order-processor` and `checkout` applications, run the following command:

```sh
dapr run -f .
```

To stop all applications, run:

```sh
dapr stop -f .
```

### Step 6: View the Service Invocation outputs

Dapr invokes an application on any Dapr instance. In the code, the sidecar programming model encourages each application to talk to its own instance of Dapr. The Dapr instances then discover and communicate with one another.

`checkout` service output:

```
== APP == Order passed: 1
== APP == Order passed: 2
== APP == Order passed: 3
== APP == Order passed: 4
== APP == Order passed: 5
== APP == Order passed: 6
== APP == Order passed: 7
== APP == Order passed: 8
== APP == Order passed: 9
== APP == Order passed: 10
```

`order-processor` service output:

```
== APP == Order received: 1
== APP == Order received: 2
== APP == Order received: 3
== APP == Order received: 4
== APP == Order received: 5
== APP == Order received: 6
== APP == Order received: 7
== APP == Order received: 8
== APP == Order received: 9
== APP == Order received: 10
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest version of Go](https://go.dev/dl/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/service_invocation).


```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 3: Run `order-processor` service

In a terminal window, from the root of the Quickstart clone directory
navigate to `order-processor` directory.

```bash
cd service_invocation/go/http/order-processor
```

Install the dependencies:

```bash
go build .
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-port 6006 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- go run .
```

Each order is received via an HTTP POST request and processed by the
`getOrder` function.

```go
func getOrder(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Order received : %s", string(data))
}
```

### Step 4: Run `checkout` service

In a new terminal window, from the root of the Quickstart clone directory
navigate to the `checkout` directory.

```bash
cd service_invocation/go/http/checkout
```

Install the dependencies:

```bash
go build .
```

Run the `checkout` service alongside a Dapr sidecar.

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- go run .
```

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header, which specifies the ID of the target service.

```go
req.Header.Add("dapr-app-id", "order-processor")

response, err := client.Do(req)
```

### Step 5: Use with Multi-App Run

You can run the Dapr applications in this quickstart with the [Multi-App Run template]({{< ref multi-app-dapr-run >}}). Instead of running two separate `dapr run` commands for the `order-processor` and `checkout` applications, run the following command:

```sh
dapr run -f .
```

To stop all applications, run:

```sh
dapr stop -f .
```

### Step 6: View the Service Invocation outputs

Dapr invokes an application on any Dapr instance. In the code, the sidecar programming model encourages each application to talk to its own instance of Dapr. The Dapr instances then discover and communicate with one another.

`checkout` service output:

```
== APP == Order passed:  {"orderId":1}
== APP == Order passed:  {"orderId":2}
== APP == Order passed:  {"orderId":3}
== APP == Order passed:  {"orderId":4}
== APP == Order passed:  {"orderId":5}
== APP == Order passed:  {"orderId":6}
== APP == Order passed:  {"orderId":7}
== APP == Order passed:  {"orderId":8}
== APP == Order passed:  {"orderId":9}
== APP == Order passed:  {"orderId":10}
```

`order-processor` service output:

```
== APP == Order received :  {"orderId":1}
== APP == Order received :  {"orderId":2}
== APP == Order received :  {"orderId":3}
== APP == Order received :  {"orderId":4}
== APP == Order received :  {"orderId":5}
== APP == Order received :  {"orderId":6}
== APP == Order received :  {"orderId":7}
== APP == Order received :  {"orderId":8}
== APP == Order received :  {"orderId":9}
== APP == Order received :  {"orderId":10}
```


{{% /codetab %}}

{{% /tabs %}}

## Tell us what you think!
We're continuously working to improve our Quickstart examples and value your feedback. Did you find this Quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next Steps

- Learn more about [Service Invocation as a Dapr building block]({{< ref service-invocation-overview.md >}})
- Learn more about how to invoke Dapr's Service Invocation with:
    - [HTTP]({{< ref howto-invoke-discover-services.md >}}), or
    - [gRPC]({{< ref howto-invoke-services-grpc.md >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
