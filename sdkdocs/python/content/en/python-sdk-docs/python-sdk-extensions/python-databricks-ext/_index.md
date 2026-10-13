---
type: docs
title: "Dapr Python SDK integration with Databricks Lakeflow"
linkTitle: "Databricks"
weight: 500000
description: How to turn Databricks Lakeflow streaming records into durable Dapr Workflow executions
no_list: true
---

The Dapr Python SDK provides a Databricks Lakeflow integration, `dapr.ext.databricks`, that turns
records emitted by a Lakeflow streaming pipeline into durable [Dapr Workflow]({{% ref python-workflow-ext %}})
executions.

External side effects — freezing a card, calling a partner API, opening a case for a human to
review — have fundamentally different reliability requirements than transformations inside a data
pipeline. Instead of writing that business logic directly inside Lakeflow's `foreach_batch_sink`,
hand the record to a Dapr Workflow and let it continue independently, with retries, timers,
human-in-the-loop waits, and crash recovery, all outside the streaming query's lifetime.

```text
Databricks Lakeflow
       │
       │ streaming records
       ▼
Dapr Databricks Sink
       │
       ▼
Dapr Workflow
       │
  ┌────┼──────────────┐
  ▼    ▼              ▼
 APIs  SaaS          Humans
       systems
```

## Installation

You can download and install the Dapr Databricks extension with:

```bash
pip install "dapr[workflow,databricks]"
```

## Example

```python
from pyspark import pipelines as dp
from dapr.ext.databricks import register_workflow_sink

register_workflow_sink(
    name='order_actions',
    workflow='process_order',
    id_field='order_id',
    namespace='orders',
)

@dp.append_flow(target='order_actions', name='order_actions_flow')
def order_actions_flow():
    return spark.readStream.table('validated_orders')
```

`register_workflow_sink` registers the `foreach_batch_sink` for you — you do not write one by hand
for the standard case. Every workflow instance ID is derived deterministically from
`namespace`/`name`/`generation` and the record's own business key (`id_field`, never a random
UUID), so a Lakeflow retry of the same micro-batch never starts a second workflow execution for the
same record.

## Next steps

{{< button text="Getting started with the Dapr Databricks Python SDK extension" page="python-databricks.md" >}}

Learn more:
- [Full configuration reference, composite keys, and full-refresh handling](https://github.com/dapr/python-sdk/blob/main/dapr/ext/databricks/README.md)
- [Fraud-remediation example](https://github.com/dapr/python-sdk/tree/main/examples/databricks) — a
  complete, runnable (no Databricks account needed) walkthrough
- [Dapr Workflow]({{% ref workflow-overview %}}), which every scheduled instance runs on
