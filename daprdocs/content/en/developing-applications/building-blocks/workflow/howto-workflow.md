---
type: docs
title: "How to: Register and run a workflow"
linkTitle: "How to: Run workflows"
weight: 2000
description: Integrate, manage, and expose workflows
---

Now that you've read about [the workflow building block]({{< ref workflow-overview >}}) and created your worfklow component, learn more about how to:

- Use the built-in worfklow component
- Register an external workflow component with Dapr.

## Built-in workflow vs external workflows

When you run `dapr init`, Dapr creates a default built-in workflow component. This component is written in Go and implements workflow instances as actors to promote placement and scalability. 

[Insert diagram]

Currently, Dapr supports two external workflow components in addition to the Dapr's built-in workflow component:
- Temporal.io
- Azure Logic Apps

You can write your Temporal.io or Logic Apps worfklow instances and register them with the Dapr sidecar with all the features of the Dapr workflow API.

## Register your workflow

{{< tabs "Built-in" Temporal.io "Azure Logic Apps" >}}

<!-- temporal.io -->

{{% codetab %}}

Follow the [instructions provided by Temporal.io](https://docs.temporal.io/application-development/foundations#develop-workflows) to develop your workflow code. 

For external workfow components, there's an additional step to make sure workers for that component are up and running. Once you've written your workflow, register the workflow with Dapr:

```bash
command?
```

{{% /codetab %}}

<!-- logic apps -->

{{% codetab %}}

Follow the [instructions provided by Azure Logic Apps](https://docs.temporal.io/application-development/foundations#develop-workflows) to develop your workflow code. 

For external workfow components, there's an additional step to make sure workers for that component are up and running. Once you've written your workflow, register the workflow with Dapr:

```bash
command?
```

{{% /codetab %}}

<!-- built in -->

{{% codetab %}}

`dapr init` configures the built-in workflow component. No need to manually register the built-in workflow component. 

{{% /codetab %}}


{{< /tabs >}}

## Run your workflow

Next, run your workflow using the following API methods. For more information, read the [workflow API reference]().

### Start

To start your workflow, run:

```bash
POST http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}/start
```

### Terminate

To terminate your workflow, run:

```bash
POST http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}/terminate
```

### Get metadata

To fetch workflow outputs and inputs, run:

```bash
GET http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}
```

## Next steps

- [Workflow API]()
- Learn more about the [workflow component]()