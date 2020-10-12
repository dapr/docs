---
type: docs
title: "How-To: Setup Redis"
linkTitle: "How-To: Setup Redis"
weight: 30
description: "Configure Redis for Dapr state management or Pub/Sub"
type: docs
---

# Configure Redis for state management or pub/sub

Dapr can use Redis in two ways:

1. As state store component (state.redis) for persistence and restoration
2. As pub/sub component (pubsub.redis) for async style message delivery

- [Option 1: Creating a Redis Cache in your Kubernetes cluster using Helm](#Option-1:-creating-a-Redis-Cache-in-your-Kubernetes-Cluster-using-Helm)
- [Option 2: Creating an Azure Cache for Redis service](#Option-2:-Creating-an-Azure-Cache-for-Redis-service)
- [Configuration](#configuration)


## Creating a Redis store

Dapr can use any Redis instance - containerized, running on your local dev machine, or a managed cloud service. If you already have a Redis store, move on to the [configuration](#configuration) section.

### Option 1: Creating a Redis Cache in your Kubernetes Cluster using Helm

We can use [Helm](https://helm.sh/) to quickly create a Redis instance in our Kubernetes cluster. This approach requires [Installing Helm v3](https://github.com/helm/helm#install).

1. Install Redis into your cluster:

   ```bash
   helm repo add bitnami https://charts.bitnami.com/bitnami
   helm repo update
   helm install redis bitnami/redis
   ```

   > Note that you need a Redis version greater than 5, which is what Dapr' pub/sub functionality requires. If you're intending on using Redis as just a state store (and not for pub/sub) a lower version can be used.

2. Run `kubectl get pods` to see the Redis containers now running in your cluster or watch the rollout status.

    ```bash
    kubectl rollout status statefulset.apps/redis-master
    kubectl rollout status statefulset.apps/redis-slave
    ```

3. Add `redis-master.default.svc.cluster.local:6379` as the `redisHost` in your [redis.yaml](#configuration) file. For example:

   ```yaml
   metadata:
   - name: redisHost
     value: redis-master.default.svc.cluster.local:6379
   ```

4. Next, we'll get our Redis password using a `secretKeyRef` to a Kubernetes secret that has been configured into your cluster when Redis was installed. You can see the name of the secret key with `kubectl describe secret redis`

Add `redis` with the key `redis-password` as the `redisPassword` secretKeyRef in your [redis.yaml](#configuration) file. For example:

   ```yaml
  - name: redisPassword
    secretKeyRef:
      name: redis
      key: redis-password
   ```
That's it! Now go to the [Configuration](#configuration) section

5. (Alternative) Its **not recommended**, however you can use a hard coded password instead of secretKeyRef. First we'll get the Redis password, which is slightly different depending on the OS you're using:

   - **Windows**: Run below commands
   ```powershell
   # Create a file with your encoded password. 
   kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" > encoded.b64
   # put your redis password in a text file called `password.txt`.
   certutil -decode encoded.b64 password.txt
   # Copy the password and delete the two files.
   ```

   - **Windows**: If you are using Powershell, it would be even easier. 
   ```powershell
   PS C:\> $base64pwd=kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}"
   PS C:\> $redispassword=[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($base64pwd))
   PS C:\> $base64pwd=""
   PS C:\> $redispassword
   ```
   - **Linux/MacOS**: Run `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode` and copy the outputted password.

   Add this password as the `redisPassword` value in your [redis.yaml](#configuration) file. For example:

   ```yaml
   metadata:
   - name: redisPassword
     value: lhDOkwTlp0
   ```
    > **Note:** The above example uses secret in plain text, follow [these instructions](https://github.com/dapr/docs/blob/master/concepts/secrets/) to configure secrets securely in production.

### Option 2: Creating an Azure Cache for Redis service

> **Note**: This approach requires having an Azure Subscription.

1. Open the [Azure Portal](https://ms.portal.azure.com/#create/Microsoft.Cache) to start the Azure Redis Cache creation flow. Log in if necessary.
1. Fill out the necessary information
1. Click "Create" to kickoff deployment of your Redis instance.
1. Once your instance is created, you'll need to grab your access key. Navigate to "Access Keys" under "Settings" and copy your key.
1. We  need the hostname of your Redis instance, which we can retrieve from the "Overview" in Azure. It should look like `xxxxxx.redis.cache.windows.net:6380`.
1. Finally, we need to add our key and our host to a `redis.yaml` file that Dapr can apply to our cluster. If you're running a sample, you'll add the host and key to the provided `redis.yaml`. If you're creating a project from the ground up, you'll create a `redis.yaml` file as specified in [Configuration](#configuration).

   As the connection to Azure is encrypted, make sure to add the following block to the `metadata` section of your `redis.yaml` file.

   ```yaml
   metadata:
   - name: enableTLS
     value: "true"
   ```

> **NOTE:** Dapr pub/sub uses [Redis Streams](https://redis.io/topics/streams-intro) that was introduced by Redis 5.0, which isn't currently available on Azure Managed Redis Cache. Consequently, you can use Azure Managed Redis Cache only for state persistence.

### Other options to create a Redis database

- [AWS Redis](https://aws.amazon.com/redis/)
- [GCP Cloud MemoryStore](https://cloud.google.com/memorystore/)

## Configuration

Dapr can use Redis as a `statestore` component for state persistence (`state.redis`) or as a `pubsub` component (`pubsub.redis`). The following yaml files demonstrates how to define each component using either a secretKey reference (which is preferred) or a plain text password. **Note:** In a production-grade application, follow [secret management](../../concepts/secrets/README.md) instructions to securely manage your secrets.

### Configuring Redis for state persistence using a secret key reference (preferred)

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

### Configuring Redis for Pub/Sub using a secret key reference (preferred)

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

### Configuring Redis for state persistence using hard coded password (not recommended)

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
    value: <HOST>
  - name: redisPassword
    value: <PASSWORD>
```

### Configuring Redis for Pub/Sub using hard coded password (not recommended)

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
    value: <HOST>
  - name: redisPassword
    value: <PASSWORD>
```

## Apply the configuration

### Kubernetes

```bash
kubectl apply -f redis-state.yaml
kubectl apply -f redis-pubsub.yaml
```

### Self hosted mode

By default the Dapr CLI creates a local Redis instance when you run `dapr init`. However, if you want to configure a different Redis instance, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.

If you initialized Dapr using `dapr init --slim`, the Dapr CLI did not create a Redis instance or a default configuration file for it. Follow [these instructions](#Creating-a-Redis-Store) to create a Redis store. Create the `redis.yaml` following the configuration [instructions](#Configuration) in a `components` dir and provide the path to the `dapr run` command with the flag `--components-path`.
