---
type: docs
title: "Overview of Dapr configuration options"
linkTitle: "Overview"
weight: 100
description: "Information on Dapr configuration and how to set options for your application"
---

## Sidecar configuration

### Setup sidecar configuration

#### Self-hosted sidecar
In self hosted mode the Dapr configuration is a configuration file, for example `config.yaml`. By default the Dapr sidecar looks in the default Dapr folder for the runtime configuration eg: `$HOME/.dapr/config.yaml` in Linux/MacOS and `%USERPROFILE%\.dapr\config.yaml` in Windows.

A Dapr sidecar can also apply a configuration by using a ```--config``` flag to the file path with ```dapr run``` CLI command.

#### Kubernetes sidecar
In Kubernetes mode the Dapr configuration is a Configuration CRD, that is applied to the cluster. For example:

```bash
kubectl apply -f myappconfig.yaml
```

You can use the Dapr CLI to list the Configuration CRDs

```bash
dapr configurations -k
```

A Dapr sidecar can apply a specific configuration by using a ```dapr.io/config``` annotation. For example:

```yml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    dapr.io/app-port: "3000"
    dapr.io/config: "myappconfig"
```
Note: There are more [Kubernetes annotations]({{< ref "arguments-annotations-overview.md" >}}) available to configure the Dapr sidecar on activation by sidecar Injector system service.

### Sidecar configuration settings

The following configuration settings can be applied to Dapr application sidecars:
- [Tracing](#tracing)
- [Metrics](#metrics)
- [Middleware](#middleware)
- [Scoping secrets for secret stores](#scoping-secrets-for-secret-stores)
- [Access control allow lists for service invocation](#access-control-allow-lists-for-service-invocation)
- [Example application sidecar configuration](#example-application-sidecar-configuration)

#### Tracing

Tracing configuration turns on tracing for an application.

The `tracing` section under the `Configuration` spec contains the following properties:

```yml
tracing:
  samplingRate: "1"
  zipkin:
    endpointAddress: "http://zipkin.default.svc.cluster.local:9411/api/v2/spans"
```

The following table lists the properties for tracing:

| Property     | Type   | Description |
|--------------|--------|-------------|
| `samplingRate` | string | Set sampling rate for tracing to be enabled or disabled.
| `zipkin.endpointAddress` | string | Set the Zipkin server address.


`samplingRate` is used to enable or disable the tracing. To disable the sampling rate ,
set `samplingRate : "0"` in the configuration. The valid range of samplingRate is between 0 and 1 inclusive. The sampling rate determines whether a trace span should be sampled or not based on value. `samplingRate : "1"` samples all traces. By default, the sampling rate is (0.0001) or 1 in 10,000 traces.

See [Observability distributed tracing]({{< ref "tracing-overview.md" >}}) for more information

#### Metrics

The metrics section can be used to enable or disable metrics for an application.

The `metrics` section under the `Configuration` spec contains the following properties:

```yml
metrics:
  enabled: true
```

The following table lists the properties for metrics:

| Property     | Type   | Description |
|--------------|--------|-------------|
| `enabled` | boolean | Whether metrics should to be enabled.

See [metrics documentation]({{< ref "metrics-overview.md" >}}) for more information

#### Middleware

Middleware configuration set named Http pipeline middleware handlers
The `httpPipeline` section under the `Configuration` spec contains the following properties:

```yml
httpPipeline:
  handlers:
    - name: oauth2
      type: middleware.http.oauth2
    - name: uppercase
      type: middleware.http.uppercase
```

The following table lists the properties for HTTP handlers:

| Property | Type   | Description |
|----------|--------|-------------|
| name     | string | Name of the middleware component
| type     | string | Type of middleware component

See [Middleware pipelines]({{< ref "middleware.md" >}}) for more information

#### Scope secret store access
See the [Scoping secrets]({{< ref "secret-scope.md" >}}) guide for information and examples on how to scope secrets to an application.

#### Access Control allow lists for building block APIs
See the [selectively enable Dapr APIs on the Dapr sidecar]({{< ref "api-allowlist.md" >}}) guide for information and examples on how to set ACLs on the building block APIs lists.

#### Access Control allow lists for service invocation API
See the [Allow lists for service invocation]({{< ref "invoke-allowlist.md" >}}) guide for information and examples on how to set allow lists with ACLs which using service invocation API.

#### Turning on preview features
See the [preview features]({{< ref "preview-features.md" >}}) guide for information and examples on how to opt-in to preview features for a release. Preview feature enable new capabilities to be added that still need more time until they become generally available (GA) in the runtime.

### Example sidecar configuration
The following yaml shows an example configuration file that can be applied to an applications' Dapr sidecar.

```yml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
  namespace: default
spec:
  tracing:
    samplingRate: "1"
  httpPipeline:
    handlers:
      - name: oauth2
        type: middleware.http.oauth2
  secrets:
    scopes:
      - storeName: localstore
        defaultAccess: allow
        deniedSecrets: ["redis-password"]
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

## Control-plane configuration
There is a single configuration file called `daprsystem` installed with the Dapr control plane system services that applies global settings. This is only set up when Dapr is deployed to Kubernetes.

### Control-plane configuration settings
A Dapr control plane configuration can configure the following settings:

| Property         | Type   | Description |
|------------------|--------|-------------|
| enabled          | bool   | Set mtls to be enabled or disabled
| allowedClockSkew | string | The extra time to give for certificate expiry based on possible clock skew on a machine. Default is 15 minutes.
| workloadCertTTL  | string | Time a certificate is valid for. Default is 24 hours

See the [Mutual TLS]({{< ref "mtls.md" >}}) HowTo and [security concepts]({{< ref "security-concept.md" >}}) for more information.

### Example control plane configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: default
  namespace: default
spec:
  mtls:
    enabled: true
    allowedClockSkew: 15m
    workloadCertTTL: 24h
```
