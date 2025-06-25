---
type: docs
title: "Workflow API reference"
linkTitle: "Workflow API"
description: "Detailed documentation on the workflow API"
weight: 300
---

Dapr provides users with the ability to interact with workflows through its built-in workflow engine, which is implemented using Dapr Actors. This workflow engine is accessed using the name `dapr` in API calls as the `workflowComponentName`.

## Start workflow request

Start a workflow instance with the given name and optionally, an instance ID.

```
POST http://localhost:3500/v1.0/workflows/<workflowComponentName>/<workflowName>/start[?instanceID=<instanceID>]
```

Note that workflow instance IDs can only contain alphanumeric characters, underscores, and dashes.

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Use `dapr` for Dapr Workflows
`workflowName` | Identify the workflow type
`instanceID` | (Optional) Unique value created for each run of a specific workflow

### Request content

Any request content will be passed to the workflow as input. The Dapr API passes the content as-is without attempting to interpret it.

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code

### Response content

The API call will provide a response similar to this:

```json
{
    "instanceID": "12345678"
}
```

## Terminate workflow request

Terminate a running workflow instance with the given name and instance ID.

```
POST http://localhost:3500/v1.0/workflows/<workflowComponentName>/<instanceId>/terminate
```

{{% alert title="Note" color="primary" %}}
 Terminating a workflow terminates all of the child workflows created by the workflow instance.

Terminating a workflow has no effect on any in-flight activity executions that were started by the terminated instance. 

{{% /alert %}}

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Use `dapr` for Dapr Workflows
`instanceId` | Unique value created for each run of a specific workflow

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code

### Response content

This API does not return any content.

## Raise Event request

For workflow components that support subscribing to external events, such as the Dapr Workflow engine, you can use the following "raise event" API to deliver a named event to a specific workflow instance.

```
POST http://localhost:3500/v1.0/workflows/<workflowComponentName>/<instanceID>/raiseEvent/<eventName>
```

{{% alert title="Note" color="primary" %}}
 The exact mechanism for subscribing to an event depends on the workflow component that you're using. Dapr Workflow has one way of subscribing to external events but other workflow components might have different ways.

{{% /alert %}}

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Use `dapr` for Dapr Workflows
`instanceId` | Unique value created for each run of a specific workflow
`eventName` | The name of the event to raise

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or underlying component

### Response content

None.

## Pause workflow request

Pause a running workflow instance.

```
POST http://localhost:3500/v1.0/workflows/<workflowComponentName>/<instanceId>/pause
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Use `dapr` for Dapr Workflows
`instanceId` | Unique value created for each run of a specific workflow

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Error in Dapr code or underlying component

### Response content

None.

## Resume workflow request

Resume a paused workflow instance.

```
POST http://localhost:3500/v1.0/workflows/<workflowComponentName>/<instanceId>/resume
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Use `dapr` for Dapr Workflows
`instanceId` | Unique value created for each run of a specific workflow

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Error in Dapr code

### Response content

None.

## Purge workflow request

Purge the workflow state from your state store with the workflow's instance ID.

```
POST http://localhost:3500/v1.0/workflows/<workflowComponentName>/<instanceId>/purge
```

{{% alert title="Note" color="primary" %}}
Only `COMPLETED`, `FAILED`, or `TERMINATED` workflows can be purged.
{{% /alert %}}

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Use `dapr` for Dapr Workflows
`instanceId` | Unique value created for each run of a specific workflow

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Error in Dapr code

### Response content

None.

## Get workflow request

Get information about a given workflow instance.

```
GET http://localhost:3500/v1.0/workflows/<workflowComponentName>/<instanceId>
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Use `dapr` for Dapr Workflows
`instanceId` | Unique value created for each run of a specific workflow

### HTTP response codes

Code | Description
---- | -----------
`200`  | OK
`400`  | Request was malformed
`500`  | Error in Dapr code

### Response content

The API call will provide a JSON response similar to this:

```json
{
  "createdAt": "2023-01-12T21:31:13Z",
  "instanceID": "12345678",
  "lastUpdatedAt": "2023-01-12T21:31:13Z",
  "properties": {
    "property1": "value1",
    "property2": "value2",
  },
  "runtimeStatus": "RUNNING",
 }
```

Parameter | Description
--------- | -----------
`runtimeStatus` | The status of the workflow instance. Values include: `"RUNNING"`, `"COMPLETED"`, `"CONTINUED_AS_NEW"`, `"FAILED"`, `"CANCELED"`, `"TERMINATED"`, `"PENDING"`, `"SUSPENDED"`  

## Next Steps

- [Workflow API overview]({{< ref workflow-overview.md >}})
- [Route user to workflow patterns ]({{< ref workflow-patterns.md >}})
