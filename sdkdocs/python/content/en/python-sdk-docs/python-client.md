---
type: docs
title: "Getting started with the Dapr client Python SDK"
linkTitle: "Client"
weight: 10000
description: How to get up and running with the Dapr Python SDK
---

The Dapr client package allows you to interact with other Dapr applications from a Python application.

{{% alert title="Note" color="primary" %}}
 If you haven't already, [try out one of the quickstarts]({{% ref quickstarts %}}) for a quick walk-through on how to use the Dapr Python SDK with an API building block.

{{% /alert %}}

## Prerequisites

[Install the Dapr Python package]({{% ref "python#installation" %}}) before getting started.

## Import the client package

The `dapr` package contains the `DaprClient`, which is used to create and use a client.

```python
from dapr.clients import DaprClient
```

## Initialising the client
You can initialise a Dapr client in multiple ways:

#### Default values:
When you initialise the client without any parameters it will use the default values for a Dapr 
sidecar instance (`127.0.0.1:50001`).
```python
from dapr.clients import DaprClient

with DaprClient() as d:
    # use the client
```

#### Specifying an endpoint on initialisation:  
When passed as an argument in the constructor, the gRPC endpoint takes precedence over any 
configuration or environment variable.

```python
from dapr.clients import DaprClient

with DaprClient("mydomain:50051?tls=true") as d:
    # use the client
```  

#### Configuration options:  

##### Dapr Sidecar Endpoints
You can use the standardised `DAPR_GRPC_ENDPOINT` environment variable to
specify the gRPC endpoint. When this variable is set, the client can be initialised 
without any arguments:

```bash
export DAPR_GRPC_ENDPOINT="mydomain:50051?tls=true"
```
```python
from dapr.clients import DaprClient

with DaprClient() as d:
    # the client will use the endpoint specified in the environment variables
```  

The legacy environment variables `DAPR_RUNTIME_HOST`, `DAPR_HTTP_PORT` and `DAPR_GRPC_PORT` are 
also supported, but `DAPR_GRPC_ENDPOINT` takes precedence.

##### Dapr API Token
If your Dapr instance is configured to require the `DAPR_API_TOKEN` environment variable, you can
set it in the environment and the client will use it automatically.  
You can read more about Dapr API token authentication [here](https://docs.dapr.io/operations/security/api-token/).

##### Health timeout
On client initialisation, a health check is performed against the Dapr sidecar (`/healthz/outbound`).
The client will wait for the sidecar to be up and running before proceeding.  

The default healthcheck timeout is 60 seconds, but it can be overridden by setting the `DAPR_HEALTH_TIMEOUT`
environment variable.

##### Retries and timeout

The Dapr client can retry a request if a specific error code is received from the sidecar. This is
configurable through the `DAPR_API_MAX_RETRIES` environment variable and is picked up automatically, 
not requiring any code changes.
The default value for `DAPR_API_MAX_RETRIES` is `0`, which means no retries will be made.  

You can fine-tune more retry parameters by creating a `dapr.clients.retry.RetryPolicy` object and
passing it to the DaprClient constructor:

```python
from dapr.clients.retry import RetryPolicy

retry = RetryPolicy(
    max_attempts=5, 
    initial_backoff=1, 
    max_backoff=20, 
    backoff_multiplier=1.5,
    retryable_http_status_codes=[408, 429, 500, 502, 503, 504],
    retryable_grpc_status_codes=[StatusCode.UNAVAILABLE, StatusCode.DEADLINE_EXCEEDED, ]
)

with DaprClient(retry_policy=retry) as d:
    ...
```

or for actors:
```python
factory = ActorProxyFactory(retry_policy=RetryPolicy(max_attempts=3))
proxy = ActorProxy.create('DemoActor', ActorId('1'), DemoActorInterface, factory)
```

**Timeout** can be set for all calls through the environment variable `DAPR_API_TIMEOUT_SECONDS`. The default value is 60 seconds.

> Note: You can control timeouts on service invocation separately, by passing a `timeout` parameter to the `invoke_method` method. 

## Error handling
Initially, errors in Dapr followed the [Standard gRPC error model](https://grpc.io/docs/guides/error/#standard-error-model). However, to provide more detailed and informative error messages, in version 1.13 an enhanced error model has been introduced which aligns with the gRPC [Richer error model](https://grpc.io/docs/guides/error/#richer-error-model). In response, the Python SDK implemented `DaprGrpcError`, a custom exception class designed to improve the developer experience.  
It's important to note that the transition to using `DaprGrpcError` for all gRPC status exceptions is a work in progress. As of now, not every API call in the SDK has been updated to leverage this custom exception. We are actively working on this enhancement and welcome contributions from the community.

Example of handling `DaprGrpcError` exceptions when using the Dapr python-SDK:

```python
try:
    d.save_state(store_name=storeName, key=key, value=value)
except DaprGrpcError as err:
    print(f'Status code: {err.code()}')
    print(f"Message: {err.message()}")
    print(f"Error code: {err.error_code()}")
    print(f"Error info(reason): {err.error_info.reason}")
    print(f"Resource info (resource type): {err.resource_info.resource_type}")
    print(f"Resource info (resource name): {err.resource_info.resource_name}")
    print(f"Bad request (field): {err.bad_request.field_violations[0].field}")
    print(f"Bad request (description): {err.bad_request.field_violations[0].description}")
```


## Building blocks

The Python SDK allows you to interface with all of the [Dapr building blocks]({{% ref building-blocks %}}).

### Invoke a service

The Dapr Python SDK provides a simple API for invoking services via either HTTP or gRPC (deprecated). The protocol can be selected by setting the `DAPR_API_METHOD_INVOCATION_PROTOCOL` environment variable, defaulting to HTTP when unset. GRPC service invocation in Dapr is deprecated and GRPC proxying is recommended as an alternative.

```python 
from dapr.clients import DaprClient

with DaprClient() as d:
    # invoke a method (gRPC or HTTP GET)    
    resp = d.invoke_method('service-to-invoke', 'method-to-invoke', data='{"message":"Hello World"}')

    # for other HTTP verbs the verb must be specified
    # invoke a 'POST' method (HTTP only)    
    resp = d.invoke_method('service-to-invoke', 'method-to-invoke', data='{"id":"100", "FirstName":"Value", "LastName":"Value"}', http_verb='post')
```

The base endpoint for HTTP api calls is specified in the `DAPR_HTTP_ENDPOINT` environment variable.
If this variable is not set, the endpoint value is derived from the `DAPR_RUNTIME_HOST` and `DAPR_HTTP_PORT` variables, whose default values are `127.0.0.1` and `3500` accordingly.

The base endpoint for gRPC calls is the one used for the client initialisation ([explained above](#initialising-the-client)).


- For a full guide on service invocation visit [How-To: Invoke a service]({{% ref howto-invoke-discover-services.md %}}).
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/master/examples/invoke-simple) for code samples and instructions to try out service invocation.

### Save & get application state

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    # Save state
    d.save_state(store_name="statestore", key="key1", value="value1")

    # Get state
    data = d.get_state(store_name="statestore", key="key1").data

    # Delete state
    d.delete_state(store_name="statestore", key="key1")
```

- For a full list of state operations visit [How-To: Get & save state]({{% ref howto-get-save-state.md %}}).
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/master/examples/state_store) for code samples and instructions to try out state management.

### Query application state (Alpha)

```python
    from dapr import DaprClient

    query = '''
    {
        "filter": {
            "EQ": { "state": "CA" }
        },
        "sort": [
            {
                "key": "person.id",
                "order": "DESC"
            }
        ]
    }
    '''

    with DaprClient() as d:
        resp = d.query_state(
            store_name='state_store',
            query=query,
            states_metadata={"metakey": "metavalue"},  # optional
        )
```

- For a full list of state store query options visit [How-To: Query state]({{% ref howto-state-query-api.md %}}).
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/master/examples/state_store_query) for code samples and instructions to try out state store querying.

### Publish & subscribe

#### Publish messages

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.publish_event(pubsub_name='pubsub', topic_name='TOPIC_A', data='{"message":"Hello World"}')
```


Send [CloudEvents](https://cloudevents.io/) messages with a json payload:
```python
from dapr.clients import DaprClient
import json

with DaprClient() as d:
    cloud_event = {
        'specversion': '1.0',
        'type': 'com.example.event',
        'source': 'my-service',
        'id': 'myid',
        'data': {'id': 1, 'message': 'hello world'},
        'datacontenttype': 'application/json',
    }

    # Set the data content type to 'application/cloudevents+json'
    resp = d.publish_event(
        pubsub_name='pubsub',
        topic_name='TOPIC_CE',
        data=json.dumps(cloud_event),
        data_content_type='application/cloudevents+json',
    )
```

Publish [CloudEvents](https://cloudevents.io/) messages with plain text payload:
```python
from dapr.clients import DaprClient
import json

with DaprClient() as d:
    cloud_event = {
        'specversion': '1.0',
        'type': 'com.example.event',
        'source': 'my-service',
        'id': "myid",
        'data': 'hello world',
        'datacontenttype': 'text/plain',
    }

    # Set the data content type to 'application/cloudevents+json'
    resp = d.publish_event(
        pubsub_name='pubsub',
        topic_name='TOPIC_CE',
        data=json.dumps(cloud_event),
        data_content_type='application/cloudevents+json',
    )
```


#### Subscribe to messages

```python
from cloudevents.sdk.event import v1
from dapr.ext.grpc import App
import json

app = App()

# Default subscription for a topic
@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A')
def mytopic(event: v1.Event) -> None:
    data = json.loads(event.Data())
    print(f'Received: id={data["id"]}, message="{data ["message"]}"' 
          ' content_type="{event.content_type}"',flush=True)

# Specific handler using Pub/Sub routing
@app.subscribe(pubsub_name='pubsub', topic='TOPIC_A',
               rule=Rule("event.type == \"important\"", 1))
def mytopic_important(event: v1.Event) -> None:
    data = json.loads(event.Data())
    print(f'Received: id={data["id"]}, message="{data ["message"]}"' 
          ' content_type="{event.content_type}"',flush=True)
```

- For more information about pub/sub, visit [How-To: Publish & subscribe]({{% ref howto-publish-subscribe.md %}}).
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/master/examples/pubsub-simple) for code samples and instructions to try out pub/sub.

#### Streaming message subscription

You can create a streaming subscription to a PubSub topic using either the `subscribe`
or `subscribe_handler` methods.

The `subscribe` method returns an iterable `Subscription` object, which allows you to pull messages from the
stream by using a `for` loop (ex. `for message in subscription`) or by 
calling the `next_message` method. This will block on the main thread while waiting for messages.
When done, you should call the close method to terminate the
subscription and stop receiving messages.

The `subscribe_with_handler` method accepts a callback function that is executed for each message
received from the stream.
It runs in a separate thread, so it doesn't block the main thread. The callback should return a
`TopicEventResponse` (ex. `TopicEventResponse('success')`), indicating whether the message was
processed successfully, should be retried, or should be discarded. The method will automatically
manage message acknowledgements based on the returned status. The call to `subscribe_with_handler`
method returns a close function, which should be called to terminate the subscription when you're
done.

Here's an example of using the `subscribe` method: 

```python
import time

from dapr.clients import DaprClient
from dapr.clients.grpc.subscription import StreamInactiveError, StreamCancelledError

counter = 0


def process_message(message):
    global counter
    counter += 1
    # Process the message here
    print(f'Processing message: {message.data()} from {message.topic()}...')
    return 'success'


def main():
    with DaprClient() as client:
        global counter

        subscription = client.subscribe(
            pubsub_name='pubsub', topic='TOPIC_A', dead_letter_topic='TOPIC_A_DEAD'
        )

        try:
            for message in subscription:
                if message is None:
                    print('No message received. The stream might have been cancelled.')
                    continue

                try:
                    response_status = process_message(message)

                    if response_status == 'success':
                        subscription.respond_success(message)
                    elif response_status == 'retry':
                        subscription.respond_retry(message)
                    elif response_status == 'drop':
                        subscription.respond_drop(message)

                    if counter >= 5:
                        break
                except StreamInactiveError:
                    print('Stream is inactive. Retrying...')
                    time.sleep(1)
                    continue
                except StreamCancelledError:
                    print('Stream was cancelled')
                    break
                except Exception as e:
                    print(f'Error occurred during message processing: {e}')

        finally:
            print('Closing subscription...')
            subscription.close()


if __name__ == '__main__':
    main()
```

And here's an example of using the `subscribe_with_handler` method:

```python
import time

from dapr.clients import DaprClient
from dapr.clients.grpc._response import TopicEventResponse

counter = 0


def process_message(message):
    # Process the message here
    global counter
    counter += 1
    print(f'Processing message: {message.data()} from {message.topic()}...')
    return TopicEventResponse('success')


def main():
    with (DaprClient() as client):
        # This will start a new thread that will listen for messages
        # and process them in the `process_message` function
        close_fn = client.subscribe_with_handler(
            pubsub_name='pubsub', topic='TOPIC_A', handler_fn=process_message,
            dead_letter_topic='TOPIC_A_DEAD'
        )

        while counter < 5:
            time.sleep(1)

        print("Closing subscription...")
        close_fn()


if __name__ == '__main__':
    main()
```

- For more information about pub/sub, visit [How-To: Publish & subscribe]({{% ref howto-publish-subscribe.md %}}).
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/main/examples/pubsub-simple) for code samples and instructions to try out streaming pub/sub.

### Conversation (Alpha)
 
{{% alert title="Note" color="primary" %}}
The Dapr Conversation API is currently in alpha.
{{% /alert %}}

Since version 1.15 Dapr offers developers the capability to securely and reliably interact with Large Language Models (LLM) through the [Conversation API]({{% ref conversation-overview.md %}}).

```python
from dapr.clients import DaprClient
from dapr.clients.grpc.conversation import ConversationInput

with DaprClient() as d:
    inputs = [
        ConversationInput(content="What's Dapr?", role='user', scrub_pii=True),
        ConversationInput(content='Give a brief overview.', role='user', scrub_pii=True),
    ]

    metadata = {
        'model': 'foo',
        'key': 'authKey',
        'cacheTTL': '10m',
    }

    response = d.converse_alpha1(
        name='echo', inputs=inputs, temperature=0.7, context_id='chat-123', metadata=metadata
    )

    for output in response.outputs:
        print(f'Result: {output.result}')
```

### Interact with output bindings

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.invoke_binding(binding_name='kafkaBinding', operation='create', data='{"message":"Hello World"}')
```

- For a full guide on output bindings visit [How-To: Use bindings]({{% ref howto-bindings.md %}}).
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/main/examples/invoke-binding) for code samples and instructions to try out output bindings.

### Retrieve secrets

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    resp = d.get_secret(store_name='localsecretstore', key='secretKey')
```

- For a full guide on secrets visit [How-To: Retrieve secrets]({{% ref howto-secrets.md %}}).
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/master/examples/secret_store) for code samples and instructions to try out retrieving secrets

### Configuration

#### Get configuration

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    # Get Configuration
    configuration = d.get_configuration(store_name='configurationstore', keys=['orderId'], config_metadata={})
```

#### Subscribe to configuration

```python
import asyncio
from time import sleep
from dapr.clients import DaprClient

async def executeConfiguration():
    with DaprClient() as d:
        storeName = 'configurationstore'

        key = 'orderId'

        # Wait for sidecar to be up within 20 seconds.
        d.wait(20)

        # Subscribe to configuration by key.
        configuration = await d.subscribe_configuration(store_name=storeName, keys=[key], config_metadata={})
        while True:
            if configuration != None:
                items = configuration.get_items()
                for key, item in items:
                    print(f"Subscribe key={key} value={item.value} version={item.version}", flush=True)
            else:
                print("Nothing yet")
        sleep(5)

asyncio.run(executeConfiguration())
```

- Learn more about managing configurations via the [How-To: Manage configuration]({{% ref howto-manage-configuration.md %}}) guide.
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/master/examples/configuration) for code samples and instructions to try out configuration.

### Distributed Lock

```python
from dapr.clients import DaprClient

def main():
    # Lock parameters
    store_name = 'lockstore'  # as defined in components/lockstore.yaml
    resource_id = 'example-lock-resource'
    client_id = 'example-client-id'
    expiry_in_seconds = 60

    with DaprClient() as dapr:
        print('Will try to acquire a lock from lock store named [%s]' % store_name)
        print('The lock is for a resource named [%s]' % resource_id)
        print('The client identifier is [%s]' % client_id)
        print('The lock will will expire in %s seconds.' % expiry_in_seconds)

        with dapr.try_lock(store_name, resource_id, client_id, expiry_in_seconds) as lock_result:
            assert lock_result.success, 'Failed to acquire the lock. Aborting.'
            print('Lock acquired successfully!!!')

        # At this point the lock was released - by magic of the `with` clause ;)
        unlock_result = dapr.unlock(store_name, resource_id, client_id)
        print('We already released the lock so unlocking will not work.')
        print('We tried to unlock it anyway and got back [%s]' % unlock_result.status)
```

- Learn more about using a distributed lock: [How-To: Use a lock]({{% ref howto-use-distributed-lock.md %}}).
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/blob/master/examples/distributed_lock) for code samples and instructions to try out distributed lock.

### Cryptography

```python
from dapr.clients import DaprClient

message = 'The secret is "passw0rd"'

def main():
    with DaprClient() as d:
        resp = d.encrypt(
            data=message.encode(),
            options=EncryptOptions(
                component_name='crypto-localstorage',
                key_name='rsa-private-key.pem',
                key_wrap_algorithm='RSA',
            ),
        )
        encrypt_bytes = resp.read()

        resp = d.decrypt(
            data=encrypt_bytes,
            options=DecryptOptions(
                component_name='crypto-localstorage',
                key_name='rsa-private-key.pem',
            ),
        )
        decrypt_bytes = resp.read()

        print(decrypt_bytes.decode())  # The secret is "passw0rd"
```

- For a full list of state operations visit [How-To: Use the cryptography APIs]({{% ref howto-cryptography.md %}}).
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/master/examples/crypto) for code samples and instructions to try out cryptography

## Related links
[Python SDK examples](https://github.com/dapr/python-sdk/tree/master/examples)
