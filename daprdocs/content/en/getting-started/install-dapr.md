---
type: docs
title: "How-To: Install Dapr into your environment"
linkTitle: "How-To: Install Dapr"
weight: 20
description: "Install Dapr in your preferred environment"
---

This guide will get you up and running to evaluate Dapr and develop applications. Visit [this page]({{< ref hosting >}}) for a full list of supported platforms with instructions and best practices on running in production.

## Install the Dapr CLI

Begin by downloading and installing the Dapr CLI. This will be used to initialize your environment on your desired platform.

{{% alert title="Note" color="warning" %}}
This command will download and install Dapr v0.11. To install v1.0-rc.1, the release candidate for the [upcoming v1.0 release](https://blog.dapr.io/posts/2020/10/20/the-path-to-v.1.0-production-ready-dapr/), please visit the [v1.0-rc.1 docs](https://v1-rc1.docs.dapr.io/getting-started/install-dapr/#install-the-dapr-cli).
{{% /alert %}}

{{< tabs Linux Windows MacOS Binaries>}}

{{% codetab %}}
This command will install the latest linux Dapr CLI to `/usr/local/bin`:
```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```
{{% /codetab %}}

{{% codetab %}}
This command will install the latest windows Dapr cli to `%USERPROFILE%\.dapr\` and add this directory to User PATH environment variable:
```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```
Verify by opening Explorer and entering `%USERPROFILE%\.dapr\` into the address bar. You should see folders for bin, componenets and a config file.
{{% /codetab %}}

{{% codetab %}}
This command will install the latest darwin Dapr CLI to `/usr/local/bin`:
```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash
```

Or you can install via [Homebrew](https://brew.sh):
```bash
brew install dapr/tap/dapr-cli
```
{{% /codetab %}}

{{% codetab %}}
Each release of Dapr CLI includes various OSes and architectures. These binary versions can be manually downloaded and installed.

1. Download the desired Dapr CLI from the latest [Dapr Release](https://github.com/dapr/cli/releases)
2. Unpack it (e.g. dapr_linux_amd64.tar.gz, dapr_windows_amd64.zip)
3. Move it to your desired location.
   - For Linux/MacOS - `/usr/local/bin`
   - For Windows, create a directory and add this to your System PATH. For example create a directory called `c:\dapr` and add this directory to your path, by editing your system environment variable.
{{% /codetab %}}
{{< /tabs >}}

## Install Dapr in self-hosted mode

Running Dapr runtime in self hosted mode enables you to develop Dapr applications in your local development environment and then deploy and run them in other Dapr supported environments.

### Prerequisites

- Install [Docker Desktop](https://docs.docker.com/install/)
   - Windows users ensure that `Docker Desktop For Windows` uses Linux containers.

By default Dapr will install with a developer environment using Docker containers to get you started easily. This getting started guide assumes Docker is installed to ensure the best experience. However, Dapr does not depend on Docker to run. Read [this page]({{< ref self-hosted-no-docker.md >}}) for instructions on installing Dapr locally without Docker using slim init.

### Initialize Dapr using the CLI

This step will install the latest Dapr Docker containers and setup a developer environment to help you get started easily with Dapr.

1. Ensure you are in an elevated terminal:
   - **Linux/MacOS:** if you run your docker cmds with sudo or the install path is `/usr/local/bin`(default install path), you need to use `sudo`
   - **Windows:** make sure that you run the cmd terminal in administrator mode

2. Run `dapr init`

    ```bash
    $ dapr init
    ⌛  Making the jump to hyperspace...
    Downloading binaries and setting up components
    ✅  Success! Dapr is up and running. To get started, go here: https://aka.ms/dapr-getting-started
    ```

3. Verify installation

   From a command prompt run the `docker ps` command and check that the `daprio/dapr`, `openzipkin/zipkin`, and `redis` container images are running:

   ```bash
   $ docker ps
   CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS              PORTS                              NAMES
   67bc611a118c        daprio/dapr         "./placement"            About a minute ago   Up About a minute   0.0.0.0:6050->50005/tcp            dapr_placement
   855f87d10249        openzipkin/zipkin   "/busybox/sh run.sh"     About a minute ago   Up About a minute   9410/tcp, 0.0.0.0:9411->9411/tcp   dapr_zipkin
   71cccdce0e8f        redis               "docker-entrypoint.s…"   About a minute ago   Up About a minute   0.0.0.0:6379->6379/tcp             dapr_redis
   ```

4. Visit our [hello world quickstart](https://github.com/dapr/quickstarts/tree/master/hello-world) or dive into the [Dapr building blocks]({{< ref building-blocks >}})

### (optional) Install a specific runtime version

You can install or upgrade to a specific version of the Dapr runtime using `dapr init --runtime-version`. You can find the list of versions in [Dapr Release](https://github.com/dapr/dapr/releases).

```bash
# Install v0.1.0 runtime
$ dapr init --runtime-version 0.11.0

# Check the versions of cli and runtime
$ dapr --version
cli version: v0.11.0
runtime version: v0.11.2
```

### Uninstall Dapr in self-hosted mode

This command will remove the placement Dapr container:

```bash
$ dapr uninstall
```

{{% alert title="Warning" color="warning" %}}
This command won't remove the Redis or Zipkin containers by default, just in case you were using them for other purposes. To remove Redis, Zipkin, Actor Placement container, as well as the default Dapr directory located at `$HOME/.dapr` or `%USERPROFILE%\.dapr\`, run:

```bash
$ dapr uninstall --all
```
{{% /alert %}}

> For Linux/MacOS users, if you run your docker cmds with sudo or the install path is `/usr/local/bin`(default install path), you need to use `sudo dapr uninstall` to remove dapr binaries and/or the containers.

## Install Dapr on a Kubernetes cluster

When setting up Kubernetes you can use either the Dapr CLI or Helm.

The following pods will be installed:

- dapr-operator: Manages component updates and Kubernetes services endpoints for Dapr (state stores, pub/subs, etc.)
- dapr-sidecar-injector: Injects Dapr into annotated deployment pods
- dapr-placement: Used for actors only. Creates mapping tables that map actor instances to pods
- dapr-sentry: Manages mTLS between services and acts as a certificate authority

### Setup cluster

You can install Dapr on any Kubernetes cluster. Here are some helpful links:

- [Setup Minikube Cluster]({{< ref setup-minikube.md >}})
- [Setup Azure Kubernetes Service Cluster]({{< ref setup-aks.md >}})
- [Setup Google Cloud Kubernetes Engine](https://cloud.google.com/kubernetes-engine/docs/quickstart)
- [Setup Amazon Elastic Kubernetes Service](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)

{{% alert title="Note" color="primary" %}}
Both the Dapr CLI and the Dapr Helm chart automatically deploy with affinity for nodes with the label `kubernetes.io/os=linux`. You can deploy Dapr to Windows nodes, but most users should not need to. For more information see [Deploying to a hybrid Linux/Windows Kubernetes cluster]({{<ref kubernetes-hybrid-clusters>}}).
{{% /alert %}}


### Install with Dapr CLI

You can install Dapr to a Kubernetes cluster using the Dapr CLI.

#### Install Dapr

The `-k` flag will initialize Dapr on the kuberentes cluster in your current context.

```bash
$ dapr init -k

⌛  Making the jump to hyperspace...
ℹ️  Note: To install Dapr using Helm, see here:  https://github.com/dapr/docs/blob/master/getting-started/environment-setup.md#using-helm-advanced

✅  Deploying the Dapr control plane to your cluster...
✅  Success! Dapr has been installed to namespace dapr-system. To verify, run "dapr status -k" in your terminal. To get started, go here: https://aka.ms/dapr-getting-started
```

#### Install to a custom namespace:

The default namespace when initializeing Dapr is `dapr-system`. You can override this with the `-n` flag.

```
dapr init -k -n mynamespace
```

#### Install in highly available mode:

You can run Dapr with 3 replicas of each control plane pod with the exception of the Placement pod in the dapr-system namespace for [production scenarios]({{< ref kubernetes-production.md >}}).

```
dapr init -k --enable-ha=true
```

#### Disable mTLS:

Dapr is initialized by default with [mTLS]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}}). You can disable it with:

```
dapr init -k --enable-mtls=false
```

#### Uninstall Dapr on Kubernetes

```bash
$ dapr uninstall --kubernetes
```

### Install with Helm (advanced)

You can install Dapr to Kubernetes cluster using a Helm 3 chart.


{{% alert title="Note" color="primary" %}}
The latest Dapr helm chart no longer supports Helm v2. Please migrate from helm v2 to helm v3 by following [this guide](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/).
{{% /alert %}}

#### Install Dapr on Kubernetes

1. Make sure Helm 3 is installed on your machine
2. Add Helm repo

    ```bash
    helm repo add dapr https://dapr.github.io/helm-charts/
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
dapr-dashboard-7bd6cbf5bf-xglsr          1/1       Running   0          40s
dapr-operator-7bd6cbf5bf-xglsr           1/1       Running   0          40s
dapr-placement-7f8f76778f-6vhl2          1/1       Running   0          40s
dapr-sidecar-injector-8555576b6f-29cqm   1/1       Running   0          40s
dapr-sentry-9435776c7f-8f7yd             1/1       Running   0          40s
```

#### Uninstall Dapr on Kubernetes

```bash
helm uninstall dapr -n dapr-system
```

> **Note:** See [this page](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md) for details on Dapr helm charts.

### Sidecar annotations

To see all the supported annotations for the Dapr sidecar on Kubernetes, visit [this]({{<ref "kubernetes-annotations.md">}}) how to guide.

### Configure Redis

Unlike Dapr self-hosted, redis is not pre-installed out of the box on Kubernetes. To install Redis as a state store or as a pub/sub message bus in your Kubernetes cluster see [How-To: Setup Redis]({{< ref configure-redis.md >}})
