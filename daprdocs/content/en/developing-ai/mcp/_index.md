---
type: docs
title: "MCP"
linkTitle: "MCP"
weight: 25
description: "Dapr helps developers run secure, reliable, and durable Model Context Protocol (MCP) server integrations"
---

### What does Dapr do for MCP servers?

The **[MCPServer resource]({{% ref mcp-server-resource.md %}})** turns MCP integration into a deploy-time concern instead of an application-code concern. Declare a YAML resource and Dapr takes over:

- **No MCP SDK in your app** — Dapr speaks MCP to the server. Your code starts a Dapr workflow by name.
- **Durable tool calls** — backed by Dapr Workflows + Scheduler reminders. A sidecar restart mid-call doesn't drop the request; the workflow resumes on the new instance.
- **Per-tool observability** — each tool gets its own workflow (`dapr.internal.mcp.<server>.CallTool.<tool>`), so traces, metrics, and audit logs are sliced per-tool out of the box.
- **Declarative auth** — OAuth2 client credentials, SPIFFE workload identity, or static headers configured in YAML. Dapr fetches and refreshes tokens; secrets stay out of application code.
- **Governance pipelines** — order-preserving `beforeCallTool` / `afterCallTool` (and ListTools equivalents) hooks for RBAC, rate limiting, PII redaction, audit logging, and argument transformation. Hooks are themselves Dapr workflows that can run locally or on a remote app.
- **Scoping, multi-tenancy, hot reload** — namespaced like other Dapr resources, restricted via `scopes`, and reloaded without sidecar restart.

### Get started

- [MCPServer resource overview]({{% ref mcp-server-resource.md %}})
- [How-To: Use MCPServer resources]({{% ref howto-use-mcpserver.md %}})
- [MCPServer spec reference]({{% ref mcpserver-schema %}})
- [Authenticating an MCP server (HTTPEndpoint approach)]({{% ref mcp-authentication.md %}})
