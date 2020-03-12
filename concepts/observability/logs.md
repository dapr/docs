# Logs

Dapr produces structured logs to stdout as a plain-text and JSON formatted log. By default, all Dapr processes console out plain text. In order to enable JSON-formatted logs, you need to add `--log-as-json` command flags when running dapr system processes. If you want to use search engine to search log, such as elastic search, and azure monitor, we recommend to use JSON-formatted logs which log collector and search engine can parse using the built-in JSON parser.

## Log schema

Dapr produces logs based on the below log schema.

| field | description       | example |
|-------|-------------------|---------|
| time  | ISO8601 timestamp | `2011-10-05T14:48:00.000Z` |
| level | Log Level (info/warn/debug/error) | `info` |
| type  | Log Type | `log` |
| msg   | Log message | `hello dapr!` |
| scope | Logging scope | `dapr.runtime` |
| instance | Container name | `dapr-pod-xxxxx` |
| app_id | Dapr App ID | `dapr-app` |
| ver | Dapr runtime version | `0.5.0` |

## Plain-text and JSON formatted logs

* Plain-text log
```bash
time="2020-03-11T17:08:48.303776-07:00" level=info msg="starting Dapr Runtime -- version 0.5.0-rc.2 -- commit v0.3.0-rc.0-155-g5dfcf2e" instance=dapr-pod-xxxx scope=dapr.runtime type=log ver=0.5.0-rc.2
time="2020-03-11T17:08:48.303913-07:00" level=info msg="log level set to: info" instance=dapr-pod-xxxx scope=dapr.runtime type=log ver=0.5.0-rc.2
```

* JSON formatted log
```json
{"instance":"dapr-pod-xxxx","level":"info","msg":"starting Dapr Runtime -- version 0.5.0-rc.2 -- commit v0.3.0-rc.0-155-g5dfcf2e","scope":"dapr.runtime","time":"2020-03-11T17:09:45.788005Z","type":"log","ver":"0.5.0-rc.2"}
{"instance":"dapr-pod-xxxx","level":"info","msg":"log level set to: info","scope":"dapr.runtime","time":"2020-03-11T17:09:45.788075Z","type":"log","ver":"0.5.0-rc.2"}
```

## Configuration


Dapr supports both plain-text and JSON formatted logs. Default format is plain-text. If you want to use plain-text with the search engine, you will not need to configure the special options.

To use JSON-formatted logs, you need to add additional option when you install Dapr and deploy your app. This document recommend to use JSON-formatted logs because most of collectors/search engines can parse it easily with the built-in parser.

### Install Dapr to your cluster using helm chart

You can enable JSON-formatted logs for Dapr system processes by adding `--set global.LogASJSON=true` option to helm command.

```bash
helm install dapr dapr/dapr --namespace dapr-system --set global.LogAsJSON=true
```

### Enable json formatted log in Dapr sidecar

You can enable JSON-formatted logs in Dapr sidecar by adding `dapr.io/log-as-json: "true"` annotation.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pythonapp
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

## Log collector

If you run Dapr in Kubernetes cluster, [Fluentd](https://www.fluentd.org/) is the most popular container log collector. You can use Fluentd with [json parser plugin](https://docs.fluentd.org/parser/json) to parse Dapr JSON formatted logs. This [how-to](../../howto/setup-monitoring-tools/setup-fluentd-es-kibana.md) shows how to configure the fleuntd in your cluster.

For Azure Kubernetes Service user, you can use the default OMS Agent to collect logs with Azure monitor without additional fluentd installation.

## Search engines

If you use [Fluentd](https://www.fluentd.org/), we recommend to use Elastic search and Kibana. This [how-to](../../howto/setup-monitoring-tools/setup-fluentd-es-kibana.md) shows how to set up elastic search and kibana in your kubernetes cluster.

For Azure Kubernetes Service user, you can use [Azure monitor for containers](https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-overview) without additional monitoring tools.

## References

- [How-to : Set up Fleuntd, Elastic search, and Kibana](../../howto/setup-monitoring-tools/setup-fluentd-es-kibana.md)
- [How-to : Set up Azure Monitor in Azure Kubernetes Service](../../howto/setup-monitoring-tools/setup-azure-monitor.md)