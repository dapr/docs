---
type: docs
title: "Quickstart: Secrets Management"
linkTitle: "Secrets Management"
weight: 77
description: "Get started with Dapr's Secrets Management building block"
---

Dapr provides a dedicated secrets API that allows developers to retrieve secrets from a secrets store. In this quickstart, you:

1. Run a microservice with a secret store component.
1. Retrieve secrets using the Dapr secrets API in the application code.

<img src="/images/secretsmanagement-quickstart/secrets-mgmt-quickstart.png" width=1000 alt="Diagram showing secrets management of example service.">


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

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/secrets_management/python/sdk).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Retrieve the secret

In a terminal window, navigate to the `order-processor` directory.

```bash
cd secrets_management/python/sdk/order-processor
```

Install the dependencies:

```bash
pip3 install -r requirements.txt
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- python3 app.py
```

> **Note**: Since Python3.exe is not defined in Windows, you may need to use `python app.py` instead of `python3 app.py`.


#### Behind the scenes

**`order-processor` service**

Notice how the `order-processor` service below points to:

- The `DAPR_SECRET_STORE` defined in the `local-secret-store.yaml` component.
- The secret defined in `secrets.json`.

```python
# app.py
DAPR_SECRET_STORE = 'localsecretstore'
SECRET_NAME = 'secret'
with DaprClient() as client:
    secret = client.get_secret(store_name=DAPR_SECRET_STORE, key=SECRET_NAME)
    logging.info('Fetched Secret: %s', secret.secret)
```

**`local-secret-store.yaml` component**

`DAPR_SECRET_STORE` is defined in the `local-secret-store.yaml` component file, located in [secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml):

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

In the YAML file:

- `metadata/name` is how your application references the component (called `DAPR_SECRET_STORE` in the code sample).
- `spec/metadata` defines the connection to the secret used by the component.

**`secrets.json` file**

`SECRET_NAME` is defined in the `secrets.json` file, located in [secrets_management/python/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/python/sdk/order-processor/secrets.json):

```json
{
    "secret": "YourPasskeyHere"
}
```

### Step 3: View the order-processor outputs

As specified in the application code above, the `order-processor` service retrieves the secret via the Dapr secret store and displays it in the console.

Order-processor output:

```
== APP == INFO:root:Fetched Secret: {'secret': 'YourPasskeyHere'}
```

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

Clone the [sample provided in the Quickstarts repo](hhttps://github.com/dapr/quickstarts/tree/master/secrets_management/javascript/sdk).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Retrieve the secret

In a terminal window, navigate to the `order-processor` directory.

```bash
cd secrets_management/javascript/sdk/order-processor
```

Install the dependencies:

```bash
npm install
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- npm start
```

#### Behind the scenes

**`order-processor` service**

Notice how the `order-processor` service below points to:

- The `DAPR_SECRET_STORE` defined in the `local-secret-store.yaml` component.
- The secret defined in `secrets.json`.

```javascript
// index.js
const DAPR_SECRET_STORE = "localsecretstore";
const SECRET_NAME = "secret";

async function main() {
    // ...
    const secret = await client.secret.get(DAPR_SECRET_STORE, SECRET_NAME);
    console.log("Fetched Secret: " + JSON.stringify(secret));
}
```

**`local-secret-store.yaml` component**

`DAPR_SECRET_STORE` is defined in the `local-secret-store.yaml` component file, located in [secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml):

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

In the YAML file:

- `metadata/name` is how your application references the component (called `DAPR_SECRET_STORE` in the code sample).
- `spec/metadata` defines the connection to the secret used by the component.

**`secrets.json` file**

`SECRET_NAME` is defined in the `secrets.json` file, located in [secrets_management/javascript/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/javascript/sdk/order-processor/secrets.json):

```json
{
    "secret": "YourPasskeyHere"
}
```

### Step 3: View the order-processor outputs

As specified in the application code above, the `order-processor` service retrieves the secret via the Dapr secret store and displays it in the console.

Order-processor output:

```
== APP ==
== APP == > order-processor@1.0.0 start
== APP == > node index.js
== APP ==
== APP == Fetched Secret: {"secret":"YourPasskeyHere"}
```

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->
- [.NET 6](https://dotnet.microsoft.com/download/dotnet/6.0), [.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0) or [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0) installed

**NOTE:** .NET 6 is the minimally supported version of .NET for the Dapr .NET SDK packages in this release. Only .NET 8 and .NET 9
will be supported in Dapr v1.16 and later releases.

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/secrets_management/csharp/sdk).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Retrieve the secret

In a terminal window, navigate to the `order-processor` directory.

```bash
cd secrets_management/csharp/sdk/order-processor
```

Install the dependencies:

```bash
dotnet restore
dotnet build
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- dotnet run
```

#### Behind the scenes

**`order-processor` service**

Notice how the `order-processor` service below points to:

- The `DAPR_SECRET_STORE` defined in the `local-secret-store.yaml` component.
- The secret defined in `secrets.json`.

```csharp
// Program.cs
const string DAPR_SECRET_STORE = "localsecretstore";
const string SECRET_NAME = "secret";
var client = new DaprClientBuilder().Build();

var secret = await client.GetSecretAsync(DAPR_SECRET_STORE, SECRET_NAME);
var secretValue = string.Join(", ", secret);
Console.WriteLine($"Fetched Secret: {secretValue}");
```

**`local-secret-store.yaml` component**

`DAPR_SECRET_STORE` is defined in the `local-secret-store.yaml` component file, located in [secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml):

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

In the YAML file:

- `metadata/name` is how your application references the component (called `DAPR_SECRET_NAME` in the code sample).
- `spec/metadata` defines the connection to the secret used by the component.

**`secrets.json` file**

`SECRET_NAME` is defined in the `secrets.json` file, located in [secrets_management/csharp/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/csharp/sdk/order-processor/secrets.json):

```json
{
    "secret": "YourPasskeyHere"
}
```

### Step 3: View the order-processor outputs

As specified in the application code above, the `order-processor` service retrieves the secret via the Dapr secret store and displays it in the console.

Order-processor output:

```
== APP == Fetched Secret: [secret, YourPasskeyHere]
```

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 17 (or greater):
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads), or
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html), version 3.x.
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/secrets_management/java/sdk).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Retrieve the secret

In a terminal window, navigate to the `order-processor` directory.

```bash
cd secrets_management/java/sdk/order-processor
```

Install the dependencies:

```bash
mvn clean install
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

#### Behind the scenes

**`order-processor` service**

Notice how the `order-processor` service below points to:

- The `DAPR_SECRET_STORE` defined in the `local-secret-store.yaml` component.
- The secret defined in `secrets.json`.

```java
// OrderProcessingServiceApplication.java
private static final String SECRET_STORE_NAME = "localsecretstore";
// ...
    Map<String, String> secret = client.getSecret(SECRET_STORE_NAME, "secret").block();
    System.out.println("Fetched Secret: " + secret);
```

**`local-secret-store.yaml` component**

`DAPR_SECRET_STORE` is defined in the `local-secret-store.yaml` component file, located in [secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml):

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

In the YAML file:

- `metadata/name` is how your application references the component (called `DAPR_SECRET_NAME` in the code sample).
- `spec/metadata` defines the connection to the secret used by the component.

**`secrets.json` file**

`SECRET_NAME` is defined in the `secrets.json` file, located in [secrets_management/java/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/java/sdk/order-processor/secrets.json):

```json
{
    "secret": "YourPasskeyHere"
}
```

### Step 3: View the order-processor outputs

As specified in the application code above, the `order-processor` service retrieves the secret via the Dapr secret store and displays it in the console.

Order-processor output:

```
== APP == Fetched Secret: {secret=YourPasskeyHere}
```

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

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/secrets_management/go/sdk).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Retrieve the secret

In a terminal window, navigate to the `order-processor` directory.

```bash
cd secrets_management/go/sdk/order-processor
```

Install the dependencies:

```bash
go build .
```

Run the `order-processor` service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- go run .
```

#### Behind the scenes

**`order-processor` service**

Notice how the `order-processor` service below points to:

- The `DAPR_SECRET_STORE` defined in the `local-secret-store.yaml` component.
- The secret defined in `secrets.json`.

```go
const DAPR_SECRET_STORE = "localsecretstore"
const SECRET_NAME = "secret"
// ...
secret, err := client.GetSecret(ctx, DAPR_SECRET_STORE, SECRET_NAME, nil)
if secret != nil {
    fmt.Println("Fetched Secret: ", secret[SECRET_NAME])
}
```

**`local-secret-store.yaml` component**

`DAPR_SECRET_STORE` is defined in the `local-secret-store.yaml` component file, located in [secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml):

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

In the YAML file:

- `metadata/name` is how your application references the component (called `DAPR_SECRET_NAME` in the code sample).
- `spec/metadata` defines the connection to the secret used by the component.

**`secrets.json` file**

`SECRET_NAME` is defined in the `secrets.json` file, located in [secrets_management/go/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/go/sdk/order-processor/secrets.json):

```json
{
    "secret": "YourPasskeyHere"
}
```

### Step 3: View the order-processor outputs

As specified in the application code above, the `order-processor` service retrieves the secret via the Dapr secret store and displays it in the console.

Order-processor output:

```
== APP == Fetched Secret:  YourPasskeyHere
```

{{% /codetab %}}

{{< /tabs >}}

## Tell us what you think!

We're continuously working to improve our Quickstart examples and value your feedback. Did you find this Quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps

- Use Dapr Secrets Management with HTTP instead of an SDK.
  - [Python](https://github.com/dapr/quickstarts/tree/master/secrets_management/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/secrets_management/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/secrets_management/csharp/http)
  - [Java](https://github.com/dapr/quickstarts/tree/master/secrets_management/java/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/secrets_management/go/http)
- Learn more about the [Secrets Management building block]({{< ref secrets-overview >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
