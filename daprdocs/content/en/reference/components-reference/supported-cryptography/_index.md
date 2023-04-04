---
type: docs
title: "Cryptography component specs"
linkTitle: "Cryptography"
weight: 7000
description: The supported cryptography components that interface with Dapr
no_list: true
---

<!--Different components would be developed to perform those operations on supported backends such as the products/services listed above. Dapr would "translate" these calls into whatever format the backends require. Dapr never sees the private/shared keys, which remain safely stored inside the vaults.

Additionally, we could offer a "local" crypto component where keys are stored as Kubernetes secrets and cryptographic operations are performed within the Dapr sidecar. Although this is not as secure as using an external key vault, it still offers some benefits such as using standardized APIs and separation of concerns/roles with regards to key management.-->