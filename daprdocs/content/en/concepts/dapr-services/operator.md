---
type: docs
title: "Dapr Operator control plane service overview"
linkTitle: "Operator"
description: "Overview of the Dapr operator service"
---

When running Dapr in [Kubernetes mode]({{< ref kubernetes >}}), a pod running the Dapr Operator service manages [Dapr component]({{< ref components >}}) updates and provides Kubernetes services endpoints for Dapr.

## Running the operator service

The operator service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{< ref kubernetes >}}).

## Additional configuration options

The operator service includes additional configuration options.

### Injector watchdog

The operator service includes an _injector watchdog_ feature which periodically polls all pods running in your Kubernetes cluster and confirms that the Dapr sidecar is injected in those which have the `dapr.io/enabled=true` annotation. It is primarily meant to address situations where the [Injector service]({{< ref sidecar-injector >}}) did not successfully inject the sidecar (the `daprd` container) into pods.


The injector watchdog can be useful in a few situations, including:

- Recovering from a Kubernetes cluster completely stopped. When a cluster is completely stopped and then restarted (including in the case of a total cluster failure), pods are restarted in a random order. If your application is restarted before the Dapr control plane (specifically the Injector service) is ready, the Dapr sidecar may not be injected into your application's pods, causing your application to behave unexpectedly.

- Addressing potential random failures with the sidecar injector, such as transient failures within the Injector service.


If the watchdog detects a pod that does not have a sidecar when it should have had one, it deletes it. Kubernetes will then re-create the pod, invoking the Dapr sidecar injector again.

The injector watchdog feature is **disabled by default**.

You can enable it by passing the `--watch-interval` flag to the `operator` command, which can take one of the following values:


- `--watch-interval=0`: disables the injector watchdog (default value if the flag is omitted).
- `--watch-interval=<interval>`: the injector watchdog is enabled and polls all pods at the given interval; the value for the interval is a string that includes the unit. For example: `--watch-interval=10s` (every 10 seconds) or `--watch-interval=2m` (every 2 minutes).
- `--watch-interval=once`: the injector watchdog runs only once when the operator service is started.

If you're using Helm, you can configure the injector watchdog with the [`dapr_operator.watchInterval` option](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md#dapr-operator-options), which has the same values as the command line flags.


> The injector watchdog is safe to use when the operator service is running in HA (High Availability) mode with more than one replica. In this case, Kubernetes automatically elects a "leader" instance which is the only one that runs the injector watchdog service.  

> However, when in HA mode, if you configure the injector watchdog to run "once", the watchdog polling is actually started every time an instance of the operator service is elected as leader. This means that, should the leader of the operator service crash and a new leader be elected, that would trigger the injector watchdog again.

Watch this video for an overview of the injector watchdog:

<div class="embed-responsive embed-responsive-16by9">
<iframe width="360" height="315" src="https://www.youtube-nocookie.com/embed/ecFvpp24lpo?start=1848" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
