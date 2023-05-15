---
type: docs
title: "How-To: Invoke Non-Dapr Endpoints using HTTP"
linkTitle: "How-To: Invoke Non-Dapr Endpoints"
description: "Call Non-Dapr endpoints from Dapr applications using service invocation"
weight: 2000
---

This article demonstrates how to call a non-Dapr endpoint using Dapr over HTTP.

Using Dapr's service invocation API, you can communicate with endpoints that either use or do not use Dapr. Using Dapr to call endpoints that do not use Dapr not only provides a consistent API, but also  the following [Dapr service invocation]({{< ref service-invocation-overview.md >}}) benefits to developers:

1. Ability to apply resiliency policies
2. Call observability with tracing & metrics
3. Security access control through scoping
4. Ability to utilize middleware pipeline components
5. Service discovery
6. Authentication through the use of headers

## HTTP service invocation to external services or non-Dapr endpoints
There are times when you need to call an HTTP endpoint which is not using Dapr. For example you may choose to only use Dapr in part of you overall application, including brownfield development, you may not have access to the code to migrate an existing application to use Dapr, or you simply need to call an external HTTP service.

By defining a HTTPEndpoint resource, you declaratively define a way to interact with a non-Dapr endpoint. You then use the service invocation URL to invoke non-Dapr endpoints. Alternatively, you can place a non-Dapr endpoint URL directly into the service invocation URL demonstrated in the following section.

## Service invocation API

The diagram below is an overview of how Dapr's service invocation works when invoking non-Dapr endpoints.

<img src="/images/service-invocation-overview-non-dapr-endpoint.png" width=800 alt="Diagram showing the steps of service invocation to non-Dapr endpoints">

1. Service A makes an HTTP call targeting Service B, a non-Dapr endpoint. The call goes to the local Dapr sidecar.
2. Dapr discovers Service B's location using the HTTPEndpoint or fully qualified domain name URL.
3. Dapr forwards the message to Service B.
    - **Note**: Calls to non-Dapr endpoints use the HTTP protocol.
4. Service B runs its business logic code.
5. Service B sends a response to Service A's Dapr sidecar.
6. Service A receives the response.

## Service invocation consistency

There is a consistent look and feel for service invocation when communicating between Dapr applications and to non-Dapr applications.

A Dapr application may invoke another Dapr application using the following URL with the `appID` and `my-method` specified:

```sh
localhost:3500/v1.0/invoke/<appID>/method/<my-method>
```

There are two ways to invoke non-Dapr endpoint. A Dapr application may invoke a non-Dapr endpoint by replacing the use of `appID` with:

1. A URL to the non-Dapr endpoint.

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