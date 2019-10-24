# Distributed Tracing 

Dapr uses OpenTelemetry (previously known as OpenCensus) for distributed traces and metrics collection. OpenTelemetry supports various backends including [Azure Monitor](https://azure.microsoft.com/en-us/services/monitor/), [Datadog](https://www.datadoghq.com), [Instana](https://www.instana.com), [Jaeger](https://www.jaegertracing.io/), [SignalFX](https://www.signalfx.com/), [Stackdriver](https://cloud.google.com/stackdriver), [Zipkin](https://zipkin.io) and others. 

![Tracing](../../images/tracing.png)

# Tracing Design

Dapr adds a HTTP/gRPC middleware to the Dapr sidecar. The middleware intercepts all Dapr and application traffic and automatically injects correlation IDs to trace distributed transactions. This design has several benefits:

* No need for code instrumentation. All traffic is automatically traced (with configurable tracing levels).
* Consistent tracing behavior across microservices. Tracing a configured and managed on Dapr sidecar so that it remains consistent across services made by different teams and potentially written in different programming languages.
* Configurable and extensible. By leveraging OpenTelemetry, Dapr tracing can be configured to work with popular tracing backends, including custom backends a customer may have.

# Correlation ID

For HTTP requests, Dapr injects a **X-Correlation-ID** header to requests. For gRPC calls, Dapr inserts a **X-Correlation-ID** as a field of a **header** metadata. When a request arrives without an correlation ID, Dapr creates a new one. Otherwise, it passes the correlation ID along the call chain.

# Configuration

Dapr tracing is configured by a configuration file (in local mode) or a Kubernetes configuration object (in Kubernetes mode). For example, to define a Zipkin exporter, define the following configuration object:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: zipkin
spec:
  tracing:
    enabled: true
    exporterType: zipkin
    exporterAddress: "http://zipkin.default.svc.cluster.local:9411/api/v2/spans"
    expandParams: true
    includeBody: true
```

Please see the [References](#references) section for more details on how to configure tracing on local environment and Kubernetes environment.

# References
* [How-To: Set Up Distributed Tracing](../../howto/diagnose-with-tracing/README.md)

