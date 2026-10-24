---
type: docs
title: "Dapr Vector .NET SDK"
linkTitle: "Vector"
weight: 180300
description: Store embeddings and run similarity queries using the Dapr Vector .NET SDK
---

The `Dapr.Vector` package provides a dedicated .NET client for Dapr's Vector building block. It supports collection management, vector upserts and retrieval, typed or opaque payloads, metadata filters, query-by-vector or query-by-ID, score thresholds, and ordered batch query results. A bundled source generator can create a typed client bound to a component, collection, and payload type.

These guides target Dapr .NET SDK 1.19.0 or later and Dapr runtime 1.19 or later.

{{% alert title="Alpha API" color="primary" %}}
The Vector API is in [alpha]({{% ref "certification-lifecycle#certification-levels" %}}).
{{% /alert %}}

Start with [How to: Store and query vectors]({{% ref dotnet-vector-howto.md %}}). For configuration, distance metrics, batch errors, serialization, and generated clients, see the [Vector client guidance]({{% ref dotnet-vector-client-usage.md %}}).

Your application must supply precomputed embeddings; this client does not generate them. For lexical/full-text search over JSON documents, use the [Search .NET SDK]({{% ref dotnet-search %}}).

## Related links

- [Vector API overview]({{% ref vector-overview %}})
- [Vector component specifications]({{% ref supported-vector %}})
- [.NET SDK Vector examples](https://github.com/dapr/dotnet-sdk/tree/master/examples/Vector)
