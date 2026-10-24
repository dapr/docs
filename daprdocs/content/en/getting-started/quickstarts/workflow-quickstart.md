---
type: docs
title: "Quickstart: Workflow"
linkTitle: Workflow
weight: 73
description: Get started with the Dapr Workflow building block
---

{{% alert title="Note" color="primary" %}}
Redis is currently used as the state store component for Workflows in the Quickstarts. However, Redis does not support transaction rollbacks and should not be used in production as an actor state store.

To run a quickstart without Docker and Redis, follow [How to: Run workflows locally without Docker]({{% ref howto-run-workflow-without-docker.md %}}) to start the Dapr binaries. Then use the SQLite run file that the sample provides. Each sample README has a "Run without Docker" section with the exact steps: [Python](https://github.com/dapr/quickstarts/tree/master/workflows/python/sdk#run-without-docker), [JavaScript](https://github.com/dapr/quickstarts/tree/master/workflows/javascript/sdk#run-without-docker), [.NET](https://github.com/dapr/quickstarts/tree/master/workflows/csharp/sdk#run-without-docker), [Java](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk#run-without-docker) and [Go](https://github.com/dapr/quickstarts/tree/master/workflows/go/sdk#run-without-docker).
{{% /alert %}}

Let's take a look at the Dapr [Workflow building block]({{% ref workflow-overview.md %}}). In this Quickstart, you'll create a simple console application to demonstrate Dapr's workflow programming model and the workflow management APIs.

In this guide, you'll:

- Run the `order-processor` application.
- Start the workflow and watch the workflow activities/tasks execute.
- Stop the app while the workflow waits for an approval, start the app again, and approve the order. The workflow continues from its history.
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
- The workflow will call the `RequestApprovalActivity` and wait for an external approval event when the total cost of the order is greater than 5000. The order in this quickstart costs 10000, so it waits for the approval.
- If the order is not approved or the approval is timed out, the workflow does not proceed with the payment.

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
- Docker is optional. To run without Docker, follow [How to: Run workflows locally without Docker]({{% ref howto-run-workflow-without-docker.md %}}).

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

The order in this quickstart is 2 cars at 5000 each, a total of 10000. An order over 5000 needs approval, so the workflow waits for an approval event. In these steps, you stop the app while the workflow waits, start the app again, and then approve the order. The workflow continues from its history.

1. Set an order ID. The app uses it as the workflow instance ID.

   Linux and macOS:

   ```bash
   export ORDER_ID=order-$(date +%Y%m%d-%H%M%S)
   ```

   Windows (PowerShell):

   ```powershell
   $env:ORDER_ID = "order-$(Get-Date -Format yyyyMMdd-HHmmss)"
   ```

1. Start the order processor app alongside a Dapr sidecar using [Multi-App Run]({{% ref multi-app-dapr-run %}}). From the `python/sdk` directory, run the following command:

   ```bash
   uv run dapr run -f .
   ```

   The log shows the order ID, `Started order <id>.`, the activities that run before the approval, and then the request for approval.

   Expected output:

   ```text
   == APP - order-processor == *** Welcome to the Dapr Workflow console app sample!
   == APP - order-processor == *** Using this app, you can place orders that start workflows.
   == APP - order-processor == item: InventoryItem(item_name=Paperclip, per_item_cost=5, quantity=100)
   == APP - order-processor == item: InventoryItem(item_name=Cars, per_item_cost=5000, quantity=10)
   == APP - order-processor == item: InventoryItem(item_name=Computers, per_item_cost=500, quantity=100)
   == APP - order-processor == ==========Begin the purchase of item:==========
   == APP - order-processor == Order ID: order-20261024-101500
   == APP - order-processor == Received order order-20261024-101500 for 2 cars at $10000 !
   == APP - order-processor == Started order order-20261024-101500.
   == APP - order-processor == Verifying inventory for order order-20261024-101500 of 2 cars
   == APP - order-processor == There are 10 Cars available for purchase
   == APP - order-processor == Approval requested for order order-20261024-101500. Waiting for approval.
   ```

1. Stop the app with Ctrl+C. The workflow is not complete. Dapr keeps its state.

1. Start the app again in the same terminal. `ORDER_ID` is still set.

   ```bash
   uv run dapr run -f .
   ```

   The log shows `Order <id> is already running. Waiting for it to finish.` The activities that ran before the approval do not run again.

1. Open a second terminal and approve the order. Use the order ID that the app printed.

   ```bash
   dapr workflow raise-event <id>/ApprovalEvent --app-id order-processor --input '{"approved": true}'
   ```

   Expected output:

   ```text
   Workflow 'order-20261024-101500' raised event 'ApprovalEvent' successfully
   ```

1. The first terminal shows the payment, the inventory update, and the end of the workflow.

   Expected output:

   ```text
   == APP - order-processor == *** Welcome to the Dapr Workflow console app sample!
   == APP - order-processor == *** Using this app, you can place orders that start workflows.
   == APP - order-processor == ==========Begin the purchase of item:==========
   == APP - order-processor == Order ID: order-20261024-101500
   == APP - order-processor == Order order-20261024-101500 is already running. Waiting for it to finish.
   == APP - order-processor == Processing payment: order-20261024-101500 for 2 cars at 10000 USD
   == APP - order-processor == Payment for request ID order-20261024-101500 processed successfully
   == APP - order-processor == Checking inventory for order order-20261024-101500 for 2 cars
   == APP - order-processor == There are now 8 cars left in stock
   == APP - order-processor == Order order-20261024-101500 has completed!
   == APP - order-processor == Workflow completed: COMPLETED
   ```

The activities that finished before you stopped the app did not run again. The workflow continued from its history. An activity that was in progress when you stopped the app can run again.

To reject the order, raise the event with `{"approved": false}`. If no answer arrives in 10 minutes, the workflow cancels the order. If you start the app with an order ID whose workflow already ended, the app prints `Workflow completed: <status>` and exits. To place a new order, set a new `ORDER_ID`.

To stop the Dapr processes that `dapr run -f .` started, press Ctrl+C or run `dapr stop -f .`.

### (Optional) Step 4: View in Zipkin

Running `dapr init` launches the [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) Docker container. If the container has stopped running, launch the Zipkin Docker container with the following command:

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

View the workflow trace spans in the Zipkin web UI (typically at `http://localhost:9411/zipkin/`).

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### What happened?

When you ran `dapr run -f .`:

1. The app makes an order for two cars with a total cost of 10000. The app writes the inventory to the state store only when the inventory is not there. A restart does not restock it.
2. The order ID from `ORDER_ID` is the workflow instance ID. The app checks if the workflow instance exists. When it does not exist, the app schedules it. When it exists and is still running, the app waits for it. When it ended, the app prints its status and exits.
3. The `notify_activity` workflow activity sends a notification that says the app received an order for two cars.
4. The `verify_inventory_activity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock. The inventory is sufficient so the workflow continues.
5. The total cost of the order is more than 5000, so the workflow calls the `request_approval_activity` activity. Then the workflow waits for the `ApprovalEvent` event for up to 10 minutes. When the 10 minutes end, the workflow cancels the order.
6. You stopped the app and started it again. The app found the workflow instance, and the workflow continued from its history. The activities that finished before the stop did not run again.
7. When you raised `ApprovalEvent` with `{"approved": true}`, the `process_payment_activity` workflow activity processed the payment for the order.
8. The `update_inventory_activity` workflow activity updated the inventory with the current available cars after the payment.
9. The `notify_activity` workflow activity sent a notification that says the order is complete.
10. The workflow ended as completed, and the app printed `Workflow completed: COMPLETED`.

#### `order-processor/app.py`

In the application's program file:

- The app reads the order ID from `ORDER_ID`, or builds it from the local time when `ORDER_ID` is not set
- The app gets the state of the workflow instance. It schedules the workflow only when the instance does not exist. It waits for an instance that is still running
- The app saves the inventory to the state store only when the inventory is not there
- The app gets the workflow status when the workflow ends
- The app registers the workflow and the workflow activities it invokes

```python
import os
from datetime import datetime
from time import sleep

from dapr.clients import DaprClient
from dapr.conf import settings
from dapr.ext.workflow import DaprWorkflowClient

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
        order_quantity = 2
        total_cost = int(order_quantity) * baseInventory[item_name].per_item_cost
        order = OrderPayload(item_name=item_name, quantity=int(order_quantity), total_cost=total_cost)

        # The instance ID is the order ID. Set ORDER_ID to attach to an order that already exists.
        instance_id = os.environ.get('ORDER_ID') or datetime.now().strftime('order-%Y%m%d-%H%M%S')
        print(f'Order ID: {instance_id}', flush=True)

        state = wfClient.get_workflow_state(instance_id=instance_id, fetch_payloads=False)
        if state is None:
            wfClient.schedule_new_workflow(
                workflow=order_processing_workflow, input=order.to_json(), instance_id=instance_id)
            print(f'Started order {instance_id}.', flush=True)
        elif state.runtime_status.name in ('RUNNING', 'PENDING', 'SUSPENDED'):
            print(f'Order {instance_id} is already running. Waiting for it to finish.', flush=True)
        else:
            print(f'Workflow completed: {state.runtime_status.name}', flush=True)
            wfr.shutdown()
            return

        try:
            state = wfClient.wait_for_workflow_completion(instance_id=instance_id, timeout_in_seconds=900)
            if not state:
                print("Workflow not found!")
            else:
                print(f'Workflow completed: {state.runtime_status.name}', flush=True)
        except TimeoutError:
            print('*** Workflow timed out!')

        wfr.shutdown()

    def restock_inventory(self, daprClient: DaprClient, baseInventory):
        for key, item in baseInventory.items():
            # Write the inventory only when the key is absent, so a restart does not restock.
            if daprClient.get_state(store_name, key).data:
                continue
            print(f'item: {item}')
            item_str = f'{{"name": "{item.item_name}", "quantity": {item.quantity},\
                          "per_item_cost": {item.per_item_cost}}}'
            daprClient.save_state(store_name, key, item_str)

if __name__ == '__main__':
    app = WorkflowConsoleApp()
    app.main()
```

#### `order-processor/workflow.py`

In `workflow.py`, the workflow is defined as a class with all of its associated tasks (determined by workflow activities). When the total cost is more than 5000, the workflow calls the approval activity and waits for the `ApprovalEvent` event for up to 10 minutes.

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
        approval_task = ctx.wait_for_external_event("ApprovalEvent")
        timeout_event = ctx.create_timer(timedelta(minutes=10))
        winner = yield when_any([approval_task, timeout_event])
        if winner == timeout_event:
            yield ctx.call_activity(notify_activity, 
                                    input=Notification(message='Order '+order_id
                                                       +' has been cancelled due to approval timeout.'))
            return OrderResult(processed=False)
        approval_result = yield approval_task
        # The Dapr CLI can deliver the payload as a JSON string that holds the object.
        while isinstance(approval_result, str):
            approval_result = json.loads(approval_result)
        if not approval_result.get('approved'):
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
    print(f'Approval requested for order {ctx.workflow_id}. Waiting for approval.', flush=True)
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
- Docker is optional. To run without Docker, follow [How to: Run workflows locally without Docker]({{% ref howto-run-workflow-without-docker.md %}}).

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

The order in this quickstart is 2 cars at 5000 each, a total of 10000. An order over 5000 needs approval, so the workflow waits for an approval event. In these steps, you stop the app while the workflow waits, start the app again, and then approve the order. The workflow continues from its history.

1. Set an order ID. The app uses it as the workflow instance ID.

   Linux and macOS:

   ```bash
   export ORDER_ID=order-$(date +%Y%m%d-%H%M%S)
   ```

   Windows (PowerShell):

   ```powershell
   $env:ORDER_ID = "order-$(Get-Date -Format yyyyMMdd-HHmmss)"
   ```

1. Start the order processor app alongside a Dapr sidecar using [Multi-App Run]({{% ref multi-app-dapr-run %}}). From the `javascript/sdk` directory, run the following command:

   ```bash
   dapr run -f .
   ```

   The log shows the order ID, `Started order <id>.`, the activities that run before the approval, and then the request for approval.

   Expected output:

   ```text
   == APP - order-processor == Workflow runtime started successfully
   == APP - order-processor == Order ID: order-20261024-101500
   == APP - order-processor == Started order order-20261024-101500.
   == APP - order-processor == Received order order-20261024-101500 for 2 car at a total cost of 10000
   == APP - order-processor == Verifying inventory for order-20261024-101500 of 2 car
   == APP - order-processor == There are 10 car in stock
   == APP - order-processor == Approval requested for order order-20261024-101500. Waiting for approval.
   ```

   The SDK also prints log lines between these lines. This page leaves them out.

1. Stop the app with Ctrl+C. The workflow is not complete. Dapr keeps its state.

1. Start the app again in the same terminal. `ORDER_ID` is still set.

   ```bash
   dapr run -f .
   ```

   The log shows `Order <id> is already running. Waiting for it to finish.` The activities that ran before the approval do not run again.

1. Open a second terminal and approve the order. Use the order ID that the app printed.

   ```bash
   dapr workflow raise-event <id>/ApprovalEvent --app-id order-processor --input '{"approved": true}'
   ```

   Expected output:

   ```text
   Workflow 'order-20261024-101500' raised event 'ApprovalEvent' successfully
   ```

1. The first terminal shows the payment, the inventory update, and the end of the workflow.

   Expected output:

   ```text
   == APP - order-processor == Workflow runtime started successfully
   == APP - order-processor == Order ID: order-20261024-101500
   == APP - order-processor == Order order-20261024-101500 is already running. Waiting for it to finish.
   == APP - order-processor == Payment of 10000 for 2 car processed successfully
   == APP - order-processor == Inventory updated for order-20261024-101500, there are now 8 car in stock
   == APP - order-processor == Order order-20261024-101500 processed successfully!
   == APP - order-processor == Workflow completed: COMPLETED
   ```

   The SDK also prints log lines between these lines. This page leaves them out.

The activities that finished before you stopped the app did not run again. The workflow continued from its history. An activity that was in progress when you stopped the app can run again.

To reject the order, raise the event with `{"approved": false}`. If no answer arrives in 10 minutes, the workflow cancels the order. If you start the app with an order ID whose workflow already ended, the app prints `Workflow completed: <status>` and exits. To place a new order, set a new `ORDER_ID`.

To stop the Dapr processes that `dapr run -f .` started, press Ctrl+C or run `dapr stop -f .`.

### (Optional) Step 4: View in Zipkin

Running `dapr init` launches the [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) Docker container. If the container has stopped running, launch the Zipkin Docker container with the following command:

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

View the workflow trace spans in the Zipkin web UI (typically at `http://localhost:9411/zipkin/`).

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### What happened?

When you ran `dapr run -f .`:

1. The app makes an order for two cars with a total cost of 10000. The app writes the inventory to the state store only when the inventory is not there. A restart does not restock it.
2. The order ID from `ORDER_ID` is the workflow instance ID. The app checks if the workflow instance exists. When it does not exist, the app schedules it. When it exists and is still running, the app waits for it. When it ended, the app prints its status and exits.
3. The `notifyActivity` workflow activity sends a notification that says the app received an order for two cars.
4. The `verifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock. The inventory is sufficient so the workflow continues.
5. The total cost of the order is more than 5000, so the workflow calls the `requestApprovalActivity` activity. Then the workflow waits for the `ApprovalEvent` event for up to 10 minutes. When the 10 minutes end, the workflow cancels the order.
6. You stopped the app and started it again. The app found the workflow instance, and the workflow continued from its history. The activities that finished before the stop did not run again.
7. When you raised `ApprovalEvent` with `{"approved": true}`, the `processPaymentActivity` workflow activity processed the payment for the order.
8. The `updateInventoryActivity` workflow activity updated the inventory with the current available cars after the payment.
9. The `notifyActivity` workflow activity sent a notification that says the order is complete.
10. The workflow ended as completed, and the app printed `Workflow completed: COMPLETED`.

#### `order-processor/app.ts`

In the application file:

- The workflow runtime is created with the workflow and the workflow activities it invokes registered
- The workflow runtime is started
- The `runOrder` function starts the order, or attaches to it, and waits for it to end
- Ctrl+C stops the wait, and the workflow keeps its state in Dapr
- The workflow runtime and the clients are stopped when the app ends

```typescript
import { DaprWorkflowClient } from "@dapr/dapr";
import { createWorkflowRuntime, runOrder } from "./orderProcessor";
import { daprClient } from "./orderProcessingWorkflow";

async function start() {
  const workflowWorker = createWorkflowRuntime();
  const workflowClient = new DaprWorkflowClient();
  const stopWaiting = new AbortController();
  // Ctrl+C stops the wait. The workflow keeps its state in Dapr.
  const onSignal = () => stopWaiting.abort();
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);
  try {
    await workflowWorker.start();
    console.log("Workflow runtime started successfully");
    await runOrder(workflowClient, stopWaiting.signal);
  } catch (error) {
    // Ctrl+C also stops the sidecar, so the wait can end with a gRPC "canceled" error (code 1) before the signal arrives.
    const canceled = (error as { code?: number }).code === 1;
    if (!stopWaiting.signal.aborted && !canceled) {
      throw error;
    }
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
- The app reads the order ID from `ORDER_ID`, or builds it from the local time when `ORDER_ID` is not set
- The app saves the inventory to the state store only when the inventory is not there
- The app gets the state of the workflow instance. It schedules the workflow only when the instance does not exist. It waits for an instance that is still running
- The app waits for the workflow to end, and then prints the workflow status

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

const ORDER_ITEM = "car";
const TERMINAL_WAIT_SECONDS = 15 * 60;
const IN_PROGRESS = [WorkflowRuntimeStatus.RUNNING, WorkflowRuntimeStatus.PENDING, WorkflowRuntimeStatus.SUSPENDED];

function defaultOrderId(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `order-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// Starts the order, or attaches to it when the order id already has an instance, and waits for it to end.
export async function runOrder(workflowClient: DaprWorkflowClient, signal?: AbortSignal): Promise<void> {
  const orderId = process.env.ORDER_ID || defaultOrderId();
  console.log(`Order ID: ${orderId}`);

  // Seed the inventory only when it is absent, so a restart does not restock.
  const stock = await daprClient.state.get(storeName, ORDER_ITEM);
  if (stock == null || stock === "") {
    const inventory = new InventoryItem(ORDER_ITEM, 5000, 10);
    await daprClient.state.save(storeName, [{ key: inventory.itemName, value: inventory }]);
  }

  const existing = await workflowClient.getWorkflowState(orderId, false);
  if (existing && !IN_PROGRESS.includes(existing.runtimeStatus)) {
    console.log(`Workflow completed: ${WorkflowRuntimeStatus[existing.runtimeStatus]}`);
    return;
  }
  if (existing) {
    console.log(`Order ${orderId} is already running. Waiting for it to finish.`);
  } else {
    // 2 cars at 5000 each: the total is over 5000, so the order waits for approval.
    await workflowClient.scheduleNewWorkflow(orderProcessingWorkflow, new OrderPayload(ORDER_ITEM, 10000, 2), orderId);
    console.log(`Started order ${orderId}.`);
  }

  const completed = await workflowClient.waitForWorkflowCompletion(orderId, true, TERMINAL_WAIT_SECONDS, signal);
  if (!completed) {
    throw new Error(`Order ${orderId} did not finish within ${TERMINAL_WAIT_SECONDS} seconds`);
  }
  console.log(`Workflow completed: ${WorkflowRuntimeStatus[completed.runtimeStatus]}`);
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

In `orderProcessingWorkflow.ts`, the workflow is defined as a class with all of its associated tasks (determined by workflow activities). When the total cost is more than 5000, the workflow calls the approval activity and waits for the `ApprovalEvent` event for up to 10 minutes.

```typescript
import { Task, WorkflowActivityContext, WorkflowContext, DaprClient, LogLevel } from "@dapr/dapr";
import { ApprovalRequest, ApprovalResponse, InventoryItem, InventoryRequest, InventoryResult, OrderNotification, OrderPayload, OrderPaymentRequest, OrderResult } from "./model";

export const daprClient = new DaprClient({ logger: { level: LogLevel.Error } });
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

export const requestApprovalActivity = async (_: WorkflowActivityContext, request: ApprovalRequest) => {
  console.log(`Approval requested for order ${request.orderId}. Waiting for approval.`);
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
    yield ctx.callActivity(requestApprovalActivity, { orderId, order });
    const approvalTask = ctx.waitForExternalEvent<ApprovalResponse>("ApprovalEvent", { timeoutInSeconds: 600 });
    yield approvalTask;
    // The Dapr CLI sends the --input value as a JSON string, so accept a string or an object.
    const reply = approvalTask.getResult();
    const approval = typeof reply === "string" ? JSON.parse(reply) as ApprovalResponse : reply;
    if (!approval?.approved) {
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
- Docker is optional. To run without Docker, follow [How to: Run workflows locally without Docker]({{% ref howto-run-workflow-without-docker.md %}}).
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

The order in this quickstart is 2 cars at 5000 each, a total of 10000. An order over 5000 needs approval, so the workflow waits for an approval event. In these steps, you stop the app while the workflow waits, start the app again, and then approve the order. The workflow continues from its history.

1. Set an order ID. The app uses it as the workflow instance ID.

   Linux and macOS:

   ```bash
   export ORDER_ID=order-$(date +%Y%m%d-%H%M%S)
   ```

   Windows (PowerShell):

   ```powershell
   $env:ORDER_ID = "order-$(Get-Date -Format yyyyMMdd-HHmmss)"
   ```

1. Start the order processor app alongside a Dapr sidecar using [Multi-App Run]({{% ref multi-app-dapr-run %}}). From the `csharp/sdk` directory, run the following command:

   ```bash
   dapr run -f .
   ```

   The log shows the order ID, `Started order <id>.`, the activities that run before the approval, and then the request for approval.

   Expected output:

   ```text
   == APP - order-processor == Order ID: order-20261024-101500
   == APP - order-processor == Started order order-20261024-101500.
   == APP - order-processor == info: WorkflowConsoleApp.Activities.NotifyActivity[1985924262]
   == APP - order-processor ==       Presenting notification Notification { Message = Received order order-20261024-101500 for 2 Cars at $10000 }
   == APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[2013970020]
   == APP - order-processor ==       Received request ID 'order-20261024-101500' for 2 Cars at $10000
   == APP - order-processor == info: WorkflowConsoleApp.Activities.VerifyInventoryActivity[1478802116]
   == APP - order-processor ==       Reserving inventory for order request ID 'order-20261024-101500' of 2 Cars
   == APP - order-processor == info: WorkflowConsoleApp.Activities.VerifyInventoryActivity[1130866279]
   == APP - order-processor ==       There are: 10 Cars available for purchase
   == APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[1162731597]
   == APP - order-processor ==       Checked inventory for request ID 'InventoryRequest { RequestId = order-20261024-101500, ItemName = Cars, Quantity = 2 }'
   == APP - order-processor == info: WorkflowConsoleApp.Activities.RequestApprovalActivity[1622798141]
   == APP - order-processor ==       Approval requested for order order-20261024-101500. Waiting for approval.
   ```

1. Stop the app with Ctrl+C. The workflow is not complete. Dapr keeps its state.

1. Start the app again in the same terminal. `ORDER_ID` is still set.

   ```bash
   dapr run -f .
   ```

   The log shows `Order <id> is already running. Waiting for it to finish.` The activities that ran before the approval do not run again.

1. Open a second terminal and approve the order. Use the order ID that the app printed.

   ```bash
   dapr workflow raise-event <id>/ApprovalEvent --app-id order-processor --input '{"approved": true}'
   ```

   Expected output:

   ```text
   Workflow 'order-20261024-101500' raised event 'ApprovalEvent' successfully
   ```

1. The first terminal shows the payment, the inventory update, and the end of the workflow.

   Expected output:

   ```text
   == APP - order-processor == Order ID: order-20261024-101500
   == APP - order-processor == Order order-20261024-101500 is already running. Waiting for it to finish.
   == APP - order-processor == info: WorkflowConsoleApp.Activities.ProcessPaymentActivity[340284070]
   == APP - order-processor ==       Processing payment: request ID 'order-20261024-101500' for 2 Cars at $10000
   == APP - order-processor == info: WorkflowConsoleApp.Activities.ProcessPaymentActivity[1851315765]
   == APP - order-processor ==       Payment for request ID 'order-20261024-101500' processed successfully
   == APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[340284070]
   == APP - order-processor ==       Processed payment request as there's sufficient inventory to proceed: PaymentRequest { RequestId = order-20261024-101500, ItemBeingPurchased = Cars, Amount = 2, Currency = 10000 }
   == APP - order-processor == info: WorkflowConsoleApp.Activities.UpdateInventoryActivity[2144991393]
   == APP - order-processor ==       Checking inventory for request ID 'order-20261024-101500' for 2 Cars
   == APP - order-processor == info: WorkflowConsoleApp.Activities.UpdateInventoryActivity[1901852920]
   == APP - order-processor ==       There are now 8 Cars left in stock
   == APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[96138418]
   == APP - order-processor ==       Updating available inventory for PaymentRequest { RequestId = order-20261024-101500, ItemBeingPurchased = Cars, Amount = 2, Currency = 10000 }
   == APP - order-processor == info: WorkflowConsoleApp.Activities.NotifyActivity[1985924262]
   == APP - order-processor ==       Presenting notification Notification { Message = Order order-20261024-101500 has completed! }
   == APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[510392223]
   == APP - order-processor ==       Order order-20261024-101500 has completed
   == APP - order-processor == Workflow completed: COMPLETED
   ```

The activities that finished before you stopped the app did not run again. The workflow continued from its history. An activity that was in progress when you stopped the app can run again.

To reject the order, raise the event with `{"approved": false}`. If no answer arrives in 10 minutes, the workflow cancels the order. If you start the app with an order ID whose workflow already ended, the app prints `Workflow completed: <status>` and exits. To place a new order, set a new `ORDER_ID`.

To stop the Dapr processes that `dapr run -f .` started, press Ctrl+C or run `dapr stop -f .`.

### (Optional) Step 4: View in Zipkin

Running `dapr init` launches the [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) Docker container. If the container has stopped running, launch the Zipkin Docker container with the following command:

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

View the workflow trace spans in the Zipkin web UI (typically at `http://localhost:9411/zipkin/`).

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### What happened?

When you ran `dapr run -f .`:

1. The app makes an order for two cars with a total cost of 10000. The app writes the inventory to the state store only when the inventory is not there. A restart does not restock it.
2. The order ID from `ORDER_ID` is the workflow instance ID. The app checks if the workflow instance exists. When it does not exist, the app schedules it. When it exists and is still running, the app waits for it. When it ended, the app prints its status and exits.
3. The `NotifyActivity` workflow activity sends a notification that says the app received an order for two cars.
4. The `VerifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock. The inventory is sufficient so the workflow continues.
5. The total cost of the order is more than 5000, so the workflow calls the `RequestApprovalActivity` activity. Then the workflow waits for the `ApprovalEvent` event for up to 10 minutes. When the 10 minutes end, the workflow cancels the order.
6. You stopped the app and started it again. The app found the workflow instance, and the workflow continued from its history. The activities that finished before the stop did not run again.
7. When you raised `ApprovalEvent` with `{"approved": true}`, the `ProcessPaymentActivity` workflow activity processed the payment for the order.
8. The `UpdateInventoryActivity` workflow activity updated the inventory with the current available cars after the payment.
9. The `NotifyActivity` workflow activity sent a notification that says the order is complete.
10. The workflow ended as completed, and the app printed `Workflow completed: COMPLETED`.

#### `order-processor/Program.cs`

In the application's program file:

- The app reads the order ID from `ORDER_ID`, or builds it from the local time when `ORDER_ID` is not set
- The app saves the inventory to the state store through the `IInventoryStore` client, only when the inventory is not there
- The app gets the state of the workflow instance. It schedules the workflow only when the instance does not exist. It waits for an instance that is still running
- The app gets the workflow status when the workflow ends

The program file does not register the workflow or its activities. The source generator in the .NET 10 SDK registers them when the app builds.

```csharp
using Dapr.StateManagement.Extensions;
using Dapr.Workflow;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using WorkflowConsoleApp.Models;
using WorkflowConsoleApp.Models.State;
using WorkflowConsoleApp.Workflows;

// The workflow host is a background service that connects to the sidecar over gRPC
using var host = Host.CreateDefaultBuilder(args)
    .ConfigureLogging(logging => logging
        // Keep the console to the order lines: hide the SDK, HTTP client and gRPC client info lines
        .AddFilter("System.Net.Http.HttpClient", LogLevel.Warning)
        .AddFilter("Grpc.Net.Client", LogLevel.Critical)
        .AddFilter("Dapr.Workflow", LogLevel.Warning)
        // Ctrl+C closes the sidecar connection, and the worker logs that as an error with a stack trace
        .AddFilter("Dapr.Workflow.Worker", LogLevel.Critical)
        .AddFilter("Microsoft.Hosting.Lifetime", LogLevel.Warning))
    .ConfigureServices(services =>
    {
        services.AddDaprStateManagementClient()
            .WithInventoryStore();
        services.AddDaprWorkflow();
    }).Build();

// Start the app - this is the point where we connect to the Dapr sidecar
host.Start();

// Ctrl+C cancels this token, so the app stops while it waits for the workflow
var stopping = host.Services.GetRequiredService<IHostApplicationLifetime>().ApplicationStopping;
var workflowClient = host.Services.GetRequiredService<DaprWorkflowClient>();

// The workflow instance ID is the order ID. Set ORDER_ID to use the same instance again after a restart
var orderId = Environment.GetEnvironmentVariable("ORDER_ID");
if (string.IsNullOrWhiteSpace(orderId))
{
    orderId = $"order-{DateTime.Now:yyyyMMdd-HHmmss}";
}

const string itemToPurchase = "Cars";
const int amountToPurchase = 2;
const double pricePerItem = 5000;

Console.WriteLine($"Order ID: {orderId}");

try
{
    // Populate the store with items only when the inventory is not there yet, so a restart does not restock
    var stateStore = host.Services.GetRequiredService<IInventoryStore>();
    var (inventory, _) = await stateStore.GetStateAndETagAsync<OrderPayload>(itemToPurchase, cancellationToken: stopping);
    if (inventory is null)
    {
        await stateStore.SaveStateAsync(itemToPurchase, new OrderPayload(Name: itemToPurchase, TotalCost: 50000, Quantity: 10), cancellationToken: stopping);
    }

    // Check if the workflow instance exists already
    var existing = await workflowClient.GetWorkflowStateAsync(orderId, getInputsAndOutputs: false, cancellation: stopping);
    if (existing is { Exists: true })
    {
        if (existing.RuntimeStatus is WorkflowRuntimeStatus.Completed or WorkflowRuntimeStatus.Failed or WorkflowRuntimeStatus.Terminated)
        {
            // The workflow ended already, so there is nothing to wait for
            Console.WriteLine($"Workflow completed: {existing.RuntimeStatus.ToString().ToUpperInvariant()}");
            return;
        }

        Console.WriteLine($"Order {orderId} is already running. Waiting for it to finish.");
    }
    else
    {
        // Construct the order: 2 cars at 5000 each. A total over 5000 needs an approval
        var orderInfo = new OrderPayload(itemToPurchase, pricePerItem * amountToPurchase, amountToPurchase);

        await workflowClient.ScheduleNewWorkflowAsync(
            name: nameof(OrderProcessingWorkflow),
            instanceId: orderId,
            input: orderInfo,
            startTime: null,
            cancellation: stopping);

        Console.WriteLine($"Started order {orderId}.");
    }

    // Wait for the workflow to finish. The approval timeout is 10 minutes, so wait longer than that
    using var timeout = CancellationTokenSource.CreateLinkedTokenSource(stopping);
    timeout.CancelAfter(TimeSpan.FromMinutes(15));
    var state = await workflowClient.WaitForWorkflowCompletionAsync(
        instanceId: orderId,
        getInputsAndOutputs: false,
        cancellation: timeout.Token);

    Console.WriteLine($"Workflow completed: {state.RuntimeStatus.ToString().ToUpperInvariant()}");
}
catch (OperationCanceledException)
{
    // Ctrl+C or the 15 minute wait ended. The workflow keeps its state in the state store
}
```

#### `order-processor/Workflows/OrderProcessingWorkflow.cs`

In `OrderProcessingWorkflow.cs`, the workflow is defined as a class with all of its associated tasks (determined by workflow activities in separate files). When the total cost is more than 5000, the workflow calls the approval activity and waits for the `ApprovalEvent` event for up to 10 minutes.

```csharp
﻿namespace WorkflowConsoleApp.Workflows;

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
                timeout: TimeSpan.FromMinutes(10));
            if (!approvalResponse.Approved)
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
- Docker is optional. To run without Docker, follow [How to: Run workflows locally without Docker]({{% ref howto-run-workflow-without-docker.md %}}).

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

The order in this quickstart is 2 cars at 5000 each, a total of 10000. An order over 5000 needs approval, so the workflow waits for an approval event. In these steps, you stop the app while the workflow waits, start the app again, and then approve the order. The workflow continues from its history.

1. Set an order ID. The app uses it as the workflow instance ID.

   Linux and macOS:

   ```bash
   export ORDER_ID=order-$(date +%Y%m%d-%H%M%S)
   ```

   Windows (PowerShell):

   ```powershell
   $env:ORDER_ID = "order-$(Get-Date -Format yyyyMMdd-HHmmss)"
   ```

1. Start the order processor app alongside a Dapr sidecar using [Multi-App Run]({{% ref multi-app-dapr-run %}}). From the `java/sdk` directory, run the following command:

   ```bash
   dapr run -f .
   ```

   The log shows the order ID, `Started order <id>.`, the activities that run before the approval, and then the request for approval.

   Expected output:

   ```text
   == APP - order-processor == *** Welcome to the Dapr Workflow console app sample!
   == APP - order-processor == *** Using this app, you can place orders that start workflows.
   == APP - order-processor == Order ID: order-20261024-101500
   == APP - order-processor == Start workflow runtime
   == APP - order-processor == Started order order-20261024-101500.
   == APP - order-processor == [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.NotifyActivity - Received Order: OrderPayload [itemName=cars, totalCost=10000, quantity=2]
   == APP - order-processor == [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.VerifyInventoryActivity - Verifying inventory for order 'order-20261024-101500' of 2 cars
   == APP - order-processor == [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.VerifyInventoryActivity - There are 10 cars available for purchase
   == APP - order-processor == [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.VerifyInventoryActivity - Verified inventory for order 'order-20261024-101500' of 2 cars
   == APP - order-processor == [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.RequestApprovalActivity - Requesting approval for order: order-20261024-101500
   == APP - order-processor == Approval requested for order order-20261024-101500. Waiting for approval.
   ```

1. Stop the app with Ctrl+C. The workflow is not complete. Dapr keeps its state.

1. Start the app again in the same terminal. `ORDER_ID` is still set.

   ```bash
   dapr run -f .
   ```

   The log shows `Order <id> is already running. Waiting for it to finish.` The activities that ran before the approval do not run again.

1. Open a second terminal and approve the order. Use the order ID that the app printed.

   ```bash
   dapr workflow raise-event <id>/ApprovalEvent --app-id order-processor --input '{"approved": true}'
   ```

   Expected output:

   ```text
   Workflow 'order-20261024-101500' raised event 'ApprovalEvent' successfully
   ```

1. The first terminal shows the payment, the inventory update, and the end of the workflow.

   Expected output:

   ```text
   == APP - order-processor == *** Welcome to the Dapr Workflow console app sample!
   == APP - order-processor == *** Using this app, you can place orders that start workflows.
   == APP - order-processor == Order ID: order-20261024-101500
   == APP - order-processor == Start workflow runtime
   == APP - order-processor == Order order-20261024-101500 is already running. Waiting for it to finish.
   == APP - order-processor == [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.ProcessPaymentActivity - Processing payment: order-20261024-101500 for 2 cars at $10000
   == APP - order-processor == [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.ProcessPaymentActivity - Payment for request ID 'order-20261024-101500' processed successfully
   == APP - order-processor == [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.UpdateInventoryActivity - Updating inventory for order 'order-20261024-101500' of 2 cars
   == APP - order-processor == [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.UpdateInventoryActivity - Updated inventory for order 'order-20261024-101500': there are now 8 cars left in stock
   == APP - order-processor == there are now 8 cars left in stock
   == APP - order-processor == [pool-2-thread-1] INFO io.dapr.quickstarts.workflows.activities.NotifyActivity - Order completed! : order-20261024-101500
   == APP - order-processor == Workflow completed: COMPLETED
   ```

The activities that finished before you stopped the app did not run again. The workflow continued from its history. An activity that was in progress when you stopped the app can run again.

To reject the order, raise the event with `{"approved": false}`. If no answer arrives in 10 minutes, the workflow cancels the order. If you start the app with an order ID whose workflow already ended, the app prints `Workflow completed: <status>` and exits. To place a new order, set a new `ORDER_ID`.

To stop the Dapr processes that `dapr run -f .` started, press Ctrl+C or run `dapr stop -f .`.

### (Optional) Step 4: View in Zipkin

Running `dapr init` launches the [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) Docker container. If the container has stopped running, launch the Zipkin Docker container with the following command:

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

View the workflow trace spans in the Zipkin web UI (typically at `http://localhost:9411/zipkin/`).

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### What happened?

When you ran `dapr run -f .`:

1. The app makes an order for two cars with a total cost of 10000. The app writes the inventory to the state store only when the inventory is not there. A restart does not restock it.
2. The order ID from `ORDER_ID` is the workflow instance ID. The app checks if the workflow instance exists. When it does not exist, the app schedules it. When it exists and is still running, the app waits for it. When it ended, the app prints its status and exits.
3. The `NotifyActivity` workflow activity sends a notification that says the app received an order for two cars.
4. The `VerifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock. The inventory is sufficient so the workflow continues.
5. The total cost of the order is more than 5000, so the workflow calls the `RequestApprovalActivity` activity. Then the workflow waits for the `ApprovalEvent` event for up to 10 minutes. When the 10 minutes end, the workflow cancels the order.
6. You stopped the app and started it again. The app found the workflow instance, and the workflow continued from its history. The activities that finished before the stop did not run again.
7. When you raised `ApprovalEvent` with `{"approved": true}`, the `ProcessPaymentActivity` workflow activity processed the payment for the order.
8. The `UpdateInventoryActivity` workflow activity updated the inventory with the current available cars after the payment.
9. The `NotifyActivity` workflow activity sent a notification that says the order is complete.
10. The workflow ended as completed, and the app printed `Workflow completed: COMPLETED`.

#### `order-processor/WorkflowConsoleApp.java` 

In the application's program file:
- The app reads the order ID from `ORDER_ID`, or builds it from the local time when `ORDER_ID` is not set
- The app gets the state of the workflow instance. It schedules the workflow only when the instance does not exist. It waits for an instance that is still running
- The app saves the inventory to the state store only when the inventory is not there
- The app gets the workflow status when the workflow ends
- The app registers the workflow and the workflow activities it invokes

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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.logging.Level;
import java.util.logging.Logger;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
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
  private static final String ITEM_NAME = "cars";
  private static final int PER_ITEM_COST = 5000;
  private static final int ORDER_QUANTITY = 2;

  // Keep a reference so the log level stays set.
  private static final Logger DURABLE_TASK_LOGGER = Logger.getLogger("io.dapr.durabletask");

  /**
   * The main method of this console app.
   *
   * @param args The port the app will listen on.
   * @throws Exception An Exception.
   */
  public static void main(String[] args) throws Exception {
    // Hide the internal SDK messages. Keep the warnings.
    DURABLE_TASK_LOGGER.setLevel(Level.WARNING);

    System.out.println("*** Welcome to the Dapr Workflow console app sample!");
    System.out.println("*** Using this app, you can place orders that start workflows.");

    String orderId = System.getenv("ORDER_ID");
    if (orderId == null || orderId.isBlank()) {
      orderId = "order-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
    }
    System.out.println("Order ID: " + orderId);

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

    restockInventoryIfAbsent();

    DaprWorkflowClient workflowClient = new DaprWorkflowClient();
    try (workflowClient) {
      executeWorkflow(workflowClient, orderId);
    }
    System.exit(0);
  }

  private static void executeWorkflow(DaprWorkflowClient workflowClient, String orderId) throws Exception {
    // Look for an instance with this ID. A restart finds the instance that the first run started.
    // A missing instance comes back as a status with an empty name.
    WorkflowInstanceStatus existing = workflowClient.getInstanceState(orderId, false);
    if (existing == null || existing.getName() == null || existing.getName().isEmpty()) {
      OrderPayload order = new OrderPayload();
      order.setItemName(ITEM_NAME);
      order.setQuantity(ORDER_QUANTITY);
      order.setTotalCost(ORDER_QUANTITY * PER_ITEM_COST);
      workflowClient.scheduleNewWorkflow(OrderProcessingWorkflow.class, order, orderId);
      System.out.printf("Started order %s.%n", orderId);
    } else if (existing.isCompleted()) {
      System.out.printf("Workflow completed: %s%n", existing.getRuntimeStatus().name());
      return;
    } else {
      System.out.printf("Order %s is already running. Waiting for it to finish.%n", orderId);
    }

    WorkflowInstanceStatus status = workflowClient.waitForInstanceCompletion(orderId, Duration.ofMinutes(15), true);
    if (status != null) {
      System.out.printf("Workflow completed: %s%n", status.getRuntimeStatus().name());
    } else {
      System.out.printf("Order %s not found%n", orderId);
    }
  }

  private static void restockInventoryIfAbsent() {
    DaprClient daprClient = new DaprClientBuilder().build();
    // Write the inventory only when it is not there yet, so a restart does not restock.
    State<InventoryItem> current = daprClient.getState(STATE_STORE_NAME, ITEM_NAME, InventoryItem.class).block();
    if (current != null && current.getValue() != null) {
      return;
    }
    InventoryItem inventory = new InventoryItem();
    inventory.setName(ITEM_NAME);
    inventory.setPerItemCost(PER_ITEM_COST);
    inventory.setQuantity(10);
    daprClient.saveState(STATE_STORE_NAME, ITEM_NAME, inventory).block();
  }
}
```

#### `OrderProcessingWorkflow.java`

In `OrderProcessingWorkflow.java`, the workflow is defined as a class with all of its associated tasks (determined by workflow activities). When the total cost is more than 5000, the workflow calls the approval activity and waits for the `ApprovalEvent` event for up to 10 minutes.

```java
package io.dapr.quickstarts.workflows;

import java.time.Duration;

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
      String orderId = ctx.getInstanceId();

      OrderPayload order = ctx.getInput(OrderPayload.class);
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
        ctx.callActivity(RequestApprovalActivity.class.getName(), orderId).await();

        ApprovalResponse approvalResponse = ctx.waitForExternalEvent("ApprovalEvent",
          Duration.ofMinutes(10), ApprovalResponse.class).await();
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
- Docker is optional. To run without Docker, follow [How to: Run workflows locally without Docker]({{% ref howto-run-workflow-without-docker.md %}}).

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

The order in this quickstart is 2 cars at 5000 each, a total of 10000. An order over 5000 needs approval, so the workflow waits for an approval event. In these steps, you stop the app while the workflow waits, start the app again, and then approve the order. The workflow continues from its history.

1. Set an order ID. The app uses it as the workflow instance ID.

   Linux and macOS:

   ```bash
   export ORDER_ID=order-$(date +%Y%m%d-%H%M%S)
   ```

   Windows (PowerShell):

   ```powershell
   $env:ORDER_ID = "order-$(Get-Date -Format yyyyMMdd-HHmmss)"
   ```

1. Start the order processor app alongside a Dapr sidecar using [Multi-App Run]({{% ref multi-app-dapr-run %}}). From the `go/sdk` directory, run the following command:

   ```bash
   dapr run -f .
   ```

   The log shows the order ID, `Started order <id>.`, the activities that run before the approval, and then the request for approval.

   Expected output:

   ```text
   == APP - order-processor == *** Welcome to the Dapr Workflow console app sample!
   == APP - order-processor == *** Using this app, you can place orders that start workflows.
   == APP - order-processor == dapr client initializing for: 127.0.0.1:36315
   == APP - order-processor == adding base stock item: paperclip
   == APP - order-processor == adding base stock item: cars
   == APP - order-processor == adding base stock item: computers
   == APP - order-processor == Order ID: order-20261024-101500
   == APP - order-processor == NotifyActivity: Received order order-20261024-101500 for 2 cars - $10000
   == APP - order-processor == Started order order-20261024-101500.
   == APP - order-processor == VerifyInventoryActivity: Verifying inventory for order order-20261024-101500 of 2 cars
   == APP - order-processor == VerifyInventoryActivity: There are 10 cars available for purchase
   == APP - order-processor == Approval requested for order order-20261024-101500. Waiting for approval.
   ```

1. Stop the app with Ctrl+C. The workflow is not complete. Dapr keeps its state.

1. Start the app again in the same terminal. `ORDER_ID` is still set.

   ```bash
   dapr run -f .
   ```

   The log shows `Order <id> is already running. Waiting for it to finish.` The activities that ran before the approval do not run again.

1. Open a second terminal and approve the order. Use the order ID that the app printed.

   ```bash
   dapr workflow raise-event <id>/ApprovalEvent --app-id order-processor --input '{"approved": true}'
   ```

   Expected output:

   ```text
   Workflow 'order-20261024-101500' raised event 'ApprovalEvent' successfully
   ```

1. The first terminal shows the payment, the inventory update, and the end of the workflow.

   Expected output:

   ```text
   == APP - order-processor == *** Welcome to the Dapr Workflow console app sample!
   == APP - order-processor == *** Using this app, you can place orders that start workflows.
   == APP - order-processor == dapr client initializing for: 127.0.0.1:40473
   == APP - order-processor == Order ID: order-20261024-101500
   == APP - order-processor == Order order-20261024-101500 is already running. Waiting for it to finish.
   == APP - order-processor == NotifyActivity: Payment for order order-20261024-101500 has been approved!
   == APP - order-processor == ProcessPaymentActivity: order-20261024-101500 for 2 - cars (10000USD)
   == APP - order-processor == UpdateInventoryActivity: Checking Inventory for order order-20261024-101500 for 2 * cars
   == APP - order-processor == UpdateInventoryActivity: There are now 8 cars left in stock
   == APP - order-processor == NotifyActivity: Order order-20261024-101500 has completed!
   == APP - order-processor == Workflow completed: COMPLETED
   ```

The activities that finished before you stopped the app did not run again. The workflow continued from its history. An activity that was in progress when you stopped the app can run again.

To reject the order, raise the event with `{"approved": false}`. If no answer arrives in 10 minutes, the workflow cancels the order. If you start the app with an order ID whose workflow already ended, the app prints `Workflow completed: <status>` and exits. To place a new order, set a new `ORDER_ID`.

To stop the Dapr processes that `dapr run -f .` started, press Ctrl+C or run `dapr stop -f .`.

### (Optional) Step 4: View in Zipkin

Running `dapr init` launches the [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) Docker container. If the container has stopped running, launch the Zipkin Docker container with the following command:

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

View the workflow trace spans in the Zipkin web UI (typically at `http://localhost:9411/zipkin/`).

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### What happened?

When you ran `dapr run -f .`:

1. The app makes an order for two cars with a total cost of 10000. The app writes the inventory to the state store only when the inventory is not there. A restart does not restock it.
2. The order ID from `ORDER_ID` is the workflow instance ID. The app checks if the workflow instance exists. When it does not exist, the app schedules it. When it exists and is still running, the app waits for it. When it ended, the app prints its status and exits.
3. The `NotifyActivity` workflow activity sends a notification that says the app received an order for two cars.
4. The `VerifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock. The inventory is sufficient so the workflow continues.
5. The total cost of the order is more than 5000, so the workflow calls the `RequestApprovalActivity` activity. Then the workflow waits for the `ApprovalEvent` event for up to 10 minutes. When the 10 minutes end, the workflow cancels the order.
6. You stopped the app and started it again. The app found the workflow instance, and the workflow continued from its history. The activities that finished before the stop did not run again.
7. When you raised `ApprovalEvent` with `{"approved": true}`, the `ProcessPaymentActivity` workflow activity processed the payment for the order.
8. The `UpdateInventoryActivity` workflow activity updated the inventory with the current available cars after the payment.
9. The `NotifyActivity` workflow activity sent a notification that says the order is complete.
10. The workflow ended as completed, and the app printed `Workflow completed: COMPLETED`.

#### `order-processor/main.go`

In the application's program file:

- The app reads the order ID from `ORDER_ID`, or builds it from the local time when `ORDER_ID` is not set
- The app gets the state of the workflow instance. It schedules the workflow only when the instance does not exist. It waits for an instance that is still running
- The app saves the inventory to the state store only when the inventory is not there
- The app gets the workflow status when the workflow ends
- The app registers the workflow and the workflow activities it invokes

```go
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/dapr/durabletask-go/api"
	"github.com/dapr/durabletask-go/workflow"
	"github.com/dapr/go-sdk/client"
)

var (
	stateStoreName    = "statestore"
	workflowComponent = "dapr"
	workflowName      = "OrderProcessingWorkflow"
	defaultItemName   = "cars"
)

// quietLogger hides the informational lines of the workflow SDK. It prints warnings and errors.
type quietLogger struct{}

func (quietLogger) Debug(v ...any)            {}
func (quietLogger) Debugf(string, ...any)     {}
func (quietLogger) Info(v ...any)             {}
func (quietLogger) Infof(string, ...any)      {}
func (quietLogger) Warn(v ...any)             { log.Print(v...) }
func (quietLogger) Warnf(f string, v ...any)  { log.Printf(f, v...) }
func (quietLogger) Error(v ...any)            { log.Print(v...) }
func (quietLogger) Errorf(f string, v ...any) { log.Printf(f, v...) }

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

	dclient, err := client.NewClient()
	if err != nil {
		log.Fatal(err)
	}
	wfClient := workflow.NewClientWithLogger(dclient.GrpcClientConn(), quietLogger{})

	if err := wfClient.StartWorker(context.Background(), r); err != nil {
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

	// The order id comes from ORDER_ID. Run the app again with the same id to attach to the same order.
	orderID := os.Getenv("ORDER_ID")
	if orderID == "" {
		orderID = "order-" + time.Now().Format("20060102-150405")
	}
	fmt.Printf("Order ID: %s\n", orderID)

	// Two cars at 5000 each: the total is over 5000, so the workflow waits for approval.
	orderQuantity := 2
	orderPayload := OrderPayload{
		ItemName:  defaultItemName,
		Quantity:  orderQuantity,
		TotalCost: inventory[1].PerItemCost * orderQuantity,
	}

	ctx := context.Background()
	meta, err := wfClient.FetchWorkflowMetadata(ctx, orderID)
	switch {
	case err == nil:
		switch meta.String() {
		case "RUNNING", "PENDING", "SUSPENDED":
			fmt.Printf("Order %s is already running. Waiting for it to finish.\n", orderID)
		default:
			fmt.Printf("Workflow completed: %s\n", meta.String())
			return
		}
	case errors.Is(err, api.ErrInstanceNotFound):
		if _, err := wfClient.ScheduleWorkflow(ctx, workflowName, workflow.WithInstanceID(orderID), workflow.WithInput(orderPayload)); err != nil {
			log.Fatalf("failed to start workflow: %v", err)
		}
		fmt.Printf("Started order %s.\n", orderID)
	default:
		log.Fatalf("failed to get workflow: %v", err)
	}

	waitCtx, cancel := context.WithTimeout(ctx, 20*time.Minute)
	defer cancel()
	respFetch, err := wfClient.WaitForWorkflowCompletion(waitCtx, orderID)
	if err != nil {
		log.Fatalf("failed to wait for workflow: %v", err)
	}

	fmt.Printf("Workflow completed: %s\n", respFetch.String())
}

func restockInventory(daprClient client.Client, inventory []InventoryItem) error {
	for _, item := range inventory {
		existing, err := daprClient.GetState(context.Background(), stateStoreName, item.ItemName, nil)
		if err != nil {
			return err
		}
		if existing != nil && len(existing.Value) > 0 {
			continue
		}
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

In `workflow.go`, the workflow and its workflow activities are defined. When the total cost is more than 5000, the workflow calls the approval activity and waits for the `ApprovalEvent` event for up to 10 minutes.

```go
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/dapr/durabletask-go/workflow"
	"github.com/dapr/go-sdk/client"
)

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
		if err := ctx.CallActivity(RequestApprovalActivity, workflow.WithActivityInput(ApprovalRequest{
			RequestID: orderID,
			Quantity:  orderPayload.Quantity,
			ItemName:  orderPayload.ItemName,
			TotalCost: orderPayload.TotalCost,
		})).Await(nil); err != nil {
			return OrderResult{Processed: false}, err
		}
		var rawApproval json.RawMessage
		if err := ctx.WaitForExternalEvent("ApprovalEvent", 10*time.Minute).Await(&rawApproval); err != nil {
			if errors.Is(err, workflow.ErrTaskCanceled) {
				if nerr := ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Order %s was cancelled: no approval within 10 minutes", orderID)})).Await(nil); nerr != nil {
					return OrderResult{Processed: false}, nerr
				}
			}
			return OrderResult{Processed: false}, err
		}
		approval, err := parseApproval(rawApproval)
		if err != nil {
			return OrderResult{Processed: false}, err
		}
		if !approval.Approved {
			if err := ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Payment for order %s has been rejected!", orderID)})).Await(nil); err != nil {
				return OrderResult{Processed: false}, err
			}
			return OrderResult{Processed: false}, nil
		}
		if err := ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Payment for order %s has been approved!", orderID)})).Await(nil); err != nil {
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
		_ = ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Order %s failed!", orderID)})).Await(nil)
		return OrderResult{Processed: false}, err
	}

	err = ctx.CallActivity(UpdateInventoryActivity, workflow.WithActivityInput(PaymentRequest{
		RequestID:          orderID,
		ItemBeingPurchased: orderPayload.ItemName,
		Amount:             orderPayload.TotalCost,
		Quantity:           orderPayload.Quantity,
	})).Await(nil)
	if err != nil {
		_ = ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Order %s failed!", orderID)})).Await(nil)
		return OrderResult{Processed: false}, err
	}

	_ = ctx.CallActivity(NotifyActivity, workflow.WithActivityInput(Notification{Message: fmt.Sprintf("Order %s has completed!", orderID)})).Await(nil)
	return OrderResult{Processed: true}, nil
}

// parseApproval reads the payload of ApprovalEvent. The Dapr CLI sends the --input text as a JSON string,
// so the payload can be the object {"approved": true} or a string that holds that object.
func parseApproval(raw json.RawMessage) (ApprovalResponse, error) {
	var approval ApprovalResponse
	var text string
	if err := json.Unmarshal(raw, &text); err == nil {
		raw = json.RawMessage(text)
	}
	if err := json.Unmarshal(raw, &approval); err != nil {
		return approval, fmt.Errorf("invalid approval payload %s: %w", string(raw), err)
	}
	return approval, nil
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

// RequestApprovalActivity requests approval for the order. The workflow then waits for ApprovalEvent.
func RequestApprovalActivity(ctx workflow.ActivityContext) (any, error) {
	var input ApprovalRequest
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	fmt.Printf("Approval requested for order %s. Waiting for approval.\n", input.RequestID)
	return nil, nil
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
NAMESPACE  APP ID           NAME                     INSTANCE ID            CREATED               LAST UPDATE           STATUS
default    order-processor  OrderProcessingWorkflow  order-20261024-101500  2025-11-07T12:29:37Z  2025-11-07T12:29:52Z  COMPLETED
```

### Check Workflow History

View the detailed execution history of your workflow:

```bash
dapr workflow history order-20261024-101500 --app-id order-processor
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
It takes a single argument in the format of `<instance-id>/<event-name>`. The event name must be the name that the workflow code waits for. All the quickstart samples wait for `ApprovalEvent`. The order in this quickstart costs 10000, so the workflow waits for an approval event.

In the examples below, replace `order-20261024-101500` with the order ID that your app printed.

```bash
dapr workflow raise-event order-20261024-101500/ApprovalEvent \
  --app-id order-processor \
  --input '{"approved": true}'
```

#### Suspend and Resume

```bash
# Suspend a workflow
dapr workflow suspend order-20261024-101500 \
  --app-id order-processor \
  --reason "Waiting for inventory"

# Resume when ready
dapr workflow resume order-20261024-101500 \
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
dapr workflow purge order-20261024-101500 --app-id order-processor

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

{{< button text="Explore the workflow tutorials  >>" link="https://github.com/dapr/quickstarts/tree/master/tutorials/workflow" >}}
