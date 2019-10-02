# Integration with Actor Frameworks
This article introduces how dapr integrate with existing Actor Frameworks such as [Orleans](https://github.com/dotnet/orleans), [Akka](https://akka.io/), and [Service Fabric Reliable Actors](https://docs.microsoft.com/en-us/azure/service-fabric/service-fabric-reliable-actors-introduction). With dapr integration, these Actor frameworks will allow developers to write Actor code in any programming languages, and to plug their Actors into dapr eventing pipeline that enables reliable messaging, pub-sub, binding to event sources and many other features.

## Client-side integration
On the client side, dapr acts as a shim in front of an Actor proxy. This allows dapr to bring reliable messaging, binding and other features to the connected Actor framework.
![Actors client](../imgs/actors_client.png)

## Server-side integration
On the server side, dapr leverages Actor framework capabilities such as state management and single activation guarantee to offer complete Actor framework capabilities.
dapr defines an **Actor API**, which the integrated Actor frameworks are supposed to implement/support. 

> dapr comes with a built-in Actor framework implemenation through the same Actor API.

The following diagram illustrates two possible execution paths. ![Actors server](../imgs/actors_server.png)

### Client calling an Actor (green path)

1. A client makes a call to an Actor instance.
2. dapr calls an Actor proxy to forward the request.
3. As the Actor runtime activates/invokes an Actor, it calls dapr through the Actor API to invoke the user method.
4. dapr forwards the request to user code through dapr API.
5. As the response is returned, it was sent back to client as a response to the original request. 

### A message triggering an Actor (yellow path)

1. A message is routed to the dapr instance that is hosting the destination Actor.
2. dapr dispatches the message to the Actor runtime when possible.
3. The rest of the steps are the same as the green path.

## Actor API
At a high level, the Actor API shall contain the following methods:

* Dispatch to Actor when possible
* Call method on an Actor now
* Load/save state
* Create/remove
* Locate & send message to an Actor 

## Custom Programming Experience
Custom programming experiences can be built on top of dapr through a custom library. The Custom library adapts dapr API to a custom API shape that the user code consumes, as shown in the following diagram:
![custom_experience](../imgs/programming_experience.png)