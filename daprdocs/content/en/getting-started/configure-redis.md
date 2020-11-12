---
type: docs
title: "How-To: Setup Redis"
linkTitle: "How-To: Setup Redis"
weight: 30
description: "Configure Redis for Dapr state management or Pub/Sub"
---

Dapr can use Redis in two ways:

1. As state store component (state.redis) for persistence and restoration
2. As pub/sub component (pubsub.redis) for async style message delivery

## Create a Redis store

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
  version: v1
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
  version: v1
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
  version: v1
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
  version: v1
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
