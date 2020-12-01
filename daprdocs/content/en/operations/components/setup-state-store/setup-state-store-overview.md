---
type: docs
title: "Overview"
linkTitle: "Overview"
description: "Guidance on set up for state management components"
weight: 10000
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
Even though you can put plain text secrets in there, it is recommended you use a [secret store]({{< ref component-secrets.md >}}).

Visit [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to configure a state store component.

## Related topics
- [Component concept]({{< ref components-concept.md >}})
- [State management overview]({{< ref state-management >}})
- [State management API specification]({{< ref state_api.md >}})
