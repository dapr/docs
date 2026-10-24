---
type: docs
title: "Quickstart: Workflow"
linkTitle: Workflow
weight: 73
description: Get started with the Dapr Workflow building block
---

{{% alert title="Note" color="primary" %}}
Redis is currently used as the state store component for Workflows in the Quickstarts. However, Redis does not support transaction rollbacks and should not be used in production as an actor state store.

To run a quickstart without Docker and Redis, use the SQLite run file that the sample provides. Each sample README has a "Run without Docker" section: [Python](https://github.com/dapr/quickstarts/tree/master/workflows/python/sdk#run-without-docker), [JavaScript](https://github.com/dapr/quickstarts/tree/master/workflows/javascript/sdk#run-without-docker), [.NET](https://github.com/dapr/quickstarts/tree/master/workflows/csharp/sdk#run-without-docker), [Java](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk#run-without-docker) and [Go](https://github.com/dapr/quickstarts/tree/master/workflows/go/sdk#run-without-docker).
{{% /alert %}}

Let's take a look at the Dapr [Workflow building block]({{% ref workflow-overview.md %}}). In this Quickstart, you'll create a simple console application to demonstrate Dapr's workflow programming model and the workflow management APIs.

In this guide, you'll:

- Run the `order-processor` application.
- Start the workflow and watch the workflow activites/tasks execute.
- Review the workflow logic and the workflow activities and how they're represented in the code.

<img src="/images/workflow-quickstart-overview.png" width=800 style="padding-bottom:15px;">

The workflow contains the following activities:

- `NotifyActivity`: Utilizes a logger to print out messages throughout the workflow.
- `VerifyInventoryActivity`: Checks the state store to ensure that there is enough inventory for the purchase.
- `RequestApprovalActivity`: Requests approval for orders over a certain cost threshold.
- `ProcessPaymentActivity`: Processes and authorizes the payment.
- `UpdateInventoryActivity`: Removes the requested items from the state store and updates the store with the new remaining inventory value.

The workflow also contains business logic:
- The workflow will not proceed with the payment if there is insufficient inventory.
- The workflow will call the `RequestApprovalActivity` and wait for an external approval event when the total cost of the order is greater than 5000.
- If the order is not approved or the approval is timed out, the workflow not proceed with the payment.

<img src="/images/workflow-quickstart-controlflow.png" width=800 style="padding-bottom:15px;">

Select your preferred language-specific Dapr SDK before proceeding with the Quickstart.
{{< tabpane text=true >}}

 <!-- Python -->
{{% tab "Python" %}}

The `order-processor` console app starts and manages the `order_processing_workflow`, which simulates purchasing items from a store. The workflow consists of five unique workflow activities, or tasks:

- `notify_activity`: Prints messages throughout the workflow. These messages notify you when:
  - You have insufficient inventory
  - Your payment couldn't be processed, etc.
- `verify_inventory_activity`: Checks the state store to ensure there is enough inventory present for purchase.
- `request_approval_activity`: Requests approval for orders over a certain cost threshold.
- `process_payment_activity`: Processes and authorizes the payment.
- `update_inventory_activity`: Removes the requested items from the state store and updates the store with the new remaining inventory value.

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.11 or later installed](https://www.python.org/downloads/).
- [uv](https://docs.astral.sh/uv/getting-started/installation/), the Python package manager that the sample uses.
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/workflows/python/sdk).

```bash
git clone --depth 1 https://github.com/dapr/quickstarts.git
```

From the folder where you ran `git clone`, navigate to the `python/sdk` directory:

```bash
cd quickstarts/workflows/python/sdk
```

Install the sample dependencies, including the Dapr Python SDK, with `uv`:

```bash
uv sync
```

### Step 3: Run the order processor app

In the terminal, start the order processor app alongside a Dapr sidecar using [Multi-App Run]({{% ref multi-app-dapr-run %}}). From the `python/sdk` directory, run the following command:

```bash
uv run dapr run -f .
```

This starts the `order-processor` app with unique workflow ID and runs the workflow activities.

Expected output:

```text
== APP - order-processor == *** Welcome to the Dapr Workflow console app sample!
== APP - order-processor == *** Using this app, you can place orders that start workflows.
== APP - order-processor == item: InventoryItem(item_name=Paperclip, per_item_cost=5, quantity=100)
== APP - order-processor == item: InventoryItem(item_name=Cars, per_item_cost=5000, quantity=10)
== APP - order-processor == item: InventoryItem(item_name=Computers, per_item_cost=500, quantity=100)
== APP - order-processor == ==========Begin the purchase of item:==========
== APP - order-processor == Starting order workflow, purchasing 1 of cars
== APP - order-processor == Received order 0a8c4d9b59094191bf77e111c38a5e55 for 1 cars at $5000 !
== APP - order-processor == Verifying inventory for order 0a8c4d9b59094191bf77e111c38a5e55 of 1 cars
== APP - order-processor == There are 10 Cars available for purchase
== APP - order-processor == Processing payment: 0a8c4d9b59094191bf77e111c38a5e55 for 1 cars at 5000 USD
== APP - order-processor == Payment for request ID 0a8c4d9b59094191bf77e111c38a5e55 processed successfully
== APP - order-processor == Checking inventory for order 0a8c4d9b59094191bf77e111c38a5e55 for 1 cars
== APP - order-processor == There are now 9 cars left in stock
== APP - order-processor == Order 0a8c4d9b59094191bf77e111c38a5e55 has completed!
== APP - order-processor == Workflow completed! Result: {"processed": true, "__durabletask_autoobject__": true}
```

### (Optional) Step 4: View in Zipkin

Running `dapr init` launches the [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) Docker container. If the container has stopped running, launch the Zipkin Docker container with the following command:

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

View the workflow trace spans in the Zipkin web UI (typically at `http://localhost:9411/zipkin/`).

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### What happened?

When you ran `dapr run -f .`:

1. An OrderPayload is made containing one car.
2. A unique order ID for the workflow is generated (in the above example, `0a8c4d9b59094191bf77e111c38a5e55`) and the workflow is scheduled.
3. The `notify_activity` workflow activity sends a notification saying an order for one car has been received.
4. The `verify_inventory_activity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock. The inventory is sufficient so the workflow continues.
5. The total cost of the order is 5000, so the workflow will not call the `request_approval_activity` activity.
6. The `process_payment_activity` workflow activity begins processing payment for order `0a8c4d9b59094191bf77e111c38a5e55` and confirms if successful.
7. The `update_inventory_activity` workflow activity updates the inventory with the current available cars after the order has been processed.
8. The `notify_activity` workflow activity sends a notification saying that order `0a8c4d9b59094191bf77e111c38a5e55` has completed.
9. The workflow terminates as completed and the OrderResult is set to processed.

#### `order-processor/app.py`

In the application's program file:

- The unique workflow order ID is generated
- The workflow is scheduled
- The workflow status is retrieved
- The workflow and the workflow activities it invokes are registered

```python
from datetime import datetime
from time import sleep

from dapr.clients import DaprClient
from dapr.conf import settings
from dapr.ext.workflow import DaprWorkflowClient, WorkflowStatus

from workflow import wfr, order_processing_workflow
from model import InventoryItem, OrderPayload

store_name = "statestore"
workflow_name = "order_processing_workflow"
default_item_name = "cars"

class WorkflowConsoleApp:    
    def main(self):
        print("*** Welcome to the Dapr Workflow console app sample!", flush=True)
        print("*** Using this app, you can place orders that start workflows.", flush=True)
        
        wfr.start()
        # Wait for the sidecar to become available
        sleep(5)

        wfClient = DaprWorkflowClient()

        baseInventory = {
            "paperclip": InventoryItem("Paperclip", 5, 100),
            "cars": InventoryItem("Cars", 5000, 10),
            "computers": InventoryItem("Computers", 500, 100),
        }


        daprClient = DaprClient(address=f'{settings.DAPR_RUNTIME_HOST}:{settings.DAPR_GRPC_PORT}')
        self.restock_inventory(daprClient, baseInventory)

        print("==========Begin the purchase of item:==========", flush=True)
        item_name = default_item_name
        order_quantity = 1
        total_cost = int(order_quantity) * baseInventory[item_name].per_item_cost
        order = OrderPayload(item_name=item_name, quantity=int(order_quantity), total_cost=total_cost)

        print(f'Starting order workflow, purchasing {order_quantity} of {item_name}', flush=True)
        instance_id = wfClient.schedule_new_workflow(
            workflow=order_processing_workflow, input=order.to_json())

        try:
            state = wfClient.wait_for_workflow_completion(instance_id=instance_id, timeout_in_seconds=30)
            if not state:
                print("Workflow not found!")
            elif state.runtime_status.name == 'COMPLETED':
                print(f'Workflow completed! Result: {state.serialized_output}')
            else:
                print(f'Workflow failed! Status: {state.runtime_status.name}')  # not expected
        except TimeoutError:
            print('*** Workflow timed out!')

        wfr.shutdown()

    def restock_inventory(self, daprClient: DaprClient, baseInventory):
        for key, item in baseInventory.items():
            print(f'item: {item}')
            item_str = f'{{"name": "{item.item_name}", "quantity": {item.quantity},\
                          "per_item_cost": {item.per_item_cost}}}'
            daprClient.save_state(store_name, key, item_str)

if __name__ == '__main__':
    app = WorkflowConsoleApp()
    app.main()
```

#### `order-processor/workflow.py`

In `workflow.py`, the workflow is defined as a class with all of its associated tasks (determined by workflow activities).

```python
from datetime import timedelta
import json

from dapr.ext.workflow import DaprWorkflowContext, WorkflowActivityContext, WorkflowRuntime, when_any
from dapr.clients import DaprClient
from dapr.conf import settings

from model import InventoryItem, Notification, InventoryRequest, OrderPayload, OrderResult,\
    PaymentRequest, InventoryResult

store_name = "statestore"

wfr = WorkflowRuntime()


@wfr.workflow(name="order_processing_workflow")
def order_processing_workflow(ctx: DaprWorkflowContext, order_payload_str: str):
    """Defines the order processing workflow.
    When the order is received, the inventory is checked to see if there is enough inventory to
    fulfill the order. If there is enough inventory, the payment is processed and the inventory is
    updated. If there is not enough inventory, the order is rejected.
    If the total order is greater than $5,000, the order is sent to a manager for approval.
    """
    order_id = ctx.instance_id
    order_payload=json.loads(order_payload_str)
    yield ctx.call_activity(notify_activity, 
                            input=Notification(message=('Received order ' +order_id+ ' for '
                                               +f'{order_payload["quantity"]}' +' ' +f'{order_payload["item_name"]}'
                                               +' at $'+f'{order_payload["total_cost"]}' +' !')))
    result = yield ctx.call_activity(verify_inventory_activity,
                                     input=InventoryRequest(request_id=order_id,
                                                            item_name=order_payload["item_name"],
                                                            quantity=order_payload["quantity"]))
    if not result.success:
        yield ctx.call_activity(notify_activity,
                                input=Notification(message='Insufficient inventory for '
                                                   +f'{order_payload["item_name"]}'+'!'))
        return OrderResult(processed=False)
    
    if order_payload["total_cost"] > 5000:
        yield ctx.call_activity(request_approval_activity, input=order_payload)
        approval_task = ctx.wait_for_external_event("approval_event")
        timeout_event = ctx.create_timer(timedelta(seconds=30))
        winner = yield when_any([approval_task, timeout_event])
        if winner == timeout_event:
            yield ctx.call_activity(notify_activity, 
                                    input=Notification(message='Order '+order_id
                                                       +' has been cancelled due to approval timeout.'))
            return OrderResult(processed=False)
        approval_result = yield approval_task
        if approval_result == False:
            yield ctx.call_activity(notify_activity, input=Notification(
                message=f'Order {order_id} was not approved'))
            return OrderResult(processed=False)    
    
    yield ctx.call_activity(process_payment_activity, input=PaymentRequest(
        request_id=order_id, item_being_purchased=order_payload["item_name"],
        amount=order_payload["total_cost"], quantity=order_payload["quantity"]))

    try:
        yield ctx.call_activity(update_inventory_activity, 
                                input=PaymentRequest(request_id=order_id,
                                                     item_being_purchased=order_payload["item_name"],
                                                     amount=order_payload["total_cost"],
                                                     quantity=order_payload["quantity"]))
    except Exception:
        yield ctx.call_activity(notify_activity, 
                                input=Notification(message=f'Order {order_id} Failed!'))
        return OrderResult(processed=False)

    yield ctx.call_activity(notify_activity, input=Notification(
        message=f'Order {order_id} has completed!'))
    return OrderResult(processed=True)

@wfr.activity(name="notify_activity")
def notify_activity(ctx: WorkflowActivityContext, input: Notification):
    """Defines Notify Activity. This is used by the workflow to send out a notification"""
    print(input.message, flush=True)


@wfr.activity(name="process_payment_activity")
def process_payment_activity(ctx: WorkflowActivityContext, input: PaymentRequest):
    """Defines Process Payment Activity.This is used by the workflow to process a payment"""
    print(f'Processing payment: {input.request_id} for {input.quantity} {input.item_being_purchased} at {input.amount} USD', flush=True)
    print(f'Payment for request ID {input.request_id} processed successfully', flush=True)


@wfr.activity(name="verify_inventory_activity")
def verify_inventory_activity(ctx: WorkflowActivityContext,
                              input: InventoryRequest) -> InventoryResult:
    """Defines Verify Inventory Activity. This is used by the workflow to verify if inventory
    is available for the order"""
    print(f'Verifying inventory for order {input.request_id} of {input.quantity} {input.item_name}', flush=True)
    with DaprClient(f'{settings.DAPR_RUNTIME_HOST}:{settings.DAPR_GRPC_PORT}') as client:
        result = client.get_state(store_name, input.item_name)
    if result.data is None:
        return InventoryResult(False, None)
    res_json=json.loads(str(result.data.decode('utf-8')))
    print(f'There are {res_json["quantity"]} {res_json["name"]} available for purchase', flush=True)
    inventory_item = InventoryItem(item_name=input.item_name,
                                  per_item_cost=res_json['per_item_cost'],
                                  quantity=res_json['quantity'])

    if res_json['quantity'] >= input.quantity:
        return InventoryResult(True, inventory_item)
    return InventoryResult(False, None)



@wfr.activity(name="update_inventory_activity")
def update_inventory_activity(ctx: WorkflowActivityContext,
                              input: PaymentRequest) -> InventoryResult:
    """Defines Update Inventory Activity. This is used by the workflow to check if inventory
    is sufficient to fulfill the order and updates inventory by reducing order quantity from
    inventory."""
    print(f'Checking inventory for order {input.request_id} for {input.quantity} {input.item_being_purchased}', flush=True)
    with DaprClient(f'{settings.DAPR_RUNTIME_HOST}:{settings.DAPR_GRPC_PORT}') as client:
        result = client.get_state(store_name, input.item_being_purchased)
        res_json=json.loads(str(result.data.decode('utf-8')))
        new_quantity = res_json['quantity'] - input.quantity
        per_item_cost = res_json['per_item_cost']
        if new_quantity < 0:
            raise ValueError('Inventory update for request ID '+f'{input.item_being_purchased}'
                             +' could not be processed. Insufficient inventory.')
        new_val = f'{{"name": "{input.item_being_purchased}", "quantity": {str(new_quantity)}, "per_item_cost": {str(per_item_cost)}}}'
        client.save_state(store_name, input.item_being_purchased, new_val)
        print(f'There are now {new_quantity} {input.item_being_purchased} left in stock', flush=True)



@wfr.activity(name="request_approval_activity")
def request_approval_activity(ctx: WorkflowActivityContext,
                             input: OrderPayload):
    """Defines Request Approval Activity. This is used by the workflow to request approval
    for payment of an order. This activity is used only if the order total cost is greater than
    a particular threshold"""
    print(f'Requesting approval for payment of {input["total_cost"]} USD for {input["quantity"]} {input["item_name"]}', flush=True)
```
{{% /tab %}}

 <!-- JavaScript -->
{{% tab "JavaScript" %}}

The `order-processor` console app starts and manages the lifecycle of an order processing workflow that stores and retrieves data in a state store. The workflow consists of five workflow activities, or tasks:

- `notifyActivity`: Utilizes a logger to print out messages throughout the workflow. These messages notify the user when there is insufficient inventory, their payment couldn't be processed, and more.
- `verifyInventoryActivity`: Checks the state store to ensure that there is enough inventory present for purchase.
- `requestApprovalActivity`: Requests approval for orders over a certain threshold.
- `processPaymentActivity`: Processes and authorizes the payment.
- `updateInventoryActivity`: Updates the state store with the new remaining inventory value.

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Node.js 20 or later installed](https://nodejs.org/download/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/workflows/javascript/sdk).

```bash
git clone --depth 1 https://github.com/dapr/quickstarts.git
```

From the folder where you ran `git clone`, navigate to the `javascript/sdk` directory:

```bash
cd quickstarts/workflows/javascript/sdk
```

Install the pinned dependencies and build the TypeScript app:

```bash
npm ci
npm run build
```

### Step 3: Run the order processor app

In the terminal, start the order processor app alongside a Dapr sidecar using [Multi-App Run]({{% ref multi-app-dapr-run %}}). From the `javascript/sdk` directory, run the following command:

```bash
dapr run -f .
```

This starts the `order-processor` app with unique workflow ID and runs the workflow activities.

Expected output:

```log
== APP - order-processor == 2026-10-23T23:46:11.983Z INFO [Workflow, TaskHubWorker] Connected to sidecar. Waiting for work items...
== APP - order-processor == Workflow runtime started successfully
== APP - order-processor == 2026-10-23T23:46:11.989Z INFO [HTTPClient, HTTPClient] Sidecar Started
== APP - order-processor == 2026-10-23T23:46:11.991Z INFO [Workflow, TaskHubClient] Starting new orderProcessingWorkflow instance with ID = 5c26fcd3-f05e-4dc1-9a15-11eeb5445236
== APP - order-processor == 2026-10-23T23:46:12.005Z INFO [Workflow, TaskHubWorker] Received "Orchestrator Request" work item with instance id '5c26fcd3-f05e-4dc1-9a15-11eeb5445236'
== APP - order-processor == 2026-10-23T23:46:12.008Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Processing 2 new history event(s)
== APP - order-processor == 2026-10-23T23:46:12.008Z INFO [Workflow, orderProcessingWorkflow, 5c26fcd3-f05e-4dc1-9a15-11eeb5445236] Processing order 5c26fcd3-f05e-4dc1-9a15-11eeb5445236...
== APP - order-processor == 2026-10-23T23:46:12.008Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - order-processor == 2026-10-23T23:46:12.008Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Returning 1 action(s)
== APP - order-processor == 2026-10-23T23:46:12.013Z INFO [Workflow, TaskHubWorker] Received "Activity Request" work item
== APP - order-processor == Received order 5c26fcd3-f05e-4dc1-9a15-11eeb5445236 for 1 car at a total cost of 5000
== APP - order-processor == Workflow scheduled with ID: 5c26fcd3-f05e-4dc1-9a15-11eeb5445236
== APP - order-processor == 2026-10-23T23:46:12.017Z INFO [Workflow, TaskHubWorker] Received "Orchestrator Request" work item with instance id '5c26fcd3-f05e-4dc1-9a15-11eeb5445236'
== APP - order-processor == 2026-10-23T23:46:12.017Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Processing 2 new history event(s)
== APP - order-processor == 2026-10-23T23:46:12.018Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - order-processor == 2026-10-23T23:46:12.018Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Returning 1 action(s)
== APP - order-processor == Workflow started with the expected order
== APP - order-processor == 2026-10-23T23:46:12.019Z INFO [Workflow, TaskHubClient] Waiting 60 seconds for instance 5c26fcd3-f05e-4dc1-9a15-11eeb5445236 to complete...
== APP - order-processor == 2026-10-23T23:46:12.021Z INFO [Workflow, TaskHubWorker] Received "Activity Request" work item
== APP - order-processor == Verifying inventory for 5c26fcd3-f05e-4dc1-9a15-11eeb5445236 of 1 car
== APP - order-processor == There are 10 car in stock
== APP - order-processor == 2026-10-23T23:46:12.025Z INFO [Workflow, TaskHubWorker] Received "Orchestrator Request" work item with instance id '5c26fcd3-f05e-4dc1-9a15-11eeb5445236'
== APP - order-processor == 2026-10-23T23:46:12.025Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Processing 2 new history event(s)
== APP - order-processor == 2026-10-23T23:46:12.025Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - order-processor == 2026-10-23T23:46:12.025Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Returning 1 action(s)
== APP - order-processor == 2026-10-23T23:46:12.028Z INFO [Workflow, TaskHubWorker] Received "Activity Request" work item
== APP - order-processor == Payment of 5000 for 1 car processed successfully
== APP - order-processor == 2026-10-23T23:46:12.033Z INFO [Workflow, TaskHubWorker] Received "Orchestrator Request" work item with instance id '5c26fcd3-f05e-4dc1-9a15-11eeb5445236'
== APP - order-processor == 2026-10-23T23:46:12.033Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Processing 2 new history event(s)
== APP - order-processor == 2026-10-23T23:46:12.033Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - order-processor == 2026-10-23T23:46:12.033Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Returning 1 action(s)
== APP - order-processor == 2026-10-23T23:46:12.036Z INFO [Workflow, TaskHubWorker] Received "Activity Request" work item
== APP - order-processor == Inventory updated for 5c26fcd3-f05e-4dc1-9a15-11eeb5445236, there are now 9 car in stock
== APP - order-processor == 2026-10-23T23:46:12.040Z INFO [Workflow, TaskHubWorker] Received "Orchestrator Request" work item with instance id '5c26fcd3-f05e-4dc1-9a15-11eeb5445236'
== APP - order-processor == 2026-10-23T23:46:12.041Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Processing 2 new history event(s)
== APP - order-processor == 2026-10-23T23:46:12.041Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - order-processor == 2026-10-23T23:46:12.041Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Returning 1 action(s)
== APP - order-processor == 2026-10-23T23:46:12.047Z INFO [Workflow, TaskHubWorker] Received "Activity Request" work item
== APP - order-processor == Order 5c26fcd3-f05e-4dc1-9a15-11eeb5445236 processed successfully!
== APP - order-processor == 2026-10-23T23:46:12.052Z INFO [Workflow, TaskHubWorker] Received "Orchestrator Request" work item with instance id '5c26fcd3-f05e-4dc1-9a15-11eeb5445236'
== APP - order-processor == 2026-10-23T23:46:12.052Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Processing 2 new history event(s)
== APP - order-processor == 2026-10-23T23:46:12.052Z INFO [Workflow, orderProcessingWorkflow, 5c26fcd3-f05e-4dc1-9a15-11eeb5445236] Order 5c26fcd3-f05e-4dc1-9a15-11eeb5445236 has completed
== APP - order-processor == 2026-10-23T23:46:12.052Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Orchestration completed with status COMPLETED
== APP - order-processor == 2026-10-23T23:46:12.052Z INFO [Workflow, OrchestrationExecutor] 5c26fcd3-f05e-4dc1-9a15-11eeb5445236: Returning 1 action(s)
== APP - order-processor == 2026-10-23T23:46:12.053Z INFO [Workflow, TaskHubClient] Instance 5c26fcd3-f05e-4dc1-9a15-11eeb5445236 completed
== APP - order-processor == Workflow Status: COMPLETED
== APP - order-processor == Workflow result: {"processed":true}
```

### (Optional) Step 4: View in Zipkin

Running `dapr init` launches the [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) Docker container. If the container has stopped running, launch the Zipkin Docker container with the following command:

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

View the workflow trace spans in the Zipkin web UI (typically at `http://localhost:9411/zipkin/`).

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### What happened?

When you ran `dapr run -f .`:

1. A unique order ID for the workflow is generated (in the above example, `5c26fcd3-f05e-4dc1-9a15-11eeb5445236`) and the workflow is scheduled.
2. The `notifyActivity` workflow activity sends a notification saying an order for 1 car has been received.
3. The `verifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock.
4. Your workflow starts and the app confirms that the workflow has the expected order.
5. The total cost of the order is 5000, so the workflow will not call the `requestApprovalActivity` activity.
6. The `processPaymentActivity` workflow activity begins processing payment for order `5c26fcd3-f05e-4dc1-9a15-11eeb5445236` and confirms if successful.
7. The `updateInventoryActivity` workflow activity updates the inventory with the current available cars after the order has been processed.
8. The `notifyActivity` workflow activity sends a notification saying that order `5c26fcd3-f05e-4dc1-9a15-11eeb5445236` has completed and processed.
9. The workflow terminates as completed and processed.

#### `order-processor/app.ts`

In the application file:

- The workflow runtime is created with the workflow and the workflow activities it invokes registered
- The workflow runtime is started
- The `processOrder` function runs the order
- The workflow runtime and the clients are stopped when the order is done

```typescript
import { DaprWorkflowClient } from "@dapr/dapr";
import { createWorkflowRuntime, processOrder } from "./orderProcessor";
import { daprClient } from "./orderProcessingWorkflow";

async function start() {
  const workflowWorker = createWorkflowRuntime();
  const workflowClient = new DaprWorkflowClient();
  try {
    await workflowWorker.start();
    console.log("Workflow runtime started successfully");
    await processOrder(workflowClient);
  } finally {
    await workflowWorker.stop();
    await workflowClient.stop();
    await daprClient.stop();
  }
}

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

#### `order-processor/orderProcessor.ts`

In `orderProcessor.ts`:

- The workflow and the workflow activities it invokes are registered
- The inventory is saved to the state store
- The unique workflow order ID is generated and the workflow is scheduled
- The app waits for the workflow to start and to complete, and then retrieves the workflow status and the result

```typescript
import { DaprWorkflowClient, WorkflowRuntime, WorkflowRuntimeStatus } from "@dapr/dapr";
import { InventoryItem, OrderPayload, OrderResult } from "./model";
import { daprClient, storeName, notifyActivity, orderProcessingWorkflow, processPaymentActivity, requestApprovalActivity, verifyInventoryActivity, updateInventoryActivity } from "./orderProcessingWorkflow";

export function createWorkflowRuntime(): WorkflowRuntime {
  return new WorkflowRuntime()
    .registerWorkflow(orderProcessingWorkflow)
    .registerActivity(notifyActivity)
    .registerActivity(verifyInventoryActivity)
    .registerActivity(requestApprovalActivity)
    .registerActivity(processPaymentActivity)
    .registerActivity(updateInventoryActivity);
}

export async function processOrder(workflowClient: DaprWorkflowClient): Promise<string> {
  const inventory = new InventoryItem("car", 5000, 10);
  await daprClient.state.save(storeName, [{ key: inventory.itemName, value: inventory }]);

  const order = new OrderPayload("car", 5000, 1);
  const id = await workflowClient.scheduleNewWorkflow(orderProcessingWorkflow, order);
  console.log(`Workflow scheduled with ID: ${id}`);

  const started = await workflowClient.waitForWorkflowStart(id, true, 30);
  if (!started) {
    throw new Error(`Workflow ${id} did not start`);
  }
  const input = started.getInput<OrderPayload>();
  if (input?.itemName !== order.itemName || input.quantity !== order.quantity || input.totalCost !== order.totalCost) {
    throw new Error(`Workflow ${id} input did not match the order`);
  }
  console.log("Workflow started with the expected order");

  const completed = await workflowClient.waitForWorkflowCompletion(id, true, 60);
  if (!completed || completed.runtimeStatus !== WorkflowRuntimeStatus.COMPLETED) {
    throw new Error(`Workflow ${id} did not complete successfully: ${completed?.workflowFailureDetails?.getErrorMessage() ?? completed?.runtimeStatus}`);
  }
  console.log(`Workflow Status: ${WorkflowRuntimeStatus[completed.runtimeStatus]}`);

  const output = completed.getOutput<OrderResult>();
  if (output?.processed !== true) {
    throw new Error(`Order ${id} was not processed`);
  }
  const result = `Workflow result: ${JSON.stringify(output)}`;
  console.log(result);
  return result;
}
```

#### `order-processor/orderProcessingWorkflow.ts`

In `orderProcessingWorkflow.ts`, the workflow is defined as a class with all of its associated tasks (determined by workflow activities).

```typescript
import { Task, WorkflowActivityContext, WorkflowContext, DaprClient } from "@dapr/dapr";
import { ApprovalResponse, InventoryItem, InventoryRequest, InventoryResult, OrderNotification, OrderPayload, OrderPaymentRequest, OrderResult } from "./model";

export const daprClient = new DaprClient();
export const storeName = "statestore";

async function getInventory(itemName: string): Promise<InventoryItem | undefined> {
  const result = await daprClient.state.get(storeName, itemName);
  if (result == null || result === "") {
    return undefined;
  }
  if (typeof result !== "object" || typeof result.itemName !== "string" ||
      typeof result.perItemCost !== "number" || typeof result.quantity !== "number") {
    throw new Error(`Invalid inventory for ${itemName}`);
  }
  return new InventoryItem(result.itemName, result.perItemCost, result.quantity);
}

export const notifyActivity = async (_: WorkflowActivityContext, notification: OrderNotification) => {
  console.log(notification.message);
};

export const verifyInventoryActivity = async (_: WorkflowActivityContext, request: InventoryRequest) => {
  console.log(`Verifying inventory for ${request.requestId} of ${request.quantity} ${request.itemName}`);
  const inventory = await getInventory(request.itemName);
  if (!inventory) {
    console.log(`No inventory found for ${request.itemName}`);
    return new InventoryResult(false, undefined);
  }
  console.log(`There are ${inventory.quantity} ${inventory.itemName} in stock`);
  return new InventoryResult(inventory.quantity >= request.quantity, inventory);
};

export const requestApprovalActivity = async (_: WorkflowActivityContext, order: OrderPayload) => {
  console.log(`Requesting approval for ${order.quantity} ${order.itemName} at a total cost of ${order.totalCost}`);
};

export const processPaymentActivity = async (_: WorkflowActivityContext, request: OrderPaymentRequest) => {
  console.log(`Payment of ${request.amount} for ${request.quantity} ${request.itemBeingPurchased} processed successfully`);
};

export const updateInventoryActivity = async (_: WorkflowActivityContext, request: InventoryRequest) => {
  const inventory = await getInventory(request.itemName);
  if (!inventory || inventory.quantity < request.quantity) {
    throw new Error(`Insufficient inventory for order ${request.requestId}`);
  }
  inventory.quantity -= request.quantity;
  await daprClient.state.save(storeName, [{ key: request.itemName, value: inventory }]);
  console.log(`Inventory updated for ${request.requestId}, there are now ${inventory.quantity} ${inventory.itemName} in stock`);
};

export function* orderProcessingWorkflow(
  ctx: WorkflowContext,
  order: OrderPayload,
): Generator<Task<unknown>, OrderResult, unknown> {
  const orderId = ctx.getWorkflowInstanceId();
  ctx.logger.info(`Processing order ${orderId}...`);

  yield ctx.callActivity(notifyActivity, {
    message: `Received order ${orderId} for ${order.quantity} ${order.itemName} at a total cost of ${order.totalCost}`,
  });

  const inventoryRequest = new InventoryRequest(orderId, order.itemName, order.quantity);
  const inventoryTask = ctx.callActivity<InventoryResult>(verifyInventoryActivity, inventoryRequest);
  yield inventoryTask;

  if (!inventoryTask.getResult().success) {
    yield ctx.callActivity(notifyActivity, { message: `Insufficient inventory for order ${orderId}` });
    return new OrderResult(false);
  }

  if (order.totalCost > 5000) {
    yield ctx.callActivity(requestApprovalActivity, order);
    const approvalTask = ctx.waitForExternalEvent<ApprovalResponse>("ApprovalEvent", { timeoutInSeconds: 30 });
    yield approvalTask;
    if (!approvalTask.getResult().isApproved) {
      yield ctx.callActivity(notifyActivity, { message: `Order ${orderId} was not approved` });
      return new OrderResult(false);
    }
  }

  yield ctx.callActivity(processPaymentActivity,
    new OrderPaymentRequest(orderId, order.itemName, order.totalCost, order.quantity));

  const updateTask = ctx.callActivity(updateInventoryActivity, inventoryRequest);
  try {
    yield updateTask;
  } catch (error) {
    // Only compensate an activity failure, not an unrelated workflow error.
    if (!updateTask.isFailed) {
      throw error;
    }
    ctx.logger.error(`Inventory update failed for order ${orderId}`, error);
    yield ctx.callActivity(notifyActivity, { message: `Order ${orderId} failed! You are now getting a refund` });
    return new OrderResult(false);
  }

  yield ctx.callActivity(notifyActivity, { message: `Order ${orderId} processed successfully!` });
  ctx.logger.info(`Order ${orderId} has completed`);
  return new OrderResult(true);
}
```

{{% /tab %}}

 <!-- .NET -->
{{% tab ".NET" %}}

The `order-processor` console app starts and manages the lifecycle of an order processing workflow that stores and retrieves data in a state store. The workflow consists of five workflow activities, or tasks:

- `NotifyActivity`: Utilizes a logger to print out messages throughout the workflow
- `VerifyInventoryActivity`: Checks the state store to ensure that there is enough inventory for the purchase.
- `RequestApprovalActivity`: Requests approval for orders over a certain threshold.
- `ProcessPaymentActivity`: Processes and authorizes the payment.
- `UpdateInventoryActivity`: Removes the requested items from the state store and updates the store with the new remaining inventory value.

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) installed. The sample uses a source generator that needs the compiler in the .NET 10 SDK. Earlier SDKs fail to build the sample.
- [.NET 8 runtime](https://dotnet.microsoft.com/download/dotnet/8.0) installed. The sample targets `net8.0`, so it needs this runtime to run.

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/workflows/csharp/sdk).

```bash
git clone --depth 1 https://github.com/dapr/quickstarts.git
```

From the folder where you ran `git clone`, navigate to the `order-processor` directory:

```bash
cd quickstarts/workflows/csharp/sdk/order-processor
```

Install the dependencies:

```bash
dotnet restore
dotnet build
```

Return to the `csharp/sdk` directory:

```bash
cd ..
```

### Step 3: Run the order processor app

In the terminal, start the order processor app alongside a Dapr sidecar using [Multi-App Run]({{% ref multi-app-dapr-run %}}). From the `csharp/sdk` directory, run the following command:

```bash
dapr run -f .
```

This starts the `order-processor` app with unique workflow ID and runs the workflow activities.

Expected output:

```text
== APP - order-processor == info: Microsoft.Hosting.Lifetime[0]
== APP - order-processor ==       Application started. Press Ctrl+C to shut down.
== APP - order-processor == info: Dapr.Workflow.Worker.WorkflowWorker[1748650618]
== APP - order-processor ==       Starting Dapr Workflow Worker
== APP - order-processor == info: Microsoft.Hosting.Lifetime[0]
== APP - order-processor ==       Hosting environment: Production
== APP - order-processor == info: Microsoft.Hosting.Lifetime[0]
== APP - order-processor ==       Content root path: /work/quickstarts/workflows/csharp/sdk/order-processor
== APP - order-processor == info: Dapr.Workflow.Worker.Grpc.GrpcProtocolHandler[154403261]
== APP - order-processor ==       Starting gRPC bidirectional stream with Dapr sidecar
== APP - order-processor == info: Dapr.Workflow.Worker.Grpc.GrpcProtocolHandler[406645761]
== APP - order-processor ==       Established gRPC bidirectional stream with Dapr sidecar
== APP - order-processor == Starting workflow 87743053 purchasing 1 Cars
== APP - order-processor == info: Dapr.Workflow.Client.WorkflowGrpcClient[430660008]
== APP - order-processor ==       Scheduled workflow 'OrderProcessingWorkflow' with instance ID '87743053'
== APP - order-processor == info: WorkflowConsoleApp.Activities.NotifyActivity[1985924262]
== APP - order-processor ==       Presenting notification Notification { Message = Received order 87743053 for 1 Cars at $5000 }
== APP - order-processor == Your workflow has started. Here is the status of the workflow: Running
== APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[2013970020]
== APP - order-processor ==       Received request ID '87743053' for 1 Cars at $5000
== APP - order-processor == info: WorkflowConsoleApp.Activities.VerifyInventoryActivity[1478802116]
== APP - order-processor ==       Reserving inventory for order request ID '87743053' of 1 Cars
== APP - order-processor == info: WorkflowConsoleApp.Activities.VerifyInventoryActivity[1130866279]
== APP - order-processor ==       There are: 10 Cars available for purchase
== APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[1162731597]
== APP - order-processor ==       Checked inventory for request ID 'InventoryRequest { RequestId = 87743053, ItemName = Cars, Quantity = 1 }'
== APP - order-processor == info: WorkflowConsoleApp.Activities.ProcessPaymentActivity[340284070]
== APP - order-processor ==       Processing payment: request ID '87743053' for 1 Cars at $5000
== APP - order-processor == info: WorkflowConsoleApp.Activities.ProcessPaymentActivity[1851315765]
== APP - order-processor ==       Payment for request ID '87743053' processed successfully
== APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[340284070]
== APP - order-processor ==       Processed payment request as there's sufficient inventory to proceed: PaymentRequest { RequestId = 87743053, ItemBeingPurchased = Cars, Amount = 1, Currency = 5000 }
== APP - order-processor == info: WorkflowConsoleApp.Activities.UpdateInventoryActivity[2144991393]
== APP - order-processor ==       Checking inventory for request ID '87743053' for 1 Cars
== APP - order-processor == info: WorkflowConsoleApp.Activities.UpdateInventoryActivity[1901852920]
== APP - order-processor ==       There are now 9 Cars left in stock
== APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[96138418]
== APP - order-processor ==       Updating available inventory for PaymentRequest { RequestId = 87743053, ItemBeingPurchased = Cars, Amount = 1, Currency = 5000 }
== APP - order-processor == info: WorkflowConsoleApp.Activities.NotifyActivity[1985924262]
== APP - order-processor ==       Presenting notification Notification { Message = Order 87743053 has completed! }
== APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[510392223]
== APP - order-processor ==       Order 87743053 has completed
== APP - order-processor == info: Dapr.Workflow.Worker.WorkflowWorker[1120267106]
== APP - order-processor ==       Workflow execution completed: Name='OrderProcessingWorkflow', InstanceId='87743053'
== APP - order-processor == Workflow Status: Completed
== APP - order-processor == info: Grpc.Net.Client.Internal.GrpcCall[3]
== APP - order-processor ==       Call failed with gRPC error status. Status code: 'Cancelled', Message: 'Call canceled by the client.'.
== APP - order-processor ==       System.OperationCanceledException: The operation was canceled.
== APP - order-processor == info: Dapr.Workflow.Worker.Grpc.GrpcProtocolHandler[1917588177]
== APP - order-processor ==       Workflow worker gRPC stream canceled during shutdown (expected)
```

### (Optional) Step 4: View in Zipkin

Running `dapr init` launches the [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) Docker container. If the container has stopped running, launch the Zipkin Docker container with the following command:

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

View the workflow trace spans in the Zipkin web UI (typically at `http://localhost:9411/zipkin/`).

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### What happened?

When you ran `dapr run -f .`:

1. An OrderPayload is made containing one car.
2. A unique order ID for the workflow is generated (in the above example, `87743053`) and the workflow is scheduled.
3. The `NotifyActivity` workflow activity sends a notification saying an order for one car has been received.
4. The `VerifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock. The inventory is sufficient so the workflow continues.
5. The total cost of the order is 5000, so the workflow will not call the `RequestApprovalActivity` activity.
6. The `ProcessPaymentActivity` workflow activity begins processing payment for order `87743053` and confirms if successful.
7. The `UpdateInventoryActivity` workflow activity updates the inventory with the current available cars after the order has been processed.
8. The `NotifyActivity` workflow activity sends a notification saying that order `87743053` has completed.
9. The workflow terminates as completed and the OrderResult is set to processed.

#### `order-processor/Program.cs`

In the application's program file:

- The unique workflow order ID is generated
- The inventory is saved to the state store through the `IInventoryStore` client
- The workflow is scheduled
- The workflow status is retrieved

The program file does not register the workflow or its activities. The source generator in the .NET 10 SDK registers them when the app builds.

```csharp
using Dapr.StateManagement.Extensions;
using Dapr.Workflow;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using WorkflowConsoleApp.Models;
using WorkflowConsoleApp.Models.State;
using WorkflowConsoleApp.Workflows;

// The workflow host is a background service that connects to the sidecar over gRPC
using var host = Host.CreateDefaultBuilder(args).ConfigureServices(services =>
{
    services.AddDaprStateManagementClient()
        .WithInventoryStore();
    services.AddDaprWorkflow();
}).Build();

// Start the app - this is the point where we connect to the Dapr sidecar
host.Start();

var workflowClient = host.Services.GetRequiredService<DaprWorkflowClient>();

// Generate a unique ID for the workflow
var orderId = Guid.NewGuid().ToString()[..8];
const string itemToPurchase = "Cars";
const int amountToPurchase = 1;

// Populate the store with items
var stateStore = host.Services.GetRequiredService<IInventoryStore>();
await stateStore.SaveStateAsync(itemToPurchase, new OrderPayload(Name: itemToPurchase, TotalCost: 50000, Quantity: 10));

// Construct the order
var orderInfo = new OrderPayload(itemToPurchase, 5000, amountToPurchase);

// Start the workflow
Console.WriteLine($"Starting workflow {orderId} purchasing {amountToPurchase} {itemToPurchase}");

await workflowClient.ScheduleNewWorkflowAsync(
    name: nameof(OrderProcessingWorkflow),
    instanceId: orderId,
    input: orderInfo);

// Wait for the workflow to start and confirm the input
var state = await workflowClient.WaitForWorkflowStartAsync(
    instanceId: orderId);

Console.WriteLine($"Your workflow has started. Here is the status of the workflow: {Enum.GetName(typeof(WorkflowRuntimeStatus), state.RuntimeStatus)}");

// Wait for the workflow to complete
state = await workflowClient.WaitForWorkflowCompletionAsync(
    instanceId: orderId);

Console.WriteLine("Workflow Status: {0}", Enum.GetName(typeof(WorkflowRuntimeStatus), state.RuntimeStatus));
```

#### `order-processor/Workflows/OrderProcessingWorkflow.cs`

In `OrderProcessingWorkflow.cs`, the workflow is defined as a class with all of its associated tasks (determined by workflow activities in separate files).

```csharp
namespace WorkflowConsoleApp.Workflows;

using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using Dapr.Workflow;
using Activities;
using Models;

internal sealed partial class OrderProcessingWorkflow : Workflow<OrderPayload, OrderResult>
{
    public override async Task<OrderResult> RunAsync(WorkflowContext context, OrderPayload order)
    {
        var logger = context.CreateReplaySafeLogger<OrderProcessingWorkflow>();
        var orderId = context.InstanceId;

        // Notify the user that an order has come through
        await context.CallActivityAsync(nameof(NotifyActivity),
            new Notification($"Received order {orderId} for {order.Quantity} {order.Name} at ${order.TotalCost}"));
        LogOrderReceived(logger, orderId, order.Quantity, order.Name, order.TotalCost);

        // Determine if there is enough of the item available for purchase by checking the inventory
        var inventoryRequest = new InventoryRequest(RequestId: orderId, order.Name, order.Quantity);
        var result = await context.CallActivityAsync<InventoryResult>(
            nameof(VerifyInventoryActivity), inventoryRequest);
        LogCheckInventory(logger, inventoryRequest);
            
        // If there is insufficient inventory, fail and let the user know 
        if (!result.Success)
        {
            // End the workflow here since we don't have sufficient inventory
            await context.CallActivityAsync(nameof(NotifyActivity),
                new Notification($"Insufficient inventory for {order.Name}"));
            LogInsufficientInventory(logger, order.Name);
            return new OrderResult(Processed: false);
        }

        if (order.TotalCost > 5000)
        {
            await context.CallActivityAsync(nameof(RequestApprovalActivity),
                new ApprovalRequest(orderId, order.Name, order.Quantity, order.TotalCost));

            var approvalResponse = await context.WaitForExternalEventAsync<ApprovalResponse>(
                eventName: "ApprovalEvent",
                timeout: TimeSpan.FromSeconds(30));
            if (!approvalResponse.IsApproved)
            {
                await context.CallActivityAsync(nameof(NotifyActivity),
                    new Notification($"Order {orderId} was not approved"));
                LogOrderNotApproved(logger, orderId);
                return new OrderResult(Processed: false);
            }
        }

        // There is enough inventory available so the user can purchase the item(s). Process their payment
        var processPaymentRequest = new PaymentRequest(RequestId: orderId, order.Name, order.Quantity, order.TotalCost);
        await context.CallActivityAsync(nameof(ProcessPaymentActivity),processPaymentRequest);
        LogPaymentProcessing(logger, processPaymentRequest);

        try
        {
            // Update the available inventory
            var paymentRequest = new PaymentRequest(RequestId: orderId, order.Name, order.Quantity, order.TotalCost); 
            await context.CallActivityAsync(nameof(UpdateInventoryActivity), paymentRequest);
            LogInventoryUpdate(logger, paymentRequest);
        }
        catch (WorkflowTaskFailedException)
        {
            // Let them know their payment was processed, but there's insufficient inventory, so they're getting a refund
            await context.CallActivityAsync(nameof(NotifyActivity),
                new Notification($"Order {orderId} Failed! You are now getting a refund"));
            LogRefund(logger, orderId);
            return new OrderResult(Processed: false);
        }

        // Let them know their payment was processed
        await context.CallActivityAsync(nameof(NotifyActivity), new Notification($"Order {orderId} has completed!"));
        LogSuccessfulOrder(logger, orderId);

        // End the workflow with a success result
        return new OrderResult(Processed: true);
    }

    [LoggerMessage(LogLevel.Information, "Received request ID '{request}' for {quantity} {name} at ${totalCost}")]
    static partial void LogOrderReceived(ILogger logger, string request, int quantity, string name, double totalCost);
    
    [LoggerMessage(LogLevel.Information, "Checked inventory for request ID '{request}'")]
    static partial void LogCheckInventory(ILogger logger, InventoryRequest request);
    
    [LoggerMessage(LogLevel.Information, "Insufficient inventory for order {orderName}")]
    static partial void LogInsufficientInventory(ILogger logger, string orderName);
    
    [LoggerMessage(LogLevel.Information, "Order {orderName} was not approved")]
    static partial void LogOrderNotApproved(ILogger logger, string orderName);

    [LoggerMessage(LogLevel.Information, "Processed payment request as there's sufficient inventory to proceed: {request}")]
    static partial void LogPaymentProcessing(ILogger logger, PaymentRequest request);

    [LoggerMessage(LogLevel.Information, "Updating available inventory for {request}")]
    static partial void LogInventoryUpdate(ILogger logger, PaymentRequest request);

    [LoggerMessage(LogLevel.Information, "Order {orderId} failed due to insufficient inventory - processing refund")]
    static partial void LogRefund(ILogger logger, string orderId);

    [LoggerMessage(LogLevel.Information, "Order {orderId} has completed")]
    static partial void LogSuccessfulOrder(ILogger logger, string orderId);
}
```

#### `order-processor/Activities` directory

The `Activities` directory holds the five workflow activities used by the workflow, defined in the following files:

- `NotifyActivity.cs`
- `VerifyInventoryActivity.cs`
- `RequestApprovalActivity.cs`
- `ProcessPaymentActivity.cs`
- `UpdateInventoryActivity.cs`

## Watch the demo

Watch [this video to walk through the Dapr Workflow .NET demo](https://youtu.be/BxiKpEmchgQ?t=2564):

{{< youtube id=BxiKpEmchgQ start=2564 >}}

{{% /tab %}}

 <!-- Java -->
{{% tab "Java" %}}

The `order-processor` console app starts and manages the lifecycle of an order processing workflow that stores and retrieves data in a state store. The workflow consists of five workflow activities, or tasks:

- `NotifyActivity`: Utilizes a logger to print out messages throughout the workflow.
- `RequestApprovalActivity`: Requests approval for orders over a certain cost threshold.
- `VerifyInventoryActivity`: Checks the state store to ensure that there is enough inventory for the purchase.
- `ProcessPaymentActivity`: Processes and authorizes the payment.
- `UpdateInventoryActivity`: Removes the requested items from the state store and updates the store with the new remaining inventory value.

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 17 (or greater):
    - [Microsoft JDK 17](https://docs.microsoft.com/java/openjdk/download#openjdk-17)
    - [Oracle JDK 17](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK17)
    - [OpenJDK 17](https://jdk.java.net/17/)
- [Apache Maven](https://maven.apache.org/install.html) version 3.x.
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk).

```bash
git clone --depth 1 https://github.com/dapr/quickstarts.git
```

Navigate to the `order-processor` directory:

```bash
cd quickstarts/workflows/java/sdk/order-processor
```

Install the dependencies:

```bash
mvn clean install
```

Return to the `java/sdk` directory:

```bash
cd ..
```

### Step 3: Run the order processor app

In the terminal, start the order processor app alongside a Dapr sidecar using [Multi-App Run]({{% ref multi-app-dapr-run %}}). From the `java/sdk` directory, run the following command:

```bash
dapr run -f .
```

This starts the `order-processor` app with unique workflow ID and runs the workflow activities.

Expected output:

```text
== APP - order-processor == *** Welcome to the Dapr Workflow console app sample!
== APP - order-processor == *** Using this app, you can place orders that start workflows.
== APP - order-processor == Start workflow runtime
== APP - order-processor == ==========Begin the purchase of item:==========
== APP - order-processor == Starting order workflow, purchasing 1 of cars
== APP - order-processor == Scheduled new workflow instance of OrderProcessingWorkflow with instance ID: b2b99d81-30ec-4673-80ae-6b2609172837
== APP - order-processor == Workflow instance b2b99d81-30ec-4673-80ae-6b2609172837 started
== APP - order-processor == there are now 9 cars left in stock
== APP - order-processor == Workflow instance completed, out is: {"processed":true}
```

The Dapr Java SDK also writes log lines between these lines. The lines that you see depend on the logging setup of the app.

### (Optional) Step 4: View in Zipkin

Running `dapr init` launches the [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) Docker container. If the container has stopped running, launch the Zipkin Docker container with the following command:

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

View the workflow trace spans in the Zipkin web UI (typically at `http://localhost:9411/zipkin/`).

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### What happened?

When you ran `dapr run -f .`:

1. An OrderPayload is made containing one car.
2. A unique order ID for the workflow is generated (in the above example, `b2b99d81-30ec-4673-80ae-6b2609172837`) and the workflow is scheduled.
3. The `NotifyActivity` workflow activity sends a notification saying an order for one car has been received.
4. The `VertifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock. The inventory is sufficient so the workflow continues.
5. The total cost of the order is 5000, so the workflow will not call the `RequestApprovalActivity` activity.
6. The `ProcessPaymentActivity` workflow activity begins processing payment for order `b2b99d81-30ec-4673-80ae-6b2609172837` and confirms if successful.
7. The `UpdateInventoryActivity` workflow activity updates the inventory with the current available cars after the order has been processed.
8. The `NotifyActivity` workflow activity sends a notification saying that order `b2b99d81-30ec-4673-80ae-6b2609172837` has completed.
9. The workflow terminates as completed and the orderResult is set to processed.

#### `order-processor/WorkflowConsoleApp.java` 

In the application's program file:
- The unique workflow order ID is generated
- The workflow is scheduled
- The workflow status is retrieved
- The workflow and the workflow activities it invokes are registered

```java
/*
 * Copyright 2023 The Dapr Authors
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

package io.dapr.quickstarts.workflows;

import java.time.Duration;
import java.util.concurrent.TimeoutException;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.quickstarts.workflows.activities.NotifyActivity;
import io.dapr.quickstarts.workflows.activities.ProcessPaymentActivity;
import io.dapr.quickstarts.workflows.activities.RequestApprovalActivity;
import io.dapr.quickstarts.workflows.activities.VerifyInventoryActivity;
import io.dapr.quickstarts.workflows.activities.UpdateInventoryActivity;
import io.dapr.quickstarts.workflows.models.InventoryItem;
import io.dapr.quickstarts.workflows.models.OrderPayload;
import io.dapr.workflows.client.DaprWorkflowClient;
import io.dapr.workflows.client.WorkflowInstanceStatus;
import io.dapr.workflows.runtime.WorkflowRuntime;
import io.dapr.workflows.runtime.WorkflowRuntimeBuilder;

public class WorkflowConsoleApp {

  private static final String STATE_STORE_NAME = "statestore";

  /**
   * The main method of this console app.
   *
   * @param args The port the app will listen on.
   * @throws Exception An Exception.
   */
  public static void main(String[] args) throws Exception {
    System.out.println("*** Welcome to the Dapr Workflow console app sample!");
    System.out.println("*** Using this app, you can place orders that start workflows.");
    // Wait for the sidecar to become available
    Thread.sleep(5 * 1000);

    // Register the OrderProcessingWorkflow and its activities with the builder.
    WorkflowRuntimeBuilder builder = new WorkflowRuntimeBuilder().registerWorkflow(OrderProcessingWorkflow.class);
    builder.registerActivity(NotifyActivity.class);
    builder.registerActivity(ProcessPaymentActivity.class);
    builder.registerActivity(RequestApprovalActivity.class);
    builder.registerActivity(VerifyInventoryActivity.class);
    builder.registerActivity(UpdateInventoryActivity.class);

    // Build and then start the workflow runtime pulling and executing tasks
    WorkflowRuntime runtime = builder.build();
    System.out.println("Start workflow runtime");
    runtime.start(false);

    InventoryItem inventory = prepareInventoryAndOrder();

    DaprWorkflowClient workflowClient = new DaprWorkflowClient();
    try (workflowClient) {
      executeWorkflow(workflowClient, inventory);
    }
  }

  private static void executeWorkflow(DaprWorkflowClient workflowClient, InventoryItem inventory) {
    System.out.println("==========Begin the purchase of item:==========");
    String itemName = inventory.getName();
    int orderQuantity = inventory.getQuantity();
    int totalCost = orderQuantity * inventory.getPerItemCost();
    OrderPayload order = new OrderPayload();
    order.setItemName(itemName);
    order.setQuantity(orderQuantity);
    order.setTotalCost(totalCost);
    System.out.println("Starting order workflow, purchasing " + orderQuantity + " of " + itemName);

    String instanceId = workflowClient.scheduleNewWorkflow(OrderProcessingWorkflow.class, order);
    System.out.printf("Scheduled new workflow instance of OrderProcessingWorkflow with instance ID: %s%n",
        instanceId);

    try {
      workflowClient.waitForInstanceStart(instanceId, Duration.ofSeconds(10), false);
      System.out.printf("Workflow instance %s started%n", instanceId);
    } catch (TimeoutException e) {
      System.out.printf("Workflow instance %s did not start within 10 seconds%n", instanceId);
      return;
    }

    try {
      WorkflowInstanceStatus workflowStatus = workflowClient.waitForInstanceCompletion(instanceId,
          Duration.ofSeconds(30),
          true);
      if (workflowStatus != null) {
        System.out.printf("Workflow instance completed, out is: %s%n",
            workflowStatus.getSerializedOutput());
      } else {
        System.out.printf("Workflow instance %s not found%n", instanceId);
      }
    } catch (TimeoutException e) {
      System.out.printf("Workflow instance %s did not complete within 30 seconds%n", instanceId);
    }

  }

  private static InventoryItem prepareInventoryAndOrder() {
    // prepare 10 cars in inventory
    InventoryItem inventory = new InventoryItem();
    inventory.setName("cars");
    inventory.setPerItemCost(5000);
    inventory.setQuantity(10);
    DaprClient daprClient = new DaprClientBuilder().build();
    restockInventory(daprClient, inventory);

    // prepare order for 1 car
    InventoryItem order = new InventoryItem();
    order.setName("cars");
    order.setPerItemCost(5000);
    order.setQuantity(1);
    return order;
  }

  private static void restockInventory(DaprClient daprClient, InventoryItem inventory) {
    String key = inventory.getName();
    daprClient.saveState(STATE_STORE_NAME, key, inventory).block();
  }
}
```

#### `OrderProcessingWorkflow.java`

In `OrderProcessingWorkflow.java`, the workflow is defined as a class with all of its associated tasks (determined by workflow activities).

```java
package io.dapr.quickstarts.workflows;

import java.time.Duration;
import org.slf4j.Logger;

import io.dapr.quickstarts.workflows.activities.NotifyActivity;
import io.dapr.quickstarts.workflows.activities.ProcessPaymentActivity;
import io.dapr.quickstarts.workflows.activities.RequestApprovalActivity;
import io.dapr.quickstarts.workflows.activities.VerifyInventoryActivity;
import io.dapr.quickstarts.workflows.activities.UpdateInventoryActivity;
import io.dapr.quickstarts.workflows.models.ApprovalResponse;
import io.dapr.quickstarts.workflows.models.InventoryRequest;
import io.dapr.quickstarts.workflows.models.InventoryResult;
import io.dapr.quickstarts.workflows.models.Notification;
import io.dapr.quickstarts.workflows.models.OrderPayload;
import io.dapr.quickstarts.workflows.models.OrderResult;
import io.dapr.quickstarts.workflows.models.PaymentRequest;
import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;

public class OrderProcessingWorkflow implements Workflow {

  @Override
  public WorkflowStub create() {
    return ctx -> {
      Logger logger = ctx.getLogger();
      String orderId = ctx.getInstanceId();
      logger.info("Starting Workflow: " + ctx.getName());
      logger.info("Instance ID(order ID): " + orderId);
      logger.info("Current Orchestration Time: " + ctx.getCurrentInstant());

      OrderPayload order = ctx.getInput(OrderPayload.class);
      logger.info("Received Order: " + order.toString());
      OrderResult orderResult = new OrderResult();
      orderResult.setProcessed(false);

      // Notify the user that an order has come through
      Notification notification = new Notification();
      notification.setMessage("Received Order: " + order.toString());
      ctx.callActivity(NotifyActivity.class.getName(), notification).await();

      // Determine if there is enough of the item available for purchase by checking
      // the inventory
      InventoryRequest inventoryRequest = new InventoryRequest();
      inventoryRequest.setRequestId(orderId);
      inventoryRequest.setItemName(order.getItemName());
      inventoryRequest.setQuantity(order.getQuantity());
      InventoryResult inventoryResult = ctx.callActivity(VerifyInventoryActivity.class.getName(),
          inventoryRequest, InventoryResult.class).await();

      // If there is insufficient inventory, fail and let the user know
      if (!inventoryResult.isSuccess()) {
        notification.setMessage("Insufficient inventory for order : " + order.getItemName());
        ctx.callActivity(NotifyActivity.class.getName(), notification).await();
        ctx.complete(orderResult);
        return;
      }

      // Require orders over a certain threshold to be approved
      if (order.getTotalCost() > 5000) {
        ctx.callActivity(RequestApprovalActivity.class.getName(), order).await();

        ApprovalResponse approvalResponse = ctx.waitForExternalEvent("approvalEvent",
          Duration.ofSeconds(30), ApprovalResponse.class).await();
        if (!approvalResponse.isApproved()) {
          notification.setMessage("Order " + order.getItemName() + " was not approved.");
          ctx.callActivity(NotifyActivity.class.getName(), notification).await();
          ctx.complete(orderResult);
          return;
        }
      }

      // There is enough inventory available so the user can purchase the item(s).
      // Process their payment
      PaymentRequest paymentRequest = new PaymentRequest();
      paymentRequest.setRequestId(orderId);
      paymentRequest.setItemBeingPurchased(order.getItemName());
      paymentRequest.setQuantity(order.getQuantity());
      paymentRequest.setAmount(order.getTotalCost());
      boolean isOK = ctx.callActivity(ProcessPaymentActivity.class.getName(),
          paymentRequest, boolean.class).await();
      if (!isOK) {
        notification.setMessage("Payment failed for order : " + orderId);
        ctx.callActivity(NotifyActivity.class.getName(), notification).await();
        ctx.complete(orderResult);
        return;
      }

      inventoryResult = ctx.callActivity(UpdateInventoryActivity.class.getName(),
          inventoryRequest, InventoryResult.class).await();
      if (!inventoryResult.isSuccess()) {
        // If there is an error updating the inventory, refund the user
        // paymentRequest.setAmount(-1 * paymentRequest.getAmount());
        // ctx.callActivity(ProcessPaymentActivity.class.getName(),
        // paymentRequest).await();

        // Let users know their payment processing failed
        notification.setMessage("Order failed to update inventory! : " + orderId);
        ctx.callActivity(NotifyActivity.class.getName(), notification).await();
        ctx.complete(orderResult);
        return;
      }

      // Let user know their order was processed
      notification.setMessage("Order completed! : " + orderId);
      ctx.callActivity(NotifyActivity.class.getName(), notification).await();

      // Complete the workflow with order result is processed
      orderResult.setProcessed(true);
      ctx.complete(orderResult);
    };
  }

}
```

#### `activities` directory

The `Activities` directory holds the five workflow activities used by the workflow, defined in the following files:
- [`NotifyActivity.java`](https://github.com/dapr/quickstarts/blob/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/NotifyActivity.java)
- [`RequestApprovalActivity`](https://github.com/dapr/quickstarts/blob/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/RequestApprovalActivity.java)
- [`VerifyInventoryActivity`](https://github.com/dapr/quickstarts/blob/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/VerifyInventoryActivity.java)
- [`ProcessPaymentActivity`](https://github.com/dapr/quickstarts/blob/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/ProcessPaymentActivity.java)
- [`UpdateInventoryActivity`](https://github.com/dapr/quickstarts/blob/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/UpdateInventoryActivity.java)

{{% /tab %}}

 <!-- Go -->
{{% tab "Go" %}}

The `order-processor` console app starts and manages the `OrderProcessingWorkflow` workflow, which simulates purchasing items from a store. The workflow consists of five unique workflow activities, or tasks:

- `NotifyActivity`: Utilizes a logger to print out messages throughout the workflow. These messages notify you when:
  - You have insufficient inventory
  - Your payment couldn't be processed, etc.
- `VerifyInventoryActivity`: Checks the state store to ensure there is enough inventory present for purchase.
- `RequestApprovalActivity`: Requests approval for orders over a certain cost threshold.
- `ProcessPaymentActivity`: Processes and authorizes the payment.
- `UpdateInventoryActivity`: Removes the requested items from the state store and updates the store with the new remaining inventory value.

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest version of Go](https://go.dev/dl/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/workflows/go/sdk).

```bash
git clone --depth 1 https://github.com/dapr/quickstarts.git
```

From the folder where you ran `git clone`, navigate to the `sdk` directory:

```bash
cd quickstarts/workflows/go/sdk
```

### Step 3: Run the order processor app

In the terminal, start the order processor app alongside a Dapr sidecar using [Multi-App Run]({{% ref multi-app-dapr-run %}}). From the `go/sdk` directory, run the following command:

```bash
dapr run -f .
```

This starts the `order-processor` app with unique workflow ID and runs the workflow activities.

Expected output:

```text
== APP - order-processor == *** Welcome to the Dapr Workflow console app sample!
== APP - order-processor == *** Using this app, you can place orders that start workflows.
== APP - order-processor == dapr client initializing for: 127.0.0.1:35291
== APP - order-processor == INFO: 2026/10/24 00:00:58 connecting work item listener stream
== APP - order-processor == adding base stock item: paperclip
== APP - order-processor == INFO: 2026/10/24 00:00:58 starting background processor
== APP - order-processor == adding base stock item: cars
== APP - order-processor == adding base stock item: computers
== APP - order-processor == ==========Begin the purchase of item:==========
== APP - order-processor == NotifyActivity: Received order 3d5e681c-aff3-4f1a-860a-a9976ec96a81 for 1 cars - $5000
== APP - order-processor == VerifyInventoryActivity: Verifying inventory for order 3d5e681c-aff3-4f1a-860a-a9976ec96a81 of 1 cars
== APP - order-processor == VerifyInventoryActivity: There are 10 cars available for purchase
== APP - order-processor == ProcessPaymentActivity: 3d5e681c-aff3-4f1a-860a-a9976ec96a81 for 1 - cars (5000USD)
== APP - order-processor == UpdateInventoryActivity: Checking Inventory for order 3d5e681c-aff3-4f1a-860a-a9976ec96a81 for 1 * cars
== APP - order-processor == UpdateInventoryActivity: There are now 9 cars left in stock
== APP - order-processor == NotifyActivity: Order 3d5e681c-aff3-4f1a-860a-a9976ec96a81 has completed!
== APP - order-processor == workflow status: COMPLETED
== APP - order-processor == Purchase of item is complete
```

Stop the Dapr workflow with `CTRL+C` or:

```bash
dapr stop -f .
```

### (Optional) Step 4: View in Zipkin

Running `dapr init` launches the [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) Docker container. If the container has stopped running, launch the Zipkin Docker container with the following command:

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

View the workflow trace spans in the Zipkin web UI (typically at `http://localhost:9411/zipkin/`).

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### What happened?

When you ran `dapr run`:

1. An OrderPayload is made containing one car.
2. A unique order ID for the workflow is generated (in the above example, `3d5e681c-aff3-4f1a-860a-a9976ec96a81`) and the workflow is scheduled.
3. The `NotifyActivity` workflow activity sends a notification saying an order for one car has been received.
4. The `VerifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock.
5. The total cost of the order is 5000, so the workflow will not call the `RequestApprovalActivity` activity.
6. The `ProcessPaymentActivity` workflow activity begins processing payment for order `3d5e681c-aff3-4f1a-860a-a9976ec96a81` and confirms if successful.
7. The `UpdateInventoryActivity` workflow activity updates the inventory with the current available cars after the order has been processed.
8. The `NotifyActivity` workflow activity sends a notification saying that order `3d5e681c-aff3-4f1a-860a-a9976ec96a81` has completed.
9. The workflow terminates as completed and the OrderResult is set to processed.

#### `order-processor/main.go`

In the application's program file:

- The unique workflow order ID is generated
- The workflow is scheduled
- The workflow status is retrieved
- The workflow and the workflow activities it invokes are registered

```go
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"


	"github.com/dapr/durabletask-go/workflow"
	"github.com/dapr/go-sdk/client"
)

var (
	stateStoreName    = "statestore"
	workflowComponent = "dapr"
	workflowName      = "OrderProcessingWorkflow"
	defaultItemName   = "cars"
)

func main() {
	fmt.Println("*** Welcome to the Dapr Workflow console app sample!")
	fmt.Println("*** Using this app, you can place orders that start workflows.")

	r := workflow.NewRegistry()

	if err := r.AddWorkflow(OrderProcessingWorkflow); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(NotifyActivity); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(RequestApprovalActivity); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(VerifyInventoryActivity); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(ProcessPaymentActivity); err != nil {
		log.Fatal(err)
	}
	if err := r.AddActivity(UpdateInventoryActivity); err != nil {
		log.Fatal(err)
	}

	wfClient, err := client.NewWorkflowClient()
	if err != nil {
		log.Fatalf("failed to initialise workflow client: %v", err)
	}

	if err := wfClient.StartWorker(context.Background(), r); err != nil {
		log.Fatal(err)
	}

	dclient, err := client.NewClient()
	if err != nil {
		log.Fatal(err)
	}
	inventory := []InventoryItem{
		{ItemName: "paperclip", PerItemCost: 5, Quantity: 100},
		{ItemName: "cars", PerItemCost: 5000, Quantity: 10},
		{ItemName: "computers", PerItemCost: 500, Quantity: 100},
	}
	if err := restockInventory(dclient, inventory); err != nil {
		log.Fatalf("failed to restock: %v", err)
	}

	fmt.Println("==========Begin the purchase of item:==========")

	itemName := defaultItemName
	orderQuantity := 1

	totalCost := inventory[1].PerItemCost * orderQuantity

	orderPayload := OrderPayload{
		ItemName:  itemName,
		Quantity:  orderQuantity,
		TotalCost: totalCost,
	}

	id, err := wfClient.ScheduleWorkflow(context.Background(), workflowName, workflow.WithInput(orderPayload))
	if err != nil {
		log.Fatalf("failed to start workflow: %v", err)
	}

	waitCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	_, err = wfClient.WaitForWorkflowCompletion(waitCtx, id)
	if err != nil {
		log.Fatalf("failed to wait for workflow: %v", err)
	}

	respFetch, err := wfClient.FetchWorkflowMetadata(context.Background(), id, workflow.WithFetchPayloads(true))
	if err != nil {
		log.Fatalf("failed to get workflow: %v", err)
	}

	fmt.Printf("workflow status: %v\n", respFetch.String())

	fmt.Println("Purchase of item is complete")
}

func restockInventory(daprClient client.Client, inventory []InventoryItem) error {
	for _, item := range inventory {
		itemSerialized, err := json.Marshal(item)
		if err != nil {
			return err
		}
		fmt.Printf("adding base stock item: %s\n", item.ItemName)
		if err := daprClient.SaveState(context.Background(), stateStoreName, item.ItemName, itemSerialized, nil); err != nil {
			return err
		}
	}
	return nil
}
```

#### `order-processor/workflow.go`


```go
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/dapr/durabletask-go/workflow"
	"github.com/dapr/go-sdk/client"
)

type OrderPayload struct {
	ItemName  string `json:"item_name"`
	TotalCost int    `json:"total_cost"`
	Quantity  int    `json:"quantity"`
}

type OrderResult struct {
	Processed bool `json:"processed"`
}

type InventoryItem struct {
	ItemName    string `json:"item_name"`
	PerItemCost int    `json:"per_item_cost"`
	Quantity    int    `json:"quantity"`
}

type InventoryRequest struct {
	RequestID string `json:"request_id"`
	ItemName  string `json:"item_name"`
	Quantity  int    `json:"quantity"`
}

type InventoryResult struct {
	Success       bool          `json:"success"`
	InventoryItem InventoryItem `json:"inventory_item"`
}

type PaymentRequest struct {
	RequestID          string `json:"request_id"`
	ItemBeingPurchased string `json:"item_being_purchased"`
	Amount             int    `json:"amount"`
	Quantity           int    `json:"quantity"`
}

type ApprovalRequired struct {
	Approval bool `json:"approval"`
}

type Notification struct {
	Message string `json:"message"`
}

// OrderProcessingWorkflow is the main workflow for orchestrating activities in the order process.
func OrderProcessingWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	orderID := ctx.ID()
	var orderPayload OrderPayload
	if err := ctx.GetInput(&orderPayload); err != nil {
		return nil, err
	}
	err := ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{
		Message: fmt.Sprintf("Received order %s for %d %s - $%d", orderID, orderPayload.Quantity, orderPayload.ItemName, orderPayload.TotalCost),
	})).Await(nil)
	if err != nil {
		return OrderResult{Processed: false}, err
	}

	var verifyInventoryResult InventoryResult
	if err := ctx.CallActivity(VerifyInventoryActivity, workflow.WithActivityInput(InventoryRequest{
		RequestID: orderID,
		ItemName:  orderPayload.ItemName,
		Quantity:  orderPayload.Quantity,
	})).Await(&verifyInventoryResult); err != nil {
		return OrderResult{Processed: false}, err
	}

	if !verifyInventoryResult.Success {
		notification := Notification{Message: fmt.Sprintf("Insufficient inventory for %s", orderPayload.ItemName)}
		err := ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(notification)).Await(nil)
		return OrderResult{Processed: false}, err
	}

	if orderPayload.TotalCost > 5000 {
		var approvalRequired ApprovalRequired
		if err := ctx.CallActivity(RequestApprovalActivity, workflow.WithActivityInput(orderPayload)).Await(&approvalRequired); err != nil {
			return OrderResult{Processed: false}, err
		}
		if err := ctx.WaitForExternalEvent("manager_approval", time.Second*200).Await(nil); err != nil {
			return OrderResult{Processed: false}, err
		}
		// TODO: Confirm timeout flow - this will be in the form of an error.
		if approvalRequired.Approval {
			if err := ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Payment for order %s has been approved!", orderID)})).Await(nil); err != nil {
				log.Printf("failed to notify of a successful order: %v\n", err)
			}
		} else {
			if err := ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Payment for order %s has been rejected!", orderID)})).Await(nil); err != nil {
				log.Printf("failed to notify of an unsuccessful order :%v\n", err)
			}
			return OrderResult{Processed: false}, err
		}
	}
	err = ctx.CallActivity(ProcessPaymentActivity, workflow.WithActivityInput(PaymentRequest{
		RequestID:          orderID,
		ItemBeingPurchased: orderPayload.ItemName,
		Amount:             orderPayload.TotalCost,
		Quantity:           orderPayload.Quantity,
	})).Await(nil)
	if err != nil {
		if err := ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Order %s failed!", orderID)})).Await(nil); err != nil {
			log.Printf("failed to notify of a failed order: %v", err)
		}
		return OrderResult{Processed: false}, err
	}

	err = ctx.CallActivity(UpdateInventoryActivity, workflow.WithActivityInput(PaymentRequest{
		RequestID:          orderID,
		ItemBeingPurchased: orderPayload.ItemName,
		Amount:             orderPayload.TotalCost,
		Quantity:           orderPayload.Quantity,
	})).Await(nil)
	if err != nil {
		if err := ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Order %s failed!", orderID)})).Await(nil); err != nil {
			log.Printf("failed to notify of a failed order: %v", err)
		}
		return OrderResult{Processed: false}, err
	}

	if err := ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Order %s has completed!", orderID)})).Await(nil); err != nil {
		log.Printf("failed to notify of a successful order: %v", err)
	}
	return OrderResult{Processed: true}, err
}

// NotifyActivity outputs a notification message
func NotifyActivity(ctx workflow.ActivityContext) (any, error) {
	var input Notification
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	fmt.Printf("NotifyActivity: %s\n", input.Message)
	return nil, nil
}

// ProcessPaymentActivity is used to process a payment
func ProcessPaymentActivity(ctx workflow.ActivityContext) (any, error) {
	var input PaymentRequest
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	fmt.Printf("ProcessPaymentActivity: %s for %d - %s (%dUSD)\n", input.RequestID, input.Quantity, input.ItemBeingPurchased, input.Amount)
	return nil, nil
}

// VerifyInventoryActivity is used to verify if an item is available in the inventory
func VerifyInventoryActivity(ctx workflow.ActivityContext) (any, error) {
	var input InventoryRequest
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("VerifyInventoryActivity: Verifying inventory for order %s of %d %s\n", input.RequestID, input.Quantity, input.ItemName)
	dClient, err := client.NewClient()
	if err != nil {
		return nil, err
	}
	item, err := dClient.GetState(context.Background(), stateStoreName, input.ItemName, nil)
	if err != nil {
		return nil, err
	}
	if item == nil {
		return InventoryResult{
			Success:       false,
			InventoryItem: InventoryItem{},
		}, nil
	}
	var result InventoryItem
	if err := json.Unmarshal(item.Value, &result); err != nil {
		log.Fatalf("failed to parse inventory result %v", err)
	}
	fmt.Printf("VerifyInventoryActivity: There are %d %s available for purchase\n", result.Quantity, result.ItemName)
	if result.Quantity >= input.Quantity {
		return InventoryResult{Success: true, InventoryItem: result}, nil
	}
	return InventoryResult{Success: false, InventoryItem: InventoryItem{}}, nil
}

// UpdateInventoryActivity modifies the inventory.
func UpdateInventoryActivity(ctx workflow.ActivityContext) (any, error) {
	var input PaymentRequest
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("UpdateInventoryActivity: Checking Inventory for order %s for %d * %s\n", input.RequestID, input.Quantity, input.ItemBeingPurchased)
	dClient, err := client.NewClient()
	if err != nil {
		return nil, err
	}
	item, err := dClient.GetState(context.Background(), stateStoreName, input.ItemBeingPurchased, nil)
	if err != nil {
		return nil, err
	}
	var result InventoryItem
	err = json.Unmarshal(item.Value, &result)
	if err != nil {
		return nil, err
	}
	newQuantity := result.Quantity - input.Quantity
	if newQuantity < 0 {
		return nil, fmt.Errorf("insufficient inventory for: %s", input.ItemBeingPurchased)
	}
	result.Quantity = newQuantity
	newState, err := json.Marshal(result)
	if err != nil {
		log.Fatalf("failed to marshal new state: %v", err)
	}
	dClient.SaveState(context.Background(), stateStoreName, input.ItemBeingPurchased, newState, nil)
	fmt.Printf("UpdateInventoryActivity: There are now %d %s left in stock\n", result.Quantity, result.ItemName)
	return InventoryResult{Success: true, InventoryItem: result}, nil
}

// RequestApprovalActivity requests approval for the order
func RequestApprovalActivity(ctx workflow.ActivityContext) (any, error) {
	var input OrderPayload
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("RequestApprovalActivity: Requesting approval for payment of %dUSD for %d %s\n", input.TotalCost, input.Quantity, input.ItemName)
	return ApprovalRequired{Approval: true}, nil
}
```

{{% /tab %}}


{{< /tabpane >}}


## Step 5: Manage Your Workflow

Now that your workflow is running, let's learn how to manage it using the Dapr CLI.

### View Running Workflows

Open a separate terminal and run the following CLI commands.

```bash
# List all workflows
dapr workflow list --app-id order-processor -o wide
```

You should see output like:

```
NAMESPACE  APP ID           NAME                     INSTANCE ID  CREATED               LAST UPDATE           STATUS
default    order-processor  OrderProcessingWorkflow  e4d3807c     2025-11-07T12:29:37Z  2025-11-07T12:29:52Z  COMPLETED
```

### Check Workflow History

View the detailed execution history of your workflow:

```bash
dapr workflow history e4d3807c --app-id order-processor
```

You should see output like:

```
TYPE                 NAME                     EVENTID  ELAPSED   STATUS     DETAILS
ExecutionStarted     OrderProcessingWorkflow  -        Age:1.1m  RUNNING    orchestration start
OrchestratorStarted  -                        -        13.4ms    RUNNING    replay cycle start
TaskScheduled        NotifyActivity           0        1.3ms     RUNNING    activity=NotifyActivity
TaskCompleted        -                        -        2.6ms     RUNNING    eventId=0
OrchestratorStarted  -                        -        2.6ms     RUNNING    replay cycle start
TaskScheduled        VerifyInventoryActivity  1        637.6µs   RUNNING    activity=VerifyInventoryActivity
TaskCompleted        -                        -        2.4ms     RUNNING    eventId=1
OrchestratorStarted  -                        -        1.7ms     RUNNING    replay cycle start
TaskScheduled        ProcessPaymentActivity   2        439.3µs   RUNNING    activity=ProcessPaymentActivity
TaskCompleted        -                        -        1.6ms     RUNNING    eventId=2
OrchestratorStarted  -                        -        1.5ms     RUNNING    replay cycle start
TaskScheduled        UpdateInventoryActivity  3        311.2µs   RUNNING    activity=UpdateInventoryActivity
TaskCompleted        -                        -        2.4ms     RUNNING    eventId=3
OrchestratorStarted  -                        -        2.7ms     RUNNING    replay cycle start
TaskScheduled        NotifyActivity           4        354.1µs   RUNNING    activity=NotifyActivity
TaskCompleted        -                        -        2.5ms     RUNNING    eventId=4
OrchestratorStarted  -                        -        1.6ms     RUNNING    replay cycle start
ExecutionCompleted   -                        5        517.1µs   COMPLETED  execDuration=38.7ms
```

### Interact with Your Workflow

#### Raise an External Event

If your workflow is waiting for an [external event]({{% ref "workflow-patterns.md#external-system-interaction" %}}), you can raise one.
It takes a single argument in the format of `<instance-id>/<event-name>`. The event name must be the name that the workflow code waits for. The JavaScript and .NET samples wait for `ApprovalEvent`, the Python sample for `approval_event`, the Java sample for `approvalEvent` and the Go sample for `manager_approval`. The order in this quickstart costs 5000, so the workflow does not wait for an approval event in a default run.

```bash
dapr workflow raise-event e4d3807c/ApprovalEvent \
  --app-id order-processor \
  --input '{"paymentId": "pay-123", "amount": 100.00}'
```

#### Suspend and Resume

```bash
# Suspend a workflow
dapr workflow suspend e4d3807c \
  --app-id order-processor \
  --reason "Waiting for inventory"

# Resume when ready
dapr workflow resume e4d3807c \
  --app-id order-processor \
  --reason "Inventory received"
```

### Clean Up

After testing, purge completed workflows.

{{% alert title="Important" color="warning" %}}
It is required that a workflow client is running in the application to perform purge operations.
The workflow client connection is required in order to preserve the workflow state machine integrity and prevent corruption.
Errors like the following suggest that the workflow client is not running:
```
failed to purge orchestration state: rpc error: code = FailedPrecondition desc = failed to purge orchestration state: failed to lookup actor: api error: code = FailedPrecondition desc = did not find address for actor
```
{{% /alert %}}

```bash
# Purge a specific workflow
dapr workflow purge e4d3807c --app-id order-processor

# Or purge all completed workflows
dapr workflow purge --app-id order-processor --all
```

### Use the Dapr Dev Dashboard

As an alternative to the CLI, you can use the [Dapr Dev Dashboard]({{% ref dapr-dev-dashboard.md %}}) to browse the `OrderProcessingWorkflow` instances, check their status, and drill down into the event history of each execution, including the input and output of every activity.

<img src="/images/workflow-overview/workflow-diagrid-dashboard.png" width=800 alt="Diagrid Dev Dashboard showing local workflow executions"/><br/>

## Tell us what you think!

We're continuously working to improve our Quickstart examples and value your feedback. Did you find this Quickstart helpful? Do you have suggestions for improvement?

Join our [Discord Server](https://diagrid.ws/dapr-discord) and share your thoughts.

## Next steps

- Run the [workflow tutorials](https://github.com/dapr/quickstarts/tree/master/tutorials/workflow) in the Quickstarts repo (Python, .NET and Java). They show task chaining, fan-out/fan-in, child workflows, monitor, external system interaction, resiliency and compensation, versioning, workflow management and history propagation
- Set up Dapr Workflow with any programming language using [HTTP instead of an SDK]({{% ref howto-manage-workflow.md %}})
- Walk through a more in-depth [.NET SDK example workflow](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
- Learn more about [Workflow as a Dapr building block]({{% ref workflow-overview %}})
```

{{< button text="Explore the workflow tutorials  >>" link="https://github.com/dapr/quickstarts/tree/master/tutorials/workflow" >}}
