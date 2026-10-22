---
type: docs
title: "JavaScript Jobs client and callback usage"
linkTitle: "Client & callback usage"
weight: 59000
description: Configure the JavaScript Jobs client and understand scheduling options, payloads, failure policies, and errors
---

Jobs is part of `DaprClient` and `DaprServer` in **`@dapr/dapr` 3.19.0-rc.4 or later**. Use `client.jobs` to manage scheduled jobs and `server.jobs` to register callbacks. The [how-to guide]({{% ref js-jobs-howto.md %}}) contains a complete runnable application.

## Client configuration and lifetime

Create a long-lived `DaprClient` rather than a new client for every operation. Jobs uses the client's existing sidecar connection and API token:

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
  daprApiToken: process.env.DAPR_API_TOKEN,
});

try {
  await client.start();
  await client.jobs.schedule("cleanup", { dueTime: "1h" });
  const job = await client.jobs.get("cleanup");
  console.log(job);
  await client.jobs.delete("cleanup");
} finally {
  await client.stop();
}
```

For HTTP, use `CommunicationProtocolEnum.HTTP` and the sidecar's HTTP port, normally `"3500"`. Client-only management does not require an app listener, but the target application must expose its callback server when the job fires.

When using `DaprServer`, configure its embedded client through `clientOptions` and reuse `server.client.jobs`. `server.start()` starts both the callback server and the embedded client. `server.stop()` stops only the server; also call `server.client.stop()` during application shutdown. Neither operation deletes stored jobs.

### Client protocol and callback protocol

The two connections are configured independently:

| Connection | SDK setting | Dapr CLI setting |
| --- | --- | --- |
| Application to sidecar | `DaprClient.communicationProtocol`, or `DaprServer.clientOptions.communicationProtocol`, with the corresponding `daprPort` | `--dapr-http-port` or `--dapr-grpc-port` |
| Sidecar to application | `DaprServer.communicationProtocol` and `serverPort` | Matching `--app-protocol` and `--app-port` |

JSON payloads support any combination of HTTP and gRPC. For arbitrary bytes, use gRPC on both connections. Selecting gRPC for the client alone does not change the sidecar's callback protocol.

## Runtime compatibility and API selection

Jobs requires **Dapr runtime 1.16 or later** and a running Scheduler service. Before making a Jobs request, the SDK reads the sidecar's metadata to select the API:

| Runtime version | HTTP API prefix | gRPC management methods |
| --- | --- | --- |
| 1.16 and 1.17 | `v1.0-alpha1` | `ScheduleJobAlpha1`, `GetJobAlpha1`, `DeleteJobAlpha1` |
| 1.18 prereleases | `v1.0-alpha1` | Alpha1 methods |
| 1.18 stable and later releases | `v1.0` | `ScheduleJob`, `GetJob`, `DeleteJob` |

Prereleases after 1.18 and the `edge` runtime identifier select the stable API. Both stable and Alpha1 gRPC callback services are registered by `DaprServer`.

The SDK caches successful API selection per client. Metadata lookup failures, missing or unrecognized versions, and unsupported runtime versions reject the operation rather than guessing an API. A subsequent call can retry a failed metadata lookup. A Jobs request that fails is not automatically replayed against a different API version.

The SDK package version and runtime version are separate requirements: using SDK 3.19.0-rc.4 does not require runtime 1.19 merely to use Jobs.

## Scheduling options

`schedule(name, options)` returns `Promise<void>`. Supply at least one of `schedule` or `dueTime`; both may be supplied together.

| Option | Type | Behavior |
| --- | --- | --- |
| `schedule` | `string` or `CronExpressionBuilder` | A six-field cron expression, a descriptor such as `@daily`, or an interval such as `@every 5m`. The builder is converted to a string. |
| `dueTime` | `string` | When the job becomes active, or the trigger time for a one-time job without `schedule`. |
| `ttl` | `string` | Job expiration. Relative values are calculated from job creation. |
| `repeats` | `number` | Limits scheduled triggers. Omit for unlimited recurrence; zero is passed to the runtime, not converted to an omitted value. |
| `data` | JSON value or `Uint8Array` | Optional callback payload. Node.js `Buffer` is also accepted by gRPC. |
| `overwrite` | `boolean` | Defaults to `false`. Set to `true` to replace an existing job with the same name. |
| `failurePolicy` | `JobFailurePolicy` | Controls retries when callback processing fails. Omit to use the runtime default. |

`dueTime` and `ttl` accept RFC3339 timestamps, Go duration strings such as `"30s"` or `"1h30m"`, and non-repeating ISO8601 durations such as `"PT30M"`. Pass strings, not JavaScript `Date` objects. For an absolute time, use `date.toISOString()` or an RFC3339 timestamp with an explicit offset.

The runtime validates raw cron expressions, time strings, and scheduling combinations. Jobs is a durable scheduler, not a precision timer: a trigger will not arrive before its due time, but may arrive later.

### Job names and input validation

Names are case-sensitive. Pass a plain name, not a URL-encoded value; the HTTP client encodes the path segment.

The SDK rejects empty names, surrounding whitespace, `.` and `..`, control characters, and the characters `/`, `\`, `?`, `#`, `%`, and `|`. Internal spaces are supported. These SDK restrictions also apply with a newer runtime that allows additional characters, such as `|`.

The SDK also validates:

- `schedule`, `dueTime`, and `ttl`, when present, must be nonempty strings after converting a builder.
- `repeats` and `failurePolicy.maxRetries` must be integers between `0` and `4294967295`.
- `overwrite`, when present, must be a boolean.
- Payloads and failure policies must have supported values.

Invalid options reject the asynchronous operation before a Jobs request is sent. The [cron builder]({{% ref js-jobs-cron.md %}}) performs additional local validation of its fields.

## Retrieving and deleting jobs

`get(name)` returns `Promise<Job>` containing `name` and the optional `schedule`, `dueTime`, `ttl`, `repeats`, `data`, and `failurePolicy` properties. The SDK exports the related types for TypeScript callers:

```typescript
import type { Job, JobFailurePolicy, JobOptions } from "@dapr/dapr";

const failurePolicy: JobFailurePolicy = {
  type: "constant",
  interval: "1s",
  maxRetries: 3,
};

const options: JobOptions = { dueTime: "1h", failurePolicy };
await client.jobs.schedule("cleanup", options);

const job: Job = await client.jobs.get("cleanup");
console.log(job.name, job.failurePolicy);
```

`JobOptions` describes scheduling input, and `Job` describes retrieved configuration. `overwrite` is a scheduling option, not a returned job property. Returned timing strings use the runtime's representation, which may differ from the input, and a builder's schedule is returned as a string.

Retrieval returns configuration, not execution history, a next-run calculation, or a count of completed callbacks. A missing job causes `get` to reject, rather than returning `undefined`. `delete(name)` returns `Promise<void>`; deleting an already absent job is accepted by supported runtimes, while transport and service errors still propagate.

## Payload serialization

### JSON payloads

Both client transports and both callback protocols support JSON values: plain objects, arrays, strings, finite numbers, booleans, and `null`. Pass the value directly rather than manually JSON-stringifying it:

```javascript
await client.jobs.schedule("create-report", {
  dueTime: "30s",
  data: { reportId: "report-123", includeArchived: false },
});
```

`get(name).data` and the callback argument expose the decoded value. Values such as `false`, `0`, `""`, and `null` are preserved rather than treated as missing payloads.

The SDK rejects non-JSON data such as `Date` instances, `BigInt`, non-finite numbers, nested `undefined` values, and circular references. Convert such values to a JSON-compatible representation first.

Jobs uses its own payload encoding, not the client's custom serializer. JSON payloads are packed as `google.protobuf.Value` for gRPC; the decoder also understands `google.protobuf.Struct` payloads from other clients. You do not need to construct protobuf envelopes yourself.

Omitting `data` is not identical across transports. HTTP scheduling sends JSON `null` for compatibility with older runtimes; gRPC leaves the payload absent. Do not rely on distinguishing an omitted payload from `null` across protocols.

### Opaque binary payloads

Use gRPC to schedule and retrieve raw `Uint8Array` or Node.js `Buffer` payloads, including empty buffers:

```javascript
const data = Buffer.from([0x00, 0x80, 0xff]);

await client.jobs.schedule("process-bytes", {
  dueTime: "1h",
  data,
});

const job = await client.jobs.get("process-bytes");
console.log(Buffer.isBuffer(job.data)); // true
```

For this example, configure `client` with gRPC. Use a gRPC `DaprServer` and `--app-protocol grpc` to receive the same bytes in a callback. Dapr's HTTP app channel treats job callback bodies as JSON and is not suitable for arbitrary bytes.

HTTP scheduling rejects byte payloads rather than converting them to JSON. Opaque gRPC payloads are returned as Node.js buffers. The SDK uses the `dapr.io/schedule/jobpayload` type URL also used by the .NET Jobs SDK; it does not JSON-serialize or text-encode these bytes. For cross-language interoperability, agree on whether the payload is protobuf-wrapped JSON or raw bytes and decode accordingly.

## Failure policies

The SDK accepts the following policies:

| Policy | Behavior |
| --- | --- |
| Omitted | Leave Dapr's default policy in control. The runtime default retries up to three times with a one-second delay. |
| `{ type: "drop" }` | Do not retry a failed delivery. |
| `{ type: "constant", interval: "1s", maxRetries: 3 }` | Retry with a constant delay, up to the specified number of retries after the initial attempt. |

For a constant policy, omitting `maxRetries` allows unlimited retries. Setting `maxRetries: 0` disables retries. Omitting `interval`, or setting it to `"0s"`, requests immediate retries.

Unlike `dueTime` and `ttl`, the retry interval uses **protobuf duration JSON syntax**: seconds with an `s` suffix and up to nine fractional digits. Use `"0.2s"` for 200 milliseconds, `"60s"` for a minute, or `"0.000000001s"` for a nanosecond. Go-style strings such as `"200ms"` and `"1m"` are rejected here, as are negative durations.

```javascript
await client.jobs.schedule("retryable-task", {
  dueTime: "30s",
  failurePolicy: {
    type: "constant",
    interval: "0.5s",
    maxRetries: 2,
  },
});
```

This policy permits the initial attempt plus two retries. `repeats` controls scheduled triggers; it is not a retry limit.

## Callback behavior

`server.jobs.listen(name, callback)` returns `Promise<void>` and registers an asynchronous `(data) => Promise<void>` handler. Registration does not schedule a job. Register before starting the server, using exactly the same name as the scheduled job.

The SDK waits for the handler's promise before acknowledging delivery. A resolved handler means success; its return value is not a response payload or retry instruction. Throw or reject to signal failure. Do not start unawaited background work and return early, or catch processing errors without propagating them if you want Dapr to retry.

Duplicate registration for a name rejects instead of replacing the existing handler. The SDK does not provide a handler removal API.

| Situation | HTTP callback response | gRPC callback response |
| --- | --- | --- |
| Handler completes | `200` | Successful `JobEventResponse` |
| No matching handler | `404` | `NotFound` |
| Handler throws or rejects | `500` | `Internal` |

Missing handlers and failed handlers are logged and reported as errors, not acknowledged as successful deliveries. Design handlers for at-least-once delivery and use application-level deduplication when processing has non-idempotent side effects.

## Error handling

All Jobs methods return promises. Await them so validation errors, metadata failures, sidecar errors, and Scheduler errors reach your application's error handling.

Input validation can produce `TypeError` or `RangeError`; malformed runtime responses also reject. Remote failures propagate through the selected transport. HTTP failures include status and response details in the error message; gRPC failures use the gRPC transport's error information. There is no Jobs-specific exception class shared across transports.

Do not assume an unsuccessful scheduling request proves that nothing was stored: a response can be lost after the server accepts a request. Reconcile by name before retrying, and choose `overwrite` deliberately. Failure policies govern callback delivery, not retries of client management requests.

These Jobs methods do not accept an `AbortSignal`, timeout argument, or cancellation token. Rejecting a local wait does not cancel a job; use `delete(name)` to remove its future schedule.
