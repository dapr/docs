---
type: docs
title: "How-To: Set state Time-to-Live (TTL)"
linkTitle: "How-To: Set state TTL"
weight: 500
description: "Manage state with time-to-live."
---

## Introduction

Dapr enables per state set request time-to-live (TTL). This means that applications can set time-to-live per state stored, and these states cannot be retrieved after expiration.

Only a subset of Dapr [state store components]({{< ref supported-state-stores >}}) are compatible with state TTL. For supported state stores simply set the `ttlInSeconds` metadata when publishing a message. Other state stores will ignore this value.

Some state stores can specify a default expiration on a per-table/container basis. Please refer to the official documentation of these state stores to utilize this feature of desired. Dapr support per-state TTLs for supported state stores.

## Native state TTL support

When state time-to-live has native support in the state store component, Dapr simply forwards the time-to-live configuration without adding any extra logic, keeping predictable behavior. This is helpful when the expired state is handled differently by the component.
When a TTL is not specified the default behavior of the state store is retained.

## Persisting state (ignoring an existing TTL)

To explicitly persist a state (ignoring any TTLs set for the key), specify a `ttlInSeconds` value of `-1`.

## Supported components

Please refer to the TTL column in the tables at [state store components]({{< ref supported-state-stores >}}).

## Example

State TTL can be set in the metadata as part of the state store set request:

{{< tabs Python "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

```python
#dependencies

from dapr.clients import DaprClient

#code

DAPR_STORE_NAME = "statestore"

with DaprClient() as client:
        client.save_state(DAPR_STORE_NAME, "order_1", str(orderId), metadata=(
            ('ttlInSeconds', '120')
        )) 

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
```

{{% /codetab %}}

{{% codetab %}}

```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "order_1", "value": "250", "metadata": { "ttlInSeconds": "120" } }]' http://localhost:3601/v1.0/state/statestore
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{"key": "order_1", "value": "250", "metadata": {"ttlInSeconds": "120"}}]' -Uri 'http://localhost:3601/v1.0/state/statestore'
```

{{% /codetab %}}

{{< /tabs >}}

See [this guide]({{< ref state_api.md >}}) for a reference on the state API.

## Related links

- Learn [how to use key value pairs to persist a state]({{< ref howto-get-save-state.md >}})
- List of [state store components]({{< ref supported-state-stores >}})
- Read the [API reference]({{< ref state_api.md >}})