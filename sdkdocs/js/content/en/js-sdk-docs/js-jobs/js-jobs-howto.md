---
type: docs
title: "How to: Author and manage Dapr Jobs using the JavaScript SDK"
linkTitle: "How to: Author & manage jobs"
weight: 51000
description: Learn how to schedule one-time and recurring jobs and handle their callbacks using JavaScript
---

Let's register an endpoint to receive a job notification, then schedule the job from the same application. This guide uses `DaprServer.jobs` for callbacks and its embedded `DaprClient.jobs` for job management. There is no separate Jobs client package to install.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}})
- An initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}}) with **Dapr runtime 1.16 or later** and the [Scheduler service]({{% ref "concepts/dapr-services/scheduler.md" %}}) running
- [Node.js](https://nodejs.org/) 18 or later
- The [`@dapr/dapr`](https://www.npmjs.com/package/@dapr/dapr) package, **version 3.19.0 or later**

In your application directory, initialize an npm project if needed and install the SDK:

```sh
npm init -y
npm install @dapr/dapr@3.19.0
```

The examples use JavaScript ES modules in a `.mjs` file, so no TypeScript compiler is required. The same APIs are available in TypeScript.

## Register a handler and schedule a recurring job

Save the following as `app.mjs`:

```javascript
import { CommunicationProtocolEnum, DaprServer } from "@dapr/dapr";

const server = new DaprServer({
  serverHost: "127.0.0.1",
  serverPort: "50002",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
  clientOptions: {
    daprHost: "127.0.0.1",
    daprPort: "50001",
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  },
});

const jobName = "daily-report";

try {
  await server.jobs.listen(jobName, async (data) => {
    console.log(`Received ${jobName}:`, data);
  });

  await server.start();

  await server.client.jobs.schedule(jobName, {
    schedule: "@every 10s",
    repeats: 3,
    data: { report: "daily", format: "csv" },
    failurePolicy: { type: "constant", interval: "1s", maxRetries: 3 },
    overwrite: true,
  });

  const job = await server.client.jobs.get(jobName);
  console.log("Scheduled:", job.name, job.schedule, job.data);
  console.log("Waiting for callbacks. Press Ctrl+C to stop.");

  await new Promise((resolve) => {
    process.once("SIGINT", resolve);
    process.once("SIGTERM", resolve);
  });
} finally {
  try {
    await server.stop();
  } finally {
    await server.client.stop();
  }
}
```

Start the application and sidecar:

```sh
dapr run --app-id jobs-example --app-port 50002 --app-protocol grpc --dapr-grpc-port 50001 --dapr-http-port 3500 -- node app.mjs
```

The application listens on port `50002`; its client sends management requests to the sidecar on port `50001`. The job triggers three times at ten-second intervals. The callback receives the payload itself, not a job envelope or the job name. Capture the name in the handler's closure if needed.

Register handlers **before** calling `server.start()`. Await all work in the handler; throw an error or reject its promise when processing fails so Dapr can apply the job's failure policy. Delivery is at least once, so make handlers idempotent.

The example deliberately uses `overwrite: true` so it can be rerun while a job with the same name still exists. Without this option, scheduling an existing name fails. Overwriting replaces the existing job, including its timing and repeat settings; do not blindly reset a production schedule whenever a replica starts.

Jobs belong to the scheduling sidecar's application ID and namespace. Callbacks go to that application, not to an arbitrary target application. Register the handler on every replica that can receive a callback. A handler can use other Dapr APIs to invoke another service or publish an event.

Stopping the Node.js server does not delete jobs stored in the Scheduler. The example also stops the embedded client explicitly because `server.stop()` only stops the callback server.

## Use HTTP instead

For JSON payloads, you can use HTTP for both management requests and callbacks. Change the server's `communicationProtocol` to `CommunicationProtocolEnum.HTTP`, and change its `clientOptions` to:

```javascript
clientOptions: {
  daprHost: "127.0.0.1",
  daprPort: "3500",
  communicationProtocol: CommunicationProtocolEnum.HTTP,
},
```

Run it with the matching app protocol:

```sh
dapr run --app-id jobs-example --app-port 50002 --app-protocol http --dapr-grpc-port 50001 --dapr-http-port 3500 -- node app.mjs
```

The SDK registers the HTTP callback route `POST /job/:name`; you do not need to implement this route yourself. Client and callback protocols can also differ. See the [protocol guidance]({{% ref js-jobs-client-usage.md %}}).

## Schedule a one-time job

For a one-time job, supply `dueTime` without `schedule`:

```javascript
await server.client.jobs.schedule("send-notification", {
  dueTime: "30s",
  data: { recipientId: "customer-123" },
});
```

To use an absolute time, pass an RFC3339 timestamp:

```javascript
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

await server.client.jobs.schedule("send-notification-tomorrow", {
  dueTime: tomorrow.toISOString(),
  data: { recipientId: "customer-123" },
});
```

These snippets reuse the running `server` from the example. To receive these additional jobs, register a matching `server.jobs.listen(...)` handler for each name before starting the server. The remaining scheduling examples follow the same pattern.

## Limit a recurring job's lifetime

Combine `schedule` with `dueTime` to delay when a recurring job becomes active. Use `repeats` to limit the number of scheduled triggers, `ttl` to set expiration, or both:

```javascript
await server.client.jobs.schedule("hourly-cleanup", {
  schedule: "@every 1h",
  dueTime: "10m",
  repeats: 5,
  ttl: "6h",
});
```

Omitting `repeats` leaves a recurring job running until it expires or is deleted. Relative `dueTime` and `ttl` values are calculated from job creation, not from the previous callback. See the [option reference]({{% ref js-jobs-client-usage.md %}}) for accepted time formats.

For calendar-based scheduling, use a six-field cron string or a [`CronExpressionBuilder`]({{% ref js-jobs-cron.md %}}):

```javascript
await server.client.jobs.schedule("morning-report", {
  schedule: "CRON_TZ=America/New_York 0 30 9 * * 1-5",
  data: { report: "daily" },
});
```

## Retrieve or delete a job

Retrieve the stored configuration by name:

```javascript
const job = await server.client.jobs.get("hourly-cleanup");
console.log(job.name, job.schedule, job.dueTime, job.ttl, job.repeats);
console.log(job.data, job.failurePolicy);
```

To stop future triggers, delete the job:

```javascript
await server.client.jobs.delete("hourly-cleanup");
```

Deletion does not cancel callback work that is already running. It also does not unregister the application's in-memory handler. To change a stored job instead, call `schedule` with its name, the replacement options, and `overwrite: true`.

## Next steps

Read the [client and callback usage guidance]({{% ref js-jobs-client-usage.md %}}) for payloads, retries, validation, and runtime compatibility, or the [cron builder guide]({{% ref js-jobs-cron.md %}}) for fluent scheduling.
