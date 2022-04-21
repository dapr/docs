---
type: docs
title: "Use the Dapr API"
linkTitle: "Use the Dapr API"
weight: 30
description: "Run a Dapr sidecar and try out the state API"
---

In this quickstart, you'll simulate an application by running the sidecar and calling the API directly. After running Dapr using the Dapr CLI, you'll:

- Store two state object names.
- Perform a bulk get on the two names.
- Run a transaction operation, adding a third name and removing the first name.
- Delete the state object names.

[Learn more about the state building block and how it works in our concept docs]({{< ref state-management >}}).

### Pre-requisites

- [Install  Dapr CLI]({{< ref install-dapr-cli.md >}}).
- [Run `dapr init`]({{< ref install-dapr-selfhost.md>}}).

### Step 1: Run the Dapr sidecar

The [`dapr run`]({{< ref dapr-run.md >}}) command launches an application, together with a sidecar.

Launch a Dapr sidecar that will listen on port 3500 for a blank application named `myapp`:

```bash
dapr run --app-id myapp --dapr-http-port 3500
```

Since no custom component folder was defined with the above command, Dapr uses the default component definitions created during the [`dapr init` flow]({{< ref install-dapr-selfhost.md#step-5-verify-components-directory-has-been-initialized >}}).

### Step 2: Save state

Update the state with two objects. The new state will look like this:

```json
[
  {
    "key": "name",
    "value": "Bruce Wayne"
  }
  {
    "key": "name2",
    "value": "Batman"
  }
]
```

Notice, the objects contained in the state each have a `key` assigned with the value `name`. You will use the key in the next step.

Store the new states using the following commands:

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}
{{% codetab %}}

```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "name", "value": "Bruce Wayne"}]' http://localhost:3500/v1.0/state/statestore
curl -v -X POST -H "Content-Type: application/json" -d '[{ "key": "name2", "value": "Batman"}]' http://localhost:3500/v1.0/state/statestore 
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{ "key": "name", "value": "Bruce Wayne"}]' -Uri 'http://localhost:3500/v1.0/state/statestore'
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{ "key": "name2", "value": "Batman"}]' -Uri 'http://localhost:3500/v1.0/state/statestore'
```

{{% /codetab %}}

{{< /tabs >}}

### Step 3: Get state

Retrieve the object you just stored in the state by using the state management API with the keys `name` and `name2`. In the same terminal window, run the following bulk get code:

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

```bash
curl -v http://localhost:3500/v1.0/state/statestore/bulk -H "Content-Type: application/json" -d '{ "keys": [ "name", "name2" ], "parallelism": 10 }' 
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -H "Content-Type: application/json" -Body '{ "keys": [ "name", "name2" ], "parallelism": 10 }' -Uri 'http://localhost:3500/v1.0/state/statestore/bulk'
```

{{% /codetab %}}

{{< /tabs >}}

### Step 4: See how the state is stored in Redis

Look in the Redis container and verify Dapr is using it as a state store. Use the Redis CLI with the following command:

```bash
docker exec -it dapr_redis redis-cli
```

List the Redis keys to see how Dapr created a key value pair with the app-id you provided to `dapr run` as the key's prefix:

```bash
keys *
```

**Output:**  
`1) "myapp||name"`
`2) "myapp||name2"`

View the state values by running:

```bash
hgetall "myapp||name"
```

**Output:**  
`1) "data"`  
`2) "\"Bruce Wayne\""`  
`3) "version"`  
`4) "1"`  

```bash
hgetall "myapp||name2"
```

**Output:**
`1) "data"`
`2) "\"Batman\""`
`3) "version"`
`4) "1"`

Exit the Redis CLI with:

```bash
exit
```

### Step 5: Run a transactional operation

Run the following command to:

- Add a new state object, `name3`.
- Delete the `name` object using a transactional operation. 

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

```bash
curl -v -X POST http://localhost:3500/v1.0/state/statestore/transaction -H "Content-Type: application/json" -d '{ "operations": [ { "operation": "upsert", "request": { "key": "name3", "value": "Joker" } }, { "operation": "delete", "request": { "key": "name" } } ]}' 
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{ "operations": [ { "operation": "upsert", "request": { "key": "name3", "value": "Joker" } }, { "operation": "delete", "request": { "key": "name" } } ]}' -Uri 'http://localhost:3500/v1.0/state/statestore/transaction'
```

{{% /codetab %}}

{{< /tabs >}}

Check the Redis container and list the Redis keys to verify the `upsert` and `delete` operations were a success:

```bash
docker exec -it dapr_redis redis-cli
keys *
```

**Output:**  
`1) "myapp||name3"`
`2) "myapp||name2"`

```bash
hgetall "myapp||name3"
```

**Output:**  
1) "data"
2) "\"Joker\""
3) "version"
4) "1"

```bash
hgetall "myapp||name2"
```

**Output:**
`1) "data"`
`2) "\"Batman\""`
`3) "version"`
`4) "1"`

Exit the Redis CLI with:

```bash
exit
```

### Step 6: Delete stores

In the same terminal window, exit the docker command and delete `name2` and `name3` from the state store.

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

```bash
curl -v -X DELETE -H "Content-Type: application/json" http://localhost:3500/v1.0/state/statestore/name2 
curl -v -X DELETE -H "Content-Type: application/json" http://localhost:3500/v1.0/state/statestore/name3 
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{ "key": "name", "value": "Bruce Wayne"}]' -Uri 'http://localhost:3500/v1.0/state/statestore'
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{ "key": "name2", "value": "Batman"}]' -Uri 'http://localhost:3500/v1.0/state/statestore'
```

{{% /codetab %}}

{{< /tabs >}}

Learn more about transactional operations in the [state management overview article]({{< ref state-management-overview.md#transactional-operations >}}) or the [state API reference doc]({{< ref state_api.md#state-transactions >}}).

{{< button text="Next step: Dapr Quickstarts >>" page="getting-started/quickstarts" >}}