---
type: docs
title: "Redis"
linkTitle: "Redis"
description: Detailed information on the Redis lock component
---

## Component format

To set up the Redis lock, create a component of type `lock.redis`. See [this guide]({{< ref "howto-use-distributed-lock" >}}) on how to create a lock.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: lock.redis
  version: v1
  metadata:
  - name: redisHost
    value: <HOST>
  - name: redisPassword #Optional.
    value: <PASSWORD>
  - name: useEntraID
    value: <bool> # Optional. Allowed: true, false.
  - name: enableTLS
    value: <bool> # Optional. Allowed: true, false.
  - name: failover
    value: <bool> # Optional. Allowed: true, false.
  - name: sentinelMasterName
    value: <string> # Optional
  - name: maxRetries
    value: # Optional
  - name: maxRetryBackoff
    value: # Optional
  - name: failover
    value: # Optional
  - name: sentinelMasterName
    value: # Optional
  - name: redeliverInterval
    value: # Optional
  - name: processingTimeout
    value: # Optional
  - name: redisType
    value: # Optional
  - name: redisDB
    value: # Optional
  - name: redisMaxRetries
    value: # Optional
  - name: redisMinRetryInterval
    value: # Optional
  - name: redisMaxRetryInterval
    value: # Optional
  - name: dialTimeout
    value: # Optional
  - name: readTimeout
    value: # Optional
  - name: writeTimeout
    value: # Optional
  - name: poolSize
    value: # Optional
  - name: poolTimeout
    value: # Optional
  - name: maxConnAge
    value: # Optional
  - name: minIdleConns
    value: # Optional
  - name: idleCheckFrequency
    value: # Optional
  - name: idleTimeout
    value: # Optional
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}


## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| redisHost          | Y        | Connection-string for the redis host  | `localhost:6379`, `redis-master.default.svc.cluster.local:6379`
| redisPassword      | N        | Password for Redis host. No Default. Can be `secretKeyRef` to use a secret reference  | `""`, `"KeFg23!"`
| redisUsername      | N        | Username for Redis host. Defaults to empty. Make sure your redis server version is 6 or above, and have created acl rule correctly. | `""`, `"default"`
| useEntraID | N | Implements EntraID support for Azure Cache for Redis. Before enabling this: <ul><li>The `redisHost` name must be specified in the form of `"server:port"`</li><li>TLS must be enabled</li></ul> Learn more about this setting under [Create a Redis instance > Azure Cache for Redis]({{< ref "#setup-redis" >}}) | `"true"`, `"false"` |
| enableTLS          | N         | If the Redis instance supports TLS with public certificates, can be configured to be enabled or disabled. Defaults to `"false"` | `"true"`, `"false"`
| maxRetries         | N         | Maximum number of retries before giving up. Defaults to `3` | `5`, `10`
| maxRetryBackoff    | N         | Maximum backoff between each retry. Defaults to `2` seconds; `"-1"` disables backoff. | `3000000000`
| failover           | N         | Property to enabled failover configuration. Needs sentinelMasterName to be set. The redisHost should be the sentinel host address. See [Redis Sentinel Documentation](https://redis.io/docs/manual/sentinel/). Defaults to `"false"` | `"true"`, `"false"`
| sentinelMasterName | N         | The sentinel master name. See [Redis Sentinel Documentation](https://redis.io/docs/manual/sentinel/) | `"mymaster"`
| redeliverInterval  | N        | The interval between checking for pending messages to redelivery. Defaults to `"60s"`. `"0"` disables redelivery. | `"30s"`
| processingTimeout  | N        | The amount time a message must be pending before attempting to redeliver it. Defaults to `"15s"`. `"0"` disables redelivery. | `"30s"`
| redisType          | N        | The type of redis. There are two valid values, one is `"node"` for single node mode, the other is `"cluster"` for redis cluster mode. Defaults to `"node"`. | `"cluster"`
| redisDB            | N        | Database selected after connecting to redis. If `"redisType"` is `"cluster"` this option is ignored. Defaults to `"0"`. | `"0"`
| redisMaxRetries    | N        | Alias for `maxRetries`. If both values are set `maxRetries` is ignored. | `"5"`
| redisMinRetryInterval        | N        | Minimum backoff for redis commands between each retry. Default is `"8ms"`;  `"-1"` disables backoff. | `"8ms"`
| redisMaxRetryInterval        | N        | Alias for `maxRetryBackoff`. If both values are set `maxRetryBackoff` is ignored.  | `"5s"`
| dialTimeout        | N        | Dial timeout for establishing new connections. Defaults to `"5s"`.  | `"5s"`
| readTimeout        | N        | Timeout for socket reads. If reached, redis commands will fail with a timeout instead of blocking. Defaults to `"3s"`, `"-1"` for no timeout. | `"3s"`
| writeTimeout       | N        | Timeout for socket writes. If reached, redis commands will fail with a timeout instead of blocking. Defaults is readTimeout. | `"3s"`
| poolSize           | N        | Maximum number of socket connections. Default is 10 connections per every CPU as reported by runtime.NumCPU. | `"20"`
| poolTimeout        | N        | Amount of time client waits for a connection if all connections are busy before returning an error. Default is readTimeout + 1 second. | `"5s"`
| maxConnAge         | N        | Connection age at which the client retires (closes) the connection. Default is to not close aged connections. | `"30m"`
| minIdleConns       | N        | Minimum number of idle connections to keep open in order to avoid the performance degradation associated with creating new connections. Defaults to `"0"`. | `"2"`
| idleCheckFrequency | N        | Frequency of idle checks made by idle connections reaper. Default is `"1m"`. `"-1"` disables idle connections reaper. | `"-1"`
| idleTimeout        | N        | Amount of time after which the client closes idle connections. Should be less than server's timeout. Default is `"5m"`. `"-1"` disables idle timeout check. | `"10m"`

## Setup Redis

Dapr can use any Redis instance: containerized, running on your local dev machine, or a managed cloud service.

{{< tabs "Self-Hosted" "Kubernetes" "AWS" "Azure" "GCP" >}}

{{% codetab %}}
A Redis instance is automatically created as a Docker container when you run `dapr init`
{{% /codetab %}}

{{% codetab %}}
You can use [Helm](https://helm.sh/) to quickly create a Redis instance in our Kubernetes cluster. This approach requires [Installing Helm](https://github.com/helm/helm#install).

1. Install Redis into your cluster. Note that we're explicitly setting an image tag to get a version greater than 5, which is what Dapr' pub/sub functionality requires. If you're intending on using Redis as just a state store (and not for pub/sub), you do not have to set the image version.
    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install redis bitnami/redis --set image.tag=6.2
    ```

2. Run `kubectl get pods` to see the Redis containers now running in your cluster.
3. Add `redis-master:6379` as the `redisHost` in your [redis.yaml](#component-format) file. For example:
    ```yaml
        metadata:
        - name: redisHost
          value: redis-master:6379
    ```
4. Next, get the Redis password, which is slightly different depending on the OS we're using:
    - **Windows**: Run `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" > encoded.b64`, which creates a file with your encoded password. Next, run `certutil -decode encoded.b64 password.txt`, which will put your redis password in a text file called `password.txt`. Copy the password and delete the two files.

    - **Linux/MacOS**: Run `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode` and copy the outputted password.

    Add this password as the `redisPassword` value in your [redis.yaml](#component-format) file. For example:
    ```yaml
        metadata:
        - name: redisPassword
          value: lhDOkwTlp0
    ```
{{% /codetab %}}

{{% codetab %}}
[AWS Redis](https://aws.amazon.com/redis/)
{{% /codetab %}}

{{% codetab %}}
1. [Create an Azure Cache for Redis instance using the official Microsoft documentation.](https://docs.microsoft.com/azure/azure-cache-for-redis/quickstart-create-redis)

1. Once your instance is created, grab the Host name (FQDN) and your access key from the Azure portal. 
   - For the Host name: 
     - Navigate to the resource's **Overview** page.
     - Copy the **Host name** value.
   - For your access key: 
     - Navigate to **Settings** > **Access Keys**. 
     - Copy and save your key.

1. Add your key and your host name to a `redis.yaml` file that Dapr can apply to your cluster. 
   - If you're running a sample, add the host and key to the provided `redis.yaml`. 
   - If you're creating a project from the ground up, create a `redis.yaml` file as specified in [the Component format section](#component-format). 
   
1. Set the `redisHost` key to `[HOST NAME FROM PREVIOUS STEP]:6379` and the `redisPassword` key to the key you saved earlier. 
   
   **Note:** In a production-grade application, follow [secret management]({{< ref component-secrets.md >}}) instructions to securely manage your secrets.

1. Enable EntraID support:
   - Enable Entra ID authentication on your Azure Redis server. This may takes a few minutes.
   - Set `useEntraID` to `"true"` to implement EntraID support for Azure Cache for Redis.

1. Set `enableTLS` to `"true"` to support TLS. 

> **Note:**`useEntraID` assumes that either your UserPrincipal (via AzureCLICredential) or the SystemAssigned managed identity have the RedisDataOwner role permission. If a user-assigned identity is used, [you need to specify the `azureClientID` property]({{< ref "howto-mi.md#set-up-identities-in-your-component" >}}).

{{% /codetab %}}

{{% codetab %}}
[GCP Cloud MemoryStore](https://cloud.google.com/memorystore/)
{{% /codetab %}}

{{< /tabs >}}


## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Distributed lock building block]({{< ref distributed-lock-api-overview >}})
