---
type: docs
title: "How-to: Enable and use pub/sub with actors"
linkTitle: "How-to: Pub/sub for actors"
weight: 40
description: "Overview on how to use pub/sub service with Dapr Virtual Actors"
aliases:
  - "/developing-applications/building-blocks/actors/actors-pubsub"
---

## Pub/sub for Actors 
Actors can be invoked and executed based on events using pub/sub. This can help the user invoke actors with event-driven applications maintaining scalability and isolation. It is possible to use actors as subscribers for a specific topic by configuring an actor pub/sub component and declaring the subscriptions in the Actor Runtime Configuration. Dapr sidecar handles the received events and invokes the method of the right actor. 

<img src="/images/actor-pubsub.png" width=1000 height=500 alt="Diagram showing the flow of an event from publishing to invoking the declared actor type and id">

>The application must have configured a pub/sub component to use pub/sub for actors. More information on how to set a [pub/sub component]({{< ref "../../../operations/components/component-schema.md">}})


### Publishing
You can publish an event for an actor by using the HTTP/gRPC endpoints:
```bash
POST http://localhost:3500/v1.0-alpha1/actors/<actorType>/<actorId>/publish/<PubsubName>/<Topic>
```
> Actors pub/sub is an alpha version and currently just available with the Python SDK
{{< tabs Python >}}
{{% codetab %}}
```python
import json
import time

from dapr.clients import DaprClient
with DaprClient() as d:
resp = d.publish_actor_event(
            pubsub_name='mypubsub',
            topic_name='mytopic',
            actor_id= '1000',
            actor_type='DemoActor',
            data=json.dumps(req_data),
            data_content_type='application/json',
        )
```
{{% /codetab %}}
{{< /tabs >}}

### Subscribing
For an actor to receive events from the [message broker]({{< ref "../../../reference/components-reference/supported-pubsub">}}), the subscription must be declared in the Actor Runtime Configuration.
Example: 
{{< tabs Python>}}
{{% codetab %}}
```python
from dapr.actor.runtime.config import PubsubConfig
# Actor Runtime Configuration with pub/sub subscriptions
config = ActorRuntimeConfig(pubsub=[PubsubConfig(
    pubsubName="mypubsub",
    topic="mytopic",
    actorType="DemoActor", # Actor must exist in the Actor Runtime
    method="mymethod1", # Actor must have this method
    actorIdDataAttribute= "id"
    ), PubsubConfig(
        pubsubName="myPubsub",
        topic="mytopic",
        actorType="AnotherActor",
        method="mymethod2"
    )])
```
{{% /codetab %}}
{{< /tabs >}}

| Parameter | Description | 
| ----------- | ----------- | 
| PubsubConfig | Structure of the subscription. The actor runtime configuration can have multiple PubsubConfigs to manage different subscriptions with more than one actor type or topics.| 
| PubsubName | Pub/sub name of the declared pub/sub component. | 
| Topic | The topic that the actor is subscribed to. | 
| Actor Type | The actor type that is invoked and executed when receiving an event. |
| Method | The method that is called for that specific actor type. The actor type must have this method. | 
| ActorIdDataAttribute _(Optional)_ | This string is searched in the event to act as an actor id. Used when the published event doesn’t include an actor id.| 
 
When an event is published, the method that is declared in the Actor Runtime Configuration executes. The consumer pattern model also applies to the actors' implementation. Therefore, if multiple sidecars with the same consumer id subscribe to the same topic and actor type, they compete for the message. 
> In-order processing of messages is not guaranteed. Other sidecars do not wait until a subscribed sidecar finishes to continue processing new incoming events.