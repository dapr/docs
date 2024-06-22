---
type: docs
title: "How to: Integrate with Kratix"
linkTitle: "Kratix Marketplace"
weight: 8000
description: "Integrate with Kratix using a Dapr promise"
---

As part of the [Kratix Marketplace](https://docs.kratix.io/marketplace), Dapr can be used to build custom platforms tailored to your needs. 

{{% alert title="Note" color="warning" %}}
The Dapr Helm chart generates static public and private key pairs that are published in the repository. This promise should only be used _locally_ for demo purposes. If you wish to use this promise for more than demo purposes, it's recommended to manually update all the secrets in the promise with keys with your own credentials.
{{% /alert %}}

Get started by simply installing the Dapr Promise, which installs Dapr on all matching clusters.

{{< button text="Install the Dapr Promise" link="https://github.com/syntasso/kratix-marketplace/tree/main/dapr" >}}
