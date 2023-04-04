---
type: docs
title: Cryptography overview
linkTitle: Overview
weight: 1000
description: "Overview of Dapr Cryptography"
---

With the Cryptography API, you can leverage cryptography in a safe and consistent way. Dapr exposes an API that allows you to ask Dapr to perform operations such as encrypting and decrypting messages, and calculating and verifying digital signatures.

## Why Cryptography?

Modern applications make extensive use of cryptography, which, when implemented correctly, can make solutions safer even when data is compromised. In certain cases, you may be required to use cryptography to comply with industry regulations (banking) or legal requirements (GDPR). 

However, leveraging cryptography is difficult; you need to:
- Pick the right algorithms and options
- Learn the proper way to manage and protect keys
- Navigate operational complexities when your team wants limit access to cryptographic key material

Organizations have increasingly used tools and services to perform crypto outside of applications, including:
- Azure Key Vault, AWS KMS, Google Cloud KMS, etc. 
- On-prem HSM products like Thales Luna 

While those products/services perform the same or very similar operations, their APIs are very different.

## Cryptography in Dapr

Just like how Dapr offers an abstraction on top of secret stores, Dapr offers an abstraction layer on top of key vaults.

With this abstraction layer, you can perform cryptographic operations without having to access raw key material. Dapr provides a selection of correctly configured algorithms that forbid the usage of unsafe algorithms and operations. 

Todo: diagram

Using the cryptography in Dapr:

- Makes it easier for you to perform cryptographic operations in a safe way. Dapr provides safeguards against using unsafe algorithms, or using algorithms with unsafe options.
- Keeps keys outside of applications. Applications never see key material, but can request the vault to perform operations with the keys.
- Allows greater separation of concerns. By using external vaults, only authorized teams can access private/shared key materials.
- Simplifies key management and key rotation. Keys are managed in the vault and outside of the application, and they can be rotated without needing the developers to be involved (or even without restarting the apps).
- Enables better audit logging to monitor when operations are performed with keys in the vault.

[Learn more about the cryptography API]({{< ref cryptography_API.md >}})

## Features

Todo: cryptography building block features organized under header 3 sections.

## Next steps

{{< button text="Use the cryptography API >>" page="howto-cryptography.md" >}}

## Related links
- [Cryptography overview]({{< ref cryptography-overview.md >}})
- [Cryptography API reference]({{< ref cryptography_api.md >}})