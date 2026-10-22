---
type: docs
title: "State management with the Dapr JavaScript SDK"
linkTitle: "State Management"
weight: 1800
description: Save, retrieve, delete, transact, and query application state with the Dapr JavaScript SDK
---

Use `DaprClient.state` to access configured Dapr state store components from JavaScript or TypeScript. The client supports single-key reads and deletes, bulk saves, bulk reads and deletes, optimistic concurrency with ETags, multi-key transactions, and state queries over HTTP or gRPC.

These guides target [`@dapr/dapr`](https://www.npmjs.com/package/@dapr/dapr) **3.19.0-rc.4 or later**. State management is part of this package; there is no separate state management package or client registration.

| Guide | What you will learn |
|-------|---------------------|
| [How to: Manage state]({{% ref js-state-management-howto.md %}}) | Configure a store, save and read values, use ETags, perform bulk operations, and execute transactions. |
| [State client usage]({{% ref js-state-management-client-usage.md %}}) | Configure the client, understand response shapes, metadata, serialization, error handling, and protocol differences. |
| [How to: Query state]({{% ref js-state-management-query.md %}}) | Filter, sort, and paginate state using the alpha query API. |

Not every state store supports ETags, transactions, TTL, or queries. Check the [supported state stores]({{% ref "reference/components-reference/supported-state-stores/_index.md" %}}) and your component's reference before depending on these features. Bulk save and bulk delete are not substitutes for an atomic transaction.

This section covers application state, not the [actor state manager]({{% ref js-actors %}}). The JavaScript SDK does not provide the .NET SDK's source-generated, store-scoped state interfaces; pass the component name to each `client.state` operation.

## Related links

- [State management overview]({{% ref state-management-overview.md %}})
- [State management API reference]({{% ref state_api.md %}})
- [JavaScript state client interface](https://github.com/dapr/js-sdk/blob/v3.19.0-rc.4/src/interfaces/Client/IClientState.ts)
- [HTTP implementation](https://github.com/dapr/js-sdk/blob/v3.19.0-rc.4/src/implementation/Client/HTTPClient/state.ts) and [gRPC implementation](https://github.com/dapr/js-sdk/blob/v3.19.0-rc.4/src/implementation/Client/GRPCClient/state.ts)
