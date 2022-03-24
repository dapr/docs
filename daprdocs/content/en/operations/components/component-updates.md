---
type: docs
title: "Updating components"
linkTitle: "Updating components"
weight: 250
description: "Updating deployed components used by applications"
---

When making an update to an existing component, the Dapr sidecar needs to be restarted in order to pick up the latest version of the component. Dapr sidecars do not update components automatically.

## Kubernetes

When running in Kubernetes, the process of updating a component involves two steps:

1. Applying the new component YAML to the desired namespace
2. Performing a [rollout restart operation](https://kubernetes.io/docs/reference/kubectl/cheatsheet/#updating-resources) on your deployments to pick up the latest component

## Self Hosted

When running in Self Hosted mode, the process of updating a component involves a single step of stopping the `daprd` sidecar and starting it again to pick up the latest component.

## Further reading
- [Components concept]({{< ref components-concept.md >}})
- [Reference secrets in component definitions]({{< ref component-secrets.md >}})
- [Supported state stores]({{< ref supported-state-stores >}})
- [Supported pub/sub brokers]({{< ref supported-pubsub >}})
- [Supported secret stores]({{< ref supported-secret-stores >}})
- [Supported bindings]({{< ref supported-bindings >}})
- [Set component scopes]({{< ref component-scopes.md >}})
