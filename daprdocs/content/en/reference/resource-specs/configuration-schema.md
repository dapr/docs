---
type: docs
title: "Configuration spec"
linkTitle: "Configuration"
description: "The basic spec for a Dapr Configuration resource"
weight: 5000
---

The `Configuration` is a Dapr resource that is used to configure the Dapr sidecar, control-plane, and others.

## Format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: <REPLACE-WITH-NAME>
  namespace: <REPLACE-WITH-NAMESPACE>
spec:
  tracing:
    samplingRate: "1"
    stdout: true
    otel:
      endpointAddress: "localhost:4317"
      isSecure: false
      protocol: "grpc"
  httpPipeline:
    handlers:
      - name: oauth2
        type: middleware.http.oauth2
  secrets:
    scopes:
      - storeName: localstore
        defaultAccess: allow
        deniedSecrets: ["redis-password"]
  components:
    deny:
      - bindings.smtp
      - secretstores.local.file
  accessControl:
    defaultAction: deny
    trustDomain: "public"
    policies:
      - appId: app1
        defaultAction: deny
        trustDomain: 'public'
        namespace: "default"
        operations:
          - name: /op1
            httpVerb: ['POST', 'GET']
            action: deny
          - name: /op2/*
            httpVerb: ["*"]
            action: allow
```

## Spec fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| accessControl      | Y        | Defines the data structure for the configuration spec |  |
| api                | N        | Describes the configuration for the Dapr APIs |  |
| appHttpPipeline    | N        | Configuration spec for defining the middleware pipeline |  |
| components         | N        | Describes the configuration for Dapr components |  |
| features           | N        | Defines the features that are enabled/disabled |  |
| httpPipeline       | N        | Configuration spec for defining the middleware pipeline |  |
| logging            | N        | Used to configure logging |  |
| metric             | N        | Defines the metrics configuration |  |
| mtls               | N        | Defines the mTLS configuration |  |
| nameResolution     | N        | Name resolution configuration spec |  |
| secrets            | N        | Configures secrets for your sidecar or control-plane |  |
| tracing            | N        | Defines distributed tracing configuration |  |

## Related links

- [Learn more about how to use configuration specs]({{< ref configuration-overview.md >}})