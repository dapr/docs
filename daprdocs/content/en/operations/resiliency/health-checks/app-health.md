---
type: docs
title: "App health checks"
linkTitle: "App health checks"
weight: 100
description: Reacting to apps' health status changes
---

The app health checks feature allows probing for the health of your application and reacting to status changes.

Applications can become unresponsive for a variety of reasons. For example, your application:
- Could be too busy to accept new work;
- Could have crashed; or 
- Could be in a deadlock state. 

Sometimes the condition can be transitory, for example:
- If the app is just busy and will resume accepting new work eventually
- If the application is being restarted for whatever reason and is in its initialization phase

App health checks are disabled by default. Once you enable app health checks, the Dapr runtime (sidecar) periodically polls your application via HTTP or gRPC calls. When it detects a failure in the app's health, Dapr stops accepting new work on behalf of the application by:

- Unsubscribing from all pub/sub subscriptions
- Stopping all input bindings
- Short-circuiting all service-invocation requests, which terminate in the Dapr runtime and are not forwarded to the application

These changes are meant to be temporary, and Dapr resumes normal operations once it detects that the application is responsive again.

<img src="/images/observability-app-health.webp" width="800" alt="Diagram showing the app health feature. Running Dapr with app health enabled causes Dapr to periodically probe the app for its health.">

## App health checks vs platform-level health checks

App health checks in Dapr are meant to be complementary to, and not replace, any platform-level health checks, like [liveness probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) when running on Kubernetes.

Platform-level health checks (or liveness probes) generally ensure that the application is running, and cause the platform to restart the application in case of failures.  

Unlike platform-level health checks, Dapr's app health checks focus on pausing work to an application that is currently unable to accept it, but is expected to be able to resume accepting work *eventually*. Goals include:

- Not bringing more load to an application that is already overloaded.
- Do the "polite" thing by not taking messages from queues, bindings, or pub/sub brokers when Dapr knows the application won't be able to process them.

In this regard, Dapr's app health checks are "softer", waiting for an application to be able to process work, rather than terminating the running process in a "hard" way.

{{% alert title="Note" color="primary" %}}
For Kubernetes, a failing app health check won't remove a pod from service discovery: this remains the responsibility of the Kubernetes liveness probe, _not_ Dapr.
{{% /alert %}}

## Configuring app health checks

App health checks are disabled by default, but can be enabled with either:

- The `--enable-app-health-check` CLI flag; or
- The `dapr.io/enable-app-health-check: true` annotation when running on Kubernetes.

Adding this flag is both necessary and sufficient to enable app health checks with the default options.

The full list of options are listed in this table:

| CLI flags                     | Kubernetes deployment annotation    | Description | Default value |
| ----------------------------- | ----------------------------------- | ----------- | ------------- |
| `--enable-app-health-check`   | `dapr.io/enable-app-health-check`   | Boolean that enables the health checks | Disabled  |
| [`--app-health-check-path`]({{< ref "app-health.md#health-check-paths" >}})     | `dapr.io/app-health-check-path`     | Path that Dapr invokes for health probes when the app channel is HTTP (this value is ignored if the app channel is using gRPC) | `/healthz` |
| [`--app-health-probe-interval`]({{< ref "app-health.md#intervals-timeouts-and-thresholds" >}}) | `dapr.io/app-health-probe-interval` | Number of *seconds* between each health probe | `5` |
| [`--app-health-probe-timeout`]({{< ref "app-health.md#intervals-timeouts-and-thresholds" >}})  | `dapr.io/app-health-probe-timeout`  | Timeout in *milliseconds* for health probe requests | `500` |
| [`--app-health-threshold`]({{< ref "app-health.md#intervals-timeouts-and-thresholds" >}})      | `dapr.io/app-health-threshold`     | Max number of consecutive failures before the app is considered unhealthy | `3` |

> See the [full Dapr arguments and annotations reference]({{< ref arguments-annotations-overview >}}) for all options and how to enable them.

Additionally, app health checks are impacted by the protocol used for the app channel, which is configured with the following flag or annotation:

| CLI flag                     | Kubernetes deployment annotation    | Description | Default value |
| ----------------------------- | ----------------------------------- | ----------- | ------------- |
| [`--app-protocol`]({{< ref "app-health.md#health-check-paths" >}})   | `dapr.io/app-protocol`   | Protocol used for the app channel. supported values are `http`, `grpc`, `https`, `grpcs`, and `h2c` (HTTP/2 Cleartext). | `http`  |

{{% alert title="Note" color="primary" %}}
A low app health probe timeout value can classify an application as unhealthy if it experiences a sudden high load, causing the response time to degrade. If this happens, increase the `dapr.io/app-health-probe-timeout` value.
{{% /alert %}}

### Health check paths

#### HTTP
When using HTTP (including `http`, `https`, and `h2c`) for `app-protocol`, Dapr performs health probes by making an HTTP call to the path specified in `app-health-check-path`, which is `/health` by default.  

For your app to be considered healthy, the response must have an HTTP status code in the 200-299 range. Any other status code is considered a failure. Dapr is only concerned with the status code of the response, and ignores any response header or body.

#### gRPC
When using gRPC for the app channel (`app-protocol` set to `grpc` or `grpcs`), Dapr invokes the method `/dapr.proto.runtime.v1.AppCallbackHealthCheck/HealthCheck` in your application. Most likely, you will use a Dapr SDK to implement the handler for this method.

While responding to a health probe request, your app *may* decide to perform additional internal health checks to determine if it's ready to process work from the Dapr runtime. However, this is not required; it's a choice that depends on your application's needs.

### Intervals, timeouts, and thresholds

#### Intervals
By default, when app health checks are enabled, Dapr probes your application every 5 seconds. You can configure the interval, in seconds, with `app-health-probe-interval`. These probes happen regularly, regardless of whether your application is healthy or not.

#### Timeouts
When the Dapr runtime (sidecar) is initially started, Dapr waits for a successful health probe before considering the app healthy. This means that pub/sub subscriptions, input bindings, and service invocation requests won't be enabled for your application until this first health check is complete and successful.

Health probe requests are considered successful if the application sends a successful response (as explained above) within the timeout configured in `app-health-probe-timeout`. The default value is 500, corresponding to 500 milliseconds (half a second).

#### Thresholds
Before Dapr considers an app to have entered an unhealthy state, it will wait for `app-health-threshold` consecutive failures, whose default value is 3. This default value means that your application must fail health probes 3 times *in a row* to be considered unhealthy.  

If you set the threshold to 1, any failure causes Dapr to assume your app is unhealthy and will stop delivering work to it.  

A threshold greater than 1 can help exclude transient failures due to external circumstances. The right value for your application depends on your requirements.

Thresholds only apply to failures. A single successful response is enough for Dapr to consider your app to be healthy and resume normal operations.

## Example

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}

Use the CLI flags with the `dapr run` command to enable app health checks:

```sh
dapr run \
  --app-id my-app \
  --app-port 7001 \
  --app-protocol http \
  --enable-app-health-check \
  --app-health-check-path=/healthz \
  --app-health-probe-interval 3 \
  --app-health-probe-timeout 200 \
  --app-health-threshold 2 \
  -- \
    <command to execute>
```

{{% /codetab %}}

{{% codetab %}}

To enable app health checks in Kubernetes, add the relevant annotations to your Deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  template:
    metadata:
      labels:
        app: my-app
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "my-app"
        dapr.io/app-port: "7001"
        dapr.io/app-protocol: "http"
        dapr.io/enable-app-health-check: "true"
        dapr.io/app-health-check-path: "/healthz"
        dapr.io/app-health-probe-interval: "3"
        dapr.io/app-health-probe-timeout: "200"
        dapr.io/app-health-threshold: "2"
```

{{% /codetab %}}

{{< /tabs >}}

## Demo

Watch this video for an [overview of using app health checks](https://youtu.be/srczBuOsAkI?t=533):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/srczBuOsAkI?start=533" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
