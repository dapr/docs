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
