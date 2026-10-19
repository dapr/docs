---
type: docs
title: "How-To: Set up Elastic for Dapr logging"
linkTitle: "Elastic"
weight: 4000
description: "Collect Dapr's JSON logs into Elastic with the Elastic Distribution of OpenTelemetry Collector"
---

The [Elastic Distribution of OpenTelemetry (EDOT) Collector](https://www.elastic.co/docs/reference/opentelemetry/edot-collector) collects Dapr's stdout container logs with its `filelog` receiver. EDOT is the Elastic Agent running in `otel` mode, reading a standard OpenTelemetry Collector configuration.

## Prerequisites

- [Dapr installed on Kubernetes]({{% ref "kubernetes-deploy.md" %}})
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

### Enable JSON-formatted logs

Dapr logs in plain text by default. Turn on JSON output so the fields survive collection.

For the control plane, set `global.logAsJson` when installing Dapr via [Helm]({{% ref "kubernetes-deploy.md" %}}):

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

### Deploy the Elastic Distribution of OpenTelemetry Collector

The `filelog` receiver reads log files from the Kubernetes node, so the collector runs as a DaemonSet with the host log paths mounted. Save the following as `edot-logs.yaml`:

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
apiVersion: v1
kind: ServiceAccount
metadata:
  name: edot-logs
  namespace: dapr-monitoring
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: edot-logs
rules:
  - apiGroups: [""]
    resources: ["pods", "nodes", "namespaces"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: edot-logs
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: edot-logs
subjects:
  - kind: ServiceAccount
    name: edot-logs
    namespace: dapr-monitoring
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

{{% alert title="Note" color="warning" %}}
The `json_parser` operator is required, and must come after the container parser.
{{% /alert %}}

Apply the `edot-logs.yaml` file to the cluster:

```bash
kubectl apply -f edot-logs.yaml
```

## Related links/References

- [Logs]({{% ref "logs.md" %}})
- [Dapr metrics with Elastic]({{% ref "elastic-metrics.md" %}})
- [Dapr traces with Elastic]({{% ref "open-telemetry-collector-elastic.md" %}})
- [EDOT Collector: configure logs collection](https://www.elastic.co/docs/reference/edot-collector/config/configure-logs-collection)
