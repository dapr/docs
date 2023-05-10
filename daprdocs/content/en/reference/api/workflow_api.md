---
type: docs
title: "Workflow API reference"
linkTitle: "Workflow API"
description: "Detailed documentation on the workflow API"
weight: 900
---

Dapr provides users with the ability to interact with workflows and comes with a built-in `dapr` component.

## Start workflow request

Start a workflow instance with the given name and optionally, an instance ID.

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<workflowName>/start[?instanceId=<instanceId>]
```

Note that workflow instance IDs can only contain alphanumeric characters, underscores, and dashes.

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Current default is `dapr` for Dapr Workflows
`workflowName` | Identify the workflow type
`instanceId` | (Optional) Unique value created for each run of a specific workflow

### Request content

Any request content will be passed to the workflow as input. The Dapr API passes the content as-is without attempting to interpret it.

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
    "instanceID": "12345678"
}
```

## Terminate workflow request

Terminate a running workflow instance with the given name and instance ID.

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/<instanceId>/terminate
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Current default is `dapr` for Dapr Workflows
`instanceId` | Unique value created for each run of a specific workflow

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or underlying component

### Response content

This API does not return any content.

## Raise Event request

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<instanceID>/raiseEvent/<eventName>
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Current default is `dapr` for Dapr Workflows
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

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<instanceId>/pause
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Current default is `dapr` for Dapr Workflows
`instanceId` | Unique value created for each run of a specific workflow

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or underlying component

### Response content

None.

## Resume workflow request

Resume a paused workflow instance.

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<instanceId>/resume
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Current default is `dapr` for Dapr Workflows
`instanceId` | Unique value created for each run of a specific workflow

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or underlying component

### Response content

None.

## Purge workflow request

Purge the actor state from your state store with the workflow's instance ID.

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<instanceId>/purge
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Current default is `dapr` for Dapr Workflows
`instanceId` | Unique value created for each run of a specific workflow

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or underlying component

### Response content

None.

### Get workflow request

Get information about a given workflow instance.

```bash
GET http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<instanceId>
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Current default is `dapr` for Dapr Workflows
`instanceId` | Unique value created for each run of a specific workflow

### HTTP response codes

Code | Description
---- | -----------
`200`  | OK
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or underlying component

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
