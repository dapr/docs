---
type: docs
title: "How-To: Invoke services using HTTP"
linkTitle: "How-To: Invoke with HTTP"
description: "Call between services using service invocation"
weight: 2000
---

This article describe how to deploy services each with an unique application ID, so that other services can discover and call endpoints on them using service invocation API.

## Example:

There are two services called order processing service and checkout service. Dapr sdk that is used in order processing service is used to invoke checkout service. Both order processing service and checkout service have dapr side car.

<img src="/images/service-invocation-overview.png" width=800 alt="Diagram showing service invocation of example service">

## Step 1: Choose an ID for your service

Dapr allows you to assign a global, unique ID for your app. This ID encapsulates the state for your application, regardless of the number of instances it may have.


{{< tabs Dotnet Java Python Go Javascript PHP Kubernetes>}}


{{% codetab %}}

```bash

dapr run --app-id checkoutservice --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 dotnet run

dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 dotnet run

```

If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection:

```bash

dapr run --app-id checkoutservice --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl dotnet run

dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-ssl dotnet run

```

{{% /codetab %}}

{{% codetab %}}

```bash

dapr run --app-id checkoutservice --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 mvn spring-boot:run

dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 mvn spring-boot:run

```

If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection:

```bash

dapr run --app-id checkoutservice --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl mvn spring-boot:run

dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-ssl mvn spring-boot:run

```

{{% /codetab %}}

{{% codetab %}}

```bash

dapr run --app-id checkoutservice --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 -- python3 CheckoutService.py

dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py

```

If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection:

```bash

dapr run --app-id checkoutservice --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl -- python3 CheckoutService.py

dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-ssl -- python3 OrderProcessingService.py

```

{{% /codetab %}}


{{% codetab %}}

```bash

dapr run --app-id checkoutservice --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 go run CheckoutService.go

dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run OrderProcessingService.go

```

If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection:

```bash

dapr run --app-id checkoutservice --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl go run CheckoutService.go

dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-ssl go run OrderProcessingService.go

```

{{% /codetab %}}


{{% codetab %}}

```bash

dapr run --app-id checkoutservice --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 npm start

dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start

```

If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection:

```bash

dapr run --app-id checkoutservice --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl npm start

dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-ssl npm start

```

{{% /codetab %}}


{{% codetab %}}

```bash

dapr run --app-id checkoutservice --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 sudo brew services stop nginx

dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 php CheckoutService.php

```

If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection:

```bash

dapr run --app-id checkoutservice --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl sudo brew services stop nginx

dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-ssl php CheckoutService.php

```

{{% /codetab %}}


{{% codetab %}}

### Setup an ID using Kubernetes

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

Dapr uses a sidecar, decentralized architecture. To invoke an application using Dapr, you can use the `invoke` API on any Dapr instance.

The sidecar programming model encourages each applications to talk to its own instance of Dapr. The Dapr instances discover and communicate with one another.

{{< tabs Dotnet Java Python Go Javascript PHP curl CLI >}}


{{% codetab %}}
```bash

//headers

using Dapr.Client;
using System.Net.Http;

//code

CancellationTokenSource source = new CancellationTokenSource();
CancellationToken cancellationToken = source.Token;
using var client = new DaprClientBuilder().Build();
var result = client.CreateInvokeMethodRequest(HttpMethod.Get, "checkoutservice", "checkout/" + orderId, cancellationToken);
await client.InvokeMethodAsync(result);

```
{{% /codetab %}}


{{% codetab %}}
```bash

//headers

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.HttpExtension;

//code

DaprClient daprClient = new DaprClientBuilder().build();
var result = daprClient.invokeMethod(
    "checkoutservice",
    "checkout/" + orderId,
    null,
    HttpExtension.GET,
    String.class
);

```
{{% /codetab %}}

{{% codetab %}}
```bash

//headers

from dapr.clients import DaprClient

//code

with DaprClient() as daprClient:
  result = daprClient.invoke_method(
      "checkoutservice",
          f"checkout/{orderId}",
          data=b'',
          http_verb="GET"
  )    

```
{{% /codetab %}}

{{% codetab %}}
```bash

//headers
import (
	dapr "github.com/dapr/go-sdk/client"
)

//code

client, err := dapr.NewClient()
if err != nil {
  panic(err)
}
defer client.Close()
ctx := context.Background()

result, err := client.InvokeMethod(ctx, "checkoutservice", "checkout/" + strconv.Itoa(orderId), "get") 

```
{{% /codetab %}}

{{% codetab %}}
```bash

//headers

import { DaprClient, HttpMethod, CommunicationProtocolEnum } from 'dapr-client'; 

//code

const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
const result = await client.invoker.invoke('checkoutservice' , "checkout/" + orderId , HttpMethod.GET);   

```
{{% /codetab %}}

{{% codetab %}}
```bash

//headers

namespace Dapr\Client\DaprClient;

//code

$client = \Dapr\Client\DaprClient::clientBuilder()->build();
$result = $client->invokeMethod('GET', new AppId('checkoutservice'), 'checkout/' + orderId, 'test');  

```
{{% /codetab %}}

{{% codetab %}}
To invoke a 'GET' endpoint:

```bash
curl http://localhost:3602/v1.0/invoke/checkoutservice/method/checkout/<id>
```

### Additional URL formats

In order to avoid changing URL paths as much as possible, Dapr provides the following ways to call the service invocation API:


1. Change the address in the URL to `localhost:<dapr-http-port>`.
2. Add a `dapr-app-id` header to specify the ID of the target service, or alternatively pass the ID via HTTP Basic Auth: `http://dapr-app-id:<service-id>@localhost:3602/path`.

For example, the following command
```bash
curl http://localhost:3602/v1.0/invoke/checkoutservice/method/checkout/100
```

is equivalent to:

```bash
curl -H 'dapr-app-id: checkoutservice' 'http://localhost:3602/checkout/100' -X POST
```

or:

```bash
curl 'http://dapr-app-id:checkoutservice@localhost:3602/checkout/100' -X POST
```

{{% /codetab %}}

{{% codetab %}}
```bash
dapr invoke --app-id checkoutservice --method checkout/100
```
{{% /codetab %}}

{{< /tabs >}}

### Namespaces

When running on [namespace supported platforms]({{< ref "service_invocation_api.md#namespace-supported-platforms" >}}), you include the namespace of the target app in the app ID: `myApp.production`

For example, invoking the example python service with a namespace would be:

```bash
curl http://localhost:3602/v1.0/invoke/checkoutservice.production/method/checkout/100 -X POST
```

See the [Cross namespace API spec]({{< ref "service_invocation_api.md#cross-namespace-invocation" >}}) for more information on namespaces.

## Step 3: View traces and logs

The example above showed you how to directly invoke a different service running locally or in Kubernetes. Dapr outputs metrics, tracing and logging information allowing you to visualize a call graph between services, log errors and optionally log the payload body.

For more information on tracing and logs see the [observability]({{< ref observability-concept.md >}}) article.

 ## Related Links

* [Service invocation overview]({{< ref service-invocation-overview.md >}})
* [Service invocation API specification]({{< ref service_invocation_api.md >}})
