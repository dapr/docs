---
type: docs
title: "Temporal.io"
linkTitle: "Temporal.io"
description: Detailed information on the Temporal.io workflow component
---

## Component format

To set up the Temporal.io workflow, create a component of type `todo`. See [this guide](todo) on how to create a workflow.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: temporal
spec:
  type: workflow.temporal
  version: v1
  metadata:
  - name: hostport
    value: <HOST>
  - name: identity
    value: "WF Identity"
```

## Spec metadata fields

| Field | Required | Details                                           | Example          |
|-------|:--------:|---------------------------------------------------|------------------|
| name  | Y        | Connection string for the Temporal.io host        | `localhost:6379` | 
| name  | Y        | Unique ID of the workflow                         |  `       | 

## Setup Temporal.io

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}

todo

{{% /codetab %}}

{{% codetab %}}

todo 

{{% /codetab %}}

{{< /tabs >}}


## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Workflow building block]({{< ref workflow-overview >}})
