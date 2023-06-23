---
type: docs
title: "Quickstart: Workflow"
linkTitle: Workflow
weight: 78
description: Get started with the Dapr Workflow building block
---

{{% alert title="Note" color="primary" %}}
The workflow building block is currently in **alpha**. 
{{% /alert %}}

Let's take a look at the Dapr [Workflow building block]({{< ref workflow >}}). In this Quickstart, you'll create a simple console application to demonstrate Dapr's workflow programming model and the workflow management APIs. 

In this guide, you'll:

- Run the `order-processor` application.
- Start the workflow and watch the workflow activites/tasks execute.
- Review the workflow logic and the workflow activities and how they're represented in the code.

<img src="/images/workflow-quickstart-overview.png" width=800 style="padding-bottom:15px;">


{{< tabs ".NET" "Python" >}}

 <!-- .NET -->
{{% codetab %}}

The `order-processor` console app starts and manages the lifecycle of an order processing workflow that stores and retrieves data in a state store. The workflow consists of four workflow activities, or tasks:
- `NotifyActivity`: Utilizes a logger to print out messages throughout the workflow
- `ReserveInventoryActivity`: Checks the state store to ensure that there is enough inventory for the purchase
- `ProcessPaymentActivity`: Processes and authorizes the payment
- `UpdateInventoryActivity`: Removes the requested items from the state store and updates the store with the new remaining inventory value


### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET SDK or .NET 6 SDK installed](https://dotnet.microsoft.com/download).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/workflows).

```bash
git clone https://github.com/dapr/quickstarts.git
```

In a new terminal window, navigate to the `order-processor` directory:

```bash
cd workflows/csharp/sdk/order-processor
```

### Step 3: Run the order processor app

In the terminal, start the order processor app alongside a Dapr sidecar:

```bash
dapr run --app-id order-processor dotnet run
```

This starts the `order-processor` app with unique workflow ID and runs the workflow activities. 

Expected output:

```
== APP == Starting workflow 6d2abcc9 purchasing 10 Cars

== APP == info: Microsoft.DurableTask.Client.Grpc.GrpcDurableTaskClient[40]
== APP ==       Scheduling new OrderProcessingWorkflow orchestration with instance ID '6d2abcc9' and 47 bytes of input data.
== APP == info: WorkflowConsoleApp.Activities.NotifyActivity[0]
== APP ==       Received order 6d2abcc9 for 10 Cars at $15000
== APP == info: WorkflowConsoleApp.Activities.ReserveInventoryActivity[0]
== APP ==       Reserving inventory for order 6d2abcc9 of 10 Cars
== APP == info: WorkflowConsoleApp.Activities.ReserveInventoryActivity[0]
== APP ==       There are: 100, Cars available for purchase

== APP == Your workflow has started. Here is the status of the workflow: Dapr.Workflow.WorkflowState

== APP == info: WorkflowConsoleApp.Activities.ProcessPaymentActivity[0]
== APP ==       Processing payment: 6d2abcc9 for 10 Cars at $15000
== APP == info: WorkflowConsoleApp.Activities.ProcessPaymentActivity[0]
== APP ==       Payment for request ID '6d2abcc9' processed successfully
== APP == info: WorkflowConsoleApp.Activities.UpdateInventoryActivity[0]
== APP ==       Checking Inventory for: Order# 6d2abcc9 for 10 Cars
== APP == info: WorkflowConsoleApp.Activities.UpdateInventoryActivity[0]
== APP ==       There are now: 90 Cars left in stock
== APP == info: WorkflowConsoleApp.Activities.NotifyActivity[0]
== APP ==       Order 6d2abcc9 has completed!

== APP == Workflow Status: Completed
```

### (Optional) Step 4: View in Zipkin

If you have Zipkin configured for Dapr locally on your machine, you can view the workflow trace spans in the Zipkin web UI (typically at `http://localhost:9411/zipkin/`).

<img src="/images/workflow-trace-spans-zipkin.png" width=800 style="padding-bottom:15px;">

### What happened?

When you ran `dapr run --app-id order-processor dotnet run`:

1. A unique order ID for the workflow is generated (in the above example, `6d2abcc9`) and the workflow is scheduled.
1. The `NotifyActivity` workflow activity sends a notification saying an order for 10 cars has been received.
1. The `ReserveInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock.
1. Your workflow starts and notifies you of its status.
1. The `ProcessPaymentActivity` workflow activity begins processing payment for order `6d2abcc9` and confirms if successful.
1. The `UpdateInventoryActivity` workflow activity updates the inventory with the current available cars after the order has been processed.
1. The `NotifyActivity` workflow activity sends a notification saying that order `6d2abcc9` has completed.
1. The workflow terminates as completed.

#### `order-processor/Program.cs` 

In the application's program file:
- The unique workflow order ID is generated
- The workflow is scheduled
- The workflow status is retrieved
- The workflow and the workflow activities it invokes are registered

```csharp
using Dapr.Client;
using Dapr.Workflow;
//...

{
    services.AddDaprWorkflow(options =>
    {
        // Note that it's also possible to register a lambda function as the workflow
        // or activity implementation instead of a class.
        options.RegisterWorkflow<OrderProcessingWorkflow>();

        // These are the activities that get invoked by the workflow(s).
        options.RegisterActivity<NotifyActivity>();
        options.RegisterActivity<ReserveInventoryActivity>();
        options.RegisterActivity<ProcessPaymentActivity>();
        options.RegisterActivity<UpdateInventoryActivity>();
    });
};

//...

// Generate a unique ID for the workflow
string orderId = Guid.NewGuid().ToString()[..8];
string itemToPurchase = "Cars";
int ammountToPurchase = 10;

// Construct the order
OrderPayload orderInfo = new OrderPayload(itemToPurchase, 15000, ammountToPurchase);

// Start the workflow
Console.WriteLine("Starting workflow {0} purchasing {1} {2}", orderId, ammountToPurchase, itemToPurchase);

await daprClient.StartWorkflowAsync(
    workflowComponent: DaprWorkflowComponent,
    workflowName: nameof(OrderProcessingWorkflow),
    input: orderInfo,
    instanceId: orderId);

// Wait for the workflow to start and confirm the input
GetWorkflowResponse state = await daprClient.WaitForWorkflowStartAsync(
    instanceId: orderId,
    workflowComponent: DaprWorkflowComponent);

Console.WriteLine("Your workflow has started. Here is the status of the workflow: {0}", state.RuntimeStatus);

// Wait for the workflow to complete
state = await daprClient.WaitForWorkflowCompletionAsync(
    instanceId: orderId,
    workflowComponent: DaprWorkflowComponent);

Console.WriteLine("Workflow Status: {0}", state.RuntimeStatus);
```

#### `order-processor/Workflows/OrderProcessingWorkflow.cs`

In `OrderProcessingWorkflow.cs`, the workflow is defined as a class with all of its associated tasks (determined by workflow activities).

```csharp
using Dapr.Workflow;
//...

class OrderProcessingWorkflow : Workflow<OrderPayload, OrderResult>
    {
        public override async Task<OrderResult> RunAsync(WorkflowContext context, OrderPayload order)
        {
            string orderId = context.InstanceId;

            // Notify the user that an order has come through
            await context.CallActivityAsync(
                nameof(NotifyActivity),
                new Notification($"Received order {orderId} for {order.Quantity} {order.Name} at ${order.TotalCost}"));

            string requestId = context.InstanceId;

            // Determine if there is enough of the item available for purchase by checking the inventory
            InventoryResult result = await context.CallActivityAsync<InventoryResult>(
                nameof(ReserveInventoryActivity),
                new InventoryRequest(RequestId: orderId, order.Name, order.Quantity));

            // If there is insufficient inventory, fail and let the user know 
            if (!result.Success)
            {
                // End the workflow here since we don't have sufficient inventory
                await context.CallActivityAsync(
                    nameof(NotifyActivity),
                    new Notification($"Insufficient inventory for {order.Name}"));
                return new OrderResult(Processed: false);
            }

            // There is enough inventory available so the user can purchase the item(s). Process their payment
            await context.CallActivityAsync(
                nameof(ProcessPaymentActivity),
                new PaymentRequest(RequestId: orderId, order.Name, order.Quantity, order.TotalCost));

            try
            {
                // There is enough inventory available so the user can purchase the item(s). Process their payment
                await context.CallActivityAsync(
                    nameof(UpdateInventoryActivity),
                    new PaymentRequest(RequestId: orderId, order.Name, order.Quantity, order.TotalCost));                
            }
            catch (TaskFailedException)
            {
                // Let them know their payment was processed
                await context.CallActivityAsync(
                    nameof(NotifyActivity),
                    new Notification($"Order {orderId} Failed! You are now getting a refund"));
                return new OrderResult(Processed: false);
            }

            // Let them know their payment was processed
            await context.CallActivityAsync(
                nameof(NotifyActivity),
                new Notification($"Order {orderId} has completed!"));

            // End the workflow with a success result
            return new OrderResult(Processed: true);
        }
    }
```

#### `order-processor/Activities` directory

The `Activities` directory holds the four workflow activities used by the workflow, defined in the following files:
- `NotifyActivity.cs`
- `ReserveInventoryActivity.cs`
- `ProcessPaymentActivity.cs`
- `UpdateInventoryActivity.cs`

{{% /codetab %}}

 <!-- Python -->
{{% codetab %}}

The `order-processor` console app starts and manages the `order_processing_workflow`, which simulates purchasing items from a store. The workflow consists of five unique workflow activities, or tasks:

- `notify_activity`: Utilizes a logger to print out messages throughout the workflow. These messages notify you when:
   - You have insufficient inventory
   - Your payment couldn't be processed, etc.
- `process_payment_activity`: Processes and authorizes the payment.
- `verify_inventory_activity`: Checks the state store to ensure there is enough inventory present for purchase.
- `update_inventory_activity`: Removes the requested items from the state store and updates the store with the new remaining inventory value.
- `request_approval_activity`: Seeks approval from the manager if payment is greater than 50,000 USD.

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.7+ installed](https://www.python.org/downloads/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/workflows).

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

### Step 3: Run the order processor app

In the terminal, start the order processor app alongside a Dapr sidecar:

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- python3 app.py
```

> **Note:** Since Python3.exe is not defined in Windows, you may need to use `python app.py` instead of `python3 app.py`.

This starts the `order-processor` app with unique workflow ID and runs the workflow activities. 

Expected output:

```bash
== APP == Starting order workflow, purchasing 10 of cars
== APP == 2023-06-06 09:35:52.945 durabletask-worker INFO: Successfully connected to 127.0.0.1:65406. Waiting for work items...
== APP == INFO:NotifyActivity:Received order f4e1926e-3721-478d-be8a-f5bebd1995da for 10 cars at $150000 !
== APP == INFO:VerifyInventoryActivity:Verifying inventory for order f4e1926e-3721-478d-be8a-f5bebd1995da of 10 cars
== APP == INFO:VerifyInventoryActivity:There are 100 Cars available for purchase
== APP == INFO:RequestApprovalActivity:Requesting approval for payment of 165000 USD for 10 cars
== APP == 2023-06-06 09:36:05.969 durabletask-worker INFO: f4e1926e-3721-478d-be8a-f5bebd1995da Event raised: manager_approval
== APP == INFO:NotifyActivity:Payment for order f4e1926e-3721-478d-be8a-f5bebd1995da has been approved!
== APP == INFO:ProcessPaymentActivity:Processing payment: f4e1926e-3721-478d-be8a-f5bebd1995da for 10 cars at 150000 USD
== APP == INFO:ProcessPaymentActivity:Payment for request ID f4e1926e-3721-478d-be8a-f5bebd1995da processed successfully
== APP == INFO:UpdateInventoryActivity:Checking inventory for order f4e1926e-3721-478d-be8a-f5bebd1995da for 10 cars
== APP == INFO:UpdateInventoryActivity:There are now 90 cars left in stock
== APP == INFO:NotifyActivity:Order f4e1926e-3721-478d-be8a-f5bebd1995da has completed!
== APP == 2023-06-06 09:36:06.106 durabletask-worker INFO: f4e1926e-3721-478d-be8a-f5bebd1995da: Orchestration completed with status: COMPLETED
== APP == Workflow completed! Result: Completed
== APP == Purchase of item is  Completed
```

### (Optional) Step 4: View in Zipkin

If you have Zipkin configured for Dapr locally on your machine, you can view the workflow trace spans in the Zipkin web UI (typically at `http://localhost:9411/zipkin/`).

<img src="/images/workflow-trace-spans-zipkin-python.png" width=900 style="padding-bottom:15px;">

### What happened?

When you ran `dapr run --app-id order-processor --resources-path ../../../components/ -- python3 app.py`:

1. A unique order ID for the workflow is generated (in the above example, `f4e1926e-3721-478d-be8a-f5bebd1995da`) and the workflow is scheduled.
1. The `NotifyActivity` workflow activity sends a notification saying an order for 10 cars has been received.
1. The `ReserveInventoryActivity` workflow activity checks the inventory data, determines if you can supply the ordered item, and responds with the number of cars in stock.
1. Your workflow starts and notifies you of its status.
1. The `ProcessPaymentActivity` workflow activity begins processing payment for order `f4e1926e-3721-478d-be8a-f5bebd1995da` and confirms if successful.
1. The `UpdateInventoryActivity` workflow activity updates the inventory with the current available cars after the order has been processed.
1. The `NotifyActivity` workflow activity sends a notification saying that order `f4e1926e-3721-478d-be8a-f5bebd1995da` has completed.
1. The workflow terminates as completed.

#### `order-processor/app.py` 

In the application's program file:
- The unique workflow order ID is generated
- The workflow is scheduled
- The workflow status is retrieved
- The workflow and the workflow activities it invokes are registered

```python
class WorkflowConsoleApp:    
    def main(self):
        # Register workflow and activities
        workflowRuntime = WorkflowRuntime(settings.DAPR_RUNTIME_HOST, settings.DAPR_GRPC_PORT)
        workflowRuntime.register_workflow(order_processing_workflow)
        workflowRuntime.register_activity(notify_activity)
        workflowRuntime.register_activity(requst_approval_activity)
        workflowRuntime.register_activity(verify_inventory_activity)
        workflowRuntime.register_activity(process_payment_activity)
        workflowRuntime.register_activity(update_inventory_activity)
        workflowRuntime.start()

        print("==========Begin the purchase of item:==========", flush=True)
        item_name = default_item_name
        order_quantity = 10

        total_cost = int(order_quantity) * baseInventory[item_name].per_item_cost
        order = OrderPayload(item_name=item_name, quantity=int(order_quantity), total_cost=total_cost)

        # Start Workflow
        print(f'Starting order workflow, purchasing {order_quantity} of {item_name}', flush=True)
        start_resp = daprClient.start_workflow(workflow_component=workflow_component,
                                               workflow_name=workflow_name,
                                               input=order)
        _id = start_resp.instance_id

        def prompt_for_approval(daprClient: DaprClient):
            daprClient.raise_workflow_event(instance_id=_id, workflow_component=workflow_component, 
                                            event_name="manager_approval", event_data={'approval': True})

        approval_seeked = False
        start_time = datetime.now()
        while True:
            time_delta = datetime.now() - start_time
            state = daprClient.get_workflow(instance_id=_id, workflow_component=workflow_component)
            if not state:
                print("Workflow not found!")  # not expected
            elif state.runtime_status == "Completed" or\
                    state.runtime_status == "Failed" or\
                    state.runtime_status == "Terminated":
                print(f'Workflow completed! Result: {state.runtime_status}', flush=True)
                break
            if time_delta.total_seconds() >= 10:
                state = daprClient.get_workflow(instance_id=_id, workflow_component=workflow_component)
                if total_cost > 50000 and (
                    state.runtime_status != "Completed" or 
                    state.runtime_status != "Failed" or
                    state.runtime_status != "Terminated"
                    ) and not approval_seeked:
                    approval_seeked = True
                    threading.Thread(target=prompt_for_approval(daprClient), daemon=True).start()
            
        print("Purchase of item is ", state.runtime_status, flush=True)

    def restock_inventory(self, daprClient: DaprClient, baseInventory):
        for key, item in baseInventory.items():
            print(f'item: {item}')
            item_str = f'{{"name": "{item.item_name}", "quantity": {item.quantity},\
                          "per_item_cost": {item.per_item_cost}}}'
            daprClient.save_state("statestore-actors", key, item_str)

if __name__ == '__main__':
    app = WorkflowConsoleApp()
    app.main()
```

#### `order-processor/workflow.py`

In `workflow.py`, the workflow is defined as a class with all of its associated tasks (determined by workflow activities).

```python
  def order_processing_workflow(ctx: DaprWorkflowContext, order_payload_str: OrderPayload):
    """Defines the order processing workflow.
    When the order is received, the inventory is checked to see if there is enough inventory to
    fulfill the order. If there is enough inventory, the payment is processed and the inventory is
    updated. If there is not enough inventory, the order is rejected.
    If the total order is greater than $50,000, the order is sent to a manager for approval.
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
    
    if order_payload["total_cost"] > 50000:
        yield ctx.call_activity(requst_approval_activity, input=order_payload)
        approval_task = ctx.wait_for_external_event("manager_approval")
        timeout_event = ctx.create_timer(timedelta(seconds=200))
        winner = yield when_any([approval_task, timeout_event])
        if winner == timeout_event:
            yield ctx.call_activity(notify_activity, 
                                    input=Notification(message='Payment for order '+order_id
                                                       +' has been cancelled due to timeout!'))
            return OrderResult(processed=False)
        approval_result = yield approval_task
        if approval_result["approval"]:
            yield ctx.call_activity(notify_activity, input=Notification(
                message=f'Payment for order {order_id} has been approved!'))
        else:
            yield ctx.call_activity(notify_activity, input=Notification(
                message=f'Payment for order {order_id} has been rejected!'))
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
```
{{% /codetab %}}


{{< /tabs >}}

## Watch the demo

Watch [this video to walk through the Dapr Workflow .NET demo](https://youtu.be/BxiKpEmchgQ?t=2564):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/BxiKpEmchgQ?start=2564" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>


## Tell us what you think!
We're continuously working to improve our Quickstart examples and value your feedback. Did you find this Quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps

- Set up Dapr Workflow with any programming language using [HTTP instead of an SDK]({{< ref howto-manage-workflow.md >}})
- Walk through a more in-depth [.NET SDK example workflow](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
- Learn more about [Workflow as a Dapr building block]({{< ref workflow-overview >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
