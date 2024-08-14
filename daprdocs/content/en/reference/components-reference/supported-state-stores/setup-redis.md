---
type: docs
title: "Redis"
linkTitle: "Redis"
description: Detailed information on the Redis state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-redis/"
---

## Component format

To setup Redis state store create a component of type `state.redis`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

{{% alert title="Limitations" color="warning" %}}
Before using Redis and the Transactions API, make sure you're familiar with [Redis limitations regarding transactions](https://redis.io/docs/interact/transactions/#what-about-rollbacks).
{{% /alert %}}

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: <HOST>
  - name: redisPassword # Optional.
    value: <PASSWORD>
  - name: useEntraID
    value: <bool> # Optional. Allowed: true, false.
  - name: enableTLS
    value: <bool> # Optional. Allowed: true, false.
  - name: clientCert
    value: # Optional
  - name: clientKey
    value: # Optional    
  - name: maxRetries
    value: # Optional
  - name: maxRetryBackoff
    value: # Optional
  - name: failover
    value: <bool> # Optional. Allowed: true, false.
  - name: sentinelMasterName
    value: <string> # Optional
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
  - name: ttlInSeconds
    value: <int> # Optional
  - name: queryIndexes
    value: <string> # Optional
  # Uncomment this if you wish to use Redis as a state store for actors (optional)
  #- name: actorStateStore
  #  value: "true"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}


If you wish to use Redis as an actor store, append the following to the yaml.

```yaml
  - name: actorStateStore
    value: "true"
```

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| redisHost          | Y        | Connection-string for the redis host  | `localhost:6379`, `redis-master.default.svc.cluster.local:6379`
| redisPassword      | N        | Password for Redis host. No Default. Can be `secretKeyRef` to use a secret reference  | `""`, `"KeFg23!"`
| redisUsername      | N        | Username for Redis host. Defaults to empty. Make sure your redis server version is 6 or above, and have created acl rule correctly. | `""`, `"default"`
| useEntraID | N | Implements EntraID support for Azure Cache for Redis. Before enabling this: <ul><li>The `redisHost` name must be specified in the form of `"server:port"`</li><li>TLS must be enabled</li></ul> Learn more about this setting under [Create a Redis instance > Azure Cache for Redis]({{< ref "#setup-redis" >}}) | `"true"`, `"false"` |
| enableTLS          | N         | If the Redis instance supports TLS with public certificates, can be configured to be enabled or disabled. Defaults to `"false"` | `"true"`, `"false"`
| clientCert         | N         | The content of the client certificate, used for Redis instances that require client-side certificates. Must be used with `clientKey` and `enableTLS` must be set to true. It is recommended to use a secret store as described [here]({{< ref component-secrets.md >}})   | `"----BEGIN CERTIFICATE-----\nMIIC..."` |
| clientKey          | N         | The content of the client private key, used in conjunction with `clientCert` for authentication. It is recommended to use a secret store as described [here]({{< ref component-secrets.md >}}) | `"----BEGIN PRIVATE KEY-----\nMIIE..."` |
| maxRetries         | N         | Maximum number of retries before giving up. Defaults to `3` | `5`, `10`
| maxRetryBackoff    | N         | Maximum backoff between each retry. Defaults to `2` seconds; `"-1"` disables backoff. | `3000000000`
| failover           | N         | Property to enabled failover configuration. Needs sentinelMasterName to be set. The redisHost should be the sentinel host address. See [Redis Sentinel Documentation](https://redis.io/docs/manual/sentinel/). Defaults to `"false"` | `"true"`, `"false"`
| sentinelMasterName | N         | The sentinel master name. See [Redis Sentinel Documentation](https://redis.io/docs/manual/sentinel/) | `""`,  `"127.0.0.1:6379"`
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
| idleCheckFrequency        | N        | Frequency of idle checks made by idle connections reaper. Default is `"1m"`. `"-1"` disables idle connections reaper. | `"-1"`
| idleTimeout        | N        | Amount of time after which the client closes idle connections. Should be less than server's timeout. Default is `"5m"`. `"-1"` disables idle timeout check. | `"10m"`
| ttlInSeconds       | N         | Allows specifying a default Time-to-live (TTL) in seconds that will be applied to every state store request unless TTL is explicitly defined via the [request metadata]({{< ref "state-store-ttl.md" >}}). | `600`
| queryIndexes       | N         | Indexing schemas for querying JSON objects | see [Querying JSON objects](#querying-json-objects)
| actorStateStore    | N        | Consider this state store for actors. Defaults to `"false"` | `"true"`, `"false"`

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
    helm install redis bitnami/redis
    ```

2. Run `kubectl get pods` to see the Redis containers now running in your cluster.
3. Add `redis-master:6379` as the `redisHost` in your [redis.yaml](#configuration) file. For example:
    ```yaml
        metadata:
        - name: redisHost
          value: redis-master:6379
    ```
4. Next, get the Redis password, which is slightly different depending on the OS we're using:
    - **Windows**: Run `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" > encoded.b64`, which creates a file with your encoded password. Next, run `certutil -decode encoded.b64 password.txt`, which will put your redis password in a text file called `password.txt`. Copy the password and delete the two files.

    - **Linux/MacOS**: Run `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode` and copy the outputted password.

    Add this password as the `redisPassword` value in your [redis.yaml](#configuration) file. For example:
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


## Querying JSON objects (optional)

In addition to supporting storing and querying state data as key/value pairs, the Redis state store optionally supports querying of JSON objects to meet more complex querying or filtering requirements. To enable this feature, the following steps are required:

1. The Redis store must support Redis modules and specifically both Redisearch and RedisJson. If you are deploying and running Redis then load [redisearch](https://oss.redis.com/redisearch/) and [redisjson](https://oss.redis.com/redisjson/) modules when deploying the Redis service.
``
2. Specify `queryIndexes` entry in the metadata of the component config. The value of the `queryIndexes` is a JSON array of the following format:
```json
[
  {
    "name": "<indexing name>",
    "indexes": [
      {
        "key": "<JSONPath-like syntax for selected element inside documents>",
        "type": "<value type (supported types: TEXT, NUMERIC)>",
      },
      ...
    ]
  },
  ...
]
```
3. When calling state management API, add the following metadata to the API calls:
- [Save State]({{< ref "state_api.md#save-state" >}}), [Get State]({{< ref "state_api.md#get-state" >}}), [Delete State]({{< ref "state_api.md#delete-state" >}}):
  - add `metadata.contentType=application/json` URL query parameter to HTTP API request
  - add `"contentType": "application/json"` pair to the metadata of gRPC API request
- [Query State]({{< ref "state_api.md#query-state" >}}):
  - add `metadata.contentType=application/json&metadata.queryIndexName=<indexing name>` URL query parameters to HTTP API request
  - add `"contentType" : "application/json"` and `"queryIndexName" : "<indexing name>"` pairs to the metadata of gRPC API request

Consider an example where you store documents like that:
```json
{
  "key": "1",
  "value": {
    "person": {
      "org": "Dev Ops",
      "id": 1036
    },
    "city": "Seattle",
    "state": "WA"
  }
}
```

The component config file containing corresponding indexing schema looks like that:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  initTimeout: 1m
  metadata:
  - name: redisHost
    value: "localhost:6379"
  - name: redisPassword
    value: ""
  - name: queryIndexes
    value: |
      [
        {
          "name": "orgIndx",
          "indexes": [
            {
              "key": "person.org",
              "type": "TEXT"
            },
            {
              "key": "person.id",
              "type": "NUMERIC"
            },
            {
              "key": "state",
              "type": "TEXT"
            },
            {
              "key": "city",
              "type": "TEXT"
            }
          ]
        }
      ]
```

Consecutively, you can now store, retrieve, and query these documents.

Consider the example from ["How-To: Query state"]({{< ref "howto-state-query-api.md#example-data-and-query" >}}) guide. Let's run it with Redis.


{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" "Redis Enterprise Cloud" "Alibaba Cloud" >}}

{{% codetab %}}
If you are using a self-hosted deployment of Dapr, a Redis instance without the JSON module is automatically created as a Docker container when you run `dapr init`.

Alternatively, you can create an instance of Redis by running the following command:
 ```bash
 docker run -p 6379:6379 --name redis --rm redis
 ```
 The Redis container that gets created on dapr init or via the above command, cannot be used with state store query API alone. You can run redislabs/rejson docker image on a different port(than the already installed Redis is using) to work with they query API.

> Note: `redislabs/rejson` has support only for amd64 architecture.

Use following command to create an instance of redis compatible with query API.

```bash
docker run -p 9445:9445 --name rejson --rm redislabs/rejson:2.0.6
```
{{% /codetab %}}

{{% codetab %}}
Follow instructions for [Redis deployment in Kubernetes](#setup-redis) with one extra detail.

When installing Redis Helm package, provide a configuration file that specifies container image and enables required modules:
```bash
helm install redis bitnami/redis --set image.tag=6.2 -f values.yaml
```

where `values.yaml` looks like:
```yaml
image:
  repository: redislabs/rejson
  tag: 2.0.6

master:
  extraFlags:
   - --loadmodule
   - /usr/lib/redis/modules/rejson.so
   - --loadmodule
   - /usr/lib/redis/modules/redisearch.so
```

{{% /codetab %}}

{{% codetab %}}
{{% alert title="Note" color="warning" %}}
Azure Redis managed service does not support the RedisJson module and cannot be used with query.
{{% /alert %}}

{{% /codetab %}}

{{% codetab %}}
Follow instructions for [Redis deployment in AWS](#setup-redis).
{{% alert title="Note" color="primary" %}}
For query support you need to enable RediSearch and RedisJson.
{{% /alert %}}
{{% /codetab %}}

{{% codetab %}}
{{% alert title="Note" color="warning" %}}
Memory Store does not support modules and cannot be used with query.
{{% /alert %}}
{{% /codetab %}}

{{% codetab %}}
[Redis Enterprise Cloud](https://docs.redis.com/latest/rc/)
{{% /codetab %}}

{{% codetab %}}
<!-- IGNORE_LINKS -->
[Alibaba Cloud](https://www.alibabacloud.com/product/apsaradb-for-redis)
<!-- END_IGNORE -->
{{% /codetab %}}

{{< /tabs >}}

Next is to start a Dapr application. Refer to this [component configuration file](../../../../developing-applications/building-blocks/state-management/query-api-examples/components/redis/redis.yml), which contains query indexing schemas. Make sure to modify the `redisHost` to reflect the local forwarding port which `redislabs/rejson` uses.
```bash
dapr run --app-id demo --dapr-http-port 3500 --resources-path query-api-examples/components/redis
```

Now populate the state store with the employee dataset, so you can then query it later.
```bash
curl -X POST -H "Content-Type: application/json" -d @query-api-examples/dataset.json \
  http://localhost:3500/v1.0/state/querystatestore?metadata.contentType=application/json
```

To make sure the data has been properly stored, you can retrieve a specific object
```bash
curl http://localhost:3500/v1.0/state/querystatestore/1?metadata.contentType=application/json
```

The result will be:
```json
{
  "city": "Seattle",
  "state": "WA",
  "person": {
    "org": "Dev Ops",
    "id": 1036
  }
}
```

Now, let's find all employees in the state of California and sort them by their employee ID in descending order.

This is the [query](../../../../developing-applications/building-blocks/state-management/query-api-examples/query1.json):
```json
{
    "filter": {
        "EQ": { "state": "CA" }
    },
    "sort": [
        {
            "key": "person.id",
            "order": "DESC"
        }
    ]
}
```

Execute the query with the following command:
```bash
curl -s -X POST -H "Content-Type: application/json" -d @query-api-examples/query1.json \
  'http://localhost:3500/v1.0-alpha1/state/querystatestore/query?metadata.contentType=application/json&metadata.queryIndexName=orgIndx'
```

The result will be:
```json
{
  "results": [
    {
      "key": "3",
      "data": {
        "person": {
          "org": "Finance",
          "id": 1071
        },
        "city": "Sacramento",
        "state": "CA"
      },
      "etag": "1"
    },
    {
      "key": "7",
      "data": {
        "person": {
          "org": "Dev Ops",
          "id": 1015
        },
        "city": "San Francisco",
        "state": "CA"
      },
      "etag": "1"
    },
    {
      "key": "5",
      "data": {
        "person": {
          "org": "Hardware",
          "id": 1007
        },
        "city": "Los Angeles",
        "state": "CA"
      },
      "etag": "1"
    },
    {
      "key": "9",
      "data": {
        "person": {
          "org": "Finance",
          "id": 1002
        },
        "city": "San Diego",
        "state": "CA"
      },
      "etag": "1"
    }
  ]
}
```

The query syntax and documentation is available [here]({{< ref howto-state-query-api.md >}})

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
