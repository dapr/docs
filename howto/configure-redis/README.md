# Redis and Dapr

Dapr can use Redis in two ways:

1. For state persistence and restoration
2. For enabling pub/sub async style message delivery

## Creating a Redis Store

Dapr can use any Redis instance - containerized, running on your local dev machine, or a managed cloud service. If you already have a Redis store, move on to the [Configuration](#configuration) section.

### Creating a Redis Cache in your Kubernetes Cluster using Helm

We can use [Helm](https://helm.sh/) to quickly create a Redis instance in our Kubernetes cluster. This approach requires [Installing Helm v3](https://github.com/helm/helm#install).

1. Install Redis into your cluster:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install redis bitnami/redis
```

> Note that you need a Redis version greater than 5, which is what Dapr' pub/sub functionality requires. If you're intending on using Redis as just a state store (and not for pub/sub), also a lower version can be used.

2. Run `kubectl get pods` to see the Redis containers now running in your cluster.

3. Add `redis-master:6379` as the `redisHost` in your [redis.yaml](#configuration) file. For example:

  ```yaml
      metadata:
      - name: redisHost
        value: redis-master:6379
  ```

4. Next, we'll get our Redis password, which is slightly different depending on the OS we're using:

- **Windows**: Run `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" > encoded.b64`, which will create a file with your encoded password. Next, run `certutil -decode encoded.b64 password.txt`, which will put your redis password in a text file called `password.txt`. Copy the password and delete the two files.

- **Linux/MacOS**: Run `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode` and copy the outputted password.

  Add this password as the `redisPassword` value in your [redis.yaml](#configuration) file. For example:

  ```yaml
      metadata:
      - name: redisPassword
        value: lhDOkwTlp0
  ```

### Creating an Azure Managed Redis Cache

**Note**: this approach requires having an Azure Subscription.

1. Open [this link](https://ms.portal.azure.com/#create/Microsoft.Cache) to start the Azure Redis Cache creation flow. Log in if necessary.
2. Fill out necessary information and **check the "Unblock port 6379" box**, which will allow us to persist state without SSL.
3. Click "Create" to kickoff deployment of your Redis instance.
4. Once your instance is created, you'll need to grab your access key. Navigate to "Access Keys" under "Settings" and copy your key.
5. Run `kubectl get svc` and copy the cluster IP of your `redis-master`.
6. Finally, we need to add our key and our host to a `redis.yaml` file that Dapr can apply to our cluster. If you're running a sample, you'll add the host and key to the provided `redis.yaml`. If you're creating a project from the ground up, you'll create a `redis.yaml` file as specified in [Configuration](#configuration). Set the `redisHost` key to `[IP FROM PREVIOUS STEP]:6379` and the `redisPassword` key to the key you copied in step 4. **Note:** In a production-grade application, follow [secret management](../../concepts/secrets/README.md) instructions to securely manage your secrets.

> **NOTE:** Dapr pub/sub uses [Redis Streams](https://redis.io/topics/streams-intro) that was introduced by Redis 5.0, which isn't currently available on Azure Managed Redis Cache. Consequently, you can use Azure Managed Redis Cache only for state persistence.

### Other ways to Create a Redis Database

- [AWS Redis](https://aws.amazon.com/redis/)
- [GCP Cloud MemoryStore](https://cloud.google.com/memorystore/)

## Configuration

Dapr can use Redis as a `statestore` component (for state persistence and retrieval) or as a `messagebus` component (for pub/sub). The following yaml files demonstrates how to define each. **Note:** yaml files below illustrate secret management in plain text. In a production-grade application, follow [secret management](../../concepts/secrets/README.md) instructions to securely manage your secrets.

### Configuring Redis for State Persistence and Retrieval

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

### Configuring Redis for Pub/Sub

Create a file called redis-pubsub.yaml, and paste the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
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

### Standalone

By default the Dapr CLI creates a local Redis instance when you run `dapr init`. However, if you want to configure a different Redis instance, create a directory named `components` in the root path of your Dapr binary and then copy your `redis.yaml` into that directory.
