---
type: docs
title: "Coherence"
linkTitle: "Coherence"
description: Detailed information on the Coherence state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-coherence/"
---

## Component format

To setup Coherence state store, create a component of type `state.coherence`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.coherence
  version: v1
  metadata:
  - name: serverAddress
    value: <REPLACE-WITH-GRPC-PROXY-HOST-AND-PORT> # Required. Example: "my-cluster-grpc:1408"
  - name: tlsEnabled
    value: <REPLACE-WITH-BOOLEAN> # Optional
  - name: tlsClientCertPath
    value: <REPLACE-WITH-PATH> # Optional
  - name: tlsClientKey
    value: <REPLACE-WITH-PATH> # Optional
  - name: tlsCertsPath
    value: <REPLACE-WITH-PATH> # Optional
  - name: ignoreInvalidCerts
    value: <REPLACE-WITH-BOOLEAN> # Optional
  - name: scopeName
    value: <REPLACE-WITH-SCOPE> # Optional
  - name: requestTimeout
    value: <REPLACE-WITH-REQUEST-TIMEOUT> # Optional
  - name: nearCacheTTL
    value: <REPLACE-WITH-NEAR-CACHE-TTL> # Optional
  - name: nearCacheUnits
    value: <REPLACE-WITH-NEAR-CACHE-UNITS> # Optional
  - name: nearCacheMemory
    value: <REPLACE-WITH-NEAR-CACHE-MEMORY> # Optional
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details                                                                                                                                     | Example                                       |
|--------------------|:--------:|---------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| serverAddress      |    Y     | Comma delimited endpoints                                                                                                                   | `"my-cluster-grpc:1408"`                      |
| tlsEnabled         |    N     | Indicates if TLS should be enabled. Defaults to false                                                                                       | `"true"`                                      |
| tlsClientCertPath  |    N     | Client certificate path for Coherence. Defaults to "". Can be `secretKeyRef` to use a [secret reference]({{< ref component-secrets.md >}}). | `"-----BEGIN CERTIFICATE-----\nMIIC9TCCA..."` |
| tlsClientKey       |    N     | Client key for Coherence. Defaults to "". Can be `secretKeyRef` to use a [secret reference]({{< ref component-secrets.md >}}).              | `"-----BEGIN CERTIFICATE-----\nMIIC9TCCA..."` |
| tlsCertsPath       |    N     | Additional certificates for Coherence. Defaults to "". Can be `secretKeyRef` to use a [secret reference]({{< ref component-secrets.md >}}). | `"-----BEGIN CERTIFICATE-----\nMIIC9TCCA..."` |
| ignoreInvalidCerts |    N     | Indicates if to ignore self-signed certificates for testing only, not to be used in production. Defaults to false                           | `"false"`                                     |
| scopeName          |    N     | A scope name to use for the internal cache. Defaults to ""                                                                                  | `"my-scope"`                                  |
| requestTimeout     |    N     | ATimeout for calls to the cluster Defaults to "30s"                                                                                         | `"15s"`                                       |
| nearCacheTTL       |    N     | If non-zero a near cache is used and the TTL of the near cache is this value. Defaults to 0s                                                | `"60s"`                                       |
| nearCacheUnits     |    N     | If non-zero a near cache is used and the maximum size of the near cache is this value in units. Defaults to 0                               | `"1000"`                                      |
| nearCacheMemory    |    N     | If non-zero a near cache is used and the maximum size of the near cache is this value in bytes. Defaults to 0                               | `"4096"`                                      |

### About Using Near Cache TTL

The Coherence state store allows you to specify a near cache to cache frequently accessed data when using the DAPR client.
When you access data using `Get(ctx context.Context, req *GetRequest)`, returned entries are stored in the near cache and 
subsequent data access for keys in the near cache is almost instant, where without a near cache each `Get()` operation results in a network call.

When using the near cache option, Coherence automatically adds a MapListener to the internal cache which listens on all cache events and updates or invalidates entries in the near cache that have been changed or removed on the server.

To manage the amount of memory used by the near cache, the following options are supported when creating one:

- nearCacheTTL – objects expired after time in near cache, for example 5 minutes
- nearCacheUnits – maximum number of cache entries in the near cache
- nearCacheMemory – maximum amount of memory used by cache entries

You can specify either High-Units or Memory and in either case, optionally, a TTL.

The minimum expiry time for a near cache entry is 1/4 second. This is to ensure that expiry of elements is as 
efficient as possible. You will receive an error if you try to set the TTL to a lower value.

## Setup Coherence

{{< tabpane text=true >}}

{{% tab header="Self-Hosted" %}}
Run Coherence locally using Docker:

```
docker run -d -p 1408:1408 -p 30000:30000 ghcr.io/oracle/coherence-ce:25.03.1
```

You can then interact with the server using `localhost:1408`.
{{% /tab %}}

{{% tab header="Kubernetes" %}}
The easiest way to install Coherence on Kubernetes is by using the [Coherence Operator](https://docs.coherence.community/coherence-operator/docs/latest/docs/about/03_quickstart):

**Install the Operator:**

```
kubectl apply -f https://github.com/oracle/coherence-operator/releases/download/v3.5.2/coherence-operator.yaml
```

> Note: Change v3.5.2 to the latest release.

This installs the Coherence operator into the `coherence` namespace.

**Create a Coherence Cluster yaml my-cluster.yaml**

```yaml
apiVersion: coherence.oracle.com/v1
kind: Coherence
metadata:
  name: my-cluster
spec:
  coherence:
    management:
      enabled: true
  ports:
    - name: management
    - name: grpc
      port: 1408
```

**Apply the yaml**

```bash
kubectl apply -f my-cluster.yaml
```

To interact with Coherence, find the service with: `kubectl get svc` and look for service named '*grpc'.

```bash
NAME                    TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)                                               AGE
kubernetes              ClusterIP   10.96.0.1      <none>        443/TCP                                               9m
my-cluster-grpc         ClusterIP   10.96.225.43   <none>        1408/TCP                                              7m3s
my-cluster-management   ClusterIP   10.96.41.6     <none>        30000/TCP                                             7m3s
my-cluster-sts          ClusterIP   None           <none>        7/TCP,7575/TCP,7574/TCP,6676/TCP,30000/TCP,1408/TCP   7m3s
my-cluster-wka          ClusterIP   None           <none>        7/TCP,7575/TCP,7574/TCP,6676/TCP                      7m3s
```

For example, if installing using the example above, the Coherence host address would be:

`my-cluster-grpc`
{{% /tab %}}

{{< /tabpane >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
- [Coherence CE on GitHub](https://github.com/oracle/coherence)
- [Coherence Community - All things Coherence](https://coherence.community/)
