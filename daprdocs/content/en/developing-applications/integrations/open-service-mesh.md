---
type: docs
title: "Running Dapr and Open Service Mesh together"
linkTitle: "Open Service Mesh"
weight: 4000
description: "Learn how to run both Open Service Mesh and Dapr on the same Kubernetes cluster"
---

## Overview

[Open Service Mesh (OSM)](https://openservicemesh.io/) is a lightweight, extensible, cloud native service mesh that allows users to uniformly manage, secure, and get out-of-the-box observability features for highly dynamic microservice environments.

{{< button text="Learn more" link="https://openservicemesh.io/" >}}

## Dapr integration

Users are able to leverage both OSM SMI traffic policies and Dapr capabilities on the same Kubernetes cluster. Visit [this guide](https://docs.openservicemesh.io/docs/integrations/demo_dapr/) to get started.

{{< button text="Deploy OSM and Dapr" link="https://docs.openservicemesh.io/docs/integrations/demo_dapr/" >}}

## Example

Watch the OSM team present the OSM and Dapr integration in the 05/18/2021 community call:

<iframe width="560" height="315" src="https://www.youtube.com/embed/LSYyTL0nS8Y?start=1916" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Additional resources

- [Dapr and service meshes]({{< ref service-mesh.md >}})