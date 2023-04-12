---
type: docs
title: "How-to: Interact with virtual actors using scripting"
linkTitle: "How-To: Interact with virtual actors"
weight: 60
description: Invoke the actor method for state management
---

Learn how to use virtual actors by calling HTTP/gRPC endpoints.

## Invoke the actor method

You can interact with Dapr to invoke the actor method by calling HTTP/gRPC endpoint.

```html
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/method/<method>
```

Provide data for the actor method in the request body. The response for the request, which is data from actor method call, is in the response body.

Refer [to the Actors API spec]({{< ref "actors_api.md#invoke-actor-method" >}}) for more details.

{{% alert title="Note" color="primary" %}}
Alternatively, you can use [Dapr SDKs to use actors]({{< ref "developing-applications/sdks/#sdk-languages" >}}).
{{% /alert %}}

## Save state with actors

You can interact with Dapr via HTTP/gRPC endpoints to save state reliably using the Dapr actor state mangement capabaility.

To use actors, your state store must support multi-item transactions. This means your state store component must implement the `TransactionalStore` interface. 

[See the list of components that support transactions/actors]({{< ref supported-state-stores.md >}}). Only a single state store component can be used as the state store for all actors.

## Next steps

{{< button text="Actor reentrancy >>" page="actor-reentrancy.md" >}}

## Related links

- Refer to the [Dapr SDK documentation and examples]({{< ref "developing-applications/sdks/#sdk-languages" >}}).
- [Actors API reference]({{< ref actors_api.md >}})
- [Actors overview]({{< ref actors-overview.md >}})