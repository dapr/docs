---
type: docs
title: "How-To: Invoke services using HTTP"
linkTitle: "How-To: Invoke with HTTP"
description: "Call between services using service invocation"
weight: 2000
---

This article demonstrates how to deploy services each with an unique application ID for other services to discover and call endpoints on them using service invocation over HTTP.

<img src="/images/building-block-service-invocation-example.png" width=1000 height=500 alt="Diagram showing service invocation of example service">

{{% alert title="Note" color="primary" %}}
 If you haven't already, [try out the service invocation quickstart]({{< ref serviceinvocation-quickstart.md >}}) for a quick walk-through on how to use the service invocation API.

{{% /alert %}}

## Choose an ID for your service

Dapr allows you to assign a global, unique ID for your app. This ID encapsulates the state for your application, regardless of the number of instances it may have.

{{< tabs ".NET" Java Python Go JavaScript Kubernetes>}}

{{% codetab %}}

```bash
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- dotnet run

dapr run --app-port 7001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- dotnet run
```

If your app uses a TLS, you can tell Dapr to invoke your app over a TLS connection by setting `--app-protocol https`:

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3500 --dapr-grpc-port 60002 --app-protocol https dotnet run

dapr run --app-id order-processor --app-port 7001 --dapr-http-port 3501 --dapr-grpc-port 60001 --app-protocol https dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar

dapr run --app-id order-processor --app-port 9001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

If your app uses a TLS, you can tell Dapr to invoke your app over a TLS connection by setting `--app-protocol https`:

```bash

dapr run --app-id checkout --app-port 9002 --dapr-http-port 3500 --dapr-grpc-port 60002 --app-protocol https mvn spring-boot:run

dapr run --app-id order-processor --app-port 9001 --dapr-http-port 3501 --dapr-grpc-port 60001 --app-protocol https mvn spring-boot:run

```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- python3 checkout/app.py

dapr run --app-port 8001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- python3 order-processor/app.py
```

If your app uses a TLS, you can tell Dapr to invoke your app over a TLS connection by setting `--app-protocol https`:

```bash
dapr run --app-id checkout --app-port 8002 --dapr-http-port 3500 --dapr-grpc-port 60002 --app-protocol https -- python3 CheckoutService.py

dapr run --app-id order-processor --app-port 8001 --dapr-http-port 3501 --dapr-grpc-port 60001 --app-protocol https -- python3 OrderProcessingService.py
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id checkout --dapr-http-port 3500 -- go run .

dapr run --app-port 6006 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- go run .
```

If your app uses a TLS, you can tell Dapr to invoke your app over a TLS connection by setting `--app-protocol https`:

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3500 --dapr-grpc-port 60002 --app-protocol https go run CheckoutService.go

dapr run --app-id order-processor --app-port 6006 --dapr-http-port 3501 --dapr-grpc-port 60001 --app-protocol https go run OrderProcessingService.go
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- npm start

dapr run --app-port 5001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- npm start
```

If your app uses a TLS, you can tell Dapr to invoke your app over a TLS connection by setting `--app-protocol https`:

```bash
dapr run --app-id checkout --app-port 5002 --dapr-http-port 3500 --dapr-grpc-port 60002 --app-protocol https npm start

dapr run --app-id orderprocessing --app-port 5001 --dapr-http-port 3501 --dapr-grpc-port 60001 --app-protocol https npm start
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

If your app uses a TLS connection, you can tell Dapr to invoke your app over TLS with the `app-protocol: "https"` annotation (full list [here]({{< ref arguments-annotations-overview.md >}})). Note that Dapr does not validate TLS certificates presented by the app.

{{% /codetab %}}

{{< /tabs >}}

## Invoke the service

To invoke an application using Dapr, you can use the `invoke` API on any Dapr instance. The sidecar programming model encourages each application to interact with its own instance of Dapr. The Dapr sidecars discover and communicate with one another.

Below are code examples that leverage Dapr SDKs for service invocation.

{{< tabs ".NET" Java Python Go Javascript>}}

{{% codetab %}}

```csharp
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var baseURL = (Environment.GetEnvironmentVariable("BASE_URL") ?? "http://localhost") + ":" + (Environment.GetEnvironmentVariable("DAPR_HTTP_PORT") ?? "3500");

var client = new HttpClient();
client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
// Adding app id as part of the header
client.DefaultRequestHeaders.Add("dapr-app-id", "order-processor");

for (int i = 1; i <= 20; i++) {
    var order = new Order(i);
    var orderJson = JsonSerializer.Serialize<Order>(order);
    var content = new StringContent(orderJson, Encoding.UTF8, "application/json");

    // Invoking a service
    var response = await client.PostAsync($"{baseURL}/orders", content);
    Console.WriteLine("Order passed: " + order);

    await Task.Delay(TimeSpan.FromSeconds(1));
}

public record Order([property: JsonPropertyName("orderId")] int OrderId);
```

{{% /codetab %}}

{{% codetab %}}

```java
package com.service;

import org.json.JSONObject;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

public class CheckoutServiceApplication {
	private static final HttpClient httpClient = HttpClient.newBuilder()
			.version(HttpClient.Version.HTTP_2)
			.connectTimeout(Duration.ofSeconds(10))
			.build();

	private static final String DAPR_HTTP_PORT = System.getenv().getOrDefault("DAPR_HTTP_PORT", "3500");

	public static void main(String[] args) throws InterruptedException, IOException {
		String dapr_url = "http://localhost:" + DAPR_HTTP_PORT + "/orders";
		for (int i=1; i<=20; i++) {
			int orderId = i;
			JSONObject obj = new JSONObject();
			obj.put("orderId", orderId);

			HttpRequest request = HttpRequest.newBuilder()
					.POST(HttpRequest.BodyPublishers.ofString(obj.toString()))
					.uri(URI.create(dapr_url))
					.header("Content-Type", "application/json")
					.header("dapr-app-id", "order-processor")
					.build();

			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			System.out.println("Order passed: "+ orderId);
			TimeUnit.MILLISECONDS.sleep(1000);
		}
	}
}
```

{{% /codetab %}}

{{% codetab %}}

```python
import json
import time
import logging
import requests
import os

logging.basicConfig(level=logging.INFO)

base_url = os.getenv('BASE_URL', 'http://localhost') + ':' + os.getenv(
                    'DAPR_HTTP_PORT', '3500')
# Adding app id as part of the header
headers = {'dapr-app-id': 'order-processor', 'content-type': 'application/json'}

for i in range(1, 20):
    order = {'orderId': i}

    # Invoking a service
    result = requests.post(
        url='%s/orders' % (base_url),
        data=json.dumps(order),
        headers=headers
    )
    print('Order passed: ' + json.dumps(order), flush=True)

    time.sleep(1)
```

{{% /codetab %}}

{{% codetab %}}

```go
package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

func main() {
	daprHost := os.Getenv("DAPR_HOST")
	if daprHost == "" {
		daprHost = "http://localhost"
	}
	daprHttpPort := os.Getenv("DAPR_HTTP_PORT")
	if daprHttpPort == "" {
		daprHttpPort = "3500"
	}
	client := &http.Client{
		Timeout: 15 * time.Second,
	}
	for i := 1; i <= 20; i++ {
		order := `{"orderId":` + strconv.Itoa(i) + "}"
		req, err := http.NewRequest("POST", daprHost+":"+daprHttpPort+"/orders", strings.NewReader(order))
		if err != nil {
			log.Fatal(err.Error())
		}

		// Adding app id as part of the header
		req.Header.Add("dapr-app-id", "order-processor")

		// Invoking a service
		response, err := client.Do(req)
		if err != nil {
			log.Fatal(err.Error())
		}

		// Read the response
		result, err := ioutil.ReadAll(response.Body)
		if err != nil {
			log.Fatal(err)
		}
		response.Body.Close()

		fmt.Println("Order passed:", string(result))
	}
}
```

{{% /codetab %}}

{{% codetab %}}

```javascript
import axios from "axios";

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";

async function main() {
  // Adding app id as part of the header
  let axiosConfig = {
    headers: {
        "dapr-app-id": "order-processor"
    }
  };
  
  for(var i = 1; i <= 20; i++) {
    const order = {orderId: i};

    // Invoking a service
    const res = await axios.post(`${DAPR_HOST}:${DAPR_HTTP_PORT}/orders`, order , axiosConfig);
    console.log("Order passed: " + res.config.data);

    await sleep(1000);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(e => console.error(e))
```

{{% /codetab %}}

{{< /tabs >}}

### Additional URL formats

To invoke a 'GET' endpoint:

```bash
curl http://localhost:3602/v1.0/invoke/checkout/method/checkout/100
```

To avoid changing URL paths as much as possible, Dapr provides the following ways to call the service invocation API:

1. Change the address in the URL to `localhost:<dapr-http-port>`.
2. Add a `dapr-app-id` header to specify the ID of the target service, or alternatively pass the ID via HTTP Basic Auth: `http://dapr-app-id:<service-id>@localhost:3602/path`.

For example, the following command:

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

When running on [namespace supported platforms]({{< ref "service_invocation_api.md#namespace-supported-platforms" >}}), you include the namespace of the target app in the app ID. For example, following the `<app>.<namespace>` format, use `checkout.production`.

Using this example, invoking the service with a namespace would look like:

```bash
curl http://localhost:3602/v1.0/invoke/checkout.production/method/checkout/100 -X POST
```

See the [Cross namespace API spec]({{< ref "service_invocation_api.md#cross-namespace-invocation" >}}) for more information on namespaces.

## View traces and logs

Our example above showed you how to directly invoke a different service running locally or in Kubernetes. Dapr:

- Outputs metrics, tracing, and logging information,
- Allows you to visualize a call graph between services and log errors, and
- Optionally, log the payload body.

For more information on tracing and logs, see the [observability]({{< ref observability-concept.md >}}) article.

## Related Links

- [Service invocation overview]({{< ref service-invocation-overview.md >}})
- [Service invocation API specification]({{< ref service_invocation_api.md >}})