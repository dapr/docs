---
type: docs
title: "State Time-to-Live (TTL)"
linkTitle: "State TTL"
weight: 500
description: "Manage state with TTL."
---

Dapr enables per state set request time-to-live (TTL). This means that applications can set time-to-live per state stored, and these states cannot be retrieved after expiration.

For [supported state stores]({{< ref supported-state-stores >}}), you simply set the `ttlInSeconds` metadata when publishing a message. Other state stores will ignore this value. For some state stores, you can specify a default expiration on a per-table/container basis.

## Native state TTL support

When state TTL has native support in the state store component, Dapr forwards the TTL configuration without adding any extra logic, maintaining predictable behavior. This is helpful when the expired state is handled differently by the component.

When a TTL is not specified, the default behavior of the state store is retained.

## Explicit persistence bypassing globally defined TTL

Persisting state applies to all state stores that let you specify a default TTL used for all data, either:
- Setting a global TTL value via a Dapr component, or 
- When creating the state store outside of Dapr and setting a global TTL value. 

When no specific TTL is specified, the data expires after that global TTL period of time. This is not facilitated by Dapr.

In addition, all state stores also support the option to _explicitly_ persist data. This means you can ignore the default database policy (which may have been set outside of Dapr or via a Dapr Component) to indefinitely retain a given database record. You can do this by setting `ttlInSeconds` to the value of `-1`. This value indicates to ignore any TTL value set.

## Supported components

Refer to the TTL column in the [state store components guide]({{< ref supported-state-stores >}}).

## Example

You can set state TTL in the metadata as part of the state store set request:

{{< tabs Python ".NET" Go "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

<!--python-->

```python
#dependencies

from dapr.clients import DaprClient

#code

DAPR_STORE_NAME = "statestore"

with DaprClient() as client:
        client.save_state(DAPR_STORE_NAME, "order_1", str(orderId), state_metadata={
            'ttlInSeconds': '120'
        }) 

```

To launch a Dapr sidecar and run the above example application, you'd then run a command similar to the following:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
```

{{% /codetab %}}

{{% codetab %}}

<!--dotnet-->

```csharp
// dependencies

using Dapr.Client;

// code

await client.SaveStateAsync(storeName, stateKeyName, state, metadata: new Dictionary<string, string>() { 
    { 
        "ttlInSeconds", "120" 
    } 
});
```

To launch a Dapr sidecar and run the above example application, you'd then run a command similar to the following:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 dotnet run
```

{{% /codetab %}}

{{% codetab %}}

<!--go-->

```go
// dependencies

import (
	dapr "github.com/dapr/go-sdk/client"
)

// code

md := map[string]string{"ttlInSeconds": "120"}
if err := client.SaveState(ctx, store, "key1", []byte("hello world"), md); err != nil {
   panic(err)
}
```

To launch a Dapr sidecar and run the above example application, you'd then run a command similar to the following:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run .
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

## Related links

- See [the state API reference guide]({{< ref state_api.md >}}).
- Learn [how to use key value pairs to persist a state]({{< ref howto-get-save-state.md >}}).
- List of [state store components]({{< ref supported-state-stores >}}).
- Read the [API reference]({{< ref state_api.md >}}).
