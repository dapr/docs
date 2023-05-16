---
type: docs
title: "How-To: Invoke Non-Dapr Endpoints using HTTP"
linkTitle: "How-To: Invoke Non-Dapr Endpoints"
description: "Call Non-Dapr endpoints from Dapr applications using service invocation"
weight: 2000
---

This article demonstrates how to call a non-Dapr endpoint using Dapr over HTTP.

Using Dapr's service invocation API, you can communicate with endpoints that either use or do not use Dapr. Using Dapr to call endpoints that do not use Dapr not only provides a consistent API, but also the following [Dapr service invocation]({{< ref service-invocation-overview.md >}}) benefits:

1. Ability to apply resiliency policies
2. Call observability with tracing & metrics
3. Security access control through scoping
4. Ability to utilize middleware pipeline components
5. Service discovery
6. Authentication through the use of headers

## HTTP service invocation to external services or non-Dapr endpoints
There are times when you need to call an HTTP endpoint which is not using Dapr. For example you may choose to only use Dapr in part of you overall application, including brownfield development, you may not have access to the code to migrate an existing application to use Dapr, or you simply need to call an external HTTP service.

By defining an `HTTPEndpoint` resource, you declaratively define a way to interact with a non-Dapr endpoint. You then use the service invocation URL to invoke non-Dapr endpoints. Alternatively, you can place a non-Dapr fully qualified domain name (FQDN) endpoint URL directly into the service invocation URL.

### Order of Precedence between HttpEndpoint, FQDN URL and appId
When using service invocation, the Dapr runtime follows a precedence order when it comes to invoking other services:

1. Is this a named `HTTPEndpoint` resource?
2. Is this a fully qualified domain name (FQDN) URL with an`http://` or `https://` prefix ?
3. Is this an `appID?

## Service invocation and non-Dapr HTTP endpoint
The diagram below is an overview of how Dapr's service invocation works when invoking non-Dapr endpoints.

<img src="/images/service-invocation-overview-non-dapr-endpoint.png" width=800 alt="Diagram showing the steps of service invocation to non-Dapr endpoints">

1. Service A makes an HTTP call targeting Service B, a non-Dapr endpoint. The call goes to the local Dapr sidecar.
2. Dapr discovers Service B's location using the `HTTPEndpoint` or fully qualified domain name (FQDN) URL.
3. Dapr forwards the message to Service B.
4. Service B runs its business logic code.
5. Service B sends a response to Service A's Dapr sidecar.
6. Service A receives the response.

## Using an HTTPEndpoint resource or FQDN URL for non-Dapr endpoints
There is a consistent approach when communicating either to Dapr applications and to non-Dapr applications using service invocation.
There are two ways to invoke non-Dapr endpoint. A Dapr application may invoke a non-Dapr endpoint by providing;

1. A named `HTTPEndpoint` resource, including defining an `HTTPEndpoint` resource type. See [HTTPEndpoint reference]({{< ref httpendpoints-reference.md >}}) for an example.

```sh
localhost:3500/v1.0/invoke/<HTTPEndpoint-name>/method/<my-method>
```

For example, with an `HTTPEndpoint` resource called "palpatine" and a method called "Order66" this would be;
```sh
curl http://localhost:3500/v1.0/invoke/palpatine/method/order66
```

2. A fully qualified domain name (FQDN) URL to the non-Dapr endpoint.

```sh
localhost:3500/v1.0/invoke/<URL>/method/<my-method>
```

For example, with an FQDN resource called https://darthsidious.starwars this would be;
```sh
curl http://localhost:3500/v1.0/invoke/https://darthsidious.starwars/method/order66
```

### Using appId when calling Dapr enabled applications
AppIDs are always used to call Dapr applications with the `appID` and `my-method. Read[How-To: Invoke services using HTTP]({{< ref howto-invoke-discover-services.md >}}) for more information. For example.

```sh
localhost:3500/v1.0/invoke/<appID>/method/<my-method>
```
```sh
curl http://localhost:3602/v1.0/invoke/orderprocessor/method/checkout
```

## Related Links

- [HTTPEndpoint reference]({{< ref httpendpoints-reference.md >}})
- [Service invocation overview]({{< ref service-invocation-overview.md >}})
- [Service invocation API specification]({{< ref service_invocation_api.md >}})

## Community call demo
Watch this [video](https://youtu.be/BEXJgLsO4hA?t=364) on how to use service invocation to call non-Dapr endpoints.
<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/BEXJgLsO4hA?t=364" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>