# Getting Started

This descirbes how to setup the cluster and install Dapr to local environment and Kubernetes cluster.

Dapr can be run as a standalone and kubernetes modes. Running Dapr runtime as a standalone mode helps you develop Dapr app in your local development environment and run it in any environments by using Dapr CLI.

For Kubernetes mode, you can also deploy Dapr to Kubernetes clusters via Dapr CLI and Helm.

With Dapr installed, you can try out [dapr samples](https://github.com/dapr/samples)  and [howtos](../howto/) and explore dpar features.

## Contents

 - [Prerequsites](#prerequisites)
 - [Running Dapr as a standalone mode](#running-dapr-as-a-standalone-mode)
 - [Running Dapr on Kubernetes cluster](#running-dapr-on-kubernetes-cluster)

## Prerequisites

 - [Dapr CLI](https://github.com/dapr/cli/releases) - download the Dapr CLI, unpack it and move it to your desired location (for Mac/Linux - `/usr/local/bin`. for Windows, add the executable to your System PATH. (e.g. `c:\dapr`)

> For Windows users, run the cmd terminal in administrator mode
> For Linux users, if you run docker cmds with sudo, you need to use "**sudo dapr init**"

## Running Dapr as a standalone mode

### Install Dapr

```bash
$ dapr init
⌛  Making the jump to hyperspace...
Downloading binaries and setting up components
✅  Success! Dapr is up and running
```

To see that Dapr has been installed successful, from a command prompt run `docker ps` command and see that `actionscore.azurecr.io/dapr:latest` and `redis` container images are both running.

> **Note:** See [Dapr CLI](https://github.com/dapr/cli) for details on the usage of Dapr CLI

### Install specific version of dapr runtime

```bash
# Install v0.4.0-alpha.4 runtime
$ dapr init --runtime-version v0.4.0-alpha.4

# Check the versions of cli and runtime
$ dapr --version
cli version: v0.2.0-alpha.2
runtime version: v0.4.0-alpha.4
```

## Running Dapr on Kubernetes cluster

### Setup Cluster

* [Setup Minikube Cluster](./cluster/setup-minikube.md)
* [Setup Azure Kubernetes Service Cluster](./cluster/setup-aks.md)

### Using Dapr CLI

#### Install Dapr to Kubernetes

```bash
$ dapr init --kubernetes
⌛  Making the jump to hyperspace...
✅  Deploying the Actions Operator to your cluster...
✅  Success! Actions is up and running. To verify, run 'kubectl get pods -n dapr-system' in your terminal
```

#### Uninstall Dapr on Kubernetes

```bash
$ dapr uninstall --kubernetes
```

### Using Helm (Advanced)

#### Install Dapr to Kubernetes

1. Make sure helm is initialized in your running kubernetes cluster.

2. Add Azure Container Registry as an helm repo
```bash
helm repo add dapr https://actionscore.azurecr.io/helm/v1/repo \
--username 390401a7-d7a6-46da-b10f-3ceff7a1cdd5 \
--password 485b3522-59bb-4152-8938-ca8b90108af6
```

3. Install the Dapr chart on your cluster in the dapr-system namespace:
```bash
helm install actionscore/dapr-operator --name dapr --namespace dapr-system
```

#### Verify installation

Once the chart installation is done, verify the Dapr operator pods are running in the `dapr-system` namespace:

```bash
$ kubectl get pods -n dapr-system -w

NAME                                     READY     STATUS    RESTARTS   AGE
dapr-operator-7bd6cbf5bf-xglsr           1/1       Running   0          40s
dapr-placement-7f8f76778f-6vhl2          1/1       Running   0          40s
dapr-sidecar-injector-8555576b6f-29cqm   1/1       Running   0          40s
```

#### Uninstall Dapr on Kubernetes

```bash
helm del -n dapr
```

> **Note:** See [here](https://github.com/dapr/dapr/blob/master/charts/dapr-operator/README.md) for details on Dapr helm charts.
