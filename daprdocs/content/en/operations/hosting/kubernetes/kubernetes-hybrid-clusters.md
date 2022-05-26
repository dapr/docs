---
type: docs
title: "Deploy to hybrid Linux/Windows Kubernetes clusters"
linkTitle: "Hybrid clusters"
weight: 60000
description: "How to run Dapr apps on Kubernetes clusters with Windows nodes"
---

Dapr supports running on Kubernetes clusters with Windows nodes. You can run your Dapr microservices exclusively on Windows, exclusively on Linux, or a combination of both. This is helpful to users who may be doing a piecemeal migration of a legacy application into a Dapr Kubernetes cluster.

Kubernetes uses a concept called node affinity so that you can denote whether you want your application to be launched on a Linux node or a Windows node. When deploying to a cluster which has both Windows and Linux nodes, you must provide affinity rules for your applications, otherwise the Kubernetes scheduler might launch your application on the wrong type of node.

## Pre-requisites

You will need a Kubernetes cluster with Windows nodes. Many Kubernetes providers support the automatic provisioning of Windows enabled Kubernetes clusters.

1. Follow your preferred provider's instructions for setting up a cluster with Windows enabled

- [Setting up Windows on Azure AKS](https://docs.microsoft.com/azure/aks/windows-container-cli)
- [Setting up Windows on AWS EKS](https://docs.aws.amazon.com/eks/latest/userguide/windows-support.html)
- [Setting up Windows on Google Cloud GKE](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-cluster-windows)

2. Once you have set up the cluster, you should see that it has both Windows and Linux nodes available

   ```bash
   kubectl get nodes -o wide
   NAME                                STATUS   ROLES   AGE     VERSION   INTERNAL-IP    EXTERNAL-IP      OS-IMAGE                         KERNEL-VERSION      CONTAINER-RUNTIME
   aks-nodepool1-11819434-vmss000000   Ready    agent   6d      v1.17.9   10.240.0.4     <none>        Ubuntu 16.04.6    LTS               4.15.0-1092-azure   docker://3.0.10+azure
   aks-nodepool1-11819434-vmss000001   Ready    agent   6d      v1.17.9   10.240.0.35    <none>        Ubuntu 16.04.6    LTS               4.15.0-1092-azure   docker://3.0.10+azure
   aks-nodepool1-11819434-vmss000002   Ready    agent   5d10h   v1.17.9   10.240.0.129   <none>        Ubuntu 16.04.6    LTS               4.15.0-1092-azure   docker://3.0.10+azure
   akswin000000                        Ready    agent   6d      v1.17.9   10.240.0.66    <none>        Windows Server 2019    Datacenter   10.0.17763.1339     docker://19.3.5
   akswin000001                        Ready    agent   6d      v1.17.9   10.240.0.97    <none>        Windows Server 2019    Datacenter   10.0.17763.1339     docker://19.3.5
   ```
## Installing the Dapr control plane

If you are installing using the Dapr CLI or via a helm chart, simply follow the normal deployment procedures:
[Installing Dapr on a Kubernetes cluster]({{< ref "install-dapr-selfhost.md#installing-Dapr-on-a-kubernetes-cluster" >}})

Affinity will be automatically set for `kubernetes.io/os=linux`. This will be sufficient for most users, as Kubernetes requires at least one Linux node pool.

> **Note:** Dapr control plane containers are built and tested for both Windows and Linux, however, we generally recommend using the Linux control plane containers. They tend to be smaller and have a much larger user base.

If you understand the above, but want to deploy the Dapr control plane to Windows, you can do so by setting:

```
helm install dapr dapr/dapr --set global.daprControlPlaneOs=windows
```

## Installing Dapr applications

### Windows applications
In order to launch a Dapr application on Windows, you'll first need to create a Docker container with your application installed. For a step by step guide see [Get started: Prep Windows for containers](https://docs.microsoft.com/virtualization/windowscontainers/quick-start/set-up-environment). Once you have a docker container with your application, create a deployment YAML file with node affinity set to kubernetes.io/os: windows.

1. Create a deployment YAML

   Here is a sample deployment with nodeAffinity set to "windows". Modify as needed for your application.
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: yourwinapp
     labels:
       app: applabel
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: applablel
     template:
       metadata:
         labels:
           app: applabel
         annotations:
           dapr.io/enabled: "true"
           dapr.io/id: "addapp"
           dapr.io/port: "6000"
           dapr.io/config: "appconfig"
       spec:
         containers:
         - name: add
           image: yourreponsitory/your-windows-dapr-container:your-tag
           ports:
           - containerPort: 6000
           imagePullPolicy: Always
         affinity:
           nodeAffinity:
             requiredDuringSchedulingIgnoredDuringExecution:
               nodeSelectorTerms:
                 - matchExpressions:
                   - key: kubernetes.io/os
                     operator: In
                     values:
                     - windows
   ```
   This deployment yaml will be the same as any other dapr application, with an additional spec.template.spec.affinity section as shown above.

2. Deploy to your Kubernetes cluster

   ```bash
   kubectl apply -f deploy_windows.yaml
   ```

### Linux applications

If you already have a Dapr application that runs on Linux, you'll still need to add affinity rules as above, but choose Linux affinity instead.

1. Create a deployment YAML

   Here is a sample deployment with nodeAffinity set to "linux". Modify as needed for your application.
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: yourlinuxapp
     labels:
       app: yourlabel
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: yourlabel
     template:
       metadata:
         labels:
           app: yourlabel
         annotations:
           dapr.io/enabled: "true"
           dapr.io/id: "addapp"
           dapr.io/port: "6000"
           dapr.io/config: "appconfig"
       spec:
         containers:
         - name: add
           image: yourreponsitory/your-application:your-tag
           ports:
           - containerPort: 6000
           imagePullPolicy: Always
         affinity:
           nodeAffinity:
             requiredDuringSchedulingIgnoredDuringExecution:
               nodeSelectorTerms:
                 - matchExpressions:
                   - key: kubernetes.io/os
                     operator: In
                     values:
                     - linux
   ```

2. Deploy to your Kubernetes cluster

   ```bash
   kubectl apply -f deploy_linux.yaml
   ```

## Cleanup

```bash
kubectl delete -f deploy_linux.yaml
kubectl delete -f deploy_windows.yaml
helm uninstall dapr
```

## Related links

- See the [official Kubernetes documentation](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) for examples of more advanced configuration via node affinity
- [Get started: Prep Windows for containers](https://docs.microsoft.com/virtualization/windowscontainers/quick-start/set-up-environment)
- [Setting up a Windows enabled Kubernetes cluster on Azure AKS](https://docs.microsoft.com/azure/aks/windows-container-cli)
- [Setting up a Windows enabled Kubernetes cluster on AWS EKS](https://docs.aws.amazon.com/eks/latest/userguide/windows-support.html)
- [Setting up Windows on Google Cloud GKE](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-cluster-windows)

