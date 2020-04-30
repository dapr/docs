# Set up Azure Monitor to search logs and collect metrics

This document describes how to enable Dapr metrics and logs with Azure Monitor for Azure Kubernetes Service (AKS).

## Prerequisites

- [Azure Kubernetes Service](https://docs.microsoft.com/en-us/azure/aks/)
- [Enable Azure Monitor For containers in AKS](https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-overview)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Helm 3](https://helm.sh/)

## Contents

  - [Enable Prometheus metric scrape using config map](#enable-prometheus-metric-scrape-using-config-map)
  - [Install Dapr with JSON formatted logs](#install-dapr-with-json-formatted-logs)
  - [Search metrics and logs with Azure Monitor](#Search-metrics-and-logs-with-azure-monitor)

## Enable Prometheus metric scrape using config map

1. Make sure that omsagnets are running

```bash
$ kubectl get pods -n kube-system
NAME                                                              READY   STATUS    RESTARTS   AGE
...
omsagent-75qjs                                                    1/1     Running   1          44h
omsagent-c7c4t                                                    1/1     Running   0          44h
omsagent-rs-74f488997c-dshpx                                      1/1     Running   1          44h
omsagent-smtk7                                                    1/1     Running   1          44h
...
```

2. Apply config map to enable Prometheus metrics endpoint scrape.

You can use [azm-config-map.yaml](./azm-config-map.yaml) to enable prometheus metrics endpoint scrape.

If you installed Dapr to the different namespace, you need to change the `monitor_kubernetes_pod_namespaces` array values. For example;

```yaml
...
  prometheus-data-collection-settings: |-
    [prometheus_data_collection_settings.cluster]
        interval = "1m"
        monitor_kubernetes_pods = true
        monitor_kubernetes_pods_namespaces = ["dapr-system", "default"]
    [prometheus_data_collection_settings.node]
        interval = "1m"
...
```

Apply config map:

```
kubectl apply -f ./azm-config.map.yaml
```

## Install Dapr with JSON formatted logs

1. Install Dapr with enabling JSON-formatted logs

```bash
helm install dapr dapr/dapr --namespace dapr-system --set global.logAsJson=true
```

2. Enable JSON formatted log in Dapr sidecar and add Prometheus annotations.

> Note: OMS Agent scrapes the metrics only if replicaset has Prometheus annotations.

Add `dapr.io/log-as-json: "true"` annotation to your deployment yaml.

Example:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pythonapp
  namespace: default
  labels:
    app: python
spec:
  replicas: 1
  selector:
    matchLabels:
      app: python
  template:
    metadata:
      labels:
        app: python
      annotations:
        dapr.io/enabled: "true"
        dapr.io/id: "pythonapp"
        dapr.io/log-as-json: "true"
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        prometheus.io/path: "/"

...
```

## Search metrics and logs with Azure Monitor

1. Go to Azure Monitor

2. Search Dapr logs

Here is an example query, to parse JSON formatted logs and query logs from dapr system processes. 

```
ContainerLog
| extend parsed=parse_json(LogEntry)
| project Time=todatetime(parsed['time']), app_id=parsed['app_id'], scope=parsed['scope'],level=parsed['level'], msg=parsed['msg'], type=parsed['type'], ver=parsed['ver'], instance=parsed['instance']
| where level != ""
| sort by Time
```

3. Search metrics

This query, queries process_resident_memory_bytes Prometheus metrics for Dapr system processes and renders timecharts

```
InsightsMetrics
| where Namespace == "prometheus" and Name == "process_resident_memory_bytes"
| extend tags=parse_json(Tags)
| project TimeGenerated, Name, Val, app=tostring(tags['app'])
| summarize memInBytes=percentile(Val, 99) by bin(TimeGenerated, 1m), app 
| where app startswith "dapr-"
| render timechart
```

# References

* [Configure scraping of Prometheus metrics with Azure Monitor for containers](https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-prometheus-integration)
* [Configure agent data collection for Azure Monitor for containers](https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-agent-config)
* [Azure Monitor Query](https://docs.microsoft.com/en-us/azure/azure-monitor/log-query/query-language)
