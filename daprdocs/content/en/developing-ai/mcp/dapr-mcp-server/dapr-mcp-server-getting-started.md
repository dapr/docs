---
type: docs
title: "Getting started with the Dapr MCP server"
linkTitle: "Getting started"
weight: 10
description: "Install the Dapr MCP server, run it with a Dapr sidecar, and connect an MCP client over stdio or streamable HTTP"
aliases:
  - /developing-ai/mcp/mcp-server-getting-started/
  - /developing-ai/mcp/mcp-server-integrations/
---

This guide installs the Dapr MCP server, runs it next to a Dapr sidecar with two in-memory components, and connects an MCP client to it.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}}), with Dapr [initialized in self-hosted mode]({{% ref install-dapr-selfhost.md %}})
- An MCP client, such as Claude Desktop, Cursor, or Claude Code

## Step 1: Install the server

Pick one of the following.

{{< tabpane text=true >}}

{{% tab header="Release binary" %}}

Each [GitHub release](https://github.com/dapr/dapr-mcp-server/releases) publishes a binary per platform, named `dapr-mcp-server-<os>-<arch>`, with a `checksums.txt` file. Builds are available for `linux-amd64`, `linux-arm64`, `darwin-amd64`, `darwin-arm64`, and `windows-amd64` (with an `.exe` suffix).

```bash
curl -LO https://github.com/dapr/dapr-mcp-server/releases/latest/download/dapr-mcp-server-darwin-arm64
curl -LO https://github.com/dapr/dapr-mcp-server/releases/latest/download/checksums.txt
shasum -a 256 --ignore-missing -c checksums.txt
chmod +x dapr-mcp-server-darwin-arm64
sudo mv dapr-mcp-server-darwin-arm64 /usr/local/bin/dapr-mcp-server
```

{{% /tab %}}

{{% tab header="Go" %}}

Requires Go 1.26.6 or later.

```bash
go install github.com/dapr/dapr-mcp-server/cmd/dapr-mcp-server@latest
```

A binary built this way reports its version as `dev`, because the version is stamped in only by the release build.

{{% /tab %}}

{{% tab header="Container image" %}}

Multi-arch images (`linux/amd64`, `linux/arm64`) are published to the GitHub Container Registry, tagged with the release version. Stable releases also update `latest`.

```bash
docker pull ghcr.io/dapr/dapr-mcp-server:latest
```

The image runs as a non-root user, listens on port 8080 with `--http 0.0.0.0:8080` by default, and includes a `HEALTHCHECK`. See [Run on Kubernetes](#run-on-kubernetes) for how to pair it with a sidecar.

{{% /tab %}}

{{< /tabpane >}}

Check the install:

```bash
dapr-mcp-server --version
```

## Step 2: Define components

The server registers tools only for building blocks that have a component loaded. Create a `components` folder with an in-memory state store and pub/sub broker:

```bash
mkdir -p components
```

`components/statestore.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.in-memory
  version: v1
```

`components/pubsub.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.in-memory
  version: v1
```

With these two components the server registers the three core tools plus the state and pub/sub tools. Add components of other types (`bindings.*`, `secretstores.*`, `lock.*`, `crypto.*`, `conversation.*`) to expose their tools. See the [tool reference]({{% ref dapr-mcp-server-tool-reference.md %}}) for the full mapping.

## Step 3: Run and connect

### Over stdio (Claude Desktop, Cursor)

With stdio, the MCP client starts the server process itself. Run the sidecar on its own first, on a fixed gRPC port:

```bash
dapr run --app-id dapr-mcp-server --dapr-grpc-port 50001 --resources-path ./components
```

Leave it running, then point your client at the binary. Use the absolute path, because clients don't always inherit your shell's `PATH`.

{{< tabpane text=true >}}

{{% tab header="Claude Desktop" %}}

Edit `claude_desktop_config.json` (on macOS, `~/Library/Application Support/Claude/claude_desktop_config.json`; on Windows, `%APPDATA%\Claude\claude_desktop_config.json`) and restart Claude Desktop:

```json
{
  "mcpServers": {
    "dapr": {
      "command": "/usr/local/bin/dapr-mcp-server",
      "env": {
        "DAPR_GRPC_PORT": "50001"
      }
    }
  }
}
```

{{% /tab %}}

{{% tab header="Cursor" %}}

Add the server to `~/.cursor/mcp.json`, or to `.cursor/mcp.json` in a project:

```json
{
  "mcpServers": {
    "dapr": {
      "command": "/usr/local/bin/dapr-mcp-server",
      "env": {
        "DAPR_GRPC_PORT": "50001"
      }
    }
  }
}
```

{{% /tab %}}

{{% tab header="Claude Code" %}}

```bash
claude mcp add dapr --env DAPR_GRPC_PORT=50001 -- /usr/local/bin/dapr-mcp-server
```

{{% /tab %}}

{{< /tabpane >}}

Ask the assistant to list your Dapr components. It calls `get_components` and reports `statestore` and `pubsub`. From there, try "save the key `greeting` with value `hello` to the state store" and "read it back".

The server writes its logs as JSON to stderr, so they never mix with the MCP messages on stdout. Most clients show stderr in their MCP log view.

### Over streamable HTTP

Pass `--http` with a listen address to serve MCP over streamable HTTP. Here `dapr run` starts both the sidecar and the server, and sets `DAPR_GRPC_PORT` for it:

```bash
dapr run --app-id dapr-mcp-server --resources-path ./components -- dapr-mcp-server --http localhost:8080
```

The MCP endpoint is `http://localhost:8080/`. Check that the server is up and can reach its sidecar:

```bash
curl http://localhost:8080/readyz
```

A `200` response with `"status":"healthy"` means it's ready. A `503` means the sidecar isn't reachable.

Connect a client that supports streamable HTTP:

{{< tabpane text=true >}}

{{% tab header="Cursor" %}}

```json
{
  "mcpServers": {
    "dapr": {
      "url": "http://localhost:8080/"
    }
  }
}
```

{{% /tab %}}

{{% tab header="Claude Code" %}}

```bash
claude mcp add --transport http dapr http://localhost:8080/
```

{{% /tab %}}

{{% tab header="Python MCP SDK" %}}

```python
import asyncio

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client


async def main():
    async with streamablehttp_client("http://localhost:8080/") as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            print([tool.name for tool in tools.tools])
            result = await session.call_tool("get_components", {})
            print(result.structuredContent)


asyncio.run(main())
```

{{% /tab %}}

{{< /tabpane >}}

{{% alert title="Bind to localhost unless authentication is on" color="warning" %}}
Without `AUTH_MODE`, anyone who can reach the HTTP port can call every tool. Listen on `localhost` for local use, and turn on [authentication]({{% ref dapr-mcp-server-authentication.md %}}) before exposing the server on a network.
{{% /alert %}}

## Run on Kubernetes

On Kubernetes, run the container image with the Dapr sidecar injected. The injector sets `DAPR_GRPC_PORT` in the server's container, so no extra configuration is needed to find the sidecar. Point the probes at the server's health endpoints:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dapr-mcp-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: dapr-mcp-server
  template:
    metadata:
      labels:
        app: dapr-mcp-server
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "dapr-mcp-server"
    spec:
      containers:
        - name: dapr-mcp-server
          image: ghcr.io/dapr/dapr-mcp-server:latest
          ports:
            - containerPort: 8080
          startupProbe:
            httpGet:
              path: /startupz
              port: 8080
            failureThreshold: 30
            periodSeconds: 2
          livenessProbe:
            httpGet:
              path: /livez
              port: 8080
          readinessProbe:
            httpGet:
              path: /readyz
              port: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: dapr-mcp-server
spec:
  selector:
    app: dapr-mcp-server
  ports:
    - port: 8080
      targetPort: 8080
```

Add authentication and telemetry settings as `env` entries on the container; see the [configuration reference]({{% ref dapr-mcp-server-configuration.md %}}).

Streamable HTTP sessions are held in the server's memory. If you run more than one replica, configure session affinity on whatever routes traffic to them, so that each client keeps reaching the same replica.

## Next steps

- Explore the [tool reference]({{% ref dapr-mcp-server-tool-reference.md %}}) to see what each tool does and which component type enables it.
- Secure the HTTP transport with [authentication]({{% ref dapr-mcp-server-authentication.md %}}).
- Send traces, metrics, and logs to your backend with [observability]({{% ref dapr-mcp-server-observability.md %}}).
