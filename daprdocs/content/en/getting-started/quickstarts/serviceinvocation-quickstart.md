---
type: docs
title: "Quickstart: Service Invocation"
linkTitle: "Service Invocation"
weight: 70
description: "Get started with Dapr's Service Invocation building block"
---

With [Dapr's Service Invocation building block](https://docs.dapr.io/developing-applications/building-blocks/service-invocation), your application can communicate reliably and securely with other applications.

<img src="/images/serviceinvocation-quickstart/service-invocation-overview.png" width=800 alt="Diagram showing the steps of service invocation" style="padding-bottom:25px;">

Dapr offers the invoke url and proxy methods for service invocation, depending on your scenario. We recommend using proxy, as it's easier for you to:

- Leverage your existing HTTP client or Protobufs.
- Perform a REST-like call, like any other client native to your language.

Based on this recommendation, in this quickstart, you'll enable the `checkout` service to invoke a method using HTTP proxy in the `order-processor` service.

Select your preferred language before proceeding with the quickstart.

{{< tabs "Python" "JavaScript" ".NET" "Java" "Go" >}}
 <!-- Python -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.7+ installed](https://www.python.org/downloads/).
- [Docker Desktop](https://www.docker.com/products/docker-desktop).

### Step 1: Set up the environment

Clone the sample we've provided.

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Run `checkout` service

In a terminal window, navigate to the `checkout` directory.

```bash
cd service_invocation/python/http/checkout
```

Install the dependencies:

```bash
pip3 install -r requirements.txt 
```

Run the `checkout` service alongside a Dapr sidecar.

```bash
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- python3 app.py
```

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header which will specify the ID of the target service. 

```python
headers = {'dapr-app-id': 'order-processor'}

result = requests.post(
    url='%s/orders' % (base_url),
    data=json.dumps(order),
    headers=headers
)
```

### Run `order-processor` service

In a new terminal window, navigate to `order-processor` directory.

```bash
cd service_invocation/python/http/order-processor
```

Install the dependencies:

```bash
pip3 install -r requirements.txt 
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-port 6001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- python3 app.py
```

```py
@app.route('/orders', methods=['POST'])
def getOrder():
    data = request.json
    print('Order received : ' + json.dumps(data), flush=True)
    return json.dumps({'success': True}), 200, {
        'ContentType': 'application/json'}


app.run(port=5001)
```

### View the Service Invocation outputs

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

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest Node.js installed](https://nodejs.org/en/download/).
- [Docker Desktop](https://www.docker.com/products/docker-desktop).

### Step 1: Set up the environment

Clone the sample we've provided.

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Run `checkout` service

In a terminal window, navigate to the `checkout` directory.

```bash
cd service_invocation/javascript/http/checkout
```

Install the dependencies:

```bash
npm install
```

Run the `checkout` service alongside a Dapr sidecar.

```bash
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- npm start
```

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header which will specify the ID of the target service. 

```javascript
let axiosConfig = {
  headers: {
      "dapr-app-id": "order-processor"
  }
};
  const res = await axios.post(`${DAPR_HOST}:${DAPR_HTTP_PORT}/orders`, order , axiosConfig);
  console.log("Order passed: " + res.config.data);
```

### Run `order-processor` service

In a new terminal window, navigate to `order-processor` directory.

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

### View the Service Invocation outputs

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

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET SDK or .NET 6 SDK installed](https://dotnet.microsoft.com/en-us/download).
- [Docker Desktop](https://www.docker.com/products/docker-desktop).

### Step 1: Set up the environment

Clone the sample we've provided.

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Run `checkout` service

In a terminal window, navigate to the `checkout` directory.

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
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- npm start
```

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header which will specify the ID of the target service.

```csharp
var client = new HttpClient();
client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

client.DefaultRequestHeaders.Add("dapr-app-id", "order-processor");

var response = await client.PostAsync($"{baseURL}/orders", content);
    Console.WriteLine("Order passed: " + order);
```

### Run `order-processor` service

In a new terminal window, navigate to `order-processor` directory.

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
dapr run --app-port 6001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- npm start
```

```csharp
app.MapPost("/orders", async context => {
    var data = await context.Request.ReadFromJsonAsync<Order>();
    Console.WriteLine("Order received : " + data);
    await context.Response.WriteAsync(data.ToString());
});
```

### View the Service Invocation outputs

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

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 11 (or greater):
  - [Oracle JDK](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11), or
  - [OpenJDK](https://jdk.java.net/13/)
- [Apache Maven](https://maven.apache.org/install.html), version 3.x.
- [Docker Desktop](https://www.docker.com/products/docker-desktop).

### Step 1: Set up the environment

Clone the sample we've provided.

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Run `checkout` service

In a terminal window, navigate to the `checkout` directory.

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

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header which will specify the ID of the target service.

```java
.header("Content-Type", "application/json")
.header("dapr-app-id", "order-processor")

HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println("Order passed: "+ orderId)
```

### Run `order-processor` service

In a new terminal window, navigate to `order-processor` directory.

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

### View the Service Invocation outputs

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

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest version of Go](https://go.dev/dl/).
- [Docker Desktop](https://www.docker.com/products/docker-desktop).

### Step 1: Set up the environment

Clone the sample we've provided.

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Run `checkout` service

In a terminal window, navigate to the `checkout` directory.

```bash
cd service_invocation/go/http/checkout
```

Install the dependencies:

```bash
go build app.go
```

Run the `checkout` service alongside a Dapr sidecar.

```bash
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- go run app.go
```

In the `checkout` service, you'll notice there's no need to rewrite your app code to use Dapr's service invocation. You can enable service invocation by simply adding the `dapr-app-id` header which will specify the ID of the target service.

```go
req.Header.Add("dapr-app-id", "order-processor")

response, err := client.Do(req)

if err != nil {
			fmt.Print(err.Error())
			os.Exit(1)
		}

		result, err := ioutil.ReadAll(response.Body)
		if err != nil {
			log.Fatal(err)
		}

		log.Println("Order passed: ", string(result))
```

### Run `order-processor` service

In a new terminal window, navigate to `order-processor` directory.

```bash
cd service_invocation/go/http/order-processor
```

Install the dependencies:

```bash
go build app.go
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-port 6001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- go run app.go
```

```go
func getOrder(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Order received : %s", string(data))
```

### View the Service Invocation outputs

Dapr invokes an application on any Dapr instance. In the code, the sidecar programming model encourages each application to talk to its own instance of Dapr. The Dapr instances then discover and communicate with one another.

`checkout` service output:

```
== APP == Order passed:  "{\"orderId\":1}"
== APP == Order passed:  "{\"orderId\":2}"
== APP == Order passed:  "{\"orderId\":3}"
== APP == Order passed:  "{\"orderId\":4}"
== APP == Order passed:  "{\"orderId\":5}"
== APP == Order passed:  "{\"orderId\":6}"
== APP == Order passed:  "{\"orderId\":7}"
== APP == Order passed:  "{\"orderId\":8}"
== APP == Order passed:  "{\"orderId\":9}"
== APP == Order passed:  "{\"orderId\":10}"
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

## Next Steps

- Learn more about [Service Invocation as a Dapr building block]({{< ref service-invocation-overview.md >}})
- Learn more about how to invoke Dapr's Service Invocation with:
    - [HTTP]({{< ref howto-invoke-discover-services.md >}}), or
    - [gRPC]({{< ref howto-invoke-services-grpc.md >}})
- Learn about [Service Invocation namespaces]({{< ref service-invocation-namespaces.md >}})
- Learn more about [Dapr component scopes]({{< ref component-scopes.md >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}