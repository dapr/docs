---
type: docs
title: "Dapr API Logs"
linkTitle: "API Logs"
weight: 2000
description: "Understand how API logging works in Dapr and how to view logs"
---

This section will assist you in understanding how Dapr API logging works in Dapr, viewing logs.

## Overview

API logs have different, configurable verbosity levels. The API logging is availbale for both HTTP and GRPC calls
The levels outlined below are the same for both system components and the Dapr sidecar process/container:

1. info
2. debug

The default level is debug, which provides a balanced amount of information for operating Dapr in normal conditions.

To set the output level, you can use the `--api-log-level` command-line option. For example:

```bash
./daprd --api-log-level info
./daprd --api-log-level debug
```

This will start the Dapr runtime binary with a log level of `info` and `debug` accordingly.

## Logs in stand-alone mode

To set the log level when running your app with the Dapr CLI, pass the `api-log-level` param:

```bash
dapr run --api-log-level info node myapp.js
```

As outlined above, every Dapr binary takes a `--api-log-level` argument.

### Viewing Logs on Standalone Mode

When running Dapr with the Dapr CLI, both your app's log output and the runtime's output will be redirected to the same session, for easy debugging.
For example, this is the output when running Dapr:

The below example is for info level API logging:

```bash
dapr run --api-log-level info node myapp.js
ℹ️  Starting Dapr with id Trackgreat-Lancer on port 56730
✅  You are up and running! Both Dapr and your app logs will appear here.
.....
INFO[0000] HTTP API Called: POST /v1.0/state/statestore  app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
== APP == INFO:root:Saving Order: {'orderId': '483'}
INFO[0000] HTTP API Called: GET /v1.0/state/statestore/483  app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
== APP == INFO:root:Getting Order: {'orderId': '483'}
INFO[0000] HTTP API Called: DELETE /v1.0/state/statestore  app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
== APP == INFO:root:Deleted Order: {'orderId': '483'}
INFO[0000] HTTP API Called: PUT /v1.0/metadata/cliPID    app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
ℹ️  Updating metadata for app command: python3 app.py
INFO[0000] HTTP API Called: PUT /v1.0/metadata/appCommand  app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
✅  You\'re up and running! Both Dapr and your app logs will appear here.

INFO[0001] HTTP API Called: POST /v1.0/state/statestore  app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
== APP == INFO:root:Saving Order: {'orderId': '230'}
INFO[0001] HTTP API Called: GET /v1.0/state/statestore/230  app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
== APP == INFO:root:Getting Order: {'orderId': '230'}
```

The below example is for debug level API logging

```bash
dapr run --api-log-level info node myapp.js
ℹ️  Starting Dapr with id Trackgreat-Lancer on port 56730
✅  You are up and running! Both Dapr and your app logs will appear here.
.....
DEBU[0000] HTTP API Called: POST /v1.0/state/statestore  app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
== APP == INFO:root:Saving Order: {'orderId': '483'}
DEBU[0000] HTTP API Called: GET /v1.0/state/statestore/483  app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
== APP == INFO:root:Getting Order: {'orderId': '483'}
DEBU[0000] HTTP API Called: DELETE /v1.0/state/statestore  app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
== APP == INFO:root:Deleted Order: {'orderId': '483'}
DEBU[0000] HTTP API Called: PUT /v1.0/metadata/cliPID    app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
ℹ️  Updating metadata for app command: python3 app.py
DEBU[0000] HTTP API Called: PUT /v1.0/metadata/appCommand  app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
✅  You\'re up and running! Both Dapr and your app logs will appear here.

DEBU[0001] HTTP API Called: POST /v1.0/state/statestore  app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
== APP == INFO:root:Saving Order: {'orderId': '230'}
DEBU[0001] HTTP API Called: GET /v1.0/state/statestore/230  app_id=order-processor instance=QTM-SWATHIKIL-1.redmond.corp.microsoft.com scope=dapr.runtime.http type=log ver=edge
== APP == INFO:root:Getting Order: {'orderId': '230'}
```

## Logs in Kubernetes mode

You can set the log level individually for every sidecar by providing the following annotation in your pod spec template:

```yml
annotations:
  dapr.io/api-log-level: "debug"
```
