---
type: docs
title: "Bridge to Kubernetes support for Dapr services"
linkTitle: "Bridge to Kubernetes"
weight: 300
description: "Debug Dapr apps locally which still connected to your Kubernetes cluster"
---

Bridge to Kubernetes allows you to run and debug code on your development computer, while still connected to your Kubernetes cluster with the rest of your application or services. This type of debugging is often called *local tunnel debugging*.

{{< button text="Learn more about Bridge to Kubernetes" link="https://aka.ms/bridge-vscode-dapr" >}}

## Debug Dapr apps

Bridge to Kubernetes supports debugging Dapr apps on your machine, while still having them interact with the services and applications running on your Kubernetes cluster. This example showcases Bridge to Kubernetes enabling a developer to debug the [distributed calculator quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator):

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/rxwg-__otso" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

{{% alert title="Isolation mode" color="warning" %}}
[Isolation mode](https://aka.ms/bridge-isolation-vscode-dapr) is currently not supported with Dapr apps. Make sure to launch Bridge to Kubernetes mode without isolation.
{{% /alert %}}

## Further reading

- [Bridge to Kubernetes documentation](https://code.visualstudio.com/docs/containers/bridge-to-kubernetes)
- [VSCode integration]({{< ref vscode >}})