---
type: docs
title: "How to: Manage workflows"
linkTitle: "How to: Manage workflows"
weight: 6000
description: Manage and expose workflows
---

Now that you've [set up the workflow and its activities in your application]({{< ref howto-author-workflow.md >}}), you can start, terminate, and get information about the workflow using HTTP API calls. For more information, read the [workflow API reference]({{< ref workflow_api.md >}}).

{{< tabs ".NET SDK" HTTP >}}

<!--NET-->
{{% codetab %}}

Manage your workflow within your code. In the `OrderProcessingWorkflow` example from the [Author a workflow]({{< ref "howto-author-workflow.md#write-the-workflow" >}}) guide, the workflow is registered in the code. You can then start, terminate, and get information about the workflow:

```csharp

```

{{% /codetab %}}

<!--HTTP-->
{{% codetab %}}

Manage your workflow using HTTP calls. The example below plugs in the properties from the [Author a workflow example]({{< ref "howto-author-workflow.md#write-the-workflow" >}}) with a random instance ID number.

### Start workflow

To start your workflow, run:

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/OrderProcessingWorkflow/12345678/start
```

### Terminate workflow

To terminate your workflow, run:

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/12345678/terminate
```

### Get information about a workflow

To fetch workflow outputs and inputs, run:

```bash
GET http://localhost:3500/v1.0-alpha1/workflows/dapr/OrderProcessingWorkflow/12345678
```

Learn more about these HTTP calls in the [workflow API reference guide]({{< ref workflow_api.md >}}).


{{% /codetab %}}

{{< /tabs >}}


## Next steps
- [Try out the Workflow quickstart]({{< ref workflow-quickstart.md >}})
- Learn more about [how to manage workflows with the .NET SDK](todo) and try out [the .NET example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
- [Workflow API reference]({{< ref workflow_api.md >}})