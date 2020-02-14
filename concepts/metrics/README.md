# Metrics
Dapr exposes a [Prometheus](https://prometheus.io/) metrics endpoint that you can scrape to gain
a greater understanding of how Dapr is behaving and to setup alerts for specific conditions.

## Configuration
The metrics endpoint is enabled by default, you can disable it by passing the command line argument
`--enable-metrics false` to daprd.

The default metrics port is `9090`. This can be overridden by passing the command line argument
`--metrics-port` to darpd.

## Metrics
Dapr will expose metrics for Darp's HTTP pipeline, gPRC pipeline, Go runtime, metrics server and process.
> Note: The gRPC metrics are all initialized with zero values and are therefore immediately visible on the 
metrics endpoint. HTTP metrics are not zero initialized so will only become visible once a HTTP request has
passed through the HTTP pipeline.

## Prometheus
To consume these metrics you'll need to install Prometheus or something compatible with scraping Prometheus
metrics. Once installed, you can add your Dapr metrics endpoint as a target and it will start collecting the data.

## References

* [Prometheus Installation](https://github.com/helm/charts/tree/master/stable/prometheus-operator)

* [Prometheus on Kubernetes](https://github.com/coreos/kube-prometheus)

* [Prometheus Kubernetes Operator](https://github.com/helm/charts/tree/master/stable/prometheus-operator)
