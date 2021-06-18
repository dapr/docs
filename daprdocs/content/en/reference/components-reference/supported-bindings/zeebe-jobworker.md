﻿---
type: docs
title: "Zeebe JobWorker binding spec"
linkTitle: "Zeebe JobWorker"
description: "Detailed documentation on the Zeebe JobWorker binding component"
---

## Component format

To setup Zeebe JobWorker binding create a component of type `bindings.zeebe.jobworker`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [this](https://docs.camunda.io/docs/product-manuals/concepts/job-workers) for Zeebe JobWorker documentation.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.zeebe.jobworker
  version: v1
  metadata:
  - name: gatewayAddr
    value: <host>:<port>
  - name: gatewayKeepAlive
    value: 45s
  - name: usePlainTextConnection
    value: true
  - name: caCertificatePath
    value: /path/to/ca-cert
  - name: workerName
    value: products-worker
  - name: workerTimeout
    value: 5m
  - name: requestTimeout
    value: 15s
  - name: jobType
    value: fetch-products
  - name: maxJobsActive
    value: 32
  - name: concurrency
    value: 4
  - name: pollInterval
    value: 100ms
  - name: pollThreshold
    value: 0.3
  - name: fetchVariables
    value: productId, productName, productKey
```

## Spec metadata fields

| Field                   | Required | Binding support |  Details | Example |
|-------------------------|:--------:|------------|-----|---------|
| gatewayAddr             | Y | Input | Zeebe gateway address                                                                                                            | `localhost:26500` | 
| gatewayKeepAlive        | N | Input | Sets how often keep alive messages should be sent to the gateway. Defaults to 45 seconds                                         | `45s` | 
| usePlainTextConnection  | N | Input | Whether to use a plain text connection or not                                                                                    | `true,false` | 
| caCertificatePath       | N | Input | The path to the CA cert                                                                                                          | `/path/to/ca-cert` | 
| workerName              | N | Input | The name of the worker activating the jobs, mostly used for logging purposes                                                     | `products-worker` | 
| workerTimeout           | N | Input | A job returned after this call will not be activated by another call until the timeout has been reached; defaults to 5 minutes   | `5m` | 
| requestTimeout          | N | Input | The request will be completed when at least one job is activated or after the requestTimeout. If the requestTimeout = 0, a default timeout is used. If the requestTimeout < 0, long polling is disabled and the request is completed immediately, even when no job is activated. Defaults to 10 seconds  | `30s` | 
| jobType                 | Y | Input | the job type, as defined in the BPMN process (e.g. `<zeebe:taskDefinition type="fetch-products" />`)                             | `fetch-products` | 
| maxJobsActive           | N | Input | Set the maximum number of jobs which will be activated for this worker at the same time. Defaults to 32                          | `32` | 
| concurrency             | N | Input | The maximum number of concurrent spawned goroutines to complete jobs. Defaults to 4                                              | `4` | 
| pollInterval            | N | Input | Set the maximal interval between polling for new jobs. Defaults to 100 milliseconds                                              | `100ms` | 
| pollThreshold           | N | Input | Set the threshold of buffered activated jobs before polling for new jobs, i.e. threshold * maxJobsActive. Defaults to 0.3        | `0.3` | 
| fetchVariables          | N | Input | A list of variables to fetch as the job variables; if empty, all visible variables at the time of activation for the scope of the job will be returned | `productId, productName, productKey` | 

## Binding support

This component supports **input** binding interfaces.

### Input binding

The Zeebe workflow engine handles the workflow state as also workflow variables which can be passed 
on workflow instantiation or which can be updated or created during workflow execution. These variables
can be passed to a registered job worker by defining the variable names as comma-separated list in
the `fetchVariables` metadata field. The workflow engine will then pass these variables with its current 
values to the job worker implementation.

If the binding will register three variables `productId`, `productName` and `productKey` then the service will
be called with the following JSON:

```json
{
  "productId": "some-product-id",  
  "productName": "some-product-name",  
  "productKey": "some-product-key"  
}
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
