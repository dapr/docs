---
type: docs
title: "How to: Run a workflow"
linkTitle: "How to: Run workflows"
weight: 2000
description: Integrate, manage, and expose workflows
---

Now that you've read about [the workflow building block]({{< ref workflow-overview >}}) and created your worfklow component, learn more about how to:

- Use the built-in worfklow component
- Register an external workflow engine with Dapr.

Currently, Dapr supports two external workflow engines:
- Temporal.io
- Logic Apps

[Insert diagram]

## Run your workflow

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

- [Workflow API]()
- Learn more about the [workflow component]()