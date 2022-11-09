---
type: docs
title: "How to: Set up a workflow"
linkTitle: "How to: Set up workflows"
weight: 2000
description: Integrate, manage, and expose workflows with the built-in workflow runtime component and SDKs
---

Now that you've learned about the 

Currently two supported workflow engines are Temporal.io and Logic Apps, both of which follow the same set up steps outlined below

Two external workflows:
- Temporal.io
- Logic Apps


## Create your workflow

{{< tabs "Built-in" Temporal.io "Azure Logic Apps" >}}

<!-- built in -->

{{% codetab %}}

Develop your workflow. In the following example,

```go
insert code snippet
```

{{% /codetab %}}

<!-- temporal.io -->

{{% codetab %}}

Follow the [instructions provided by Temporal.io](https://docs.temporal.io/application-development/foundations#develop-workflows) to develop your workflow code. 

For external workfow engines, there's an additional step to make sure workers for that engine are up and running. Once you've written your workflow, register the workflow with Dapr:

```bash
command?
```

{{% /codetab %}}

<!-- logic apps -->

{{% codetab %}}

Follow the [instructions provided by Azure Logic Apps](https://docs.temporal.io/application-development/foundations#develop-workflows) to develop your workflow code. 

For external workfow engines, there's an additional step to make sure workers for that engine are up and running. Once you've written your workflow, register the workflow with Dapr:

```bash
command?
```

{{% /codetab %}}

{{< /tabs >}}


## Next steps

- [Workflow API]({{< ref "reference\api\workflow_api.md" >}})
- Learn more about the [workflow component]({{< ref "reference\components-reference\supported-workflows\_index.md" >}})

