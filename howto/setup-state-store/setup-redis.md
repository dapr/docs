# Setup Redis

## Creating a Redis Store

Dapr can use any Redis instance - containerized, running on your local dev machine, or a managed cloud service. If you already have a Redis store, move on to the [Configuration](#configuration) section.

### Creating a Redis Cache in your Kubernetes Cluster using Helm

We can use [Helm](https://helm.sh/) to quickly create a Redis instance in our Kubernetes cluster. This approach requires [Installing Helm](https://github.com/helm/helm#install).

1. Install Redis into your cluster. Note that we're explicitly setting an image tag to get a version greater than 5, which is what Dapr' pub/sub functionality requires. If you're intending on using Redis as just a state store (and not for pub/sub), you do not have to set the image version.
    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install redis bitnami/redis
    ```

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

1. Open [this link](https://ms.portal.azure.com/#create/Microsoft.Cache) to start the Azure Cache for Redis  creation flow. Log in if necessary.
2. Fill out necessary information and **check the "Unblock port 6379" box**, which will allow us to persist state without SSL.
3. Click "Create" to kickoff deployment of your Redis instance.
4. Once your instance is created, you'll need to grab the Host name (FQDN) and your access key.
   - for the Host name navigate to the resources "Overview" and copy "Host name"
   - for your access key navigate to "Access Keys" under "Settings" and copy your key.
5. Finally, we need to add our key and our host to a `redis.yaml` file that Dapr can apply to our cluster. If you're running a sample, you'll add the host and key to the provided `redis.yaml`. If you're creating a project from the ground up, you'll create a `redis.yaml` file as specified in [Configuration](#configuration). Set the `redisHost` key to `[HOST NAME FROM PREVIOUS STEP]:6379` and the `redisPassword` key to the key you copied in step 4. **Note:** In a production-grade application, follow [secret management](https://github.com/dapr/docs/blob/master/concepts/components/secrets.md) instructions to securely manage your secrets.

> **NOTE:** Dapr pub/sub uses [Redis Streams](https://redis.io/topics/streams-intro) that was introduced by Redis 5.0, which isn't currently available on Azure Managed Redis Cache. Consequently, you can use Azure Managed Redis Cache only for state persistence.


### Other ways to create a Redis Database

- [AWS Redis](https://aws.amazon.com/redis/)
- [GCP Cloud MemoryStore](https://cloud.google.com/memorystore/)

## Configuration

To setup Redis, you need to create a component for `state.redis`. 
<br>
The following yaml files demonstrates how to define each. If the Redis instance supports TLS with public certificates it can be configured to enable or disable TLS in the yaml. **Note:** yaml files below illustrate secret management in plain text. In a production-grade application, follow [secret management](../../concepts/secrets/README.md) instructions to securely manage your secrets.

### Configuring Redis for State Persistence and Retrieval

Create a file called redis.yaml, and paste the following:

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
  - name: enableTLS
    value: <bool>
```

## Apply the configuration

### Kubernetes

```
kubectl apply -f redis.yaml
```

### Standalone

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
