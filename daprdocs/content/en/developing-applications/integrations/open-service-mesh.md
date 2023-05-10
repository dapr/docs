---
type: docs
title: "How to: Run Dapr and Open Service Mesh together"
linkTitle: "How to: Open Service Mesh"
weight: 4000
description: "Learn how to run both Open Service Mesh and Dapr on the same Kubernetes cluster"
---

With [Open Service Mesh (OSM)](https://openservicemesh.io/), you can uniformly manage, secure, and get out-of-the-box observability features for highly dynamic microservice environments.

## Dapr integration

You can leverage _both_ OSM SMI traffic policies and Dapr capabilities on the same Kubernetes cluster. Refer to the official OSM documentation to get started.

{{< button text="Get started with deploying Dapr and OSM" link="https://docs.openservicemesh.io/docs/integrations/demo_dapr/" >}}

## Demo

Watch the OSM team present the OSM and Dapr integration during [Dapr's Community Call 38](https://youtu.be/LSYyTL0nS8Y?t=1916):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/LSYyTL0nS8Y?start=1916" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Related links

Learn more about [Dapr and service meshes]({{< ref service-mesh.md >}}).