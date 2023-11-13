---
type: docs
title: "KubeMQ"
linkTitle: "KubeMQ"
description: "Detailed documentation on the KubeMQ pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-kubemq/"
---

## Component format

To set up KubeMQ pub/sub, create a component of type `pubsub.kubemq`. See the [pub/sub broker component file]({{< ref setup-pubsub.md >}}) to learn how ConsumerID is automatically generated. Read the [How-to: Publish and Subscribe guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pub/sub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kubemq-pubsub
spec:
  type: pubsub.kubemq
  version: v1
  metadata:
    - name: address
      value: localhost:50000
    - name: store
      value: false
    - name: consumerID
      value: channel1
```

## Spec metadata fields

| Field             | Required | Details                                                                                                                     | Example                                |
|-------------------|:--------:|-----------------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| address           |    Y     | Address of the KubeMQ server                                                                                                | `"localhost:50000"`                    |
| store             |    N     | type of pubsub, true: pubsub persisted (EventsStore), false: pubsub in-memory (Events)                                      | `true` or `false` (default is `false`) |
| consumerID        |    N     | Consumer ID (consumer tag) organizes one or more consumers into a group. Consumers with the same consumer ID work as one virtual consumer; for example, a message is processed only once by one of the consumers in the group. If the `consumerID` is not provided, the Dapr runtime set it to the Dapr application ID (`appID`) value. | `"channel1"`
| clientID          |    N     | Name for client id connection                                                                                               | `sub-client-12345`                     |
| authToken         |    N     | Auth JWT token for connection Check out [KubeMQ Authentication](https://docs.kubemq.io/learn/access-control/authentication) | `ew...`                                |
| group             |    N     | Subscriber group for load balancing                                                                                         | `g1`                                   |
| disableReDelivery |    N     | Set if message should be re-delivered in case of error coming from application                                              | `true` or `false` (default is `false`) |

## Create a KubeMQ broker

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
1. Obtain KubeMQ Key by visiting [https://account.kubemq.io/auth/signup](https://account.kubemq.io/auth/signup) and register for a key.
2. Wait for an email confirmation with your Key

You can run a KubeMQ broker with Docker:

```bash
docker run -d -p 8080:8080 -p 50000:50000 -p 9090:9090 -e KUBEMQ_TOKEN=<your-key> kubemq/kubemq
```
You can then interact with the server using the client port: `localhost:50000`

{{% /codetab %}}

{{% codetab %}}
1. Obtain KubeMQ Key by visiting [https://account.kubemq.io/auth/signup](https://account.kubemq.io/auth/signup) and register for a key.
2. Wait for an email confirmation with your Key

Then Run the following kubectl commands:

```bash
kubectl apply -f https://deploy.kubemq.io/init
```

```bash
kubectl apply -f https://deploy.kubemq.io/key/<your-key>
```
{{% /codetab %}}

{{< /tabs >}}

## Install KubeMQ CLI
Go to [KubeMQ CLI](https://github.com/kubemq-io/kubemqctl/releases) and download the latest version of the CLI.

## Browse KubeMQ Dashboard

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
<!-- IGNORE_LINKS -->
Open a browser and navigate to [http://localhost:8080](http://localhost:8080)
<!-- END_IGNORE -->
{{% /codetab %}}

{{% codetab %}}
With KubeMQCTL installed, run the following command:

```bash
kubemqctl get dashboard
```
Or, with kubectl installed, run port-forward command:

```bash
kubectl port-forward svc/kubemq-cluster-api -n kubemq 8080:8080
```
{{% /codetab %}}

{{< /tabs >}}


## KubeMQ Documentation
Visit [KubeMQ Documentation](https://docs.kubemq.io/) for more information.


## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/sub building block]({{< ref pubsub >}})
