---
type: docs
title: "Hazelcast"
linkTitle: "Hazelcast"
description: "Detailed documentation on the Hazelcast pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-hazelcast/"
---

## Component format
To setup hazelcast pubsub create a component of type `pubsub.hazelcast`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: hazelcast-pubsub
  namespace: default
spec:
  type: pubsub.hazelcast
  version: v1
  metadata:
  - name: hazelcastServers
    value: "hazelcast:3000,hazelcast2:3000"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| connectionString    | Y  | A comma delimited string of servers. Example: "hazelcast:3000,hazelcast2:3000"  | `"hazelcast:3000,hazelcast2:3000"`
| backOffMaxRetries   | N  | The maximum number of retries to process the message before returning an error. Defaults to `"0"` which means the component will not retry processing the message. `"-1"` will retry indefinitely until the message is processed or the application is shutdown. And positive number is treated as the maximum retry count. The component will wait 5 seconds between retries. | `"3"` |


## Create a Hazelcast instance

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
You can run Hazelcast locally using Docker:

```
docker run -e JAVA_OPTS="-Dhazelcast.local.publicAddress=127.0.0.1:5701" -p 5701:5701 hazelcast/hazelcast
```

You can then interact with the server using the `127.0.0.1:5701`.
{{% /codetab %}}

{{% codetab %}}
The easiest way to install Hazelcast on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/hazelcast).
{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})