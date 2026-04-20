---
type: docs
title: "dapr-mcp-server overview"
linkTitle: "Server overview"
weight: 30
description: "What dapr-mcp-server is, how it fits alongside the Dapr sidecar, and when to use it"
---

## What is dapr-mcp-server?

[`dapr-mcp-server`](https://github.com/dapr/dapr-mcp-server) is a production-ready [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server, written in Go, that exposes Dapr's building blocks as MCP tools for AI agents. Instead of teaching every agent how to call Dapr's gRPC / HTTP APIs, you point the agent at this server and it gets a curated, safety-classified tool surface for state, pub/sub, secrets, service invocation, actors, bindings, distributed locks, cryptography, and conversation components.

It is the *server-side* counterpart to clients like Claude Desktop, Cursor, VS Code Copilot, or [Dapr Agents]({{% ref "dapr-agents/_index.md" %}}). It does not generate text itself; it gives an LLM-powered client a safe, discoverable path into Dapr.

## How it fits

```text
 ┌───────────────────┐      MCP (stdio /      ┌────────────────────┐       Dapr APIs        ┌──────────────┐
 │  MCP client       │  ◄── streamable HTTP)──►  dapr-mcp-server    │◄── gRPC / HTTP ──────►│ Dapr sidecar │
 │  (agent / IDE)    │                         │  (18 tools, 9 pkgs)│                        │   (daprd)    │
 └───────────────────┘                         └──────────────┬─────┘                        └──────┬───────┘
                                                              │                                    │
                                                              │                                    ▼
                                                              │                             ┌────────────────────┐
                                                              │                             │ Dapr components    │
                                                              │                             │ state, pubsub,     │
                                                              │                             │ secrets, bindings, │
                                                              │                             │ actors, lock, LLM, │
                                                              │                             │ crypto ...         │
                                                              │                             └────────────────────┘
                                                              ▼
                                                   OpenTelemetry (traces,
                                                   metrics, logs) to any
                                                   OTLP-compatible backend
```

The MCP client speaks only MCP. The Dapr sidecar speaks only Dapr's own APIs. `dapr-mcp-server` is the deterministic translator in the middle: every tool call becomes a specific, parameter-validated Dapr call, annotated with OpenTelemetry spans and enforced by an optional authentication layer.

## Capabilities

Each capability below corresponds to a package in the server and a set of tools. See the [tool reference]({{% ref mcp-server-tool-reference.md %}}) for schemas, example payloads, and safety classifications.

| Capability | Tools | Dapr API |
| --- | --- | --- |
| Component discovery | `get_components` | [Metadata API]({{% ref metadata_api.md %}}) |
| Service invocation | `invoke_service` | [Service Invocation API]({{% ref service_invocation_api.md %}}) |
| Actors | `invoke_actor_method` | [Actors API]({{% ref actors_api.md %}}) |
| State management | `save_state`, `get_state`, `delete_state`, `execute_transaction` | [State API]({{% ref state_api.md %}}) |
| Pub/Sub | `publish_event`, `publish_event_with_metadata` | [Pub/Sub API]({{% ref pubsub_api.md %}}) |
| Bindings | `invoke_output_binding` | [Bindings API]({{% ref bindings_api.md %}}) |
| Secrets | `get_secret`, `get_bulk_secrets` | [Secrets API]({{% ref secrets_api.md %}}) |
| Conversation | `converse_with_llm` | [Conversation API]({{% ref conversation_api.md %}}) |
| Cryptography | `encrypt_data`, `decrypt_data` | [Cryptography API]({{% ref cryptography_api.md %}}) |
| Distributed locking | `acquire_lock`, `release_lock` | [Distributed Lock API]({{% ref distributed_lock_api.md %}}) |

**Dynamic registration.** Tools register only when the corresponding Dapr component exists in the sidecar. If your deployment has no `pubsub.*` component, the pub/sub tools aren't exposed to the client and agents won't try to call them. Call `get_components` first to see what's actually live.

## Transports

Two transports, chosen per deployment:

| Transport | When to use | How to enable |
| --- | --- | --- |
| **stdio** | Local IDE integration (Claude Desktop, Cursor, VS Code, Claude Code). One-process-per-client model; the IDE launches the binary as a subprocess. | Default — run `dapr-mcp-server` with no `--http` flag. |
| **Streamable HTTP** | Remote or shared deployments — Kubernetes, long-lived service, multiple concurrent clients. Carries MCP over chunked HTTP using the [streamable HTTP transport](https://modelcontextprotocol.io/specification) from the MCP spec. | `dapr-mcp-server --http <addr>` — for example `--http localhost:8080` or `--http :8080`. |

The HTTP transport also mounts Kubernetes-style health endpoints (`/livez`, `/readyz`, `/startupz`) and CORS middleware (configurable via `DAPR_MCP_CORS_ORIGIN`).

## Security model

Authentication is **off by default**. For anything beyond local development, set `AUTH_ENABLED=true` and pick a mode:

| Mode | Who it fits | Summary |
| --- | --- | --- |
| `oidc` | Human-facing apps and agents that already carry OIDC ID tokens | Validates JWTs issued by your IdP (Auth0, Entra, Keycloak, etc.). Set `OIDC_ISSUER_URL` + `OIDC_CLIENT_ID`. |
| `spiffe` | Workload-to-workload in SPIFFE / SPIRE environments | X.509 SVID mTLS via a SPIFFE Workload API socket. Set `SPIFFE_TRUST_DOMAIN`, `SPIFFE_SERVER_ID`, `SPIFFE_ENDPOINT_SOCKET`. |
| `dapr-sentry` | Dapr-native clients that already hold a Dapr Sentry JWT | Validates JWTs issued by the local Dapr Sentry instance. Set `DAPR_SENTRY_JWKS_URL`, `DAPR_SENTRY_TRUST_DOMAIN`, `DAPR_SENTRY_AUDIENCE`. |
| `hybrid` | Mixed workloads — humans with OIDC and services with SPIFFE/Sentry on the same endpoint | Accepts any of the above; first successful validator wins. |

See the [MCP authentication guide]({{% ref mcp-authentication.md %}}) for full per-mode setup and the [getting started page]({{% ref mcp-server-getting-started.md %}}) for the complete environment-variable reference.

## Observability

OpenTelemetry is wired through every tool call:

- **Traces** — every tool invocation is a span with `tool.name`, `tool.duration_ms`, and the downstream Dapr call nested underneath. Incoming trace context from MCP clients is propagated forward via W3C `traceparent` + `baggage`.
- **Metrics** — per-tool latency histograms and invocation counters; HTTP-transport metrics for request/response sizing.
- **Logs** — structured JSON via `slog`; optional export to an OTLP collector so every log line carries the active trace ID.

Point all three at a collector by setting `OTEL_EXPORTER_OTLP_ENDPOINT` (see [getting started]({{% ref mcp-server-getting-started.md %}}#observability) for the full variable set). Defaults produce gRPC exports to `localhost:4317`.

## When to reach for this server

Choose `dapr-mcp-server` when your agent needs to:

- Persist durable state or coordinate distributed work.
- Publish events onto a shared bus, or invoke another microservice.
- Access secrets, actors, locks, cryptography primitives, or a separate LLM — all behind a single uniform tool surface.
- Run in a production environment with OpenTelemetry observability and deployment-grade authentication.

It's **not** the right answer for pure local computation, ad-hoc shell tasks, or toy projects that never leave the laptop. For those, keep the agent free of a runtime dependency.

## Next steps

- [Get started]({{% ref mcp-server-getting-started.md %}}) — install, configure a sidecar, make a first tool call.
- [Tool reference]({{% ref mcp-server-tool-reference.md %}}) — schemas and safety tags for every tool.
- [Integrations]({{% ref mcp-server-integrations.md %}}) — Claude Desktop, VS Code, Cursor, Dapr Agents.
- [Authentication]({{% ref mcp-authentication.md %}}) — secure the server with OIDC, SPIFFE, or Dapr Sentry.
