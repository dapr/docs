---
type: docs
title: "Dapr API Logs"
linkTitle: "API Logs"
weight: 3000
description: "Understand how API logging works in Dapr and how to view logs"
---

API logging enables you to see the API calls your application makes to the Dapr sidecar. This is useful to monitor your application's behavior or for other debugging purposes. You can also combine Dapr API logging with Dapr log events (see [configure and view Dapr Logs]({{< ref "logs-troubleshooting.md" >}}) into the output if you want to use the logging capabilities together.

## Overview

API logging is disabled by default.

To enable API logging, you can use the `--enable-api-logging` command-line option when starting the `daprd` process. For example:

```bash
./daprd --enable-api-logging
```

## Configuring API logging in self-hosted mode

To enable API logging when running your app with the Dapr CLI, pass the `--enable-api-logging` flag:

```bash
dapr run \
  --enable-api-logging \
  -- node myapp.js
```

### Viewing API logs in self-hosted mode

When running Dapr with the Dapr CLI, both your app's log output and the Dapr runtime log output are redirected to the same session, for easy debugging.

The example below shows some API logs:

```bash
$ dapr run --enable-api-logging -- node myapp.js

ℹ️  Starting Dapr with id order-processor on port 56730
✅  You are up and running! Both Dapr and your app logs will appear here.
.....
INFO[0000] HTTP API Called app_id=order-processor instance=mypc method="POST /v1.0/state/mystate" scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
== APP == INFO:root:Saving Order: {'orderId': '483'}
INFO[0000] HTTP API Called app_id=order-processor instance=mypc method="GET /v1.0/state/mystate/key123" scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
== APP == INFO:root:Getting Order: {'orderId': '483'}
INFO[0000] HTTP API Called app_id=order-processor instance=mypc method="DELETE /v1.0/state/mystate" scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
== APP == INFO:root:Deleted Order: {'orderId': '483'}
INFO[0000] HTTP API Called app_id=order-processor instance=mypc method="PUT /v1.0/metadata/cliPID" scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
```

##  Configuring API logging in Kubernetes

You can enable the API logs for a sidecar by adding the following annotation in your pod spec template:

```yaml
annotations:
  dapr.io/enable-api-logging: "true"
```

### Viewing API logs on Kubernetes

Dapr API logs are written to stdout and stderr and you can view API logs on Kubernetes.

See the kubernetes API logs by executing the below command.

```bash
kubectl logs <pod_name> daprd -n <name_space>
```

The example below show `info` level API logging in Kubernetes (with [URL obfuscation](#obfuscate-urls-in-http-api-logging) enabled).

```bash
time="2022-03-16T18:32:02.487041454Z" level=info msg="HTTP API Called" method="POST /v1.0/invoke/{id}/method/{method:*}" app_id=invoke-caller instance=invokecaller-f4f949886-cbnmt scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
time="2022-03-16T18:32:02.698387866Z" level=info msg="HTTP API Called" method="POST /v1.0/invoke/{id}/method/{method:*}" app_id=invoke-caller instance=invokecaller-f4f949886-cbnmt scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
time="2022-03-16T18:32:02.917629403Z" level=info msg="HTTP API Called" method="POST /v1.0/invoke/{id}/method/{method:*}" app_id=invoke-caller instance=invokecaller-f4f949886-cbnmt scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
time="2022-03-16T18:32:03.137830112Z" level=info msg="HTTP API Called" method="POST /v1.0/invoke/{id}/method/{method:*}" app_id=invoke-caller instance=invokecaller-f4f949886-cbnmt scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
time="2022-03-16T18:32:03.359097916Z" level=info msg="HTTP API Called" method="POST /v1.0/invoke/{id}/method/{method:*}" app_id=invoke-caller instance=invokecaller-f4f949886-cbnmt scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
```

## API logging configuration

Using the [Dapr Configuration spec]({{< ref "configuration-overview.md" >}}#sidecar-configuration), you can configure the default behavior of API logging in Dapr runtimes.

### Enable API logging by default

Using the Dapr Configuration spec, you can set the default value for the `--enable-api-logging` flag (and the correspondent annotation when running on Kubernetes), with the `logging.apiLogging.enabled` option. This value applies to all Dapr runtimes that reference the Configuration document or resource in which it's defined.

- If `logging.apiLogging.enabled` is set to `false`, the default value, API logging is disabled for Dapr runtimes unless `--enable-api-logging` is set to `true` (or the `dapr.io/enable-api-logging: true` annotation is added).
- When `logging.apiLogging.enabled` is `true`, Dapr runtimes have API logging enabled by default, and it can be disabled by setting
`--enable-api-logging=false` or with the `dapr.io/enable-api-logging: false` annotation.

For example:

```yaml
logging:
  apiLogging:
    enabled: true
```

### Obfuscate URLs in HTTP API logging

By default, logs for API calls in the HTTP endpoints include the full URL being invoked (for example, `POST /v1.0/invoke/directory/method/user-123`), which could contain Personal Identifiable Information (PII).

To reduce the risk of PII being accidentally included in API logs (when enabled), Dapr can instead log the abstract route being invoked (for example, `POST /v1.0/invoke/{id}/method/{method:*}`). This can help ensuring compliance with privacy regulations such as GDPR.

To enable obfuscation of URLs in Dapr's HTTP API logs, set `logging.apiLogging.obfuscateURLs` to `true`. For example:

```yaml
logging:
  apiLogging:
    obfuscateURLs: true
```

Logs emitted by the Dapr gRPC APIs are not impacted by this configuration option, as they only include the name of the method invoked and no arguments.

### Omit health checks from API logging

When API logging is enabled, all calls to the Dapr API server are logged, including those to health check endpoints (e.g. `/v1.0/healthz`). Depending on your environment, this may generate multiple log lines per minute and could create unwanted noise.

You can configure Dapr to not log calls to health check endpoints when API logging is enabled using the Dapr Configuration spec, by setting `logging.apiLogging.omitHealthChecks: true`. The default value is `false`, which means that health checks calls are logged in the API logs.

For example:

```yaml
logging:
  apiLogging:
    omitHealthChecks: true
```
