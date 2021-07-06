---
type: docs
title: "How-To: Configure state store and pub/sub message broker"
linkTitle: "(optional) Configure state & pub/sub"
weight: 80
description: "Configure state store and pub/sub message broker components for Dapr"
aliases:
  - /getting-started/configure-redis/
---

In order to get up and running with the state and pub/sub building blocks two components are needed:

1. A state store component for persistence and restoration
2. As pub/sub message broker component for async-style message delivery

A full list of supported components can be found here:
- [Supported state stores]({{< ref supported-state-stores >}})
- [Supported pub/sub message brokers]({{< ref supported-pubsub >}})

The rest of this page describes how to get up and running with Redis.

{{% alert title="Self-hosted mode" color="warning" %}}
When initialized in self-hosted mode, Dapr automatically runs a Redis container and sets up the required component yaml files. You can skip this page and go to [next steps](#next-steps)
{{% /alert %}}

## Create a Redis store

Dapr can use any Redis instance - either containerized on your local dev machine or a managed cloud service. If you already have a Redis store, move on to the [configuration](#configure-dapr-components) section.

{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" >}}

{{% codetab %}}
Redis is automatically installed in self-hosted environments by the Dapr CLI as part of the initialization process. You are all set and can skip to the [next steps](#next-steps)
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
    redis-replicas-0    1/1     Running   0          69s
    redis-replicas-1    1/1     Running   0          22s
    ```

Note that the hostname is `redis-master.default.svc.cluster.local:6379`, and a Kubernetes secret, `redis`, is created automatically.

{{% /codetab %}}

{{% codetab %}}
This method requires having an Azure Subscription.

1. Open the [Azure Portal](https://ms.portal.azure.com/#create/Microsoft.Cache) to start the Azure Redis Cache creation flow. Log in if necessary.
1. Fill out the necessary information
   - Dapr pub/sub uses [Redis streams](https://redis.io/topics/streams-intro) that was introduced by Redis 5.0. If you would like to use Azure Redis Cache for pub/sub make sure to set the version to (PREVIEW) 6.
1. Click "Create" to kickoff deployment of your Redis instance.
1. You'll need the hostname of your Redis instance, which you can retrieve from the "Overview" in Azure. It should look like `xxxxxx.redis.cache.windows.net:6380`. Note this for later.
1. Once your instance is created, you'll need to grab your access key. Navigate to "Access Keys" under "Settings" and create a Kubernetes secret to store your Redis password:
   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```

{{% /codetab %}}

{{% codetab %}}
1. Visit [AWS Redis](https://aws.amazon.com/redis/) to deploy a Redis instance
1. Note the Redis hostname in the AWS portal for use later
1. Create a Kubernetes secret to store your Redis password:
   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```
{{% /codetab %}}

{{% codetab %}}
1. Visit [GCP Cloud MemoryStore](https://cloud.google.com/memorystore/) to deploy a MemoryStore instance
1. Note the Redis hostname in the GCP portal for use later
1. Create a Kubernetes secret to store your Redis password:
   ```bash
   kubectl create secret generic redis --from-literal=redis-password=*********
   ```
{{% /codetab %}}

{{< /tabs >}}

## Configure Dapr components

Dapr uses components to define what resources to use for building block functionality. These steps go through how to connect the resources you created above to Dapr for state and pub/sub.

In self-hosted mode, component files are automatically created under:
- **Windows**: `%USERPROFILE%\.dapr\components\`
- **Linux/MacOS**: `$HOME/.dapr/components`

For Kubernetes, files can be created in any directory, as they are applied with `kubectl`.

### Create State store component

Create a file named `redis-state.yaml`, and paste the following:

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
```

This example uses the kubernetes secret that was created when setting up a cluster with the above instructions.

{{% alert title="Other stores" color="primary" %}}
If using a state store other than Redis, refer to the [supported state stores]({{< ref supported-state-stores >}}) for information on what options to set.
{{% /alert %}}

### Create Pub/sub message broker component

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
    value: <REPLACE WITH HOSTNAME FROM ABOVE - for Redis on Kubernetes it is redis-master.default.svc.cluster.local:6379>
  - name: redisPassword
    secretKeyRef:
      name: redis
      key: redis-password
```

This example uses the kubernetes secret that was created when setting up a cluster with the above instructions.

{{% alert title="Other stores" color="primary" %}}
If using a pub/sub message broker other than Redis, refer to the [supported pub/sub message brokers]({{< ref supported-pubsub >}}) for information on what options to set.
{{% /alert %}}

### Hard coded passwords (not recommended)

For development purposes only you can skip creating kubernetes secrets and place passwords directly into the Dapr component file:

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

## Apply the configuration

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

By default the Dapr CLI creates a local Redis instance when you run `dapr init`. However, if you want to configure a different Redis instance you can either:
- Update the existing component files or create new ones in the default components directory
   - **Linux/MacOS:** `$HOME/.dapr/components`
   - **Windows:** `%USERPROFILE%\.dapr\components`
- Create a new `components` directory in your app folder containing the YAML files and provide the path to the `dapr run` command with the flag `--components-path`

{{% alert title="Self-hosted slim mode" color="primary" %}}
If you initialized Dapr in [slim mode]({{< ref self-hosted-no-docker.md >}}) (without Docker) you need to manually create the default directory, or always specify a components directory using `--components-path`.
{{% /alert %}}

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
- [Try out a Dapr quickstart]({{< ref quickstarts.md >}})
