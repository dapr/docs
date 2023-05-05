---
type: docs
title: "How-To: Invoke Non-Daprized Endpoints using HTTP"
linkTitle: "How-To: Invoke Non-Daprized Endpoints"
description: "Call Non-Daprized endpoints from Dapr applications using service invocation"
weight: 2000
---

This article demonstrates how to call a non-Daprized endpoint using a Daprized application over HTTP.

By using Dapr's service invocation API, you can communicate with endpoints outside of your Dapr environment. Doing so yields the following [Dapr service invocation]({{< ref service-invocation-overview.md >}}) benefits to developers:

1. Resiliency policies
2. Observability with tracing & metrics
3. Access control through scoping
4. Middleware pipeline components
5. Service discovery
6. Authentication through the use of headers

## Service invocation api consistency

There is a consistent look and feel for service invocation when communicating between Dapr applications and to non-Daprized applications.

A Dapr application may invoke another Dapr application using the following URL with the `appID` and `my-method` specified:

```sh
localhost:3500/v1.0/invoke/<appID>/method/<my-method>
```

There are two ways to invoke non-Daprized endpoint. A Dapr application may invoke a non-Daprized endpoint by replacing the use of `appID` with:

1. A URL to the non-Daprized endpoint.

```sh
localhost:3500/v1.0/invoke/<URL>/method/<my-method>
```

2. An HTTPEndpoint Dapr resource name. This would include defining an HTTPEndpoint resource within the Dapr environment.

```sh
localhost:3500/v1.0/invoke/<HTTPEndpoint-name>/method/<my-method>
```

## Order matters

When using service invocation, the Dapr runtime abides by the following order when it comes to invoking other services:

1. Is there an HTTPEndpoint resource trying to be invoked by name?
2. Is there an `http://` or `https://` prefix for a specified URL?
3. Is there an appID associated with the invocation?

## Related Links

- [Service invocation overview]({{< ref service-invocation-overview.md >}})
- [Service invocation API specification]({{< ref service_invocation_api.md >}})