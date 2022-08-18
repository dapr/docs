---
type: docs
title: "How-to: Enable and use Pubsub with Actors"
linkTitle: "How-to: Pubsub for Actors"
weight: 40
description: "Overview on how to use Pubsub service with Dapr virtual Actors"
aliases:
  - "/developing-applications/building-blocks/actors/actors-pubsub"
---

## Pubsub for Actors 
Actors can be invoked and executed based on events using Pubsub. It is possible to use Actors as subscribers for a specific topic by configuring an Actor Pubsub Component and declaring the subscriptions in the Actor Runtime Configuration. Dapr sidecar will handle the received events and invoke the method of the right Actor. 

<img src="/images/actor-pubsub.png" width=1000 height=500 alt="Diagram showing the flow of an event from a the publishing to the declared actor type and id">

>You must configure a Pubsub component to use Actors Pubsub. Reference to the Components Schema of Dapr. https://docs.dapr.io/operations/components/component-schema/ 


### Publishing
You can publish an event for an Actor by using the HTTP/gRPC endpoints:
```bash
POST http://localhost:3500/v1.0-alpha1/actors/<actorType>/<actorId>/publish/<PubsubName>/<Topic>
```
> Actors Pubsub is an alpha version and currently just available with the Python SDK
{{< tabs Python >}}
{{% codetab %}}
```python
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
For an Actor to receive events from the message broker, the subscription must be declared in the Actor Runtime Configuration.

Example: 
{{< tabs Python Go>}}
{{% codetab %}}
```python
# Actor Runtime Configuration with pubsub subscriptions
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
{{% codetab %}}
```go
// Example on how to declare the subscriptions with Go
var daprConfigResponse = daprConfig{
    Entities:                 []string{"DemoActor"}
    ActorIdleTimeout:         "1h",
    ActorScanInterval:        "30s",
    DrainOngoingCallTimeout:  "30s",
    DrainRebalancedActors:    True,
    Pubsub: []config.PubSubConfig{ // Subscription
        {
            PubSubName:  "myPubsub",
            Topic:       "myTopic",
            ActorType:   "DemoActor",
            Method:      "mymethod1",
            actorIdDataAttribute: "id",
        },
    },
    EntitiesConfig: []config.EntityConfig{
        {
            Entities: []string{"DemoActor"},
            Reentrancy: config.ReentrancyConfig{
                Enabled:       true,
                MaxStackDepth: 5,
            },
        },
    },
}
```
{{% /codetab %}}
{{< /tabs >}}

| Parameter | Description | 
| ----------- | ----------- | 
| PubsubConfig | Structure of the subscription. You can declare multiple PubsubConfigs to have different subscriptions with different Actor types or topics.| 
| PubsubName | Pubsub name of the component declared and used with the sidecar. | 
| Topic | The topic that the Actor will subscribe. | 
| Actor Type | The Actor type that will be invoked and executed when receiving an event. |
| Method | The method that will be called for that specific Actor type. Actor type must be have this method. | 
| ActorIdDataAttribute _(Optional)_ | This string will be searched in the event to act as an Actor ID. Used when the published event doesn’t include an Actor ID.| 
 
When an event is published, the method that was declare in the Actor Runtime Configuration will be executed. The consumer pattern model will also apply to the Actors implementation. Therefore, if multiple sidecars with the same consumer id subscribe to the same topic and Actor type, they will all compete for the message. 
> In-order processing of messages is not guaranteed. Other sidecars will not wait until a subscribe sidecar finishes to continue processing new incoming events.