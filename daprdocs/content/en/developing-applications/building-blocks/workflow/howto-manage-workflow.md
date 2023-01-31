---
type: docs
title: "How to: Manage workflows"
linkTitle: "How to: Manage workflows"
weight: 5000
description: Manage and expose workflows
---

Now that you've read about [the Workflow building block]({{< ref workflow-overview >}}), let's dive into how 

{{% alert title="Note" color="primary" %}}
 If you haven't already, [try out the .NET SDK Workflow example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow) for a quick walk-through on how to use the service invocation API.

{{% /alert %}}

Now that you've [set up the workflow and its activities in your application]({{< ref howto-author-workflow.md >}}), you can start, terminate, and get metadata status for the workflow using HTTP API calls. For more information, read the [workflow API reference]({{< ref workflow_api.md >}}).

## Start workflow

To start your workflow, run:

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<workflowName>/<instanceId>/start
```

## Terminate workflow

To terminate your workflow, run:

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<instanceId>/terminate
```

### Get metadata for a workflow

To fetch workflow outputs and inputs, run:

```bash
GET http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<workflowName>/<instanceId>
```

## Next steps

- Learn more about [authoring workflows]({{< ref howto-author-workflow.md >}})
- Learn more about [workflow architecture]({{< ref workflow-architecture.md >}}) and [workfow capabilities]({{< ref workflow-capabilities.md >}})

