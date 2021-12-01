---
type: docs
title: "How To: Retrieve a secret"
linkTitle: "How To: Retrieve a secret"
weight: 2000
description: "Use the secret store building block to securely retrieve a secret"
---

This article provides guidance on using Dapr's secrets API in your code to leverage the [secrets store building block]({{<ref secrets-overview>}}). The secrets API allows you to easily retrieve secrets in your application code from a configured secret store.

## Example

The below code examples loosely describe an application that processes orders. In the examples, there is an order processing service which has a Dapr sidecar. The order processing service uses Dapr to store secret in a local secret store.

<img src="/images/building-block-secrets-management-example.png" width=1000 alt="Diagram showing secrets management of example service">

## Set up a secret store

Before retrieving secrets in your application's code, you must have a secret store component configured. For the purposes of this guide, as an example you will configure a local secret store which uses a local JSON file to store secrets.

>Note: The component used in this example is not secured and is not recommended for production deployments. You can find other alternatives [here]({{<ref supported-secret-stores >}}).

Create a file named `secrets.json` with the following contents:

```json
{
   "secret": "Order Processing pass key"
}
```

Create a directory for your components file named `components` and inside it create a file named `localSecretStore.yaml` with the following contents:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localsecretstore
  namespace: default
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: secrets.json
  - name: nestedSeparator
    value: ":"
```

To configure a different kind of secret store see the guidance on [how to configure a secret store]({{<ref setup-secret-store>}}) and review [supported secret stores]({{<ref supported-secret-stores >}}) to see specific details required for different secret store solutions.
## Get a secret

Now run the Dapr sidecar (with no application)


{{< tabs Dotnet Java Python Go Javascript>}}

{{% codetab %}}
```bash
dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --components-path ./components dotnet run
```
{{% /codetab %}}


{{% codetab %}}
```bash
dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --components-path ./components mvn spring-boot:run
```
{{% /codetab %}}


{{% codetab %}}
```bash
dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --components-path ./components python3 OrderProcessingService.py
```
{{% /codetab %}}


{{% codetab %}}
```bash
dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --components-path ./components go run OrderProcessingService.go
```
{{% /codetab %}}


{{% codetab %}}
```bash
dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --components-path ./components npm start
```
{{% /codetab %}}

{{< /tabs >}}

And now you can get the secret by calling the Dapr sidecar using the secrets API:

```bash
curl http://localhost:3601/v1.0/secrets/localsecretstore/secret
```

For a full API reference, go [here]({{< ref secrets_api.md >}}).

## Calling the secrets API from your code

Once you have a secret store set up, call Dapr to get the secrets from your application code. Below are code examples that leverage Dapr SDKs for retrieving a secret.

{{< tabs Dotnet Java Python Go Javascript>}}

{{% codetab %}}
```csharp

//dependencies
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Dapr.Client;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Text.Json;

//code
namespace EventService
{
    class Program
    {
        static async Task Main(string[] args)
        {
            string SECRET_STORE_NAME = "localsecretstore";
            using var client = new DaprClientBuilder().Build();
            //Using Dapr SDK to get a secret
            var secret = await client.GetSecretAsync(SECRET_STORE_NAME, "secret");
            Console.WriteLine($"Result: {string.Join(", ", secret)}");
            secret = await client.GetSecretAsync(SECRET_STORE_NAME, "secret");
            Console.WriteLine($"Result for bulk: {string.Join(", ", secret.Keys)}");
        }
    }
}

```
{{% /codetab %}}

{{% codetab %}}

```java

//dependencies
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

//code
@SpringBootApplication
public class OrderProcessingServiceApplication {

	private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);
	private static final ObjectMapper JSON_SERIALIZER = new ObjectMapper();

	private static final String SECRET_STORE_NAME = "localsecretstore";

	public static void main(String[] args) throws InterruptedException, JsonProcessingException {
		DaprClient client = new DaprClientBuilder().build();
        //Using Dapr SDK to get a secret
		Map<String, String> secret = client.getSecret(SECRET_STORE_NAME, "secret").block();
		log.info("Result: " + JSON_SERIALIZER.writeValueAsString(secret));
		try {
			secret = client.getSecret(SECRET_STORE_NAME, "secret").block();
			log.info("Result for random key: " + JSON_SERIALIZER.writeValueAsString(secret));
		} catch (Exception ex) {
			System.out.println("Got error for accessing key");
		}
	}
}

```
{{% /codetab %}}

{{% codetab %}}

```python

#dependencies 
import logging
from dapr.clients import DaprClient
from dapr.clients.grpc._state import StateItem
from dapr.clients.grpc._request import TransactionalStateOperation, TransactionOperationType

#code
logging.basicConfig(level = logging.INFO)
    
DAPR_STORE_NAME = "localsecretstore"
key = 'secret'

with DaprClient() as client:
    #Using Dapr SDK to get a secret
    secret = client.get_secret(store_name=DAPR_STORE_NAME, key=key)
    logging.info('Result: ')
    logging.info(secret.secret)
    secret = client.get_bulk_secret(store_name=DAPR_STORE_NAME)
    logging.info('Result for bulk secret: ')
    logging.info(sorted(secret.secrets.items()))
    try:
        secret = client.get_secret(store_name=DAPR_STORE_NAME, key=key)
        logging.info('Result for random key: ')
        logging.info(secret.secret)
    except:
        print("Got error for accessing key")

```
{{% /codetab %}}

{{% codetab %}}

```go

//dependencies 
import (
	"context"
	"log"
	dapr "github.com/dapr/go-sdk/client"
)

//code
func main() {
	client, err := dapr.NewClient()
	SECRET_STORE_NAME := "localsecretstore"
	if err != nil {
		panic(err)
	}
	defer client.Close()
	ctx := context.Background()

	secret, err := client.GetSecret(ctx, SECRET_STORE_NAME, "secret", nil)
	if err != nil {
		return nil, errors.Wrap(err, "Got error for accessing key")
	}

	if secret != nil {
		log.Println("Result : ")
		log.Println(secret)
	}

	secretRandom, err := client.GetBulkSecret(ctx, SECRET_STORE_NAME, nil)
	if err != nil {
		return nil, errors.Wrap(err, "Got error for accessing key")
	}

	if secret != nil {
		log.Println("Result for bulk: ")
		log.Println(secretRandom)
	}
}

```
{{% /codetab %}}

{{% codetab %}}

```javascript

//dependencies 
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from 'dapr-client'; 

//code
const daprHost = "127.0.0.1"; 

async function main() {
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const SECRET_STORE_NAME = "localsecretstore";
    var secret = await client.secret.get(SECRET_STORE_NAME, "secret");
    console.log("Result: " + secret);
    secret = await client.secret.getBulk(SECRET_STORE_NAME);
    console.log("Result for bulk: " + secret);
}

main();

```
{{% /codetab %}}

{{< /tabs >}}

## Related links

- [Dapr secrets overview]({{<ref secrets-overview>}})
- [Secrets API reference]({{<ref secrets_api>}})
- [Configure a secret store]({{<ref setup-secret-store>}})
- [Supported secrets]({{<ref supported-secret-stores>}})
- [Using secrets in components]({{<ref component-secrets>}})
- [Secret stores quickstart](https://github.com/dapr/quickstarts/tree/master/secretstore)