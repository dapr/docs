---
type: docs
title: "Getting started with dapr-mcp-server"
linkTitle: "Getting started"
weight: 40
description: "Install dapr-mcp-server, point it at a Dapr sidecar, and make your first tool call"
---

This walk-through gets you from zero to a working MCP server that an agent can call, in about ten minutes.

## Prerequisites

- **Dapr CLI** and **Dapr runtime** v1.14+ — install instructions at [Getting started with Dapr]({{% ref getting-started %}}).
- **An MCP-compatible client** — Claude Desktop, Claude Code, Cursor, VS Code + GitHub Copilot, or a custom client built with the MCP SDK. Wiring for each of these lives on the [integrations page]({{% ref mcp-server-integrations.md %}}).
- **Go 1.25+** — only if you're installing from source.
- **Docker** — only if you're running the container image.

## Step 1 — Install

Pick one of the three install methods.

### Container (recommended)

```bash
docker pull ghcr.io/dapr/dapr-mcp-server:latest
```

### Pre-built binary

Download the platform-specific archive from the [GitHub Releases page](https://github.com/dapr/dapr-mcp-server/releases), extract, and put the binary on your `PATH`.

### From source

```bash
go install github.com/dapr/dapr-mcp-server/cmd/dapr-mcp-server@latest
```

## Step 2 — Configure Dapr components

`dapr-mcp-server` discovers components from the Dapr sidecar on startup and **only registers tools whose component type is present**. If you have no `pubsub.*` component, `publish_event` will not be exposed — and agents won't try to call it.

Create a `resources/` folder with the components you want available. A minimum useful set for demos:

```yaml
# resources/statestore.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.in-memory
  version: v1
  metadata: []
---
# resources/pubsub.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.in-memory
  version: v1
  metadata: []
```

The [server's own `resources/` folder](https://github.com/dapr/dapr-mcp-server/tree/main/resources) ships examples for every supported component type — state, pub/sub, secrets, bindings, conversation, cryptography, and lock. Copy the ones you need.

### Cryptography prerequisite

If you plan to use `encrypt_data` / `decrypt_data`, the crypto component needs an RSA key pair. Generate one once:

```bash
mkdir -p resources/keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out resources/keys/private.pem
openssl rsa -in resources/keys/private.pem -pubout -out resources/keys/public.pem
```

Reference these paths from `resources/cryptography.yaml`.

## Step 3 — Run the server

### stdio transport (local IDE integration)

```bash
dapr run --app-id dapr-mcp-server \
         --resources-path resources \
         -- dapr-mcp-server
```

The MCP client (Claude Desktop, Cursor, etc.) launches this command as a subprocess and speaks MCP over the subprocess's stdin/stdout.

### Streamable HTTP transport (remote or shared clients)

```bash
dapr run --app-id dapr-mcp-server \
         --resources-path resources \
         -- dapr-mcp-server --http localhost:8080
```

Any MCP client that speaks streamable HTTP can now connect to `http://localhost:8080/`.

## Step 4 — Verify

Confirm the server is healthy and advertising tools.

### HTTP transport

```bash
curl -fsS http://localhost:8080/livez
# → "OK"

curl -fsS http://localhost:8080/readyz
# → "OK" once the Dapr sidecar is reachable and tools are registered
```

### Via an MCP client

Connect, list tools, and confirm you see at least `get_components`, `invoke_service`, `invoke_actor_method`, plus the tools for whichever components you configured.

### Via the server logs

Look for lines like:

```json
{"level":"INFO","msg":"Discovered Dapr components","components":{"state":true,"pubsub":true}}
{"level":"INFO","msg":"Registered tools","count":9}
```

## Step 5 — First real call

Point your MCP client at the server and run this scripted sequence:

1. `get_components` — to discover the component names.
2. `save_state` with `storeName: statestore`, `key: demo`, `value: hello`.
3. `get_state` with the same `storeName` and `key` — expect `"hello"` back.
4. `publish_event` with `pubsubName: pubsub`, `topic: greetings`, `message: "hi"`.

If all four succeed, the MCP ⇄ Dapr path is wired up correctly.

## Configuration reference

Every environment variable `dapr-mcp-server` reads, grouped by subsystem. Defaults in **bold** apply when the variable is unset.

### Transport

| Variable | Default | Description |
| --- | --- | --- |
| `--http` (CLI flag) | **unset → stdio** | If set to `host:port`, enables streamable HTTP on that address |
| `--health-check` (CLI flag) | **unset** | Probes `http://localhost:8080/livez` once and exits 0/1 (for Dockerfile `HEALTHCHECK`) |
| `DAPR_MCP_CORS_ORIGIN` | **`*`** | CORS `Access-Control-Allow-Origin` for HTTP transport |

### Logging

| Variable | Default | Description |
| --- | --- | --- |
| `DAPR_MCP_SERVER_LOG_LEVEL` | **`INFO`** | `DEBUG`, `INFO`, `WARN`, `ERROR` |

### OpenTelemetry

Standard [OTEL SDK environment variables](https://opentelemetry.io/docs/specs/otel/protocol/exporter/) plus a few server-specific toggles.

| Variable | Default | Description |
| --- | --- | --- |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | **empty** | Base OTLP endpoint for traces + metrics + logs |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` | inherits base | Override for traces |
| `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` | inherits base | Override for metrics |
| `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` | inherits base | Override for logs |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | **`grpc`** | `grpc` or `http/protobuf` |
| `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL` | inherits | Per-signal override |
| `OTEL_EXPORTER_OTLP_HEADERS` | **empty** | Comma-separated `key=value` headers (e.g., API keys) |
| `OTEL_SERVICE_NAME` | **`dapr-mcp-server`** | Service name attribute on every signal |
| `OTEL_SERVICE_VERSION` | **`v1.0.0`** | Service version attribute |
| `OTEL_METRIC_EXPORT_INTERVAL` | SDK default | Go `time.Duration` — e.g., `30s` |
| `OTEL_LOG_EXPORT_INTERVAL` | SDK default | Go `time.Duration` |
| `DAPR_MCP_SERVER_METRICS_ENABLED` | **`true`** | Set to `false` to disable metrics export |
| `DAPR_MCP_SERVER_LOGS_OTEL_ENABLED` | **`true`** | Set to `false` to keep logs stdout-only |

### Authentication

Authentication is opt-in. Set `AUTH_ENABLED=true` and `AUTH_MODE` to one of `oidc`, `spiffe`, `dapr-sentry`, or `hybrid`.

| Variable | Default | Description |
| --- | --- | --- |
| `AUTH_ENABLED` | **`false`** | Master switch |
| `AUTH_MODE` | **`disabled`** | `oidc`, `spiffe`, `dapr-sentry`, `hybrid`, or `disabled` |
| `AUTH_SKIP_PATHS` | **`/livez,/readyz,/startupz`** | Comma-separated list of paths that bypass auth |

#### OIDC

| Variable | Default | Description |
| --- | --- | --- |
| `OIDC_ENABLED` | **`false`** (auto-set by `AUTH_MODE=oidc`) | Used only with `AUTH_MODE=hybrid` |
| `OIDC_ISSUER_URL` | **empty** | Your IdP's issuer URL (must serve `/.well-known/openid-configuration`) |
| `OIDC_CLIENT_ID` | **empty** | Expected `aud` claim |
| `OIDC_ALLOWED_ALGORITHMS` | **`RS256,ES256`** | Comma-separated list of JWT signing algs |
| `OIDC_SKIP_ISSUER_CHECK` | **`false`** | Dev-only: skip issuer validation |

#### SPIFFE

| Variable | Default | Description |
| --- | --- | --- |
| `SPIFFE_ENABLED` | **`false`** (auto-set by `AUTH_MODE=spiffe`) | Used only with `AUTH_MODE=hybrid` |
| `SPIFFE_TRUST_DOMAIN` | **empty** | e.g., `example.org` |
| `SPIFFE_SERVER_ID` | **empty** | This server's SPIFFE ID (e.g., `spiffe://example.org/dapr-mcp-server`) |
| `SPIFFE_ENDPOINT_SOCKET` | **empty** | Workload API socket (e.g., `unix:///tmp/spire-agent/public/api.sock`) |
| `SPIFFE_ALLOWED_CLIENTS` | **empty** | Comma-separated allowed client SPIFFE IDs |

#### Dapr Sentry

| Variable | Default | Description |
| --- | --- | --- |
| `DAPR_SENTRY_ENABLED` | **`false`** (auto-set by `AUTH_MODE=dapr-sentry`) | Used only with `AUTH_MODE=hybrid` |
| `DAPR_SENTRY_JWKS_URL` | **empty** | Dapr Sentry JWKS endpoint |
| `DAPR_SENTRY_TRUST_DOMAIN` | **empty** | Expected SPIFFE trust domain in the JWT |
| `DAPR_SENTRY_AUDIENCE` | **empty** | Expected `aud` claim (optional) |
| `DAPR_SENTRY_TOKEN_HEADER` | **`Authorization`** | Custom header to pull the JWT from |
| `DAPR_SENTRY_JWKS_REFRESH_INTERVAL` | **`5m`** | Go `time.Duration` — how often to refresh the JWKS cache |

See [MCP authentication]({{% ref mcp-authentication.md %}}) for end-to-end setup for each mode.

## Troubleshooting

### "No tools appear in my MCP client except the three core ones"

Component discovery ran but found no conditional components. Run `dapr components list --app-id dapr-mcp-server` to see what the sidecar actually loaded, or call `get_components` from the client — empty result confirms the issue. Check your `--resources-path` and YAML filenames.

### "Authentication rejecting every request"

- Confirm `AUTH_ENABLED=true` and `AUTH_MODE` match what your client sends. An OIDC client can't authenticate against `AUTH_MODE=spiffe`.
- For OIDC: `OIDC_ISSUER_URL` must be exactly the `iss` claim your tokens carry, down to trailing slash.
- For SPIFFE: `SPIFFE_ENDPOINT_SOCKET` must be readable by the `dapr-mcp-server` process.
- For Dapr Sentry: `DAPR_SENTRY_JWKS_URL` must be reachable from the server — try `curl -sv` it.

### "OTEL backend shows nothing"

- Set `OTEL_EXPORTER_OTLP_ENDPOINT`. Without it, nothing is exported.
- If you're sending to a non-local collector, set `OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf` and use the `:4318` port — many hosted backends don't accept gRPC.
- Check logs for `OpenTelemetry initialized successfully` on startup; absence means the SDK never spun up.

### "Dapr client initialization failed after 5 attempts"

The server retries `dapr.NewClient()` five times with a 2-second backoff. If all fail, the Dapr sidecar never came up on its expected gRPC endpoint (`localhost:50001` by default). Ensure `dapr run` is wrapping the server command, or set `DAPR_GRPC_ENDPOINT` explicitly when running standalone.

### "Crypto tool calls fail with 'key not found'"

The RSA key pair from Step 2 must exist at the exact paths referenced in `resources/cryptography.yaml`. Verify with `ls resources/keys/` and match against the component YAML.

## Next steps

- [Tool reference]({{% ref mcp-server-tool-reference.md %}}) — full schemas and safety classifications for every tool.
- [Integrations]({{% ref mcp-server-integrations.md %}}) — per-client wiring for Claude Desktop, VS Code, Cursor, Dapr Agents.
- [Authentication]({{% ref mcp-authentication.md %}}) — deep dive into each auth mode.
