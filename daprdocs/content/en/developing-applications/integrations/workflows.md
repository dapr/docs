---
type: docs
title: "Build workflows with Logic Apps"
linkTitle: "Workflows"
description: "Learn how to build workflows using Dapr Workflows and Logic Apps"
weight: 4000
---

Dapr Workflows is a lightweight host that allows developers to run cloud-native workflows locally, on-premises or any cloud environment using the [Azure Logic Apps](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-overview) workflow engine and Dapr.

## Benefits

By using a workflow engine, business logic can be defined in a declarative, no-code fashion so application code doesn't need to change when a workflow changes. Dapr Workflows allows you to use workflows in a distributed application along with these added benefits:

- **Run workflows anywhere**: on your local machine, on-premises, on Kubernetes or in the cloud
- **Built-in observability**: tracing, metrics and mTLS through Dapr
- **gRPC and HTTP endpoints** for your workflows
- Kick off workflows based on **Dapr bindings** events
- Orchestrate complex workflows by **calling back to Dapr** to save state, publish a message and more

<img src="/images/workflows-diagram.png" width=500 alt="Diagram of Dapr Workflows">

## How it works

Dapr Workflows hosts a gRPC server that implements the Dapr Client API.

This allows users to start workflows using gRPC and HTTP endpoints through Dapr, or start a workflow asynchronously using Dapr bindings.
Once a workflow request comes in, Dapr Workflows uses the Logic Apps SDK to execute the workflow.

## Supported workflow features

### Supported actions and triggers

- [HTTP](https://docs.microsoft.com/en-us/azure/connectors/connectors-native-http)
- [Schedule](https://docs.microsoft.com/en-us/azure/logic-apps/concepts-schedule-automated-recurring-tasks-workflows)
- [Request / Response](https://docs.microsoft.com/en-us/azure/connectors/connectors-native-reqres)

### Supported control workflows

- [All control workflows](https://docs.microsoft.com/en-us/azure/connectors/apis-list#control-workflow)

### Supported data manipulation

- [All data operations](https://docs.microsoft.com/en-us/azure/connectors/apis-list#manage-or-manipulate-data)

### Not supported

- [Managed connectors](https://docs.microsoft.com/en-us/azure/connectors/apis-list#managed-connectors)

## Example

Dapr Workflows can be used as the orchestrator for many otherwise complex activities. For example, invoking an external endpoint, saving the data to a state store, publishing the result to a different app or invoking a binding can all be done by calling back into Dapr from the workflow itself.

This is due to the fact Dapr runs as a sidecar next to the workflow host just as if it was any other app.

Examine [workflow2.json](/code/workflow.json) as an example of a workflow that does the following:

1. Calls into Azure Functions to get a JSON response
2. Saves the result to a Dapr state store
3. Sends the result to a Dapr binding
4. Returns the result to the caller

Since Dapr supports many pluggable state stores and bindings, the workflow becomes portable between different environments (cloud, edge or on-premises) without the user changing the code - *because there is no code involved*.

## Get started

Prerequisites:

1. Install the [Dapr CLI]({{< ref install-dapr-cli.md >}})
2. [Azure blob storage account](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-create-account-block-blob?tabs=azure-portal)

### Self-hosted

1. Make sure you have the Dapr runtime initialized:

    ```bash
    dapr init
    ```

1. Set up the environment variables containing the Azure Storage Account credentials:

   {{< tabs Windows "macOS/Linux" >}}
   
   {{% codetab %}}
   ```bash
   export STORAGE_ACCOUNT_KEY=<YOUR-STORAGE-ACCOUNT-KEY>
   export STORAGE_ACCOUNT_NAME=<YOUR-STORAGE-ACCOUNT-NAME>
   ```
   {{% /codetab %}}
   
   {{% codetab %}}
   ```bash
   set STORAGE_ACCOUNT_KEY=<YOUR-STORAGE-ACCOUNT-KEY>
   set STORAGE_ACCOUNT_NAME=<YOUR-STORAGE-ACCOUNT-NAME>
   ```
   {{% /codetab %}}
   
   {{< /tabs >}}

1. Move to the workflows directory and run the sample runtime:

   ```bash
   cd src/Dapr.Workflows
   
   dapr run --app-id workflows --protocol grpc --port 3500 --app-port    50003 -- dotnet run --workflows-path ../../samples
   ```

1. Invoke a workflow:

   ```bash
   curl http://localhost:3500/v1.0/invoke/workflows/method/workflow1
   
   {"value":"Hello from Logic App workflow running with    Dapr!"}                                                                                      
   ```

### Kubernetes

1. Make sure you have a running Kubernetes cluster and `kubectl` in your path.

1. Once you have the Dapr CLI installed, run:

   ```bash
   dapr init --kubernetes
   ```

1. Wait until the Dapr pods have the status `Running`.

1. Create a Config Map for the workflow:

   ```bash
   kubectl create configmap workflows --from-file ./samples/workflow1.   json
   ```

1. Create a secret containing the Azure Storage Account credentials. Replace the account name and key values below with the actual credentials:

   ```bash
   kubectl create secret generic dapr-workflows    --from-literal=accountName=<YOUR-STORAGE-ACCOUNT-NAME>    --from-literal=accountKey=<YOUR-STORAGE-ACCOUNT-KEY>
   ```

1. Deploy Dapr Worfklows:

   ```bash
   kubectl apply -f deploy/deploy.yaml
   ```

1. Create a port-forward to the dapr workflows container:

   ```bash
   kubectl port-forward deploy/dapr-workflows-host 3500:3500
   ```

1. Invoke logic apps through Dapr:

   ```bash
   curl http://localhost:3500/v1.0/invoke/workflows/method/workflow1
   
   {"value":"Hello from Logic App workflow running with Dapr!"}
   ```

## Invoking workflows using Dapr bindings

1. First, create any [Dapr binding]({{< ref components-reference >}}) of your choice. See [this]({{< ref howto-triggers >}}) How-To tutorial.

   In order for Dapr Workflows to be able to start a workflow from a Dapr binding event, simply name the binding with the name of the workflow you want it to trigger.

   Here's an example of a Kafka binding that will trigger a workflow named `workflow1`:

   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Component
   metadata:
     name: workflow1
   spec:
     type: bindings.kafka
     metadata:
     - name: topics
       value: topic1
     - name: brokers
       value: localhost:9092
     - name: consumerGroup
       value: group1
     - name: authRequired
       value: "false"
   ```

1. Next, apply the Dapr component:

   {{< tabs Self-hosted Kubernetes >}}
   
   {{% codetab %}}
   Place the binding yaml file above in a `components` directory at the    root of your application.
   {{% /codetab %}}
   
   {{% codetab %}}
   ```bash
   kubectl apply -f my_binding.yaml
   ```
   {{% /codetab %}}
   
   {{< /tabs >}}

1. Once an event is sent to the bindings component, check the logs Dapr Workflows to see the output.

   {{< tabs Self-hosted Kubernetes >}}
   
   {{% codetab %}}
   In standalone mode, the output will be printed to the local terminal.
   {{% /codetab %}}
   
   {{% codetab %}}
   On Kubernetes, run the following command:
   
   ```bash
   kubectl logs -l app=dapr-workflows-host -c host
   ```
   {{% /codetab %}}
   
   {{< /tabs >}}

## Example

Watch an example from the Dapr community call:

<iframe width="560" height="315" src="https://www.youtube.com/embed/7fP-0Ixmi-w?start=116" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Additional resources

- [Blog announcement](https://cloudblogs.microsoft.com/opensource/2020/05/26/announcing-cloud-native-workflows-dapr-logic-apps/)
- [Repo](https://github.com/dapr/workflows)