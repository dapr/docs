---
type: docs
title: "How-To: Save and get state"
linkTitle: "How-To: Save & get state"
weight: 200
description: "Use key value pairs to persist a state"
---

## Introduction

State management is one of the most common needs of any application: new or legacy, monolith or microservice.
Dealing with different databases libraries, testing them, handling retries and faults can be time consuming and hard.

Dapr provides state management capabilities that include consistency and concurrency options.
In this guide we'll start of with the basics: Using the key/value state API to allow an application to save, get and delete state.

## Pre-requisites

- [Dapr CLI]({{< ref install-dapr-cli.md >}})
- Initialized [Dapr environment]({{< ref install-dapr-selfhost.md >}})

## Example:

The below code examples loosely describe an application that processes orders. In the examples, there is an order processing service which has a Dapr sidecar. The order processing service uses Dapr to store state in a Redis state store.

<img src="/images/building-block-state-management-example.png" width=1000 alt="Diagram showing state management of example service">

## Step 1: Setup a state store

A state store component represents a resource that Dapr uses to communicate with a database.

For the purpose of this guide we'll use a Redis state store, but any state store from the [supported list]({{< ref supported-state-stores >}}) will work.

{{< tabs "Self-Hosted (CLI)" Kubernetes>}}

{{% codetab %}}
When using `dapr init` in Standalone mode, the Dapr CLI automatically provisions a state store (Redis) and creates the relevant YAML in a `components` directory, which for Linux/MacOS is `$HOME/.dapr/components` and for Windows is `%USERPROFILE%\.dapr\components`

To optionally change the state store being used, replace the YAML file `statestore.yaml` under `/components` with the file of your choice.
{{% /codetab %}}

{{% codetab %}}

To deploy this into a Kubernetes cluster, fill in the `metadata` connection details of your [desired statestore component]({{< ref supported-state-stores >}}) in the yaml below, save as `statestore.yaml`, and run `kubectl apply -f statestore.yaml`.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```
See the instructions [here]({{< ref "setup-state-store" >}}) on how to setup different state stores on Kubernetes.

{{% /codetab %}}

{{< /tabs >}}

## Step 2: Save and retrieve a single state

The following example shows how to save and retrieve a single key/value pair using the Dapr state building block.

{{% alert title="Note" color="warning" %}}
It is important to set an app-id, as the state keys are prefixed with this value. If you don't set it one is generated for you at runtime, and the next time you run the command a new one will be generated and you will no longer be able to access previously saved state.
{{% /alert %}}

Below are code examples that leverage Dapr SDKs for saving and retrieving a single state.

{{< tabs Dotnet Java Python Go Javascript "HTTP API (Bash)" "HTTP API (PowerShell)">}}

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
            string DAPR_STORE_NAME = "statestore";
            while(true) {
                System.Threading.Thread.Sleep(5000);
                using var client = new DaprClientBuilder().Build();
                Random random = new Random();
                int orderId = random.Next(1,1000);
                //Using Dapr SDK to save and get state
                await client.SaveStateAsync(DAPR_STORE_NAME, "order_1", orderId.ToString());
                await client.SaveStateAsync(DAPR_STORE_NAME, "order_2", orderId.ToString());
                var result = await client.GetStateAsync<string>(DAPR_STORE_NAME, orderId.ToString());
                Console.WriteLine("Result after get: " + result);
            }
        }
    }
}
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 dotnet run
```

{{% /codetab %}}


{{% codetab %}}

```java
//dependencies
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import io.dapr.client.domain.TransactionalStateOperation;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;
import java.util.Random;
import java.util.concurrent.TimeUnit;

//code
@SpringBootApplication
public class OrderProcessingServiceApplication {

	private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);

	private static final String STATE_STORE_NAME = "statestore";

	public static void main(String[] args) throws InterruptedException{
		while(true) {
			TimeUnit.MILLISECONDS.sleep(5000);
			Random random = new Random();
			int orderId = random.nextInt(1000-1) + 1;
			DaprClient client = new DaprClientBuilder().build();
            //Using Dapr SDK to save and get state
			client.saveState(STATE_STORE_NAME, "order_1", Integer.toString(orderId)).block();
			client.saveState(STATE_STORE_NAME, "order_2", Integer.toString(orderId)).block();
			Mono<State<String>> result = client.getState(STATE_STORE_NAME, "order_1", String.class);
			log.info("Result after get" + result);
		}
	}

}
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 mvn spring-boot:run
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
DAPR_STORE_NAME = "statestore"
while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    with DaprClient() as client:
        #Using Dapr SDK to save and get state
        client.save_state(DAPR_STORE_NAME, "order_1", str(orderId)) 
        result = client.get_state(DAPR_STORE_NAME, "order_1")
        logging.info('Result after get: ' + result.data.decode('utf-8'))
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
```

{{% /codetab %}}


{{% codetab %}}

```go
//dependencies
import (
	"context"
	"log"
	"math/rand"
	"time"
	"strconv"
	dapr "github.com/dapr/go-sdk/client"
)

//code
func main() {
	for i := 0; i < 10; i++ {
		time.Sleep(5000)
		orderId := rand.Intn(1000-1) + 1
		client, err := dapr.NewClient()
		STATE_STORE_NAME := "statestore"
		if err != nil {
			panic(err)
		}
		defer client.Close()
		ctx := context.Background()
        //Using Dapr SDK to save and get state
		if err := client.SaveState(ctx, STATE_STORE_NAME, "order_1", []byte(strconv.Itoa(orderId))); err != nil {
			panic(err)
		}	
		result, err := client.GetState(ctx, STATE_STORE_NAME, "order_2")
		if err != nil {
			panic(err)
		}
		log.Println("Result after get: ")
		log.Println(result)
	}
}
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run OrderProcessingService.go
```

{{% /codetab %}}


{{% codetab %}}

```javascript
//dependencies
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from 'dapr-client'; 

//code
const daprHost = "127.0.0.1"; 
var main = function() {
    for(var i=0;i<10;i++) {
        sleep(5000);
        var orderId = Math.floor(Math.random() * (1000 - 1) + 1);
        start(orderId).catch((e) => {
            console.error(e);
            process.exit(1);
        });
    }
}

async function start(orderId) {
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const STATE_STORE_NAME = "statestore";
    //Using Dapr SDK to save and get state
    await client.state.save(STATE_STORE_NAME, [
        {
            key: "order_1",
            value: orderId.toString()
        },
        {
            key: "order_2",
            value: orderId.toString()
        }
    ]);
    var result = await client.state.get(STATE_STORE_NAME, "order_1");
    console.log("Result after get: " + result);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}


{{% codetab %}}
Begin by launching a Dapr sidecar:

```bash
dapr run --app-id orderprocessing --dapr-http-port 3601
```

Then in a separate terminal save a key/value pair into your statestore:
```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "order_1", "value": "250"}]' http://localhost:3601/v1.0/state/statestore
```

Now get the state you just saved:
```bash
curl http://localhost:3601/v1.0/state/statestore/order_1
```

Restart your sidecar and try retrieving state again to observe that state persists separately from the app.
{{% /codetab %}}

{{% codetab %}}

Begin by launching a Dapr sidecar:

```bash
dapr --app-id orderprocessing --port 3601 run
```

Then in a separate terminal save a key/value pair into your statestore:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{"key": "order_1", "value": "250"}]' -Uri 'http://localhost:3601/v1.0/state/statestore'
```

Now get the state you just saved:
```powershell
Invoke-RestMethod -Uri 'http://localhost:3601/v1.0/state/statestore/order_1'
```

Restart your sidecar and try retrieving state again to observe that state persists separately from the app.

{{% /codetab %}}

{{< /tabs >}}


## Step 3: Delete state

Below are code examples that leverage Dapr SDKs for deleting the state.

{{< tabs Dotnet Java Python Go Javascript "HTTP API (Bash)" "HTTP API (PowerShell)">}}

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
            string DAPR_STORE_NAME = "statestore";
            //Using Dapr SDK to delete the state
            using var client = new DaprClientBuilder().Build();
            await client.DeleteStateAsync(DAPR_STORE_NAME, "order_1", cancellationToken: cancellationToken);
        }
    }
}
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 dotnet run
```

{{% /codetab %}}


{{% codetab %}}

```java
//dependencies
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import org.springframework.boot.autoconfigure.SpringBootApplication;

//code
@SpringBootApplication
public class OrderProcessingServiceApplication {
	public static void main(String[] args) throws InterruptedException{
        String STATE_STORE_NAME = "statestore";

        //Using Dapr SDK to delete the state
        DaprClient client = new DaprClientBuilder().build();
        String storedEtag = client.getState(STATE_STORE_NAME, "order_1", String.class).block().getEtag();
        client.deleteState(STATE_STORE_NAME, "order_1", storedEtag, null).block();
	}
}
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 mvn spring-boot:run
```

{{% /codetab %}}


{{% codetab %}}

```python
#dependencies
from dapr.clients.grpc._request import TransactionalStateOperation, TransactionOperationType

#code
logging.basicConfig(level = logging.INFO)
DAPR_STORE_NAME = "statestore"

#Using Dapr SDK to delete the state
with DaprClient() as client:
    client.delete_state(store_name=DAPR_STORE_NAME, key="order_1")
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
```

{{% /codetab %}}


{{% codetab %}}

```go
//dependencies
import (
	"context"
	dapr "github.com/dapr/go-sdk/client"

)

//code
func main() {
    STATE_STORE_NAME := "statestore"
    //Using Dapr SDK to delete the state
    client, err := dapr.NewClient()
    if err != nil {
        panic(err)
    }
    defer client.Close()
    ctx := context.Background()

    if err := client.DeleteState(ctx, STATE_STORE_NAME, "order_1"); err != nil {
        panic(err)
    }
}
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run OrderProcessingService.go
```

{{% /codetab %}}


{{% codetab %}}

```javascript
//dependencies
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from 'dapr-client'; 

//code
const daprHost = "127.0.0.1"; 
var main = function() {
    const STATE_STORE_NAME = "statestore";
    //Using Dapr SDK to save and get state
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    await client.state.delete(STATE_STORE_NAME, "order_1"); 
}

main();
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}

{{% codetab %}}
With the same Dapr instance running from above run:
```bash
curl -X DELETE 'http://localhost:3601/v1.0/state/statestore/order_1'
```
Try getting state again and note that no value is returned.
{{% /codetab %}}

{{% codetab %}}
With the same Dapr instance running from above run:
```powershell
Invoke-RestMethod -Method Delete -Uri 'http://localhost:3601/v1.0/state/statestore/order_1'
```
Try getting state again and note that no value is returned.
{{% /codetab %}}

{{< /tabs >}}

## Step 4: Save and retrieve multiple states

Below are code examples that leverage Dapr SDKs for saving and retrieving multiple states.

{{< tabs Java Python Javascript "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

```java
//dependencies
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import java.util.Arrays;

//code
@SpringBootApplication
public class OrderProcessingServiceApplication {

	private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);

	public static void main(String[] args) throws InterruptedException{
        String STATE_STORE_NAME = "statestore";
        //Using Dapr SDK to retrieve multiple states
        DaprClient client = new DaprClientBuilder().build();
        Mono<List<State<String>>> resultBulk = client.getBulkState(STATE_STORE_NAME,
        Arrays.asList("order_1", "order_2"), String.class);
	}
}
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 mvn spring-boot:run
```

{{% /codetab %}}

{{% codetab %}}

```python
#dependencies
from dapr.clients import DaprClient
from dapr.clients.grpc._state import StateItem

#code
logging.basicConfig(level = logging.INFO)
DAPR_STORE_NAME = "statestore"
orderId = 100
#Using Dapr SDK to save and retrieve multiple states
with DaprClient() as client:
    client.save_bulk_state(store_name=DAPR_STORE_NAME, states=[StateItem(key="order_2", value=str(orderId))])
    result = client.get_bulk_state(store_name=DAPR_STORE_NAME, keys=["order_1", "order_2"], states_metadata={"metakey": "metavalue"}).items
    logging.info('Result after get bulk: ' + str(result)) 
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from 'dapr-client'; 

//code
const daprHost = "127.0.0.1"; 
var main = function() {
    const STATE_STORE_NAME = "statestore";
    var orderId = 100;
    //Using Dapr SDK to save and retrieve multiple states
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    await client.state.save(STATE_STORE_NAME, [
        {
            key: "order_1",
            value: orderId.toString()
        },
        {
            key: "order_2",
            value: orderId.toString()
        }
    ]);
    result = await client.state.getBulk(STATE_STORE_NAME, ["order_1", "order_2"]);
}

main();
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}

{{% codetab %}}
With the same Dapr instance running from above save two key/value pairs into your statestore:
```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "order_1", "value": "250"}, { "key": "order_2", "value": "550"}]' http://localhost:3601/v1.0/state/statestore
```

Now get the states you just saved:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"keys":["order_1", "order_2"]}' http://localhost:3601/v1.0/state/statestore/bulk
```
{{% /codetab %}}

{{% codetab %}}
With the same Dapr instance running from above save two key/value pairs into your statestore:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{ "key": "order_1", "value": "250"}, { "key": "order_2", "value": "550"}]' -Uri 'http://localhost:3601/v1.0/state/statestore'
```

Now get the states you just saved:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"keys":["order_1", "order_2"]}' -Uri 'http://localhost:3601/v1.0/state/statestore/bulk'
```

{{% /codetab %}}

{{< /tabs >}}

## Step 5: Perform state transactions

{{% alert title="Note" color="warning" %}}
State transactions require a state store that supports multi-item transactions. Visit the [supported state stores page]({{< ref supported-state-stores >}}) page for a full list. Note that the default Redis container created in a self-hosted environment supports them.
{{% /alert %}}

Below are code examples that leverage Dapr SDKs for performing state transactions.

{{< tabs Dotnet Java Python Javascript "HTTP API (Bash)" "HTTP API (PowerShell)">}}

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
            string DAPR_STORE_NAME = "statestore";
            while(true) {
                System.Threading.Thread.Sleep(5000);
                Random random = new Random();
                int orderId = random.Next(1,1000);
                using var client = new DaprClientBuilder().Build();
                var requests = new List<StateTransactionRequest>()
                {
                    new StateTransactionRequest("order_3", JsonSerializer.SerializeToUtf8Bytes(orderId.ToString()), StateOperationType.Upsert),
                    new StateTransactionRequest("order_2", null, StateOperationType.Delete)
                };
                CancellationTokenSource source = new CancellationTokenSource();
                CancellationToken cancellationToken = source.Token;
                //Using Dapr SDK to perform the state transactions
                await client.ExecuteStateTransactionAsync(DAPR_STORE_NAME, requests, cancellationToken: cancellationToken);
                Console.WriteLine("Order requested: " + orderId);
                Console.WriteLine("Result: " + result);
            }
        }
    }
}
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 dotnet run
```

{{% /codetab %}}


{{% codetab %}}

```java
//dependencies
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import io.dapr.client.domain.TransactionalStateOperation;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;

//code
@SpringBootApplication
public class OrderProcessingServiceApplication {

	private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);

	private static final String STATE_STORE_NAME = "statestore";

	public static void main(String[] args) throws InterruptedException{
		while(true) {
			TimeUnit.MILLISECONDS.sleep(5000);
			Random random = new Random();
			int orderId = random.nextInt(1000-1) + 1;
			DaprClient client = new DaprClientBuilder().build();
			List<TransactionalStateOperation<?>> operationList = new ArrayList<>();
			operationList.add(new TransactionalStateOperation<>(TransactionalStateOperation.OperationType.UPSERT,
					new State<>("order_3", Integer.toString(orderId), "")));
			operationList.add(new TransactionalStateOperation<>(TransactionalStateOperation.OperationType.DELETE,
					new State<>("order_2")));
            //Using Dapr SDK to perform the state transactions
			client.executeStateTransaction(STATE_STORE_NAME, operationList).block();
			log.info("Order requested: " + orderId);
		}
	}

}
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 mvn spring-boot:run
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
DAPR_STORE_NAME = "statestore"
while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    with DaprClient() as client:
        #Using Dapr SDK to perform the state transactions
        client.execute_state_transaction(store_name=DAPR_STORE_NAME, operations=[
            TransactionalStateOperation(
                operation_type=TransactionOperationType.upsert,
                key="order_3",
                data=str(orderId)),
            TransactionalStateOperation(key="order_3", data=str(orderId)),
            TransactionalStateOperation(
                operation_type=TransactionOperationType.delete,
                key="order_2",
                data=str(orderId)),
            TransactionalStateOperation(key="order_2", data=str(orderId))
        ])

    client.delete_state(store_name=DAPR_STORE_NAME, key="order_1")
    logging.basicConfig(level = logging.INFO)
    logging.info('Order requested: ' + str(orderId))
    logging.info('Result: ' + str(result))
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
```

{{% /codetab %}}


{{% codetab %}}

```javascript
//dependencies
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from 'dapr-client'; 

//code
const daprHost = "127.0.0.1"; 
var main = function() {
    for(var i=0;i<10;i++) {
        sleep(5000);
        var orderId = Math.floor(Math.random() * (1000 - 1) + 1);
        start(orderId).catch((e) => {
            console.error(e);
            process.exit(1);
        });
    }
}

async function start(orderId) {
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const STATE_STORE_NAME = "statestore";
    //Using Dapr SDK to save and retrieve multiple states
    await client.state.transaction(STATE_STORE_NAME, [
        {
        operation: "upsert",
        request: {
            key: "order_3",
            value: orderId.toString()
        }
        },
        {
        operation: "delete",
        request: {
            key: "order_2"
        }
        }
    ]);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}

{{% codetab %}}
With the same Dapr instance running from above perform two state transactions:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"operations": [{"operation":"upsert", "request": {"key": "order_1", "value": "250"}}, {"operation":"delete", "request": {"key": "order_2"}}]}' http://localhost:3601/v1.0/state/statestore/transaction
```

Now see the results of your state transactions:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"keys":["order_1", "order_2"]}' http://localhost:3601/v1.0/state/statestore/bulk
```
{{% /codetab %}}

{{% codetab %}}
With the same Dapr instance running from above save two key/value pairs into your statestore:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"operations": [{"operation":"upsert", "request": {"key": "order_1", "value": "250"}}, {"operation":"delete", "request": {"key": "order_2"}}]}' -Uri 'http://localhost:3601/v1.0/state/statestore'
```

Now see the results of your state transactions:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"keys":["order_1", "order_2"]}' -Uri 'http://localhost:3601/v1.0/state/statestore/bulk'
```

{{% /codetab %}}

{{< /tabs >}}

## Next steps

- Read the full [State API reference]({{< ref state_api.md >}})
- Try one of the [Dapr SDKs]({{< ref sdks >}})
- Build a [stateful service]({{< ref howto-stateful-service.md >}})