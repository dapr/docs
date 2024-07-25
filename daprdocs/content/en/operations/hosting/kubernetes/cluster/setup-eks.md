---
type: docs
title: "Set up an Elastic Kubernetes Service (EKS) cluster"
linkTitle: "Elastic Kubernetes Service (EKS)"
weight: 4000
description: >
  Learn how to set up an EKS Cluster
---

This guide walks you through installing an Elastic Kubernetes Service (EKS) cluster. If you need more information, refer to [Create an Amazon EKS cluster](https://docs.aws.amazon.com/eks/latest/userguide/create-cluster.html)

## Prerequisites

- Install:
   - [Docker](https://docs.docker.com/install/)
   - [kubectl](https://kubernetes.io/docs/tasks/tools/)
   - [AWS CLI](https://aws.amazon.com/cli/)
   - [eksctl](https://eksctl.io/)
   - [An existing VPC and subnets](https://docs.aws.amazon.com/eks/latest/userguide/network_reqs.html)

## Deploy an EKS cluster

1. In the terminal, log into AWS.

   ```bash
   aws configure
   ```

1. Create an EKS cluster. To use a specific version of Kubernetes, use `--version` (1.13.x or newer version required).

Change the values for vpc-private-subnets to meet your requirements. You can also add additional IDs. You must specify at least two subnet IDs. If you'd rather specify public subnets, you can change --vpc-private-subnets to --vpc-public-subnets.

   ```bash
   eksctl create cluster --name [your_eks_cluster_name] --region [your_aws_region] --version [kubernetes_version] --vpc-private-subnets [subnet_list_seprated_by_comma] --without-nodegroup
   ```

1. Verify kubectl context:

   ```bash
   kubectl config current-context
   ```

1. If required, configured kubectl:

   ```bash
   aws eks --region [your_aws_region] update-kubeconfig --name [your_eks_cluster_name]
   ```

## Related links

- [Learn more about EKS clusters](https://docs.aws.amazon.com/eks/latest/userguide/clusters.html)
- [Learn more about eksctl](https://eksctl.io/getting-started/)
- [Try out a Dapr quickstart]({{< ref quickstarts.md >}})
- Learn how to [deploy Dapr on your cluster]({{< ref kubernetes-deploy.md >}})
- [Upgrade Dapr on Kubernetes]({{< ref kubernetes-upgrade.md >}})
- [Kubernetes production guidelines]({{< ref kubernetes-production.md >}})
