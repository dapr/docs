---
type: docs
title: "Using the Elastic Distribution of OpenTelemetry Collector to collect traces to send to Elastic"
linkTitle: "Using the Elastic OpenTelemetry Collector"
weight: 1100
description: "How to push trace events to Elastic, using the Elastic Distribution of OpenTelemetry Collector"
---

The [Elastic Distribution of OpenTelemetry (EDOT) Collector](https://www.elastic.co/docs/reference/opentelemetry/edot-collector) is the Elastic Agent running in `otel` mode, reading a standard OpenTelemetry Collector configuration. This guide walks through pushing Dapr traces to Elastic through it.

## Prerequisites

- [Install Dapr on Kubernetes]({{% ref kubernetes %}})
- An [Elastic](https://www.elastic.co/elasticsearch) endpoint and API key, from either [Elastic Cloud](https://www.elastic.co/cloud) or a self-managed deployment
- [kubectl access to the cluster](https://kubernetes.io/docs/tasks/tools/)

## Installation

### Create the credentials secret

Copy the Elastic endpoint and API key from your Elastic instance and run the following commands in your cluster:

```bash
kubectl create namespace dapr-monitoring

kubectl create secret generic elastic-secret -n dapr-monitoring \
  --from-literal=elastic_endpoint="https://YOUR_DEPLOYMENT.es.YOUR_REGION.cloud.es.io:443" \
  --from-literal=elastic_api_key="YOUR_API_KEY"
```

### Deploy the Elastic Distribution of OpenTelemetry Collector

Save the following as `edot-collector.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: edot-config
  namespace: dapr-monitoring
data:
  collector.yaml: |
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    processors:
      batch: {}
    exporters:
      elasticsearch/otel:
        endpoints:
          - "${env:ELASTIC_ENDPOINT}"
        api_key: "${env:ELASTIC_API_KEY}"
        mapping:
          mode: otel
    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [batch]
          exporters: [elasticsearch/otel]
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: edot-collector
  namespace: dapr-monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: edot-collector
  template:
    metadata:
      labels:
        app: edot-collector
    spec:
      containers:
        - name: agent
          image: docker.elastic.co/elastic-agent/elastic-agent:9.5.3
          args: ["--config=/conf/collector.yaml"]
          env:
            - name: ELASTIC_AGENT_OTEL
              value: "true"
            - name: ELASTIC_ENDPOINT
              valueFrom:
                secretKeyRef:
                  name: elastic-secret
                  key: elastic_endpoint
            - name: ELASTIC_API_KEY
              valueFrom:
                secretKeyRef:
                  name: elastic-secret
                  key: elastic_api_key
          ports:
            - containerPort: 4317
              name: otlp-grpc
            - containerPort: 4318
              name: otlp-http
          volumeMounts:
            - name: conf
              mountPath: /conf
      volumes:
        - name: conf
          configMap:
            name: edot-config
---
apiVersion: v1
kind: Service
metadata:
  name: edot-collector
  namespace: dapr-monitoring
spec:
  selector:
    app: edot-collector
  ports:
    - name: otlp-grpc
      port: 4317
      targetPort: 4317
    - name: otlp-http
      port: 4318
      targetPort: 4318
```

{{% alert title="Note" color="primary" %}}
`ELASTIC_AGENT_OTEL: "true"` puts the Elastic Agent into `otel` mode. Without it the container starts as a conventional Elastic Agent and does not open an OTLP port.
{{% /alert %}}

Apply the resources to your cluster:

```bash
kubectl apply -f edot-collector.yaml
```

### Set up Dapr to send traces to the collector

Create a Configuration resource that points to your Elastic instance.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  tracing:
    samplingRate: "1"
    otel:
      endpointAddress: "edot-collector.dapr-monitoring.svc:4317"
      protocol: grpc
      isSecure: false   # in-cluster connection to the collector; the collector uses HTTPS to Elastic
```

Apply this Configuration resource to your cluster with the following:

```bash
kubectl apply -f appconfig.yaml
```

Reference the configuration from each application deployment by adding an annotation to the pod specification, then restart it so the sidecar picks up the change:

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "myapp"
  dapr.io/config: "appconfig"
```

## Verify the installation

Open your Elastic deployment and go to **Observability > APM > Traces**. Each Dapr application appears as a service named after its `dapr.io/app-id`.

## Related links/References

- [Dapr metrics with Elastic]({{% ref "elastic-metrics.md" %}})
- [Dapr logs with Elastic]({{% ref "elastic-logs.md" %}})
- [Elastic Distribution of OpenTelemetry Collector](https://www.elastic.co/docs/reference/opentelemetry/edot-collector)
- [Elastic Agent in `otel` mode](https://www.elastic.co/docs/reference/fleet/otel-agent)
