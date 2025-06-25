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

## Configuring metrics for error codes

You can enable additional metrics for [Dapr API error codes](https://docs.dapr.io/reference/api/error_codes/) by setting `spec.metrics.recordErrorCodes` to `true`. Dapr APIs which communicate back to their caller may return standardized error codes. [A new metric called `error_code_total` is recorded]({{< ref errors-overview.md >}}), which allows monitoring of error codes triggered by application, code, and category. See [the `errorcodes` package](https://github.com/dapr/dapr/blob/master/pkg/messages/errorcodes/errorcodes.go) for specific codes and categories.

Example configuration:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  metrics:
    enabled: true
    recordErrorCodes: true
```

Example metric:
```json
{
  "app_id": "publisher-app",
  "category": "state",
  "dapr_io_enabled": "true",
  "error_code": "ERR_STATE_STORE_NOT_CONFIGURED",
  "instance": "10.244.1.64:9090",
  "job": "kubernetes-service-endpoints",
  "namespace": "my-app",
  "node": "my-node",
  "service": "publisher-app-dapr"
}
```

## Optimizing HTTP metrics reporting with path matching

When invoking Dapr using HTTP, metrics are created for each requested method by default. This can result in a high number of metrics, known as high cardinality, which can impact memory usage and CPU.

Path matching allows you to manage and control the cardinality of HTTP metrics in Dapr. This is an aggregation of metrics, so rather than having a metric for each event, you can reduce the number of metrics events and report an overall number. [Learn more about how to set the cardinality in configuration]({{< ref "configuration-overview.md#metrics" >}}).  

This configuration is opt-in and is enabled via the Dapr configuration `spec.metrics.http.pathMatching`. When defined, it enables path matching, which standardizes specified paths for both metrics paths. This reduces the number of unique metrics paths, making metrics more manageable and reducing resource consumption in a controlled way.  

When `spec.metrics.http.pathMatching` is combined with the `increasedCardinality` flag set to `false`, non-matched paths are transformed into a catch-all bucket to control and limit cardinality, preventing unbounded path growth. Conversely, when `increasedCardinality` is `true` (the default), non-matched paths are passed through as they normally would be, allowing for potentially higher cardinality but preserving the original path data. 

### Examples of Path Matching in HTTP Metrics

The following examples demonstrate how to use the Path Matching API in Dapr for managing HTTP metrics. On each example, the metrics are collected from 5 HTTP requests to the `/orders` endpoint with different order IDs. By adjusting cardinality and utilizing path matching, you can fine-tune metric granularity to balance detail and resource efficiency.

These examples illustrate the cardinality of the metrics, highlighting that high cardinality configurations result in many entries, which correspond to higher memory usage for handling metrics. For simplicity, the following example focuses on a single metric: `dapr_http_server_request_count`. 

#### Low cardinality with path matching (Recommendation)

Configuration:
```yaml
http:
  increasedCardinality: false
  pathMatching:
    - /orders/{orderID}
```

Metrics generated:
```
# matched paths
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/{orderID}",status="200"} 5
# unmatched paths
dapr_http_server_request_count{app_id="order-service",method="GET",path="",status="200"} 1
```

With low cardinality and path matching configured, you get the best of both worlds by grouping the metrics for the important endpoints without compromising the cardinality. This approach helps avoid high memory usage and potential security issues.

#### Low cardinality without path matching

Configuration:

```yaml
http:
  increasedCardinality: false
```
Metrics generated:
```
dapr_http_server_request_count{app_id="order-service",method="GET", path="",status="200"} 5
```

In low cardinality mode, the path, which is the main source of unbounded cardinality, is dropped. This results in metrics that primarily indicate the number of requests made to the service for a given HTTP method, but without any information about the paths invoked. 


#### High cardinality with path matching

Configuration:
```yaml
http:
  increasedCardinality: true
  pathMatching:
    - /orders/{orderID}
```

Metrics generated:
```
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/{orderID}",status="200"} 5
```

This example results from the same HTTP requests as the example above, but with path matching configured for the path `/orders/{orderID}`. By using path matching, you achieve reduced cardinality by grouping the metrics based on the matched path.

#### High Cardinality without path matching

Configuration:
```yaml
http:
  increasedCardinality: true
```

Metrics generated:
```
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/1",status="200"} 1
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/2",status="200"} 1
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/3",status="200"} 1
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/4",status="200"} 1
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/5",status="200"} 1
```

For each request, a new metric is created with the request path. This process continues for every request made to a new order ID, resulting in unbounded cardinality since the IDs are ever-growing.


### HTTP metrics exclude verbs

The `excludeVerbs` option allows you to exclude specific HTTP verbs from being reported in the metrics. This can be useful in high-performance applications where memory savings are critical.

### Examples of excluding HTTP verbs in metrics

The following examples demonstrate how to exclude HTTP verbs in Dapr for managing HTTP metrics.

#### Default - Include HTTP verbs

Configuration:
```yaml
http:
  excludeVerbs: false
```

Metrics generated:
```
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders",status="200"} 1
dapr_http_server_request_count{app_id="order-service",method="POST",path="/orders",status="200"} 1
```

In this example, the HTTP method is included in the metrics, resulting in a separate metric for each request to the `/orders` endpoint.

#### Exclude HTTP verbs

Configuration:
```yaml
http:
  excludeVerbs: true
```

Metrics generated:
```
dapr_http_server_request_count{app_id="order-service",method="",path="/orders",status="200"} 2
```

In this example, the HTTP method is excluded from the metrics, resulting in a single metric for all requests to the `/orders` endpoint.

## Configuring custom latency histogram buckets

Dapr uses cumulative histogram metrics to group latency values into buckets, where each bucket contains:
- A count of the number of requests with that latency
- All the requests with lower latency

### Using the default latency bucket configurations 

By default, Dapr groups request latency metrics into the following buckets:

```
1, 2, 3, 4, 5, 6, 8, 10, 13, 16, 20, 25, 30, 40, 50, 65, 80, 100, 130, 160, 200, 250, 300, 400, 500, 650, 800, 1000, 2000, 5000, 10000, 20000, 50000, 100000
```

Grouping latency values in a cumulative fashion allows buckets to be used or dropped as needed for increased or decreased granularity of data.
For example, if a request takes 3ms, it's counted in the 3ms bucket, the 4ms bucket, the 5ms bucket, and so on.
Similarly, if a request takes 10ms, it's counted in the 10ms bucket, the 13ms bucket, the 16ms bucket, and so on.
After these two requests have completed, the 3ms bucket has a count of 1 and the 10ms bucket has a count of 2, since both the 3ms and 10ms requests are included here. 

This shows up as follows:

|1|2|3|4|5|6|8|10|13|16|20|25|30|40|50|65|80|100|130|160| ..... | 100000 |
|-|-|-|-|-|-|-|--|--|--|--|--|--|--|--|--|--|---|---|---|-------|--------|
|0|0|1|1|1|1|1| 2| 2| 2| 2| 2| 2| 2| 2| 2| 2| 2 | 2 | 2 | ..... | 2      |


The default number of buckets works well for most use cases, but can be adjusted as needed. Each request creates 34 different metrics, leaving this value to grow considerably for a large number of applications.
More accurate latency percentiles can be achieved by increasing the number of buckets. However, a higher number of buckets increases the amount of memory used to store the metrics, potentially negatively impacting your monitoring system. 

It is recommended to keep the number of latency buckets set to the default value, unless you are seeing unwanted memory pressure in your monitoring system. Configuring the number of buckets allows you to choose applications where:
- You want to see more detail with a higher number of buckets
- Broader values are sufficient by reducing the buckets

Take note of the default latency values your applications are producing before configuring the number buckets.
### Customizing latency buckets to your scenario

Tailor the latency buckets to your needs, by modifying the `spec.metrics.latencyDistributionBuckets` field in the [Dapr configuration spec]({{< ref configuration-schema.md >}}) for your application(s).

For example, if you aren't interested in extremely low latency values (1-10ms), you can group them in a single 10ms bucket. Similarly, you can group the high values in a single bucket (1000-5000ms), while keeping more detail in the middle range of values that you are most interested in.

The following Configuration spec example replaces the default 34 buckets with 11 buckets, giving a higher level of granularity in the middle range of values:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: custom-metrics
spec:
    metrics:
        enabled: true
        latencyDistributionBuckets: [10, 25, 40, 50, 70, 100, 150, 200, 500, 1000, 5000]
```

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