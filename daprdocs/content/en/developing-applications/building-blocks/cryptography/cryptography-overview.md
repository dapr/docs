---
type: docs
title: Cryptography overview
linkTitle: Overview
weight: 1000
description: "Overview of Dapr Cryptography"
---

With the cryptography building block, you can leverage cryptography in a safe and consistent way. Dapr exposes APIs that allow you to perform operations, such as encrypting and decrypting messages, within key vaults or the Dapr sidecar, without exposing cryptographic keys to your application.

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

<img src="/images/cryptography-overview.png" width=1000 style="padding-bottom:15px;" alt="Diagram showing how Dapr cryptography works with your app">


By using the cryptography building block, you can:

- More easily perform cryptographic operations in a safe way. Dapr provides safeguards against using unsafe algorithms, or using algorithms with unsafe options.
- Keep keys outside of applications. Applications never see the "raw key material", but can request the vault to perform operations with the keys. When using the cryptographic engine of Dapr, operations are performed safely within the Dapr sidecar.
- Experience greater separation of concerns. By using external vaults or cryptographic components, only authorized teams can access private key materials.
- Manage and rotate keys more easily. Keys are managed in the vault and outside of the application, and they can be rotated without needing the developers to be involved (or even without restarting the apps).
- Enables better audit logging to monitor when operations are performed with keys in a vault.

{{% alert title="Note" color="primary" %}}
While both HTTP and gRPC are supported in the alpha release, using the gRPC APIs with the supported Dapr SDKs is the recommended approach for cryptography.
{{% /alert %}}

## Features

### Cryptographic components

The Dapr cryptography building block incldues two kinds of components:

- **Components that allow interacting with management services or vaults ("key vaults").**   
   Similar to how Dapr offers an "abstraction layer" on top of various secret stores or state stores, these components allow interacting with various key vaults such as Azure Key Vault (with more coming in future Dapr releases). With these components, cryptographic operations on the private keys are performed within the vaults and Dapr never sees your private keys.

- **Components based on Dapr's own cryptographic engine.**  
   When key vaults are not available, you can leverage components based on Dapr's own cryptographic engine. These components, which have `.dapr.` in the name, perform cryptographic operations within the Dapr sidecar, with keys stored on files, Kubernetes secrets, or other sources. Although the private keys are known by Dapr, they are still not available to your applications.

Both kinds of components, either those leveraging key vaults or using the cryptopgrahic engine in Dapr, offer the same abstraction layer. This allows your solution to switch between various vaults and/or cryptography components as needed. For example, you can use a locally-stored key during development, and a cloud vault in production.

### Cryptographic APIs

Cryptographic APIs allow encrypting and decrypting data using the [Dapr Crypto Scheme v1](https://github.com/dapr/kit/blob/main/schemes/enc/v1/README.md). This is an opinionated encryption scheme designed to use modern, safe cryptographic standards, and processes data (even large files) efficiently as a stream.

## Try out cryptography

### Quickstarts and tutorials

Want to put the Dapr cryptography API to the test? Walk through the following quickstart and tutorials to see cryptography in action:

| Quickstart/tutorial | Description |
| ------------------- | ----------- |
| [Cryptography quickstart]({{< ref cryptography-quickstart.md >}}) | Encrypt and decrypt messages and large files using RSA and AES keys with the cryptography API. |

### Start using cryptography directly in your app

Want to skip the quickstarts? Not a problem. You can try out the cryptography building block directly in your application to encrypt and decrypt your application. After [Dapr is installed]({{< ref "getting-started/_index.md" >}}), you can begin using the cryptography API starting with [the cryptography how-to guide]({{< ref howto-cryptography.md >}}).

## Demo

Watch this [demo video of the Cryptography API from the Dapr Community Call #83](https://youtu.be/PRWYX4lb2Sg?t=1148):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/PRWYX4lb2Sg?start=1148" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Next steps

{{< button text="Use the cryptography API >>" page="howto-cryptography.md" >}}

## Related links
- [Cryptography overview]({{< ref cryptography-overview.md >}})
- [Cryptography component specs]({{< ref supported-cryptography >}})