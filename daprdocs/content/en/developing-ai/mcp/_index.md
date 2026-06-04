---
type: docs
title: "MCP"
linkTitle: "MCP"
weight: 25
description: "Dapr helps developers run secure, reliable, and durable Model Context Protocol (MCP) server integrations"
---

Dapr supports MCP by using its [service invocation API]({{% ref service-invocation-overview.md %}}). Off-the-shelf [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) clients and agent frameworks (LangGraph, the official MCP SDK, custom HTTP clients) point at the local Dapr sidecar and reach MCP servers by App ID. Dapr governs the traffic with the same controls it applies to any other service-to-service call: App ID identity, access policies, HTTP middleware, mTLS, observability, and resiliency.

## How it works

Both the agent and the MCP server run as Dapr apps, each with its own App ID. The MCP client directs requests to its local sidecar and sets the `dapr-app-id` header (or uses the full service-invocation URL). Dapr resolves the target by App ID, applies the policies attached to the MCP server's App ID, and forwards the request.

For each call, Dapr can:

- **Route the request** from the calling app to the target app by App ID.
- **Authenticate the caller's workload identity** using [mTLS]({{% ref mtls.md %}}) with SPIFFE-issued credentials. On by default.
- **Apply access control policies** defined for the target MCP server's App ID — coarse-grained App-ID gating, plus per-tool authorization via [OPA]({{% ref mcp-access-control.md %}}).
- **Apply HTTP middleware** on the inbound pipeline, such as [OAuth 2.0 bearer validation]({{% ref middleware-bearer.md %}}).
- **Capture observability** — logs, metrics, and traces for the call, sliced by caller and target App ID.

Off-the-shelf MCP clients work unchanged — there is no Dapr-specific MCP SDK to adopt for this path.

## Get started

- **[MCP through Dapr service invocation]({{% ref mcp-service-invocation.md %}})** — quickstart and architecture
- **[Authenticating an MCP server]({{% ref mcp-authentication.md %}})** — OAuth 2.0 and bearer middleware
- **[MCP access control]({{% ref mcp-access-control.md %}})** — `Configuration` `accessControl` and OPA for MCP
- **[MCP security posture]({{% ref mcp-security.md %}})** — threat model and defense-in-depth narrative

## Security at a glance

| Layer | What it controls | Reference |
|---|---|---|
| **mTLS + SPIFFE identity** | Every Dapr-to-Dapr call is mutually authenticated using identities Sentry issues and rotates automatically. On by default. | [Dapr mTLS]({{% ref mtls.md %}}) |
| **`Configuration` `accessControl`** | Which caller App IDs may reach which MCP servers. Default-deny is supported. | [MCP access control]({{% ref mcp-access-control.md %}}) |
| **HTTP middleware (bearer / OAuth2)** | Inbound JWT validation on `appHttpPipeline`; outbound token acquisition on `httpPipeline`. | [Authenticating an MCP server]({{% ref mcp-authentication.md %}}) |
| **OPA per-tool policies** | Argument- and tool-aware authorization that inspects the MCP JSON-RPC body. | [MCP access control]({{% ref mcp-access-control.md %}}) |

For the threat-model framing, default postures, and what stays your responsibility, see [MCP security posture]({{% ref mcp-security.md %}}).

## Alternative: the `MCPServer` resource (workflow-centric path)

There is a second way to use MCP with Dapr — the [`MCPServer` resource]({{% ref mcp-server-resource.md %}}). This path turns MCP integration into a deploy-time concern: you declare each MCP server as a YAML resource, and Dapr discovers tools, manages connections, and registers a built-in durable workflow per tool. Calling a tool becomes "start a workflow."

In exchange, you face the following tradeoffs:

- **Requires the [Dapr Workflow]({{% ref workflow-overview %}}) client.** You must invoke MCP tools through the Dapr Workflow SDK, not through your existing MCP client.
- **Off-the-shelf MCP clients and agent frameworks do not work with this path.** If you use LangGraph, the standard MCP Python SDK, or any other framework that speaks the MCP protocol natively, you cannot use these guardrails — you would need to call tools through the workflow SDK and forgo your framework's MCP integration.
- **Scale considerations.** Every tool call spawns a child workflow and writes to the workflow state store. If your agent is already a workflow (for example, a `DurableAgent`), every tool call multiplies into a child workflow.
- **Workflow-client-only today.** Driving `MCPServer`-backed tool calls requires the Dapr Workflow client; off-the-shelf MCP clients cannot drive these flows in the current release.

Use the `MCPServer` resource when you specifically need:

- **Argument-level RBAC, audit, or redaction hooks** on a per-tool basis (`beforeCallTool` / `afterCallTool` / `beforeListTools` / `afterListTools`).
- **Durable retries** that survive a sidecar restart mid-call (backed by Dapr Workflows + Scheduler reminders).
- **Per-tool observability slicing** — one workflow name per tool, so traces, metrics, and audit logs are sliced per-tool out of the box.
- Your application already uses Dapr Workflows for the rest of its execution model.
- You accept that off-the-shelf MCP clients and agent frameworks will not work for these calls.

See the [`MCPServer` resource page]({{% ref mcp-server-resource.md %}}) for the full comparison with the service invocation path and a step-by-step guide.
