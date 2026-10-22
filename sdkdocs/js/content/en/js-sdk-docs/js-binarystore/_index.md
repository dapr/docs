---
type: docs
title: "Dapr Binary Store JavaScript SDK"
linkTitle: "Binary Store"
weight: 180100
description: Store and retrieve binary files using the Dapr JavaScript SDK
---

The Dapr JavaScript SDK lets Node.js applications store, retrieve, stream, and delete binary files in a configured Dapr binary store component. Use `DaprClient.binaryStore` with either HTTP or gRPC to stream large files or work with bytes already held in memory.

Binary Store requires Dapr runtime 1.19 or later and JavaScript SDK 3.19.0 or later. The underlying [Binary Store API]({{% ref binary_store_api.md %}}) is alpha.

To get started, follow the [Binary Store how-to guide]({{% ref js-binarystore-howto.md %}}). See the [client usage guidance]({{% ref js-binarystore-client-usage.md %}}) for configuration, memory use, cancellation, and errors.
