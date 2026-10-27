---
type: docs
title: "Dapr Vector JavaScript SDK"
linkTitle: "Vector"
weight: 180200
description: Store embeddings and query similar vectors using the Dapr JavaScript SDK
---

The Dapr JavaScript SDK lets Node.js applications manage collections, store precomputed dense vectors, and run similarity searches through a configured Dapr vector store component. Use `DaprClient.vector` with either HTTP or gRPC.

Vector requires JavaScript SDK 3.19.0 or later and a Vector-capable Dapr runtime from the 1.19 release line or later.

The SDK accepts embeddings you generate elsewhere; it does not generate embeddings from text, images, or payloads. Records can also carry opaque payload bytes and structured, filterable metadata.

To get started, follow the [Vector how-to guide]({{% ref js-vector-howto.md %}}). See the [client usage guidance]({{% ref js-vector-client-usage.md %}}) for method signatures, indexing behavior, query semantics, cancellation, and errors.
