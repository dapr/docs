---
type: docs
title: "Quickstart: Workflow with Python"
linkTitle: "Workflow with Python"
weight: 1
url: /getting-started/quickstarts/workflow/python/
description: "Run a Python workflow without Docker, stop it in the middle, and watch it continue"
---

In this quickstart, you run an order workflow, stop the app while the workflow waits, and start the app again. The workflow continues from its history.

## Why and when to use a workflow

A workflow is code that Dapr runs step by step and saves after each step. If the app stops, Dapr runs the workflow again from the saved history. The steps that finished do not run again.

Use a workflow when:

- The work has many steps and each step can fail.
- The work waits for a person, a timer, or an outside event, for minutes or days.
- You must undo earlier steps when a later step fails.

A plain service call is enough when one request does one short job and the caller can retry the whole request.

## Run the sample without Docker

You need the [Dapr CLI]({{% ref install-dapr-cli.md %}}) and [uv](https://docs.astral.sh/uv/getting-started/installation/). SQLite keeps the workflow state, so you do not need Docker or Redis.

1. Clone the repository and go to the sample:

    ```sh
    git clone https://github.com/dapr/quickstarts.git
    cd quickstarts/workflows/python/sdk
    ```

1. Install the Dapr binaries. This does not start them:

    ```sh
    dapr init --slim
    ```

1. In a terminal in this directory, start the Scheduler service:

    ```sh
    $HOME/.dapr/bin/scheduler --etcd-data-dir ./scheduler-data
    ```

1. In a second terminal in the same directory, start the Placement service:

    ```sh
    $HOME/.dapr/bin/placement --healthz-port 8081 --metrics-port 9091
    ```

1. In a third terminal in the same directory, install the dependencies:

    ```sh
    uv sync
    ```

The commands are for Linux and macOS. For Windows, see the README of the sample.

## Stop the app and continue the workflow

The order is 2 cars at $5,000 each, a total of $10,000. An order over $5,000 needs approval, so the workflow waits.

1. In the third terminal, set an order ID. The app uses it as the workflow instance ID:

    ```sh
    export ORDER_ID=order-$(date +%Y%m%d-%H%M%S)
    ```

1. Run the app:

    ```sh
    uv run dapr run -f dapr-sqlite.yaml
    ```

    The log shows the activities that run before the approval, and this line:

    ```
    Approval requested for order <id>. Waiting for approval.
    ```

1. Stop the app with Ctrl+C. The workflow is not complete.

1. Start the app again in the same terminal:

    ```sh
    uv run dapr run -f dapr-sqlite.yaml
    ```

    The log shows this line:

    ```
    Order <id> is already running. Waiting for it to finish.
    ```

1. In a fourth terminal, set `ORDER_ID` to the ID that the app printed. Then approve the order:

    ```sh
    export ORDER_ID=<id>
    dapr workflow raise-event $ORDER_ID/ApprovalEvent --app-id order-processor --input '{"approved": true}'
    ```

    The first terminal shows the payment, the inventory update, and the last line:

    ```
    Workflow completed: COMPLETED
    ```

To start again with no workflow state, stop all processes. Delete the `scheduler-data` folder and the `workflows.db` file in the `order-processor` folder.

## What you saw

- The steps that finished before the stop did not run again.
- The workflow continued from its history.
- A step that was in progress when you stopped the app can run again. Write each step so that a second run is safe.

## Next: the tutorials

Follow the tutorials in this order. Each one is in the `tutorials/workflow/python` folder of the [quickstarts repository](https://github.com/dapr/quickstarts/tree/master/tutorials/workflow/python).

1. This quickstart.
1. Durable execution basics: [fundamentals](https://github.com/dapr/quickstarts/tree/master/tutorials/workflow/python/fundamentals).
1. The patterns:
    - [Task chaining](https://github.com/dapr/quickstarts/tree/master/tutorials/workflow/python/task-chaining)
    - [Fan-out/fan-in](https://github.com/dapr/quickstarts/tree/master/tutorials/workflow/python/fan-out-fan-in)
    - [External events](https://github.com/dapr/quickstarts/tree/master/tutorials/workflow/python/external-system-interaction)
    - [Child workflows](https://github.com/dapr/quickstarts/tree/master/tutorials/workflow/python/child-workflows)
    - [Compensation](https://github.com/dapr/quickstarts/tree/master/tutorials/workflow/python/resiliency-and-compensation)
    - [Monitor](https://github.com/dapr/quickstarts/tree/master/tutorials/workflow/python/monitor-pattern)
1. A real app: [combined-patterns](https://github.com/dapr/quickstarts/tree/master/tutorials/workflow/python/combined-patterns).
1. Production: [Workflow architecture]({{% ref workflow-architecture.md %}}) and [Manage workflows]({{% ref howto-manage-workflow.md %}}).
