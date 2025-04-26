---
type: docs
title: "How to: Integrate with Argo CD"
linkTitle: "Argo CD"
weight: 9000
description: "Integrate Dapr into your GitOps pipeline"
---

[Argo CD](https://argo-cd.readthedocs.io/en/stable/) is a declarative, GitOps continuous delivery tool for Kubernetes. It enables you to manage your Kubernetes deployments by tracking the desired application state in Git repositories and automatically syncing it to your clusters.  

## Integration with Dapr

You can use Argo CD to manage the deployment of Dapr control plane components and Dapr-enabled applications. By adopting a GitOps approach, you ensure that Dapr's configurations and applications are consistently deployed, versioned, and auditable across your environments. Argo CD can be easily configured to deploy Helm charts, manifests, and Dapr components stored in Git repositories.

## Sample code

A sample project demonstrating Dapr deployment with Argo CD is available at [https://github.com/dapr/samples/tree/master/dapr-argocd](https://github.com/dapr/samples/tree/master/dapr-argocd).
