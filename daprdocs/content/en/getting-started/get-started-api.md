---
type: docs
title: "Use the Dapr API"
linkTitle: "Use the Dapr API"
weight: 30
---

After running the `dapr init` command in the previous step, your local environment has the Dapr sidecar binaries as well as default component definitions for both state management and a message broker (both using Redis). You can now try out some of what Dapr has to offer by using the Dapr CLI to run a Dapr sidecar and try out the state API that will allow you to store and retrieve a state. 

The way it works is depicted in the illustration below:

<img src="/images/state-management-overview.png" width=600>

The illustration shows how an application calls the Dapr sidecar using the state API. In turn, the sidecar calls a state store component (in this case the local Redis container that was set up in the previous step) to get and set a state.

You will now run the sidecar and call the API directly (simulating what an application would do).

### Run the Dapr sidecar

One the most useful Dapr CLI commands is `dapr run`. This command launches an application together with a sidecar. For the purpose of this tutorial, you'll run the sidecar without an application (see the [CLI reference]({{<ref dapr-run.md>}}) for usage of `dapr run` and more information).

Run the following command to run the Dapr sidecar, indicating it is listening on port 3500 and providing an app-id.

```bash
dapr run --app-id myapp --dapr-http-port 3500
```

### Set a state

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

### Get a state

Now get the state you just stored using a key with the state management API:

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}
With the same dapr instance running from above run:
```bash
curl http://localhost:3500/v1.0/state/statestore/name
```
{{% /codetab %}}

{{% codetab %}}
With the same dapr instance running from above run:
```powershell
Invoke-RestMethod -Uri 'http://localhost:3500/v1.0/state/statestore/name'
```
{{% /codetab %}}

{{< /tabs >}}

### See how the state is stored in Redis

You can look in the Redis container and verify Dapr is using it as a state store. Run the following to use the Redis CLI:

```bash
docker exec -it dapr_redis redis-cli
```

And then see how Dapr created a key value pair (with the app-id you provided to `dapr run` as a prefix to the key):

```bash
keys *
```

```
1) "myapp||name"
```


```bash
hgetall "myapp||name"
```

```
1) "data"
2) "\"Bruce Wayne\""
3) "version"
4) "1"
```

```bash
exit
```

<a class="btn btn-primary" href="{{< ref get-started-component.md >}}" role="button">Next step: Define a component >></a>
