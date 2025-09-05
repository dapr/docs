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

## Multi-application workflows

Like all building blocks in Dapr, workflow execution routing is based on the [App ID of the hosting Dapr application]({{% ref "security-concept.md#application-identity" %}}).
By default, the full workflow execution is hosted on the app ID that started the workflow.
This workflow will be executed across all replicas of that app ID, not just the single replica which scheduled the workflow.

It is possible to execute activities or child workflows on different app IDs by specifying the target app ID parameter, inside the workflow execution code.
Upon execution, the target app ID will execute the activity or child workflow, and return the result to the parent workflow of the originating app ID.
Workflows being durable, if the target activity or child workflow app ID is not available or has not been defined, the parent workflow retry until the target app ID becomes available, indefinitely.
It is paramount that their is co-ordination between the teams owning the different app IDs to ensure that the activities and child workflows are defined and available when needed.

The entire Workflow execution may be distributed across multiple app IDs with no limit, with each activity or child workflow specifying the target app ID.
The final history of the workflow will be saved by the app ID that hosts the very parent (or can consider it the root) workflow.

{{% alert title="Restrictions" color="primary" %}}
Like other building blocks and resources in Dapr, workflows are scoped to a single namespace.
This means that all app IDs involved in a multi-application workflow must be in the same namespace.
Similarly, all app IDs must use the same actor state store.
Finally, the target app ID must have the activity or child workflow defined, otherwise the parent workflow will retry indefinitely.
{{% /alert %}}

## Multi-application activity examples

The following examples show how to execute activities on different target app IDs.

{{< tabpane text=true >}}

{{% tab "Go" %}}

```go
package main

import (
	"context"
	"log"

	"github.com/dapr/durabletask-go/backend"
	"github.com/dapr/durabletask-go/client"
	"github.com/dapr/durabletask-go/task"
	dapr "github.com/dapr/go-sdk/client"
)

func main() {
	ctx := context.Background()

	registry := task.NewTaskRegistry()
	if err := registry.AddOrchestrator(TestWorkflow); err != nil {
		log.Fatal(err)
	}

	daprClient, err := dapr.NewClient()
	if err != nil {
		log.Fatal(err)
	}

	client := client.NewTaskHubGrpcClient(daprClient.GrpcClientConn(), backend.DefaultLogger())
	if err := client.StartWorkItemListener(ctx, registry); err != nil {
		log.Fatal(err)
	}

	id, err := client.ScheduleNewOrchestration(ctx, "TestWorkflow")
	if err != nil {
		log.Fatal(err)
	}

	if _, err = client.WaitForOrchestrationCompletion(ctx, id); err != nil {
		log.Fatal(err)
	}
}

func TestWorkflow(ctx *task.OrchestrationContext) (any, error) {
	var output string
	err := ctx.CallActivity("my-other-activity",
		task.WithActivityInput("my-input"),
		// Here we set custom target app ID which will execute this activity.
		task.WithActivityAppID("my-other-app-id"),
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
          var logger = ctx.getLogger();
          logger.info("=== WORKFLOW STARTING ===");
          logger.info("Starting CrossAppWorkflow: {}", ctx.getName());
          logger.info("Workflow name: {}", ctx.getName());
          logger.info("Workflow instance ID: {}", ctx.getInstanceId());

          String input = ctx.getInput(String.class);
          logger.info("CrossAppWorkflow received input: {}", input);
          logger.info("Workflow input: {}", input);

          // Call an activity in another app by passing in an active appID to the WorkflowTaskOptions
          logger.info("Calling cross-app activity in 'app2'...");
          logger.info("About to call cross-app activity in app2...");
          String crossAppResult = ctx.callActivity(
                  App2TransformActivity.class.getName(),
                  input,
                  new WorkflowTaskOptions("app2"),
                  String.class
          ).await();

          // Call another activity in a different app
          logger.info("Calling cross-app activity in 'app3'...");
          logger.info("About to call cross-app activity in app3...");
          String finalResult = ctx.callActivity(
                  App3FinalizeActivity.class.getName(),
                  crossAppResult,
                  new WorkflowTaskOptions("app3"),
                  String.class
          ).await();
          logger.info("Final cross-app activity result: {}", finalResult);
          logger.info("Final cross-app activity result: {}", finalResult);

          logger.info("CrossAppWorkflow finished with: {}", finalResult);
          logger.info("=== WORKFLOW COMPLETING WITH: {} ===" , finalResult);
          ctx.complete(finalResult);
      };
  }
}
```

{{% /tab %}}

{{< /tabpane >}}

The following examples show how to execute child workflows on different target app IDs.

{{< tabpane text=true >}}

{{% tab "Go" %}}

```go
package main

import (
	"context"
	"log"

	"github.com/dapr/durabletask-go/backend"
	"github.com/dapr/durabletask-go/client"
	"github.com/dapr/durabletask-go/task"
	dapr "github.com/dapr/go-sdk/client"
)

func main() {
	ctx := context.Background()

	registry := task.NewTaskRegistry()
	if err := registry.AddOrchestrator(TestWorkflow); err != nil {
		log.Fatal(err)
	}

	daprClient, err := dapr.NewClient()
	if err != nil {
		log.Fatal(err)
	}

	client := client.NewTaskHubGrpcClient(daprClient.GrpcClientConn(), backend.DefaultLogger())
	if err := client.StartWorkItemListener(ctx, registry); err != nil {
		log.Fatal(err)
	}

	id, err := client.ScheduleNewOrchestration(ctx, "TestWorkflow")
	if err != nil {
		log.Fatal(err)
	}

	if _, err = client.WaitForOrchestrationCompletion(ctx, id); err != nil {
		log.Fatal(err)
	}
}

func TestWorkflow(ctx *task.OrchestrationContext) (any, error) {
	var output string
	err := ctx.CallSubOrchestrator("my-sub-orchestration",
		task.WithSubOrchestratorInput("my-input"),
		// Here we set custom target app ID which will execute this child workflow.
		task.WithSubOrchestratorAppID("my-sub-app-id"),
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
