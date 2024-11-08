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
   - [kubectl](https://kubernetes.io/docs/tasks/tools/)
   - [AWS CLI](https://aws.amazon.com/cli/)
   - [eksctl](https://eksctl.io/)
   - [An existing VPC and subnets](https://docs.aws.amazon.com/eks/latest/userguide/network_reqs.html)
   - [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)

## Deploy an EKS cluster

1. In the terminal, log into AWS.

   ```bash
   aws configure
   ```

1. Create a new file called `cluster-config.yaml` and add the content below to it, replacing `[your_cluster_name]`, `[your_cluster_region]`, and `[your_k8s_version]` with the appropriate values:

    ```yaml
    apiVersion: eksctl.io/v1alpha5
    kind: ClusterConfig
    
    metadata:
      name: [your_cluster_name]
      region: [your_cluster_region]
      version: [your_k8s_version]
      tags:
        karpenter.sh/discovery: [your_cluster_name]
    
    iam:
      withOIDC: true
    
    managedNodeGroups:
      - name: mng-od-4vcpu-8gb
        desiredCapacity: 2
        minSize: 1
        maxSize: 5
        instanceType: c5.xlarge
        privateNetworking: true
    
    addons:
      - name: vpc-cni 
        attachPolicyARNs:
          - arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy
      - name: coredns
        version: latest 
      - name: kube-proxy
        version: latest
      - name: aws-ebs-csi-driver
        wellKnownPolicies: 
          ebsCSIController: true
    ```

1. Create the cluster by running the following command:

   ```bash
   eksctl create cluster -f cluster.yaml
   ```
   
1. Verify the kubectl context:

   ```bash
   kubectl config current-context
   ```

## Add Dapr requirements for sidecar access and default storage class:

1. Update the security group rule to allow the EKS cluster to communicate with the Dapr Sidecar by creating an inbound rule for port 4000.

   ```bash
   aws ec2 authorize-security-group-ingress --region [your_aws_region] \
   --group-id [your_security_group] \
   --protocol tcp \
   --port 4000 \
   --source-group [your_security_group]
   ```

2. Add a default storage class if you don't have one: 

  ```bash
  kubectl patch storageclass gp2 -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
  ```

## Install Dapr

Install Dapr on your cluster by running:

```bash
dapr init -k
```

You should see the following response:

```bash
⌛  Making the jump to hyperspace...
ℹ️  Note: To install Dapr using Helm, see here: https://docs.dapr.io/getting-started/install-dapr-kubernetes/#install-with-helm-advanced

ℹ️  Container images will be pulled from Docker Hub
✅  Deploying the Dapr control plane with latest version to your cluster...
✅  Deploying the Dapr dashboard with latest version to your cluster...
✅  Success! Dapr has been installed to namespace dapr-system. To verify, run `dapr status -k' in your terminal. To get started, go here: https://docs.dapr.io/getting-started
```

## Troubleshooting

### Access permissions

If you face any access permissions, make sure you are using the same AWS profile that was used to create the cluster. If needed, update the kubectl configuration with the correct profile. More information [here](https://repost.aws/knowledge-center/eks-api-server-unauthorized-error):

```bash
aws eks --region [your_aws_region] update-kubeconfig --name [your_eks_cluster_name] --profile [your_profile_name]
```

## Related links

- [Learn more about EKS clusters](https://docs.aws.amazon.com/eks/latest/userguide/clusters.html)
- [Learn more about eksctl](https://eksctl.io/getting-started/)
- [Try out a Dapr quickstart]({{< ref quickstarts.md >}})
- Learn how to [deploy Dapr on your cluster]({{< ref kubernetes-deploy.md >}})
- [Kubernetes production guidelines]({{< ref kubernetes-production.md >}})
