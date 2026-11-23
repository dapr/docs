---
type: docs
title: History Retention Policy
linkTitle: History Retention Policy
weight: 8000
description: "Define retention policy to manage workflow state history state"
---

Dapr workflow state is stored in the [actor state store]({{% ref "workflow-architecture.md#state-store-usage" %}}).
By default, Dapr Workflows retains the complete history of workflow state changes indefinitely.
This means historical workflows can be queried and inspected at any time.
Running many workflows or workflows which generate large amounts of state change history can lead to increased storage usage, which can eventually fill up the state store disk space.

To help manage storage usage, Dapr Workflows supports configuring a history retention policy.
The retention policy defines how long to retain workflow state change history before it is deleted.
Workflows will only be eligible for deletion once it has reached a **terminal state** (`Completed`, `Failed`, or `Terminated`).
Each workflow **terminal state** can have a custom retention duration, as well as a default retention duration for any terminal states not explicitly configured.
Specific workflow names can override these durations, see [Per-workflow retention](#per-workflow-retention).
The duration is defined as a [Go duration string](https://pkg.go.dev/time#ParseDuration) (for example, `72h` for 72 hours, or `30m` for 30 minutes).

{{% alert title="Note" color="primary" %}}
It can be useful to configure a short retention duration for `Completed` workflows, while retaining `Failed` and `Terminated` workflows for longer periods to allow for investigation.
{{% /alert %}}

{{% alert title="Important" color="warning" %}}
When adding or changing a retention policy, the policy only applies to workflows that **newly reach** a configured terminal state after the policy is in effect. It does **not** retroactively clean up workflows that are already in a terminal state.

To retroactively purge existing terminal workflows, use the Dapr CLI:

```bash
# Purge all terminal workflows older than a specific duration
dapr workflow purge --app-id <app-id> --all-older-than <duration>

# Purge only workflows with a specific status older than a duration
dapr workflow purge --app-id <app-id> --all-older-than <duration> --all-filter-status COMPLETED
dapr workflow purge --app-id <app-id> --all-older-than <duration> --all-filter-status FAILED
dapr workflow purge --app-id <app-id> --all-older-than <duration> --all-filter-status TERMINATED
```

When purging workflows, ensure that a workflow client is running for the same `app-id` so the workflow state machine can advance correctly. Avoid using the `--force` option while workflow instances may still be active, as this can corrupt the workflow state machine.

See [How to: Manage workflows]({{% ref howto-manage-workflow.md %}}) for more details on the purge command and additional cautions.
{{% /alert %}}

The following example configuration sets each of the terminal states.
The `anyTerminal` property set here would take no effect as all terminal states are explicitly configured, however it is included for reference.

See the [Dapr Configuration documentation]({{% ref configuration-overview.md %}}) for more information on how to apply configuration to your Dapr applications.

```yaml
kind: Configuration
metadata:
  name: appconfig
spec:
  workflow:
    stateRetentionPolicy:
      anyTerminal: "360h"
      completed: "1m"
      failed: "720h"
      terminated: "360h"
```

## Per-workflow retention

For example, you may want to purge high-volume order workflows as soon as they complete, while keeping audit workflows for 90 days.
Use the `workflows` list under `stateRetentionPolicy` to set retention durations for specific workflow names.
Each entry takes a `name` and the same `anyTerminal`, `completed`, `failed`, and `terminated` fields as the app-wide policy.

```yaml
kind: Configuration
metadata:
  name: appconfig
spec:
  workflow:
    stateRetentionPolicy:
      anyTerminal: "360h"
      completed: "1h"
      workflows:
        - name: OrderWorkflow
          completed: "0s"
          failed: "720h"
        - name: AuditWorkflow
          anyTerminal: "2160h"
```

When a workflow instance reaches a terminal state, Dapr picks the retention duration in this order:

1. The matching workflow entry's duration for that terminal state.
1. The matching workflow entry's `anyTerminal`.
1. The app-wide duration for that terminal state.
1. The app-wide `anyTerminal`.

{{< mermaid >}}
flowchart TD
    T["Instance reaches a terminal state"] --> E{"Entry for this<br/>workflow name?"}
    E -->|yes| ES{"Entry sets a duration<br/>for this state?"}
    ES -->|yes| U1["Use the entry duration"]
    ES -->|no| EA{"Entry sets<br/>anyTerminal?"}
    EA -->|yes| U2["Use the entry anyTerminal"]
    EA -->|no| AS
    E -->|no| AS{"App-wide duration<br/>for this state?"}
    AS -->|yes| U3["Use the app-wide duration"]
    AS -->|no| AA{"App-wide<br/>anyTerminal?"}
    AA -->|yes| U4["Use the app-wide anyTerminal"]
    AA -->|no| N["Not purged automatically"]
{{< /mermaid >}}

If none of these is set, the instance is not purged automatically.
In the example above, a completed `OrderWorkflow` is purged immediately and a terminated `OrderWorkflow` is purged after 360 hours.
A completed `AuditWorkflow` is purged after 2160 hours, and any other completed workflow is purged after 1 hour.

The `name` must exactly match, including case, the name the workflow is registered with.
A workflow version does not change the name.
A child workflow is matched by its own name, not its parent's, so a parent and its children can be purged at different times.
In multi-app workflows, a child workflow running on another app follows that app's Configuration.
`ContinueAsNew` keeps the name, and an instance ID that is re-scheduled under a different workflow name takes that name's durations.

Each entry needs a `name` and at least one duration, and a name can appear only once in the list.
Dapr refuses to start with a configuration that breaks these rules, and on Kubernetes the API server also rejects a Configuration whose entry has no `name` or repeats one.

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
