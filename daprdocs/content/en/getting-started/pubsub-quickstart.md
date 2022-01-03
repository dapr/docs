---
type: docs
title: "Publish and Subscribe Quickstart"
linkTitle: "Publish and Subscribe Quickstart"
weight: 60
description: "Quickstart aimed at helping developers get started with Dapr's Publish and Subscribe building block"
---

Let's take a look at the Publish and Subscribe (Pub/Sub) building block. With Dapr's extensible Pub/Sub system:

- Developers can publish and subscribe to topics.
- Operators can use their preferred infrastructure with components for Pub/Sub (Redis Streams, Kafka, etc.).

Behind the scenes of your pub/sub services:

1. The publisher service repeatedly publishes messages to a topic.
1. A redis component stores those messages.
1. The subscriber to that topic pulls and processes the messages.

[Learn more about the publish and subscribe building block and how it works]({{< ref pubsub >}}).

In this quickstart, you will learn how to set up two services: a publisher and a subscriber. 

### Select your preferred language SDK

Select your preferred language and SDK example before proceeding with the quickstart. 

{{< tabs "gRPC" "Http" "Python SDK" ".NET SDK" "Java SDK" "Go SDK" "JavaScript SDK" "PHP SDK" >}}
 <!-- gRPC -->
{{% codetab %}}
## TODO gRPC
{{% /codetab %}}

 <!-- Http -->
{{% codetab %}}
## TODO Http
{{% /codetab %}}

 <!-- Python -->
{{% codetab %}}

### Pre-requisites

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started)
- [Install Python 3.7+](https://www.python.org/downloads/)

### Clone the example

1. Clone our sample set up specifically for the Python SDK:

    ```bash
    git clone git@github.com:dapr/python-sdk.git
    ```
1. Navigate to the invoke-simple project directory:
    ```bash
    cd python-sdk/examples/invoke-simple
    ```

### Install Dapr python-SDK

```bash
pip3 install dapr dapr-ext-grpc
```

### Run the services

{{< tabs "Self-Hosted Mode" "Kubernetes" >}}

{{% codetab %}}

#### Run in self-hosted mode

1. Run the dapr sidecar alongside your `invoke-receiver` service. 
    * Expose gRPC server receiver on port 50051.

    ```bash
    dapr run --app-id invoke-receiver --app-protocol grpc --app-port 50051 python3 invoke-receiver.py
    ```

1. Run the dapr sidecar alongside your `invoke-caller` service.

    ```bash
    dapr run --app-id invoke-caller --app-protocol grpc --dapr-http-port 3500 python3 invoke-caller.py
    ```

Notice in the terminal output that the caller service is repeatedly calling the `mymethod` in the `invoker-receiver` service.

### Clean up

Remove your resources with the following dapr CLI commands:

```bash
dapr stop --app-id invoke-caller
dapr stop --app-id invoke-receiver
```

{{% /codetab %}}

{{% codetab %}}

#### Run in Kubernetes mode

1. Build the docker image. Make sure to include the period to use the Dockerfile from the current directory.

   ```bash
   docker build -t [your registry]/invokesimple:latest .
   ```

2. Push the docker image.

   ```bash
   docker push [your registry]/invokesimple:latest
   ```

3. Edit image name to `[your registry]/invokesimple:latest` in deploy/*.yaml.

4. Deploy the applications.

   ```bash
   kubectl apply -f ./deploy/
   ```

5. Run the following commands to view logs for the apps and sidecars:

   - Logs for caller sidecar:

       ```bash
       dapr  logs -a invoke-caller -k
       ```

   - Logs for caller app:

       ```bash
       kubectl logs -l app="invokecaller" -c invokecaller
       ```

   - Logs for receiver sidecar:

       ```bash
       dapr  logs -a invoke-receiver -k
       ```

   - Logs for receiver app:

       ```bash
       kubectl logs -l app="invokereceiver" -c invokereceiver
       ```

{{% /codetab %}}

{{< /tabs >}}

### Explore more of the Python SDK

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}
## TODO .NET
{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}
## TODO Java
{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}
## TODO Go
{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}
## TODO JavaScript
{{% /codetab %}}

 <!-- PHP -->
{{% codetab %}}
## TODO PHP
{{% /codetab %}}

{{< /tabs >}}

### Related Links
* [Python SDK Docs]({{< ref python >}})
* [Python SDK Repository](https://github.com/dapr/python-sdk)
* [Publish and Subscribe Overview]({{< ref pubsub-overview >}})

{{< button text="Explore More Quickstarts  >>" page="more-quickstarts" >}}