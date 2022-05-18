---
type: docs
title: "Dapr API Logs"
linkTitle: "API Logs"
weight: 3000
description: "Understand how API logging works in Dapr and how to view logs"
---

API logging enables you to see the API calls from your application to the Dapr sidecar and debug issues as a result when the flag is set. You can also combine Dapr API logging with Dapr log events (see [configure and view Dapr Logs]({{< ref "logs-troubleshooting.md" >}}) into the output, if you want to use the logging capabilities together.

## Overview

The default value of the flag is false.

To enable API logging, you can use the `--enable-api-logging` command-line option. For example:

```bash
./daprd --enable-api-logging
```

This starts the Dapr runtime with API logging.

## Configuring API logging in self hosted mode

To enable API logging when running your app with the Dapr CLI, pass the `enable-api-logging` flag:

```bash
dapr run --enable-api-logging node myapp.js
```

### Viewing API logs in self hosted mode

When running Dapr with the Dapr CLI, both your app's log output and the Dapr runtime log output are redirected to the same session, for easy debugging.

The example below shows some API logs:

```bash
dapr run --enable-api-logging -- node myapp.js

ℹ️  Starting Dapr with id order-processor on port 56730
✅  You are up and running! Both Dapr and your app logs will appear here.
.....
INFO[0000] HTTP API Called: POST /v1.0/state/statestore  app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
== APP == INFO:root:Saving Order: {'orderId': '483'}
INFO[0000] HTTP API Called: GET /v1.0/state/statestore/483  app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
== APP == INFO:root:Getting Order: {'orderId': '483'}
INFO[0000] HTTP API Called: DELETE /v1.0/state/statestore  app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
== APP == INFO:root:Deleted Order: {'orderId': '483'}
INFO[0000] HTTP API Called: PUT /v1.0/metadata/cliPID    app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
```

##  Configuring API logging in Kubernetes

You can enable the API logs for every sidecar by providing the following annotation in your pod spec template:

```yml
annotations:
  dapr.io/enable-api-logging: "true"
```

### Viewing API logs on Kubernetes

Dapr API logs are written to stdout and stderr and you can view API logs on Kubernetes.

See the kubernetes API logs by executing the below command.

```bash
kubectl logs <pod_name> daprd -n <name_space>
```

The example below show `info` level API logging in Kubernetes.

```bash
time="2022-03-16T18:32:02.487041454Z" level=info msg="HTTP API Called: GET /v1.0/invoke/invoke-receiver/method/my-method" app_id=invoke-caller instance=invokecaller-f4f949886-cbnmt scope=dapr.runtime.http type=log ver=edge
time="2022-03-16T18:32:02.698387866Z" level=info msg="HTTP API Called: GET /v1.0/invoke/invoke-receiver/method/my-method" app_id=invoke-caller instance=invokecaller-f4f949886-cbnmt scope=dapr.runtime.http type=log ver=edge
time="2022-03-16T18:32:02.917629403Z" level=info msg="HTTP API Called: GET /v1.0/invoke/invoke-receiver/method/my-method" app_id=invoke-caller instance=invokecaller-f4f949886-cbnmt scope=dapr.runtime.http type=log ver=edge
time="2022-03-16T18:32:03.137830112Z" level=info msg="HTTP API Called: GET /v1.0/invoke/invoke-receiver/method/my-method" app_id=invoke-caller instance=invokecaller-f4f949886-cbnmt scope=dapr.runtime.http type=log ver=edge
time="2022-03-16T18:32:03.359097916Z" level=info msg="HTTP API Called: GET /v1.0/invoke/invoke-receiver/method/my-method" app_id=invoke-caller instance=invokecaller-f4f949886-cbnmt scope=dapr.runtime.http type=log ver=edge
```
