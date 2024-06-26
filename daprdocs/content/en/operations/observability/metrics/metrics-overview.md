---
type: docs
title: "Configure metrics"
linkTitle: "Overview"
weight: 4000
description: "Enable or disable Dapr metrics"
---

By default, each Dapr system process emits Go runtime/process metrics and has their own [Dapr metrics](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md).

## Prometheus endpoint

The Dapr sidecar exposes a [Prometheus](https://prometheus.io/)-compatible metrics endpoint that you can scrape to gain a greater understanding of how Dapr is behaving.

## Configuring metrics using the CLI

The metrics application endpoint is enabled by default. You can disable it by passing the command line argument `--enable-metrics=false`.

The default metrics port is `9090`. You can override this by passing the command line argument `--metrics-port` to daprd.

## Configuring metrics in Kubernetes

You can also enable/disable the metrics for a specific application by setting the `dapr.io/enable-metrics: "false"` annotation on your application deployment. With the metrics exporter disabled, daprd does not open the metrics listening port.

The following Kubernetes deployment example shows how metrics are explicitly enabled with the port specified as "9090".

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodeapp
  labels:
    app: node
spec:
  replicas: 1
  selector:
    matchLabels:
      app: node
  template:
    metadata:
      labels:
        app: node
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "nodeapp"
        dapr.io/app-port: "3000"
        dapr.io/enable-metrics: "true"
        dapr.io/metrics-port: "9090"
    spec:
      containers:
      - name: node
        image: dapriosamples/hello-k8s-node:latest
        ports:
        - containerPort: 3000
        imagePullPolicy: Always
```

## Configuring metrics using application configuration

You can also enable metrics via application configuration. To disable the metrics collection in the Dapr sidecars by default, set `spec.metrics.enabled` to `false`.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  metrics:
    enabled: false
```

## High cardinality metrics

When invoking Dapr using HTTP, the legacy behavior (and current default as of Dapr 1.13) is to create a separate "bucket" for each requested method. When working with RESTful APIs, this can cause very high cardinality, with potential negative impact on memory usage and CPU.

Dapr 1.13 introduces a new option for the Dapr Configuration resource `spec.metrics.http.increasedCardinality`: when set to `false`, it reports metrics for the HTTP server for each "abstract" method (for example, requesting from a state store) instead of creating a "bucket" for each concrete request path.

The default value of `spec.metrics.http.increasedCardinality` is `true` in Dapr 1.13, to maintain the same behavior as Dapr 1.12 and older. However, the value will change to `false` (low-cardinality metrics by default) in Dapr 1.14.

Setting `spec.metrics.http.increasedCardinality` to `false` is **recommended** to all Dapr users, to reduce resource consumption. The pre-1.13 behavior, which is used when the option is `true`, is considered legacy and is only maintained for users who have special requirements around backwards-compatibility.

## HTTP Metrics Path Matching 

Path matching allows you to manage and control the cardinality of HTTP metrics in Dapr. For details on how to set the cardinality in configuration see ({{< ref "configuration-overview.md#metrics" >}})  

This configuration is opt-in and is enabled via the Dapr configuration `spec.metrics.http.pathMatching`. When defined with ingress or egress paths, it enables path matching, which standardizes specified paths for both ingress and egress metrics. This reduces the number of unique metrics paths, making metrics more manageable and reducing resource consumption in a controlled way.  

When `spec.metrics.http.pathMatching` is combined with the `increasedCardinality` flag set to `false` (which is the default in v1.14), non-matched paths are transformed into a catch-all bucket to control and limit cardinality, preventing unbounded path growth. Conversely, when `increasedCardinality` is `true`, non-matched paths are passed through as they normally would be, allowing for potentially higher cardinality but preserving the original path data. 

### Examples of Path Matching in HTTP Metrics

Here are some examples demonstrating how to use the Path Matching API in Dapr for managing HTTP metrics. These examples illustrate the effects of different configurations on the `dapr_http_server_request_count` metric, showcasing combinations of low and high cardinality, with and without path matching.

- Low Cardinality Without Path Matching

Configuration:

```yaml
http:
  increasedCardinality: false
```

Metrics:
```
dapr_http_server_request_count{app_id="order-service",method="InvokeService/order-service",status="200"} 5
```

- Low Cardinality With Path Matching

Configuration:
```yaml
http:
  increasedCardinality: false
  pathMatching:
    ingress:
    - /orders/{orderID}
    egress:
    - /orders/{orderID}
```

Metrics:
```
# matched paths
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/{orderID}",status="200"} 4
# unmatched paths
dapr_http_server_request_count{app_id="order-service",method="GET",path="/",status="200"} 1
```

- High Cardinality Without Path Matching

Configuration:
```yaml
http:
  increasedCardinality: true
```

Metrics:
```
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/1234",status="200"} 1
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/12345",status="200"} 1
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/123456",status="200"} 1
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/1234567",status="200"} 1
```

- High Cardinality With Path Matching

Configuration:
```yaml
http:
  increasedCardinality: true
  ingress:
    - /orders/{orderID}
    egress:
    - /orders/{orderID}
```

Metrics:
```
dapr_http_server_request_count{app_id="order-service",method="POST",path="/orders",status="200"} 1
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/{orderID}",status="200"} 5
```

These examples highlight how path matching can significantly influence the granularity and manageability of your HTTP metrics in Dapr.

## Transform metrics with regular expressions

You can set regular expressions for every metric exposed by the Dapr sidecar to "transform" their values. [See a list of all Dapr metrics](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md).

The name of the rule must match the name of the metric that is transformed. The following example shows how to apply a regular expression for the label `method` in the metric `dapr_runtime_service_invocation_req_sent_total`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprConfig
spec:
  metrics:
    enabled: true
    http:
      increasedCardinality: true
    rules:
      - name: dapr_runtime_service_invocation_req_sent_total
        labels:
        - name: method
          regex:
            "orders/": "orders/.+"
```

When this configuration is applied, a recorded metric with the `method` label of `orders/a746dhsk293972nz` is replaced with `orders/`.

Using regular expressions to reduce metrics cardinality is considered legacy. We encourage all users to set `spec.metrics.http.increasedCardinality` to `false` instead, which is simpler to configure and offers better performance.

## References

* [Howto: Run Prometheus locally]({{< ref prometheus.md >}})
* [Howto: Set up Prometheus and Grafana for metrics]({{< ref grafana.md >}})
