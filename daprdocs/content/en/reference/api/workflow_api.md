---
type: docs
title: "Workflow API reference"
linkTitle: "Workflow API"
description: "Detailed documentation on the workflow API"
weight: 900
---
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



## Supported workflow methods

### POST start workflow request
```bash
POST http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<workflowName>/<instanceId>/start
```
### POST terminate workflow request
```bash
POST http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<instanceId>/terminate
```
### GET workflow request
```bash
GET http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<workflowName>/<instanceId>
```

### URL parameters

Parameter | Description
--------- | -----------
`workflowComponentName` | Current default is `dapr` for Dapr Workflows
`workflowName` | Identify the workflow type
`instanceId` | Unique value created for each run of a specific workflow


### Headers

As part of the start HTTP request, the caller can optionally include one or more `dapr-workflow-metadata` HTTP request headers. The format of the header value is a list of `{key}={value}` values, similar to the format for HTTP cookie request headers. These key/value pairs are saved in the workflow instance’s metadata and can be made available for search (in cases where the workflow implementation supports this kind of search).


## HTTP responses

### Response codes 

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or underlying component

### Examples of response body for each method

#### POST start workflow response body

```bash
  "WFInfo": {
    "instance_id": "SampleWorkflow"
  }
```


#### POST terminate workflow response body

```bash
HTTP/1.1 202 Accepted
Server: fasthttp
Date: Thu, 12 Jan 2023 21:31:16 GMT
Content-Type: application/json
Content-Length: 139
Traceparent: 00-e3dedffedbeb9efbde9fbed3f8e2d8-5f38960d43d24e98-01
Connection: close 
```


### GET workflow response body

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


## Next Steps

- [Workflow API overview]({{< ref workflow-overview.md >}})
- [Route user to workflow patterns ](todo)
