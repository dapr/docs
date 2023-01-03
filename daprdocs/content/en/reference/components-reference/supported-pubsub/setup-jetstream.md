---
type: docs
title: "JetStream"
linkTitle: "JetStream"
description: "Detailed documentation on the NATS JetStream component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-jetstream/"
---

## Component format
To setup JetStream pubsub create a component of type `pubsub.jetstream`. See
[this guide]({{< ref
"howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to
create and apply a pubsub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: jetstream-pubsub
spec:
  type: pubsub.jetstream
  version: v1
  metadata:
  - name: natsURL
    value: "nats://localhost:4222"
  - name: jwt # Optional. Used for decentralized JWT authentication.
    value: "eyJhbGciOiJ...6yJV_adQssw5c"
  - name: seedKey # Optional. Used for decentralized JWT authentication.
    value: "SUACS34K232O...5Z3POU7BNIL4Y"
  - name: tls_client_cert # Optional. Used for TLS Client authentication.
    value: "/path/to/tls.crt"
  - name: tls_client_key # Optional. Used for TLS Client authentication.
    value: "/path/to/tls.key"
  - name: token # Optional. Used for token based authentication.
    value: "my-token"
  - name: name
    value: "my-conn-name"
  - name: streamName
    value: "my-stream"
  - name: durableName 
    value: "my-durable"
  - name: queueGroupName
    value: "my-queue"
  - name: startSequence
    value: 1
  - name: startTime # In Unix format
    value: 1630349391
  - name: deliverAll
    value: false
  - name: flowControl
    value: false
  - name: ackWait
    value: 10s
  - name: maxDeliver
    value: 5
  - name: backOff
    value: "50ms, 1s, 10s"
  - name: maxAckPending
    value: 5000
  - name: replicas
    value: 1
  - name: memoryStorage
    value: false
  - name: rateLimit
    value: 1024
  - name: hearbeat
    value: 15s
  - name: ackPolicy
    value: explicit
```

## Spec metadata fields

| Field           | Required | Details                                    | Example                          |
| --------------- | :------: | ------------------------------------------ | -------------------------------- |
| natsURL         |    Y     | NATS server address URL                    | `"nats://localhost:4222"`        |
| jwt             |    N     | NATS decentralized authentication JWT      | `"eyJhbGciOiJ...6yJV_adQssw5c"`  |
| seedKey         |    N     | NATS decentralized authentication seed key | `"SUACS34K232O...5Z3POU7BNIL4Y"` |
| tls_client_cert |    N     | NATS TLS Client Authentication Certificate | `"/path/to/tls.crt"`             |
| tls_client_key  |    N     | NATS TLS Client Authentication Key         | `"/path/to/tls.key"`             |
| token           |    N     | [NATS token based authentication]          | `"my-token"`                     |
| name            |    N     | NATS connection name                       | `"my-conn-name"`                 |
| streamName      |    N     | Name of the JetStream Stream to bind to    | `"my-stream"`                    |
| durableName     |    N     | [Durable name]                             | `"my-durable"`                   |
| queueGroupName  |    N     | Queue group name                           | `"my-queue"`                     |
| startSequence   |    N     | [Start Sequence]                           | `1`                              |
| startTime       |    N     | [Start Time] in Unix format                | `1630349391`                     |
| deliverAll      |    N     | Set deliver all as [Replay Policy]         | `true`                           |
| flowControl     |    N     | [Flow Control]                             | `true`                           |
| ackWait         |    N     | [Ack Wait]                                 | `10s`                            |
| maxDeliver      |    N     | [Max Deliver]                              | `15`                             |
| backOff         |    N     | [BackOff]                                  | `"50ms, 1s, 5s, 10s"`            |
| maxAckPending   |    N     | [Max Ack Pending]                          | `5000`                           |
| replicas        |    N     | [Replicas]                                 | `3`                              |
| memoryStorage   |    N     | [Memory Storage]                           | `false`                          |
| rateLimit       |    N     | [Rate Limit]                               | `1024`                           |
| hearbeat        |    N     | [Hearbeat]                                 | `10s`                            |
| ackPolicy       |    N     | [Ack Policy]                               | `explicit`                       |

## Create a NATS server

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
You can run a NATS Server with JetStream enabled locally using Docker:

```bash
docker run -d -p 4222:4222 nats:latest -js
```

You can then interact with the server using the client port: `localhost:4222`.
{{% /codetab %}}

{{% codetab %}}
Install NATS JetStream on Kubernetes by using the [helm](https://github.com/nats-io/k8s/tree/main/helm/charts/nats#jetstream):

```bash
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm install --set nats.jetstream.enabled=true my-nats nats/nats
```

This installs a single NATS server into the `default` namespace. To interact with NATS, find the service with:

```bash
kubectl get svc my-nats
```

For more information on helm chart settings, see the [Helm chart documentation](https://helm.sh/docs/helm/helm_install/).

{{% /codetab %}}

{{< /tabs >}}

## Create JetStream

It is essential to create a NATS JetStream for a specific subject. For example, for a NATS server running locally use:

```bash
nats -s localhost:4222 stream add myStream --subjects mySubject
```

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})
- [JetStream Documentation](https://docs.nats.io/nats-concepts/jetstream)
- [NATS CLI](https://github.com/nats-io/natscli)


[Durable Name]: https://docs.nats.io/jetstream/concepts/consumers#durable-name
[Start Sequence]: https://docs.nats.io/jetstream/concepts/consumers#deliverbystartsequence
[Start Time]: https://docs.nats.io/jetstream/concepts/consumers#deliverbystarttime
[Replay Policy]: https://docs.nats.io/jetstream/concepts/consumers#replaypolicy
[Flow Control]: https://docs.nats.io/jetstream/concepts/consumers#flowcontrol
[Ack Wait]: https://docs.nats.io/jetstream/concepts/consumers#ackwait
[Max Deliver]: https://docs.nats.io/jetstream/concepts/consumers#maxdeliver
[BackOff]: https://docs.nats.io/jetstream/concepts/consumers#backoff
[Max Ack Pending]: https://docs.nats.io/jetstream/concepts/consumers#maxackpending
[Replicas]: https://docs.nats.io/jetstream/concepts/consumers#replicas
[Memory Storage]: https://docs.nats.io/jetstream/concepts/consumers#memorystorage
[Rate Limit]: https://docs.nats.io/jetstream/concepts/consumers#ratelimit
[Hearbeat]: https://docs.nats.io/jetstream/concepts/consumers#hearbeat
[Ack Policy]: https://docs.nats.io/nats-concepts/jetstream/consumers#ackpolicy
[Decentralized JWT Authentication/Authorization]: https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/jwt
[NATS token based authentication]: https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/tokens
