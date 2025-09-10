---
type: docs
title: Multi Application Workflows
linkTitle: Multi Application Workflows
weight: 7000
description: "Executing workflows across multiple applications"
---

It is often the case that a single workflow spans multiple applications, microservices, or programing languages.
This is where an activity or a child workflow will be executed on a different application than the one hosting the parent workflow.

Some scenarios where this is useful include:

- A Machine Learning (ML) training activity must be executed on GPU-enabled machines, while the rest of the workflow runs on CPU-only orchestration machines.
- Activities need access to sensitive data or credentials that are only available to particular identities or locales.
- Different parts of the workflow need to be executed in different trust zones or networks.
- Different parts of the workflow need to be executed in different geographic regions due to data residency requirements.
- An involved business process spans multiple teams or departments, each owning their own application.
- Implementation of a workflow spans different programming lanaguages based on team expertise or existing codebases.
- Different team boundaries or microservice ownership.


## Multi-application workflows

Like all building blocks in Dapr, workflow execution routing is based on the [App ID of the hosting Dapr application]({{% ref "security-concept.md#application-identity" %}}).
By default, the full workflow execution is hosted on the app ID that started the workflow.
This workflow will be executed across all replicas of that app ID, not just the single replica which scheduled the workflow.

It is possible to execute activities or child workflows on different app IDs by specifying the target app ID parameter, inside the workflow execution code.
Upon execution, the target app ID will execute the activity or child workflow, and return the result to the parent workflow of the originating app ID.

The entire Workflow execution may be distributed across multiple app IDs with no limit, with each activity or child workflow specifying the target app ID.
The final history of the workflow will be saved by the app ID that hosts the very parent (or can consider it the root) workflow.

{{% alert title="Restrictions" color="primary" %}}
Like other building blocks and resources in Dapr, workflows are scoped to a single namespace.
This means that all app IDs involved in a multi-application workflow must be in the same namespace.
Similarly, all app IDs must use the same actor state store.
Finally, the target app ID must have the activity or child workflow defined, otherwise the parent workflow will retry indefinitely.
{{% /alert %}}

{{% alert title="Important Limitations" color="warning" %}}
- **SDKs supporting multi-application workflows** - Multi-application workflows are used via the SDKs. Currently Java (activities calling) and Go (both activities and child workflows calling) SDKs are supported. The SDKs (Python, .NET, JavaScript) are planned for future releases.
{{% /alert %}}

## Error handling

When calling multi-application activities or child workflows:
- If the target application does not exist, the call will be retried using the provided retry policy.
- If the target application exists but doesn't contain the specified activity or workflow, the call will return an error.
- Standard workflow retry policies apply to multi-application calls.

It is paramount that there is co-ordination between the teams owning the different app IDs to ensure that the activities and child workflows are defined and available when needed.

## Multi-application activity example

<img src="/images/workflow-overview/workflow-multi-app-callactivity.png" width=800 alt="Diagram showing multi-application call activity workflow pattern">

The following example shows how to execute the activity `ActivityA` on the target app `App2`.

{{< tabpane text=true >}}

{{% tab "Go" %}}

```go
func TestWorkflow(ctx *task.OrchestrationContext) (any, error) {
	var output string
	err := ctx.CallActivity("ActivityA",
		task.WithActivityInput("my-input"),
		task.WithActivityAppID("App2"), // Here we set the target app ID which will execute this activity.
	).Await(&output)

	if err != nil {
		return nil, err
	}

	return output, nil
}
```

{{% /tab %}}

{{% tab "Java" %}}

```java
public class CrossAppWorkflow implements Workflow {
  @Override
  public WorkflowStub create() {
      return ctx -> {
          String output = ctx.callActivity(
                  "ActivityA",
                  "my-input",
                  new WorkflowTaskOptions("App2"), // Here we set the target app ID which will execute this activity.
                  String.class
          ).await();

          ctx.complete(output);
      };
  }
}
```

{{% /tab %}}

{{< /tabpane >}}

## Multi-application child workflow example

<img src="/images/workflow-overview/workflow-multi-app-child-workflow.png" width=800 alt="Diagram showing multi-application child workflow pattern">

The following example shows how to execute the child workflow `Workflow2` on the target app `App2`.

{{< tabpane text=true >}}

{{% tab "Go" %}}

```go
func TestWorkflow(ctx *task.OrchestrationContext) (any, error) {
	var output string
	err := ctx.CallSubOrchestrator("Workflow2",
		task.WithSubOrchestratorInput("my-input"),
		task.WithSubOrchestratorAppID("App2"), // Here we set the target app ID which will execute this child workflow.
	).Await(&output)

	if err != nil {
		return nil, err
	}

	return output, nil
}
```

{{% /tab %}}

{{< /tabpane >}}

## Related links

- [Try out Dapr Workflows using the quickstart]({{% ref workflow-quickstart.md %}})
- [Workflow overview]({{% ref workflow-overview.md %}})
- [Workflow API reference]({{% ref workflow_api.md %}})
- Try out the following examples:
   - [Python](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
   - [JavaScript](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
   - [.NET](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
   - [Java](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
   - [Go](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)
