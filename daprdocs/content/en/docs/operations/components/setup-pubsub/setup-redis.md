# Setup Redis Streams

## Creating a Redis instance

Dapr can use any Redis instance - containerized, running on your local dev machine, or a managed cloud service, provided the version of Redis is 5.0.0 or later. If you already have a Redis instance > 5.0.0 installed, move on to the [Configuration](#configuration) section.

### Running locally

The Dapr CLI will automatically create and setup a Redis Streams instance for you.
The Redis instance will be installed via Docker when you run `dapr init`, and the component file will be created in default directory. (`$HOME/.dapr/components` directory (Mac/Linux) or `%USERPROFILE%\.dapr\components` on Windows).

### Creating a Redis instance in your Kubernetes Cluster using Helm

We can use [Helm](https://helm.sh/) to quickly create a Redis instance in our Kubernetes cluster. This approach requires [Installing Helm](https://github.com/helm/helm#install).

1. Install Redis into your cluster.
    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install redis bitnami/redis
    ```

2. Run `kubectl get pods` to see the Redis containers now running in your cluster.
3. Add `redis-master:6379` as the `redisHost` in your redis.yaml file. For example:

    ```yaml
        metadata:
        - name: redisHost
          value: redis-master:6379
    ```

4. Next, we'll get our Redis password, which is slightly different depending on the OS we're using:
    - **Windows**: Run `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" > encoded.b64`, which will create a file with your encoded password. Next, run `certutil -decode encoded.b64 password.txt`, which will put your redis password in a text file called `password.txt`. Copy the password and delete the two files.

    - **Linux/MacOS**: Run `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode` and copy the outputted password.

    Add this password as the `redisPassword` value in your redis.yaml file. For example:

    ```yaml
        - name: redisPassword
          value: "lhDOkwTlp0"
    ```

### Other ways to create a Redis Database

- [AWS Redis](https://aws.amazon.com/redis/)
- [GCP Cloud MemoryStore](https://cloud.google.com/memorystore/)

## Configuration

To setup Redis, you need to create a component for `pubsub.redis`.

The following yaml files demonstrates how to define each. If the Redis instance supports TLS with public certificates it can be configured to enable or disable TLS in the yaml. **Note:** yaml files below illustrate secret management in plain text. In a production-grade application, follow [secret management](../../concepts/secrets/README.md) instructions to securely manage your secrets.

### Configuring Redis Streams for Pub/Sub

Create a file called pubsub.yaml, and paste the following:

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
  - name: enableTLS
    value: <bool>
```

## Apply the configuration

### Kubernetes

```bash
kubectl apply -f pubsub.yaml
```

### Standalone

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
