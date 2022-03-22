---
type: docs
title: "Use the Dapr API"
linkTitle: "Use the Dapr API"
weight: 30
description: "Run a Dapr sidecar and try out the state API"
---

Running [`dapr init`]({{<ref install-dapr-selfhost.md>}}) loads your local environment with:

- The Dapr sidecar binaries.
- Default Redis component definitions for both:
  - State management, and
  - A message broker.

With this setup, run Dapr using the Dapr CLI and try out the state API to store and retrieve a state. [Learn more about the state building block and how it works in our concept docs]({{< ref state-management >}}).

In this guide, you will simulate an application by running the sidecar and calling the API directly. For the purpose of this tutorial you'll run the sidecar without an application.

### Step 1: Run the Dapr sidecar

One of the most useful Dapr CLI commands is [`dapr run`]({{< ref dapr-run.md >}}). This command launches an application, together with a sidecar. 

Launch a Dapr sidecar that will listen on port 3500 for a blank application named `myapp`:

```bash
dapr run --app-id myapp --dapr-http-port 3500
```

Since no custom component folder was defined with the above command, Dapr uses the default component definitions created during the [`dapr init` flow]({{< ref install-dapr-selfhost.md >}}), found:

- On Windows, under `%UserProfile%\.dapr\components`
- On Linux/MacOS, under `~/.dapr/components`

These tell Dapr to use the local Docker container for Redis as a state store and message broker.

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

Notice, the object contained in the state has a `key` assigned with the value `name`. You will use the key in the next step.

Store the new state using the following command:

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

Retrieve the object you just stored in the state by using the state management API with the key `name`. Run the following code with the same Dapr instance you ran earlier. :

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

View the state value by running:

```bash
hgetall "myapp||name"
```

**Output:**  
`1) "data"`  
`2) "\"Bruce Wayne\""`  
`3) "version"`  
`4) "1"`  

Exit the redis-cli with:

```bash
exit
```

{{< button text="Next step: Dapr Quickstarts >>" page="getting-started/quickstarts" >}}