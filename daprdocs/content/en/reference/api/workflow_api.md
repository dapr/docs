---
type: docs
title: "Workflow API reference"
linkTitle: "Workflow API"
description: "Detailed documentation on the workflow API"
weight: 900
---

Dapr provides users with the ability to interact with workflows and comes with a built-in `dapr` component.

## Start workflow request

Start a workflow instance with the given name and instance ID.

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<workflowName>/<instanceId>/start
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Current default is `dapr` for Dapr Workflows
`workflowName` | Identify the workflow type
`instanceId` | Unique value created for each run of a specific workflow

### Request Contents

In the request you can pass along headers:

```json
{
  "input": // argument(s) to pass to the workflow which can be any valid JSON data type (such as objects, strings, numbers, arrays, etc.)
}
```

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or underlying component

### Response content

The API call will provide a response similar to this:

```json
{
  "WFInfo": {
    "instance_id": "SampleWorkflow"
  }
}
```

## Terminate workflow request

Terminate a running workflow instance with the given name and instance ID.

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<instanceId>/terminate
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Current default is `dapr` for Dapr Workflows
`workflowName` | Identify the workflow type
`instanceId` | Unique value created for each run of a specific workflow

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or underlying component

### Response content

The API call will provide a response similar to this:

```bash
HTTP/1.1 202 Accepted
Server: fasthttp
Date: Thu, 12 Jan 2023 21:31:16 GMT
Traceparent: 00-e3dedffedbeb9efbde9fbed3f8e2d8-5f38960d43d24e98-01
Connection: close 
```

### Get workflow request

Get information about a given workflow instance.

```bash
GET http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<workflowName>/<instanceId>
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Current default is `dapr` for Dapr Workflows
`workflowName` | Identify the workflow type
`instanceId` | Unique value created for each run of a specific workflow

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or underlying component

### Response Contents

The API call will provide a response similar to this:

```bash
HTTP/1.1 202 Accepted
Server: fasthttp
Date: Thu, 12 Jan 2023 21:31:16 GMT
Content-Type: application/json
Content-Length: 139
Traceparent: 00-e3dedffedbeb9efbde9fbed3f8e2d8-5f38960d43d24e98-01
Connection: close 

{
  "WFInfo": {
    "instance_id": "SampleWorkflow"
  },
  "start_time": "2023-01-12T21:31:13Z",
  "metadata": {
    "status": "Running",
    "task_queue": "WorkflowSampleQueue"
  }
 }
```

## Component format

A Dapr `workflow.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: workflow.<TYPE>
  version: v1.0-alpha1
  metadata:
  - name: <NAME>
    value: <VALUE>
 ```

| Setting | Description |
| ------- | ----------- |
| `metadata.name` | The name of the workflow component. |
| `spec/metadata` | Additional metadata parameters specified by workflow component |

However, Dapr comes with a built-in `dapr` workflow component that is built on Dapr Actors. No component file is required to use the built-in Dapr workflow component.

## Next Steps

- [Workflow API overview]({{< ref workflow-overview.md >}})
- [Route user to workflow patterns ]({{< ref workflow-patterns.md >}})
