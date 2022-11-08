---
type: docs
title: "Workflow API reference"
linkTitle: "Workflow API"
description: "Detailed documentation on the workflow API"
weight: 900
---

## Start Workflow

### HTTP / gRPC request

```bash
POST http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}/start
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowType` | Identify the workflow type
`instanceId` | Create each workflow instance with a unique value. The payload of the request is the input of the workflow. 

### HTTP response

#### Response codes 

Code | Description
---- | -----------
`200`  | Workflow completes successfully
`202`  | Workflow status
`409`  | Workflow instanceID already exists
`500`  | Failed to complete workflow

#### Response body

**`HTTP 202 accepted` response** includes a location header containing a URL with the status of the workflow. 

### Headers

As part of the start HTTP request, the caller can optionally include one or more `dapr-workflow-metadata` HTTP request headers. The format of the header value is a list of `{key}={value}` values, similar to the format for HTTP cookie request headers. These key/value pairs are saved in the workflow instance’s metadata and can be made available for search (in cases where the workflow implementation supports this kind of search).

### Examples

#### Start workflows from input bindings

For certain types of automation scenarios, you may want to trigger new instances of workflows directly from Dapr input bindings. The instance ID and input payload for the workflow depends on the configuration of the input binding.

**Example 1**

1. Trigger a workflow in response to a tweet from a specific user account using the Twitter input binding. 
1. Use a tweet’s unique ID as the instance ID.

**Example 2**

1. Start a new workflow in response to a Kubernetes event, like a deployment creation event.
1. Use the name of the Kubernetes deployment as the instance ID.

#### Start workflows from pub/sub

Similar to actor pub/sub, you can also start workflows directly from pub/sub events. You can use configuration on the pub/sub topic to identify an appropriate instance ID and input payload for initializing the workflow. In the simplest case, use the source + ID of the cloud event message as the workflow’s instance ID.

If no such workflow instance exists when a pub/sub event is received, a new instance is created. 

If an instance already exists, the exact behavior is determined by policy. For example, one policy would be to recycle the existing instance ID by overwriting the existing workflow instance. An alternate policy would be to discard any pub/sub events that target an existing workflow instance. 

## Terminate Workflow

Typically, service operators terminate a workflow if:

- A particular business process needs to be cancelled, or 
- The workflow encounters a problem and needs to be stopped for mitigation.


### HTTP / gRPC request

```bash
POST http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}/terminate
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowType` | Identify the workflow type
`instanceId` | Create each workflow instance with a unique value. The payload of the request is the input of the workflow. 

### HTTP response

#### Response codes 

Code | Description
---- | -----------
`200`  | Workflow terminates successfully
`202`  | Workflow status
`409`  | Workflow instanceID already exists
`500`  | Failed to complete termination

#### Response body

If a payload is included in the POST request, it will be saved as the output of the workflow instance.

## Raise Event

Workflows are especially useful when they can wait for and be driven by external events. For example, a workflow could subscribe to events from a pub/sub topic, as shown in the [phone verification sample]().

### HTTP / gRPC request

```bash
POST http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}/raiseEvent
```
### URL parameters

Parameter | Description
--------- | -----------
`workflowType` | Identify the workflow type
`instanceId` | Create each workflow instance with a unique value. The payload of the request is the input of the workflow. 

### HTTP response

#### Response codes 

Code | Description
---- | -----------
`200`  | Workflow terminates successfully
`202`  | Event was received, but possibly not yet processed
`409`  | Workflow instanceID already exists
`500`  | Failed to complete termination

#### Response body

None.

> Note: A workflow can consume an external event using the `waitForExternalEvent` SDK method.

## Get Workflow Metadata

If supported by the target runtime, workflow inputs and outputs can also be fetched using the query API.

### HTTP / gRPC request

```bash
GET http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowType` | Identify the workflow type
`instanceId` | Create each workflow instance with a unique value. The payload of the request is the input of the workflow. 

### HTTP response

#### Response codes 

Code | Description
---- | -----------
`200`  | Workflow terminates successfully
`202`  | ..
`409`  | Workflow instanceID already exists
`500`  | Failed to complete termination

#### Response body

This call results in workflow instance metadata, such as its:
- Start time
- Runtime status
- Completion time (if completed)
- Custom or runtime-specific status

Temporal.io also includes metadata for:
- Task queue

## Purge Workflow Metadata

When using the embedded workflow component, this will delete all state stored by the workflow’s underlying actor(s).

### HTTP / gRPC request

```bash
DELETE http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowType` | Identify the workflow type
`instanceId` | Create each workflow instance with a unique value. The payload of the request is the input of the workflow. 

### HTTP response

#### Response codes 

Code | Description
---- | -----------
`200`  | Workflow purged successfully
`202`  | ..
`409`  | ..
`500`  | Failed to complete purge

#### Response body

None

## Suspend and Resume Workflow

You can use an API to suspend or pause workflows to prevent a workflow from moving forward. Suspending a workflow won't schedule any new work.

### HTTP / gRPC request

```bash
POST http://localhost:3500/v1.0/workflows/{workflowComponent}/{instanceId}/suspend
```

To resume a suspended workflow, invoke the `resume` endpoint for a particular workflow instance.

```bash
POST http://localhost:3500/v1.0/workflows/{workflowComponent}/{instanceId}/resume
```

When using the embedded workflow component, the `resume` API is a no-op if the workflow isn’t suspended.

### URL parameters

Parameter | Description
--------- | -----------
`workflowType` | Identify the workflow type
`instanceId` | Create each workflow instance with a unique value. The payload of the request is the input of the workflow. 

### HTTP response

#### Response codes 

Code | Description
---- | -----------
`200`  | Workflow purged successfully
`202`  | ..
`409`  | ..
`500`  | Failed to complete purge

#### Response body

None.

## Next steps

[Workflow API overview]({{< ref workflow-overview.md >}})
