---
type: docs
title: "Quickstart: Workflow"
linkTitle: Workflow
weight: 73
description: Get started with the Dapr Workflow building block
---

{{% alert title="Note" color="primary" %}}
Redis is currently used as the state store component for Workflows in the Quickstarts. However, Redis does not support transaction rollbacks and should not be used in production as an actor state store.
{{% /alert %}}

Let's take a look at the Dapr [Workflow building block]({{< ref workflow-overview.md >}}). In this Quickstart, you'll create a simple console application to demonstrate Dapr's workflow programming model and the workflow management APIs.

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
{{< tabs "Python" "JavaScript" ".NET" "Java" Go >}}

 <!-- Python -->
{{% codetab %}}

The `order-processor` console app starts and manages the `order_processing_workflow`, which simulates purchasing items from a store. The workflow consists of five unique workflow activities, or tasks:

- `notify_activity`: Utilizes a logger to print out messages throughout the workflow. These messages notify you when:
  - You have insufficient inventory
  - Your payment couldn't be processed, etc.
- `verify_inventory_activity`: Checks the state store to ensure there is enough inventory present for purchase.
- `request_approval_activity`: Requests approval for orders over a certain cost threshold.
- `process_payment_activity`: Processes and authorizes the payment.
- `update_inventory_activity`: Removes the requested items from the state store and updates the store with the new remaining inventory value.

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.7+ installed](https://www.python.org/downloads/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/workflows/python/sdk).

```bash
git clone https://github.com/dapr/quickstarts.git
```

In a new terminal window, navigate to the `order-processor` directory:

```bash
cd workflows/python/sdk/order-processor
```

Install the Dapr Python SDK package:

```bash
pip3 install -r requirements.txt
```

Return to the `python/sdk` directory:

```bash
cd ..
```


### Step 3: Run the order processor app

In the terminal, start the order processor app alongside a Dapr sidecar using [Multi-App Run]({{< ref multi-app-dapr-run >}}). From the `python/sdk` directory, run the following command:

```bash
dapr run -f .
```

This starts the `order-processor` app with unique workflow ID and runs the workflow activities.

Expected output:

```bash
== APP - order-processor == *** Welcome to the Dapr Workflow console app sample!
== APP - order-processor == *** Using this app, you can place orders that start workflows.
== APP - order-processor == 2025-02-13 11:44:11.357 durabletask-worker INFO: Starting gRPC worker that connects to dns:127.0.0.1:38891
== APP - order-processor == 2025-02-13 11:44:11.361 durabletask-worker INFO: Successfully connected to dns:127.0.0.1:38891. Waiting for work items...
== APP - order-processor == INFO:NotifyActivity:Received order 6830cb00174544a0b062ba818e14fddc for 1 cars at $5000 !
== APP - order-processor == 2025-02-13 11:44:14.157 durabletask-worker INFO: 6830cb00174544a0b062ba818e14fddc: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:VerifyInventoryActivity:Verifying inventory for order 6830cb00174544a0b062ba818e14fddc of 1 cars
== APP - order-processor == INFO:VerifyInventoryActivity:There are 10 Cars available for purchase
== APP - order-processor == 2025-02-13 11:44:14.171 durabletask-worker INFO: 6830cb00174544a0b062ba818e14fddc: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:ProcessPaymentActivity:Processing payment: 6830cb00174544a0b062ba818e14fddc for 1 cars at 5000 USD
== APP - order-processor == INFO:ProcessPaymentActivity:Payment for request ID 6830cb00174544a0b062ba818e14fddc processed successfully
== APP - order-processor == 2025-02-13 11:44:14.177 durabletask-worker INFO: 6830cb00174544a0b062ba818e14fddc: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:UpdateInventoryActivity:Checking inventory for order 6830cb00174544a0b062ba818e14fddc for 1 cars
== APP - order-processor == INFO:UpdateInventoryActivity:There are now 9 cars left in stock
== APP - order-processor == 2025-02-13 11:44:14.189 durabletask-worker INFO: 6830cb00174544a0b062ba818e14fddc: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:NotifyActivity:Order 6830cb00174544a0b062ba818e14fddc has completed!
== APP - order-processor == 2025-02-13 11:44:14.195 durabletask-worker INFO: 6830cb00174544a0b062ba818e14fddc: Orchestration completed with status: COMPLETED
== APP - order-processor == item: InventoryItem(item_name=Paperclip, per_item_cost=5, quantity=100)
== APP - order-processor == item: InventoryItem(item_name=Cars, per_item_cost=5000, quantity=10)
== APP - order-processor == item: InventoryItem(item_name=Computers, per_item_cost=500, quantity=100)
== APP - order-processor == ==========Begin the purchase of item:==========
== APP - order-processor == Starting order workflow, purchasing 1 of cars
== APP - order-processor == 2025-02-13 11:44:16.363 durabletask-client INFO: Starting new 'order_processing_workflow' instance with ID = 'fc8a507e4a2246d2917d3ad4e3111240'.
== APP - order-processor == 2025-02-13 11:44:16.366 durabletask-client INFO: Waiting 30s for instance 'fc8a507e4a2246d2917d3ad4e3111240' to complete.
== APP - order-processor == 2025-02-13 11:44:16.366 durabletask-worker INFO: fc8a507e4a2246d2917d3ad4e3111240: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:NotifyActivity:Received order fc8a507e4a2246d2917d3ad4e3111240 for 1 cars at $5000 !
== APP - order-processor == 2025-02-13 11:44:16.373 durabletask-worker INFO: fc8a507e4a2246d2917d3ad4e3111240: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:VerifyInventoryActivity:Verifying inventory for order fc8a507e4a2246d2917d3ad4e3111240 of 1 cars
== APP - order-processor == INFO:VerifyInventoryActivity:There are 10 Cars available for purchase
== APP - order-processor == 2025-02-13 11:44:16.383 durabletask-worker INFO: fc8a507e4a2246d2917d3ad4e3111240: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:ProcessPaymentActivity:Processing payment: fc8a507e4a2246d2917d3ad4e3111240 for 1 cars at 5000 USD
== APP - order-processor == INFO:ProcessPaymentActivity:Payment for request ID fc8a507e4a2246d2917d3ad4e3111240 processed successfully
== APP - order-processor == 2025-02-13 11:44:16.390 durabletask-worker INFO: fc8a507e4a2246d2917d3ad4e3111240: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:UpdateInventoryActivity:Checking inventory for order fc8a507e4a2246d2917d3ad4e3111240 for 1 cars
== APP - order-processor == INFO:UpdateInventoryActivity:There are now 9 cars left in stock
== APP - order-processor == 2025-02-13 11:44:16.403 durabletask-worker INFO: fc8a507e4a2246d2917d3ad4e3111240: Orchestrator yielded with 1 task(s) and 0 event(s) outstanding.
== APP - order-processor == INFO:NotifyActivity:Order fc8a507e4a2246d2917d3ad4e3111240 has completed!
== APP - order-processor == 2025-02-13 11:44:16.411 durabletask-worker INFO: fc8a507e4a2246d2917d3ad4e3111240: Orchestration completed with status: COMPLETED
== APP - order-processor == 2025-02-13 11:44:16.425 durabletask-client INFO: Instance 'fc8a507e4a2246d2917d3ad4e3111240' completed.
== APP - order-processor == 2025-02-13 11:44:16.425 durabletask-worker INFO: Stopping gRPC worker...
== APP - order-processor == 2025-02-13 11:44:16.426 durabletask-worker INFO: Disconnected from dns:127.0.0.1:38891
== APP - order-processor == 2025-02-13 11:44:16.426 durabletask-worker INFO: No longer listening for work items
== APP - order-processor == 2025-02-13 11:44:16.426 durabletask-worker INFO: Worker shutdown completed
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
2. A unique order ID for the workflow is generated (in the above example, `fc8a507e4a2246d2917d3ad4e3111240`) and the workflow is scheduled.
3. The `notify_activity` workflow activity sends a notification saying an order for one car has been received.
4. The `verify_inventory_activity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock. The inventory is sufficient so the workflow continues.
5. The total cost of the order is 5000, so the workflow will not call the `request_approval_activity` activity.
6. The `process_payment_activity` workflow activity begins processing payment for order `fc8a507e4a2246d2917d3ad4e3111240` and confirms if successful.
7. The `update_inventory_activity` workflow activity updates the inventory with the current available cars after the order has been processed.
8. The `notify_activity` workflow activity sends a notification saying that order `fc8a507e4a2246d2917d3ad4e3111240` has completed.
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
import logging
import json

from dapr.ext.workflow import DaprWorkflowContext, WorkflowActivityContext, WorkflowRuntime, when_any
from dapr.clients import DaprClient
from dapr.conf import settings

from model import InventoryItem, Notification, InventoryRequest, OrderPayload, OrderResult,\
    PaymentRequest, InventoryResult

store_name = "statestore"

wfr = WorkflowRuntime()

logging.basicConfig(level=logging.INFO)


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
    # Create a logger
    logger = logging.getLogger('NotifyActivity')
    logger.info(input.message)


@wfr.activity(name="process_payment_activity")
def process_payment_activity(ctx: WorkflowActivityContext, input: PaymentRequest):
    """Defines Process Payment Activity.This is used by the workflow to process a payment"""
    logger = logging.getLogger('ProcessPaymentActivity')
    logger.info('Processing payment: '+f'{input.request_id}'+' for '
                +f'{input.quantity}' +' ' +f'{input.item_being_purchased}'+' at '+f'{input.amount}'
                +' USD')
    logger.info(f'Payment for request ID {input.request_id} processed successfully')


@wfr.activity(name="verify_inventory_activity")
def verify_inventory_activity(ctx: WorkflowActivityContext,
                              input: InventoryRequest) -> InventoryResult:
    """Defines Verify Inventory Activity. This is used by the workflow to verify if inventory
    is available for the order"""
    logger = logging.getLogger('VerifyInventoryActivity')

    logger.info('Verifying inventory for order '+f'{input.request_id}'+' of '
                +f'{input.quantity}' +' ' +f'{input.item_name}')
    with DaprClient(f'{settings.DAPR_RUNTIME_HOST}:{settings.DAPR_GRPC_PORT}') as client:
        result = client.get_state(store_name, input.item_name)
    if result.data is None:
        return InventoryResult(False, None)
    res_json=json.loads(str(result.data.decode('utf-8')))
    logger.info(f'There are {res_json["quantity"]} {res_json["name"]} available for purchase')
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
    logger = logging.getLogger('UpdateInventoryActivity')

    logger.info('Checking inventory for order ' +f'{input.request_id}'+' for '
                +f'{input.quantity}' +' ' +f'{input.item_being_purchased}')
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
        logger.info(f'There are now {new_quantity} {input.item_being_purchased} left in stock')



@wfr.activity(name="request_approval_activity")
def request_approval_activity(ctx: WorkflowActivityContext,
                             input: OrderPayload):
    """Defines Request Approval Activity. This is used by the workflow to request approval
    for payment of an order. This activity is used only if the order total cost is greater than
    a particular threshold"""
    logger = logging.getLogger('RequestApprovalActivity')

    logger.info('Requesting approval for payment of '+f'{input["total_cost"]}'+' USD for '
                +f'{input["quantity"]}' +' ' +f'{input["item_name"]}')

```
{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}

The `order-processor` console app starts and manages the lifecycle of an order processing workflow that stores and retrieves data in a state store. The workflow consists of four workflow activities, or tasks:

- `notifyActivity`: Utilizes a logger to print out messages throughout the workflow. These messages notify the user when there is insufficient inventory, their payment couldn't be processed, and more.
- `verifyInventoryActivity`: Checks the state store to ensure that there is enough inventory present for purchase.
- `requestApprovalActivity`: Requests approval for orders over a certain threshold.
- `processPaymentActivity`: Processes and authorizes the payment.
- `updateInventoryActivity`: Updates the state store with the new remaining inventory value.

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest Node.js installed](https://nodejs.org/download/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/workflows/javascript/sdk).

```bash
git clone https://github.com/dapr/quickstarts.git
```

In a new terminal window, navigate to the `order-processor` directory:

```bash
cd workflows/javascript/sdk/order-processor
```

Install the dependencies:

```bash
cd ./javascript/sdk
npm install
npm run build
```

### Step 3: Run the order processor app

In the terminal, start the order processor app alongside a Dapr sidecar using [Multi-App Run]({{< ref multi-app-dapr-run >}}). From the `javascript/sdk` directory, run the following command:

```bash
dapr run -f .
```

This starts the `order-processor` app with unique workflow ID and runs the workflow activities.

Expected output:

```log
== APP - order-processor == Starting new orderProcessingWorkflow instance with ID = f5087775-779c-4e73-ac77-08edfcb375f4
== APP - order-processor == Orchestration scheduled with ID: f5087775-779c-4e73-ac77-08edfcb375f4
== APP - order-processor == Waiting 30 seconds for instance f5087775-779c-4e73-ac77-08edfcb375f4 to complete...
== APP - order-processor == Received "Orchestrator Request" work item with instance id 'f5087775-779c-4e73-ac77-08edfcb375f4'
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Rebuilding local state with 0 history event...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, EXECUTIONSTARTED=1]
== APP - order-processor == Processing order f5087775-779c-4e73-ac77-08edfcb375f4...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Returning 1 action(s)
== APP - order-processor == Received "Activity Request" work item
== APP - order-processor == Received order f5087775-779c-4e73-ac77-08edfcb375f4 for 1 car at a total cost of 5000
== APP - order-processor == Activity notifyActivity completed with output undefined (0 chars)
== APP - order-processor == Received "Orchestrator Request" work item with instance id 'f5087775-779c-4e73-ac77-08edfcb375f4'
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Rebuilding local state with 3 history event...
== APP - order-processor == Processing order f5087775-779c-4e73-ac77-08edfcb375f4...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Returning 1 action(s)
== APP - order-processor == Received "Activity Request" work item
== APP - order-processor == Verifying inventory for f5087775-779c-4e73-ac77-08edfcb375f4 of 1 car
== APP - order-processor == 2025-02-13T10:33:21.622Z INFO [HTTPClient, HTTPClient] Sidecar Started
== APP - order-processor == There are 10 car in stock
== APP - order-processor == Activity verifyInventoryActivity completed with output {"success":true,"inventoryItem":{"itemName":"car","perItemCost":5000,"quantity":10}} (84 chars)
== APP - order-processor == Received "Orchestrator Request" work item with instance id 'f5087775-779c-4e73-ac77-08edfcb375f4'
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Rebuilding local state with 6 history event...
== APP - order-processor == Processing order f5087775-779c-4e73-ac77-08edfcb375f4...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Returning 1 action(s)
== APP - order-processor == Received "Activity Request" work item
== APP - order-processor == Processing payment for order car
== APP - order-processor == Payment of 5000 for 1 car processed successfully
== APP - order-processor == Activity processPaymentActivity completed with output true (4 chars)
== APP - order-processor == Received "Orchestrator Request" work item with instance id 'f5087775-779c-4e73-ac77-08edfcb375f4'
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Rebuilding local state with 9 history event...
== APP - order-processor == Processing order f5087775-779c-4e73-ac77-08edfcb375f4...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Returning 1 action(s)
== APP - order-processor == Received "Activity Request" work item
== APP - order-processor == Updating inventory for f5087775-779c-4e73-ac77-08edfcb375f4 of 1 car
== APP - order-processor == Inventory updated for f5087775-779c-4e73-ac77-08edfcb375f4, there are now 9 car in stock
== APP - order-processor == Activity updateInventoryActivity completed with output {"success":true,"inventoryItem":{"itemName":"car","perItemCost":5000,"quantity":9}} (83 chars)
== APP - order-processor == Received "Orchestrator Request" work item with instance id 'f5087775-779c-4e73-ac77-08edfcb375f4'
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Rebuilding local state with 12 history event...
== APP - order-processor == Processing order f5087775-779c-4e73-ac77-08edfcb375f4...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Waiting for 1 task(s) and 0 event(s) to complete...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Returning 1 action(s)
== APP - order-processor == Received "Activity Request" work item
== APP - order-processor == order f5087775-779c-4e73-ac77-08edfcb375f4 processed successfully!
== APP - order-processor == Activity notifyActivity completed with output undefined (0 chars)
== APP - order-processor == Received "Orchestrator Request" work item with instance id 'f5087775-779c-4e73-ac77-08edfcb375f4'
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Rebuilding local state with 15 history event...
== APP - order-processor == Processing order f5087775-779c-4e73-ac77-08edfcb375f4...
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Processing 2 new history event(s): [ORCHESTRATORSTARTED=1, TASKCOMPLETED=1]
== APP - order-processor == Order f5087775-779c-4e73-ac77-08edfcb375f4 processed successfully!
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Orchestration completed with status COMPLETED
== APP - order-processor == f5087775-779c-4e73-ac77-08edfcb375f4: Returning 1 action(s)
== APP - order-processor == Instance f5087775-779c-4e73-ac77-08edfcb375f4 completed
== APP - order-processor == Orchestration completed! Result: {"processed":true}
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

1. A unique order ID for the workflow is generated (in the above example, `f5087775-779c-4e73-ac77-08edfcb375f4`) and the workflow is scheduled.
2. The `notifyActivity` workflow activity sends a notification saying an order for 1 car has been received.
3. The `verifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock.
4. Your workflow starts and notifies you of its status.
5. The `requestApprovalActivity` workflow activity requests approval for order `f5087775-779c-4e73-ac77-08edfcb375f4`
6. The `processPaymentActivity` workflow activity begins processing payment for order `f5087775-779c-4e73-ac77-08edfcb375f4` and confirms if successful.
7. The `updateInventoryActivity` workflow activity updates the inventory with the current available cars after the order has been processed.
8. The `notifyActivity` workflow activity sends a notification saying that order `f5087775-779c-4e73-ac77-08edfcb375f4` has completed and processed.
9. The workflow terminates as completed and processed.

#### `order-processor/app.ts`

In the application file:

- The unique workflow order ID is generated
- The workflow is scheduled
- The workflow status is retrieved
- The workflow and the workflow activities it invokes are registered

```javascript
import { DaprWorkflowClient, WorkflowRuntime, DaprClient, CommunicationProtocolEnum } from "@dapr/dapr";
import { InventoryItem, OrderPayload } from "./model";
import { notifyActivity, orderProcessingWorkflow, processPaymentActivity, requestApprovalActivity, verifyInventoryActivity as verifyInventoryActivity, updateInventoryActivity } from "./orderProcessingWorkflow";

const workflowWorker = new WorkflowRuntime();

async function start() {
  // Update the gRPC client and worker to use a local address and port
  const workflowClient = new DaprWorkflowClient();


  const daprHost = process.env.DAPR_HOST ?? "127.0.0.1";
  const daprPort = process.env.DAPR_GRPC_PORT ?? "50001";

  const daprClient = new DaprClient({
    daprHost,
    daprPort,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  const storeName = "statestore";

  const inventory = new InventoryItem("car", 5000, 10);
  const key = inventory.itemName;

  await daprClient.state.save(storeName, [
    {
      key: key,
      value: inventory,
    }
  ]);

  const order = new OrderPayload("car", 5000, 1);

  workflowWorker
  .registerWorkflow(orderProcessingWorkflow)
  .registerActivity(notifyActivity)
  .registerActivity(verifyInventoryActivity)
  .registerActivity(requestApprovalActivity)
  .registerActivity(processPaymentActivity)
  .registerActivity(updateInventoryActivity);

  // Wrap the worker startup in a try-catch block to handle any errors during startup
  try {
    await workflowWorker.start();
    console.log("Workflow runtime started successfully");
  } catch (error) {
    console.error("Error starting workflow runtime:", error);
  }

  // Schedule a new orchestration
  try {
    const id = await workflowClient.scheduleNewWorkflow(orderProcessingWorkflow, order);
    console.log(`Orchestration scheduled with ID: ${id}`);

    // Wait for orchestration completion
    const state = await workflowClient.waitForWorkflowCompletion(id, undefined, 30);

    console.log(`Orchestration completed! Result: ${state?.serializedOutput}`);
  } catch (error) {
    console.error("Error scheduling or waiting for orchestration:", error);
    throw error;
  }

  await workflowClient.stop();
}

process.on('SIGTERM', () => {
  workflowWorker.stop();
})

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

#### `order-processor/orderProcessingWorkflow.ts`

In `orderProcessingWorkflow.ts`, the workflow is defined as a class with all of its associated tasks (determined by workflow activities).

```javascript
import { Task, WorkflowActivityContext, WorkflowContext, TWorkflow, DaprClient } from "@dapr/dapr";
import { InventoryItem, InventoryRequest, InventoryResult, OrderNotification, OrderPayload, OrderPaymentRequest, OrderResult } from "./model";

const daprClient = new DaprClient();
const storeName = "statestore";

// Defines Notify Activity. This is used by the workflow to send out a notification
export const notifyActivity = async (_: WorkflowActivityContext, orderNotification: OrderNotification) => {
  console.log(orderNotification.message);
  return;
};

//Defines Verify Inventory Activity. This is used by the workflow to verify if inventory is available for the order
export const verifyInventoryActivity = async (_: WorkflowActivityContext, inventoryRequest: InventoryRequest) => {
  console.log(`Verifying inventory for ${inventoryRequest.requestId} of ${inventoryRequest.quantity} ${inventoryRequest.itemName}`);
  const result = await daprClient.state.get(storeName, inventoryRequest.itemName);
  if (result == undefined || result == null) {
    return new InventoryResult(false, undefined);
  }
  const inventoryItem = result as InventoryItem;
  console.log(`There are ${inventoryItem.quantity} ${inventoryItem.itemName} in stock`);

  if (inventoryItem.quantity >= inventoryRequest.quantity) {
    return new InventoryResult(true, inventoryItem)
  }
  return new InventoryResult(false, undefined);
}

export const requestApprovalActivity = async (_: WorkflowActivityContext, orderPayLoad: OrderPayload) => {
  console.log(`Requesting approval for order ${orderPayLoad.itemName}`);
  return true;
}

export const processPaymentActivity = async (_: WorkflowActivityContext, orderPaymentRequest: OrderPaymentRequest) => {
  console.log(`Processing payment for order ${orderPaymentRequest.itemBeingPurchased}`);
  console.log(`Payment of ${orderPaymentRequest.amount} for ${orderPaymentRequest.quantity} ${orderPaymentRequest.itemBeingPurchased} processed successfully`);
  return true;
}

export const updateInventoryActivity = async (_: WorkflowActivityContext, inventoryRequest: InventoryRequest) => {
  console.log(`Updating inventory for ${inventoryRequest.requestId} of ${inventoryRequest.quantity} ${inventoryRequest.itemName}`);
  const result = await daprClient.state.get(storeName, inventoryRequest.itemName);
  if (result == undefined || result == null) {
    return new InventoryResult(false, undefined);
  }
  const inventoryItem = result as InventoryItem;
  inventoryItem.quantity = inventoryItem.quantity - inventoryRequest.quantity;
  if (inventoryItem.quantity < 0) {
    console.log(`Insufficient inventory for ${inventoryRequest.requestId} of ${inventoryRequest.quantity} ${inventoryRequest.itemName}`);
    return new InventoryResult(false, undefined);
  }
  await daprClient.state.save(storeName, [
    {
      key: inventoryRequest.itemName,
      value: inventoryItem,
    }
  ]);
  console.log(`Inventory updated for ${inventoryRequest.requestId}, there are now ${inventoryItem.quantity} ${inventoryItem.itemName} in stock`);
  return new InventoryResult(true, inventoryItem);
}

export const orderProcessingWorkflow: TWorkflow = async function* (ctx: WorkflowContext, orderPayLoad: OrderPayload): any {
  const orderId = ctx.getWorkflowInstanceId();
  console.log(`Processing order ${orderId}...`);

  const orderNotification: OrderNotification = {
    message: `Received order ${orderId} for ${orderPayLoad.quantity} ${orderPayLoad.itemName} at a total cost of ${orderPayLoad.totalCost}`,
  };
  yield ctx.callActivity(notifyActivity, orderNotification);

  const inventoryRequest = new InventoryRequest(orderId, orderPayLoad.itemName, orderPayLoad.quantity);
  const inventoryResult = yield ctx.callActivity(verifyInventoryActivity, inventoryRequest);

  if (!inventoryResult.success) {
    const orderNotification: OrderNotification = {
      message: `Insufficient inventory for order ${orderId}`,
    };
    yield ctx.callActivity(notifyActivity, orderNotification);
    return new OrderResult(false);
  }

  if (orderPayLoad.totalCost > 5000) {
    yield ctx.callActivity(requestApprovalActivity, orderPayLoad);
    
    const tasks: Task<any>[] = [];
    const approvalEvent = ctx.waitForExternalEvent("approval_event");
    tasks.push(approvalEvent);
    const timeOutEvent = ctx.createTimer(30);
    tasks.push(timeOutEvent);
    const winner = ctx.whenAny(tasks);

    if (winner == timeOutEvent) {
      const orderNotification: OrderNotification = {
        message: `Order ${orderId} has been cancelled due to approval timeout.`,
      };
      yield ctx.callActivity(notifyActivity, orderNotification);
      return new OrderResult(false);
    }
    const approvalResult = approvalEvent.getResult();
    if (!approvalResult) {
      const orderNotification: OrderNotification = {
        message: `Order ${orderId} was not approved.`,
      };
      yield ctx.callActivity(notifyActivity, orderNotification);
      return new OrderResult(false);
    }
  }

  const orderPaymentRequest = new OrderPaymentRequest(orderId, orderPayLoad.itemName, orderPayLoad.totalCost, orderPayLoad.quantity);
  const paymentResult = yield ctx.callActivity(processPaymentActivity, orderPaymentRequest);

  if (!paymentResult) {
    const orderNotification: OrderNotification = {
      message: `Payment for order ${orderId} failed`,
    };
    yield ctx.callActivity(notifyActivity, orderNotification);
    return new OrderResult(false);
  }

  const updatedResult = yield ctx.callActivity(updateInventoryActivity, inventoryRequest);
  if (!updatedResult.success) {
    const orderNotification: OrderNotification = {
      message: `Failed to update inventory for order ${orderId}`,
    };
    yield ctx.callActivity(notifyActivity, orderNotification);
    return new OrderResult(false);
  }

  const orderCompletedNotification: OrderNotification = {
    message: `order ${orderId} processed successfully!`,
  };
  yield ctx.callActivity(notifyActivity, orderCompletedNotification);

  console.log(`Order ${orderId} processed successfully!`);
  return new OrderResult(true);
}
```

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

The `order-processor` console app starts and manages the lifecycle of an order processing workflow that stores and retrieves data in a state store. The workflow consists of four workflow activities, or tasks:

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
- [.NET 7](https://dotnet.microsoft.com/download/dotnet/7.0), [.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0) or [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0) installed

**NOTE:** .NET 7 is the minimally supported version of .NET by Dapr.Workflows in Dapr v1.15. Only .NET 8 and .NET 9
will be supported in Dapr v1.16 and later releases.

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/workflows/csharp/sdk).

```bash
git clone https://github.com/dapr/quickstarts.git
```

In a new terminal window, navigate to the `order-processor` directory:

```bash
cd workflows/csharp/sdk/order-processor
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

In the terminal, start the order processor app alongside a Dapr sidecar using [Multi-App Run]({{< ref multi-app-dapr-run >}}). From the `csharp/sdk` directory, run the following command:

```bash
dapr run -f .
```

This starts the `order-processor` app with unique workflow ID and runs the workflow activities.

Expected output:

```
== APP - order-processor == Starting workflow 571a6e25 purchasing 1 Cars
== APP - order-processor == info: Microsoft.DurableTask.Client.Grpc.GrpcDurableTaskClient[40]
== APP - order-processor ==       Scheduling new OrderProcessingWorkflow orchestration with instance ID '571a6e25' and 45 bytes of input data.
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[100]
== APP - order-processor ==       Start processing HTTP request POST http://localhost:37355/TaskHubSidecarService/StartInstance
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[100]
== APP - order-processor ==       Sending HTTP request POST http://localhost:37355/TaskHubSidecarService/StartInstance
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP - order-processor ==       Received HTTP response headers after 3045.9209ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP - order-processor ==       End processing HTTP request after 3046.0945ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP - order-processor ==       Received HTTP response headers after 3016.1346ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP - order-processor ==       End processing HTTP request after 3016.3572ms - 200
== APP - order-processor == info: Microsoft.DurableTask.Client.Grpc.GrpcDurableTaskClient[42]
== APP - order-processor ==       Waiting for instance '571a6e25' to start.
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[100]
== APP - order-processor ==       Start processing HTTP request POST http://localhost:37355/TaskHubSidecarService/WaitForInstanceStart
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[100]
== APP - order-processor ==       Sending HTTP request POST http://localhost:37355/TaskHubSidecarService/WaitForInstanceStart
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[100]
== APP - order-processor ==       Start processing HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteOrchestratorTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[100]
== APP - order-processor ==       Sending HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteOrchestratorTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP - order-processor ==       Received HTTP response headers after 2.9095ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP - order-processor ==       End processing HTTP request after 3.0445ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP - order-processor ==       Received HTTP response headers after 99.446ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP - order-processor ==       End processing HTTP request after 99.5407ms - 200
== APP - order-processor == Your workflow has started. Here is the status of the workflow: Running
== APP - order-processor == info: Microsoft.DurableTask.Client.Grpc.GrpcDurableTaskClient[43]
== APP - order-processor ==       Waiting for instance '571a6e25' to complete, fail, or terminate.
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[100]
== APP - order-processor ==       Start processing HTTP request POST http://localhost:37355/TaskHubSidecarService/WaitForInstanceCompletion
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[100]
== APP - order-processor ==       Sending HTTP request POST http://localhost:37355/TaskHubSidecarService/WaitForInstanceCompletion
== APP - order-processor == info: WorkflowConsoleApp.Activities.NotifyActivity[1985924262]
== APP - order-processor ==       Presenting notification Notification { Message = Received order 571a6e25 for 1 Cars at $5000 }
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[100]
== APP - order-processor ==       Start processing HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteActivityTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[100]
== APP - order-processor ==       Sending HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteActivityTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP - order-processor ==       Received HTTP response headers after 1.6785ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP - order-processor ==       End processing HTTP request after 1.7869ms - 200
== APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[2013970020]
== APP - order-processor ==       Received request ID '571a6e25' for 1 Cars at $5000
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[100]
== APP - order-processor ==       Start processing HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteOrchestratorTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[100]
== APP - order-processor ==       Sending HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteOrchestratorTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP - order-processor ==       Received HTTP response headers after 1.1947ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP - order-processor ==       End processing HTTP request after 1.3293ms - 200
== APP - order-processor == info: WorkflowConsoleApp.Activities.VerifyInventoryActivity[1478802116]
== APP - order-processor ==       Reserving inventory for order request ID '571a6e25' of 1 Cars
== APP - order-processor == info: WorkflowConsoleApp.Activities.VerifyInventoryActivity[1130866279]
== APP - order-processor ==       There are: 10 Cars available for purchase
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[100]
== APP - order-processor ==       Start processing HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteActivityTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[100]
== APP - order-processor ==       Sending HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteActivityTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP - order-processor ==       Received HTTP response headers after 1.8534ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP - order-processor ==       End processing HTTP request after 2.0077ms - 200
== APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[1162731597]
== APP - order-processor ==       Checked inventory for request ID 'InventoryRequest { RequestId = 571a6e25, ItemName = Cars, Quantity = 1 }'
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[100]
== APP - order-processor ==       Start processing HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteOrchestratorTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[100]
== APP - order-processor ==       Sending HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteOrchestratorTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP - order-processor ==       Received HTTP response headers after 1.1851ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP - order-processor ==       End processing HTTP request after 1.3742ms - 200
== APP - order-processor == info: WorkflowConsoleApp.Activities.ProcessPaymentActivity[340284070]
== APP - order-processor ==       Processing payment: request ID '571a6e25' for 1 Cars at $5000
== APP - order-processor == info: WorkflowConsoleApp.Activities.ProcessPaymentActivity[1851315765]
== APP - order-processor ==       Payment for request ID '571a6e25' processed successfully
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[100]
== APP - order-processor ==       Start processing HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteActivityTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[100]
== APP - order-processor ==       Sending HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteActivityTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP - order-processor ==       Received HTTP response headers after 0.8249ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP - order-processor ==       End processing HTTP request after 0.9595ms - 200
== APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[340284070]
== APP - order-processor ==       Processed payment request as there's sufficient inventory to proceed: PaymentRequest { RequestId = 571a6e25, ItemBeingPurchased = Cars, Amount = 1, Currency = 5000 }
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[100]
== APP - order-processor ==       Start processing HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteOrchestratorTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[100]
== APP - order-processor ==       Sending HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteOrchestratorTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP - order-processor ==       Received HTTP response headers after 0.4457ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP - order-processor ==       End processing HTTP request after 0.5267ms - 200
== APP - order-processor == info: WorkflowConsoleApp.Activities.UpdateInventoryActivity[2144991393]
== APP - order-processor ==       Checking inventory for request ID '571a6e25' for 1 Cars
== APP - order-processor == info: WorkflowConsoleApp.Activities.UpdateInventoryActivity[1901852920]
== APP - order-processor ==       There are now 9 Cars left in stock
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[100]
== APP - order-processor ==       Start processing HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteActivityTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[100]
== APP - order-processor ==       Sending HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteActivityTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP - order-processor ==       Received HTTP response headers after 0.6012ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP - order-processor ==       End processing HTTP request after 0.7097ms - 200
== APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[96138418]
== APP - order-processor ==       Updating available inventory for PaymentRequest { RequestId = 571a6e25, ItemBeingPurchased = Cars, Amount = 1, Currency = 5000 }
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[100]
== APP - order-processor ==       Start processing HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteOrchestratorTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[100]
== APP - order-processor ==       Sending HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteOrchestratorTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP - order-processor ==       Received HTTP response headers after 0.469ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP - order-processor ==       End processing HTTP request after 0.5431ms - 200
== APP - order-processor == info: WorkflowConsoleApp.Activities.NotifyActivity[1985924262]
== APP - order-processor ==       Presenting notification Notification { Message = Order 571a6e25 has completed! }
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[100]
== APP - order-processor ==       Start processing HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteActivityTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[100]
== APP - order-processor ==       Sending HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteActivityTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP - order-processor ==       Received HTTP response headers after 0.494ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP - order-processor ==       End processing HTTP request after 0.5685ms - 200
== APP - order-processor == info: WorkflowConsoleApp.Workflows.OrderProcessingWorkflow[510392223]
== APP - order-processor ==       Order 571a6e25 has completed
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[100]
== APP - order-processor ==       Start processing HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteOrchestratorTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[100]
== APP - order-processor ==       Sending HTTP request POST http://localhost:37355/TaskHubSidecarService/CompleteOrchestratorTask
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP - order-processor ==       Received HTTP response headers after 1.6353ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP - order-processor ==       End processing HTTP request after 1.7546ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.ClientHandler[101]
== APP - order-processor ==       Received HTTP response headers after 15807.213ms - 200
== APP - order-processor == info: System.Net.Http.HttpClient.Default.LogicalHandler[101]
== APP - order-processor ==       End processing HTTP request after 15807.3675ms - 200
== APP - order-processor == Workflow Status: Completed
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
2. A unique order ID for the workflow is generated (in the above example, `571a6e25`) and the workflow is scheduled.
3. The `NotifyActivity` workflow activity sends a notification saying an order for one car has been received.
4. The `VerifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock. The inventory is sufficient so the workflow continues.
5. The total cost of the order is 5000, so the workflow will not call the `RequestApprovalActivity` activity.
6. The `ProcessPaymentActivity` workflow activity begins processing payment for order `571a6e25` and confirms if successful.
7. The `UpdateInventoryActivity` workflow activity updates the inventory with the current available cars after the order has been processed.
8. The `NotifyActivity` workflow activity sends a notification saying that order `571a6e25` has completed.
9. The workflow terminates as completed and the OrderResult is set to processed.

#### `order-processor/Program.cs`

In the application's program file:

- The unique workflow order ID is generated
- The workflow is scheduled
- The workflow status is retrieved
- The workflow and the workflow activities it invokes are registered

```csharp
using Dapr.Client;
using Dapr.Workflow;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using WorkflowConsoleApp.Activities;
using WorkflowConsoleApp.Models;
using WorkflowConsoleApp.Workflows;

const string storeName = "statestore";

// The workflow host is a background service that connects to the sidecar over gRPC
var builder = Host.CreateDefaultBuilder(args).ConfigureServices(services =>
{
    services.AddDaprClient();
    services.AddDaprWorkflow(options =>
    {
        // Note that it's also possible to register a lambda function as the workflow
        // or activity implementation instead of a class.
        options.RegisterWorkflow<OrderProcessingWorkflow>();

        // These are the activities that get invoked by the workflow(s).
        options.RegisterActivity<NotifyActivity>();
        options.RegisterActivity<VerifyInventoryActivity>();
        options.RegisterActivity<RequestApprovalActivity>();
        options.RegisterActivity<ProcessPaymentActivity>();
        options.RegisterActivity<UpdateInventoryActivity>();
    });
});

// Start the app - this is the point where we connect to the Dapr sidecar
using var host = builder.Build();
host.Start();

var daprClient = host.Services.GetRequiredService<DaprClient>();
var workflowClient = host.Services.GetRequiredService<DaprWorkflowClient>();

// Generate a unique ID for the workflow
var orderId = Guid.NewGuid().ToString()[..8];
const string itemToPurchase = "Cars";
const int amountToPurchase = 1;

// Populate the store with items
RestockInventory(itemToPurchase);

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
return;

void RestockInventory(string itemToPurchase)
{
    daprClient.SaveStateAsync(storeName, itemToPurchase, new OrderPayload(Name: itemToPurchase, TotalCost: 50000, Quantity: 10));
}

```

#### `order-processor/Workflows/OrderProcessingWorkflow.cs`

In `OrderProcessingWorkflow.cs`, the workflow is defined as a class with all of its associated tasks (determined by workflow activities in separate files).

```csharp
namespace WorkflowConsoleApp.Workflows;

using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using Dapr.Workflow;
using DurableTask.Core.Exceptions;
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
        catch (TaskFailedException)
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

The `Activities` directory holds the four workflow activities used by the workflow, defined in the following files:

- `NotifyActivity.cs`
- `VerifyInventoryActivity.cs`
- `RequestApprovalActivity.cs`
- `ProcessPaymentActivity.cs`
- `UpdateInventoryActivity.cs`

## Watch the demo

Watch [this video to walk through the Dapr Workflow .NET demo](https://youtu.be/BxiKpEmchgQ?t=2564):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/BxiKpEmchgQ?start=2564" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

The `order-processor` console app starts and manages the lifecycle of an order processing workflow that stores and retrieves data in a state store. The workflow consists of four workflow activities, or tasks:

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
git clone https://github.com/dapr/quickstarts.git
```

Navigate to the `order-processor` directory:

```bash
cd workflows/java/sdk/order-processor
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

In the terminal, start the order processor app alongside a Dapr sidecar using [Multi-App Run]({{< ref multi-app-dapr-run >}}). From the `java/sdk` directory, run the following command:

```bash
cd workflows/java/sdk
dapr run -f .
```

This starts the `order-processor` app with unique workflow ID and runs the workflow activities.

Expected output:

```
== APP - order-processor == *** Welcome to the Dapr Workflow console app sample!
== APP - order-processor == *** Using this app, you can place orders that start workflows.
== APP - order-processor == [main] INFO io.dapr.workflows.runtime.WorkflowRuntimeBuilder - Registered Workflow: OrderProcessingWorkflow
== APP - order-processor == [main] INFO io.dapr.workflows.runtime.WorkflowRuntimeBuilder - Registered Activity: NotifyActivity
== APP - order-processor == [main] INFO io.dapr.workflows.runtime.WorkflowRuntimeBuilder - Registered Activity: ProcessPaymentActivity
== APP - order-processor == [main] INFO io.dapr.workflows.runtime.WorkflowRuntimeBuilder - Registered Activity: RequestApprovalActivity
== APP - order-processor == [main] INFO io.dapr.workflows.runtime.WorkflowRuntimeBuilder - Registered Activity: VerifyInventoryActivity
== APP - order-processor == [main] INFO io.dapr.workflows.runtime.WorkflowRuntimeBuilder - Registered Activity: UpdateInventoryActivity
== APP - order-processor == [main] INFO io.dapr.workflows.runtime.WorkflowRuntimeBuilder - List of registered workflows: [io.dapr.quickstarts.workflows.OrderProcessingWorkflow]
== APP - order-processor == [main] INFO io.dapr.workflows.runtime.WorkflowRuntimeBuilder - List of registered activites: [io.dapr.quickstarts.workflows.activities.NotifyActivity, io.dapr.quickstarts.workflows.activities.UpdateInventoryActivity, io.dapr.quickstarts.workflows.activities.ProcessPaymentActivity, io.dapr.quickstarts.workflows.activities.RequestApprovalActivity, io.dapr.quickstarts.workflows.activities.VerifyInventoryActivity]
== APP - order-processor == [main] INFO io.dapr.workflows.runtime.WorkflowRuntimeBuilder - Successfully built dapr workflow runtime
== APP - order-processor == Start workflow runtime
== APP - order-processor == Feb 12, 2025 2:44:13 PM com.microsoft.durabletask.DurableTaskGrpcWorker startAndBlock
== APP - order-processor == INFO: Durable Task worker is connecting to sidecar at 127.0.0.1:39261.
== APP - order-processor == ==========Begin the purchase of item:==========
== APP - order-processor == Starting order workflow, purchasing 1 of cars
== APP - order-processor == scheduled new workflow instance of OrderProcessingWorkflow with instance ID: d1bf548b-c854-44af-978e-90c61ed88e3c
== APP - order-processor == [Thread-0] INFO io.dapr.workflows.WorkflowContext - Starting Workflow: io.dapr.quickstarts.workflows.OrderProcessingWorkflow
== APP - order-processor == [Thread-0] INFO io.dapr.workflows.WorkflowContext - Instance ID(order ID): d1bf548b-c854-44af-978e-90c61ed88e3c
== APP - order-processor == [Thread-0] INFO io.dapr.workflows.WorkflowContext - Current Orchestration Time: 2025-02-12T14:44:18.154Z
== APP - order-processor == [Thread-0] INFO io.dapr.workflows.WorkflowContext - Received Order: OrderPayload [itemName=cars, totalCost=5000, quantity=1]
== APP - order-processor == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.NotifyActivity - Received Order: OrderPayload [itemName=cars, totalCost=5000, quantity=1]
== APP - order-processor == workflow instance d1bf548b-c854-44af-978e-90c61ed88e3c started
== APP - order-processor == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.VerifyInventoryActivity - Verifying inventory for order 'd1bf548b-c854-44af-978e-90c61ed88e3c' of 1 cars
== APP - order-processor == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.VerifyInventoryActivity - There are 10 cars available for purchase
== APP - order-processor == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.VerifyInventoryActivity - Verified inventory for order 'd1bf548b-c854-44af-978e-90c61ed88e3c' of 1 cars
== APP - order-processor == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.ProcessPaymentActivity - Processing payment: d1bf548b-c854-44af-978e-90c61ed88e3c for 1 cars at $5000
== APP - order-processor == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.ProcessPaymentActivity - Payment for request ID 'd1bf548b-c854-44af-978e-90c61ed88e3c' processed successfully
== APP - order-processor == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.UpdateInventoryActivity - Updating inventory for order 'd1bf548b-c854-44af-978e-90c61ed88e3c' of 1 cars
== APP - order-processor == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.UpdateInventoryActivity - Updated inventory for order 'd1bf548b-c854-44af-978e-90c61ed88e3c': there are now 9 cars left in stock
== APP - order-processor == there are now 9 cars left in stock
== APP - order-processor == [Thread-0] INFO io.dapr.quickstarts.workflows.activities.NotifyActivity - Order completed! : d1bf548b-c854-44af-978e-90c61ed88e3c
== APP - order-processor == workflow instance completed, out is: {"processed":true}
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
2. A unique order ID for the workflow is generated (in the above example, `d1bf548b-c854-44af-978e-90c61ed88e3c`) and the workflow is scheduled.
3. The `NotifyActivity` workflow activity sends a notification saying an order for one car has been received.
4. The `VertifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock. The inventory is sufficient so the workflow continues.
5. The total cost of the order is 5000, so the workflow will not call the `RequestApprovalActivity` activity.
6. The `ProcessPaymentActivity` workflow activity begins processing payment for order `d1bf548b-c854-44af-978e-90c61ed88e3c` and confirms if successful.
7. The `UpdateInventoryActivity` workflow activity updates the inventory with the current available cars after the order has been processed.
8. The `NotifyActivity` workflow activity sends a notification saying that order `d1bf548b-c854-44af-978e-90c61ed88e3c` has completed.
9. The workflow terminates as completed and the orderResult is set to processed.

#### `order-processor/WorkflowConsoleApp.java` 

In the application's program file:
- The unique workflow order ID is generated
- The workflow is scheduled
- The workflow status is retrieved
- The workflow and the workflow activities it invokes are registered

```java
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
    try (WorkflowRuntime runtime = builder.build()) {
      System.out.println("Start workflow runtime");
      runtime.start(false);
    }

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
    int totalcost = orderQuantity * inventory.getPerItemCost();
    OrderPayload order = new OrderPayload();
    order.setItemName(itemName);
    order.setQuantity(orderQuantity);
    order.setTotalCost(totalcost);
    System.out.println("Starting order workflow, purchasing " + orderQuantity + " of " + itemName);

    String instanceId = workflowClient.scheduleNewWorkflow(OrderProcessingWorkflow.class, order);
    System.out.printf("scheduled new workflow instance of OrderProcessingWorkflow with instance ID: %s%n",
        instanceId);

    try {
      workflowClient.waitForInstanceStart(instanceId, Duration.ofSeconds(10), false);
      System.out.printf("workflow instance %s started%n", instanceId);
    } catch (TimeoutException e) {
      System.out.printf("workflow instance %s did not start within 10 seconds%n", instanceId);
      return;
    }

    try {
      WorkflowInstanceStatus workflowStatus = workflowClient.waitForInstanceCompletion(instanceId,
          Duration.ofSeconds(30),
          true);
      if (workflowStatus != null) {
        System.out.printf("workflow instance completed, out is: %s%n",
            workflowStatus.getSerializedOutput());
      } else {
        System.out.printf("workflow instance %s not found%n", instanceId);
      }
    } catch (TimeoutException e) {
      System.out.printf("workflow instance %s did not complete within 30 seconds%n", instanceId);
    }

  }

  private static InventoryItem prepareInventoryAndOrder() {
    // prepare 10 cars in inventory
    InventoryItem inventory = new InventoryItem();
    inventory.setName("cars");
    inventory.setPerItemCost(50000);
    inventory.setQuantity(10);
    DaprClient daprClient = new DaprClientBuilder().build();
    restockInventory(daprClient, inventory);

    // prepare order for 10 cars
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

public class OrderProcessingWorkflow extends Workflow {

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

The `Activities` directory holds the four workflow activities used by the workflow, defined in the following files:
- [`NotifyActivity.java`](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/NotifyActivity.java)
- [`RequestApprovalActivity`](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/RequestApprovalActivity.java)
- [`ReserveInventoryActivity`](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/VerifyInventoryActivity.java)
- [`ProcessPaymentActivity`](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/ProcessPaymentActivity.java)
- [`UpdateInventoryActivity`](https://github.com/dapr/quickstarts/tree/master/workflows/java/sdk/order-processor/src/main/java/io/dapr/quickstarts/workflows/activities/UpdateInventoryActivity.java)

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

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
git clone https://github.com/dapr/quickstarts.git
```

In a new terminal window, navigate to the `sdk` directory:

```bash
cd workflows/go/sdk
```

### Step 3: Run the order processor app

In the terminal, start the order processor app alongside a Dapr sidecar using [Multi-App Run]({{< ref multi-app-dapr-run >}}). From the `go/sdk` directory, run the following command:

```bash
dapr run -f .
```

This starts the `order-processor` app with unique workflow ID and runs the workflow activities.

Expected output:

```bash
== APP - order-processor == *** Welcome to the Dapr Workflow console app sample!
== APP - order-processor == *** Using this app, you can place orders that start workflows.
== APP - order-processor == dapr client initializing for: 127.0.0.1:46533
== APP - order-processor == INFO: 2025/02/13 13:18:33 connecting work item listener stream
== APP - order-processor == 2025/02/13 13:18:33 work item listener started
== APP - order-processor == INFO: 2025/02/13 13:18:33 starting background processor
== APP - order-processor == adding base stock item: paperclip
== APP - order-processor == adding base stock item: cars
== APP - order-processor == adding base stock item: computers
== APP - order-processor == ==========Begin the purchase of item:==========
== APP - order-processor == NotifyActivity: Received order b4cb2687-1af0-4f8d-9659-eb6389c07ade for 1 cars - $5000
== APP - order-processor == VerifyInventoryActivity: Verifying inventory for order b4cb2687-1af0-4f8d-9659-eb6389c07ade of 1 cars
== APP - order-processor == VerifyInventoryActivity: There are 10 cars available for purchase
== APP - order-processor == ProcessPaymentActivity: b4cb2687-1af0-4f8d-9659-eb6389c07ade for 1 - cars (5000USD)
== APP - order-processor == UpdateInventoryActivity: Checking Inventory for order b4cb2687-1af0-4f8d-9659-eb6389c07ade for 1 * cars
== APP - order-processor == UpdateInventoryActivity: There are now 9 cars left in stock
== APP - order-processor == NotifyActivity: Order b4cb2687-1af0-4f8d-9659-eb6389c07ade has completed!
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
2. A unique order ID for the workflow is generated (in the above example, `b4cb2687-1af0-4f8d-9659-eb6389c07ade`) and the workflow is scheduled.
3. The `NotifyActivity` workflow activity sends a notification saying an order for 10 cars has been received.
4. The `VerifyInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock.
5. The total cost of the order is 5000, so the workflow will not call the `RequestApprovalActivity` activity.
6. The `ProcessPaymentActivity` workflow activity begins processing payment for order `b4cb2687-1af0-4f8d-9659-eb6389c07ade` and confirms if successful.
7. The `UpdateInventoryActivity` workflow activity updates the inventory with the current available cars after the order has been processed.
8. The `NotifyActivity` workflow activity sends a notification saying that order `b4cb2687-1af0-4f8d-9659-eb6389c07ade` has completed.
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

	"github.com/dapr/go-sdk/client"
	"github.com/dapr/go-sdk/workflow"
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

	w, err := workflow.NewWorker()
	if err != nil {
		log.Fatalf("failed to start worker: %v", err)
	}

	if err := w.RegisterWorkflow(OrderProcessingWorkflow); err != nil {
		log.Fatal(err)
	}
	if err := w.RegisterActivity(NotifyActivity); err != nil {
		log.Fatal(err)
	}
	if err := w.RegisterActivity(RequestApprovalActivity); err != nil {
		log.Fatal(err)
	}
	if err := w.RegisterActivity(VerifyInventoryActivity); err != nil {
		log.Fatal(err)
	}
	if err := w.RegisterActivity(ProcessPaymentActivity); err != nil {
		log.Fatal(err)
	}
	if err := w.RegisterActivity(UpdateInventoryActivity); err != nil {
		log.Fatal(err)
	}

	if err := w.Start(); err != nil {
		log.Fatal(err)
	}

	daprClient, err := client.NewClient()
	if err != nil {
		log.Fatalf("failed to initialise dapr client: %v", err)
	}
	wfClient, err := workflow.NewClient(workflow.WithDaprClient(daprClient))
	if err != nil {
		log.Fatalf("failed to initialise workflow client: %v", err)
	}

	inventory := []InventoryItem{
		{ItemName: "paperclip", PerItemCost: 5, Quantity: 100},
		{ItemName: "cars", PerItemCost: 5000, Quantity: 10},
		{ItemName: "computers", PerItemCost: 500, Quantity: 100},
	}
	if err := restockInventory(daprClient, inventory); err != nil {
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

	id, err := wfClient.ScheduleNewWorkflow(context.Background(), workflowName, workflow.WithInput(orderPayload))
	if err != nil {
		log.Fatalf("failed to start workflow: %v", err)
	}

	waitCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	_, err = wfClient.WaitForWorkflowCompletion(waitCtx, id)
	cancel()
	if err != nil {
		log.Fatalf("failed to wait for workflow: %v", err)
	}

	respFetch, err := wfClient.FetchWorkflowMetadata(context.Background(), id, workflow.WithFetchPayloads(true))
	if err != nil {
		log.Fatalf("failed to get workflow: %v", err)
	}

	fmt.Printf("workflow status: %v\n", respFetch.RuntimeStatus)

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

	"github.com/dapr/go-sdk/client"
	"github.com/dapr/go-sdk/workflow"
)

// OrderProcessingWorkflow is the main workflow for orchestrating activities in the order process.
func OrderProcessingWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	orderID := ctx.InstanceID()
	var orderPayload OrderPayload
	if err := ctx.GetInput(&orderPayload); err != nil {
		return nil, err
	}
	err := ctx.CallActivity(NotifyActivity, workflow.ActivityInput(Notification{
		Message: fmt.Sprintf("Received order %s for %d %s - $%d", orderID, orderPayload.Quantity, orderPayload.ItemName, orderPayload.TotalCost),
	})).Await(nil)
	if err != nil {
		return OrderResult{Processed: false}, err
	}

	var verifyInventoryResult InventoryResult
	if err := ctx.CallActivity(VerifyInventoryActivity, workflow.ActivityInput(InventoryRequest{
		RequestID: orderID,
		ItemName:  orderPayload.ItemName,
		Quantity:  orderPayload.Quantity,
	})).Await(&verifyInventoryResult); err != nil {
		return OrderResult{Processed: false}, err
	}

	if !verifyInventoryResult.Success {
		notification := Notification{Message: fmt.Sprintf("Insufficient inventory for %s", orderPayload.ItemName)}
		err := ctx.CallActivity(NotifyActivity, workflow.ActivityInput(notification)).Await(nil)
		return OrderResult{Processed: false}, err
	}

	if orderPayload.TotalCost > 5000 {
		var approvalRequired ApprovalRequired
		if err := ctx.CallActivity(RequestApprovalActivity, workflow.ActivityInput(orderPayload)).Await(&approvalRequired); err != nil {
			return OrderResult{Processed: false}, err
		}
		if err := ctx.WaitForExternalEvent("manager_approval", time.Second*200).Await(nil); err != nil {
			return OrderResult{Processed: false}, err
		}
		// TODO: Confirm timeout flow - this will be in the form of an error.
		if approvalRequired.Approval {
			if err := ctx.CallActivity(NotifyActivity, workflow.ActivityInput(Notification{Message: fmt.Sprintf("Payment for order %s has been approved!", orderID)})).Await(nil); err != nil {
				log.Printf("failed to notify of a successful order: %v\n", err)
			}
		} else {
			if err := ctx.CallActivity(NotifyActivity, workflow.ActivityInput(Notification{Message: fmt.Sprintf("Payment for order %s has been rejected!", orderID)})).Await(nil); err != nil {
				log.Printf("failed to notify of an unsuccessful order :%v\n", err)
			}
			return OrderResult{Processed: false}, err
		}
	}
	err = ctx.CallActivity(ProcessPaymentActivity, workflow.ActivityInput(PaymentRequest{
		RequestID:          orderID,
		ItemBeingPurchased: orderPayload.ItemName,
		Amount:             orderPayload.TotalCost,
		Quantity:           orderPayload.Quantity,
	})).Await(nil)
	if err != nil {
		if err := ctx.CallActivity(NotifyActivity, workflow.ActivityInput(Notification{Message: fmt.Sprintf("Order %s failed!", orderID)})).Await(nil); err != nil {
			log.Printf("failed to notify of a failed order: %v", err)
		}
		return OrderResult{Processed: false}, err
	}

	err = ctx.CallActivity(UpdateInventoryActivity, workflow.ActivityInput(PaymentRequest{
		RequestID:          orderID,
		ItemBeingPurchased: orderPayload.ItemName,
		Amount:             orderPayload.TotalCost,
		Quantity:           orderPayload.Quantity,
	})).Await(nil)
	if err != nil {
		if err := ctx.CallActivity(NotifyActivity, workflow.ActivityInput(Notification{Message: fmt.Sprintf("Order %s failed!", orderID)})).Await(nil); err != nil {
			log.Printf("failed to notify of a failed order: %v", err)
		}
		return OrderResult{Processed: false}, err
	}

	if err := ctx.CallActivity(NotifyActivity, workflow.ActivityInput(Notification{Message: fmt.Sprintf("Order %s has completed!", orderID)})).Await(nil); err != nil {
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

{{% /codetab %}}


{{< /tabs >}}

## Tell us what you think!

We're continuously working to improve our Quickstart examples and value your feedback. Did you find this Quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps

- Set up Dapr Workflow with any programming language using [HTTP instead of an SDK]({{< ref howto-manage-workflow.md >}})
- Walk through a more in-depth [.NET SDK example workflow](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
- Learn more about [Workflow as a Dapr building block]({{< ref workflow-overview >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
