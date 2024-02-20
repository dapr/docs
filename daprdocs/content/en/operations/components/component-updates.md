---
type: docs
title: "Updating components"
linkTitle: "Updating components"
weight: 300
description: "Updating deployed components used by applications"
---

When making an update to an existing deployed component used by an application, Dapr does not update the component automatically unless the [`HotReload`](#hot-reloading-preview-feature) feature gate is enabled.
The Dapr sidecar needs to be restarted in order to pick up the latest version of the component.
How this is done depends on the hosting environment.

### Kubernetes

When running in Kubernetes, the process of updating a component involves two steps:

1. Apply the new component YAML to the desired namespace
1. Unless the [`HotReload` feature gate is enabled](#hot-reloading-preview-feature), perform a [rollout restart operation](https://kubernetes.io/docs/reference/kubectl/cheatsheet/#updating-resources) on your deployments to pick up the latest component

### Self Hosted

Unless the [`HotReload` feature gate is enabled](#hot-reloading-preview-feature), the process of updating a component involves a single step of stopping and restarting the `daprd` process to pick up the latest component.

## Hot Reloading (Preview Feature)

> This feature is currently in [preview]({{< ref "preview-features.md" >}}).
> Hot reloading is enabled by via the [`HotReload` feature gate]({{< ref "support-preview-features.md" >}}).

Dapr can be made to "hot reload" components whereby component updates are picked up automatically without the need to restart the Dapr sidecar process or Kubernetes pod.
This means creating, updating, or deleting a component manifest will be reflected in the Dapr sidecar during runtime.

{{% alert title="Updating Components" color="warning" %}}
When a component is updated it is first closed, and then re-initialized using the new configuration.
This causes the component to be unavailable for a short period of time during this process.
{{% /alert %}}

{{% alert title="Initialization Errors" color="warning" %}}
If the initialization processes errors when a component is created or updated through hot reloading, the Dapr sidecar respects the component field [`spec.ignoreErrors`]({{< ref component-schema.md>}}).
That is, the behaviour is the same as when the sidecar loads components on boot.
- `spec.ignoreErrors=false` (*default*): the sidecar gracefully shuts down.
- `spec.ignoreErrors=true`: the sidecar continues to run with neither the old or new component configuration registered.
{{% /alert %}}

All components are supported for hot reloading except for the following types.
Any create, update, or deletion of these component types is ignored by the sidecar with a restart required to pick up changes.
- [Actor State Stores]({{< ref "state_api.md#configuring-state-store-for-actors" >}})
- [Workflow Backends]({{< ref "workflow-architecture.md#workflow-backend" >}})

## Further reading
- [Components concept]({{< ref components-concept.md >}})
- [Reference secrets in component definitions]({{< ref component-secrets.md >}})
- [Supported state stores]({{< ref supported-state-stores >}})
- [Supported pub/sub brokers]({{< ref supported-pubsub >}})
- [Supported secret stores]({{< ref supported-secret-stores >}})
- [Supported bindings]({{< ref supported-bindings >}})
- [Set component scopes]({{< ref component-scopes.md >}})
