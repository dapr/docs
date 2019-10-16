# Service Invocation 

Dapr-enabled apps can communicate with each other through well-known endpoints in the form of http or gRPC messages.

![Service Invocation Diagram](../../images/service-invocation.png)


1. Service A makes a http/gRPC call meant for Service B.  The call goes to the local Dapr sidecar.
2. Dapr discovers Service B's location and forwards the message to Service B's Dapr sidecar
3. Service B's Dapr sidecar forwards the request to Service B.  Service B performs its corresponding business logic.
4. Service B sends a response for Service A.  The response goes to Service B's sidecar.
5. Dapr forwards the response to Service A's Dapr sidecar.
6. Service A receives the response.

For more information, see:
- The [Service Invocation Spec](../../reference/api/service_invocation.md)
- A [HowTo]() on Service Invocation