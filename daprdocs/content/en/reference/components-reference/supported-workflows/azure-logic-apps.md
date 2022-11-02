---
type: docs
title: "Azure Logic Apps"
linkTitle: "Azure Logic Apps"
description: Detailed information on the Azure Logic Apps workflow component
---

## Component format

To set up the Azure Logic Apps workflow, create a component of type `todo`. See [this guide](todo) on how to create a workflow.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: todo
  version: v1
  metadata:
```

## Spec metadata fields

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
|       |          |         |         | 
|       |          |         |         | 
|       |          |         |         | 

## Setup Azure Logic Apps

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
