---
type: docs
title: "How to: Manage your workflow"
linkTitle: "How to: Manage workflows"
weight: 2000
description: manage your workflows
---

Now that you've read about [the workflow building block]({{< ref workflow-overview >}}), learn more about how to manage a workflow.

When you run `dapr init`, Dapr creates a default workflow runtime. This component is written in Go and implements workflow instances as actors to promote placement and scalability. 



## Run your workflow

Next, run your workflow using the following API methods. For more information, read the [workflow API reference]({{< ref workflow_api.md >}}).

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

- Learn more about [authoring workflows for the built-in engine component]()
- Learn more about [supported workflow components]()

