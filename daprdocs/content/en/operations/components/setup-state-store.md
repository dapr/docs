---
type: docs
title: "State stores components"
linkTitle: "State stores"
description: "Guidance on setting up different state stores for Dapr state management"
weight: 1000
aliases:
  - "/operations/components/setup-state-store/setup-state-store-overview/"
---

Dapr integrates with existing databases to provide apps with state management capabilities for CRUD operations, transactions and more. It also supports the configuration of multiple, named, state store components *per application*.

State stores are extensible and can be found in the [components-contrib repo](https://github.com/dapr/components-contrib).

A state store in Dapr is described using a `Component` file:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.<DATABASE>
  version: v1
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```

The type of database is determined by the `type` field, and things like connection strings and other metadata are put in the `.metadata` section.
Even though metadata values can contain secrets in plain text, it is recommended you use a [secret store]({{< ref component-secrets.md >}}).

Visit [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to configure a state store component.

## Supported state stores

Visit [this reference]({{< ref supported-state-stores >}}) to see all of the supported state stores in Dapr.

## Related topics
- [Component concept]({{< ref components-concept.md >}})
- [State management overview]({{< ref state-management >}})
- [State management API specification]({{< ref state_api.md >}})
- [Supported state stores]({{< ref supported-state-stores >}})
