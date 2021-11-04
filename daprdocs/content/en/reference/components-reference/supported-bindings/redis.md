---
type: docs
title: "Redis binding spec"
linkTitle: "Redis"
description: "Detailed documentation on the Redis binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/redis/"
---

## Component format

To setup Redis binding create a component of type `bindings.redis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.redis
  version: v1
  metadata:
  - name: redisHost
    value: <address>:6379
  - name: redisPassword
    value: **************
  - name: enableTLS
    value: <bool>
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| redisHost | Y | Output |  The Redis host address | `"localhost:6379"` |
| redisPassword | Y | Output | The Redis password | `"password"` |
| redisUsername | N | Output | Username for Redis host. Defaults to empty. Make sure your redis server version is 6 or above, and have created acl rule correctly. | `"username"` |
| enableTLS | N | Output |  If the Redis instance supports TLS with public certificates it can be configured to enable or disable TLS. Defaults to `"false"` | `"true"`, `"false"` |
| failover           | N | Output         | Property to enabled failover configuration. Needs sentinalMasterName to be set. Defaults to `"false"` | `"true"`, `"false"`
| sentinelMasterName | N | Output         | The sentinel master name. See [Redis Sentinel Documentation](https://redis.io/topics/sentinel) | `""`,  `"127.0.0.1:6379"`
| redeliverInterval  | N | Output        | The interval between checking for pending messages to redelivery. Defaults to `"60s"`. `"0"` disables redelivery. | `"30s"`
| processingTimeout  | N | Output        | The amount time a message must be pending before attempting to redeliver it. Defaults to `"15s"`. `"0"` disables redelivery. | `"30s"`
| redisType        | N | Output        | The type of redis. There are two valid values, one is `"node"` for single node mode, the other is `"cluster"` for redis cluster mode. Defaults to `"node"`. | `"cluster"`
| redisDB        | N | Output        | Database selected after connecting to redis. If `"redisType"` is `"cluster"` this option is ignored. Defaults to `"0"`. | `"0"`
| redisMaxRetries        | N | Output        | Maximum number of times to retry commands before giving up. Default is to not retry failed commands.  | `"5"`
| redisMinRetryInterval        | N | Output        | Minimum backoff for redis commands between each retry. Default is `"8ms"`;  `"-1"` disables backoff. | `"8ms"`
| redisMaxRetryInterval        | N | Output        | Maximum backoff for redis commands between each retry. Default is `"512ms"`;`"-1"` disables backoff. | `"5s"`
| dialTimeout        | N | Output        | Dial timeout for establishing new connections. Defaults to `"5s"`.  | `"5s"`
| readTimeout        | N | Output        | Timeout for socket reads. If reached, redis commands will fail with a timeout instead of blocking. Defaults to `"3s"`, `"-1"` for no timeout. | `"3s"`
| writeTimeout        | N | Output        | Timeout for socket writes. If reached, redis commands will fail with a timeout instead of blocking. Defaults is readTimeout. | `"3s"`
| poolSize        | N | Output        | Maximum number of socket connections. Default is 10 connections per every CPU as reported by runtime.NumCPU. | `"20"`
| poolTimeout        | N | Output        | Amount of time client waits for a connection if all connections are busy before returning an error. Default is readTimeout + 1 second. | `"5s"`
| maxConnAge        | N | Output        | Connection age at which the client retires (closes) the connection. Default is to not close aged connections. | `"30m"`
| minIdleConns        | N | Output        | Minimum number of idle connections to keep open in order to avoid the performance degradation associated with creating new connections. Defaults to `"0"`. | `"2"`
| idleCheckFrequency        | N | Output        | Frequency of idle checks made by idle connections reaper. Default is `"1m"`. `"-1"` disables idle connections reaper. | `"-1"`
| idleTimeout        | N | Output        | Amount of time after which the client closes idle connections. Should be less than server's timeout. Default is `"5m"`. `"-1"` disables idle timeout check. | `"10m"`


## Binding support

This component supports **output binding** with the following operations:

- `create`

## Create a Redis instance

Dapr can use any Redis instance - containerized, running on your local dev machine, or a managed cloud service, provided the version of Redis is 5.0.0 or later.

{{< tabs "Self-Hosted" "Kubernetes" "AWS" "GCP" "Azure">}}

{{% codetab %}}
The Dapr CLI will automatically create and setup a Redis Streams instance for you.
The Redis instance will be installed via Docker when you run `dapr init`, and the component file will be created in default directory. (`$HOME/.dapr/components` directory (Mac/Linux) or `%USERPROFILE%\.dapr\components` on Windows).
{{% /codetab %}}

{{% codetab %}}
You can use [Helm](https://helm.sh/) to quickly create a Redis instance in our Kubernetes cluster. This approach requires [Installing Helm](https://github.com/helm/helm#install).

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
{{% /codetab %}}

{{% codetab %}}
[AWS Redis](https://aws.amazon.com/redis/)
{{% /codetab %}}

{{% codetab %}}
[GCP Cloud MemoryStore](https://cloud.google.com/memorystore/)
{{% /codetab %}}

{{% codetab %}}
[Azure Redis](https://docs.microsoft.com/azure/azure-cache-for-redis/quickstart-create-redis)
{{% /codetab %}}

{{< /tabs >}}


{{% alert title="Note" color="primary" %}}
The Dapr CLI automatically deploys a local redis instance in self hosted mode as part of the `dapr init` command.
{{% /alert %}}


## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
