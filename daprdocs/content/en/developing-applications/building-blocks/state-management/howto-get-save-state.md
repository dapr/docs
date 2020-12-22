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

## Step 1: Setup a state store

A state store component represents a resource that Dapr uses to communicate with a database.
For the purpose of this how to we'll use a Redis state store, but any state store from the [supported list]({{< ref supported-state-stores >}}) will work.

{{< tabs "Self-Hosted (CLI)" Kubernetes>}}

{{% codetab %}}
When using `Dapr init` in Standalone mode, the Dapr CLI automatically provisions a state store (Redis) and creates the relevant YAML in a `components` directory, which for Linux/MacOS is `$HOME/.dapr/components` and for Windows is `%USERPROFILE%\.dapr\components`

To change the state store being used, replace the YAML under `/components` with the file of your choice.
{{% /codetab %}}

{{% codetab %}}
See the instructions [here]({{< ref "setup-state-store" >}}) on how to setup different state stores on Kubernetes.
{{% /codetab %}}

{{< /tabs >}}

## Step 2: Save state

The following example shows how to save two key/value pairs in a single call using the state management API.

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" "Python SDK">}}

{{% codetab %}}
Begin by ensuring a Dapr sidecar is running:
```bash
dapr run --app-id myapp --dapr-http-port 3500 run
```
{{% alert title="Note" color="info" %}}
It is important to set an app-id, as the state keys are prefixed with this value. If you don't set it one is generated for you at runtime, and the next time you run the command a new one will be generated and you will no longer be able to access previously saved state.

{{% /alert %}}

Then in a separate terminal run:
```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "key1", "value": "value1"}, { "key": "key2", "value": "value2"}]' http://localhost:3500/v1.0/state/statestore
```
{{% /codetab %}}

{{% codetab %}}
Begin by ensuring a Dapr sidecar is running:
```bash
dapr --app-id myapp --port 3500 run
```

{{% alert title="Note" color="info" %}}
It is important to set an app-id, as the state keys are prefixed with this value. If you don't set it one is generated for you at runtime, and the next time you run the command a new one will be generated and you will no longer be able to access previously saved state.

{{% /alert %}}

Then in a separate terminal run:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{ "key": "key1", "value": "value1"}, { "key": "key2", "value": "value2"}]' -Uri 'http://localhost:3500/v1.0/state/statestore'
```
{{% /codetab %}}

{{% codetab %}}
Make sure to install the Dapr Python SDK with `pip3 install dapr`. Then create a file named `state.py` with:
```python
from dapr.clients import DaprClient
from dapr.clients.grpc._state import StateItem

with DaprClient() as d:
    d.save_states(store_name="statestore",
                  states=[
                      StateItem(key="key1", value="value1"),
                      StateItem(key="key2", value="value2")
                      ])

```

Run with `dapr run --app-id myapp run python state.py`

{{% alert title="Note" color="info" %}}
It is important to set an app-id, as the state keys are prefixed with this value. If you don't set it one is generated for you at runtime, and the next time you run the command a new one will be generated and you will no longer be able to access previously saved state.

{{% /alert %}}

{{% /codetab %}}

{{< /tabs >}}

## Step 3: Get state

The following example shows how to get an item by using a key with the state management API:

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" "Python SDK">}}

{{% codetab %}}
With the same dapr instance running from above run:
```bash
curl http://localhost:3500/v1.0/state/statestore/key1
```
{{% /codetab %}}

{{% codetab %}}
With the same dapr instance running from above run:
```powershell
Invoke-RestMethod -Uri 'http://localhost:3500/v1.0/state/statestore/key1'
```
{{% /codetab %}}

{{% codetab %}}
Add the following code to `state.py` from above and run again:
```python
    data = d.get_state(store_name="statestore",
                       key="key1",
                       state_metadata={"metakey": "metavalue"}).data
    print(f"Got value: {data}")
```
{{% /codetab %}}

{{< /tabs >}}

## Step 4: Delete state

The following example shows how to delete an item by using a key with the state management API:

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" "Python SDK">}}

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
Add the following code to `state.py` from above and run again:
```python
    d.delete_state(store_name="statestore"",
                   key="key1",
                   state_metadata={"metakey": "metavalue"})
    data = d.get_state(store_name="statestore",
                       key="key1",
                       state_metadata={"metakey": "metavalue"}).data
    print(f"Got value after delete: {data}")
```
{{% /codetab %}}

{{< /tabs >}}
