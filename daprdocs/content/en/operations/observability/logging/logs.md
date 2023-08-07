---
type: docs
title: "Logs"
linkTitle: "Logs"
weight: 1000
description: "Understand Dapr logging"
---

Dapr produces structured logs to stdout, either in plain-text or JSON-formatted. By default, all Dapr processes (runtime, or sidecar, and all control plane services) write logs to the console (stdout) in plain-text. To enable JSON-formatted logging, you need to add the `--log-as-json` command flag when running Dapr processes.

{{% alert title="Note" color="primary" %}}
If you want to use a search engine such as Elastic Search or Azure Monitor to search the logs, it is strongly recommended to use JSON-formatted logs which the log collector and search engine can parse using the built-in JSON parser.
{{% /alert %}}

## Log schema

Dapr produces logs based on the following schema:

| Field | Description       | Example |
|-------|-------------------|---------|
| time  | ISO8601 Timestamp | `2011-10-05T14:48:00.000Z` |
| level | Log Level (info/warn/debug/error) | `info` |
| type  | Log Type | `log` |
| msg   | Log Message | `hello dapr!` |
| scope | Logging Scope | `dapr.runtime` |
| instance | Container Name | `dapr-pod-xxxxx` |
| app_id | Dapr App ID | `dapr-app` |
| ver | Dapr Runtime Version | `1.9.0` |

API logging may add other structured fields, as described in the [documentation for API logging]({{< ref "api-logs-troubleshooting.md" >}}).

## Plain text and JSON formatted logs

* Plain-text log examples

```bash
time="2022-11-01T17:08:48.303776-07:00" level=info msg="starting Dapr Runtime -- version 1.9.0 -- commit v1.9.0-g5dfcf2e" instance=dapr-pod-xxxx scope=dapr.runtime type=log ver=1.9.0
time="2022-11-01T17:08:48.303913-07:00" level=info msg="log level set to: info" instance=dapr-pod-xxxx scope=dapr.runtime type=log ver=1.9.0
```

* JSON-formatted log examples

```json
{"instance":"dapr-pod-xxxx","level":"info","msg":"starting Dapr Runtime -- version 1.9.0 -- commit v1.9.0-g5dfcf2e","scope":"dapr.runtime","time":"2022-11-01T17:09:45.788005Z","type":"log","ver":"1.9.0"}
{"instance":"dapr-pod-xxxx","level":"info","msg":"log level set to: info","scope":"dapr.runtime","time":"2022-11-01T17:09:45.788075Z","type":"log","ver":"1.9.0"}
```

## Log formats

Dapr supports printing either plain-text, the default, or JSON-formatted logs.

To use JSON-formatted logs, you need to add additional configuration options when you install Dapr and when deploy your apps. The recommendation is to use JSON-formatted logs because most log collectors and search engines can parse JSON more easily with built-in parsers.

## Enabling JSON logging with the Dapr CLI

When using the Dapr CLI to run an application, pass the `--log-as-json` option to enable JSON-formatted logs, for example:

```sh
dapr run \
  --app-id orderprocessing \
  --resources-path ./components/ \
  --log-as-json \
    -- python3 OrderProcessingService.py
```

## Enabling JSON logging in Kubernetes

The following steps describe how to configure JSON-formatted logs for Kubernetes

### Dapr control plane

All services in the Dapr control plane (such as `operator`, `sentry`, etc) support a `--log-as-json` option to enable JSON-formatted logging.

If you're deploying Dapr to Kubernetes using a Helm chart, you can enable JSON-formatted logs for Dapr system services by passing the `--set global.logAsJson=true` option; for example:

```bash
helm upgrade --install dapr \
  dapr/dapr \
  --namespace dapr-system \
  --set global.logAsJson=true
```

### Enable JSON-formatted log for Dapr sidecars

You can enable JSON-formatted logs in Dapr sidecars by adding the `dapr.io/log-as-json: "true"` annotation to the deployment, for example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pythonapp
  labels:
    app: python
spec:
  selector:
    matchLabels:
      app: python
  template:
    metadata:
      labels:
        app: python
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "pythonapp"
        # This enables JSON-formatted logging
        dapr.io/log-as-json: "true"
...
```

## API Logging

API logging enables you to see the API calls your application makes to the Dapr sidecar, to debug issues or monitor the behavior of your application. You can combine both Dapr API logging with Dapr log events.

See [configure and view Dapr Logs]({{< ref "logs-troubleshooting.md" >}}) and [configure and view Dapr API Logs]({{< ref "api-logs-troubleshooting.md" >}}) for more information.

## Log collectors

If you run Dapr in a Kubernetes cluster, [Fluentd](https://www.fluentd.org/) is a popular container log collector. You can use Fluentd with a [JSON parser plugin](https://docs.fluentd.org/parser/json) to parse Dapr JSON-formatted logs. This [how-to]({{< ref fluentd.md >}}) shows how to configure Fluentd in your cluster.

If you are using Azure Kubernetes Service, you can use the built-in agent to collect logs with Azure Monitor without needing to install Fluentd.

## Search engines

If you use [Fluentd](https://www.fluentd.org/), we recommend using Elastic Search and Kibana. This [how-to]({{< ref fluentd.md >}}) shows how to set up Elastic Search and Kibana in your Kubernetes cluster.

If you are using the Azure Kubernetes Service, you can use [Azure Monitor for containers](https://docs.microsoft.com/azure/azure-monitor/insights/container-insights-overview) without installing any additional monitoring tools. Also read [How to enable Azure Monitor for containers](https://docs.microsoft.com/azure/azure-monitor/insights/container-insights-onboard)

## References

- [How-to: Set up Fleuntd, Elastic search, and Kibana]({{< ref fluentd.md >}})
- [How-to: Set up Azure Monitor in Azure Kubernetes Service]({{< ref azure-monitor.md >}})
- [Configure and view Dapr Logs]({{< ref "logs-troubleshooting.md" >}})
- [Configure and view Dapr API Logs]({{< ref "api-logs-troubleshooting.md" >}})
