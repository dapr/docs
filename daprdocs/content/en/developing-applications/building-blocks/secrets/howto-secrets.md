---
type: docs
title: "How To: Retrieve a secret"
linkTitle: "How To: Retrieve a secret"
weight: 2000
description: "Use the secret store building block to securely retrieve a secret"
---

Now that you've learned [what the Dapr secrets building block provides]({{< ref secrets-overview >}}), learn how it can work in your service. This guide demonstrates how to call the secrets API and retrieve secrets in your application code from a configured secret store.

<img src="/images/howto-secrets/secrets-mgmt-overview.png" width=1000 alt="Diagram showing secrets management of example service.">

{{% alert title="Note" color="primary" %}}
 If you haven't already, [try out the secrets management quickstart]({{< ref secrets-quickstart.md >}}) for a quick walk-through on how to use the secrets API.

{{% /alert %}}

## Set up a secret store

Before retrieving secrets in your application's code, you must configure a secret store component. This example configures a secret store that uses a local JSON file to store secrets.

{{% alert title="Warning" color="warning" %}}
In a production-grade application, local secret stores are not recommended. [Find alternatives]({{< ref supported-secret-stores >}}) to securely manage your secrets.
{{% /alert %}}

In your project directory, create a file named `secrets.json` with the following contents:

```json
{
   "secret": "Order Processing pass key"
}
```

Create a new directory named `components`. Navigate into that directory and create a component file named `local-secret-store.yaml` with the following contents:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localsecretstore
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: secrets.json  #path to secrets file
  - name: nestedSeparator
    value: ":"
```

{{% alert title="Warning" color="warning" %}}
The path to the secret store JSON is relative to where you call `dapr run`.
{{% /alert %}}

For more information:

- See how to [configure a different kind of secret store]({{< ref setup-secret-store >}}).
- Review [supported secret stores]({{< ref supported-secret-stores >}}) to see specific details required for different secret store solutions.

## Get a secret

Get the secret by calling the Dapr sidecar using the secrets API:

```bash
curl http://localhost:3601/v1.0/secrets/localsecretstore/secret
```

See a [full API reference]({{< ref secrets_api.md >}}).

## Calling the secrets API from your code

Now that you've set up the local secret store, call Dapr to get the secrets from your application code. Below are code examples that leverage Dapr SDKs for retrieving a secret.

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
import java.util.Map;


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
    }
}
```

{{% /codetab %}}

{{% codetab %}}

```python
#dependencies 
import random
from time import sleep    
import requests
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
    #Using Dapr SDK to get bulk secrets
    secret = client.get_bulk_secret(store_name=DAPR_STORE_NAME)
    logging.info('Result for bulk secret: ')
    logging.info(sorted(secret.secrets.items()))
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
     //Using Dapr SDK to get a secret
	secret, err := client.GetSecret(ctx, SECRET_STORE_NAME, "secret", nil)
	if secret != nil {
		log.Println("Result : ")
		log.Println(secret)
	}
    //Using Dapr SDK to get bulk secrets
	secretBulk, err := client.GetBulkSecret(ctx, SECRET_STORE_NAME, nil)

	if secret != nil {
		log.Println("Result for bulk: ")
		log.Println(secretBulk)
	}
}
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies 
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from '@dapr/dapr'; 

//code
const daprHost = "127.0.0.1"; 

async function main() {
    const client = new DaprClient({
        daprHost,
        daprPort: process.env.DAPR_HTTP_PORT,
        communicationProtocol: CommunicationProtocolEnum.HTTP,
    });
    const SECRET_STORE_NAME = "localsecretstore";
    //Using Dapr SDK to get a secret
    var secret = await client.secret.get(SECRET_STORE_NAME, "secret");
    console.log("Result: " + secret);
    //Using Dapr SDK to get bulk secrets
    secret = await client.secret.getBulk(SECRET_STORE_NAME);
    console.log("Result for bulk: " + secret);
}

main();
```

{{% /codetab %}}

{{< /tabs >}}

## Related links

- Review the [Dapr secrets API features]({{< ref secrets-overview >}}).
- Learn how to [use secrets scopes]({{< ref secrets-scopes >}})
- Read the [secrets API reference]({{< ref secrets_api >}}) and review the [supported secrets]({{< ref supported-secret-stores >}}).
- Learn how to [set up different secret store components]({{< ref setup-secret-store >}}) and how to [reference secrets in your component]({{< ref component-secrets >}}).