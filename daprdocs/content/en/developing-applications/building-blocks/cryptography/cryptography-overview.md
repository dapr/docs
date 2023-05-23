---
type: docs
title: Cryptography overview
linkTitle: Overview
weight: 1000
description: "Overview of Dapr Cryptography"
---

With the cryptography building block, you can leverage cryptography in a safe and consistent way. Dapr exposes APIs that allows you to perform operations, such as encrypting and decrypting messages, within the Dapr sidecar, without exposing cryptographic keys to your application.

## Why Cryptography?

Applications make extensive use of cryptography, which, when implemented correctly, can make solutions safer even when data is compromised. In certain cases, you may be required to use cryptography to comply with industry regulations (for example, in finance) or legal requirements (including privacy regulations such as GDPR).  

However, leveraging cryptography correctly can be difficult. You need to:

- Pick the right algorithms and options
- Learn the proper way to manage and protect keys
- Navigate operational complexities when you wants limit access to cryptographic key material

One important requirement for security is limiting access to your cryptographic keys, what is often referred to as "raw key material". Dapr can integrate with key vaults such as Azure Key Vault (with more components coming in the future) which store keys in secure enclaves and perform cryptographic operations in the vaults, without exposing keys to your application or Dapr.

Alternatively, you can configure Dapr to manage the cryptographic keys for you, performing operations within the sidecar, again without exposing raw key material to your application.

## Cryptography in Dapr

With Dapr, you can perform cryptographic operations without exposing cryptographic keys to your application.

Todo: diagram

By using the cryptography building block, you can:

- More easily perform cryptographic operations in a safe way. Dapr provides safeguards against using unsafe algorithms, or using algorithms with unsafe options.
- Keep keys outside of applications. Applications never see the "raw key material", but can request the vault to perform operations with the keys. When using the built-in cryptographic engine of Dapr, operations are performed safely within the Dapr sidecar.
- Experience greater separation of concerns. By using external vaults or cryptographic components, only authorized teams can access private/shared key materials.
- Manage and rotate keys more easily. Keys are managed in the vault and outside of the application, and they can be rotated without needing the developers to be involved (or even without restarting the apps).
- Enables better audit logging to monitor when operations are performed with keys in a vault.

{{% alert title="Note" color="primary" %}}
While both HTTP and gRPC are supported in the alpha release, using the SDKs with gRPC is the recommended approach for high-level cryptography.
{{% /alert %}}

## Features

### Abstraction layer

Similar to how Dapr offers an abstraction on top of secret stores, Dapr offers an abstraction layer on top of key management services or vaults (for the rest of this document referred to as "vaults").

Dapr includes a set of components ("built-in cryptography" components) that:
- Perform cryptographic operations within the Dapr sidecar
- Can be used when key vaults are not available  
  
With these components, cryptographic operations are performed within Dapr's own cryptographic engine, again without exposing keys to your application.

Both kinds of components, either those leveraging key vaults or using the built-in cryptopgrahic engine in Dapr, offer the same abstraction layer. This allows your solution to switch between various vaults and/or built-in cryptography components as needed. For example, you can use a locally-stored key during development, and a cloud vault in production.

### High-level cryptography APIs

High-level APIs allow encrypting and decrypting data using the [Dapr Crypto Scheme v1](https://dapr.io/enc/v1). This is an opinionated encryption scheme designed to use modern, safe cryptographic standards, and processes data (even large files) efficiently as a stream.

{{% alert title="Note" color="primary" %}}
In a future release, Dapr will support subtle APIs. Subtle APIs are low-level APIs that allow performing a variety of cryptographic operations within the vaults. They provide less "guardrails" than high-level cryptography APIs.

{{% /alert %}}

## Next steps

{{< button text="Use the cryptography API >>" page="howto-cryptography.md" >}}

## Related links
- [Cryptography overview]({{< ref cryptography-overview.md >}})
- [Cryptography component specs]({{< ref supported-cryptography >}})