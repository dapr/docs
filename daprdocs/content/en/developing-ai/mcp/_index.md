---
type: docs
title: "MCP"
linkTitle: "MCP"
weight: 25
description: "Dapr helps developers run secure, reliable, and durable Model Context Protocol (MCP) server integrations"
---

Dapr governs MCP traffic the same way it governs any other service-to-service call: App ID identity, access policies, HTTP middleware, mTLS, observability, and resiliency. There are two ways to plug MCP into Dapr — pick the one that matches your client and your authorization needs.

## Two integration paths

### Choosing your path

| If you… | Use |
|---|---|
| Use an off-the-shelf MCP client or framework (LangGraph, the official MCP SDK, etc.) and want unchanged client code | **[Service invocation path]({{% ref mcp-service-invocation.md %}})** |
| Need argument-level RBAC, audit, or redaction hooks on a per-tool basis | **[`MCPServer` resource path]({{% ref mcp-server-resource.md %}})** |
| Need durable retries that survive a sidecar restart mid-call | **[`MCPServer` resource path]({{% ref mcp-server-resource.md %}})** |
| Want the simplest setup that works with any framework | **[Service invocation path]({{% ref mcp-service-invocation.md %}})** |
| Want per-tool observability slicing (one workflow per tool) | **[`MCPServer` resource path]({{% ref mcp-server-resource.md %}})** |

The two paths are not exclusive — most MCP traffic can flow through service invocation, with specific servers switched to the `MCPServer` resource when their policy needs become argument-aware and if you want durable MCP interactions.

### Path A — Service invocation (recommended for most teams)

The agent's existing MCP client points at the local Dapr sidecar (`http://localhost:3500/v1.0/invoke/<mcp-server-app-id>/method/mcp`, or sets `dapr-app-id: <server>`). Dapr resolves the target by App ID, applies the `accessControl` policies and HTTP middleware attached to the MCP server's App ID, and forwards the request:

- **Off-the-shelf MCP clients and agent frameworks work unchanged** — no Dapr-specific MCP SDK to adopt.
- **App-ID identity and mTLS** — every Dapr-to-Dapr call is mutually authenticated using SPIFFE identities issued and rotated by Sentry.
- **`Configuration` `accessControl`** — coarse-grained, App-ID-keyed allow/deny policies attached to the MCP server's App ID.
- **HTTP middleware** — bearer / OAuth2 token validation on inbound, token acquisition on outbound, configured declaratively.
- **Observability, resiliency, and retries** — the same primitives Dapr already provides for service-to-service traffic apply to MCP traffic.

Get started:

- [MCP through Dapr service invocation]({{% ref mcp-service-invocation.md %}}) — quickstart and architecture
- [Authenticating an MCP server]({{% ref mcp-authentication.md %}}) — OAuth2 and bearer middleware
- [MCP access control]({{% ref mcp-access-control.md %}}) — `Configuration` `accessControl` for MCP

### Path B — `MCPServer` resource (workflow-centric)

The **[`MCPServer` resource]({{% ref mcp-server-resource.md %}})** turns MCP integration into a deploy-time concern instead of an application-code concern. Declare a YAML resource and Dapr takes over:

- **No MCP SDK in your app** — Dapr speaks MCP to the server. Your code starts a Dapr workflow by name.
- **Per-tool RBAC, audit, and redaction in YAML** — `beforeCallTool` / `afterCallTool` (and ListTools equivalents) hooks run as Dapr workflows; centralizable across apps via `appID`.
- **Durable tool calls** — backed by Dapr Workflows + Scheduler reminders. A sidecar restart mid-call doesn't drop the request; the workflow resumes on the new instance.
- **Per-tool observability** — each tool gets its own workflow (`dapr.internal.mcp.<server>.CallTool.<tool>`), so traces, metrics, and audit logs are sliced per-tool out of the box.
- **Declarative auth** — OAuth2 client credentials, SPIFFE workload identity, or static headers configured in YAML. Dapr fetches and refreshes tokens; secrets stay out of application code.
- **Scoping, multi-tenancy, hot reload** — namespaced like other Dapr resources, restricted via `scopes`, and reloaded without sidecar restart.

This path requires the [Dapr Workflow]({{% ref workflow-overview %}}) client to invoke tools — off-the-shelf MCP clients and agent frameworks won't drive `MCPServer`-backed tool calls.

Get started:

- [`MCPServer` resource overview]({{% ref mcp-server-resource.md %}})
- [How-To: Use MCPServer resources]({{% ref howto-use-mcpserver.md %}})
- [MCPServer spec reference]({{% ref mcpserver-schema %}})

## Security at a glance

Both paths use the same underlying Dapr security primitives. The three layers compose for defense in depth:

| Layer | What it controls | Reference |
|---|---|---|
| **mTLS + SPIFFE identity** | Every Dapr-to-Dapr call is mutually authenticated using identities Sentry issues and rotates automatically. On by default. | [Dapr mTLS]({{% ref mtls.md %}}) |
| **`Configuration` `accessControl`** | Which caller App IDs may reach which MCP servers. Default-deny is supported. | [MCP access control]({{% ref mcp-access-control.md %}}) |
| **HTTP middleware (bearer / OAuth2)** | Inbound JWT validation on `appHttpPipeline`; outbound token acquisition on `httpPipeline`. | [Authenticating an MCP server]({{% ref mcp-authentication.md %}}) |
| **(`MCPServer` resource only) Workflow hooks** | Argument-level RBAC, audit, redaction, response filtering — runs as durable workflows around the tool call. | [`MCPServer` resource]({{% ref mcp-server-resource.md %}}) |

For the threat-model framing, default postures, and what stays your responsibility, see [MCP security posture]({{% ref mcp-security.md %}}).
