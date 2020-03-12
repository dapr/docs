# Grafana Dashboard Templates

Dapr offers the below dashboard templates to monitor Dapr system component and sidecars. You can import the templates to your Grafana dashboard.

1. [Dapr System Service Dashboard](./dashboards/system-services-dashboard.json)
    - [Shows Dapr system component status](./img/system-service-dashboard.png) - dapr-operator, dapr-sidecar-injector, dapr-sentry, and dapr-placement

2. [Dapr Sidecar Dashboard](./dashboards/sidecar-dashboard.json)
    - [Shows Dapr Sidecar status](./img/sidecar-dashboard.png) - sidecar health/resources, throughput/latency of HTTP and gRPC, Actor, mTLS, etc.
