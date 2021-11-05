---
type: docs
title: "Redis Streams"
linkTitle: "Redis Streams"
description: "Detailed documentation on the Redis Streams pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-redis-pubsub/"
---

## Component format

To setup Redis Streams pubsub create a component of type `pubsub.redis`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: redis-pubsub
  namespace: default
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: "KeFg23!"
  - name: consumerID
    value: "myGroup"
  - name: enableTLS
    value: "false"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| redisHost          | Y        | Connection-string for the redis host. If `"redisType"` is `"cluster"` it can be multiple hosts separated by commas or just a single host   | `localhost:6379`, `redis-master.default.svc.cluster.local:6379`
| redisPassword      | Y        | Password for Redis host. No Default. Can be `secretKeyRef` to use a secret reference  | `""`, `"KeFg23!"`
| redisUsername      | N        | Username for Redis host. Defaults to empty. Make sure your redis server version is 6 or above, and have created acl rule correctly. | `""`, `"default"`
| consumerID         | N        | The consumer group ID   | `"myGroup"`
| enableTLS          | N        | If the Redis instance supports TLS with public certificates, can be configured to be enabled or disabled. Defaults to `"false"` | `"true"`, `"false"`
| redeliverInterval  | N        | The interval between checking for pending messages to redelivery. Defaults to `"60s"`. `"0"` disables redelivery. | `"30s"`
| processingTimeout  | N        | The amount time a message must be pending before attempting to redeliver it. Defaults to `"15s"`. `"0"` disables redelivery. | `"30s"`
| queueDepth         | N        | The size of the message queue for processing. Defaults to `"100"`. | `"1000"`
| concurrency        | N        | The number of concurrent workers that are processing messages. Defaults to `"10"`. | `"15"`
| redisType        | N        | The type of redis. There are two valid values, one is `"node"` for single node mode, the other is `"cluster"` for redis cluster mode. Defaults to `"node"`. | `"cluster"`
| redisDB        | N        | Database selected after connecting to redis. If `"redisType"` is `"cluster"` this option is ignored. Defaults to `"0"`. | `"0"`
| redisMaxRetries        | N        | Maximum number of times to retry commands before giving up. Default is to not retry failed commands.  | `"5"`
| redisMinRetryInterval        | N        | Minimum backoff for redis commands between each retry. Default is `"8ms"`;  `"-1"` disables backoff. | `"8ms"`
| redisMaxRetryInterval        | N        | Maximum backoff for redis commands between each retry. Default is `"512ms"`;`"-1"` disables backoff. | `"5s"`
| dialTimeout        | N        | Dial timeout for establishing new connections. Defaults to `"5s"`.  | `"5s"`
| readTimeout        | N        | Timeout for socket reads. If reached, redis commands will fail with a timeout instead of blocking. Defaults to `"3s"`, `"-1"` for no timeout. | `"3s"`
| writeTimeout        | N        | Timeout for socket writes. If reached, redis commands will fail with a timeout instead of blocking. Defaults is readTimeout. | `"3s"`
| poolSize        | N        | Maximum number of socket connections. Default is 10 connections per every CPU as reported by runtime.NumCPU. | `"20"`
| poolTimeout        | N        | Amount of time client waits for a connection if all connections are busy before returning an error. Default is readTimeout + 1 second. | `"5s"`
| maxConnAge        | N        | Connection age at which the client retires (closes) the connection. Default is to not close aged connections. | `"30m"`
| minIdleConns        | N        | Minimum number of idle connections to keep open in order to avoid the performance degradation associated with creating new connections. Defaults to `"0"`. | `"2"`
| idleCheckFrequency        | N        | Frequency of idle checks made by idle connections reaper. Default is `"1m"`. `"-1"` disables idle connections reaper. | `"-1"`
| idleTimeout        | N        | Amount of time after which the client closes idle connections. Should be less than server's timeout. Default is `"5m"`. `"-1"` disables idle timeout check. | `"10m"`
| failover           | N         | Property to enabled failover configuration. Needs sentinalMasterName to be set. Defaults to `"false"` | `"true"`, `"false"`
| sentinelMasterName | N         | The sentinel master name. See [Redis Sentinel Documentation](https://redis.io/topics/sentinel) | `""`,  `"127.0.0.1:6379"`
| maxLenApprox        | N        | Maximum number of items inside a stream.The old entries are automatically evicted when the specified length is reached, so that the stream is left at a constant size. Defaults to unlimited. | `"10000"`

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
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})