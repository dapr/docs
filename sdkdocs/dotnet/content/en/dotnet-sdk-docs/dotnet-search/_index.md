---
type: docs
title: "Dapr Search .NET SDK"
linkTitle: "Search"
weight: 180200
description: Index and query JSON documents using the Dapr Search .NET SDK
---

The `Dapr.Search` package provides a dedicated .NET client for Dapr's Search building block. It supports index management, typed document upserts and retrieval, full-text and provider-native queries, filters, sorting, projection, highlighting, and continuation-token pagination. A bundled source generator can create a typed client bound to a component, index, and document type.

These guides target Dapr .NET SDK 1.19.0 or later and Dapr runtime 1.19 or later.

{{% alert title="Alpha API" color="primary" %}}
The Search API is in [alpha]({{% ref "certification-lifecycle#certification-levels" %}}).
{{% /alert %}}

Start with [How to: Index and search documents]({{% ref dotnet-search-howto.md %}}). For query options, serialization, generated clients, and error handling, see the [Search client guidance]({{% ref dotnet-search-client-usage.md %}}).

Search accepts index-ready JSON objects; it does not extract text, chunk documents, or generate embeddings. For similarity search over embeddings, use the [Vector .NET SDK]({{% ref dotnet-vector %}}).

## Related links

- [Search API overview]({{% ref search-overview %}})
- [Search component specifications]({{% ref supported-search %}})
- [.NET SDK Search examples](https://github.com/dapr/dotnet-sdk/tree/master/examples/Search)
