---
type: docs
title: "How to: Register and run a workflow"
linkTitle: "How to: Run workflows"
weight: 2000
description: Integrate, manage, and expose workflows
---

Now that you've read about [the workflow building block]({{< ref workflow-overview >}}), learn more about how to:

- Use the a worfklow component
- Configure or register a workflow component.

## Built-in workflow vs external workflows

When you run `dapr init`, Dapr creates a default built-in workflow component. This component is written in Go and implements workflow instances as actors to promote placement and scalability. 

[Insert HL diagram]

{{% alert title="Note" color="primary" %}}
Currently, Dapr only supports Temporal as an external workflow component that can be used with the Workflow API (in addition to the Dapr's built-in workflow component).
{{% /alert %}}


## Using workflow components

{{< tabs "Built-in" Temporal >}}

<!-- Built-in workflow component -->

{{% codetab %}}

### Authoring workflow

<!-- Need to add link or steps for how to author a workflow for the built in engine with the Workflow Authoring SDKs-->

### Configuring Built-in Workflow component

`dapr init` configures the built-in workflow component. 


{{% /codetab %}}

<!-- temporal.io -->

{{% codetab %}}

### Authoring Workflow for external component
For authoring your workflow, find the instructions through your component's own instructions page. For the Temporal workflow, [follow instructions provided by Temporal.io](https://docs.temporal.io/application-development/foundations#develop-workflows). 

### Registering external component
Once you've written your workflow, register the workflow with Dapr:

```bash
command to register Temporal workflow for all steps involved
```

{{% /codetab %}}


{{< /tabs >}}

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

