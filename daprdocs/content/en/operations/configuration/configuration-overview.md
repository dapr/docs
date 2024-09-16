---
type: docs
title: "Dapr configuration"
linkTitle: "Overview"
weight: 100
description: "Overview of Dapr configuration"
---

Dapr configurations are settings and policies that enable you to change both the behavior of individual Dapr applications, or the global behavior of the Dapr control plane system services. 

[for more information, read the configuration concept.]({{< ref configuration-concept.md >}})

## Application configuration

### Set up application configuration

You can set up application configuration either in self-hosted or Kubernetes mode.

{{< tabs "Self-hosted" Kubernetes >}}

 <!-- Self hosted -->
{{% codetab %}}

In self hosted mode, the Dapr configuration is a [configuration file]({{< ref configuration-schema.md >}}) - for example, `config.yaml`. By default, the Dapr sidecar looks in the default Dapr folder for the runtime configuration:
- Linux/MacOs: `$HOME/.dapr/config.yaml`
- Windows: `%USERPROFILE%\.dapr\config.yaml`

An application can also apply a configuration by using a `--config` flag to the file path with `dapr run` CLI command.

{{% /codetab %}}

 <!-- Kubernetes -->
{{% codetab %}}

In Kubernetes mode, the Dapr configuration is a Configuration resource, that is applied to the cluster. For example:

```bash
kubectl apply -f myappconfig.yaml
```

You can use the Dapr CLI to list the Configuration resources for applications.

```bash
dapr configurations -k
```

A Dapr sidecar can apply a specific configuration by using a `dapr.io/config` annotation. For example:

```yml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    dapr.io/app-port: "3000"
    dapr.io/config: "myappconfig"
```

> **Note:** [See all Kubernetes annotations]({{< ref "arguments-annotations-overview.md" >}}) available to configure the Dapr sidecar on activation by sidecar Injector system service.

{{% /codetab %}}

{{< /tabs >}}

### Application configuration settings

The following menu includes all of the configuration settings you can set on the sidecar. 

- [Tracing](#tracing)
- [Metrics](#metrics)
- [Logging](#logging)
- [Middleware](#middleware)
- [Name resolution](#name-resolution)
- [Scope secret store access](#scope-secret-store-access)
- [Access Control allow lists for building block APIs](#access-control-allow-lists-for-building-block-apis)
- [Access Control allow lists for service invocation API](#access-control-allow-lists-for-service-invocation-api)
- [Disallow usage of certain component types](#disallow-usage-of-certain-component-types)
- [Turning on preview features](#turning-on-preview-features)
- [Example sidecar configuration](#example-sidecar-configuration)

#### Tracing

Tracing configuration turns on tracing for an application.

The `tracing` section under the `Configuration` spec contains the following properties:

```yml
tracing:
  samplingRate: "1"
  otel: 
    endpointAddress: "otelcollector.observability.svc.cluster.local:4317"
  zipkin:
    endpointAddress: "http://zipkin.default.svc.cluster.local:9411/api/v2/spans"
```

The following table lists the properties for tracing:

| Property     | Type   | Description |
|--------------|--------|-------------|
| `samplingRate` | string | Set sampling rate for tracing to be enabled or disabled.
| `stdout` | bool | True write more verbose information to the traces
| `otel.endpointAddress` | string | Set the Open Telemetry (OTEL) server address to send traces to. This may or may not require the https:// or http:// depending on your OTEL provider.
| `otel.isSecure` | bool | Is the connection to the endpoint address encrypted
| `otel.protocol` | string | Set to `http` or `grpc` protocol
| `zipkin.endpointAddress` | string | Set the Zipkin server address to send traces to. This should include the protocol (http:// or https://) on the endpoint.

##### `samplingRate`

`samplingRate` is used to enable or disable the tracing. The valid range of `samplingRate` is between `0` and `1` inclusive. The sampling rate determines whether a trace span should be sampled or not based on value. 

`samplingRate : "1"` samples all traces. By default, the sampling rate is (0.0001), or 1 in 10,000 traces.

To disable the sampling rate, set `samplingRate : "0"` in the configuration.

##### `otel`

The OpenTelemetry (`otel`) endpoint can also be configured via an environment variable. The presence of the `OTEL_EXPORTER_OTLP_ENDPOINT` environment variable
turns on tracing for the sidecar.

| Environment Variable | Description |
|----------------------|-------------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Sets the Open Telemetry (OTEL) server address, turns on tracing |
| `OTEL_EXPORTER_OTLP_INSECURE` | Sets the connection to the endpoint as unencrypted (true/false) |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | Transport protocol (`grpc`, `http/protobuf`, `http/json`) |

See [Observability distributed tracing]({{< ref "tracing-overview.md" >}}) for more information.

#### Metrics

The `metrics` section under the `Configuration` spec can be used to enable or disable metrics for an application.

The `metrics` section contains the following properties:

```yml
metrics:
  enabled: true
  rules: []
  latencyDistributionBuckets: []
  http:
    increasedCardinality: true
    pathMatching:
      - /items
      - /orders/{orderID}
      - /orders/{orderID}/items/{itemID}
      - /payments/{paymentID}
      - /payments/{paymentID}/status
      - /payments/{paymentID}/refund
      - /payments/{paymentID}/details
    excludeVerbs: false
```

In the examples above, the path filter `/orders/{orderID}/items/{itemID}` would return _a single metric count_ matching all the `orderID`s and all the `itemID`s, rather than multiple metrics for each `itemID`. For more information, see [HTTP metrics path matching]({{< ref "metrics-overview.md#http-metrics-path-matching" >}})

The following table lists the properties for metrics:

| Property                     | Type    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`                    | boolean | When set to true, the default, enables metrics collection and the metrics endpoint.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `rules`                      | array   | Named rule to filter metrics. Each rule contains a set of `labels` to filter on and a `regex` expression to apply to the metrics path.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `latencyDistributionBuckets` | array   | Array of latency distribution buckets in milliseconds for latency metrics histograms.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `http.increasedCardinality`  | boolean | When set to `true` (default), in the Dapr HTTP server each request path causes the creation of a new "bucket" of metrics. This can cause issues, including excessive memory consumption, when there many different requested endpoints (such as when interacting with RESTful APIs).<br> To mitigate high memory usage and egress costs associated with [high cardinality metrics]({{< ref "metrics-overview.md#high-cardinality-metrics" >}}) with the HTTP server, you should set the `metrics.http.increasedCardinality` property to `false`. |
| `http.pathMatching`          | array   | Array of paths for path matching, allowing users to define matching paths to manage cardinality.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `http.excludeVerbs`          | boolean | When set to true (default is false), the Dapr HTTP server ignores each request HTTP verb when building the method metric label.                                                                                                                                                                                                                                                                                                                                                                                                                  |

To further help manage cardinality, path matching allows you to match specified paths according to defined patterns, reducing the number of unique metrics paths and thus controlling metric cardinality. This feature is particularly useful for applications with dynamic URLs, ensuring that metrics remain meaningful and manageable without excessive memory consumption. 

Using rules, you can set regular expressions for every metric exposed by the Dapr sidecar. For example:

```yml
metrics:
  enabled: true
  rules:
    - name: dapr_runtime_service_invocation_req_sent_total
      labels:
      - name: method
        regex:
          "orders/": "orders/.+"
```

See [metrics documentation]({{< ref "metrics-overview.md" >}}) for more information.

#### Logging

The `logging` section under the `Configuration` spec is used to configure how logging works in the Dapr Runtime.

The `logging` section contains the following properties:

```yml
logging:
  apiLogging:
    enabled: false
    obfuscateURLs: false
    omitHealthChecks: false
```

The following table lists the properties for logging:

| Property     | Type   | Description |
|--------------|--------|-------------|
| `apiLogging.enabled` | boolean | The default value for the `--enable-api-logging` flag for `daprd` (and the corresponding `dapr.io/enable-api-logging` annotation): the value set in the Configuration spec is used as default unless a `true` or `false` value is passed to each Dapr Runtime. Default: `false`.
| `apiLogging.obfuscateURLs` | boolean | When enabled, obfuscates the values of URLs in HTTP API logs (if enabled), logging the abstract route name rather than the full path being invoked, which could contain Personal Identifiable Information (PII). Default: `false`.
| `apiLogging.omitHealthChecks` | boolean | If `true`, calls to health check endpoints (e.g. `/v1.0/healthz`) are not logged when API logging is enabled. This is useful if those calls are adding a lot of noise in your logs. Default: `false`

See [logging documentation]({{< ref "logs.md" >}}) for more information.

#### Middleware

Middleware configuration sets named HTTP pipeline middleware handlers. The `httpPipeline` and the `appHttpPipeline` section under the `Configuration` spec contain the following properties:

```yml
httpPipeline: # for incoming http calls
  handlers:
    - name: oauth2
      type: middleware.http.oauth2
    - name: uppercase
      type: middleware.http.uppercase
appHttpPipeline: # for outgoing http calls
  handlers:
    - name: oauth2
      type: middleware.http.oauth2
    - name: uppercase
      type: middleware.http.uppercase
```

The following table lists the properties for HTTP handlers:

| Property | Type   | Description |
|----------|--------|-------------|
| `name`     | string | Name of the middleware component
| `type`     | string | Type of middleware component

See [Middleware pipelines]({{< ref "middleware.md" >}}) for more information.

#### Name resolution component

You can set name resolution components to use within the configuration file. For example, to set the `spec.nameResolution.component` property to `"sqlite"`, pass configuration options in the `spec.nameResolution.configuration` dictionary as shown below.

This is a basic example of a configuration resource:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration 
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "sqlite"
    version: "v1"
    configuration:
      connectionString: "/home/user/.dapr/nr.db"
```

For more information, see:
- [The name resolution component documentation]({{< ref supported-name-resolution >}}) for more examples.
- [The Configuration file documentation]({{< ref configuration-schema.md >}}) to learn more about how to configure name resolution per component.

#### Scope secret store access

See the [Scoping secrets]({{< ref "secret-scope.md" >}}) guide for information and examples on how to scope secrets to an application.

#### Access Control allow lists for building block APIs

See the guide for [selectively enabling Dapr APIs on the Dapr sidecar]({{< ref "api-allowlist.md" >}}) for information and examples on how to set access control allow lists (ACLs) on the building block APIs lists.

#### Access Control allow lists for service invocation API

See the [Allow lists for service invocation]({{< ref "invoke-allowlist.md" >}}) guide for information and examples on how to set allow lists with ACLs which use the service invocation API.

#### Disallow usage of certain component types

Using the `components.deny` property in the `Configuration` spec you can specify a denylist of component types that cannot be initialized.

For example, the configuration below disallows the initialization of components of type `bindings.smtp` and `secretstores.local.file`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
spec: 
  components:
    deny:
      - bindings.smtp
      - secretstores.local.file
```

Optionally, you can specify a version to disallow by adding it at the end of the component name. For example, `state.in-memory/v1` disables initializing components of type `state.in-memory` and version `v1`, but does not disable a (hypothetical) `v2` version of the component.

{{% alert title="Note" color="primary" %}}
 When you add the component type `secretstores.kubernetes` to the denylist, Dapr forbids the creation of _additional_ components of type `secretstores.kubernetes`. 

 However, it does not disable the built-in Kubernetes secret store, which is:
 - Created by Dapr automatically
 - Used to store secrets specified in Components specs
 
 If you want to disable the built-in Kubernetes secret store, you need to use the `dapr.io/disable-builtin-k8s-secret-store` [annotation]({{< ref arguments-annotations-overview.md >}}).
{{% /alert %}} 

#### Turning on preview features

See the [preview features]({{< ref "preview-features.md" >}}) guide for information and examples on how to opt-in to preview features for a release. 

Enabling preview features unlock new capabilities to be added for dev/test, since they still need more time before becoming generally available (GA) in the runtime.

### Example sidecar configuration

The following YAML shows an example configuration file that can be applied to an applications' Dapr sidecar.

```yml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
  namespace: default
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

## Control plane configuration

A single configuration file called `daprsystem` is installed with the Dapr control plane system services that applies global settings. 

> **This is only set up when Dapr is deployed to Kubernetes.**

### Control plane configuration settings

A Dapr control plane configuration contains the following sections:

- [`mtls`](#mtls-mutual-tls) for mTLS (Mutual TLS)

### mTLS (Mutual TLS)

The `mtls` section contains properties for mTLS.

| Property         | Type   | Description |
|------------------|--------|-------------|
| `enabled`          | bool   | If true, enables mTLS for communication between services and apps in the cluster.
| `allowedClockSkew` | string | Allowed tolerance when checking the expiration of TLS certificates, to allow for clock skew. Follows the format used by [Go's time.ParseDuration](https://pkg.go.dev/time#ParseDuration). Default is `15m` (15 minutes).
| `workloadCertTTL`  | string | How long a certificate TLS issued by Dapr is valid for. Follows the format used by [Go's time.ParseDuration](https://pkg.go.dev/time#ParseDuration). Default is `24h` (24 hours).
| `sentryAddress`  | string | Hostname port address for connecting to the Sentry server. |
| `controlPlaneTrustDomain` | string | Trust domain for the control plane. This is used to verify connection to control plane services. |
| `tokenValidators` | array | Additional Sentry token validators to use for authenticating certificate requests. |

See the [mTLS how-to]({{< ref "mtls.md" >}}) and [security concepts]({{< ref "security-concept.md" >}}) for more information.

### Example control plane configuration

```yaml
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

## Next steps

{{< button text="Learn about concurrency and rate limits" page="control-concurrency" >}}
