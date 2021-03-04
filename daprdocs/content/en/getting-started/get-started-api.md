---
type: docs
title: "Use the Dapr API"
linkTitle: "Use the Dapr API"
weight: 30
---

After running the `dapr init` command in the [previous step]({{<ref install-dapr-selfhost.md>}}), your local environment has the Dapr sidecar binaries as well as default component definitions for both state management and a message broker (both using Redis). You can now try out some of what Dapr has to offer by using the Dapr CLI to run a Dapr sidecar and try out the state API that will allow you to store and retrieve a state. You can learn more about the state building block and how it works in [these docs]({{< ref state-management >}}).

You will now run the sidecar and call the API directly (simulating what an application would do).

## Step 1: Run the Dapr sidecar

One the most useful Dapr CLI commands is [`dapr run`]({{< ref dapr-run.md >}}). This command launches an application together with a sidecar. For the purpose of this tutorial you'll run the sidecar without an application.

Run the following command to launch a Dapr sidecar that will listen on port 3500 for a blank application named myapp:

```bash
dapr run --app-id myapp --dapr-http-port 3500
```

With this command, no custom component folder was defined, so Dapr uses the default component definitions that were created during the init flow (these can be found under `$HOME/.dapr/components` on Linux or MacOS and under `%USERPROFILE%\.dapr\components` on Windows). These tell Dapr to use the local Redis Docker container as a state store and message broker.

## Step 2: Save state

In a separate terminal run:

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

## Step 3: Get state

Now get the state you just stored using a key with the state management API:

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}
With the same Dapr instance running from above run:
```bash
curl http://localhost:3500/v1.0/state/statestore/name
```
{{% /codetab %}}

{{% codetab %}}
With the same Dapr instance running from above run:
```powershell
Invoke-RestMethod -Uri 'http://localhost:3500/v1.0/state/statestore/name'
```
{{% /codetab %}}

{{< /tabs >}}

## Step 4: See how the state is stored in Redis

You can look in the Redis container and verify Dapr is using it as a state store. Run the following to use the Redis CLI:

```bash
docker exec -it dapr_redis redis-cli
```

List the redis keys to see how Dapr created a key value pair (with the app-id you provided to `dapr run` as a prefix to the key):

```bash
keys *
```

```
1) "myapp||name"
```

View the state value by running:

```bash
hgetall "myapp||name"
```

```
1) "data"
2) "\"Bruce Wayne\""
3) "version"
4) "1"
```

Exit the redis-cli with:

```bash
exit
```

<a class="btn btn-primary" href="{{< ref get-started-component.md >}}" role="button">Next step: Define a component >></a>
