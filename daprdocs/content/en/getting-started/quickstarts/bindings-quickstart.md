---
type: docs
title: "Quickstart: Bindings"
linkTitle: "Dapr Bindings"
weight: 70
description: "Get started with Dapr's Binding building block"
---

Let's take a look at Dapr's [Binding building block]({{< ref bindings >}}). In this Quickstart, you will schedule a script to run every 10 seconds using an input [Cron](https://docs.dapr.io/reference/components-reference/supported-bindings/cron/) binding. The script will process a Json file and output data to a SQL database using the [PostgreSQL](https://docs.dapr.io/reference/components-reference/supported-bindings/postgres) Dapr binding.

Using bindings, you can trigger your app with events coming in from external systems, or interface with external systems. Bindings provide several benefits for you and your code:
 - Remove the complexities of connecting to, and polling from, messaging systems such as queues and message buses.
 - Focus on business logic and not implementation details of how to interact with a system.
 - Keep your code free from SDKs or libraries.
 - Handle retries and failure recovery.
 - Switch between bindings at run time.
 - Build portable applications where environment-specific bindings are set-up and no code changes are required.

For a specific example, bindings would allow your microservice to respond to incoming Twilio/SMS messages without adding or configuring a third-party Twilio SDK, worrying about polling from Twilio (or using websockets, etc.).

<img src="/images/binding-quickstart/Bindings_Quickstart.png" width=800 style="padding-bottom:15px;">

Select your preferred language-specific Dapr SDK before proceeding with the Quickstart.

{{< tabs "Python" "JavaScript" ".NET" "Go" >}}
 <!-- Python -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.7+ installed](https://www.python.org/downloads/).
- [Docker Desktop](https://www.docker.com/products/docker-desktop).

### Step 1: Set up the environment

Clone the [sample we've provided in our Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/bindings).
```bash
git clone https://github.com/dapr/quickstarts.git
```
### Step 2: Run PostgreSQL Docker Container Locally

In order to run the PostgreSQL bindings quickstart locally, you will run the [PostgreSQL instance](https://www.postgresql.org/) in a docker container on your machine.

To run the container locally, run:

```bash
docker run --name sql_db -p 5432:5432 -e POSTGRES_PASSWORD=admin -e POSTGRES_USER=admin -d postgres
```

To see the container running locally, run:
```bash
docker ps
```

The output should be similar to this:
```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### Step 3: Setup the database schema

Connect to the local PostgreSQL instance. 
```bash
docker exec -i -t sql_db psql --username admin  -p 5432 -h localhost --no-password
```
This will launch the PostgreSQL cli.
```bash
psql (14.2 (Debian 14.2-1.pgdg110+1))
Type "help" for help.

admin=#
```
Create a new `orders` database.
```bash
create database orders;
```
Connect to the new database and create the `orders` table.
```bash
\c orders;
create table orders ( orderid int, customer text, price float ); select * from orders;
```

### Step 4: Schedule a Cron job and write to the database

In a terminal window, navigate to the `sdk` directory.

```bash
cd bindings/python/sdk
```

Install the dependencies:

```bash
pip3 install -r requirements.txt
```

Run the `python-quickstart-binding-sdk` service alongside a Dapr sidecar.

```bash
dapr run --app-id python-quickstart-binding-sdk --app-protocol grpc --app-port 50051 --components-path ../../components python3 batch.py
```
The `python-quickstart-binding-sdk` uses the PostgreSQL Output Binding defined in the [`bindings.yaml`]({{< ref "#bindingsyaml-component-file" >}}) component to insert the `OrderId`, `Customer` and `Price` records into the `orders` table. This code is executed every 10 seconds (defined in [`cron.yaml`]({{< ref "#cronyaml-component-file" >}}) in the `components` directory).

```python
def sql_output(order_line):

    with DaprClient() as d:
        sqlCmd = 'insert into orders (orderid, customer, price) values ({}, \'{}\', {});'.format(order_line['orderid'], order_line['customer'], order_line['price'])
        payload = {  'sql' : sqlCmd }
        print(json.dumps(payload), flush=True)
        try:
            d.invoke_binding(binding_name=sql_binding, operation='exec', binding_metadata=payload, data='')        
        except Exception as e:
            print(e, flush=True)
```

### Step 5: View the Output Binding log

Notice, as specified above, the code invokes the Output Binding with the `OrderId`, `Customer` and `Price` as a payload.

Output Binding `print` statement output:
```
== APP == {"sql": "insert into orders (orderid, customer, price) values (1, 'John Smith', 100.32);"}
== APP == {"sql": "insert into orders (orderid, customer, price) values (2, 'Jane Bond', 15.4);"}
== APP == {"sql": "insert into orders (orderid, customer, price) values (3, 'Tony James', 35.56);"}
```

### Step 6: Process the `orders.json` file on a schedule

The `python-quickstart-binding-sdk` uses the Cron Input Binding defined in the [`cron.yaml`]({{< ref "#cronyaml-component-file" >}}) component to process a json file containing order information.

```python
@app.binding(cron_bindingName)
def cron_binding(request: BindingRequest):

    json_file = open("../../orders.json","r")
    json_array = json.load(json_file)

    for order_line in json_array['orders']:
       sql_output(order_line)

    json_file.close()
    return 'Cron event processed'
```

#### `cron.yaml` component file

When you execute the `dapr run` command and specify the location of the component file, the Dapr sidecar initiates the Cron [Binding building block]({{< ref bindings >}}) and calls the binding endpoint (`batch`) every 10 seconds.

The Cron `cron.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: batch
  namespace: quickstarts
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 10s" # valid cron schedule
```

**Note:** The `metadata` section of `cron.yaml` contains a [cron expression](/reference/components-reference/supported-bindings/cron/) that specifies how often the binding will be invoked.

#### `bindings.yaml` component file

When you execute the `dapr run` command and specify the location of the component file, the Dapr sidecar initiates the PostgreSQL [Binding building block](/reference/components-reference/supported-bindings/postgres/) and connects to PostgreSQL using the settings specified in the `bindings.yaml` file.

With the `bindings.yaml` component, you can easily swap out the backend database [binding](/reference/components-reference/supported-bindings/) without making code changes.

The PostgreSQL `bindings.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: SqlDB
  namespace: quickstarts
spec:
  type: bindings.postgres
  version: v1
  metadata:
  - name: url # Required
    value: "user=admin password=admin host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
```

In the YAML file:

- `spec/type` specifies that PostgreSQL is used for this binding.
- `spec/metadata` defines the connection to the PostgreSQL instance used by the component.

{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest Node.js installed](https://nodejs.org/download/).
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Step 1: Set up the environment

Clone the [sample we've provided in our Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/bindings).
```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Run PostgreSQL Docker Container Locally

In order to run the PostgreSQL bindings quickstart locally, you will run the [PostgreSQL instance](https://www.postgresql.org/) in a docker container on your machine.

To run the container locally, run:

```bash
docker run --name sql_db -p 5432:5432 -e POSTGRES_PASSWORD=admin -e POSTGRES_USER=admin -d postgres
```

To see the container running locally, run:
```bash
docker ps
```

The output should be similar to this:
```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### Step 3: Setup the database schema

Connect to the local PostgreSQL instance. 
```bash
docker exec -i -t sql_db psql --username admin  -p 5432 -h localhost --no-password
```
This will launch the PostgreSQL cli.
```bash
psql (14.2 (Debian 14.2-1.pgdg110+1))
Type "help" for help.

admin=#
```
Create a new `orders` database.
```bash
create database orders;
```
Connect to the new database and create the `orders` table.
```bash
\c orders;
create table orders ( orderid int, customer text, price float ); select * from orders;
```

### Step 4: Schedule a Cron job and write to the database

In a terminal window, navigate to the `sdk` directory.

```bash
cd bindings/javascript/sdk
```

Install the dependencies:

```bash
npm install
```

Run the `javascript-quickstart-binding-sdk` service alongside a Dapr sidecar.

```bash
dapr run --app-id javascript-quickstart-binding-sdk --app-port 3500 --dapr-http-port 5051 node batch.js --components-path ../../components
```
The `javascript-quickstart-binding-sdk` uses the PostgreSQL Output Binding defined in the [`bindings.yaml`]({{< ref "#bindingsyaml-component-file" >}}) component to insert the `OrderId`, `Customer` and `Price` records into the `orders` table. This code is executed every 10 seconds (defined in [`cron.yaml`]({{< ref "#cronyaml-component-file" >}}) in the `components` directory).

```js
async function processBatch(){
    const loc = '../../orders.json';
    fs.readFile(loc, 'utf8', (err, data) => {
        const orders = JSON.parse(data).orders;
        orders.forEach(order => {
            let sqlCmd = `insert into orders (orderid, customer, price) values (${order.orderid}, '${order.customer}', ${order.price});`;
            let payload = `{  "sql": "${sqlCmd}" } `;
            console.log(payload);
            client.binding.send(postgresBindingName, "exec", "", JSON.parse(payload));
        });
        console.log('Finished processing batch');
      });
    return 0;
}
```

### Step 5: View the Output Binding log

Notice, as specified above, the code invokes the Output Binding with the `OrderId`, `Customer` and `Price` as a payload.

Output Binding `console.log` statement output:
```
== APP == [Dapr-JS] Server Started
== APP == {  "sql": "insert into orders (orderid, customer, price) values (1, 'John Smith', 100.32);" }
== APP == {  "sql": "insert into orders (orderid, customer, price) values (2, 'Jane Bond', 15.4);" }
== APP == {  "sql": "insert into orders (orderid, customer, price) values (3, 'Tony James', 35.56);" }
== APP == Finished processing batch
```

### Step 6: Process the `orders.json` file on a schedule

The `javascript-quickstart-binding-sdk` uses the Cron Input Binding defined in the [`cron.yaml`]({{< ref "#cronyaml-component-file" >}}) component to process a json file containing order information.

```js
const server = new DaprServer(serverHost, serverPort, daprHost, daprPort);

async function start() {
    await server.binding.receive(cronBindingName,processBatch);
    await server.start();
}
```

#### `cron.yaml` component file

When you execute the `dapr run` command and specify the location of the component file, the Dapr sidecar initiates the Cron [Binding building block]({{< ref bindings >}}) and calls the binding endpoint (`batch`) every 10 seconds.

The Cron `cron.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: batch
  namespace: quickstarts
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 10s" # valid cron schedule
```

**Note:** The `metadata` section of `cron.yaml` contains a [cron expression](/reference/components-reference/supported-bindings/cron/) that specifies how often the binding will be invoked.

#### `bindings.yaml` component file

When you execute the `dapr run` command and specify the location of the component file, the Dapr sidecar initiates the PostgreSQL [Binding building block](/reference/components-reference/supported-bindings/postgres/) and connects to PostgreSQL using the settings specified in the `bindings.yaml` file.

With the `bindings.yaml` component, you can easily swap out the backend database [binding](/reference/components-reference/supported-bindings/) without making code changes.

The PostgreSQL `bindings.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: SqlDB
  namespace: quickstarts
spec:
  type: bindings.postgres
  version: v1
  metadata:
  - name: url # Required
    value: "user=admin password=admin host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
```

In the YAML file:

- `spec/type` specifies that PostgreSQL is used for this binding.
- `spec/metadata` defines the connection to the PostgreSQL instance used by the component.

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET SDK or .NET 6 SDK installed](https://dotnet.microsoft.com/download).
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Step 1: Set up the environment

Clone the [sample we've provided in our Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/bindings).
```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Run PostgreSQL Docker Container Locally

In order to run the PostgreSQL bindings quickstart locally, you will run the [PostgreSQL instance](https://www.postgresql.org/) in a docker container on your machine.

To run the container locally, run:

```bash
docker run --name sql_db -p 5432:5432 -e POSTGRES_PASSWORD=admin -e POSTGRES_USER=admin -d postgres
```

To see the container running locally, run:
```bash
docker ps
```

The output should be similar to this:
```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### Step 3: Setup the database schema

Connect to the local PostgreSQL instance. 
```bash
docker exec -i -t sql_db psql --username admin  -p 5432 -h localhost --no-password
```
This will launch the PostgreSQL cli.
```bash
psql (14.2 (Debian 14.2-1.pgdg110+1))
Type "help" for help.

admin=#
```
Create a new `orders` database.
```bash
create database orders;
```
Connect to the new database and create the `orders` table.
```bash
\c orders;
create table orders ( orderid int, customer text, price float ); select * from orders;
```

### Step 4: Schedule a Cron job and write to the database

In a terminal window, navigate to the `sdk` directory.

```bash
cd bindings/csharp/sdk
```

Install the dependencies:

```bash
dotnet restore
dotnet build batch.csproj
```

Run the `csharp-quickstart-binding-sdk` service alongside a Dapr sidecar.

```bash
dapr run --app-id csharp-quickstart-binding-sdk --app-port 7001 --components-path ../../components -- dotnet run --project batch.csproj
```
The `csharp-quickstart-binding-sdk` uses the PostgreSQL Output Binding defined in the [`bindings.yaml`]({{< ref "#bindingsyaml-component-file" >}}) component to insert the `OrderId`, `Customer` and `Price` records into the `orders` table. This code is executed every 10 seconds (defined in [`cron.yaml`]({{< ref "#cronyaml-component-file" >}}) in the `components` directory).

```cs
foreach( Order ord in ordersArr.orders){
    var sqlText = $"insert into orders (orderid, customer, price) values ({ord.OrderId}, '{ord.Customer}', {ord.Price});";
    var command = new Dictionary<string,string>(){
        {"sql",
        sqlText}
    };
    await client.InvokeBindingAsync(sqlBindingName, "exec", command,command);
    Console.WriteLine(sqlText);
}
```

### Step 5: View the Output Binding log

Notice, as specified above, the code invokes the Output Binding with the `OrderId`, `Customer` and `Price` as a payload.

Output Binding `Console.WriteLine` statement output:
```
== APP == insert into orders (orderid, customer, price) values (1, 'John Smith', 100.32);
== APP == insert into orders (orderid, customer, price) values (2, 'Jane Bond', 15.4);
== APP == insert into orders (orderid, customer, price) values (3, 'Tony James', 35.56);
```

### Step 6: Process the `orders.json` file on a schedule

The `csharp-quickstart-binding-sdk` uses the Cron Input Binding defined in the [`cron.yaml`]({{< ref "#cronyaml-component-file" >}}) component to process a json file containing order information.

```cs
app.MapPost(cronBindingName, async () => {

    string text = File.ReadAllText("../../orders.json");
    var ordersArr = JsonSerializer.Deserialize<Orders>(text);
    using var client = new DaprClientBuilder().Build();
    ...
    }
});
```

#### `cron.yaml` component file

When you execute the `dapr run` command and specify the location of the component file, the Dapr sidecar initiates the Cron [Binding building block]({{< ref bindings >}}) and calls the binding endpoint (`batch`) every 10 seconds.

The Cron `cron.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: batch
  namespace: quickstarts
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 10s" # valid cron schedule
```

**Note:** The `metadata` section of `cron.yaml` contains a [cron expression](/reference/components-reference/supported-bindings/cron/) that specifies how often the binding will be invoked.

#### `bindings.yaml` component file

When you execute the `dapr run` command and specify the location of the component file, the Dapr sidecar initiates the PostgreSQL [Binding building block](/reference/components-reference/supported-bindings/postgres/) and connects to PostgreSQL using the settings specified in the `bindings.yaml` file.

With the `bindings.yaml` component, you can easily swap out the backend database [binding](/reference/components-reference/supported-bindings/) without making code changes.

The PostgreSQL `bindings.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: SqlDB
  namespace: quickstarts
spec:
  type: bindings.postgres
  version: v1
  metadata:
  - name: url # Required
    value: "user=admin password=admin host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
```

In the YAML file:

- `spec/type` specifies that PostgreSQL is used for this binding.
- `spec/metadata` defines the connection to the PostgreSQL instance used by the component.

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest version of Go](https://go.dev/dl/).
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Step 1: Set up the environment

Clone the [sample we've provided in our Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/bindings).
```bash
git clone https://github.com/dapr/quickstarts.git
```
### Step 2: Run PostgreSQL Docker Container Locally

In order to run the PostgreSQL bindings quickstart locally, you will run the [PostgreSQL instance](https://www.postgresql.org/) in a docker container on your machine.

To run the container locally, run:

```bash
docker run --name sql_db -p 5432:5432 -e POSTGRES_PASSWORD=admin -e POSTGRES_USER=admin -d postgres
```

To see the container running locally, run:
```bash
docker ps
```

The output should be similar to this:
```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### Step 3: Setup the database schema

Connect to the local PostgreSQL instance. 
```bash
docker exec -i -t sql_db psql --username admin  -p 5432 -h localhost --no-password
```
This will launch the PostgreSQL cli.
```bash
psql (14.2 (Debian 14.2-1.pgdg110+1))
Type "help" for help.

admin=#
```
Create a new `orders` database.
```bash
create database orders;
```
Connect to the new database and create the `orders` table.
```bash
\c orders;
create table orders ( orderid int, customer text, price float ); select * from orders;
```

### Step 4: Schedule a Cron job and write to the database

In a terminal window, navigate to the `sdk` directory.

```bash
cd bindings/go/sdk
```

Install the dependencies:

```bash
go build batch.go
```

Run the `go-input-binding-sdk` service alongside a Dapr sidecar.

```bash
dapr run --app-id go-input-binding-sdk --app-port 6002 --dapr-http-port 6003 --dapr-grpc-port 60002 go run batch.go --components-path ../../components
```
The `go-input-binding-sdk` uses the PostgreSQL Output Binding defined in the [`bindings.yaml`]({{< ref "#bindingsyaml-component-file" >}}) component to insert the `OrderId`, `Customer` and `Price` records into the `orders` table. This code is executed every 10 seconds (defined in [`cron.yaml`]({{< ref "#cronyaml-component-file" >}}) in the `components` directory).

```go
func sqlBindings(order Order) (err error) {

	bindingName := "SqlDB"

	client, err := dapr.NewClient()
	if err != nil {
		return err
	}

	ctx := context.Background()

	sqlCmd := fmt.Sprintf("insert into orders (orderid, customer, price) values (%d, '%s', %s);", order.OrderId, order.Customer, strconv.FormatFloat(order.Price, 'f', 2, 64))
	fmt.Println(sqlCmd)
	in := &dapr.InvokeBindingRequest{
		Name:      bindingName,
		Operation: "exec",
		Data:      []byte(""),
		Metadata:  map[string]string{"sql": sqlCmd},
	}
	err = client.InvokeOutputBinding(ctx, in)
	if err != nil {
		return err
	}
	return nil
}
```

### Step 5: View the Output Binding log

Notice, as specified above, the code invokes the Output Binding with the `OrderId`, `Customer` and `Price` as a payload.

Output Binding `console.log` statement output:
```
== APP == The File is opened successfully...
== APP == dapr client initializing for: 127.0.0.1:60002
== APP == insert into orders (orderid, customer, price) values (1, 'John Smith', 100.32);
== APP == insert into orders (orderid, customer, price) values (2, 'Jane Bond', 15.40);
== APP == insert into orders (orderid, customer, price) values (3, 'Tony James', 35.56);
== APP == Finished processing batch
```

### Step 6: Process the `orders.json` file on a schedule

The `go-input-binding-sdk` uses the Cron Input Binding defined in the [`cron.yaml`]({{< ref "#cronyaml-component-file" >}}) component to process a json file containing order information.

```go
func processCron(w http.ResponseWriter, r *http.Request) {

	fileContent, err := os.Open("../../orders.json")
	if err != nil {
		log.Fatal(err)
		return
	}

	fmt.Println("The File is opened successfully...")

	defer fileContent.Close()

	byteResult, _ := ioutil.ReadAll(fileContent)

	var orders Orders

	json.Unmarshal(byteResult, &orders)

	for i := 0; i < len(orders.Orders); i++ {
		err := sqlBindings(orders.Orders[i])
		if err != nil {
			log.Fatal(err)
			os.Exit(1)
		}
	}
	fmt.Println("Finished processing batch")
	os.Exit(0)
}

```

#### `cron.yaml` component file

When you execute the `dapr run` command and specify the location of the component file, the Dapr sidecar initiates the Cron [Binding building block]({{< ref bindings >}}) and calls the binding endpoint (`batch`) every 10 seconds.

The Cron `cron.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: batch
  namespace: quickstarts
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 10s" # valid cron schedule
```

**Note:** The `metadata` section of `cron.yaml` contains a [cron expression](/reference/components-reference/supported-bindings/cron/) that specifies how often the binding will be invoked.

#### `bindings.yaml` component file

When you execute the `dapr run` command and specify the location of the component file, the Dapr sidecar initiates the PostgreSQL [Binding building block](/reference/components-reference/supported-bindings/postgres/) and connects to PostgreSQL using the settings specified in the `bindings.yaml` file.

With the `bindings.yaml` component, you can easily swap out the backend database [binding](/reference/components-reference/supported-bindings/) without making code changes.

The PostgreSQL `bindings.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: SqlDB
  namespace: quickstarts
spec:
  type: bindings.postgres
  version: v1
  metadata:
  - name: url # Required
    value: "user=admin password=admin host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
```

In the YAML file:

- `spec/type` specifies that PostgreSQL is used for this binding.
- `spec/metadata` defines the connection to the PostgreSQL instance used by the component.

{{% /codetab %}}

{{< /tabs >}}

## Tell us what you think!
We're continuously working to improve our Quickstart examples and value your feedback. Did you find this quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.gg/22ZtJrNe).

## Next steps

- Use Dapr Bindings with HTTP instead of an SDK.
  - [Python](https://github.com/dapr/quickstarts/tree/master/bindings/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/bindings/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/bindings/csharp/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/bindings/go/http)
- Learn more about [Binding building block]({{< ref bindings >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
