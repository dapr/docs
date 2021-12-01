---
type: docs
title: "How-To: Invoke services using HTTP"
linkTitle: "How-To: Invoke with HTTP"
description: "Call between services using service invocation"
weight: 2000
---

This article describe how to deploy services each with an unique application ID, so that other services can discover and call endpoints on them using service invocation API.

## Example:

The below code examples loosely describes an application that processes orders. In the examples, there are two services - an order processing service and a checkout service. Both services have Dapr sidecars and the order processing service uses Dapr to invoke the checkout method in the checkout service.

<img src="/images/service_invocation_eg.png" width=1000 height=500 alt="Diagram showing service invocation of example service">

## Step 1: Choose an ID for your service

Dapr allows you to assign a global, unique ID for your app. This ID encapsulates the state for your application, regardless of the number of instances it may have.


{{< tabs Dotnet Java Python Go Javascript Kubernetes>}}


{{% codetab %}}

```bash

dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 dotnet run

dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 dotnet run

```

If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection:

```bash

dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl dotnet run

dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-ssl dotnet run

```

{{% /codetab %}}

{{% codetab %}}

```bash

dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 mvn spring-boot:run

dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 mvn spring-boot:run

```

If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection:

```bash

dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl mvn spring-boot:run

dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-ssl mvn spring-boot:run

```

{{% /codetab %}}

{{% codetab %}}

```bash

dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 -- python3 CheckoutService.py

dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py

```

If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection:

```bash

dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl -- python3 CheckoutService.py

dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-ssl -- python3 OrderProcessingService.py

```

{{% /codetab %}}


{{% codetab %}}

```bash

dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 go run CheckoutService.go

dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run OrderProcessingService.go

```

If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection:

```bash

dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl go run CheckoutService.go

dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-ssl go run OrderProcessingService.go

```

{{% /codetab %}}


{{% codetab %}}

```bash

dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 npm start

dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start

```

If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection:

```bash

dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl npm start

dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-ssl npm start

```

{{% /codetab %}}


{{% codetab %}}

### Set an app-id when deploying to Kubernetes

In Kubernetes, set the `dapr.io/app-id` annotation on your pod:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: <language>-app
  namespace: default
  labels:
    app: <language>-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: <language>-app
  template:
    metadata:
      labels:
        app: <language>-app
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "orderprocessingservice"
        dapr.io/app-port: "6001"
...
```
*If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection with the `app-ssl: "true"` annotation (full list [here]({{< ref arguments-annotations-overview.md >}}))*

{{% /codetab %}}

{{< /tabs >}}

## Step 2: Invoke the service

To invoke an application using Dapr, you can use the `invoke` API on any Dapr instance.

The sidecar programming model encourages each application to interact with its own instance of Dapr. The Dapr sidecars discover and communicate with one another.

Below are code examples that leverage Dapr SDKs for service invocation.

{{< tabs Dotnet Java Python Go Javascript>}}


{{% codetab %}}
```csharp

//dependencies
using Dapr.Client;

//code
namespace EventService
{
    class Program
    {
        static async Task Main(string[] args)
        {
          int orderId = 100;
          CancellationTokenSource source = new CancellationTokenSource();
          CancellationToken cancellationToken = source.Token;
          //Using Dapr SDK to invoke a method
          using var client = new DaprClientBuilder().Build();
          var result = client.CreateInvokeMethodRequest(HttpMethod.Get, "checkout", "checkout/" + orderId, cancellationToken);
          await client.InvokeMethodAsync(result);
        }
    }
}

```
{{% /codetab %}}


{{% codetab %}}
```java

//dependencies
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.HttpExtension;

//code
@SpringBootApplication
public class OrderProcessingServiceApplication {
	public static void main(String[] args) throws InterruptedException {
      int orderId = 100;
      //Using Dapr SDK to invoke a method
      DaprClient client = new DaprClientBuilder().build();
      var result = client.invokeMethod(
          "checkout",
          "checkout/" + orderId,
          null,
          HttpExtension.GET,
          String.class
      );
	}
}

```
{{% /codetab %}}

{{% codetab %}}
```python

#dependencies
from dapr.clients import DaprClient

#code
orderId = 100
#Using Dapr SDK to invoke a method
with DaprClient() as client:
    result = client.invoke_method(
        "checkout",
            f"checkout/{orderId}",
            data=b'',
            http_verb="GET"
    ) 

```
{{% /codetab %}}

{{% codetab %}}
```go

//dependencies
import (
	"strconv"
	dapr "github.com/dapr/go-sdk/client"

)

//code
func main() {
  orderId := 100
  //Using Dapr SDK to invoke a method
  client, err := dapr.NewClient()
  if err != nil {
    panic(err)
  }
  defer client.Close()
  ctx := context.Background()
  result, err := client.InvokeMethod(ctx, "checkout", "checkout/" + strconv.Itoa(orderId), "get")
}

```
{{% /codetab %}}

{{% codetab %}}
```javascript

//dependencies
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from 'dapr-client'; 

//code
const daprHost = "127.0.0.1";

var main = function() {
  var orderId = 100;
  //Using Dapr SDK to invoke a method
  const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
  const result = await client.invoker.invoke('checkout' , "checkout/" + orderId , HttpMethod.GET);
}

main();

```
{{% /codetab %}}

{{< /tabs >}}

### Additional URL formats

To invoke a 'GET' endpoint:
```bash
curl http://localhost:3602/v1.0/invoke/checkout/method/checkout/100
```

In order to avoid changing URL paths as much as possible, Dapr provides the following ways to call the service invocation API:


1. Change the address in the URL to `localhost:<dapr-http-port>`.
2. Add a `dapr-app-id` header to specify the ID of the target service, or alternatively pass the ID via HTTP Basic Auth: `http://dapr-app-id:<service-id>@localhost:3602/path`.

For example, the following command
```bash
curl http://localhost:3602/v1.0/invoke/checkout/method/checkout/100
```

is equivalent to:

```bash
curl -H 'dapr-app-id: checkout' 'http://localhost:3602/checkout/100' -X POST
```

or:

```bash
curl 'http://dapr-app-id:checkout@localhost:3602/checkout/100' -X POST
```

Using CLI:

```bash
dapr invoke --app-id checkout --method checkout/100
```

### Namespaces

When running on [namespace supported platforms]({{< ref "service_invocation_api.md#namespace-supported-platforms" >}}), you include the namespace of the target app in the app ID: `checkout.production`

For example, invoking the example service with a namespace would be:

```bash
curl http://localhost:3602/v1.0/invoke/checkout.production/method/checkout/100 -X POST
```

See the [Cross namespace API spec]({{< ref "service_invocation_api.md#cross-namespace-invocation" >}}) for more information on namespaces.

## Step 3: View traces and logs

The example above showed you how to directly invoke a different service running locally or in Kubernetes. Dapr outputs metrics, tracing and logging information allowing you to visualize a call graph between services, log errors and optionally log the payload body.

For more information on tracing and logs see the [observability]({{< ref observability-concept.md >}}) article.

 ## Related Links

* [Service invocation overview]({{< ref service-invocation-overview.md >}})
* [Service invocation API specification]({{< ref service_invocation_api.md >}})
