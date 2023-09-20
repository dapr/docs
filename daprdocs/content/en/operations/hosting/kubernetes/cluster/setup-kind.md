---
type: docs
title: "Set up a KiND cluster"
linkTitle: "KiND"
weight: 1100
description: >
  How to set up a KiND cluster
---

## Prerequisites

- Install:
   - [Docker](https://docs.docker.com/install/)
   - [kubectl](https://kubernetes.io/docs/tasks/tools/)
- For Windows:
   - Enable Virtualization in BIOS
   - [Install Hyper-V](https://docs.microsoft.com/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v)

## Install and configure KiND

[Refer to the KiND documentation to install.](https://kind.sigs.k8s.io/docs/user/quick-start)

If you are using Docker Desktop, verify that you have [the recommended settings](https://kind.sigs.k8s.io/docs/user/quick-start#settings-for-docker-desktop).

## Configure and create the KiND cluster

1. Create a file named `kind-cluster-config.yaml`, and paste the following:

   ```yaml
   kind: Cluster
   apiVersion: kind.x-k8s.io/v1alpha4
   nodes:
   - role: control-plane
     kubeadmConfigPatches:
     - |
       kind: InitConfiguration
       nodeRegistration:
         kubeletExtraArgs:
           node-labels: "ingress-ready=true"
     extraPortMappings:
     - containerPort: 80
       hostPort: 8081
       protocol: TCP
     - containerPort: 443
       hostPort: 8443
       protocol: TCP
   - role: worker
   - role: worker
   ```

   This cluster configuration:
   - Requests KiND to spin up a Kubernetes cluster comprised of a control plane and two worker nodes. 
   - Allows for future setup of ingresses.
   - Exposes container ports to the host machine.

1. Run the `kind create cluster` command, providing the cluster configuration file:

   ```bash
   kind create cluster --config kind-cluster-config.yaml
   ```

   **Expected output**

   ```md
   Creating cluster "kind" ...
    ✓ Ensuring node image (kindest/node:v1.21.1) 🖼
    ✓ Preparing nodes 📦 📦 📦
    ✓ Writing configuration 📜
    ✓ Starting control-plane 🕹️
    ✓ Installing CNI 🔌
    ✓ Installing StorageClass 💾
    ✓ Joining worker nodes 🚜
   Set kubectl context to "kind-kind"
   You can now use your cluster with:
   
   kubectl cluster-info --context kind-kind
   
   Thanks for using kind! 😊
   ```

## Initialize and run Dapr

1. Initialize Dapr in Kubernetes.

   ```bash
   dapr init --kubernetes
   ```

   Once Dapr finishes initializing, you can use its core components on the cluster. 

1. Verify the status of the Dapr components:

   ```bash
   dapr status -k
   ```

   **Expected output**

   ```md
     NAME                   NAMESPACE    HEALTHY  STATUS   REPLICAS  VERSION  AGE  CREATED
     dapr-sentry            dapr-system  True     Running  1         1.5.1    53s  2021-12-10 09:27.17
     dapr-operator          dapr-system  True     Running  1         1.5.1    53s  2021-12-10 09:27.17
     dapr-sidecar-injector  dapr-system  True     Running  1         1.5.1    53s  2021-12-10 09:27.17
     dapr-dashboard         dapr-system  True     Running  1         0.9.0    53s  2021-12-10 09:27.17
     dapr-placement-server  dapr-system  True     Running  1         1.5.1    52s  2021-12-10 09:27.18
   ```

1. Forward a port to [Dapr dashboard](https://docs.dapr.io/reference/cli/dapr-dashboard/):

   ```bash
   dapr dashboard -k -p 9999
   ```

1. Navigate to `http://localhost:9999` to validate a successful setup.

## Related links
- [Try out a Dapr quickstart]({{< ref quickstarts.md >}})
- Learn how to [deploy Dapr on your cluster]({{< ref kubernetes-deploy.md >}})
- [Upgrade Dapr on Kubernetes]({{< ref kubernetes-upgrade.md >}})
- [Kubernetes production guidelines]({{< ref kubernetes-production.md >}})