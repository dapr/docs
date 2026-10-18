---
type: docs
title: "Logs"
linkTitle: "Overview"
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

API logging may add other structured fields, as described in the [documentation for API logging]({{% ref "api-logs-troubleshooting.md" %}}).

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

## Log destinations and file rotation

By default, Dapr processes write logs to stdout. Starting with Dapr v1.19, the Dapr runtime (`daprd`) and the control plane services (`operator`, `placement`, `scheduler`, `sentry` and `sidecar-injector`) take these flags to choose where logs go, to rotate log files and to set the timestamp format.

| Flag | Description |
|------|-------------|
| `--log-outputs` | Comma-separated list of log destinations. Each entry is `stdout`, `stderr` or a file path. Default is `stdout`. |
| `--log-file` | Path to a file where logs are written. If you also set `--log-outputs`, the two lists are merged. |
| `--log-file-max-size` | Maximum size in megabytes of a log file before it is rotated. |
| `--log-file-max-backups` | Maximum number of rotated log files to keep. `0` keeps all rotated files. |
| `--log-file-max-age` | Maximum number of days to keep rotated log files. `0` keeps them regardless of age. |
| `--log-file-compression` | Compression for rotated log files: `none` (default) or `gzip`. |
| `--log-timestamp-format` | Format of the log timestamp, as a [Go time layout](https://pkg.go.dev/time#pkg-constants), for example `2006/01/02 15:04:05.000`. Default is RFC3339 with nanoseconds. Applies to plain-text and JSON logs. |

If you set none of these flags, Dapr logs to stdout as before. If you set only `--log-file`, the file is a plain append-only file that grows without a limit, as before.

### Write logs to more than one destination

List the destinations in `--log-outputs`. For example, to keep logs on stdout for `kubectl logs` and also write them to a file:

```bash
daprd --app-id myapp --log-outputs stdout,/var/log/dapr/myapp.log
```

Dapr removes duplicate destinations, including the same file written two different ways, such as `./dapr.log` and `dapr.log`. Console destinations are written first, so console output continues if writes to a file start to fail, for example when the disk is full.

### Rotate log files

Rotation applies only to file destinations. It turns on when at least one of `--log-file-max-size`, `--log-file-max-backups` or `--log-file-max-age` is greater than `0`, or when `--log-file-compression` is `gzip`. For example, to rotate at 50 MB, keep 5 rotated files for at most 7 days, and compress them:

```bash
daprd --app-id myapp \
  --log-file /var/log/dapr/myapp.log \
  --log-file-max-size 50 \
  --log-file-max-backups 5 \
  --log-file-max-age 7 \
  --log-file-compression gzip
```

When rotation is on and `--log-file-max-size` is not set, or is `0`, a file is rotated at 100 MB. Rotated files are written next to the log file. The log file keeps permissions `0644`, so a log shipper that runs as another user can still read it.

If you set a rotation flag but no file destination, the flag has no effect, and Dapr logs a warning at startup. An invalid value, such as a negative number or a compression other than `none` or `gzip`, stops the process at startup with an error.

{{% alert title="Note" color="primary" %}}
In Kubernetes, the sidecar annotations do not cover these flags. The Dapr CLI `dapr run` command does not have options for them either. They are flags of the `daprd` and control plane binaries.
{{% /alert %}}

## API Logging

API logging enables you to see the API calls your application makes to the Dapr sidecar, to debug issues or monitor the behavior of your application. You can combine both Dapr API logging with Dapr log events.

See [configure and view Dapr Logs]({{% ref "logs-troubleshooting.md" %}}) and [configure and view Dapr API Logs]({{% ref "api-logs-troubleshooting.md" %}}) for more information.

## Log collectors

If you run Dapr in a Kubernetes cluster, [Fluentd](https://www.fluentd.org/) is a popular container log collector. You can use Fluentd with a [JSON parser plugin](https://docs.fluentd.org/parser/json) to parse Dapr JSON-formatted logs. This [how-to]({{% ref fluentd.md %}}) shows how to configure Fluentd in your cluster.

If you are using Azure Kubernetes Service, you can use the built-in agent to collect logs with Azure Monitor without needing to install Fluentd.

## Search engines

If you use [Fluentd](https://www.fluentd.org/), we recommend using Elastic Search and Kibana. This [how-to]({{% ref fluentd.md %}}) shows how to set up Elastic Search and Kibana in your Kubernetes cluster.

If you are using the Azure Kubernetes Service, you can use [Azure Monitor for containers](https://docs.microsoft.com/azure/azure-monitor/insights/container-insights-overview) without installing any additional monitoring tools. Also read [How to enable Azure Monitor for containers](https://docs.microsoft.com/azure/azure-monitor/insights/container-insights-onboard)

## References

- [How-to: Set up Fluentd, Elastic search, and Kibana]({{% ref fluentd.md %}})
- [How-to: Set up Azure Monitor in Azure Kubernetes Service]({{% ref azure-monitor.md %}})
- [Configure and view Dapr Logs]({{% ref "logs-troubleshooting.md" %}})
- [Configure and view Dapr API Logs]({{% ref "api-logs-troubleshooting.md" %}})
