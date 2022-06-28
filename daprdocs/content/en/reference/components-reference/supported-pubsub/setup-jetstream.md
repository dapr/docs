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
  namespace: default
spec:
  type: pubsub.jetstream
  version: v1
  metadata:
  - name: natsURL
    value: "nats://localhost:4222"
  - name: jwt
    value: "eyJhbGciOiJ...6yJV_adQssw5c" # Optional. Used for decentralized JWT authentication
  - name: seedKey
    value: "SUACS34K232O...5Z3POU7BNIL4Y" # Optional. Used for decentralized JWT authentication
  - name: name
    value: "connection name"
  - name: durableName
    value: "consumer durable name"
  - name: queueGroupName
    value: "queue group name"
  - name: startSequence
    value: 1
  - name: startTime # in Unix format
    value: 1630349391
  - name: deliverAll
    value: false
  - name: flowControl
    value: false
```

## Spec metadata fields

| Field          | Required | Details | Example |
|----------------|:--------:|---------|---------|
| natsURL        |        Y | NATS server address URL   | "`nats://localhost:4222`"|
| jwt            |        N | NATS decentralized authentication JWT | "`eyJhbGciOiJ...6yJV_adQssw5c`"|
| seedKey        |        N | NATS decentralized authentication seed key | "`SUACS34K232O...5Z3POU7BNIL4Y`"|
| name           |        N | NATS connection name | `"my-conn-name"`|
| durableName    |        N | [Durable name] | `"my-durable"` |
| queueGroupName |        N | Queue group name | `"my-queue"` |
| startSequence  |        N | [Start Sequence] | `1` |
| startTime      |        N | [Start Time] in Unix format | `1630349391` |
| deliverAll     |        N | Set deliver all as [Replay Policy] | `true` |
| flowControl    |        N | [Flow Control] | `true` |

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
helm install my-nats nats/nats
```

This installs a single NATS server into the `default` namespace. To interact with NATS, find the service with: `kubectl get svc my-nats`.

Run `docker ps` and verify `my-nats` is running:

```
CONTAINER ID   IMAGE               COMMAND                  CREATED          STATUS                    PORTS           NAMES
e0d1b07595d7   9938a89f7aa8        "/prometheus-nats-ex…"   12 minutes ago   Up 12 minutes
                  k8s_metrics_my-nats-0_default_32375dda-9b95-4644-b4c8-55518156b0e4_2
acc025ff5ac1   b08752b7d37f        "nats-server-config-…"   12 minutes ago   Up 12 minutes
                  k8s_reloader_my-nats-0_default_32375dda-9b95-4644-b4c8-55518156b0e4_2
3ff50ac19984   2b71a26d5083        "tail -f /dev/null"      12 minutes ago   Up 12 minutes
                  k8s_nats-box_my-nats-box-75bb48bdbf-k4q2f_default_afc76d65-4a32-42b3-bfe1-4ea8a4d4d34c_2
da03824b1d05   f48fd9739aa3        "nats-server --confi…"   12 minutes ago   Up 12 minutes
                  k8s_nats_my-nats-0_default_32375dda-9b95-4644-b4c8-55518156b0e4_2
```

Open the `nats_my-nats` cluster.

```bash
docker exec -it da03824b1d052a0dc9270c6d6c3e4ce854726086e3df216c2bf5d3adaaf12b82 /bin/sh
```

From within the `my-nats` cluster, enable JetStream from the command line:

```bash
nats-server -js
```

> **JetStream flags:** You can enable JetStream using the `-js, --jetstream` flags via the command line. [Learn  more about configuring JetStream for a nats-server](https://docs.nats.io/running-a-nats-service/configuration/resource_management#configuring-jetstream).

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
[Decentralized JWT Authentication/Authorization]: https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/jwt