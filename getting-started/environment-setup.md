# Environment Setup

Dapr can be run in either self hosted or Kubernetes modes. Running Dapr runtime in self hosted mode enables you to develop Dapr applications in your local development environment and then deploy and run them in other Dapr supported environments. For example, you can develop Dapr applications in self hosted mode and then deploy them to any Kubernetes cluster.

## Contents

- [Prerequisites](#prerequisites)
- [Installing Dapr CLI](#installing-dapr-cli)
- [Installing Dapr in self-hosted mode](#installing-dapr-in-self-hosted-mode)
- [Installing Dapr on Kubernetes cluster](#installing-dapr-on-a-kubernetes-cluster)

## Prerequisites

On default Dapr will install with a developer environment using Docker containers to get you started easily. However, Dapr does not depend on Docker to run (see [here](https://github.com/dapr/cli/blob/master/README.md) for instructions on installing Dapr locally without Docker using slim init). This getting started guide assumes Dapr is installed along with this developer environment.

- Install [Docker](https://docs.docker.com/install/)

> For Windows user, ensure that `Docker Desktop For Windows` uses Linux containers.

## Installing Dapr CLI

### Using script to install the latest release

**Windows**

Install the latest windows Dapr cli to `c:\dapr` and add this directory to User PATH environment variable.

```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```

**Linux**

Install the latest linux Dapr CLI to `/usr/local/bin`

```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```

**MacOS**

Install the latest darwin Dapr CLI to `/usr/local/bin`

```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash
```

Or install via [Homebrew](https://brew.sh)

```bash
brew install dapr/tap/dapr-cli
```

### From the Binary Releases

Each release of Dapr CLI includes various OSes and architectures. These binary versions can be manually downloaded and installed.

1. Download the [Dapr CLI](https://github.com/dapr/cli/releases)
2. Unpack it (e.g. dapr_linux_amd64.tar.gz, dapr_windows_amd64.zip)
3. Move it to your desired location.
   - For Linux/MacOS - `/usr/local/bin`
   - For Windows, create a directory and add this to your System PATH. For example create a directory called `c:\dapr` and add this directory to your path, by editing your system environment variable.

## Installing Dapr in self hosted mode

### Initialize Dapr using the CLI

On default, during initialization the Dapr CLI will install the Dapr binaries as well as setup a developer environment to help you get started easily with Dapr. This environment uses Docker containers, therefore Docker is listed as a prerequisite. 

>If you prefer to run Dapr without this environment and no dependency on Docker, see the CLI documentation for usage of the `--slim` flag with the init CLI command [here](https://github.com/dapr/cli/blob/master/README.md). Note, if you are a new user, it is strongly recommended to intall Docker and use the regular init command.

> For Linux users, if you run your docker cmds with sudo or the install path is `/usr/local/bin`(default install path), you need to use "**sudo dapr init**"
> For Windows users, make sure that you run the cmd terminal in administrator mode
> **Note:** See [Dapr CLI](https://github.com/dapr/cli) for details on the usage of Dapr CLI

```bash
$ dapr init
⌛  Making the jump to hyperspace...
Downloading binaries and setting up components
✅  Success! Dapr is up and running. To get started, go here: https://aka.ms/dapr-getting-started
```

If you prefer you can also install to an alternate location by using `--install-path`:

```
$ dapr init --install-path /home/user123/mydaprinstall
```

To see that Dapr has been installed successfully, from a command prompt run the `docker ps` command and check that the `daprio/dapr:latest` and `redis` container images are both running.

### Install a specific runtime version

You can install or upgrade to a specific version of the Dapr runtime using `dapr init --runtime-version`. You can find the list of versions in [Dapr Release](https://github.com/dapr/dapr/releases).

```bash
# Install v0.1.0 runtime
$ dapr init --runtime-version 0.1.0

# Check the versions of cli and runtime
$ dapr --version
cli version: v0.1.0
runtime version: v0.1.0
```

### Uninstall Dapr in a self hosted mode

Uninstalling removes the Placement service container or the Placement service binary.  

```bash
$ dapr uninstall
```

> For Linux users, if you run your docker cmds with sudo or the install path is `/usr/local/bin`(default install path), you need to use "**sudo dapr uninstall**" to remove dapr binaries and/or the containers.

It won't remove the Redis or Zipkin containers by default in case you were using them for other purposes. To remove Redis, Zipkin and actor Placement container as well as remove the default Dapr dir located at `$HOME/.dapr` or `%USERPROFILE%\.dapr\` run:

```bash
$ dapr uninstall --all
```

**You should always run `dapr uninstall` before running another `dapr init`.**

To specify a custom install path from which you have to uninstall run:

```bash
$ dapr uninstall --install-path /path/to/binary
```

## Installing Dapr on a Kubernetes cluster

When setting up Kubernetes, you can do this either via the Dapr CLI or Helm.

*Note that installing Dapr using the CLI is recommended for testing purposes only.*

Dapr installs the following pods:

* dapr-operator: Manages component updates and kubernetes services endpoints for Dapr (state stores, pub-subs, etc.)
* dapr-sidecar-injector: Injects Dapr into annotated deployment pods
* dapr-placement: Used for actors only. Creates mapping tables that map actor instances to pods
* dapr-sentry: Manages mTLS between services and acts as a certificate authority

### Setup Cluster

You can install Dapr on any Kubernetes cluster. Here are some helpful links:

- [Setup Minikube Cluster](./cluster/setup-minikube.md)
- [Setup Azure Kubernetes Service Cluster](./cluster/setup-aks.md)
- [Setup Google Cloud Kubernetes Engine](https://cloud.google.com/kubernetes-engine/docs/quickstart)
- [Setup Amazon Elastic Kubernetes Service](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)

> **Note:** The Dapr control plane containers are currently only distributed on linux containers.
> Your Kubernetes cluster must contain available Linux capable nodes.
> Both the Dapr CLI, and the Dapr Helm chart automatically deploy with affinity for nodes with the label `kubernetes.io/os=linux`.
> For more information see [Deploying to a Hybrid Linux/Windows K8s Cluster](../howto/hybrid-clusters/)

### Using the Dapr CLI

You can install Dapr to a Kubernetes cluster using CLI.

> **Note:** that using the CLI does not support non-default namespaces.  
> If you need a non-default namespace, Helm installation has to be used (see below).

#### Install Dapr to Kubernetes

```bash
$ dapr init --kubernetes
ℹ️  Note: this installation is recommended for testing purposes. For production environments, please use Helm

⌛  Making the jump to hyperspace...
✅  Deploying the Dapr Operator to your cluster...
✅  Success! Dapr has been installed. To verify, run 'kubectl get pods -w' in your terminal. To get started, go here: https://aka.ms/dapr-getting-started
```

Dapr CLI installs Dapr to `default` namespace of Kubernetes cluster using [this](https://daprreleases.blob.core.windows.net/manifest/dapr-operator.yaml) manifest.

#### Uninstall Dapr on Kubernetes

```bash
$ dapr uninstall --kubernetes
```

### Using Helm (Advanced)

You can install Dapr to Kubernetes cluster using a Helm 3 chart.

> **Note:** The latest Dapr helm chart no longer supports Helm v2. Please migrate from helm v2 to helm v3 by following [this guide](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/).

#### Install Dapr to Kubernetes

1. Make sure Helm 3 is installed on your machine

2. Add Azure Container Registry as a Helm repo

```bash
helm repo add dapr https://daprio.azurecr.io/helm/v1/repo
helm repo update
```

3. Create `dapr-system` namespace on your kubernetes cluster

```bash
kubectl create namespace dapr-system
```

4. Install the Dapr chart on your cluster in the `dapr-system` namespace.

```bash
helm install dapr dapr/dapr --namespace dapr-system
```

#### Verify installation

Once the chart installation is complete, verify the dapr-operator, dapr-placement, dapr-sidecar-injector and dapr-sentry pods are running in the `dapr-system` namespace:

```bash
$ kubectl get pods -n dapr-system -w

NAME                                     READY     STATUS    RESTARTS   AGE
dapr-operator-7bd6cbf5bf-xglsr           1/1       Running   0          40s
dapr-placement-7f8f76778f-6vhl2          1/1       Running   0          40s
dapr-sidecar-injector-8555576b6f-29cqm   1/1       Running   0          40s
dapr-sentry-9435776c7f-8f7yd             1/1       Running   0          40s
```

#### Sidecar annotations

To see all the supported annotations for the Dapr sidecar on Kubernetes, visit [this](../howto/configure-k8s/README.md) how to guide.

#### Uninstall Dapr on Kubernetes

Helm 3

```bash
helm uninstall dapr -n dapr-system
```

> **Note:** See [here](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md) for details on Dapr helm charts.
