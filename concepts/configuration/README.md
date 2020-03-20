# Configuration

Dapr configuration is a configuration file (in local mode) or a Kubernetes configuration object (in Kubernetes mode). A Dapr sidecar can apply a configuration by using a ```dapr.io/config``` annotation (in Kubernetes mode) or by using a ```--config``` switch with ```dapr run```.

A Dapr configuration configures:

* [distributed tracing](../observability/traces.md)
* [custom pipeline](../middleware/README.md)
