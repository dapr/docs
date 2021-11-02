---
type: docs
title: "Run Dapr in Azure Container Apps"
linkTitle: "Azure Container Apps"
weight: 3000
description: "Learn how to run your Dapr apps on the Azure Container Apps serverless runtime"
---

[Azure Container Apps](https://docs.microsoft.com/en-us/azure/container-apps/overview) is a serverless application centric hosting service where users do not see or manage any underlying VMs, orchestrators, or other cloud infrastructure. Azure Container Apps enables executing application code packaged in any container and is unopinionated about runtime or programming model.

Dapr is built-in as a first-class experience in Container Apps, letting you use Dapr building blocks without any manual deployment or management of Kubernetes or the Dapr runtime. Simply deploy your services and Dapr components and let the platform take care of the rest.

{{< button text="Learn more" link="https://docs.microsoft.com/en-us/azure/container-apps/overview" >}}

## Tutorial

Visit the [Azure docs](https://docs.microsoft.com/en-us/azure/container-apps/microservices-dapr) to try out a microservices tutorial, where you'll model two services and add Dapr:

<img src="azure-container-apps-microservices-dapr.png" alt="Diagram of a Container Apps environment with two Dapr services" style="width:600px" >

{{< button text="Try out Dapr on Container Apps" link="https://docs.microsoft.com/en-us/azure/container-apps/microservices-dapr" >}}
