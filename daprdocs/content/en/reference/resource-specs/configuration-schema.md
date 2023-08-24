---
type: docs
title: "Configuration spec"
linkTitle: "Configuration"
description: "The basic spec for a Dapr Configuration resource"
weight: 5000
---

The `Configuration` is a Dapr resource that is used to configure the Dapr sidecar, control plane, and others.

## Sidecar format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: <REPLACE-WITH-NAME>
  namespace: <REPLACE-WITH-NAMESPACE>
spec:
  api:
    allowed:
      - name: <REPLACE-WITH-API>
        version: <VERSION>
        protocol: <HTTP-OR-GRPC>
  tracing:
    samplingRate: <REPLACE-WITH-INTEGER>
    stdout: true
    otel:
      endpointAddress: <REPLACE-WITH-ENDPOINT-ADDRESS>
      isSecure: false
      protocol: <HTTP-OR-GRPC>
  httpPipeline: # for incoming http calls
    handlers:
      - name: <HANDLER-NAME>
        type: <HANDLER-TYPE>
  appHttpPipeline: # for outgoing http calls
    handlers:
      - name: <HANDLER-NAME>
        type: <HANDLER-TYPE>
  secrets:
    scopes:
      - storeName: <NAME-OF-SCOPED-STORE>
        defaultAccess: <ALLOW-OR-DENY>
        deniedSecrets: <REPLACE-WITH-DENIED-SECRET>
  components:
    deny:
      - <COMPONENT-TO-DENY>
  accessControl:
    defaultAction: <ALLOW-OR-DENY>
    trustDomain: <REPLACE-WITH-TRUST-DOMAIN>
    policies:
      - appId: <APP-NAME>
        defaultAction: <ALLOW-OR-DENY>
        trustDomain: <REPLACE-WITH-TRUST-DOMAIN>
        namespace: "default"
        operations:
          - name: <OPERATION-NAME>
            httpVerb: ['POST', 'GET']
            action: <ALLOW-OR-DENY>
```

### Spec fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| accessControl      | N        | Applied to Dapr sidecar for the called application. Enables the configuration of policies that restrict what operations calling applications can perform (via service invocation) on the called appliaction.  | [Learn more about the `accessControl` configuration.]({{< ref invoke-allowlist.md >}}) |
| api                | N        | Used to enable only the Dapr sidecar APIs used by the application.  | [Learn more about the `api` configuration.]({{< ref api-allowlist.md >}}) |
| httpPipeline       | N        | Configure API middleware pipelines | [Middleware pipeline configuration overview]({{< ref "configuration-overview.md#middleware" >}})<br>[Learn more about the `httpPipeline` configuration.]({{< ref "middleware.md#configure-api-middleware-pipelines" >}}) |
| appHttpPipeline    | N        | Configure application middleware pipelines | [Middleware pipeline configuration overview]({{< ref "configuration-overview.md#middleware" >}})<br>[Learn more about the `appHttpPipeline` configuration.]({{< ref "middleware.md#configure-app-middleware-pipelines" >}}) |
| components         | N        | Used to specify a denylist of component types that can't be initialized. | [Learn more about the `components` configuration.]({{< ref "configuration-overview.md#disallow-usage-of-certain-component-types" >}}) |
| features           | N        | Defines the preview features that are enabled/disabled. | [Learn more about the `features` configuration.]({{< ref preview-features.md >}}) |
| logging            | N        | Configure how logging works in the Dapr runtime. | [Learn more about the `logging` configuration.]({{< ref "configuration-overview.md#logging" >}})  |
| metrics            | N        | Enable or disable metrics for an application. | [Learn more about the `metrics` configuration.]({{< ref "configuration-overview.md#metrics" >}}) |
| nameResolution     | N        | Name resolution configuration spec for the service invocation building block. | [Learn more about the `nameResolution` configuration per components.]({{< ref supported-name-resolution.md >}}) |
| secrets            | N        | Limit the secrets to which your Dapr application has access.  | [Learn more about the `secrets` configuration.]({{< ref secret-scope.md >}}) |
| tracing            | N        | Turns on tracing for an application. | [Learn more about the `tracing` configuration.]({{< ref "configuration-overview.md#tracing" >}}) |


## Control plane format

The `daprsystem` configuration file installed with Dapr applies global settings and is only set up when Dapr is deployed to Kubernetes. 

```yml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprsystem
  namespace: default
spec:
  mtls:
    enabled: true
    allowedClockSkew: 15m
    workloadCertTTL: 24h
```

### Spec fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| mtls               | N        | Defines the mTLS configuration | `allowedClockSkew: 15m`<br>`workloadCertTTL:24h`<br>[Learn more about the `mtls` configuration.]({{< ref "configuration-overview.md#mtls-mutual-tls" >}}) |


## Related links

- [Learn more about how to use configuration specs]({{< ref configuration-overview.md >}})