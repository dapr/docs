---
type: docs
title: "How-To: Save and get state"
linkTitle: "How-To: Save & get state"
weight: 200
description: "Use key value pairs to persist a state"
---

## Introduction

State management is one of the most common needs of any application: new or legacy, monolith or microservice.
Dealing with different databases libraries, testing them, handling retries and faults can be time consuming and hard.

Dapr provides state management capabilities that include consistency and concurrency options.
In this guide we'll start of with the basics: Using the key/value state API to allow an application to save, get and delete state.

## Pre-requisites

- [Dapr CLI]({{< ref install-dapr-cli.md >}})
- Initialized [Dapr environment]({{< ref install-dapr-selfhost.md >}})

## Step 1: Setup a state store

A state store component represents a resource that Dapr uses to communicate with a database.

For the purpose of this guide we'll use a Redis state store, but any state store from the [supported list]({{< ref supported-state-stores >}}) will work.

{{< tabs "Self-Hosted (CLI)" Kubernetes>}}

{{% codetab %}}
When using `dapr init` in Standalone mode, the Dapr CLI automatically provisions a state store (Redis) and creates the relevant YAML in a `components` directory, which for Linux/MacOS is `$HOME/.dapr/components` and for Windows is `%USERPROFILE%\.dapr\components`

To optionally change the state store being used, replace the YAML file `statestore.yaml` under `/components` with the file of your choice.
{{% /codetab %}}

{{% codetab %}}

To deploy this into a Kubernetes cluster, fill in the `metadata` connection details of your [desired statestore component]({{< ref supported-state-stores >}}) in the yaml below, save as `statestore.yaml`, and run `kubectl apply -f statestore.yaml`.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```
See the instructions [here]({{< ref "setup-state-store" >}}) on how to setup different state stores on Kubernetes.

{{% /codetab %}}

{{< /tabs >}}

## Step 2: Save and retrieve a single state

The following example shows how to a single key/value pair using the Dapr state building block.

{{% alert title="Note" color="warning" %}}
It is important to set an app-id, as the state keys are prefixed with this value. If you don't set it one is generated for you at runtime, and the next time you run the command a new one will be generated and you will no longer be able to access previously saved state.
{{% /alert %}}

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" "Python SDK" "PHP SDK">}}

{{% codetab %}}
Begin by launching a Dapr sidecar:

```bash
dapr run --app-id myapp --dapr-http-port 3500
```

Then in a separate terminal save a key/value pair into your statestore:
```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "key1", "value": "value1"}]' http://localhost:3500/v1.0/state/statestore
```

Now get the state you just saved:
```bash
curl http://localhost:3500/v1.0/state/statestore/key1
```

You can also restart your sidecar and try retrieving state again to see that state persists separate from the app.
{{% /codetab %}}

{{% codetab %}}

Begin by launching a Dapr sidecar:

```bash
dapr --app-id myapp --port 3500 run
```

Then in a separate terminal save a key/value pair into your statestore:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{"key": "key1", "value": "value1"}]' -Uri 'http://localhost:3500/v1.0/state/statestore'
```

Now get the state you just saved:
```powershell
Invoke-RestMethod -Uri 'http://localhost:3500/v1.0/state/statestore/key1'
```

You can also restart your sidecar and try retrieving state again to see that state persists separate from the app.

{{% /codetab %}}

{{% codetab %}}

Save the following to a file named `pythonState.py`:

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    d.save_state(store_name="statestore", key="myFirstKey", value="myFirstValue" )
    print("State has been stored")

    data = d.get_state(store_name="statestore", key="myFirstKey").data
    print(f"Got value: {data}")

```

Once saved run the following command to launch a Dapr sidecar and run the Python application:

```bash
dapr --app-id myapp run python pythonState.py
```

You should get an output similar to the following, which will show both the Dapr and app logs:

```md
== DAPR == time="2021-01-06T21:34:33.7970377-08:00" level=info msg="starting Dapr Runtime -- version 0.11.3 -- commit a1a8e11" app_id=Braidbald-Boot scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:34:33.8040378-08:00" level=info msg="standalone mode configured" app_id=Braidbald-Boot scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:34:33.8040378-08:00" level=info msg="app id: Braidbald-Boot" app_id=Braidbald-Boot scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:34:33.9750400-08:00" level=info msg="component loaded. name: statestore, type: state.redis" app_id=Braidbald-Boot scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:34:33.9760387-08:00" level=info msg="API gRPC server is running on port 51656" app_id=Braidbald-Boot scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:34:33.9770372-08:00" level=info msg="dapr initialized. Status: Running. Init Elapsed 172.9994ms" app_id=Braidbald-Boot scope=dapr.

Checking if Dapr sidecar is listening on GRPC port 51656
Dapr sidecar is up and running.
Updating metadata for app command: python pythonState.py
You are up and running! Both Dapr and your app logs will appear here.

== APP == State has been stored
== APP == Got value: b'myFirstValue'
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
        value: 'myFirstValue'
    ));
    $logger->alert('State has been stored');

    $data = $stateManager->load_state(store_name: 'statestore', key: 'myFirstKey')->value;
    $logger->alert("Got value: {data}", ['data' => $data]);
});
```

Once saved run the following command to launch a Dapr sidecar and run the PHP application:

```bash
dapr --app-id myapp run -- php state-example.php
```

You should get an output similar to the following, which will show both the Dapr and app logs:

```md
✅  You're up and running! Both Dapr and your app logs will appear here.

== APP == [2021-02-12T16:30:11.078777+01:00] APP.ALERT: State has been stored [] []

== APP == [2021-02-12T16:30:11.082620+01:00] APP.ALERT: Got value: myFirstValue {"data":"myFirstValue"} []
```

{{% /codetab %}}

{{< /tabs >}}


## Step 3: Delete state

The following example shows how to delete an item by using a key with the state management API:

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" "Python SDK" "PHP SDK">}}

{{% codetab %}}
With the same dapr instance running from above run:
```bash
curl -X DELETE 'http://localhost:3500/v1.0/state/statestore/key1'
```
Try getting state again and note that no value is returned.
{{% /codetab %}}

{{% codetab %}}
With the same dapr instance running from above run:
```powershell
Invoke-RestMethod -Method Delete -Uri 'http://localhost:3500/v1.0/state/statestore/key1'
```
Try getting state again and note that no value is returned.
{{% /codetab %}}

{{% codetab %}}

Update `pythonState.py` with:

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    d.save_state(store_name="statestore", key="key1", value="value1" )
    print("State has been stored")

    data = d.get_state(store_name="statestore", key="key1").data
    print(f"Got value: {data}")

    d.delete_state(store_name="statestore", key="key1")

    data = d.get_state(store_name="statestore", key="key1").data
    print(f"Got value after delete: {data}")
```

Now run your program with:

```bash
dapr --app-id myapp run python pythonState.py
```

You should see an output similar to the following:

```md
Starting Dapr with id Yakchocolate-Lord. HTTP Port: 59457. gRPC Port: 59458

== DAPR == time="2021-01-06T22:55:36.5570696-08:00" level=info msg="starting Dapr Runtime -- version 0.11.3 -- commit a1a8e11" app_id=Yakchocolate-Lord scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:55:36.5690367-08:00" level=info msg="standalone mode configured" app_id=Yakchocolate-Lord scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:55:36.7220140-08:00" level=info msg="component loaded. name: statestore, type: state.redis" app_id=Yakchocolate-Lord scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:55:36.7230148-08:00" level=info msg="API gRPC server is running on port 59458" app_id=Yakchocolate-Lord scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:55:36.7240207-08:00" level=info msg="dapr initialized. Status: Running. Init Elapsed 154.984ms" app_id=Yakchocolate-Lord scope=dapr.runtime type=log ver=0.11.3

Checking if Dapr sidecar is listening on GRPC port 59458
Dapr sidecar is up and running.
Updating metadata for app command: python pythonState.py
You're up and running! Both Dapr and your app logs will appear here.

== APP == State has been stored
== APP == Got value: b'value1'
== APP == Got value after delete: b''
```
{{% /codetab %}}

{{% codetab %}}

Update `state-example.php` with the following contents:

```php
<?php
require_once __DIR__.'/vendor/autoload.php';

$app = \Dapr\App::create();
$app->run(function(\Dapr\State\StateManager $stateManager, \Psr\Log\LoggerInterface $logger) {
    $stateManager->save_state(store_name: 'statestore', item: new \Dapr\State\StateItem(
        key: 'myFirstKey',
        value: 'myFirstValue'
    ));
    $logger->alert('State has been stored');

    $data = $stateManager->load_state(store_name: 'statestore', key: 'myFirstKey')->value;
    $logger->alert("Got value: {data}", ['data' => $data]);

    $stateManager->delete_keys(store_name: 'statestore', keys: ['myFirstKey']);
    $data = $stateManager->load_state(store_name: 'statestore', key: 'myFirstKey')->value;
    $logger->alert("Got value after delete: {data}", ['data' => $data]);
});
```

Now run it with:

```bash
dapr --app-id myapp run -- php state-example.php
```

You should see something similar the following output:

```md
✅  You're up and running! Both Dapr and your app logs will appear here.

== APP == [2021-02-12T16:38:00.839201+01:00] APP.ALERT: State has been stored [] []

== APP == [2021-02-12T16:38:00.841997+01:00] APP.ALERT: Got value: myFirstValue {"data":"myFirstValue"} []

== APP == [2021-02-12T16:38:00.845721+01:00] APP.ALERT: Got value after delete:  {"data":null} []
```

{{% /codetab %}}

{{< /tabs >}}

## Step 4: Save and retrieve multiple states

Dapr also allows you to save and retrieve multiple states in the same call.

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" "Python SDK" "PHP SDK">}}

{{% codetab %}}
With the same dapr instance running from above save two key/value pairs into your statestore:
```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "key1", "value": "value1"}, { "key": "key2", "value": "value2"}]' http://localhost:3500/v1.0/state/statestore
```

Now get the states you just saved:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"keys":["key1", "key2"]}' http://localhost:3500/v1.0/state/statestore/bulk
```
{{% /codetab %}}

{{% codetab %}}
With the same dapr instance running from above save two key/value pairs into your statestore:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{ "key": "key1", "value": "value1"}, { "key": "key2", "value": "value2"}]' -Uri 'http://localhost:3500/v1.0/state/statestore'
```

Now get the states you just saved:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"keys":["key1", "key2"]}' -Uri 'http://localhost:3500/v1.0/state/statestore/bulk'
```

{{% /codetab %}}

{{% codetab %}}

The `StateItem` object can be used to store multiple Dapr states with the `save_states` and `get_states` methods.

Update your `pythonState.py` file with the following code:

```python
from dapr.clients import DaprClient
from dapr.clients.grpc._state import StateItem

with DaprClient() as d:
    s1 = StateItem(key="key1", value="value1")
    s2 = StateItem(key="key2", value="value2")

    d.save_bulk_state(store_name="statestore", states=[s1,s2])
    print("States have been stored")

    items = d.get_bulk_state(store_name="statestore", keys=["key1", "key2"]).items
    print(f"Got items: {[i.data for i in items]}")
```

Now run your program with:

```bash
dapr --app-id myapp run python pythonState.py
```

You should see an output similar to the following:

```md
== DAPR == time="2021-01-06T21:54:56.7262358-08:00" level=info msg="starting Dapr Runtime -- version 0.11.3 -- commit a1a8e11" app_id=Musesequoia-Sprite scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:54:56.7401933-08:00" level=info msg="standalone mode configured" app_id=Musesequoia-Sprite scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:54:56.8754240-08:00" level=info msg="Initialized name resolution to standalone" app_id=Musesequoia-Sprite scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:54:56.8844248-08:00" level=info msg="component loaded. name: statestore, type: state.redis" app_id=Musesequoia-Sprite scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:54:56.8854273-08:00" level=info msg="API gRPC server is running on port 60614" app_id=Musesequoia-Sprite scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:54:56.8854273-08:00" level=info msg="dapr initialized. Status: Running. Init Elapsed 145.234ms" app_id=Musesequoia-Sprite scope=dapr.runtime type=log ver=0.11.3

Checking if Dapr sidecar is listening on GRPC port 60614
Dapr sidecar is up and running.
Updating metadata for app command: python pythonState.py
You're up and running! Both Dapr and your app logs will appear here.

== APP == States have been stored
== APP == Got items: [b'value1', b'value2']
```

{{% /codetab %}}

{{% codetab %}}

To batch load and save state with PHP, just create a "Plain Ole' PHP Object" (POPO) and annotate it with
the StateStore annotation.

Update the `state-example.php` file:

```php
<?php

require_once __DIR__.'/vendor/autoload.php';

#[\Dapr\State\Attributes\StateStore('statestore', \Dapr\consistency\EventualLastWrite::class)]
class MyState {
    public string $key1 = 'value1';
    public string $key2 = 'value2';
}

$app = \Dapr\App::create();
$app->run(function(\Dapr\State\StateManager $stateManager, \Psr\Log\LoggerInterface $logger) {
    $obj = new MyState();
    $stateManager->save_object(item: $obj);
    $logger->alert('States have been stored');

    $stateManager->load_object(into: $obj);
    $logger->alert("Got value: {data}", ['data' => $obj]);
});
```

Run the app:

```bash
dapr --app-id myapp run -- php state-example.php
```

And see the following output:

```md
✅  You're up and running! Both Dapr and your app logs will appear here.

== APP == [2021-02-12T16:55:02.913801+01:00] APP.ALERT: States have been stored [] []

== APP == [2021-02-12T16:55:02.917850+01:00] APP.ALERT: Got value: [object MyState] {"data":{"MyState":{"key1":"value1","key2":"value2"}}} []
```

{{% /codetab %}}

{{< /tabs >}}

## Step 5: Perform state transactions

{{% alert title="Note" color="warning" %}}
State transactions require a state store that supports multi-item transactions. Visit the [supported state stores page]({{< ref supported-state-stores >}}) page for a full list. Note that the default Redis container created in a self-hosted environment supports them.
{{% /alert %}}

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" "Python SDK" "PHP SDK">}}

{{% codetab %}}
With the same dapr instance running from above perform two state transactions:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"operations": [{"operation":"upsert", "request": {"key": "key1", "value": "newValue1"}}, {"operation":"delete", "request": {"key": "key2"}}]}' http://localhost:3500/v1.0/state/statestore/transaction
```

Now see the results of your state transactions:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"keys":["key1", "key2"]}' http://localhost:3500/v1.0/state/statestore/bulk
```
{{% /codetab %}}

{{% codetab %}}
With the same dapr instance running from above save two key/value pairs into your statestore:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"operations": [{"operation":"upsert", "request": {"key": "key1", "value": "newValue1"}}, {"operation":"delete", "request": {"key": "key2"}}]}' -Uri 'http://localhost:3500/v1.0/state/statestore'
```

Now see the results of your state transactions:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"keys":["key1", "key2"]}' -Uri 'http://localhost:3500/v1.0/state/statestore/bulk'
```

{{% /codetab %}}

{{% codetab %}}

The `TransactionalStateOperation` can perform a state transaction if your state stores need to be transactional.

Update your `pythonState.py` file with the following code:

```python
from dapr.clients import DaprClient
from dapr.clients.grpc._state import StateItem
from dapr.clients.grpc._request import TransactionalStateOperation, TransactionOperationType

with DaprClient() as d:
    s1 = StateItem(key="key1", value="value1")
    s2 = StateItem(key="key2", value="value2")

    d.save_bulk_state(store_name="statestore", states=[s1,s2])
    print("States have been stored")

    d.execute_state_transaction(
        store_name="statestore",
        operations=[
            TransactionalStateOperation(key="key1", data="newValue1", operation_type=TransactionOperationType.upsert),
            TransactionalStateOperation(key="key2", data="value2", operation_type=TransactionOperationType.delete)
        ]
    )
    print("State transactions have been completed")

    items = d.get_bulk_state(store_name="statestore", keys=["key1", "key2"]).items
    print(f"Got items: {[i.data for i in items]}")
```

Now run your program with:

```bash
dapr run python pythonState.py
```

You should see an output similar to the following:

```md
Starting Dapr with id Singerchecker-Player. HTTP Port: 59533. gRPC Port: 59534
== DAPR == time="2021-01-06T22:18:14.1246721-08:00" level=info msg="starting Dapr Runtime -- version 0.11.3 -- commit a1a8e11" app_id=Singerchecker-Player scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:18:14.1346254-08:00" level=info msg="standalone mode configured" app_id=Singerchecker-Player scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:18:14.2747063-08:00" level=info msg="component loaded. name: statestore, type: state.redis" app_id=Singerchecker-Player scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:18:14.2757062-08:00" level=info msg="API gRPC server is running on port 59534" app_id=Singerchecker-Player scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:18:14.2767059-08:00" level=info msg="dapr initialized. Status: Running. Init Elapsed 142.0805ms" app_id=Singerchecker-Player scope=dapr.runtime type=log ver=0.11.3

Checking if Dapr sidecar is listening on GRPC port 59534
Dapr sidecar is up and running.
Updating metadata for app command: python pythonState.py
You're up and running! Both Dapr and your app logs will appear here.

== APP == State transactions have been completed
== APP == Got items: [b'value1', b'']
```

{{% /codetab %}}

{{% codetab %}}

Transactional state is supported by extending `TransactionalState` base object which hooks into your
object via setters and getters to provide a transaction. Before you created your own transactional object,
but now you'll ask the Dependency Injection framework to build one for you.

Modify the `state-example.php` file again:

```php
<?php

require_once __DIR__.'/vendor/autoload.php';

#[\Dapr\State\Attributes\StateStore('statestore', \Dapr\consistency\EventualLastWrite::class)]
class MyState extends \Dapr\State\TransactionalState {
    public string $key1 = 'value1';
    public string $key2 = 'value2';
}

$app = \Dapr\App::create();
$app->run(function(MyState $obj, \Psr\Log\LoggerInterface $logger, \Dapr\State\StateManager $stateManager) {
    $obj->begin();
    $obj->key1 = 'hello world';
    $obj->key2 = 'value3';
    $obj->commit();
    $logger->alert('Transaction committed!');

    // begin a new transaction which reloads from the store
    $obj->begin();
    $logger->alert("Got value: {key1}, {key2}", ['key1' => $obj->key1, 'key2' => $obj->key2]);
});
```

Run the application:

```bash
dapr --app-id myapp run -- php state-example.php
```

Observe the following output:

```md
✅  You're up and running! Both Dapr and your app logs will appear here.

== APP == [2021-02-12T17:10:06.837110+01:00] APP.ALERT: Transaction committed! [] []

== APP == [2021-02-12T17:10:06.840857+01:00] APP.ALERT: Got value: hello world, value3 {"key1":"hello world","key2":"value3"} []
```

{{% /codetab %}}

{{< /tabs >}}

## Next steps

- Read the full [State API reference]({{< ref state_api.md >}})
- Try one of the [Dapr SDKs]({{< ref sdks >}})
- Build a [stateful service]({{< ref howto-stateful-service.md >}})
