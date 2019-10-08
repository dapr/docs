# Getting Started

This article describes how to install Dapr to a local standalone developer machine or to a Kubernetes cluster.

Dapr can be run in either Standalone or Kubernetes modes. Running Dapr runtime in Standalone mode enables you to develop Dapr applications in your local development environment and then deploy and run them in other Dapr supported environments. For example, you can develop Dapr applications in Standalone mode and then deploy them to any Kubernetes cluster.

Once Dapr is installed, you can try out the [dapr samples](https://github.com/dapr/samples) and [howtos](../howto/)

## Contents

 - [Prerequsites](#prerequisites)
 - [Installing Dapr in standalone mode](#installing-dapr-in-standalone-mode)
 - [Installing Dapr on Kubernetes cluster](#installing-dapr-on-a-kubernetes-cluster)

## Prerequisites

* [Docker](https://docs.docker.com/v17.09/engine/installation/)

Download the [Dapr CLI](https://github.com/dapr/cli/releases), unpack it and move it to your desired location.
 
> For Mac/Linux - `/usr/local/bin`.

> For Windows, create a directory and add this to your System PATH. For example create a directory called `c:\dapr` and add this directory to your path, by editing your system environment variable.

## Installing Dapr in standalone mode

### Install Dapr runtime using the CLI
Install Dapr by running `dapr init` from a command prompt

> For Linux users, if you run your docker cmds with sudo, you need to use "**sudo dapr init**"

> For Windows users, make sure that you run the cmd terminal in administrator mode

> **Note:** See [Dapr CLI](https://github.com/dapr/cli) for details on the usage of Dapr CLI

```bash
$ dapr init
⌛  Making the jump to hyperspace...
Downloading binaries and setting up components
✅  Success! Dapr is up and running
```

To see that Dapr has been installed successful, from a command prompt run the `docker ps` command and check that the `actionscore.azurecr.io/dapr:latest` and `redis` container images are both running.

### Install a specific runtime version
You can install or upgrade to a specific version of the Dapr runtime using `dapr init --runtime-version`

```bash
# Install v0.4.0-alpha.4 runtime
$ dapr init --runtime-version v0.4.0-alpha.4

# Check the versions of cli and runtime
$ dapr --version
cli version: v0.2.0-alpha.2
runtime version: v0.4.0-alpha.4
```

## Installing Dapr on a Kubernetes cluster
When setting up Kubernetes you can do this either via the Dapr CLI or Helm

### Setup Cluster

* [Setup Minikube Cluster](./cluster/setup-minikube.md)
* [Setup Azure Kubernetes Service Cluster](./cluster/setup-aks.md)

### Using the Dapr CLI

You can install Dapr to Kubernetes cluster using CLI.

#### Install Dapr to Kubernetes

```bash
$ dapr init --kubernetes
⌛  Making the jump to hyperspace...
✅  Deploying the Dapr Operator to your cluster...
✅  Success! Dapr has been installed. To verify, run 'kubectl get pods' in your terminal.
```

Dapr CLI installs Dapr to `default` namespace of Kubernetes cluster.

#### Uninstall Dapr on Kubernetes

```bash
$ dapr uninstall --kubernetes
```

### Using Helm (Advanced)

You can install Dapr to Kubernetes cluster using a Helm chart.

#### Install Dapr to Kubernetes

1. Make sure Helm is initialized in your running Kubernetes cluster.

2. Add Azure Container Registry as a Helm repo

```bash
helm repo add dapr https://actionscore.azurecr.io/helm/v1/repo \
--username 390401a7-d7a6-46da-b10f-3ceff7a1cdd5 \
--password 485b3522-59bb-4152-8938-ca8b90108af6
```

3. Install the Dapr chart on your cluster in the `dapr-system` namespace

```bash
helm install dapr/dapr-operator --name dapr --namespace dapr-system
```

#### Verify installation

Once the chart installation is complete, verify the dapr-operator, dapr-placement and dapr-sidecar-injector pods are running in the `dapr-system` namespace:

```bash
$ kubectl get pods -n dapr-system -w

NAME                                     READY     STATUS    RESTARTS   AGE
dapr-operator-7bd6cbf5bf-xglsr           1/1       Running   0          40s
dapr-placement-7f8f76778f-6vhl2          1/1       Running   0          40s
dapr-sidecar-injector-8555576b6f-29cqm   1/1       Running   0          40s
```

#### Uninstall Dapr on Kubernetes

```bash
helm del --purge -n dapr
```

> **Note:** See [here](https://github.com/dapr/dapr/blob/master/charts/dapr-operator/README.md) for details on Dapr helm charts.
