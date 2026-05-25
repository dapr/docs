---
type: docs
title: "Updating resources"
linkTitle: "Updating resources"
weight: 300
description: "Updating deployed components, configurations, resiliency, and HTTPEndpoints used by applications"
---

Updates to deployed resources (Components, Subscriptions, Configurations, Resiliency, WorkflowAccessPolicies and HTTPEndpoints) are picked up automatically by the sidecar via [hot reloading](#hot-reloading). Hot reloading is enabled by default; to opt out, disable the `HotReload` feature in the [Dapr application configuration]({{% ref "preview-features.md" %}}).
When hot reloading is disabled, the Dapr sidecar needs to be restarted in order to pick up the latest version of the resource. How this is done depends on the hosting environment.

### Kubernetes

When hot reloading is disabled and running in Kubernetes, the process of updating a component involves two steps:

1. Apply the new component YAML to the desired namespace
1. Perform a [rollout restart operation](https://kubernetes.io/docs/reference/kubectl/cheatsheet/#updating-resources) on your deployments to pick up the latest component

### Self Hosted

When hot reloading is disabled, the process of updating a component involves a single step of stopping and restarting the `daprd` process to pick up the latest component.

> **Note:** On POSIX-compatible systems (Linux, macOS), you can also send a `SIGHUP` signal to the `daprd` process to reload the runtime in-process without fully restarting it. See [Reloading configuration with SIGHUP]({{% ref "configuration-overview.md#reloading-configuration-with-sighup" %}}) for more information.

## Hot Reloading

Dapr "hot reloads" resources whereby updates are picked up automatically without the need to manually restart the Dapr sidecar process or Kubernetes pod.

### Components and Subscriptions

Creating, updating, or deleting a Component or Subscription manifest is reflected in the Dapr sidecar during runtime.

{{% alert title="Updating Components" color="warning" %}}
When a component is updated it is first closed, and then re-initialized using the new configuration.
This causes the component to be unavailable for a short period of time during this process.
{{% /alert %}}

{{% alert title="Initialization Errors" color="warning" %}}
If the initialization processes errors when a component is created or updated through hot reloading, the Dapr sidecar respects the component field [`spec.ignoreErrors`]({{% ref component-schema.md%}}).
That is, the behaviour is the same as when the sidecar loads components on boot.
- `spec.ignoreErrors=false` (*default*): the sidecar gracefully shuts down.
- `spec.ignoreErrors=true`: the sidecar continues to run with neither the old or new component configuration registered.
{{% /alert %}}

All components are supported for hot reloading except for the following types.
Any create, update, or deletion of these component types is ignored by the sidecar with a restart required to pick up changes.
- [Actor State Stores]({{% ref "state_api.md#configuring-state-store-for-actors" %}})
- [Workflow Backends]({{% ref "workflow-architecture.md#workflow-backend" %}})

### Configurations, Resiliency, and HTTPEndpoints

The Dapr sidecar also reloads [Configuration]({{% ref "configuration-overview.md" %}}), [Resiliency]({{% ref "resiliency-overview.md" %}}), and [HTTPEndpoint]({{% ref "service-invocation-overview.md" %}}) resources.

Unlike Components and Subscriptions which are reloaded in-place, changes to these resource types trigger an automatic **graceful restart** of the Dapr sidecar process. This ensures that the new configuration is applied cleanly. Unchanged resources are detected and silently ignored, so a restart only occurs when an actual change is detected.

## Further reading
- [Components concept]({{% ref components-concept.md %}})
- [Reference secrets in component definitions]({{% ref component-secrets.md %}})
- [Supported state stores]({{% ref supported-state-stores %}})
- [Supported pub/sub brokers]({{% ref supported-pubsub %}})
- [Supported secret stores]({{% ref supported-secret-stores %}})
- [Supported bindings]({{% ref supported-bindings %}})
- [Set component scopes]({{% ref component-scopes.md %}})
