---
type: docs
title: "Workflow backend components"
linkTitle: "Workflow backends"
description: "Guidance on setting up different workflow backends for Dapr workflow"
weight: 600
aliases:
  - "/operations/components/setup-workflow-backend/setup-workflow-backend-overview/"
---

The workflow backend provides the capability for users to set up alternative backend implementations for Dapr Workflow, in addition to the default Actors backend. The backends currently supported include `actor` and `sqlite`.

A workflow backend in Dapr is described using a `Component` file:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sqlitebackend
spec:
  type: workflowbackend.sqlite
  version: v1
  metadata:
    - name: connectionString
      value: "file::memory:"
    - name: orchestrationLockTimeout
      value: "130000000000ms"
    - name: activityLockTimeout
      value: "130000000000ms"
...
```

The type of backend is determined by the `type` field, and things like connection strings and other metadata are put in the `.metadata` section.

<!-- Visit [this guide]({{< ref "" >}}) on how to configure a workflow backend component. -->

## Supported workflow backends

Visit [this reference]({{< ref supported-workflow-backends >}}) to see all of the supported workflow backend in Dapr.

## Related topics
- [Component concept]({{< ref components-concept.md >}})
<!-- - [Workflow backend overview]() -->
<!-- - [Workflow backend specification]() -->
<!-- - [Supported workflow backends]() -->
