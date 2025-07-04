---
type: docs
title: "How-To: Invoke Non-Dapr Endpoints using HTTP"
linkTitle: "How-To: Invoke Non-Dapr Endpoints"
description: "Call Non-Dapr endpoints from Dapr applications using service invocation"
weight: 40
---

This article demonstrates how to call a non-Dapr endpoint using Dapr over HTTP.

Using Dapr's service invocation API, you can communicate with endpoints that either use or do not use Dapr. Using Dapr to call endpoints that do not use Dapr not only provides a consistent API, but also the following [Dapr service invocation]({{< ref service-invocation-overview.md >}}) benefits:

- Ability to apply resiliency policies
- Call observability with tracing & metrics
- Security access control through scoping
- Ability to utilize middleware pipeline components
- Service discovery
- Authentication through the use of headers

## HTTP service invocation to external services or non-Dapr endpoints
Sometimes you need to call a non-Dapr HTTP endpoint. For example:
- You may choose to only use Dapr in part of your overall application, including brownfield development
- You may not have access to the code to migrate an existing application to use Dapr
- You need to call an external HTTP service.

By defining an `HTTPEndpoint` resource, you declaratively define a way to interact with a non-Dapr endpoint. You then use the service invocation URL to invoke non-Dapr endpoints. Alternatively, you can place a non-Dapr Fully Qualified Domain Name (FQDN) endpoint URL directly into the service invocation URL.

### Order of precedence between HttpEndpoint, FQDN URL, and appId
When using service invocation, the Dapr runtime follows a precedence order:

1. Is this a named `HTTPEndpoint` resource?
2. Is this an FQDN URL with an`http://` or `https://` prefix?
3. Is this an `appID`?

## Service invocation and non-Dapr HTTP endpoint
The diagram below is an overview of how Dapr's service invocation works when invoking non-Dapr endpoints.

<img src="/images/service-invocation-overview-non-dapr-endpoint.png" width=800 alt="Diagram showing the steps of service invocation to non-Dapr endpoints">

1. Service A makes an HTTP call targeting Service B, a non-Dapr endpoint. The call goes to the local Dapr sidecar.
2. Dapr discovers Service B's location using the `HTTPEndpoint` or FQDN URL then forwards the message to Service B.
3. Service B sends a response to Service A's Dapr sidecar.
4. Service A receives the response.

## Using an HTTPEndpoint resource or FQDN URL for non-Dapr endpoints
There are two ways to invoke a non-Dapr endpoint when communicating either to Dapr applications or non-Dapr applications. A Dapr application can invoke a non-Dapr endpoint by providing one of the following:

- A named `HTTPEndpoint` resource, including defining an `HTTPEndpoint` resource type. See the [HTTPEndpoint reference]({{< ref httpendpoints-schema.md >}}) guide for an example.

    ```sh
    localhost:3500/v1.0/invoke/<HTTPEndpoint-name>/method/<my-method>
    ```

    For example, with an `HTTPEndpoint` resource called "palpatine" and a method called "Order66", this would be:
    ```sh
    curl http://localhost:3500/v1.0/invoke/palpatine/method/order66
    ```

- A FQDN URL to the non-Dapr endpoint.

    ```sh
    localhost:3500/v1.0/invoke/<URL>/method/<my-method>
    ```

    For example, with an FQDN resource called `https://darthsidious.starwars`, this would be:
    ```sh
    curl http://localhost:3500/v1.0/invoke/https://darthsidious.starwars/method/order66
    ```

### Using appId when calling Dapr enabled applications
AppIDs are always used to call Dapr applications with the `appID` and `my-method`. Read the [How-To: Invoke services using HTTP]({{< ref howto-invoke-discover-services.md >}}) guide for more information. For example:

```sh
localhost:3500/v1.0/invoke/<appID>/method/<my-method>
```
```sh
curl http://localhost:3602/v1.0/invoke/orderprocessor/method/checkout
```

## TLS authentication

Using the [HTTPEndpoint resource]({{< ref httpendpoints-schema.md >}}) allows you to use any combination of a root certificate, client certificate and private key according to the authentication requirements of the remote endpoint.

### Example using root certificate

```yaml
apiVersion: dapr.io/v1alpha1
kind: HTTPEndpoint
metadata:
  name: "external-http-endpoint-tls"
spec:
  baseUrl: https://service-invocation-external:443
  headers:
  - name: "Accept-Language"
    value: "en-US"
  clientTLS:
    rootCA:
      secretKeyRef:
        name: dapr-tls-client
        key: ca.crt
```

### Example using client certificate and private key

```yaml
apiVersion: dapr.io/v1alpha1
kind: HTTPEndpoint
metadata:
  name: "external-http-endpoint-tls"
spec:
  baseUrl: https://service-invocation-external:443
  headers:
  - name: "Accept-Language"
    value: "en-US"
  clientTLS:
    certificate:
      secretKeyRef:
        name: dapr-tls-client
        key: tls.crt
    privateKey:
      secretKeyRef:
        name: dapr-tls-key
        key: tls.key
```

## Related Links

- [HTTPEndpoint reference]({{< ref httpendpoints-schema.md >}})
- [Service invocation overview]({{< ref service-invocation-overview.md >}})
- [Service invocation API specification]({{< ref service_invocation_api.md >}})

## Community call demo
Watch this [video](https://youtu.be/BEXJgLsO4hA?t=364) on how to use service invocation to call non-Dapr endpoints.
<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/BEXJgLsO4hA?t=364" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
