---
type: docs
title: "Use the Dapr API"
linkTitle: "Use the Dapr API"
weight: 30
description: "Run a Dapr sidecar and try out the state management API"
---

In this guide, you'll simulate an application by running the sidecar and calling the state management API directly. 
After running Dapr using the Dapr CLI, you'll:

- Save a state object.
- Read/get the state object.
- Delete the state object.

[Learn more about the state building block and how it works in our concept docs]({{< ref state-management >}}).

### Pre-requisites

- [Install  Dapr CLI]({{< ref install-dapr-cli.md >}}).
- [Run `dapr init`]({{< ref install-dapr-selfhost.md>}}).

### Step 1: Run the Dapr sidecar

The [`dapr run`]({{< ref dapr-run.md >}}) command normally runs your application and a Dapr sidecar. In this case, 
it only runs the sidecar since you are interacting with the state management API directly.

Launch a Dapr sidecar that will listen on port 3500 for a blank application named `myapp`:

```bash
dapr run --app-id myapp --dapr-http-port 3500
```

Since no custom component folder was defined with the above command, Dapr uses the default component definitions created during the [`dapr init` flow]({{< ref "install-dapr-selfhost.md#step-5-verify-components-directory-has-been-initialized" >}}).

### Step 2: Save state

Update the state with an object. The new state will look like this:

```json
[
  {
    "key": "name",
    "value": "Bruce Wayne"
  }
]
```

Notice, that objects contained in the state each have a `key` assigned with the value `name`. You will use the key in the next step.

Save a new state object using the following command:

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}
{{% codetab %}}

```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "name", "value": "Bruce Wayne"}]' http://localhost:3500/v1.0/state/statestore
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{ "key": "name", "value": "Bruce Wayne"}]' -Uri 'http://localhost:3500/v1.0/state/statestore'
```

{{% /codetab %}}

{{< /tabs >}}

### Step 3: Get state

Retrieve the object you just stored in the state by using the state management API with the key `name`. In the same terminal window, run the following command:

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

```bash
curl http://localhost:3500/v1.0/state/statestore/name 
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Uri 'http://localhost:3500/v1.0/state/statestore/name'
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

View the state values by running:

```bash
hgetall "myapp||name"
```

**Output:**  
`1) "data"`  
`2) "\"Bruce Wayne\""`  
`3) "version"`  
`4) "1"`  

Exit the Redis CLI with:

```bash
exit
```

### Step 5: Delete state

In the same terminal window, delete the`name` state object from the state store.

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

```bash
curl -v -X DELETE -H "Content-Type: application/json" http://localhost:3500/v1.0/state/statestore/name
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Delete -ContentType 'application/json' -Uri 'http://localhost:3500/v1.0/state/statestore/name'
```

{{% /codetab %}}

{{< /tabs >}}

{{< button text="Next step: Dapr Quickstarts >>" page="getting-started/quickstarts" >}}