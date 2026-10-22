---
type: docs
title: "How to: Author and manage Dapr Jobs in the .NET SDK"
linkTitle: "How to: Author & manage jobs"
weight: 51000
description: Schedule jobs, receive HTTP or gRPC callbacks, and manage job registrations in .NET
---

Use `Dapr.Jobs` version `1.19.0` or later with a running Dapr sidecar and Scheduler. The complete
management surface described here requires a runtime that supports the corresponding operations; use
Dapr 1.19 for the 1.19 features. All client operations use version-aware stable/alpha API fallback, but that
does not make newer management operations available on an older runtime.

```sh
dotnet add package Dapr.Jobs
```

Jobs are scoped to the scheduling application's Dapr app ID. The client does not accept a different target
app ID when scheduling a trigger. See the
[Jobs sample](https://github.com/dapr/dotnet-sdk/tree/v1.19.0/examples/Jobs/JobsSample).

## Register the client and callback handler

Register the client before building the host, and map one handler for dynamically named jobs:

```csharp
using Dapr.Jobs;
using Dapr.Jobs.Extensions;
using Dapr.Jobs.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprJobsClient();

await using var app = builder.Build();

app.MapDaprScheduledJobHandler(
    async (string jobName, ReadOnlyMemory<byte> payload, CancellationToken cancellationToken) =>
    {
        app.Logger.LogInformation("Received job {JobName}", jobName);
        var text = Encoding.UTF8.GetString(payload.Span);
        await HandleJobAsync(jobName, text, cancellationToken);
    },
    timeout: TimeSpan.FromSeconds(30));

await app.RunAsync();
```

`HandleJobAsync` represents your application logic. The callback receives the job name and original payload
bytes; additional services can be resolved from request DI. Its cancellation token includes the configured
handler timeout. Handlers must observe that token themselves; a timeout does not forcibly stop arbitrary code.
Return a `Task` for asynchronous work so the callback waits for it before acknowledging the trigger.

For HTTP callbacks, the mapper registers `POST /job/{jobName}`. Start the application with a matching app port:

```sh
dapr run --app-id jobsapp --app-port 5000 -- dotnet run --urls http://localhost:5000
```

### gRPC callbacks

`AddDaprJobsClient` and `MapDaprScheduledJobHandler` also register the gRPC callback path. Choose it with
`--app-protocol grpc`. For plaintext gRPC, configure a dedicated HTTP/2 listener before `builder.Build()`:

```csharp
using Microsoft.AspNetCore.Server.Kestrel.Core;

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenLocalhost(5000, listen => listen.Protocols = HttpProtocols.Http2);
});
```

An HTTP/1-only listener, or plaintext `Http1AndHttp2` without protocol negotiation, cannot serve this gRPC
callback. Use separate listeners if the same app must also accept HTTP/1 traffic.

## Register the job

Resolve `DaprJobsClient` and use `ScheduleJobAsync` for every schedule type:

```csharp
var jobsClient = app.Services.GetRequiredService<DaprJobsClient>();
var schedule = DaprJobSchedule.FromDateTime(DateTimeOffset.UtcNow.AddMinutes(5));

await jobsClient.ScheduleJobAsync(
    "send-receipt", schedule,
    payload: Encoding.UTF8.GetBytes("order-42"),
    overwrite: false,
    cancellationToken: cancellationToken);
```

Schedule only after the callback is ready, or use a future due time. Registering a job does not by itself
start an application listener.

| Argument | Meaning |
| --- | --- |
| `jobName`, `schedule` | Required name and `DaprJobSchedule`. |
| `payload` | Optional `ReadOnlyMemory<byte>` delivered unchanged to the callback. |
| `startingFrom` | Optional `DateTimeOffset` controlling the first due time. |
| `repeats` | Optional repeat count. |
| `ttl` | Optional absolute `DateTimeOffset` expiry, later than `startingFrom` when both are supplied. |
| `overwrite` | Defaults to `false`; opt in to replacing an existing same-name registration. |
| `failurePolicyOptions` | Drop or constant-interval retry policy for failed triggers. |
| `cancellationToken` | Cancels waiting for the client operation; it is not the callback token. |

### One-time, interval, and predefined schedules

```csharp
var oneTime = DaprJobSchedule.FromDateTime(DateTimeOffset.UtcNow.AddHours(1));
var interval = DaprJobSchedule.FromDuration(TimeSpan.FromMinutes(15));
var daily = DaprJobSchedule.Daily;

await jobsClient.ScheduleJobAsync("refresh-cache", interval, repeats: 5,
    cancellationToken: cancellationToken);
```

Predefined schedules also include `Hourly`, `Midnight`, `Weekly`, `Monthly`, and `Yearly`.

### Cron-based job and time zone

Use `FromExpression` for a string expression, or `FromCronExpression` for a `CronExpressionBuilder`:

```csharp
var schedule = DaprJobSchedule.FromExpression("CRON_TZ=America/New_York 0 9 * * *");
await jobsClient.ScheduleJobAsync("morning-report", schedule,
    cancellationToken: cancellationToken);
```

The builder also supports `WithTimeZone(string)` and `WithTimeZone(TimeZoneInfo)`. `DaprJobSchedule.TimeZone` exposes an embedded `CRON_TZ`
identifier. Use valid IANA time-zone IDs and account for daylight-saving changes when choosing calendar schedules.

### JSON and string payload helpers

`ScheduleJobWithPayloadAsync` from `Dapr.Jobs.Extensions` accepts the same schedule:

```csharp
await jobsClient.ScheduleJobWithPayloadAsync(
    "create-report", DaprJobSchedule.Daily,
    new { AccountId = "42", Format = "pdf" },
    cancellationToken: cancellationToken);
```

The object overload JSON-serializes with web defaults unless you pass `jsonSerializerOptions`. The string
overload encodes UTF-8 text without JSON quoting. Deserialize callback bytes with the matching convention.
There are no separate `ScheduleCronJobAsync` or `ScheduleOneTimeJobWithPayloadAsync` helpers in this release.

## Configure trigger failure policy

```csharp
await jobsClient.ScheduleJobAsync(
    "refresh-catalog", DaprJobSchedule.Hourly,
    failurePolicyOptions: new JobFailurePolicyConstantOptions(TimeSpan.FromSeconds(10))
    {
        MaxRetries = 5
    },
    cancellationToken: cancellationToken);
```

`JobFailurePolicyConstantOptions` retries at the specified interval; an unset `MaxRetries` allows indefinite
retries. `JobFailurePolicyDropOptions` drops a failed trigger. An omitted policy leaves runtime defaults in
effect. This policy is separate from the job's recurring schedule and repeat count. Make callback side effects
idempotent because triggers can be delivered more than once.

## Get details of already-scheduled job

```csharp
var details = await jobsClient.GetJobAsync("refresh-catalog", cancellationToken);
```

`DaprJobDetails` exposes `Name`, `Schedule`, `DueTime`, `Ttl`, `RepeatCount`, `Payload`, `FailurePolicy`, and `Overwrite`.
`Name` can be null for manually constructed or older-runtime results. Inspect
`details.Schedule.ExpressionValue` and schedule classification properties such as `IsCronExpression` and
`IsPointInTimeExpression`. The response does not expose top-level `Interval` or `CronExpression` properties.

## List all registered jobs

```csharp
var registered = await jobsClient.ListJobsAsync(cancellationToken);
foreach (var job in registered)
{
    Console.WriteLine($"{job.Name}: {job.Schedule.ExpressionValue}");
}
```

The result is an `IReadOnlyList<DaprJobDetails>` scoped to the current app ID. An empty list normally means
there are no jobs; also consider the release-specific cancellation behavior described below.

## Delete a scheduled job

```csharp
await jobsClient.DeleteJobAsync("refresh-catalog", cancellationToken);
```

## Delete multiple jobs by name prefix

```csharp
await jobsClient.DeleteJobsByPrefixAsync("report-", cancellationToken);
```

The prefix match is case-sensitive. **A null, empty, or whitespace prefix deletes all jobs for this app ID.**
Validate a user-supplied prefix before calling this operation.

## Purge all jobs

```csharp
await jobsClient.PurgeAllJobsAsync(cancellationToken);
```

This explicitly requests deletion of every job associated with the current app ID, not every job in the cluster.

## Errors and cancellation

Runtime failures are wrapped in `DaprException`; inspect `InnerException`. Invalid arguments can throw standard
argument exceptions. In `1.19.0`, several Jobs methods catch caller cancellation instead of throwing
`OperationCanceledException`: writes/deletes can return without confirmation and listing can return empty.
`GetJobAsync` reports a missing expected result as `DaprException` after cancellation. See
[DaprJobsClient usage]({{< ref dotnet-jobsclient-usage.md >}}) for client configuration and payload conventions.

## Analyzer

The `Dapr.Jobs.Analyzers` package ships diagnostic `DAPR1501` (warning, category Usage). It fires when
`ScheduleJobAsync` is called with a literal job name and no `MapDaprScheduledJobHandler` call exists in the same
source file, with the message "Job invocations require the MapDaprScheduledJobHandler be set and configured for
job name '{name}' on IEndpointRouteBuilder". Add the handler mapping, or suppress the diagnostic with
`#pragma warning disable DAPR1501` or an `.editorconfig` rule if the handler is intentionally mapped elsewhere.
