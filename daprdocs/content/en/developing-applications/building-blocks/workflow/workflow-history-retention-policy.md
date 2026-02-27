---
type: docs
title: History Retention Policy
linkTitle: History Retention Policy
weight: 8000
description: "Define retention policy to manage workflow state history state"
---

Dapr workflow state is stored in the [actor state store]{{ %ref workflow-architecture.md#state-store-usage %}}.
By default, Dapr Workflows retains the complete history of workflow state changes indefinitely.
This means historical workflows can be queried and inspected at any time.
Running many workflows or workflows which generate large amounts of state change history can lead to increased storage usage, which can eventually fill up the state store disk space.

To help manage storage usage, Dapr Workflows supports configuring a history retention policy.
The retention policy defines how long to retain workflow state change history before it is deleted.
Workflows will only be eligible for deletion once it has reached a **terminal state** (`Completed`, `Failed`, or `Terminated`).
Each workflow **terminal state** can have a custom retention duration, as well as a default retention duration for any terminal states not explicitly configured.
The duration is defined as a [Go duration string](https://pkg.go.dev/time#ParseDuration) (for example, `72h` for 72 hours, or `30m` for 30 minutes).

{{% alert title="Note" color="primary" %}}
It can be useful to configure a short retention duration for `Completed` workflows, while retaining `Failed` and `Terminated` workflows for longer periods to allow for investigation.
{{% /alert %}}

The following example configuration sets each of the terminal states.
The `anyTerminal` property set here would take no effect as all terminal states are explicitly configured, however it is included for reference.

See the [Dapr Configuration documentation]({{% ref configuration-overview.md %}}) for more information on how to apply configuration to your Dapr applications.

```
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
