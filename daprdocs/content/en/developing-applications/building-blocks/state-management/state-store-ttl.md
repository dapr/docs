---
type: docs
title: "State Time-to-Live (TTL)"
linkTitle: "State TTL"
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

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" "Python SDK" "PHP SDK">}}

{{% codetab %}}

```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "key1", "value": "value1", "metadata": { "ttlInSeconds": "120" } }]' http://localhost:3500/v1.0/state/statestore
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{"key": "key1", "value": "value1", "metadata": {"ttlInSeconds": "120"}}]' -Uri 'http://localhost:3500/v1.0/state/statestore'
```

{{% /codetab %}}

{{% codetab %}}

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    d.save_state(
        store_name="statestore",
        key="myFirstKey",
        value="myFirstValue",
        metadata=(
            ('ttlInSeconds', '120')
        )
    )
    print("State has been stored")

```

{{% /codetab %}}

{{% codetab %}}

Save the following in `state-example.php`:

```php
<?php
require_once __DIR__.'/vendor/autoload.php';

$app = \Dapr\App::create();
$app->run(function(\Dapr\State\StateManager $stateManager, \Psr\Log\LoggerInterface $logger) {
    $stateManager->save_state(store_name: 'statestore', item: new \Dapr\State\StateItem(
        key: 'myFirstKey',
        value: 'myFirstValue',
        metadata: ['ttlInSeconds' => '120']
    ));
    $logger->alert('State has been stored');
});
```

{{% /codetab %}}

{{< /tabs >}}

See [this guide]({{< ref state_api.md >}}) for a reference on the state API.

## Related links

- Learn [how to use key value pairs to persist a state]({{< ref howto-get-save-state.md >}})
- List of [state store components]({{< ref supported-state-stores >}})
- Read the [API reference]({{< ref state_api.md >}})
