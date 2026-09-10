---
type: docs
title: "How-To: Set up Elastic to search Dapr logs"
linkTitle: "Elastic"
weight: 4000
description: "Collect Dapr's JSON logs into Elastic with the Elastic Distribution of OpenTelemetry Collector"
---

Dapr writes [structured logs]({{% ref "logs.md" %}}) to stdout, so on Kubernetes they are ordinary container logs. The [Elastic Distribution of OpenTelemetry (EDOT) Collector](https://www.elastic.co/docs/reference/opentelemetry/edot-collector) collects them with its `filelog` receiver. EDOT is the Elastic Agent running in `otel` mode, reading a standard OpenTelemetry Collector configuration.

## Prerequisites

- [Dapr installed on Kubernetes]({{% ref "kubernetes-deploy.md" %}})
- An Elasticsearch endpoint and API key, from either Elastic Cloud or a self-managed deployment
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

## Enable JSON-formatted logs

Dapr logs in plain text by default. Turn on JSON output so the fields survive collection.

For the control plane, set `global.logAsJson` when installing:

```bash
helm upgrade --install dapr dapr/dapr \
  --namespace dapr-system --create-namespace \
  --set global.logAsJson=true
```

For each application, add the `dapr.io/log-as-json` annotation to the pod template:

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "myapp"
  dapr.io/log-as-json: "true"
```

## Deploy the collector

The `filelog` receiver reads log files from the node, so the collector runs as a DaemonSet with the host log paths mounted. Save the following as `edot-logs.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: edot-logs-config
  namespace: dapr-monitoring
data:
  collector.yaml: |
    receivers:
      filelog:
        include:
          - /var/log/pods/*/*/*.log
        exclude:
          - /var/log/pods/*edot-logs*/*/*.log
        start_at: end
        include_file_path: true
        retry_on_failure:
          enabled: true
        operators:
          - id: container-parser
            type: container
          - id: json-parser
            type: json_parser
            on_error: send_quiet
            parse_from: body
            parse_to: body
    processors:
      batch: {}
      k8s_attributes:
        passthrough: false
        filter:
          node_from_env_var: OTEL_K8S_NODE_NAME
        extract:
          metadata:
            - k8s.namespace.name
            - k8s.pod.name
            - k8s.container.name
            - k8s.deployment.name
            - k8s.node.name
    exporters:
      elasticsearch/otel:
        endpoints:
          - "${env:ELASTIC_ENDPOINT}"
        api_key: "${env:ELASTIC_API_KEY}"
        mapping:
          mode: otel
    service:
      pipelines:
        logs:
          receivers: [filelog]
          processors: [k8s_attributes, batch]
          exporters: [elasticsearch/otel]
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: edot-logs
  namespace: dapr-monitoring
spec:
  selector:
    matchLabels:
      app: edot-logs
  template:
    metadata:
      labels:
        app: edot-logs
    spec:
      serviceAccountName: edot-logs
      containers:
        - name: agent
          image: docker.elastic.co/elastic-agent/elastic-agent:9.5.3
          args: ["--config=/conf/collector.yaml"]
          securityContext:
            runAsUser: 0
          env:
            - name: ELASTIC_AGENT_OTEL
              value: "true"
            - name: OTEL_K8S_NODE_NAME
              valueFrom:
                fieldRef:
                  fieldPath: spec.nodeName
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
            - name: varlogpods
              mountPath: /var/log/pods
              readOnly: true
      volumes:
        - name: conf
          configMap:
            name: edot-logs-config
        - name: varlogpods
          hostPath:
            path: /var/log/pods
```

This reuses the `elastic-secret` created in the [metrics how-to]({{% ref "elastic-metrics.md" %}}). Create it first if you have not already, and add a `ServiceAccount` named `edot-logs` with a `ClusterRole` granting `get`, `list` and `watch` on pods, nodes and namespaces so `k8s_attributes` can enrich the records.

Apply it:

```bash
kubectl apply -f edot-logs.yaml
```

{{% alert title="Note" color="warning" %}}
The `json_parser` operator is required, and must come after the container parser.
{{% /alert %}}

## Related links

- [Logs]({{% ref "logs.md" %}})
- [Dapr metrics with Elastic]({{% ref "elastic-metrics.md" %}})
- [Dapr traces with Elastic]({{% ref "open-telemetry-collector-elastic.md" %}})
- [EDOT Collector: configure logs collection](https://www.elastic.co/docs/reference/edot-collector/config/configure-logs-collection)
