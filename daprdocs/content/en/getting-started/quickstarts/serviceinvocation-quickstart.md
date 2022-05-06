---
type: docs
title: "Quickstart: Service Invocation"
linkTitle: "Service Invocation"
weight: 70
description: "Get started with Dapr's Service Invocation building block"
---

With [Dapr's Service Invocation building block](https://docs.dapr.io/developing-applications/building-blocks/service-invocation), your application can communicate reliably and securely with other applications.

<img src="/images/serviceinvocation-quickstart/service-invocation-overview.png" width=800 alt="Diagram showing the steps of service invocation" style="padding-bottom:25px;">

Dapr offers several methods for service invocation, which you can choose depending on your scenario. For this Quickstart, you'll enable the checkout service to invoke a method using HTTP proxy in the order-processor service.

Learn more about Dapr's methods for service invocation in the [overview article]({{< ref service-invocation-overview.md >}}).

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
dapr run --app-port 7001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- python3 app.py
```

```py
@app.route('/orders', methods=['POST'])
def getOrder():
    data = request.json
    print('Order received : ' + json.dumps(data), flush=True)
    return json.dumps({'success': True}), 200, {
        'ContentType': 'application/json'}


app.run(port=7001)
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

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header, which specifies the ID of the target service.

```python
headers = {'dapr-app-id': 'order-processor'}

result = requests.post(
    url='%s/orders' % (base_url),
    data=json.dumps(order),
    headers=headers
)
```
### Step 5: View the Service Invocation outputs

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
dapr run --app-port 6001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- npm start
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

### Step 5: View the Service Invocation outputs

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
- [.NET SDK or .NET 6 SDK installed](https://dotnet.microsoft.com/download).
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

```csharp
app.MapPost("/orders", async context => {
    var data = await context.Request.ReadFromJsonAsync<Order>();
    Console.WriteLine("Order received : " + data);
    await context.Response.WriteAsync(data.ToString());
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

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header, which specifies the ID of the target service.

```csharp
var client = new HttpClient();
client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

client.DefaultRequestHeaders.Add("dapr-app-id", "order-processor");

var response = await client.PostAsync($"{baseURL}/orders", content);
    Console.WriteLine("Order passed: " + order);
```

### Step 5: View the Service Invocation outputs

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
  - [Oracle JDK](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11), or
  - [OpenJDK](https://jdk.java.net/13/)
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
dapr run --app-id order-processor --app-port 6001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
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

### Step 5: View the Service Invocation outputs

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
go build app.go
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-port 5001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- go run app.go
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
```

### Step 4: Run `checkout` service

In a new terminal window, from the root of the Quickstart clone directory
navigate to the `checkout` directory.

```bash
cd service_invocation/go/http/checkout
```

Install the dependencies:

```bash
go build app.go
```

Run the `checkout` service alongside a Dapr sidecar.

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- go run app.go
```

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header, which specifies the ID of the target service.

```go
req.Header.Add("dapr-app-id", "order-processor")

response, err := client.Do(req)
```

### Step 5: View the Service Invocation outputs

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

Join the discussion in our [discord channel](https://discord.gg/22ZtJrNe).

## Next Steps

- Learn more about [Service Invocation as a Dapr building block]({{< ref service-invocation-overview.md >}})
- Learn more about how to invoke Dapr's Service Invocation with:
    - [HTTP]({{< ref howto-invoke-discover-services.md >}}), or
    - [gRPC]({{< ref howto-invoke-services-grpc.md >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
