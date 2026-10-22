---
type: docs
title: "Dapr Cryptography JavaScript SDK"
linkTitle: "Cryptography"
weight: 140000
description: Encrypt and decrypt data using the Dapr JavaScript SDK
---

The Dapr JavaScript SDK lets Node.js applications encrypt and decrypt messages and files through a configured cryptography component. Use `DaprClient.crypto` with either HTTP or gRPC, passing data directly or working with Node.js streams.

These guides target **`@dapr/dapr` version 3.19.0-rc.4 or later**. The underlying Cryptography API is alpha. Prefer gRPC for large payloads and production streaming: Dapr buffers HTTP cryptography output until the request is fully consumed.

To get started, follow the [Cryptography how-to guide]({{% ref js-cryptography-howto.md %}}). See the [client usage guidance]({{% ref js-cryptography-client-usage.md %}}) for configuration, supported inputs, encryption options, stream handling, and limitations.

The client implements encryption and decryption using the [Dapr Crypto Scheme v1](https://github.com/dapr/kit/blob/main/schemes/enc/v1/README.md). It does not expose general-purpose signing, signature verification, hashing, or key-management methods. Provision keys through your component's backing store; the application passes key references, not key material, to `client.crypto`.
