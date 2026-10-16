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
pip install dapr-ext-grpc
```
{{% /tab %}}

{{% tab header="Development" %}}
{{% alert title="Note" color="warning" %}}
The development package will contain features and behavior that will be compatible with the pre-release version of the Dapr runtime. Make sure to uninstall any stable versions of the Python SDK extension before installing the `dapr-dev` package.
{{% /alert %}}

```bash
pip3 install dapr-ext-grpc-dev
```
{{% /tab %}}

{{< /tabpane >}}

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

```python
from typing import Optional
from cloudevents.sdk.event import v1
from dapr.ext.grpc import App
from dapr.clients.grpc._response import TopicEventResponse

app = App()

# Default subscription for a topic
@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A')
def mytopic(event: v1.Event) -> Optional[TopicEventResponse]:
    print(event.Data(),flush=True)
    # Returning None (or not doing a return explicitly) is equivalent
    # to returning a TopicEventResponse("success").
    # You can also return TopicEventResponse("retry") for dapr to log
    # the message and retry delivery later, or TopicEventResponse("drop")
    # for it to drop the message
    return TopicEventResponse("success")

# Specific handler using Pub/Sub routing
@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A',
               rule=Rule("event.type == \"important\"", 1))
def mytopic_important(event: v1.Event) -> None:
    print(event.Data(),flush=True)

# Handler with disabled topic validation
@app.subscribe(pubsub_name='pubsub-mqtt', topic='topic/#', disable_topic_validation=True,)
def mytopic_wildcard(event: v1.Event) -> None:
    print(event.Data(),flush=True)

app.run(50051)
```

A full sample can be found [here](https://github.com/dapr/python-sdk/blob/v1.0.0rc2/examples/pubsub-simple/subscriber.py).

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

## Asyncio

`dapr.ext.grpc.aio` provides the same `App` backed by a `grpc.aio` server, so handlers can be `async def` and are awaited on the event loop. It exposes the same names as `dapr.ext.grpc` and the decorators take the same arguments; the import changes, and `run()` and `stop()` become coroutines.

{{% alert title="Note" color="primary" %}}
`dapr.ext.grpc.aio` is available from Dapr Python SDK 1.19, in the bundled package: `pip install "dapr[grpc]"`. It is not part of the legacy `dapr-ext-grpc` distribution.
{{% /alert %}}

### Listen for service invocation requests

```python
import asyncio

from dapr.ext.grpc.aio import App, InvokeMethodRequest, InvokeMethodResponse

app = App()

@app.method(name='my-method')
async def mymethod(request: InvokeMethodRequest) -> InvokeMethodResponse:
    print(request.text(), flush=True)
    return InvokeMethodResponse(b'INVOKE_RECEIVED', 'text/plain; charset=UTF-8')

asyncio.run(app.run(50051))
```

A full sample can be found [here](https://github.com/dapr/python-sdk/tree/main/examples/invoke-simple-async).

### Subscribe to a topic

Annotate the event parameter with `SubscriptionMessage` to receive that type. Handlers return a `TopicEventResponse` exactly as they do on the synchronous app.

```python
import asyncio

from dapr.ext.grpc.aio import App, SubscriptionMessage, TopicEventResponse

app = App()

@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A')
async def mytopic(event: SubscriptionMessage) -> TopicEventResponse:
    print(event.data(), flush=True)
    return TopicEventResponse('success')

asyncio.run(app.run(50051))
```

A full sample can be found [here](https://github.com/dapr/python-sdk/tree/main/examples/pubsub-simple-async).

### Setup input binding trigger

```python
import asyncio

from dapr.ext.grpc.aio import App, BindingRequest

app = App()

@app.binding('kafkaBinding')
async def binding(request: BindingRequest) -> None:
    print(request.text(), flush=True)

asyncio.run(app.run(50051))
```

### Differences from the synchronous app

- `run()` and `stop()` are coroutines. `stop(grace=None)` takes a grace period in seconds for in-flight requests.
- `start()` starts the server and returns once it is accepting requests, so the app can share an event loop with other work, for example an ASGI lifespan handler.
- The gRPC server is created on the first `run()` or `start()`, because `grpc.aio` binds to the event loop that is running at that moment. Call `add_external_service()` before starting the app.
- An app belongs to the event loop that started it. Stop it from that loop before the loop closes.
- Plain (non-async) handlers are accepted but run inline on the event loop, so a blocking handler stalls every other request. The app emits a one-time `UserWarning` when one is registered with `method`, `subscribe`, `binding` or `job_event`.
- The decorators return the decorated function, so the name stays bound.

## Related links
- [PyPi](https://pypi.org/project/dapr-ext-grpc/)
