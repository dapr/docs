---
type: docs
title: "How to: Author and manage Dapr Workflow in the JavaScript SDK"
linkTitle: "How to: Author and manage workflows"
weight: 20000
description: How to get up and running with workflows using the Dapr JavaScript SDK
---

Let’s create a Dapr workflow and invoke it using the console. With the [provided workflow example](https://github.com/dapr/js-sdk/tree/main/examples/workflow), you will:

- Execute the workflow instance using the [JavaScript workflow worker](https://github.com/dapr/js-sdk/tree/main/src/workflow/runtime/WorkflowRuntime.ts)
- Utilize the JavaScript workflow client and API calls to [start and terminate workflow instances](https://github.com/dapr/js-sdk/tree/main/src/workflow/client/DaprWorkflowClient.ts)

This example uses the default configuration from `dapr init` in [self-hosted mode](https://github.com/dapr/cli#install-dapr-on-your-local-machine-self-hosted).

## Prerequisites

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm),
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Verify you're using the latest proto bindings

## Set up the environment

Clone the JavaScript SDK repo and navigate into it.

```bash
git clone https://github.com/dapr/js-sdk
cd js-sdk
```

From the JavaScript SDK root directory, navigate to the Dapr Workflow example.

```bash
cd examples/workflow/authoring
```

Run the following command to install the requirements for running this workflow sample with the Dapr JavaScript SDK.

```bash
npm install
```

## Run the `activity-sequence.ts`

The `activity-sequence` file registers a workflow and an activity with the Dapr Workflow runtime. The workflow is a sequence of activities that are executed in order. We use DaprWorkflowClient to schedule a new workflow instance and wait for it to complete.

```typescript
const daprHost = "localhost";
const daprPort = "50001";
const workflowClient = new DaprWorkflowClient({
  daprHost,
  daprPort,
});
const workflowRuntime = new WorkflowRuntime({
  daprHost,
  daprPort,
});

const hello = async (_: WorkflowActivityContext, name: string) => {
  return `Hello ${name}!`;
};

const sequence: TWorkflow = async function* (ctx: WorkflowContext): any {
  const cities: string[] = [];

  const result1 = yield ctx.callActivity(hello, "Tokyo");
  cities.push(result1);
  const result2 = yield ctx.callActivity(hello, "Seattle");
  cities.push(result2);
  const result3 = yield ctx.callActivity(hello, "London");
  cities.push(result3);

  return cities;
};

workflowRuntime.registerWorkflow(sequence).registerActivity(hello);

// Wrap the worker startup in a try-catch block to handle any errors during startup
try {
  await workflowRuntime.start();
  console.log("Workflow runtime started successfully");
} catch (error) {
  console.error("Error starting workflow runtime:", error);
}

// Schedule a new orchestration
try {
  const id = await workflowClient.scheduleNewWorkflow(sequence);
  console.log(`Orchestration scheduled with ID: ${id}`);

  // Wait for orchestration completion
  const state = await workflowClient.waitForWorkflowCompletion(id, undefined, 30);

  console.log(`Orchestration completed! Result: ${state?.serializedOutput}`);
} catch (error) {
  console.error("Error scheduling or waiting for orchestration:", error);
}
```

In the code above:

- `workflowRuntime.registerWorkflow(sequence)` registers `sequence` as a workflow in the Dapr Workflow runtime.
- `await workflowRuntime.start();` builds and starts the engine within the Dapr Workflow runtime.
- `await workflowClient.scheduleNewWorkflow(sequence)` schedules a new workflow instance with the Dapr Workflow runtime.
- `await workflowClient.waitForWorkflowCompletion(id, undefined, 30)` waits for the workflow instance to complete.

In the terminal, execute the following command to kick off the `activity-sequence.ts`:

```sh
npm run start:dapr:activity-sequence
```

**Expected output**

```
You're up and running! Both Dapr and your app logs will appear here.

...

== APP == Orchestration scheduled with ID: dc040bea-6436-4051-9166-c9294f9d2201
== APP == Waiting 30 seconds for instance dc040bea-6436-4051-9166-c9294f9d2201 to complete...
== APP == Received "Orchestrator Request" work item with instance id 'dc040bea-6436-4051-9166-c9294f9d2201'
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Rebuilding local state with 0 history event...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, EXECUTIONSTARTED=1]
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Waiting for 1 task(s) and 0 event(s) to complete...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Returning 1 action(s)
== APP == Received "Activity Request" work item
== APP == Activity hello completed with output "Hello Tokyo!" (14 chars)
== APP == Received "Orchestrator Request" work item with instance id 'dc040bea-6436-4051-9166-c9294f9d2201'
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Rebuilding local state with 3 history event...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Waiting for 1 task(s) and 0 event(s) to complete...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Returning 1 action(s)
== APP == Received "Activity Request" work item
== APP == Activity hello completed with output "Hello Seattle!" (16 chars)
== APP == Received "Orchestrator Request" work item with instance id 'dc040bea-6436-4051-9166-c9294f9d2201'
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Rebuilding local state with 6 history event...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Waiting for 1 task(s) and 0 event(s) to complete...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Returning 1 action(s)
== APP == Received "Activity Request" work item
== APP == Activity hello completed with output "Hello London!" (15 chars)
== APP == Received "Orchestrator Request" work item with instance id 'dc040bea-6436-4051-9166-c9294f9d2201'
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Rebuilding local state with 9 history event...
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Orchestration completed with status COMPLETED
== APP == dc040bea-6436-4051-9166-c9294f9d2201: Returning 1 action(s)
INFO[0006] dc040bea-6436-4051-9166-c9294f9d2201: 'sequence' completed with a COMPLETED status.  app_id=activity-sequence-workflow instance=kaibocai-devbox scope=wfengine.backend type=log ver=1.12.3
== APP == Instance dc040bea-6436-4051-9166-c9294f9d2201 completed
== APP == Orchestration completed! Result: ["Hello Tokyo!","Hello Seattle!","Hello London!"]
```

## Next steps

- [Learn more about Dapr workflow]({{% ref workflow-overview.md %}})
- [Workflow API reference]({{% ref workflow_api.md %}})
