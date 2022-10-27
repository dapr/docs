---
type: docs
title: "How to: Set up a workflow"
linkTitle: "How to: Set up workflows"
weight: 2000
description: Integrate, manage, and expose workflows with the built-in workflow runtime component
---

<!-- Introductory paragraph  
Required. Light intro that briefly describes what the how-to will cover and any default Dapr characteristics. Link off to the appropriate concept or overview docs to provide context. -->

<!-- 
Include a diagram or image, if possible. 
-->

<!--
If applicable, link to the related quickstart in a shortcode note or alert with text like:
 If you haven't already, [try out the <topic> quickstart](link) for a quick walk-through on how to use <topic>.
-->

## Start Workflow API

### HTTP / gRPC
Developers can start workflow instances by issuing an HTTP (or gRPC) API call to the Dapr sidecar:

```bash
POST http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}/start
```

Workflows are assumed to have a type that is identified by the {workflowType} parameter. Each workflow instance must also be created with a unique {instanceId} value. The payload of the request is the input of the workflow. If a workflow instance with this ID already exists, this call will fail with an HTTP 409 Conflict.

To support asynchronous HTTP polling pattern by HTTP clients, this API will return an HTTP 202 Accepted response with a Location header containing a URL that can be used to get the status of the workflow (see further below). When the workflow completes, this endpoint will return an HTTP 200 response. If it fails, the endpoint can return a 4XX or 5XX error HTTP response code. Some of these details may need to be configurable since there is no universal protocol for async API handling.

### Input bindings
For certain types of automation scenarios, it can be useful to trigger new instances of workflows directly from Dapr input bindings. For example, it may be useful to trigger a workflow in response to a tweet from a particular user account using the Twitter input binding. Another example is starting a new workflow in response to a Kubernetes event, like a deployment creation event.

The instance ID and input payload for the workflow depends on the configuration of the input binding. For example, a user may want to use a Tweet’s unique ID or the name of the Kubernetes deployment as the instance ID.

### Pub/Sub
Workflows can also be started directly from pub/sub events, similar to the proposal for Actor pub/sub. Configuration on the pub/sub topic can be used to identify an appropriate instance ID and input payload to use for initializing the workflow. In the simplest case, the source + ID of the cloud event message can be used as the workflow’s instance ID.

## Terminate workflow API
### HTTP / gRPC
Workflow instances can also be terminated using an explicit API call.

```bash
POST http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}/terminate
```

Workflow termination is primarily an operation that a service operator takes if a particular business process needs to be cancelled, or if a problem with the workflow requires it to be stopped to mitigate impact to other services.

If a payload is included in the POST request, it will be saved as the output of the workflow instance.

## Raise Event API
Workflows are especially useful when they can wait for and be driven by external events. For example, a workflow could subscribe to events from a pubsub topic as shown in the Phone Verification sample. However, this capability shouldn’t be limited to pub/sub events.

### HTTP / gRPC
An API should exist for publishing events directly to a workflow instance:

```bash
POST http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}/raiseEvent
```

The result of the "raise event" API is an HTTP 202 Accepted, indicating that the event was received but possibly not yet processed. A workflow can consume an external event using the waitForExternalEvent SDK method.

## Get workflow metadata API

### HTTP / gRPC
Users can fetch the metadata of a workflow instance using an explicit API call.

```bash
GET http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}
```

The result of this call is workflow instance metadata, such as its start time, runtime status, completion time (if completed), and custom or runtime-specific status. If supported by the target runtime, workflow inputs and outputs can also be fetched using the query API.

## Purge workflow metadata API
Users can delete all state associated with a workflow using the following API:

```bash
DELETE http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}
```

When using the embedded workflow component, this will delete all state stored by the workflow’s underlying actor(s).

## Next steps

<!--
Link to related pages and examples. For example, the building block overview, the related tutorial, API reference, etc.
-->