---
type: docs
title: "Workflow schedules"
linkTitle: "Workflow schedules"
weight: 2650
description: "Start a workflow repeatedly on a cron schedule, and see when it runs next and how its last run went"
---

A _workflow schedule_ starts a workflow repeatedly on a cron schedule, for example every night at 02:00 or every 5 minutes. Each time the schedule matches, Dapr starts a new, independent instance of the workflow: a _run_. You create, list, inspect, trigger and delete schedules with the workflow client of any SDK, or with the Dapr CLI.

Before workflow schedules, a recurring workflow needed a [job]({{% ref jobs-overview.md %}}) whose handler in your app started the workflow, or an [eternal workflow]({{% ref "workflow-features-concepts.md#infinite-loops-and-eternal-workflows" %}}) that slept between iterations. A workflow schedule replaces both with one call, and the schedule is visible to every tool that works with workflows.

{{% alert title="Note" color="primary" %}}
Workflow schedules are an alpha feature. They need a Dapr runtime and an SDK release with workflow schedule support. A runtime without it answers schedule calls with an `UNIMPLEMENTED` error.
{{% /alert %}}

## How workflow schedules work

Each schedule is run by Dapr itself, as a small internal workflow that belongs to your app. It waits on a [durable timer]({{% ref "workflow-features-concepts.md#durable-timers" %}}) until the next time the schedule matches, then starts your workflow as a [detached workflow]({{% ref workflow-detached.md %}}). Because it is built on the same durable timers and state as any other workflow, a schedule survives sidecar restarts and app redeployments, and needs no extra component.

The following diagram shows how the parts fit together for a schedule named `nightly-report`. The schedule's own workflow runs inside the Dapr sidecar, with the instance ID `dapr-internal-schedule-nightly-report`. Its timer is a reminder in the Scheduler service, and each run it starts executes on your app's workflow worker like any other workflow.

{{< mermaid >}}
flowchart LR
    C["Client<br/>SDK workflow client or Dapr CLI"] -->|"create, get, list,<br/>trigger, delete"| D
    subgraph D["Dapr sidecar"]
        S["Schedule workflow<br/>dapr-internal-schedule-nightly-report"]
    end
    S <-->|"durable timer<br/>for the next time"| J["Scheduler service"]
    S -->|"starts a detached run"| R["Run<br/>nightly-report_20261030T020000Z"]
    R -->|"executes on"| A["Your app's<br/>workflow worker"]
{{< /mermaid >}}

- **Runs are ordinary workflow instances.** Each run has the instance ID `<schedule name>_<time>`, where the time is when the run was due, in UTC, formatted as `20060102T150405Z`. A run started by [triggering](#trigger-a-run-now) the schedule has the ID `<schedule name>_<time>_manual`. List every run of a schedule by listing the instance IDs that start with `<schedule name>_`.
- **Runs are independent of the schedule.** A run that fails does not stop the schedule, and deleting a schedule does not touch the runs it already started. Use the workflow APIs to manage runs as you would any other workflow instance.
- **The schedule needs a connected worker.** Like starting any workflow, creating a schedule needs your app's workflow worker to be connected to its Dapr sidecar. While no worker is connected, the schedule waits.
- **A schedule never misses a time.** After downtime, every time the schedule missed starts its own run. See [Missed times](#missed-times).
- **The schedule lives with your app.** The schedule belongs to the app ID whose sidecar you create it on. Its runs start on the same app unless you set a target app ID, as with [multi-app workflows]({{% ref workflow-multi-app.md %}}).

### The life of a schedule

The schedule's workflow works in steps. Each step starts the run that is due, sets a durable timer for the next time the schedule matches, and waits. When the timer fires, the workflow [continues as new]({{% ref "workflow-features-concepts.md#infinite-loops-and-eternal-workflows" %}}) for the next step, so its history stays small however long the schedule runs. A trigger starts a run straight away, without moving the timer. Getting the schedule reads the schedule's state and the state of its last run.

{{< mermaid >}}
sequenceDiagram
    participant C as Client
    participant D as Dapr sidecar<br/>(schedule workflow)
    participant J as Scheduler service
    participant A as Your app's<br/>workflow worker
    C->>D: create nightly-report, "0 0 2 * * *"
    D->>J: durable timer for 02:00
    Note over D: status: next run 02:00
    J-->>D: timer fires at 02:00
    D->>D: continue as new
    D->>A: start run nightly-report_20261030T020000Z
    D->>J: durable timer for 02:00 the next day
    C->>D: trigger nightly-report
    D->>A: start run nightly-report_20261030T091512Z_manual
    Note over D,J: the timer for the next run does not move
    C->>D: get nightly-report
    D-->>C: next run, last run, run count,<br/>and the last run's status and output
{{< /mermaid >}}

### Missed times

A schedule never misses a time. If the app is down, or no workflow worker is connected, when a time comes, the Scheduler service holds the schedule's timer until the worker connects again. Then every time the schedule missed starts its own run, one after another, as with [jobs]({{% ref jobs-overview.md %}}) and actor reminders. Each run keeps the ID of the time it was due, and each missed time takes one step of the schedule's workflow, so the runs follow each other quickly. A due time in the past also starts a run for every time since it.

The following diagram shows an hourly schedule whose app is down from 10:00 to 13:30.

{{< mermaid >}}
sequenceDiagram
    participant J as Scheduler service
    participant D as Dapr sidecar<br/>(schedule workflow)
    participant A as Your app's<br/>workflow worker
    Note over D,A: app down from 10:00 to 13:30
    J--xD: 10:00 timer held, no worker connected
    Note over D,A: app back at 13:30
    J-->>D: 10:00 timer delivered
    D->>A: run hourly_20261030T100000Z
    D->>A: run hourly_20261030T110000Z
    D->>A: run hourly_20261030T120000Z
    D->>A: run hourly_20261030T130000Z
    D->>J: durable timer for 14:00
    J-->>D: timer fires at 14:00
    D->>A: run hourly_20261030T140000Z
{{< /mermaid >}}

To start one run for the missed times instead, and carry on from the next time after now, set the [skip missed](#options) option. The same outage then starts a single run:

{{< mermaid >}}
sequenceDiagram
    participant J as Scheduler service
    participant D as Dapr sidecar<br/>(schedule workflow, skip missed)
    participant A as Your app's<br/>workflow worker
    Note over D,A: app down from 10:00 to 13:30
    J--xD: 10:00 timer held, no worker connected
    Note over D,A: app back at 13:30
    J-->>D: 10:00 timer delivered
    D->>A: run hourly_20261030T100000Z
    Note over D: 11:00, 12:00 and 13:00 are skipped
    D->>J: durable timer for 14:00
    J-->>D: timer fires at 14:00
    D->>A: run hourly_20261030T140000Z
{{< /mermaid >}}

## Schedule format

The schedule uses the same format as the [Jobs API]({{% ref "jobs_api.md#schedule-a-job" %}}):

| Format | Example | Meaning |
| --- | --- | --- |
| Cron expression with seconds | `0 30 9 * * MON-FRI` | 09:30:00 on weekdays |
| `@every <duration>` | `@every 15m` | Every 15 minutes. The minimum is 1 second. |
| `@yearly`, `@monthly`, `@weekly`, `@daily`, `@hourly` | `@daily` | Once a year, month, week, day or hour |

The six fields of a cron expression are seconds, minutes, hours, day of month, month and day of week. Cron expressions use UTC unless they start with a time zone, for example `CRON_TZ=Europe/London 0 0 9 * * *`.

## Options

| Option | Description |
| --- | --- |
| Name | Identifies the schedule within the app. Up to 40 letters, digits or `-`. |
| Workflow | The name of the workflow each run starts. |
| Schedule | When runs start. See [Schedule format](#schedule-format). |
| Input | The input every run is given. |
| Due time | The time of the first run. Without it, the first run is at the first time the schedule matches. |
| Expiration time | No run starts after this time. The schedule then completes. |
| Repeats | The number of runs, scheduled or triggered, after which the schedule completes. |
| Target app ID and namespace | The app that hosts the workflow each run starts, when it is not the app that owns the schedule. |
| Overwrite | Replace an existing schedule of the same name. Without it, creating a schedule whose name is taken fails with `ALREADY_EXISTS`. |
| Skip missed | Start one run for the times the schedule missed while the app was down, rather than one run for each, and carry on from the next time after now. Off by default. |

## Status

Getting or listing schedules returns each schedule with its status:

| Field | Description |
| --- | --- |
| State | `ACTIVE` while runs are left, `COMPLETED` once repeats or the expiration time are reached, and `FAILED` if the schedule itself failed, with a failure message. |
| Next run time | When the next run starts, unless the schedule is triggered sooner. |
| Last run time | The time the last run was started for. |
| Run count | How many runs the schedule has started. |
| Last run | The last run's instance ID, runtime status, created and last updated times, and its output or failure details. |

## Create a schedule

The following examples create a schedule named `nightly-report` that starts the `GenerateReport` workflow at 02:00 UTC every day, then read back when it runs next and how its last run went.

{{< tabpane text=true >}}

{{% tab "Go" %}}

<!--go-->

```go
wfClient, err := client.NewWorkflowClient()
if err != nil {
	log.Fatal(err)
}

err = wfClient.CreateWorkflowSchedule(ctx, "nightly-report", "GenerateReport", "0 0 2 * * *",
	workflow.WithScheduleInput(ReportRequest{Region: "eu"}),
)
if err != nil {
	log.Fatal(err)
}

schedule, err := wfClient.GetWorkflowSchedule(ctx, "nightly-report")
if err != nil {
	log.Fatal(err)
}
status := schedule.GetStatus()
fmt.Println("next run:", status.GetNextRunTime().AsTime())
if run := status.GetLastRun(); run != nil {
	fmt.Println("last run:", run.GetInstanceId(), run.GetRuntimeStatus())
}
```

{{% /tab %}}

{{% tab "Python" %}}

<!--python-->

```python
from dapr.ext.workflow import DaprWorkflowClient

client = DaprWorkflowClient()

client.create_workflow_schedule(
    'nightly-report',
    generate_report,
    '0 0 2 * * *',
    input={'region': 'eu'},
)

schedule = client.get_workflow_schedule('nightly-report')
print('next run:', schedule.status.next_run_time)
if schedule.status.last_run:
    print('last run:', schedule.status.last_run.instance_id, schedule.status.last_run.runtime_status)
```

{{% /tab %}}

{{% tab ".NET" %}}

<!--csharp-->

```csharp
await daprWorkflowClient.CreateWorkflowScheduleAsync(
    "nightly-report",
    nameof(GenerateReportWorkflow),
    "0 0 2 * * *",
    new WorkflowScheduleOptions { Input = new ReportRequest("eu") });

var schedule = await daprWorkflowClient.GetWorkflowScheduleAsync("nightly-report");
Console.WriteLine($"next run: {schedule?.Status?.NextRunTime}");
if (schedule?.Status?.LastRun is { } lastRun)
{
    Console.WriteLine($"last run: {lastRun.InstanceId} {lastRun.RuntimeStatus}");
}
```

{{% /tab %}}

{{% tab "Java" %}}

<!--java-->

```java
DaprWorkflowClient client = new DaprWorkflowClient();

client.createWorkflowSchedule("nightly-report", GenerateReportWorkflow.class, "0 0 2 * * *",
    new WorkflowScheduleOptions().setInput(new ReportRequest("eu")));

WorkflowSchedule schedule = client.getWorkflowSchedule("nightly-report");
System.out.println("next run: " + schedule.getStatus().getNextRunTime());
WorkflowScheduleRun lastRun = schedule.getStatus().getLastRun();
if (lastRun != null) {
  System.out.println("last run: " + lastRun.getInstanceId() + " " + lastRun.getRuntimeStatus());
}
```

{{% /tab %}}

{{% tab "JavaScript" %}}

<!--javascript-->

```javascript
const client = new DaprWorkflowClient();

await client.createWorkflowSchedule("nightly-report", generateReport, "0 0 2 * * *", {
  input: { region: "eu" },
});

const schedule = await client.getWorkflowSchedule("nightly-report");
console.log("next run:", schedule.status?.nextRunTime);
if (schedule.status?.lastRun) {
  console.log("last run:", schedule.status.lastRun.instanceId, schedule.status.lastRun.runtimeStatus);
}
```

{{% /tab %}}

{{% tab "CLI" %}}

```bash
dapr workflow schedule create nightly-report --app-id reports \
  --workflow GenerateReport --schedule "0 0 2 * * *" --input '{"region":"eu"}'

dapr workflow schedule get nightly-report --app-id reports -o wide
```

{{% /tab %}}

{{< /tabpane >}}

## List schedules

Listing returns the app's schedules with their status, a page at a time. A page can hold fewer schedules than the page size while more remain, so keep listing while a continuation token is returned.

The Dapr CLI shows when each schedule runs next, when it last ran and how that run went:

```bash
dapr workflow schedule list --app-id reports -o wide
```

```text
NAME            SCHEDULE         RUNS                    NEXT              LAST              STATUS     RESULT
nightly-report  0 0 2 * * *      GenerateReport({...})   Fri 30 Oct 02:00  Thu 29 Oct 02:00  ok 2m58s   report written to s3://reports/2026-10-29
weekly-cleanup  0 15 10 * * MON  Cleanup                 Mon 02 Nov 10:15  Mon 26 Oct 10:15  failed 4s  bucket "tmp" not found
```

`STATUS` is `ok` or `failed` with the last run's duration, `running` while it runs, or the schedule's own state when it has no run to show. `RESULT` is the first line of the last run's output or failure.

To list the runs of a schedule, list the workflow instances whose ID starts with the schedule name and `_`:

```bash
dapr workflow list --app-id reports --instance-id-prefix nightly-report_
```

The SDKs offer the same filter on their instance ID listing. Each schedule is itself a workflow instance, named `dapr.internal.schedule` with the ID `dapr-internal-schedule-<schedule name>`, and it is listed like any other workflow. `dapr workflow history dapr-internal-schedule-nightly-report` shows its steps.

## Trigger a run now

Triggering a schedule starts a run at once, without changing when the next scheduled run starts. The call returns the instance ID of the run. A triggered run counts towards the schedule's repeats, and triggering a schedule that has completed fails with `FAILED_PRECONDITION`.

```bash
dapr workflow schedule trigger nightly-report --app-id reports
```

In code, call `TriggerWorkflowSchedule` (Go), `trigger_workflow_schedule` (Python), `TriggerWorkflowScheduleAsync` (.NET), `triggerWorkflowSchedule` (Java and JavaScript).

## Delete a schedule

Deleting a schedule stops it. Runs it already started carry on, and keep their instance IDs and history.

```bash
dapr workflow schedule delete nightly-report --app-id reports
```

To change a schedule, create it again with the overwrite option. That replaces the schedule and resets its run count; runs it already started are not affected.

## Errors

Schedule calls return gRPC status codes:

| Code | When |
| --- | --- |
| `INVALID_ARGUMENT` | The name, workflow name, schedule, repeats or expiration time is not valid. |
| `ALREADY_EXISTS` | Creating a schedule whose name is taken, without overwrite. |
| `NOT_FOUND` | Getting, triggering or deleting a schedule that does not exist. |
| `FAILED_PRECONDITION` | Triggering a completed schedule, or no workflow worker is connected for the app. |
| `UNIMPLEMENTED` | The Dapr runtime does not support workflow schedules. |

## Related links

- [Detached workflows]({{% ref workflow-detached.md %}})
- [Durable timers]({{% ref "workflow-features-concepts.md#durable-timers" %}})
- [Jobs API schedule format]({{% ref "jobs_api.md#schedule-a-job" %}})
- [Dapr CLI workflow commands]({{% ref dapr-workflow.md %}})
