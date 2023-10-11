---
type: docs
title: "Quickstart: Input & Output Bindings"
linkTitle: "Bindings"
weight: 74
description: "Get started with Dapr's Binding building block"
---

Let's take a look at Dapr's [Bindings building block]({{< ref bindings >}}). Using bindings, you can:

- Trigger your app with events coming in from external systems.
- Interface with external systems.

In this Quickstart, you schedule a batch script to run every 10 seconds using an input [Cron]({{< ref cron.md >}}) binding. The script processes a JSON file and outputs data to a SQL database using the [PostgreSQL]({{< ref postgresql.md >}}) Dapr binding. 

<img src="/images/bindings-quickstart/bindings-quickstart.png" width=800 style="padding-bottom:15px;">

Select your preferred language-specific Dapr SDK before proceeding with the Quickstart.

{{< tabs "Python" "JavaScript" ".NET" "Java" "Go" >}}
 <!-- Python -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.7+ installed](https://www.python.org/downloads/).
<!-- IGNORE_LINKS --> 
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/bindings).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Run PostgreSQL Docker container locally

Run the [PostgreSQL instance](https://www.postgresql.org/) locally in a Docker container on your machine. The Quickstart sample includes a Docker Compose file to locally customize, build, run, and initialize the `postgres` container with a default `orders` table.

In a terminal window, from the root of the Quickstarts clone directory, navigate to the `bindings/db` directory.

```bash
cd bindings/db
```

Run the following command to set up the container:

```bash
docker compose up
```

Verify that the container is running locally.

```bash
docker ps
```

The output should include:

```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### Step 3: Schedule a Cron job and write to the database

In a new terminal window, navigate to the SDK directory.

```bash
cd bindings/python/sdk/batch
```

Install the dependencies:

```bash
pip3 install -r requirements.txt
```

Run the `batch-sdk` service alongside a Dapr sidecar.

```bash
dapr run --app-id batch-sdk --app-port 50051 --resources-path ../../../components -- python3 app.py
```

> **Note**: Since Python3.exe is not defined in Windows, you may need to use `python app.py` instead of `python3 app.py`.

The code inside the `process_batch` function is executed every 10 seconds (defined in [`binding-cron.yaml`]({{< ref "#componentsbinding-cronyaml-component-file" >}}) in the `components` directory). The binding trigger looks for a route called via HTTP POST in your application by the Dapr sidecar.

```python
# Triggered by Dapr input binding
@app.route('/' + cron_binding_name, methods=['POST'])
def process_batch():
```

The `batch-sdk` service uses the PostgreSQL output binding defined in the [`binding-postgresql.yaml`]({{< ref "#componentbinding-postgresyaml-component-file" >}}) component to insert the `OrderId`, `Customer`, and `Price` records into the `orders` table. 

```python
with DaprClient() as d:
    sqlCmd = ('insert into orders (orderid, customer, price) values ' +
              '(%s, \'%s\', %s)' % (order_line['orderid'],
                                    order_line['customer'],
                                    order_line['price']))
    payload = {'sql': sqlCmd}

    print(sqlCmd, flush=True)

    try:
        # Insert order using Dapr output binding via HTTP Post
        resp = d.invoke_binding(binding_name=sql_binding, operation='exec',
                                binding_metadata=payload, data='')
        return resp
    except Exception as e:
        print(e, flush=True)
        raise SystemExit(e)
```

### Step 4: View the output of the job

Notice, as specified above, the code invokes the output binding with the `OrderId`, `Customer`, and `Price` as a payload.

Your output binding's `print` statement output:

```
== APP == Processing batch..
== APP == insert into orders (orderid, customer, price) values (1, 'John Smith', 100.32)
== APP == insert into orders (orderid, customer, price) values (2, 'Jane Bond', 15.4)
== APP == insert into orders (orderid, customer, price) values (3, 'Tony James', 35.56)
== APP == Finished processing batch
```

In a new terminal, verify the same data has been inserted into the database. Navigate to the `bindings/db` directory.

```bash
cd bindings/db
```

Run the following to start the interactive *psql* CLI:

```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

At the `admin=#` prompt, change to the `orders` table:

```bash
\c orders;
```

At the `orders=#` prompt, select all rows:

```bash
select * from orders;
```

The output should look like this:

```
 orderid |  customer  | price
---------+------------+--------
       1 | John Smith | 100.32
       2 | Jane Bond  |   15.4
       3 | Tony James |  35.56
```

#### `components\binding-cron.yaml` component file

When you execute the `dapr run` command and specify the component path, the Dapr sidecar:

- Initiates the Cron [binding building block]({{< ref bindings >}})
- Calls the binding endpoint (`batch`) every 10 seconds

The Cron `binding-cron.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: cron
  namespace: quickstarts
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 10s" # valid cron schedule
  - name: direction
    value: "input" # direction of the cron binding
```

**Note:** The `metadata` section of `binding-cron.yaml` contains a [Cron expression]({{< ref cron.md >}}) that specifies how often the binding is invoked.

#### `component\binding-postgresql.yaml` component file

When you execute the `dapr run` command and specify the component path, the Dapr sidecar:

- Initiates the PostgreSQL [binding building block]({{< ref postgresql.md >}})
- Connects to PostgreSQL using the settings specified in the `binding-postgresql.yaml` file

With the `binding-postgresql.yaml` component, you can easily swap out the backend database [binding]({{< ref supported-bindings.md >}}) without making code changes.

The PostgreSQL `binding-postgresql.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sqldb
  namespace: quickstarts
spec:
  type: bindings.postgresql
  version: v1
  metadata:
  - name: url # Required
    value: "user=postgres password=docker host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
  - name: direction
    value: "output" # direction of the postgresql binding
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
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/bindings).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Run PostgreSQL Docker container locally

Run the [PostgreSQL instance](https://www.postgresql.org/) locally in a Docker container on your machine. The Quickstart sample includes a Docker Compose file to locally customize, build, run, and initialize the `postgres` container with a default `orders` table.

In a terminal window, from the root of the Quickstarts clone directory, navigate to the `bindings/db` directory.

```bash
cd bindings/db
```

Run the following command to set up the container:

```bash
docker compose up
```

Verify that the container is running locally.

```bash
docker ps
```

The output should include:

```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### Step 3: Schedule a Cron job and write to the database

In a new terminal window, navigate to the SDK directory.

```bash
cd bindings/javascript/sdk/batch
```

Install the dependencies:

```bash
npm install
```

Run the `batch-sdk` service alongside a Dapr sidecar.

```bash
dapr run --app-id batch-sdk --app-port 5002 --dapr-http-port 3500 --resources-path ../../../components -- node index.js 
```

The code inside the `process_batch` function is executed every 10 seconds (defined in [`binding-cron.yaml`]({{< ref "#componentsbinding-cronyaml-component-file" >}}) in the `components` directory). The binding trigger looks for a route called via HTTP POST in your application by the Dapr sidecar.

```javascript
async function start() {
    await server.binding.receive(cronBindingName,processBatch);
    await server.start();
}
```

The `batch-sdk` service uses the PostgreSQL output binding defined in the [`binding-postgresql.yaml`]({{< ref "##componentsbinding-postgresyaml-component-file" >}}) component to insert the `OrderId`, `Customer`, and `Price` records into the `orders` table. 

```javascript
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

### Step 4: View the output of the job

Notice, as specified above, the code invokes the output binding with the `OrderId`, `Customer`, and `Price` as a payload.

Your output binding's `print` statement output:

```
== APP == Processing batch..
== APP == insert into orders (orderid, customer, price) values(1, 'John Smith', 100.32)
== APP == insert into orders (orderid, customer, price) values(2, 'Jane Bond', 15.4)
== APP == insert into orders (orderid, customer, price) values(3, 'Tony James', 35.56)
```

In a new terminal, verify the same data has been inserted into the database. Navigate to the `bindings/db` directory.

```bash
cd bindings/db
```

Run the following to start the interactive Postgres CLI:

```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

At the `admin=#` prompt, change to the `orders` table:

```bash
\c orders;
```

At the `orders=#` prompt, select all rows:

```bash
select * from orders;
```

The output should look like this:

```
 orderid |  customer  | price
---------+------------+--------
       1 | John Smith | 100.32
       2 | Jane Bond  |   15.4
       3 | Tony James |  35.56
```

#### `components\binding-cron.yaml` component file

When you execute the `dapr run` command and specify the component path, the Dapr sidecar:

- Initiates the Cron [binding building block]({{< ref bindings >}})
- Calls the binding endpoint (`batch`) every 10 seconds

The Cron `binding-cron.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: cron
  namespace: quickstarts
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 10s" # valid cron schedule
  - name: direction
    value: "input" # direction of the cron binding
```

**Note:** The `metadata` section of `binding-cron.yaml` contains a [Cron expression]({{< ref cron.md >}}) that specifies how often the binding is invoked.

#### `component\binding-postgresql.yaml` component file

When you execute the `dapr run` command and specify the component path, the Dapr sidecar:

- Initiates the PostgreSQL [binding building block]({{< ref postgresql.md >}})
- Connects to PostgreSQL using the settings specified in the `binding-postgresql.yaml` file

With the `binding-postgresql.yaml` component, you can easily swap out the backend database [binding]({{< ref supported-bindings.md >}}) without making code changes.

The PostgreSQL `binding-postgresql.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sqldb
  namespace: quickstarts
spec:
  type: bindings.postgresql
  version: v1
  metadata:
  - name: url # Required
    value: "user=postgres password=docker host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
  - name: direction
    value: "output" # direction of the postgresql binding
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
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/bindings).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Run PostgreSQL Docker container locally

Run the [PostgreSQL instance](https://www.postgresql.org/) locally in a Docker container on your machine. The Quickstart sample includes a Docker Compose file to locally customize, build, run, and initialize the `postgres` container with a default `orders` table.

In a terminal window, from the root of the Quickstarts clone directory, navigate to the `bindings/db` directory.

```bash
cd bindings/db
```

Run the following command to set up the container:

```bash
docker compose up
```

Verify that the container is running locally.

```bash
docker ps
```

The output should include:

```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### Step 3: Schedule a Cron job and write to the database

In a new terminal window, navigate to the SDK directory.

```bash
cd bindings/csharp/sdk/batch
```

Install the dependencies:

```bash
dotnet restore
dotnet build batch.csproj
```

Run the `batch-sdk` service alongside a Dapr sidecar.

```bash
dapr run --app-id batch-sdk --app-port 7002 --resources-path ../../../components -- dotnet run
```

The code inside the `process_batch` function is executed every 10 seconds (defined in [`binding-cron.yaml`]({{< ref "#componentsbinding-cronyaml-component-file" >}}) in the `components` directory). The binding trigger looks for a route called via HTTP POST in your application by the Dapr sidecar.

```csharp
app.MapPost("/" + cronBindingName, async () => {
// ...
});
```

The `batch-sdk` service uses the PostgreSQL output binding defined in the [`binding-postgresql.yaml`]({{< ref "#componentbinding-postgresyaml-component-file" >}}) component to insert the `OrderId`, `Customer`, and `Price` records into the `orders` table. 

```csharp
// ...
string jsonFile = File.ReadAllText("../../../orders.json");
var ordersArray = JsonSerializer.Deserialize<Orders>(jsonFile);
using var client = new DaprClientBuilder().Build();
foreach(Order ord in ordersArray?.orders ?? new Order[] {}){
    var sqlText = $"insert into orders (orderid, customer, price) values ({ord.OrderId}, '{ord.Customer}', {ord.Price});";
    var command = new Dictionary<string,string>(){
        {"sql",
        sqlText}
    };
// ...
}

// Insert order using Dapr output binding via Dapr Client SDK
await client.InvokeBindingAsync(bindingName: sqlBindingName, operation: "exec", data: "", metadata: command);
```

### Step 4: View the output of the job

Notice, as specified above, the code invokes the output binding with the `OrderId`, `Customer`, and `Price` as a payload.

Your output binding's `print` statement output:

```
== APP == Processing batch..
== APP == insert into orders (orderid, customer, price) values (1, 'John Smith', 100.32);
== APP == insert into orders (orderid, customer, price) values (2, 'Jane Bond', 15.4);
== APP == insert into orders (orderid, customer, price) values (3, 'Tony James', 35.56);
== APP == Finished processing batch
```

In a new terminal, verify the same data has been inserted into the database. Navigate to the `bindings/db` directory.

```bash
cd bindings/db
```

Run the following to start the interactive Postgres CLI:

```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

At the `admin=#` prompt, change to the `orders` table:

```bash
\c orders;
```

At the `orders=#` prompt, select all rows:

```bash
select * from orders;
```

The output should look like this:

```
 orderid |  customer  | price
---------+------------+--------
       1 | John Smith | 100.32
       2 | Jane Bond  |   15.4
       3 | Tony James |  35.56
```

#### `components\binding-cron.yaml` component file

When you execute the `dapr run` command and specify the component path, the Dapr sidecar:

- Initiates the Cron [binding building block]({{< ref bindings >}})
- Calls the binding endpoint (`batch`) every 10 seconds

The Cron `binding-cron.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: cron
  namespace: quickstarts
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 10s" # valid cron schedule
  - name: direction
    value: "input" # direction of the cron binding
```

**Note:** The `metadata` section of `binding-cron.yaml` contains a [Cron expression]({{< ref cron.md >}}) that specifies how often the binding is invoked.

#### `component\binding-postgresql.yaml` component file

When you execute the `dapr run` command and specify the component path, the Dapr sidecar:

- Initiates the PostgreSQL [binding building block]({{< ref postgresql.md >}})
- Connects to PostgreSQL using the settings specified in the `binding-postgresql.yaml` file

With the `binding-postgresql.yaml` component, you can easily swap out the backend database [binding]({{< ref supported-bindings.md >}}) without making code changes.

The PostgreSQL `binding-postgresql.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sqldb
  namespace: quickstarts
spec:
  type: bindings.postgresql
  version: v1
  metadata:
  - name: url # Required
    value: "user=postgres password=docker host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
  - name: direction
    value: "output" # direction of the postgresql binding
```

In the YAML file:

- `spec/type` specifies that PostgreSQL is used for this binding.
- `spec/metadata` defines the connection to the PostgreSQL instance used by the component.

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 11 (or greater):
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads), or
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html), version 3.x.
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/bindings).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Run PostgreSQL Docker container locally

Run the [PostgreSQL instance](https://www.postgresql.org/) locally in a Docker container on your machine. The Quickstart sample includes a Docker Compose file to locally customize, build, run, and initialize the `postgres` container with a default `orders` table.

In a terminal window, from the root of the Quickstarts clone directory, navigate to the `bindings/db` directory.

```bash
cd bindings/db
```

Run the following command to set up the container:

```bash
docker compose up
```

Verify that the container is running locally.

```bash
docker ps
```

The output should include:

```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### Step 3: Schedule a Cron job and write to the database

In a new terminal window, navigate to the SDK directory.

```bash
cd bindings/java/sdk/batch
```

Install the dependencies:

```bash
mvn clean install
```

Run the `batch-sdk` service alongside a Dapr sidecar.

```bash
dapr run --app-id batch-sdk --app-port 8080 --resources-path ../../../components -- java -jar target/BatchProcessingService-0.0.1-SNAPSHOT.jar
```

The code inside the `process_batch` function is executed every 10 seconds (defined in [`binding-cron.yaml`]({{< ref "#componentsbinding-cronyaml-component-file" >}}) in the `components` directory). The binding trigger looks for a route called via HTTP POST in your application by the Dapr sidecar.

```java
@PostMapping(path = cronBindingPath, consumes = MediaType.ALL_VALUE)
public ResponseEntity<String> processBatch() throws IOException, Exception
```

The `batch-sdk` service uses the PostgreSQL output binding defined in the [`binding-postgresql.yaml`]({{< ref "#componentbinding-postgresyaml-component-file" >}}) component to insert the `OrderId`, `Customer`, and `Price` records into the `orders` table. 

```java
try (DaprClient client = new DaprClientBuilder().build()) {

    for (Order order : ordList.orders) {
        String sqlText = String.format(
            "insert into orders (orderid, customer, price) " +
            "values (%s, '%s', %s);", 
            order.orderid, order.customer, order.price);
        logger.info(sqlText);
    
        Map<String, String> metadata = new HashMap<String, String>();
        metadata.put("sql", sqlText);
 
        // Invoke sql output binding using Dapr SDK
        client.invokeBinding(sqlBindingName, "exec", null, metadata).block();
    } 

    logger.info("Finished processing batch");

    return ResponseEntity.ok("Finished processing batch");
}
```

### Step 4: View the output of the job

Notice, as specified above, the code invokes the output binding with the `OrderId`, `Customer`, and `Price` as a payload.

Your output binding's `print` statement output:

```
== APP == 2022-06-22 16:39:17.012  INFO 35772 --- [nio-8080-exec-4] c.s.c.BatchProcessingServiceController   : Processing batch..
== APP == 2022-06-22 16:39:17.268  INFO 35772 --- [nio-8080-exec-4] c.s.c.BatchProcessingServiceController   : insert into orders (orderid, customer, price) values (1, 'John Smith', 100.32);
== APP == 2022-06-22 16:39:17.838  INFO 35772 --- [nio-8080-exec-4] c.s.c.BatchProcessingServiceController   : insert into orders (orderid, customer, price) values (2, 'Jane Bond', 15.4);
== APP == 2022-06-22 16:39:17.844  INFO 35772 --- [nio-8080-exec-4] c.s.c.BatchProcessingServiceController   : insert into orders (orderid, customer, price) values (3, 'Tony James', 35.56);
== APP == 2022-06-22 16:39:17.848  INFO 35772 --- [nio-8080-exec-4] c.s.c.BatchProcessingServiceController   : Finished processing batch
```

In a new terminal, verify the same data has been inserted into the database. Navigate to the `bindings/db` directory.

```bash
cd bindings/db
```

Run the following to start the interactive Postgres CLI:

```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

At the `admin=#` prompt, change to the `orders` table:

```bash
\c orders;
```

At the `orders=#` prompt, select all rows:

```bash
select * from orders;
```

The output should look like this:

```
 orderid |  customer  | price
---------+------------+--------
       1 | John Smith | 100.32
       2 | Jane Bond  |   15.4
       3 | Tony James |  35.56
```

#### `components\binding-cron.yaml` component file

When you execute the `dapr run` command and specify the component path, the Dapr sidecar:

- Initiates the Cron [binding building block]({{< ref bindings >}})
- Calls the binding endpoint (`batch`) every 10 seconds

The Cron `binding-cron.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: cron
  namespace: quickstarts
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 10s" # valid cron schedule
  - name: direction
    value: "input" # direction of the cron binding
```

**Note:** The `metadata` section of `binding-cron.yaml` contains a [Cron expression]({{< ref cron.md >}}) that specifies how often the binding is invoked.

#### `component\binding-postgresql.yaml` component file

When you execute the `dapr run` command and specify the component path, the Dapr sidecar:

- Initiates the PostgreSQL [binding building block]({{< ref postgresql.md >}})
- Connects to PostgreSQL using the settings specified in the `binding-postgresql.yaml` file

With the `binding-postgresql.yaml` component, you can easily swap out the backend database [binding]({{< ref supported-bindings.md >}}) without making code changes.

The PostgreSQL `binding-postgresql.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sqldb
  namespace: quickstarts
spec:
  type: bindings.postgresql
  version: v1
  metadata:
  - name: url # Required
    value: "user=postgres password=docker host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
  - name: direction
    value: "output" # direction of the postgresql binding
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
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/bindings).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Run PostgreSQL Docker container locally

Run the [PostgreSQL instance](https://www.postgresql.org/) locally in a Docker container on your machine. The Quickstart sample includes a Docker Compose file to locally customize, build, run, and initialize the `postgres` container with a default `orders` table.

In a terminal window, from the root of the Quickstarts clone directory, navigate to the `bindings/db` directory.

```bash
cd bindings/db
```

Run the following command to set up the container:

```bash
docker compose up
```

Verify that the container is running locally.

```bash
docker ps
```

The output should include:

```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### Step 3: Schedule a Cron job and write to the database

In a new terminal window, navigate to the SDK directory.

```bash
cd bindings/go/sdk/batch
```

Install the dependencies:

```bash
go build .
```

Run the `batch-sdk` service alongside a Dapr sidecar.

```bash
dapr run --app-id batch-sdk --app-port 6002 --dapr-http-port 3502 --dapr-grpc-port 60002 --resources-path ../../../components -- go run .
```

The code inside the `process_batch` function is executed every 10 seconds (defined in [`binding-cron.yaml`]({{< ref "#componentsbinding-cronyaml-component-file" >}}) in the `components` directory). The binding trigger looks for a route called via HTTP POST in your application by the Dapr sidecar.

```go
// Triggered by Dapr input binding
r.HandleFunc("/"+cronBindingName, processBatch).Methods("POST")
```

The `batch-sdk` service uses the PostgreSQL output binding defined in the [`binding-postgresql.yaml`]({{< ref "#componentbinding-postgresyaml-component-file" >}}) component to insert the `OrderId`, `Customer`, and `Price` records into the `orders` table.

```go
func sqlOutput(order Order) (err error) {

	client, err := dapr.NewClient()
	if err != nil {
		return err
	}

	ctx := context.Background()

	sqlCmd := fmt.Sprintf("insert into orders (orderid, customer, price) values (%d, '%s', %s);", order.OrderId, order.Customer, strconv.FormatFloat(order.Price, 'f', 2, 64))
	fmt.Println(sqlCmd)

	// Insert order using Dapr output binding via Dapr SDK
	in := &dapr.InvokeBindingRequest{
		Name:      sqlBindingName,
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

### Step 4: View the output of the job

Notice, as specified above, the code invokes the output binding with the `OrderId`, `Customer`, and `Price` as a payload.

Your output binding's `print` statement output:

```
== APP == Processing batch..
== APP == insert into orders (orderid, customer, price) values(1, 'John Smith', 100.32)
== APP == insert into orders (orderid, customer, price) values(2, 'Jane Bond', 15.4)
== APP == insert into orders (orderid, customer, price) values(3, 'Tony James', 35.56)
```

In a new terminal, verify the same data has been inserted into the database. Navigate to the `bindings/db` directory.

```bash
cd bindings/db
```

Run the following to start the interactive Postgres CLI:

```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

At the `admin=#` prompt, change to the `orders` table:

```bash
\c orders;
```

At the `orders=#` prompt, select all rows:

```bash
select * from orders;
```

The output should look like this:

```
 orderid |  customer  | price
---------+------------+--------
       1 | John Smith | 100.32
       2 | Jane Bond  |   15.4
       3 | Tony James |  35.56
```

#### `components\binding-cron.yaml` component file

When you execute the `dapr run` command and specify the component path, the Dapr sidecar:

- Initiates the Cron [binding building block]({{< ref bindings >}})
- Calls the binding endpoint (`batch`) every 10 seconds

The Cron `binding-cron.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: cron
  namespace: quickstarts
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 10s" # valid cron schedule
  - name: direction
    value: "input" # direction of the cron binding
```

**Note:** The `metadata` section of `binding-cron.yaml` contains a [Cron expression]({{< ref cron.md >}}) that specifies how often the binding is invoked.

#### `component\binding-postgresql.yaml` component file

When you execute the `dapr run` command and specify the component path, the Dapr sidecar:

- Initiates the PostgreSQL [binding building block]({{< ref postgresql.md >}})
- Connects to PostgreSQL using the settings specified in the `binding-postgresql.yaml` file

With the `binding-postgresql.yaml` component, you can easily swap out the backend database [binding]({{< ref supported-bindings.md >}}) without making code changes.

The PostgreSQL `binding-postgresql.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sqldb
  namespace: quickstarts
spec:
  type: bindings.postgresql
  version: v1
  metadata:
  - name: url # Required
    value: "user=postgres password=docker host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
  - name: direction
    value: "output" # direction of the postgresql binding
```

In the YAML file:

- `spec/type` specifies that PostgreSQL is used for this binding.
- `spec/metadata` defines the connection to the PostgreSQL instance used by the component.

{{% /codetab %}}

{{< /tabs >}}

## Tell us what you think!

We're continuously working to improve our Quickstart examples and value your feedback. Did you find this quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps

- Use Dapr Bindings with HTTP instead of an SDK.
  - [Python](https://github.com/dapr/quickstarts/tree/master/bindings/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/bindings/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/bindings/csharp/http)
  - [Java](https://github.com/dapr/quickstarts/tree/master/bindings/java/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/bindings/go/http)
- Learn more about [Binding building block]({{< ref bindings >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
