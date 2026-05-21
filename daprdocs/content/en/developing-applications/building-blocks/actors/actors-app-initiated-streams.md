---
type: docs
title: "Actor app-initiated gRPC event streams (Alpha)"
linkTitle: "App-initiated streams (Alpha)"
weight: 55
description: "Receive actor callbacks over an app-initiated gRPC stream without exposing a server port"
---

{{% alert title="Alpha" color="warning" %}}
The `SubscribeActorEventsAlpha1` API is in **alpha**. The API shape may change in a future release. Do not use it in production workloads without accepting that risk.
{{% /alert %}}

## Overview

By default, Dapr delivers actor callbacks — method invocations, reminders, timers, and deactivations — by calling **inbound** HTTP or gRPC endpoints on the application. This requires each actor-hosting pod to expose a server port that the Dapr sidecar can reach.

Starting with Dapr v1.18, actor hosts can instead open a **single bidirectional gRPC stream from the app to the sidecar** (`SubscribeActorEventsAlpha1`) and receive all four callback types over that one connection. The app is the gRPC _client_; it dials daprd, opens the stream, and waits for callbacks to arrive. No inbound port is required.

This pattern closes the long-standing feature request [dapr/dapr#927](https://github.com/dapr/dapr/issues/927) and aligns actor callback delivery with how Dapr already handles:

- Pub/sub streaming subscriptions (`SubscribeTopicEventsAlpha1`)
- Configuration watch streams
- Scheduler job streams

## Why app-initiated streams?

| | Traditional callbacks | App-initiated stream |
|---|---|---|
| **Connection direction** | sidecar → app | app → sidecar |
| **App server port required** | Yes | No |
| **NetworkPolicy / firewall** | Must allow sidecar→app inbound | Only app→sidecar outbound needed |
| **Callback types** | Separate endpoints per type | All four types on one stream |
| **SDK support** | All SDKs | SDKs adding support (see below) |
| **Stability** | Stable | Alpha (v1.18+) |

The app-initiated approach is especially useful in environments where:

- NetworkPolicies restrict inbound traffic to application pods.
- Actors run in serverless or restricted-networking environments.
- You want a single connection-management surface instead of per-callback routes.

## How it works

The protocol follows a request–response pairing over a bidirectional gRPC stream:

1. **App opens the stream.** The app calls `SubscribeActorEventsAlpha1` on the Dapr gRPC service and sends an initial registration message (`SubscribeActorEventsRequestInitialAlpha1`) listing the actor types it hosts, together with optional runtime configuration overrides (idle timeout, drain settings, reentrancy).

2. **Dapr acknowledges registration.** daprd responds with a `SubscribeActorEventsResponseInitialAlpha1` on the stream. An empty message body signals success; errors surface as a gRPC stream error.

3. **Dapr sends callbacks.** Whenever an actor method is invoked, a reminder or timer fires, or an actor is deactivated, daprd sends a `SubscribeActorEventsResponseAlpha1` message down the stream. Each message carries a unique correlation `id`.

4. **App responds.** The app processes the callback and sends back a `SubscribeActorEventsRequestAlpha1` message containing the matching `id`. The response type determines the action:

   | Callback received | App sends back |
   |---|---|
   | `invoke_request` (method call) | `invoke_response` with response payload |
   | `reminder_request` | `reminder_response` (optionally `cancel: true` to stop the reminder) |
   | `timer_request` | `timer_response` (optionally `cancel: true` to stop the timer) |
   | `deactivate_request` | `deactivate_response` (ack only, no payload) |

5. **Error signaling.** If the app cannot handle a callback (for example, the actor method does not exist), it sends a `request_failed` message with the originating `id`, a gRPC status code, and an optional message. daprd maps `codes.NotFound` to a permanent non-retryable failure.

### Reconnection and rolling restarts

Dapr supports multiple concurrent streams from the same app process. This enables zero-downtime rolling restarts:

- When a new pod opens a stream, daprd routes all **new** callbacks to the newest connection.
- The **older** connection continues to receive responses for callbacks it already sent; it drains naturally.
- Once all in-flight work on an older connection completes, that connection can be closed safely.

Apps should reconnect with exponential back-off if the stream is interrupted.

## NetworkPolicy and firewall considerations

Because the app **initiates** the connection, the traffic direction is:

```
app pod → daprd sidecar (gRPC port, default 50001)
```

In environments with restrictive NetworkPolicies, this means you no longer need a rule that allows the sidecar to initiate inbound connections to the app pod. However, you do need egress from the app pod to the sidecar's gRPC port.

{{% alert title="Operator note" color="primary" %}}
If you previously locked down actor-hosting pods by denying all inbound traffic from the sidecar, you can remove that inbound rule for pods that use `SubscribeActorEventsAlpha1`. Keep the rule in place if the same pods also use traditional HTTP/gRPC actor callbacks (the two modes can coexist during migration).

The daprd gRPC port is configurable via the `dapr.io/grpc-port` annotation (default: `50001`). Ensure egress from app pods to that port on `localhost` / the sidecar is permitted.
{{% /alert %}}

### Example NetworkPolicy (Kubernetes)

The following policy allows app pods with the label `app: my-actor-service` to reach the sidecar gRPC port while denying all other inbound traffic to the app pod:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: actor-app-initiated-stream
spec:
  podSelector:
    matchLabels:
      app: my-actor-service
  policyTypes:
    - Ingress
    - Egress
  ingress: []  # no inbound rules required for app-initiated streams
  egress:
    - ports:
        - protocol: TCP
          port: 50001   # daprd gRPC port (adjust if changed via annotation)
```

## SDK support

SDK-level support for `SubscribeActorEventsAlpha1` is being added in the v1.18 SDK releases. Refer to the documentation for each SDK:

- [.NET SDK actors]({{% ref "dotnet-actors" %}})
- [Java SDK actors]({{% ref "java#actors" %}})
- [Python SDK actors]({{% ref "python-actor" %}})
- [Go SDK actors]({{% ref "go-sdk-service" %}})

Until SDK support is complete, the API is accessible directly via the generated gRPC client. See the [how-to guide]({{% ref "howto-actors-app-initiated-streams" %}}) for a raw gRPC example.

## Related links

- [How-to: Use actor app-initiated gRPC streams]({{% ref "howto-actors-app-initiated-streams" %}})
- [Actor API reference — SubscribeActorEventsAlpha1]({{% ref "actors_api#subscribeactoreventsalpha1-grpc" %}})
- [Actors overview]({{% ref "actors-overview" %}})
- [Actor runtime configuration]({{% ref "actors-runtime-config" %}})
- [Runtime PR dapr/dapr#9812](https://github.com/dapr/dapr/pull/9812)
