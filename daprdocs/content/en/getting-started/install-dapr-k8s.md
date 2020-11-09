---
type: docs
title: "How-To: Install Dapr to Kubernetes"
linkTitle: "How-To: Install Dapr to Kubernetes"
weight: 20
description: "Install Dapr to a Kubernetes cluster"
---

This guide will get you up and running with Dapr running on your local machine or a VM in self-hosted mode.

## Install the Dapr CLI

Begin by downloading and installing the Dapr CLI. This will be used to initialize your environment on your desired platform.

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

## Configure Redis

Unlike Dapr self-hosted, redis is not pre-installed out of the box on Kubernetes.

Dapr can use any Redis instance - containerized, running on your local dev machine, or a managed cloud service. If you already have a Redis store, move on to the [configuration](#configure-dapr-components) section.

{{< tabs "Self-Hosted" "Kubernetes (Helm)" "Azure Redis Cache" "AWS Redis" "GCP Memorystore" >}}

{{% codetab %}}
Redis is automatically installed in self-hosted environments by the Dapr CLI as part of the initialization process.
{{% /codetab %}}

{{% codetab %}}
You can use [Helm](https://helm.sh/) to quickly create a Redis instance in our Kubernetes cluster. This approach requires [Installing Helm v3](https://github.com/helm/helm#install).

1. Install Redis into your cluster:

   ```bash
   helm repo add bitnami https://charts.bitnami.com/bitnami
   helm repo update
   helm install redis bitnami/redis
   ```

   Note that you will need a Redis version greater than 5, which is what Dapr's pub/sub functionality requires. If you're intending on using Redis as just a state store (and not for pub/sub) a lower version can be used.

2. Run `kubectl get pods` to see the Redis containers now running in your cluster:

    ```bash
    $ kubectl get pods 
    NAME             READY   STATUS    RESTARTS   AGE
    redis-master-0   1/1     Running   0          69s
    redis-slave-0    1/1     Running   0          69s
    redis-slave-1    1/1     Running   0          22s
    ```

3. Add `redis-master.default.svc.cluster.local:6379` as the `redisHost` in your [redis.yaml](#configure-dapr-components) file. For example:

   ```yaml
   metadata:
   - name: redisHost
     value: redis-master.default.svc.cluster.local:6379
   ```

4. Securely reference the redis passoword in your [redis.yaml](#configure-dapr-components) file. For example:
    
    ```yaml
    - name: redisPassword
      secretKeyRef:
        name: redis
        key: redis-password
    ```

5. (Alternative) It is **not recommended**, but you can use a hard code a password instead of using secretKeyRef. First you'll get the Redis password, which is slightly different depending on the OS you're using:

   - **Windows**: In Powershell run: 
      ```powershell
      PS C:\> $base64pwd=kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}"
      PS C:\> $redispassword=[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($base64pwd))
      PS C:\> $base64pwd=""
      PS C:\> $redispassword
      ```
   - **Linux/MacOS**: Run:
      ```bash
      kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode
      ```

   Add this password as the `redisPassword` value in your [redis.yaml](#configure-dapr-components) file. For example:

   ```yaml
   metadata:
   - name: redisPassword
     value: lhDOkwTlp0
   ```
{{% /codetab %}}

{{% codetab %}}
This method requires having an Azure Subscription.

1. Open the [Azure Portal](https://ms.portal.azure.com/#create/Microsoft.Cache) to start the Azure Redis Cache creation flow. Log in if necessary.
1. Fill out the necessary information
1. Click "Create" to kickoff deployment of your Redis instance.
1. Once your instance is created, you'll need to grab your access key. Navigate to "Access Keys" under "Settings" and copy your key.
1. You'll need the hostname of your Redis instance, which you can retrieve from the "Overview" in Azure. It should look like `xxxxxx.redis.cache.windows.net:6380`.
1. Finally, you'll need to add our key and our host to a `redis.yaml` file that Dapr can apply to our cluster. If you're running a sample, you'll add the host and key to the provided `redis.yaml`. If you're creating a project from the ground up, you'll create a `redis.yaml` file as specified in [Configuration](#configure-dapr-components).

   As the connection to Azure is encrypted, make sure to add the following block to the `metadata` section of your `redis.yaml` file.

   ```yaml
   metadata:
   - name: enableTLS
     value: "true"
   ```

> **NOTE:** Dapr pub/sub uses [Redis streams](https://redis.io/topics/streams-intro) that was introduced by Redis 5.0, which isn't currently available on Azure Cache for Redis. Consequently, you can use Azure Cache for Redis only for state persistence.
{{% /codetab %}}

{{% codetab %}}
Visit [AWS Redis](https://aws.amazon.com/redis/).
{{% /codetab %}}

{{% codetab %}}
Visit [GCP Cloud MemoryStore](https://cloud.google.com/memorystore/).
{{% /codetab %}}

{{< /tabs >}}

## Configure Dapr components

Dapr can use Redis as a [`statestore` component]({{< ref setup-state-store >}}) for state persistence (`state.redis`) or as a [`pubsub` component]({{< ref setup-pubsub >}}) (`pubsub.redis`). The following yaml files demonstrates how to define each component using either a secretKey reference (which is preferred) or a plain text password.

### Create component files

#### State store component with secret reference

Create a file called redis-state.yaml, and paste the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  metadata:
  - name: redisHost
    value: <HOST e.g. redis-master.default.svc.cluster.local:6379>
  - name: redisPassword
    secretKeyRef:
      name: redis
      key: redis-password
```

#### Pub/sub component with secret reference

Create a file called redis-pubsub.yaml, and paste the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.redis
  metadata:
  - name: redisHost
    value: <HOST e.g. redis-master.default.svc.cluster.local:6379>
  - name: redisPassword
    secretKeyRef:
      name: redis
      key: redis-password
```

#### State store component with hard coded password (not recommended)

For development purposes only, create a file called redis-state.yaml, and paste the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  metadata:
  - name: redisHost
    value: <HOST>
  - name: redisPassword
    value: <PASSWORD>
```

#### Pub/Sub component with hard coded password (not recommended)

For development purposes only, create a file called redis-pubsub.yaml, and paste the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.redis
  metadata:
  - name: redisHost
    value: <HOST>
  - name: redisPassword
    value: <PASSWORD>
```

### Apply the configuration

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
By default the Dapr CLI creates a local Redis instance when you run `dapr init`. However, if you want to configure a different Redis instance, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.

If you initialized Dapr using `dapr init --slim`, the Dapr CLI did not create a Redis instance or a default configuration file for it. Follow [the instructions above](#creat-a-redis-store) to create a Redis store. Create the `redis.yaml` following the configuration [instructions](#configure-dapr-components) in a `components` dir and provide the path to the `dapr run` command with the flag `--components-path`.
{{% /codetab %}}

{{% codetab %}}

Run `kubectl apply -f <FILENAME>` for both state and pubsub files:

```bash
kubectl apply -f redis-state.yaml
kubectl apply -f redis-pubsub.yaml
```
{{% /codetab %}}

{{< /tabs >}}
