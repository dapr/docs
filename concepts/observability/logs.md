# Logs

Dapr produces structured logs to stdout either as a plain text or JSON formatted. By default, all Dapr processes (runtime and system services) write to console out in plain text. To enable JSON formatted logs, you need to add the `--log-as-json` command flag when running Dapr processes. 

If you want to use a search engine such as Elastic Search or Azure Monitor to search the logs, it is recommended to use JSON-formatted logs which the log collector and search engine can parse using the built-in JSON parser.

## Log schema

Dapr produces logs based on the following schema.

| Field | Description       | Example |
|-------|-------------------|---------|
| time  | ISO8601 Timestamp | `2011-10-05T14:48:00.000Z` |
| level | Log Level (info/warn/debug/error) | `info` |
| type  | Log Type | `log` |
| msg   | Log Message | `hello dapr!` |
| scope | Logging Scope | `dapr.runtime` |
| instance | Container Name | `dapr-pod-xxxxx` |
| app_id | Dapr App ID | `dapr-app` |
| ver | Dapr Runtime Version | `0.5.0` |

## Plain text and JSON formatted logs

* Plain text log examples
```bash
time="2020-03-11T17:08:48.303776-07:00" level=info msg="starting Dapr Runtime -- version 0.5.0-rc.2 -- commit v0.3.0-rc.0-155-g5dfcf2e" instance=dapr-pod-xxxx scope=dapr.runtime type=log ver=0.5.0-rc.2
time="2020-03-11T17:08:48.303913-07:00" level=info msg="log level set to: info" instance=dapr-pod-xxxx scope=dapr.runtime type=log ver=0.5.0-rc.2
```

* JSON formatted log examples
```json
{"instance":"dapr-pod-xxxx","level":"info","msg":"starting Dapr Runtime -- version 0.5.0-rc.2 -- commit v0.3.0-rc.0-155-g5dfcf2e","scope":"dapr.runtime","time":"2020-03-11T17:09:45.788005Z","type":"log","ver":"0.5.0-rc.2"}
{"instance":"dapr-pod-xxxx","level":"info","msg":"log level set to: info","scope":"dapr.runtime","time":"2020-03-11T17:09:45.788075Z","type":"log","ver":"0.5.0-rc.2"}
```

## Configurating plain text or JSON formatted logs

Dapr supports both plain text and JSON formatted logs. The default format is plain-text. If you want to use plain text with a search engine, you will not need to change any configuring options.

To use JSON formatted logs, you need to add additional configuration  when you install Dapr and deploy your app. The recommendation is to use JSONformatted logs because most log collectors and search engines can parse JSON more easily with built-in parsers.

## Configuring log format in Kubernetes
The following steps describe how to configure JSON formatted logs for Kubernetes

### Install Dapr to your cluster using the Helm chart

You can enable JSON formatted logs for Dapr system services by adding `--set global.logAsJson=true` option to Helm command.

```bash
helm install dapr dapr/dapr --namespace dapr-system --set global.logAsJson=true
```

### Enable JSON formatted log for Dapr sidecars 

You can enable JSON-formatted logs in Dapr sidecars activated by the Dapr sidecar-injector service by adding the `dapr.io/log-as-json: "true"` annotation to the deployment.

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
...
```

## Log collectors

If you run Dapr in a Kubernetes cluster, [Fluentd](https://www.fluentd.org/) is a popular container log collector. You can use Fluentd with a [json parser plugin](https://docs.fluentd.org/parser/json) to parse Dapr JSON formatted logs. This [how-to](../../howto/setup-monitoring-tools/setup-fluentd-es-kibana.md) shows how to configure the Fleuntd in your cluster.

If you are using the Azure Kubernetes Service, you can use the default OMS Agent to collect logs with Azure Monitor without needing to install Fluentd.

## Search engines

If you use [Fluentd](https://www.fluentd.org/), we recommend to using Elastic Search and Kibana. This [how-to](../../howto/setup-monitoring-tools/setup-fluentd-es-kibana.md) shows how to set up Elastic Search and Kibana in your Kubernetes cluster.

If you are using the Azure Kubernetes Service, you can use [Azure monitor for containers](https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-overview) without indstalling any additional monitoring tools. Also read [How to enable Azure Monitor for containers](https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-onboard)

## References

- [How-to : Set up Fleuntd, Elastic search, and Kibana](../../howto/setup-monitoring-tools/setup-fluentd-es-kibana.md)
- [How-to : Set up Azure Monitor in Azure Kubernetes Service](../../howto/setup-monitoring-tools/setup-azure-monitor.md)
