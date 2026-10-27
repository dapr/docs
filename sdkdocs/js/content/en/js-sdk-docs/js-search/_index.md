---
type: docs
title: "Dapr Search JavaScript SDK"
linkTitle: "Search"
weight: 180200
description: Index, retrieve, and query documents using the Dapr JavaScript SDK
---

The Dapr JavaScript SDK lets Node.js applications manage indexes and index, retrieve, delete, and query JSON documents in a configured Dapr search component. Use `DaprClient.search` with either HTTP or gRPC for full-text search, filters, sorting, highlighting, and pagination.

Search requires Dapr runtime 1.19 or later and JavaScript SDK 3.19.0 or later. The underlying [Search API]({{% ref search_api.md %}}) is alpha. Available query features depend on the [search component]({{% ref supported-search %}}).

To get started, follow the [Search how-to guide]({{% ref js-search-howto.md %}}). See the [client usage guidance]({{% ref js-search-client-usage.md %}}) for method signatures, types, write acknowledgements, cancellation, and errors.
