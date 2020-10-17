---
type: docs
title: "Hazelcast"
linkTitle: "Hazelcast"
description: "Detailed documentation on the Hazelcast pubsub component"
---

## Setup Hazelcast

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

## Create a Dapr component

The next step is to create a Dapr component for Hazelcast.

Create the following YAML file named `hazelcast.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: pubsub.hazelcast
  metadata:
  - name: hazelcastServers
    value: <REPLACE-WITH-HOSTS> # Required. A comma delimited string of servers. Example: "hazelcast:3000,hazelcast2:3000"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Apply the configuration

Visit [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components.

## Related links
- [Pub/Sub building block]({{< ref pubsub >}})