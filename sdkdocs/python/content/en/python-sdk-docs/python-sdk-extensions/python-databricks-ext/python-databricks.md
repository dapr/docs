---
type: docs
title: "Getting started with the Dapr Databricks Python SDK extension"
linkTitle: "Databricks"
weight: 30000
description: How to turn Databricks Lakeflow streaming records into durable Dapr Workflow executions
---

Let's run a fraud-remediation example that turns simulated Databricks Lakeflow records into durable
Dapr Workflow executions. With the
[provided example](https://github.com/dapr/python-sdk/tree/main/examples/databricks), you will:

- Run a Dapr Workflow (`fraud_remediation`) that freezes a card, notifies the customer, opens an
  investigation, waits for an analyst decision, and resolves the case
- Feed it two simulated Lakeflow micro-batches through `dapr.ext.databricks`'s batch handler — no
  Databricks workspace or `pyspark` required for this part
- See a retried micro-batch schedule zero duplicate workflow executions, because every instance ID
  is derived deterministically from the record's own business key

```text
Databricks Lakeflow identifies a suspicious transaction
                |
         dapr.ext.databricks sink
                |
        FraudRemediationWorkflow
                |
  freeze card -> notify customer -> open investigation
                |
         wait for analyst decision
                |
            resolve case
```

This example uses the default configuration from `dapr init` in
[self-hosted mode](https://github.com/dapr/cli#install-dapr-on-your-local-machine-self-hosted).

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}}) installed
- Initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- [Python 3.10+](https://www.python.org/downloads/) installed
- [Dapr Python package](/developing-applications/sdks/python/), the
  [workflow extension]({{% ref python-workflow-ext %}}), and the Databricks extension installed:
  ```bash
  pip install "dapr[workflow,databricks]"
  ```

## Set up the environment

Clone the Python SDK repo:

```bash
git clone https://github.com/dapr/python-sdk.git
```

From the repo root, go to the Databricks example:

```bash
cd examples/databricks
```

This example has two files:

- **`fraud_remediation_workflow.py`** — the Dapr Workflow side: the `fraud_remediation` workflow and
  its activities. Its `__main__` block simulates a small Lakeflow micro-batch in-process using
  `DaprWorkflowBatchHandler` directly — the same building block `register_workflow_sink` uses
  internally — then retries the identical batch to demonstrate that no duplicate workflow
  executions are created. This is the file you'll run below.
- **`fraud_remediation_pipeline.py`** — the Databricks Lakeflow side: `register_workflow_sink` plus
  the `@dp.append_flow` that feeds it. This file is illustrative only — it depends on
  `pyspark.pipelines` (provided by the Databricks Lakeflow runtime, not `pip install pyspark`) and a
  Unity Catalog table, so it can't run locally. Copy its pattern into an actual Databricks Lakeflow
  pipeline to wire the integration up for real.

## Run the application locally

To run the example, start the Python program and a Dapr sidecar together:

```bash
dapr run --app-id fraud-remediation-demo -- python3 fraud_remediation_workflow.py
```

**Expected output** (interleaved with Dapr/durabletask log lines):

```text
*** Lakeflow micro-batch 1: scheduling fraud remediation workflows
*** Micro-batch 1 handed off; each workflow now runs independently
*** Simulating a Lakeflow retry of the same micro-batch
*** Retry complete: no duplicate workflow executions were created
*** Triggered by sink 'fraud_actions', batch 1
*** Freezing card for transaction T-1001 (customer C-1)
*** Notifying customer C-1 about the frozen card
*** Opened investigation CASE-T-1001
*** Resolved CASE-T-1001: CONFIRMED_FRAUD
*** Workflow fraud-fraud_actions-v1-T-1001 completed: {"case_id": "CASE-T-1001", "decision": "CONFIRMED_FRAUD"}
... (and the same for T-1002)
```

Look for the structured `dapr.ext.databricks: sink=... outcome=...` log lines: the first
micro-batch reports `outcome=newly_scheduled` for both transactions, and the simulated retry
reports `outcome=already_existed` for both — the same transaction never starts a second
remediation workflow.

When you're done:

```bash
dapr stop --app-id fraud-remediation-demo
```

## What happened?

1. **`register_workflow_sink`** (used inside the example's batch handler, and the function you'd
   call from a real `@dp.append_flow` pipeline) computes a deterministic workflow instance ID for
   every record — `<namespace>-<sink>-<generation>-<business_key>` — never a random UUID.
2. For each record, the handler checks whether a workflow instance with that ID already exists. If
   not, it schedules one; if so, it treats the record as already handled. Both the first micro-batch
   and the simulated retry go through this same check, which is why the retry logs
   `outcome=already_existed` instead of starting a second `fraud_remediation` execution.
3. Once scheduled, each workflow instance runs **independently** of the Lakeflow batch that created
   it — `freeze card -> notify customer -> open investigation -> wait for an analyst decision ->
   resolve case` continues even after the streaming micro-batch has moved on.
4. If neither the "does it exist" check nor the schedule call can complete (Dapr unavailable, a
   timeout, an auth failure), the whole micro-batch fails so Lakeflow retries it — the sink never
   reports success while a record's fate is unknown.

This is **retry-safe, not exactly-once**: it depends on Dapr retaining that instance's
history/state. See the
[delivery semantics and full-refresh section](https://github.com/dapr/python-sdk/blob/main/dapr/ext/databricks/README.md#delivery-semantics)
of the extension's reference docs for what that means for your workflow-history retention, and how
`generation` lets you deliberately replay business actions after a full Lakeflow pipeline refresh.

## Next steps

- Copy `fraud_remediation_pipeline.py`'s pattern into a real Databricks Lakeflow pipeline to wire
  this up against real streaming data.
- See the
  [full configuration reference](https://github.com/dapr/python-sdk/blob/main/dapr/ext/databricks/README.md) —
  composite business keys, custom input mapping, bounded concurrency, and observability.
- Learn more about authoring the workflow side: [Dapr Workflow]({{% ref python-workflow-ext %}}).
