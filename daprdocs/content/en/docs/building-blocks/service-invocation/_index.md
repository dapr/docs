---
title: "Dapr Service Invocation"
linkTitle: "Service Invocation"
weight: 10
---

# Service Invocation

Using the service invocation API, your microservice can find and reliably communicate with other microservices in your system using standard protocols ([gRPC](https://grpc.io) or HTTP are currently supported). 

Below is a high level overview of how Dapr's service invocation system works.

![Service Invocation Diagram](../../images/service-invocation.png)

1. Service A makes a http/gRPC call meant for Service B.  The call goes to the local Dapr sidecar.  
2. Dapr discovers Service B's location and forwards the message to Service B's Dapr sidecar
3. Service B's Dapr sidecar forwards the request to Service B.  Service B performs its corresponding business logic.
4. Service B sends a response for Service A.  The response goes to Service B's sidecar.
5. Dapr forwards the response to Service A's Dapr sidecar.
6. Service A receives the response.

As an example for all the above, suppose we have the collection of apps described in the following sample, where a python app invokes a Node.js app: https://github.com/dapr/quickstarts/blob/master/hello-kubernetes/README.md

In such a scenario, the python app would be "Service A" above, and the Node.js app would be "Service B".

The following describes items 1-6 again in the context of this sample:

1. Suppose the Node.js app has a Dapr app id of "nodeapp", as in the sample.  The python app invokes the Node.js app's `neworder` method by posting `http://localhost:3500/v1.0/invoke/nodeapp/method/neworder`, which first goes to the python app's local Dapr sidecar.
2. Dapr discovers the Node.js app's location and forwards it to the Node.js app's sidecar.
3. The Node.js app's sidecar forwards the request to the Node.js app.  The Node.js app performs its business logic, which, as described in the sample, is to log the incoming message and then persist the order ID into Redis (not shown in the diagram above).

Steps 4-5 are the same as the list above.

# Next Steps

**If you're ready to get started**, follow this how-to guide on [how to get started with service invocation](https://github.com/dapr/docs/tree/master/howto/invoke-and-discover-services)

If you'd like more technical detail on how service invocation works, move on to the [API Spec](../../reference/api/service_invocation_api.md)
