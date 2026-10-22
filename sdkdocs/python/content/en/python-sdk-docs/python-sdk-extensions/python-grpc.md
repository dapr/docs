---
type: docs
title: "Getting started with the Dapr Python gRPC service extension"
linkTitle: "gRPC"
weight: 100000
description: How to get up and running with the Dapr Python gRPC extension
---

The Dapr Python SDK provides a built in gRPC server extension, `dapr.ext.grpc`, for creating Dapr services.

## Installation

You can download and install the Dapr gRPC server extension with:

{{< tabpane text=true >}}

{{% tab header="Stable" %}}
```bash
pip install "dapr[grpc]"
```
{{% /tab %}}

{{% tab header="Development" %}}
{{% alert title="Note" color="warning" %}}
The development version will contain features and behavior that will be compatible with the pre-release version of the Dapr runtime. Only tagged releases are published to PyPI, so install the development version from the GitHub repository. Make sure to uninstall any stable versions of the Python SDK before installing it.
{{% /alert %}}

```bash
pip install "dapr[grpc] @ git+https://github.com/dapr/python-sdk.git@main"
```
{{% /tab %}}

{{< /tabpane >}}

Starting with Dapr 1.19, this extension is an extra of the `dapr` package. The `dapr-ext-grpc` package is no longer published. If you installed it before, follow the [upgrade steps]({{% ref "python#install-extensions" %}}) to move to the extra. The import path does not change.

## Examples

The `App` object can be used to create a server.

### Listen for service invocation requests

The `InvokeMethodReqest` and `InvokeMethodResponse` objects can be used to handle incoming requests.

A simple service that will listen and respond to requests will look like:

```python
from dapr.ext.grpc import App, InvokeMethodRequest, InvokeMethodResponse

app = App()

@app.method(name='my-method')
def mymethod(request: InvokeMethodRequest) -> InvokeMethodResponse:
    print(request.metadata, flush=True)
    print(request.text(), flush=True)

    return InvokeMethodResponse(b'INVOKE_RECEIVED', "text/plain; charset=UTF-8")

app.run(50051)
```

A full sample can be found [here](https://github.com/dapr/python-sdk/tree/v1.0.0rc2/examples/invoke-simple).

### Subscribe to a topic

When subscribing to a topic, you can instruct dapr whether the event delivered has been accepted, or whether it should be dropped, or retried later.

Annotate the event parameter of each handler with `SubscriptionMessage`, the same type that streaming subscriptions deliver. It gives you the parsed payload (`data()`), the delivery metadata (`metadata()`) and the CloudEvent fields, such as `id()`, `type()` and `extensions()`.

```python
from typing import Optional
from dapr.ext.grpc import App, Rule, SubscriptionMessage
from dapr.clients.grpc._response import TopicEventResponse

app = App()

# Default subscription for a topic
@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A')
def mytopic(event: SubscriptionMessage) -> Optional[TopicEventResponse]:
    print(event.data(),flush=True)
    # Returning None (or not doing a return explicitly) is equivalent
    # to returning a TopicEventResponse("success").
    # You can also return TopicEventResponse("retry") for dapr to log
    # the message and retry delivery later, or TopicEventResponse("drop")
    # for it to drop the message
    return TopicEventResponse("success")

# Specific handler using Pub/Sub routing
@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A',
               rule=Rule("event.type == \"important\"", 1))
def mytopic_important(event: SubscriptionMessage) -> None:
    print(event.data(),flush=True)

# Handler with disabled topic validation
@app.subscribe(pubsub_name='pubsub-mqtt', topic='topic/#', disable_topic_validation=True,)
def mytopic_wildcard(event: SubscriptionMessage) -> None:
    print(event.data(),flush=True)

app.run(50051)
```

A full sample can be found [here](https://github.com/dapr/python-sdk/blob/v1.0.0rc2/examples/pubsub-simple/subscriber.py).

{{% alert title="Deprecated" color="warning" %}}
Handlers that are not annotated, or that are annotated with `cloudevents.sdk.event.v1.Event`, receive the CloudEvents-based event, and `subscribe()` emits a `DeprecationWarning` when it registers them. Annotate them with `SubscriptionMessage` before the type is removed:

- In 1.20, handlers that are not annotated receive `SubscriptionMessage`. Only handlers annotated with the CloudEvents type still receive it.
- In 1.21, the `dapr[grpc]` extra no longer installs `cloudevents`.
- In 1.22, the CloudEvents-based type is removed.
{{% /alert %}}

### Setup input binding trigger

```python
from dapr.ext.grpc import App, BindingRequest

app = App()

@app.binding('kafkaBinding')
def binding(request: BindingRequest):
    print(request.text(), flush=True)

app.run(50051)
```

A full sample can be found [here](https://github.com/dapr/python-sdk/tree/v1.0.0rc2/examples/invoke-binding).

## Related links
- [PyPi](https://pypi.org/project/dapr/)
