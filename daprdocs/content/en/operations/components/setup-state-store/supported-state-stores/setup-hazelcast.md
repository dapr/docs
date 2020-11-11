---
type: docs
title: "Hazelcast"
linkTitle: "Hazelcast"
description: Detailed information on the Hazelcast state store component
---

## Setup a Hazelcast state store

{{< tabs "Self-Hosted" "Kubernetes" >}}

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
  type: state.hazelcast
  version: v1
  metadata:
  - name: hazelcastServers
    value: <REPLACE-WITH-HOSTS> # Required. A comma delimited string of servers. Example: "hazelcast:3000,hazelcast2:3000"
  - name: hazelcastMap
    value: <REPLACE-WITH-MAP> # Required. Hazelcast map configuration.
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Apply the configuration

### In Kubernetes

To apply the Hazelcast state store to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f hazelcast.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
