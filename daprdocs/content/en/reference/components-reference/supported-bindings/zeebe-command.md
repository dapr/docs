---
type: docs
title: "Zeebe command binding spec"
linkTitle: "Zeebe command"
description: "Detailed documentation on the Zeebe command binding component"
---

## Component format

To setup Zeebe command binding create a component of type `bindings.zeebe.command`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [this](https://docs.camunda.io/docs/components/zeebe/zeebe-overview/) for Zeebe documentation.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.zeebe.command
  version: v1
  metadata:
  - name: gatewayAddr
    value: "<host>:<port>"
  - name: gatewayKeepAlive
    value: "45s"
  - name: usePlainTextConnection
    value: "true"
  - name: caCertificatePath
    value: "/path/to/ca-cert"
```

## Spec metadata fields

| Field                   | Required | Binding support |  Details | Example |
|-------------------------|:--------:|------------|-----|---------|
| `gatewayAddr`             | Y | Output | Zeebe gateway address                                                                     | `"localhost:26500"` |
| `gatewayKeepAlive`        | N | Output | Sets how often keep alive messages should be sent to the gateway. Defaults to 45 seconds  | `"45s"` |
| `usePlainTextConnection`  | N | Output | Whether to use a plain text connection or not                                             | `"true"`, `"false"` |
| `caCertificatePath`       | N | Output | The path to the CA cert                                                                    | `"/path/to/ca-cert"` |

## Binding support

This component supports **output binding** with the following operations:

- `topology`
- `deploy-process`
- `deploy-resource`
- `create-instance`
- `cancel-instance`
- `set-variables`
- `resolve-incident`
- `publish-message`
- `activate-jobs`
- `complete-job`
- `fail-job`
- `update-job-retries`
- `throw-error`

### Output binding

Zeebe uses gRPC under the hood for the Zeebe client we use in this binding. Please consult the [gRPC API reference](https://docs.camunda.io/docs/apis-clients/grpc/) for more information.

#### topology

The `topology` operation obtains the current topology of the cluster the gateway is part of.

To perform a `topology` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

```json
{
  "data": {},
  "operation": "topology"
}
```

##### Response

The binding returns a JSON with the following response:

```json
{
  "brokers": [
    {
      "nodeId": null,
      "host": "172.18.0.5",
      "port": 26501,
      "partitions": [
        {
          "partitionId": 1,
          "role": null,
          "health": null
        }
      ],
      "version": "0.26.0"
    }
  ],
  "clusterSize": 1,
  "partitionsCount": 1,
  "replicationFactor": 1,
  "gatewayVersion": "0.26.0"
}
```

The response values are:

- `brokers` - list of brokers part of this cluster
    - `nodeId` - unique (within a cluster) node ID for the broker
    - `host` - hostname of the broker
    - `port` - port for the broker
    - `port` - port for the broker
    - `partitions` - list of partitions managed or replicated on this broker
        - `partitionId` - the unique ID of this partition
        - `role` - the role of the broker for this partition
        - `health` - the health of this partition
  - `version` - broker version
- `clusterSize` - how many nodes are in the cluster
- `partitionsCount` - how many partitions are spread across the cluster
- `replicationFactor` - configured replication factor for this cluster
- `gatewayVersion` - gateway version

#### deploy-process

Deprecated alias of 'deploy-resource'.

#### deploy-resource

The `deploy-resource` operation deploys a single resource to Zeebe. A resource can be a process (BPMN) or a decision and a decision requirement (DMN).

To perform a `deploy-resource` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

```json
{
  "data": "YOUR_FILE_CONTENT",
  "metadata": {
    "fileName": "products-process.bpmn"
  },
  "operation": "deploy-resource"
}
```

The metadata parameters are:

- `fileName` - the name of the resource file

##### Response

The binding returns a JSON with the following response:

{{< tabs "BPMN" "DMN" >}}

{{% codetab %}}

```json
{
  "key": 2251799813685252,
  "deployments": [
    {
      "Metadata": {
        "Process": {
          "bpmnProcessId": "products-process",
          "version": 2,
          "processDefinitionKey": 2251799813685251,
          "resourceName": "products-process.bpmn"
        }
      }
    }
  ]
}
```

{{% /codetab %}}

{{% codetab %}}

```json
{
  "key": 2251799813685253,
  "deployments": [
    {
      "Metadata": {
        "Decision": {
          "dmnDecisionId": "products-approval",
          "dmnDecisionName": "Products approval",
          "version": 1,
          "decisionKey": 2251799813685252,
          "dmnDecisionRequirementsId": "Definitions_0c98xne",
          "decisionRequirementsKey": 2251799813685251
        }
      }
    },
    {
      "Metadata": {
        "DecisionRequirements": {
          "dmnDecisionRequirementsId": "Definitions_0c98xne",
          "dmnDecisionRequirementsName": "DRD",
          "version": 1,
          "decisionRequirementsKey": 2251799813685251,
          "resourceName": "products-approval.dmn"
        }
      }
    }
  ]
}
```

{{% /codetab %}}

{{< /tabs >}}

The response values are:

- `key` - the unique key identifying the deployment
- `deployments` - a list of deployed resources, e.g. processes
    - `metadata` - deployment metadata, each deployment has only one metadata
        - `process`- metadata of a deployed process
            - `bpmnProcessId` - the bpmn process ID, as parsed during deployment; together with the version forms a unique identifier for a specific
              process definition
            - `version` - the assigned process version
            - `processDefinitionKey` - the assigned key, which acts as a unique identifier for this process
            - `resourceName` - the resource name from which this process was parsed
        - `decision` - metadata of a deployed decision
            - `dmnDecisionId` - the dmn decision ID, as parsed during deployment; together with the versions forms a unique identifier for a specific 
              decision
            - `dmnDecisionName` - the dmn name of the decision, as parsed during deployment
            - `version` - the assigned decision version
            - `decisionKey` - the assigned decision key, which acts as a unique identifier for this decision
            - `dmnDecisionRequirementsId` - the dmn ID of the decision requirements graph that this decision is part of, as parsed during deployment
            - `decisionRequirementsKey` - the assigned key of the decision requirements graph that this decision is part of
        - `decisionRequirements` -  metadata of a deployed decision requirements
            - `dmnDecisionRequirementsId` - the dmn decision requirements ID, as parsed during deployment; together with the versions forms a unique 
              identifier for a specific decision
            - `dmnDecisionRequirementsName` - the dmn name of the decision requirements, as parsed during deployment
            - `version` - the assigned decision requirements version
            - `decisionRequirementsKey` - the assigned decision requirements key, which acts as a unique identifier for this decision requirements
            - `resourceName` - the resource name from which this decision requirements was parsed

#### create-instance

The `create-instance` operation creates and starts an instance of the specified process. The process definition to use to create the instance can be
specified either using its unique key (as returned by the `deploy-process` operation), or using the BPMN process ID and a version.

Note that only processes with none start events can be started through this command.

Typically, process creation and execution are decoupled. This means that the command creates a new process instance and immediately responds with 
the process instance id. The execution of the process occurs after the response is sent. However, there are use cases that need to collect the results 
of a process when its execution is complete. By defining the `withResult` property, the command allows to "synchronously" execute processes and receive
the results via a set of variables. The response is sent when the process execution is complete.

For more information please visit the [official documentation](https://docs.camunda.io/docs/components/concepts/process-instance-creation/).

To perform a `create-instance` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

{{< tabs "By BPMN process ID" "By process definition key" "Synchronous execution" >}}

{{% codetab %}}

```json
{
  "data": {
    "bpmnProcessId": "products-process",
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    }
  },
  "operation": "create-instance"
}
```

{{% /codetab %}}

{{% codetab %}}

```json
{
  "data": {
    "processDefinitionKey": 2251799813685895,
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    }
  },
  "operation": "create-instance"
}
```

{{% /codetab %}}

{{% codetab %}}

```json
{
  "data": {
    "bpmnProcessId": "products-process",
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    },
    "withResult": true,
    "requestTimeout": "30s",
    "fetchVariables": ["productId"]
  },
  "operation": "create-instance"
}
```

{{% /codetab %}}

{{< /tabs >}}

The data parameters are:

- `bpmnProcessId` - the BPMN process ID of the process definition to instantiate
- `processDefinitionKey` - the unique key identifying the process definition to instantiate
- `version` - (optional, default: latest version) the version of the process to instantiate
- `variables` - (optional) JSON document that will instantiate the variables for the root variable scope of the
  process instance; it must be a JSON object, as variables will be mapped in a
  key-value fashion. e.g. { "a": 1, "b": 2 } will create two variables, named "a" and
  "b" respectively, with their associated values. [{ "a": 1, "b": 2 }] would not be a
  valid argument, as the root of the JSON document is an array and not an object
- `withResult` - (optional, default: false) if set to true, the process will be instantiated and executed synchronously
- `requestTimeout` - (optional, only used if withResult=true) timeout the request will be closed if the process is not completed before the 
  requestTimeout.	If requestTimeout = 0, uses the generic requestTimeout configured in the gateway.
- `fetchVariables` - (optional, only used if withResult=true) list of names of variables to be included in `variables` property of the response.
	If empty, all visible variables in the root scope will be returned.

##### Response

The binding returns a JSON with the following response:

```json
{
  "processDefinitionKey": 2251799813685895,
  "bpmnProcessId": "products-process",
  "version": 3,
  "processInstanceKey": 2251799813687851,
  "variables": "{\"productId\":\"some-product-id\"}"
}
```

The response values are:

- `processDefinitionKey` - the key of the process definition which was used to create the process instance
- `bpmnProcessId` - the BPMN process ID of the process definition which was used to create the process instance
- `version` - the version of the process definition which was used to create the process instance
- `processInstanceKey` - the unique identifier of the created process instance
- `variables` - (optional, only if withResult=true was used in the request) JSON document consists of visible variables in the root scope; 
  returned as a serialized JSON document

#### cancel-instance

The `cancel-instance` operation cancels a running process instance.

To perform a `cancel-instance` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

```json
{
  "data": {
    "processInstanceKey": 2251799813687851
  },
  "operation": "cancel-instance"
}
```

The data parameters are:

- `processInstanceKey` - the process instance key

##### Response

The binding does not return a response body.

#### set-variables

The `set-variables` operation creates or updates variables for an element instance (e.g. process instance, flow element instance).

To perform a `set-variables` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

```json
{
  "data": {
    "elementInstanceKey": 2251799813687880,
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    }
  },
  "operation": "set-variables"
}
```

The data parameters are:

- `elementInstanceKey` - the unique identifier of a particular element; can be the process instance key (as
  obtained during instance creation), or a given element, such as a service task (see elementInstanceKey on the job message)
- `local` - (optional, default: `false`) if true, the variables will be merged strictly into the local scope (as indicated by
  elementInstanceKey); this means the variables is not propagated to upper scopes.
  for example, let's say we have two scopes, '1' and '2', with each having effective variables as:
  1 => `{ "foo" : 2 }`, and 2 => `{ "bar" : 1 }`. if we send an update request with
  elementInstanceKey = 2, variables `{ "foo" : 5 }`, and local is true, then scope 1 will
  be unchanged, and scope 2 will now be `{ "bar" : 1, "foo" 5 }`. if local was false, however,
  then scope 1 would be `{ "foo": 5 }`, and scope 2 would be `{ "bar" : 1 }`
- `variables` - a JSON serialized document describing variables as key value pairs; the root of the document must be an object

##### Response

The binding returns a JSON with the following response:

```json
{
  "key": 2251799813687896
}
```

The response values are:

- `key` - the unique key of the set variables command

#### resolve-incident

The `resolve-incident` operation resolves an incident.

To perform a `resolve-incident` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

```json
{
  "data": {
    "incidentKey": 2251799813686123
  },
  "operation": "resolve-incident"
}
```

The data parameters are:

- `incidentKey` - the unique ID of the incident to resolve

##### Response

The binding does not return a response body.

#### publish-message

The `publish-message` operation publishes a single message. Messages are published to specific partitions computed from their correlation keys.

To perform a `publish-message` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

```json
{
  "data": {
    "messageName": "product-message",
    "correlationKey": "2",
    "timeToLive": "1m",
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    },
  },  
  "operation": "publish-message"
}
```

The data parameters are:

- `messageName` - the name of the message
- `correlationKey` - (optional) the correlation key of the message
- `timeToLive` - (optional)  how long the message should be buffered on the broker
- `messageId` - (optional) the unique ID of the message; can be omitted. only useful to ensure only one message with the given ID will ever
  be published (during its lifetime)
- `variables` - (optional) the message variables as a JSON document; to be valid, the root of the document must be an object, e.g. { "a": "foo" }.
  [ "foo" ] would not be valid

##### Response

The binding returns a JSON with the following response:

```json
{
  "key": 2251799813688225
}
```

The response values are:

- `key` - the unique ID of the message that was published

#### activate-jobs

The `activate-jobs` operation iterates through all known partitions round-robin and activates up to the requested maximum and streams them back to
the client as they are activated.

To perform a `activate-jobs` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

```json
{
  "data": {
    "jobType": "fetch-products",
    "maxJobsToActivate": 5,
    "timeout": "5m",
    "workerName": "products-worker",
    "fetchVariables": [
      "productId",
      "productName",
      "productKey"
    ],
    "requestTimeout": "30s"
  },
  "operation": "activate-jobs"
}
```

The data parameters are:

- `jobType` - the job type, as defined in the BPMN process (e.g. `<zeebe:taskDefinition type="fetch-products" />`)
- `maxJobsToActivate` - the maximum jobs to activate by this request
- `timeout` - (optional, default: 5 minutes) a job returned after this call will not be activated by another call until the timeout has been reached
- `workerName` - (optional, default: `default`) the name of the worker activating the jobs, mostly used for logging purposes
- `fetchVariables` - (optional) a list of variables to fetch as the job variables; if empty, all visible variables at the time of activation for the
  scope of the job will be returned
- `requestTimeout` - (optional) the request will be completed when at least one job is activated or after the requestTimeout. If the requestTimeout = 0,
  a default timeout is used. If the requestTimeout < 0, long polling is disabled and the request is completed immediately, even when no job is activated.

##### Response

The binding returns a JSON with the following response:

```json
[
  {
    "key": 2251799813685267,
    "type": "fetch-products",
    "processInstanceKey": 2251799813685260,
    "bpmnProcessId": "products",
    "processDefinitionVersion": 1,
    "processDefinitionKey": 2251799813685249,
    "elementId": "Activity_test",
    "elementInstanceKey": 2251799813685266,
    "customHeaders": "{\"process-header-1\":\"1\",\"process-header-2\":\"2\"}",
    "worker": "test", 
    "retries": 1,
    "deadline": 1694091934039,
    "variables":"{\"productId\":\"some-product-id\"}"
  }
]
```

The response values are:

- `key` - the key, a unique identifier for the job
- `type` - the type of the job (should match what was requested)
- `processInstanceKey` - the job's process instance key
- `bpmnProcessId` - the bpmn process ID of the job process definition
- `processDefinitionVersion` - the version of the job process definition
- `processDefinitionKey` - the key of the job process definition
- `elementId` - the associated task element ID
- `elementInstanceKey` - the unique key identifying the associated task, unique within the scope of the process instance
- `customHeaders` - a set of custom headers defined during modelling; returned as a serialized JSON document
- `worker` - the name of the worker which activated this job
- `retries` - the amount of retries left to this job (should always be positive)
- `deadline` - when the job can be activated again, sent as a UNIX epoch timestamp
- `variables` - computed at activation time, consisting of all visible variables to the task scope; returned as a serialized JSON document

#### complete-job

The `complete-job` operation completes a job with the given payload, which allows completing the associated service task.

To perform a `complete-job` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

```json
{
  "data": {
    "jobKey": 2251799813686172,
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    }
  },
  "operation": "complete-job"
}
```

The data parameters are:

- `jobKey` - the unique job identifier, as obtained from the activate jobs response
- `variables` - (optional) a JSON document representing the variables in the current task scope

##### Response

The binding does not return a response body.

#### fail-job

The `fail-job` operation marks the job as failed; if the retries argument is positive, then the job will be immediately activatable again, and a
worker could try again to process it. If it is zero or negative however, an incident will be raised, tagged with the given errorMessage, and the
job will not be activatable until the incident is resolved.

To perform a `fail-job` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

```json
{
  "data": {
    "jobKey": 2251799813685739,
    "retries": 5,
    "errorMessage": "some error occurred",
    "retryBackOff": "30s",
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    }
  },
  "operation": "fail-job"
}
```

The data parameters are:

- `jobKey` - the unique job identifier, as obtained when activating the job
- `retries` - the amount of retries the job should have left
- `errorMessage ` - (optional) a message describing why the job failed this is particularly useful if a job runs out of retries and an
  incident is raised, as it this message can help explain why an incident was raised
- `retryBackOff` - (optional) the back-off timeout for the next retry
- `variables` - (optional) JSON document that will instantiate the variables at the local scope of the
	job's associated task; it must be a JSON object, as variables will be mapped in a
	key-value fashion. e.g. { "a": 1, "b": 2 } will create two variables, named "a" and
	"b" respectively, with their associated values. [{ "a": 1, "b": 2 }] would not be a
	valid argument, as the root of the JSON document is an array and not an object.

##### Response

The binding does not return a response body.

#### update-job-retries

The `update-job-retries` operation updates the number of retries a job has left. This is mostly useful for jobs that have run out of retries, should the
underlying problem be solved.

To perform a `update-job-retries` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

```json
{
  "data": {
    "jobKey": 2251799813686172,
    "retries": 10
  },
  "operation": "update-job-retries"
}
```

The data parameters are:

- `jobKey` - the unique job identifier, as obtained through the activate-jobs operation
- `retries` - the new amount of retries for the job; must be positive

##### Response

The binding does not return a response body.

#### throw-error

The `throw-error` operation throw an error to indicate that a business error is occurred while processing the job. The error is identified
by an error code and is handled by an error catch event in the process with the same error code.

To perform a `throw-error` operation, invoke the Zeebe command binding with a `POST` method, and the following JSON body:

```json
{
  "data": {
    "jobKey": 2251799813686172,
    "errorCode": "product-fetch-error",
    "errorMessage": "The product could not be fetched",
    "variables": {
      "productId": "some-product-id",
      "productName": "some-product-name",
      "productKey": "some-product-key"
    }
  },
  "operation": "throw-error"
}
```

The data parameters are:

- `jobKey` - the unique job identifier, as obtained when activating the job
- `errorCode` - the error code that will be matched with an error catch event
- `errorMessage` - (optional) an error message that provides additional context
- `variables` - (optional) JSON document that will instantiate the variables at the local scope of the
	job's associated task; it must be a JSON object, as variables will be mapped in a
	key-value fashion. e.g. { "a": 1, "b": 2 } will create two variables, named "a" and
	"b" respectively, with their associated values. [{ "a": 1, "b": 2 }] would not be a
	valid argument, as the root of the JSON document is an array and not an object.

##### Response

The binding does not return a response body.

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
