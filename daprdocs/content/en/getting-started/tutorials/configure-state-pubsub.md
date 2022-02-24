---
type: docs
title: "Tutorial: Configure state store and pub/sub message broker"
linkTitle: "Configure state & pub/sub"
weight: 80
description: "Configure state store and pub/sub message broker components for Dapr"
aliases:
  - /getting-started/tutorials/configure-redis/
---

To get up and running with the state and Pub/sub building blocks, you'll need two components:

- A state store component for persistence and restoration.
- As pub/sub message broker component for async-style message delivery.

A full list of supported components can be found here:
- [Supported state stores]({{< ref supported-state-stores >}})
- [Supported pub/sub message brokers]({{< ref supported-pubsub >}})

For this tutorial, we describe how to get up and running with Redis.

### Step 1: Create a Redis store

Dapr can use any Redis instance, either:

- Containerized on your local dev machine, or
- A managed cloud service.

If you already have a Redis store, move on to the [configuration](#configure-dapr-components) section.

{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" >}}

{{% codetab %}}
Redis is automatically installed in self-hosted environments by the Dapr CLI as part of the initialization process. You are all set! Skip ahead to the [next steps](#next-steps).
{{% /codetab %}}

{{% codetab %}}
You can use [Helm](https://helm.sh/) to create a Redis instance in our Kubernetes cluster. Before beginning, [install Helm v3](https://github.com/helm/helm#install).

Install Redis into your cluster:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install redis bitnami/redis
```

For Dapr's Pub/sub functionality, you'll need at least Redis version 5. For state store, you can use a lower version. 

Run `kubectl get pods` to see the Redis containers now running in your cluster:

```bash
$ kubectl get pods
NAME             READY   STATUS    RESTARTS   AGE
redis-master-0   1/1     Running   0          69s
redis-replicas-0    1/1     Running   0          69s
redis-replicas-1    1/1     Running   0          22s
```

For Kubernetes:
- The hostname is `redis-master.default.svc.cluster.local:6379`
- The secret, `redis`, is created automatically.

{{% /codetab %}}

{{% codetab %}}
Verify you have an [Azure subscription](https://azure.microsoft.com/en-us/free/).

1. Open and log into the [Azure portal](https://ms.portal.azure.com/#create/Microsoft.Cache) to start the Azure Redis Cache creation flow. 
1. Fill out the necessary information.
   - Dapr Pub/sub uses [Redis streams](https://redis.io/topics/streams-intro) introduced by Redis 5.0. To use Azure Redis Cache for Pub/sub, set the version to *(PREVIEW) 6*.
1. Click **Create** to kickoff deployment of your Redis instance.
1. Make note of the Redis instance hostname from the **Overview** page in Azure portal for later.
   - It should look like `xxxxxx.redis.cache.windows.net:6380`.
1. Once your instance is created, grab your access key:
   1. Navigate to **Access Keys** under **Settings**.
   1. Create a Kubernetes secret to store your Redis password:

      ```bash
      kubectl create secret generic redis --from-literal=redis-password=*********
      ```

{{% /codetab %}}

{{% codetab %}}

1. Deploy a Redis instance from [AWS Redis](https://aws.amazon.com/redis/).
1. Note the Redis hostname in the AWS portal for later.
1. Create a Kubernetes secret to store your Redis password:

   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```

{{% /codetab %}}

{{% codetab %}}

1. Deploy a MemoryStore instance from [GCP Cloud MemoryStore](https://cloud.google.com/memorystore/).
1. Note the Redis hostname in the GCP portal for later.
1. Create a Kubernetes secret to store your Redis password:

   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```

{{% /codetab %}}

{{< /tabs >}}

### Step 2: Configure Dapr components

Dapr defines resources to use for building block functionality with components. These steps go through how to connect the resources you created above to Dapr for state and pub/sub.

#### Locate your component filese

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}

In self-hosted mode, component files are automatically created under:
- **Windows**: `%USERPROFILE%\.dapr\components\`
- **Linux/MacOS**: `$HOME/.dapr/components`

{{% /codetab %}}

{{% codetab %}}

Since Kubernetes files are applied with `kubectl`, they can be created in any directory.

{{% /codetab %}}

{{< /tabs >}}

#### Create State store component

Create a file named `redis-state.yaml`, and paste the following:

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}

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
    value: localhost:6379
  - name: redisPassword
    secretKeyRef:
      name: redis
      key: redis-password
  # uncomment below for connecting to redis cache instances over TLS (ex - Azure Redis Cache)
  # - name: enableTLS
  #   value: true 
```

{{% /codetab %}}

{{% codetab %}}

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
    value: <REPLACE WITH HOSTNAME FROM ABOVE - for Redis on Kubernetes it is redis-master.default.svc.cluster.local:6379>
  - name: redisPassword
    secretKeyRef:
      name: redis
      key: redis-password
  # uncomment below for connecting to redis cache instances over TLS (ex - Azure Redis Cache)
  # - name: enableTLS
  #   value: true 
```

Note the above code example uses the Kubernetes secret you created earlier when setting up a cluster.

{{% /codetab %}}

{{< /tabs >}}

{{% alert title="Other stores" color="primary" %}}
If using a state store other than Redis, refer to the [supported state stores]({{< ref supported-state-stores >}}) for information on options to set.
{{% /alert %}}

#### Create Pub/sub message broker component

Create a file called `redis-pubsub.yaml`, and paste the following:

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}

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
    value: localhost:6379
  - name: redisPassword
    secretKeyRef:
      name: redis
      key: redis-password
 # uncomment below for connecting to redis cache instances over TLS (ex - Azure Redis Cache)
  # - name: enableTLS
  #   value: true 
```

{{% /codetab %}}

{{% codetab %}}

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
    value: <REPLACE WITH HOSTNAME FROM ABOVE - for Redis on Kubernetes it is redis-master.default.svc.cluster.local:6379>
  - name: redisPassword
    secretKeyRef:
      name: redis
      key: redis-password
 # uncomment below for connecting to redis cache instances over TLS (ex - Azure Redis Cache)
  # - name: enableTLS
  #   value: true 
```

Note the above code example uses the Kubernetes secret you created earlier when setting up a cluster.

{{% /codetab %}}

{{< /tabs >}}

{{% alert title="Other stores" color="primary" %}}
If using a pub/sub message broker other than Redis, refer to the [supported pub/sub message brokers]({{< ref supported-pubsub >}}) for information on options to set.
{{% /alert %}}

#### Hard coded passwords (not recommended)

For development purposes *only*, you can skip creating Kubernetes secrets and place passwords directly into the Dapr component file:

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
  # uncomment below for connecting to redis cache instances over TLS (ex - Azure Redis Cache)
  # - name: enableTLS
  #   value: true 
```

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
  # uncomment below for connecting to redis cache instances over TLS (ex - Azure Redis Cache)
  # - name: enableTLS
  #   value: true 
```

### Step 3: Apply the configuration

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

When you run `dapr init`, Dapr creates a default redis `pubsub.yaml` on your local machine. Verify by opening your components directory:

- On Windows, under `%UserProfile%\.dapr\components\pubsub.yaml`
- On Linux/MacOS, under `~/.dapr/components/pubsub.yaml`

For new component files:

1. Create a new `components` directory in your app folder containing the YAML files.
1. Provide the path to the `dapr run` command with the flag `--components-path`

If you initialized Dapr in [slim mode]({{< ref self-hosted-no-docker.md >}}) (without Docker), you need to manually create the default directory, or always specify a components directory using `--components-path`.

{{% /codetab %}}

{{% codetab %}}

Run `kubectl apply -f <FILENAME>` for both state and pubsub files:

```bash
kubectl apply -f redis-state.yaml
kubectl apply -f redis-pubsub.yaml
```

{{% /codetab %}}

{{< /tabs >}}

## Next steps
[Try out a Dapr quickstart]({{< ref quickstarts.md >}})
