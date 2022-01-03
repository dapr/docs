---
type: docs
title: "Service Invocation Quickstart"
linkTitle: "Service Invocation Quickstart"
weight: 50
description: "Use Dapr's Service Invocation API to call securely from one service to another service"
---

We demonstrate how to use Dapr's service invocation building block API to perform secure service-to-service invocation. 

In the following guide, you will set up two services, a `caller` service and a `receiver` service. The `caller` service will use Dapr's service invocation to identify and call a method defined in the `receiver` service.

You can learn more about the service invocation building block and how it works in [these docs]({{< ref service-invocation >}}).

### Select a protocol or language SDK
Before continuing, select a protocol or language SDK example to follow along with. 

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

Next, git clone the python-sdk repository and navigate to the invoke-simple project directory:

```bash
git clone git@github.com:dapr/python-sdk.git
cd python-sdk/examples/invoke-simple
```

### Install the Dapr Python-SDK
The first thing we'll need is to install the Dapr Python SDK library:

```bash
pip3 install dapr dapr-ext-grpc
```

### Running in self-hosted mode
We'll now jump into the example by running the `receiver` service with a dapr sidecar alongside it. The `receiver` service defines a method called `mymethod`, which takes a request and prints the data and metadata of that request.

We'll do this by using the Dapr CLI to run the `receiver` with the dapr sidecar:

```bash
# 1. Start Receiver (expose gRPC server receiver on port 50051)
dapr run --app-id receiver --app-protocol grpc --app-port 50051 python3 receiver.py
```

Next, we'll run the `caller` service. The `caller` service instantiates the python Dapr client and creates data to send to the `receiver` service. 

Use the following Dapr CLI command to run the `caller` service with a Dapr sidecar:

```bash
# 2. Start Caller
dapr run --app-id caller --app-protocol grpc --dapr-http-port 3500 python3 caller.py
```

Notice the requests from the `caller` service begin immediately. Using Dapr's service invocation API, the `caller` service is able to identify the `receiver` service by it's APP ID and invoke the `mymethod`.

### Inspect the Results
In the terminal output where `dapr run` was executed for the `caller` service, you will see the output for the response from the `caller` service after each consecutive call.

```bash
== APP == text/plain
== APP == INVOKE_RECEIVED
== APP == text/plain
== APP == INVOKE_RECEIVED
== APP == text/plain
== APP == INVOKE_RECEIVED
```

In the other terminal shell for the `receiver` service, the output logged for every request.

```bash
== APP == {'user-agent': ['grpc-go/1.38.0'], 'forwarded': ['for=192.168.0.10;by=192.168.0.10;host=WIN-EH0C40K0610.redmond.corp.microsoft.com'], 'dapr-accept': ['*/*'], 'dapr-content-length': ['35'], 'dapr-content-type': ['application/json; charset=utf-8'], 'traceparent': ['00-3e33ed5ab75dac1d5ec7fe702ea57f19-6b454b19b622482d-01'], 'grpc-trace-bin': [b'\x00\x00>3\xedZ\xb7]\xac\x1d^\xc7\xfep.\xa5\x7f\x19\x01kEK\x19\xb6"H-\x02\x01'], 'dapr-host': ['127.0.0.1:3500'], 'x-forwarded-for': ['192.168.0.10'], 'x-forwarded-host': ['WIN-EH0C40K0610.redmond.corp.microsoft.com']}
== APP == {"id": 1, "message": "hello world"}
```

### Cleanup

```bash
dapr stop --app-id caller
dapr stop --app-id receiver
```
### Related Links
* [Python SDK Docs]({{< ref python >}})
* [Python SDK Repository](https://github.com/dapr/python-sdk)
* [Service Invocation Overview]({{< ref service-invocation-overview >}})

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

{{< button text="Next step: Publish and Subscribe to messages >>" page="pubsub-quickstart" >}}