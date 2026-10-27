---
type: docs
title: "How to: Author and run workflows with the JavaScript SDK"
linkTitle: "Author and run workflows"
weight: 1000
description: Register workflows and activities, coordinate durable tasks, and handle retries and events
---

Workflows are generator functions that **yield SDK tasks**. The runtime records task results in history and
replays the generator to reconstruct its state. Activities are ordinary functions, optionally asynchronous,
that perform I/O or other work outside the deterministic workflow.

## Prerequisites

- Node.js 18 or later and `@dapr/dapr` **3.19.0 or later**.
- An initialized [self-hosted Dapr environment]({{% ref install-dapr-selfhost.md %}}) with runtime **1.19 or later**.
- Workflow infrastructure: an actor state store, placement, and scheduler. The default `dapr init` environment
  provides these for local development.

## Register and run a workflow

Install the package in your application directory:

```sh
npm init -y
npm install @dapr/dapr@3.19.0
```

Save this complete example as `app.mjs`. It uses JavaScript ES modules; the same APIs are available in TypeScript.

```javascript
import {
  DaprWorkflowClient,
  WorkflowRuntime,
  WorkflowRuntimeStatus,
} from "@dapr/dapr";

async function hello(_ctx, name) {
  return `Hello ${name}!`;
}

function* sequence(ctx) {
  const cities = [];
  for (const city of ["Tokyo", "Seattle", "London"]) {
    cities.push(yield ctx.callActivity(hello, city));
  }
  ctx.logger.info("Greeting sequence completed");
  return cities;
}

const options = { daprHost: "127.0.0.1", daprPort: "50001" };
const runtime = new WorkflowRuntime(options);
const client = new DaprWorkflowClient(options);
runtime.registerWorkflow(sequence).registerActivity(hello);

try {
  await runtime.start();
  const id = await client.scheduleNewWorkflow(sequence);
  const state = await client.waitForWorkflowCompletion(id, true, 30);
  if (!state || state.runtimeStatus !== WorkflowRuntimeStatus.COMPLETED) {
    throw new Error(
      state?.workflowFailureDetails?.getErrorMessage() ?? "Workflow did not complete successfully",
    );
  }
  console.log(state.getOutput());
} finally {
  await runtime.stop();
  await client.stop();
}
```

Run it with a sidecar:

```sh
dapr run --app-id sequence-workflow --dapr-grpc-port 50001 -- node app.mjs
```

The output includes `["Hello Tokyo!", "Hello Seattle!", "Hello London!"]`.

### Registration names

`registerWorkflow(fn)` and `registerActivity(fn)` use the function name as the durable registration name.
For explicit, stable names, use:

```javascript
runtime.registerWorkflowByName("greeting-v1", sequence);
runtime.registerActivityWithName("hello-v1", hello);
```

Call these registrations by string, for example `ctx.callActivity("hello-v1", city)` or
`client.scheduleNewWorkflow("greeting-v1")`. Keep names stable across deployments and minification.
`registerWorkflowWithName` is a deprecated alias of `registerWorkflowByName`.

## Keep workflow execution deterministic

Put network calls, database operations, filesystem access, and nondeterministic computation in activities.
Use `yield` with `ctx.callActivity`, timers, event waits, and task-composition helpers; do not substitute
`await` or `Promise.all` for durable tasks. Both synchronous and async generators are supported, but an
async generator does not make arbitrary I/O replay-safe.

| Need | Workflow API |
| --- | --- |
| Current time | `ctx.getCurrentUtcDateTime()`, not `new Date()` or `Date.now()` |
| Generated identifier | `ctx.newGuid()`, not a random UUID |
| Instance or registration name | `ctx.getWorkflowInstanceId()`, `ctx.getWorkflowName()` |
| Logging without duplicate replay messages | `ctx.logger.info(...)`, `.warn(...)`, `.error(...)`, or `.debug(...)` |
| Conditional replay handling | `ctx.isReplaying()` |
| Externally visible progress | `ctx.setCustomStatus({ step: "processing" })` |

Activities can be delivered more than once. Make external side effects idempotent. An activity receives
`WorkflowActivityContext` with `getWorkflowInstanceId()`, `getWorkflowActivityId()`, and
`getTaskExecutionId()`. The execution ID is a persisted activity key, also exposed as `task.executionId`
on the workflow's activity task, and is reused across SDK retry attempts. It can be `undefined` for legacy
history or runtimes that do not supply it; do not assume it is always present or that it guarantees exactly-once delivery.

## Run activities in parallel

Create all tasks before yielding `whenAll`:

```javascript
function* parallelGreetings(ctx, cities) {
  const tasks = cities.map((city) => ctx.callActivity("hello", city));
  return yield ctx.whenAll(tasks);
}
```

`whenAll` returns results in input order and fails if a task fails. `whenAny` returns the **first completed
task**, not its result, and does not cancel the other tasks. Yield the winning task or call its `getResult()`
to observe its result or error.

## Retry activities and child workflows

Pass `retryPolicy` in activity or child-workflow options:

```javascript
function* resilientGreeting(ctx, name) {
  return yield ctx.callActivity("hello", name, {
    retryPolicy: {
      firstRetryInterval: 1,
      maxNumberOfAttempts: 4,
      backoffCoefficient: 2,
      maxRetryInterval: 30,
      retryTimeout: 120,
    },
  });
}
```

All intervals are in **seconds**. `maxNumberOfAttempts` includes the initial call; `backoffCoefficient`
defaults to `1`. The first interval and optional limits must be positive and finite; attempts must be a
positive integer and the coefficient must be at least `1`. A non-retriable failure stops retries.
`retryTimeout` limits scheduling further attempts; it is not a timeout that interrupts a running activity.
Failures are thrown into the generator at `yield`, where you can catch them and schedule compensating activities.

## Wait for external events

An external event lets another process signal an instance. The SDK matches event names case-insensitively
and buffers events that arrive before their wait is created.

```javascript
import { TaskTimeoutError } from "@dapr/dapr";

function* approval(ctx) {
  ctx.setCustomStatus({ step: "awaiting-approval" });
  try {
    const decision = yield ctx.waitForExternalEvent("approval", {
      timeoutInSeconds: 3600,
    });
    return decision;
  } catch (error) {
    if (!(error instanceof TaskTimeoutError)) throw error;
    return { approved: false, reason: "Approval deadline expired" };
  }
}
```

From a client, call `await client.raiseEvent(instanceId, "approval", { approved: true })`.
From another workflow in the same app, use `ctx.sendEvent(instanceId, "approval", { approved: true })`;
`sendEvent` does not return a task and is not yielded. Do not expose the client or make client RPCs inside
workflow code.

## Use durable timers and cancellation

`ctx.createTimer(60)` waits 60 **seconds** of workflow time. You can also supply an absolute `Date` computed
from `ctx.getCurrentUtcDateTime()`. Do not use `setTimeout` for a durable delay.

For a race between an event and a timer:

```javascript
function* approvalRace(ctx) {
  const event = ctx.waitForExternalEvent("approval");
  const timer = ctx.createTimer(3600);
  const winner = yield ctx.whenAny([event, timer]);
  if (winner === event) {
    timer.cancel();
    return event.getResult();
  }
  event.cancel();
  timer.getResult();
  return { approved: false, reason: "Approval deadline expired" };
}
```

Timers and event waits implement `CancellableTask`, exposing `cancel()` and `isCanceled`. Canceling stops
the SDK's local wait and rejects it with `TaskCanceledError`; it does **not** cancel runtime-side work,
an activity, or an entire workflow. Cancel unused waits explicitly after a race.

## Continue as new

For long-running loops, start a fresh history generation under the same instance ID:

```javascript
function* batchLoop(ctx, input) {
  const next = yield ctx.callActivity("processBatch", input);
  ctx.continueAsNew(next, true);
  return;
}
```

Return immediately after `continueAsNew`. The second argument, `saveEvents`, defaults to `true` and retains
unconsumed external events; set it to `false` to discard them. Do not schedule more work after requesting
continuation. Register the activity used by this example before starting the worker.

## Next steps

- [Manage workflow instances]({{% ref js-workflow-management.md %}})
- [Call child and detached workflows]({{% ref js-workflow-multi-app.md %}})
- [Evolve workflow code safely]({{% ref js-workflow-versioning.md %}})
