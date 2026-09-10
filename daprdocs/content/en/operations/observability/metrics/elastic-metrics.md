---
type: docs
title: "How-To: Set up Elastic to collect Dapr metrics"
linkTitle: "Elastic"
weight: 8000
description: "Scrape Dapr's Prometheus metrics endpoint into Elastic with the Elastic Distribution of OpenTelemetry Collector"
---

The [Elastic Distribution of OpenTelemetry (EDOT) Collector](https://www.elastic.co/docs/reference/opentelemetry/edot-collector) scrapes Dapr's [Prometheus metrics endpoint]({{% ref "metrics-overview.md" %}}) with its `prometheus` receiver and writes to Elasticsearch. EDOT is the Elastic Agent running in `otel` mode, reading a standard OpenTelemetry Collector configuration.

## Prerequisites

- [Dapr installed on Kubernetes]({{% ref "kubernetes-deploy.md" %}})
- An Elasticsearch endpoint and API key, from either Elastic Cloud or a self-managed deployment
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

## Create the credentials secret

```bash
kubectl create namespace dapr-monitoring

kubectl create secret generic elastic-secret -n dapr-monitoring \
  --from-literal=elastic_endpoint="https://YOUR_DEPLOYMENT.es.YOUR_REGION.cloud.es.io:443" \
  --from-literal=elastic_api_key="YOUR_API_KEY"
```

## Annotate your applications

The `dapr-sidecars` scrape job keeps pods carrying both of these annotations, so set them on each pod template:

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/enable-metrics: "true"
```

## Deploy the collector

Copy the `dapr-sidecars` and `dapr` scrape jobs from the `values.yaml` file in [How-To: Observe metrics with Prometheus]({{% ref "prometheus.md" %}}) into the `scrape_configs` block below, doubling `$` to `$$` so the collector's environment expansion leaves the relabel capture groups intact.

Save as `edot-metrics.yaml`:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: edot-metrics
  namespace: dapr-monitoring
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: edot-metrics
rules:
  - apiGroups: [""]
    resources: ["pods", "nodes", "namespaces", "endpoints", "services"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: edot-metrics
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: edot-metrics
subjects:
  - kind: ServiceAccount
    name: edot-metrics
    namespace: dapr-monitoring
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: edot-metrics-config
  namespace: dapr-monitoring
data:
  collector.yaml: |
    receivers:
      prometheus/dapr:
        config:
          scrape_configs:
            # Paste the `dapr-sidecars` and `dapr` jobs here, from
            # https://docs.dapr.io/operations/observability/metrics/prometheus/
            # Replace each `${1}` with `$${1}`.
    processors:
      batch: {}
      cumulativetodelta: {}
    exporters:
      elasticsearch/otel:
        endpoints:
          - "${env:ELASTIC_ENDPOINT}"
        api_key: "${env:ELASTIC_API_KEY}"
        mapping:
          mode: otel
    service:
      pipelines:
        metrics:
          receivers: [prometheus/dapr]
          processors: [cumulativetodelta, batch]
          exporters: [elasticsearch/otel]
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: edot-metrics
  namespace: dapr-monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: edot-metrics
  template:
    metadata:
      labels:
        app: edot-metrics
    spec:
      serviceAccountName: edot-metrics
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
          volumeMounts:
            - name: conf
              mountPath: /conf
      volumes:
        - name: conf
          configMap:
            name: edot-metrics-config
```

```bash
kubectl apply -f edot-metrics.yaml
```

{{% alert title="Note" color="warning" %}}
`cumulativetodelta` is required: Dapr's histograms are cumulative, and the Elasticsearch exporter accepts only delta temporality.
{{% /alert %}}

## Verify

Confirm the scrape job started:

```bash
kubectl logs -n dapr-monitoring -l app=edot-metrics | grep "Scrape job added"
```

Query Elasticsearch for a Dapr metric:

```bash
curl -H "Authorization: ApiKey YOUR_API_KEY" \
  "https://YOUR_DEPLOYMENT.es.YOUR_REGION.cloud.es.io/.ds-metrics-*/_count" \
  -H 'Content-Type: application/json' \
  -d '{"query":{"exists":{"field":"metrics.dapr_http_server_latency"}}}'
```

## Related links

- [Configure metrics]({{% ref "metrics-overview.md" %}})
- [How-To: Observe metrics with Prometheus]({{% ref "prometheus.md" %}})
- [Dapr traces with Elastic]({{% ref "open-telemetry-collector-elastic.md" %}})
- [EDOT Collector: configure metrics collection](https://www.elastic.co/docs/reference/edot-collector/config/configure-metrics-collection)
