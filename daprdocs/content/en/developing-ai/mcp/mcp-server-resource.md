---
type: docs
title: "MCPServer resource"
linkTitle: "MCPServer resource"
weight: 10
description: "Declare MCP server connections as first-class Dapr resources for durable tool execution"
---

## Overview

The `MCPServer` resource lets you declare MCP (Model Context Protocol) server connections as first-class Dapr resources. When daprd loads an MCPServer, it discovers the server's tools and registers a built-in durable workflow orchestration *per tool*. Calling a tool then becomes "start a workflow" — and Dapr handles the connection, retries, credentials, observability, and crash recovery for you. Your application never imports an MCP SDK or holds a long-lived MCP connection.

## Why MCPServer?

MCPServer turns MCP integration into a deploy-time concern instead of an application-code concern. The benefits compound across the system:

- **Zero MCP SDK in your app.** Your application starts a Dapr workflow by name. Dapr speaks MCP to the server. Swap MCP servers, change transports, or rotate credentials without touching application code.
- **Durable execution.** Tool calls run as workflow activities backed by Dapr Scheduler reminders. If daprd is restarted mid-call, the scheduler re-delivers the activity to the new instance and the call completes — agents don't have to implement their own retry/resume logic.
- **Per-tool observability.** Each tool gets its own workflow name (`dapr.internal.mcp.<server>.CallTool.<tool>`), so traces, metrics, and audit logs are sliced per-tool out of the box. You see exactly which tool was called, by whom, with what arguments, and what came back.
- **Declarative authentication.** OAuth2 client credentials, SPIFFE workload identity, and static-header auth are all configured in YAML. Dapr fetches and refreshes tokens, caches per-MCPServer HTTP clients, and never exposes raw credentials to your app.
- **Pluggable governance pipelines.** Order-preserving `beforeCallTool` / `afterCallTool` / `beforeListTools` / `afterListTools` hooks can run RBAC, rate limiting, PII redaction, audit logging, or argument transformation as Dapr workflows — locally or on a remote app.
- **Scoping and multi-tenancy.** MCPServers are namespaced and `scopes`-restricted, just like other Dapr resources. One MCP server can be shared across many apps with different access policies.
- **Hot reload.** Add, remove, or modify MCPServer resources at runtime — Dapr reloads them without a sidecar restart.

| Without MCPServer | With MCPServer |
|---|---|
| Application manages MCP connections, retries, and credentials | Declare YAML, Dapr handles the rest |
| Sidecar crash mid-call = lost call | Scheduler reminder re-delivers the activity, workflow resumes |
| Per-tool tracing/metrics requires custom instrumentation | One workflow per tool — built-in observability slicing |
| Each app hardcodes its own MCP connection logic | Single resource, shared across apps via `scopes` |
| Auth, PII redaction, RBAC scattered through app code | Declarative middleware hooks per operation |

## How it works

For each loaded MCPServer named `<server>`, daprd:

1. **Connects** to the MCP server using the configured transport (streamable HTTP, SSE, or stdio).
2. **Discovers** the tools the server exposes (one MCP `tools/list` round-trip).
3. **Registers** durable workflow orchestrations:
   - `dapr.internal.mcp.<server>.ListTools` — returns the cached tool list.
   - `dapr.internal.mcp.<server>.CallTool.<tool>` — one workflow per discovered tool. Each invokes the tool durably as an activity, with optional middleware hooks before/after.

Callers start these workflows through the standard [Dapr Workflow API]({{% ref workflow_api %}}). Dapr Workflows takes care of scheduling, retries on transient failures, and resuming after sidecar restarts.

### Calling a tool

Start a `CallTool.<tool>` workflow with just the arguments — the tool name is encoded in the workflow name itself:

```
POST /v1.0-beta1/workflows/dapr/dapr.internal.mcp.<server>.CallTool.<tool>/start
Content-Type: application/json

{
  "arguments": {"city": "Seattle"}
}
```

Poll for the result with `GET /v1.0-beta1/workflows/dapr/<instanceID>`. The workflow output is a `CallMCPToolResponse` proto serialized as JSON. Each entry in `content` is a oneof — text, image, audio, resource_link, or embedded_resource:

```json
{
  "is_error": false,
  "content": [
    {"text": {"text": "Weather in Seattle: sunny, 72°F"}}
  ]
}
```

For binary content the shape is `{"image": {"mime_type": "image/png", "data": "<base64>"}}` (likewise for `audio`); for resource references it is `{"resource_link": {"resource": "<base64-bytes>"}}` or `{"embedded_resource": {...}}`.

If the tool call fails at the MCP level (unknown tool, validation failure, server-side auth error), `is_error` is `true` and the failure is described in `content` — the workflow itself completes successfully so the calling agent or LLM receives a structured error it can act on (retry, pick a different tool, or surface to the user).

If daprd restarts while the tool call is in flight, Dapr Scheduler re-delivers the pending activity to the new daprd instance and the workflow resumes — no application-side retry logic required.

### Listing tools

```
POST /v1.0-beta1/workflows/dapr/dapr.internal.mcp.<server>.ListTools/start
Content-Type: application/json

{}
```

Output:

```json
{
  "tools": [
    {
      "name": "get_weather",
      "description": "Get current weather for a city",
      "input_schema": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"]
      }
    }
  ]
}
```

Tool definitions are cached at MCPServer load time and refreshed on hot-reload.

## Transports

MCPServer supports three wire transports. Exactly one must be configured under `spec.endpoint`.

### Streamable HTTP

The recommended transport for production use.

```yaml
apiVersion: dapr.io/v1alpha1
kind: MCPServer
metadata:
  name: payments-mcp
spec:
  endpoint:
    streamableHTTP:
      url: https://payments.internal/mcp
      timeout: 30s
```

### SSE (legacy)

For MCP servers that only support the legacy SSE transport.

```yaml
apiVersion: dapr.io/v1alpha1
kind: MCPServer
metadata:
  name: legacy-mcp
spec:
  endpoint:
    sse:
      url: https://legacy.internal/sse
```

### Stdio

For local MCP server subprocesses in development.

```yaml
apiVersion: dapr.io/v1alpha1
kind: MCPServer
metadata:
  name: local-tools
spec:
  endpoint:
    stdio:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-filesystem"]
```

## Authentication

HTTP transports (`streamableHTTP`, `sse`) support three authentication mechanisms. These are configured under the transport's `auth` field.

### Static headers

Inject headers on every outbound request. Supports `value`, `secretKeyRef`, and `envRef`.

```yaml
spec:
  endpoint:
    streamableHTTP:
      url: https://api.example.com/mcp
      headers:
      - name: Authorization
        secretKeyRef:
          name: mcp-token
          key: token
      auth:
        secretStore: kubernetes
```

### OAuth2 client credentials

Dapr fetches an access token from the authorization server and injects it automatically. HTTP clients are cached per MCPServer for efficiency. `auth.secretStore` controls which secret store is used to resolve `secretKeyRef`s anywhere under this `auth` block (and for static-header `secretKeyRef`s on the same transport). It defaults to `kubernetes`.

```yaml
spec:
  endpoint:
    streamableHTTP:
      url: https://payments.internal/mcp
      auth:
        secretStore: my-vault   # optional; defaults to "kubernetes"
        oauth2:
          issuer: https://auth.company.com/token
          clientID: my-client-id
          audience: mcp://payments
          scopes: [payments.read]
          secretKeyRef:
            name: payments-oauth
            key: clientSecret
```

### SPIFFE workload identity

Dapr injects a SPIFFE JWT SVID per request. No secrets needed — Sentry issues the SVID automatically.

```yaml
spec:
  endpoint:
    streamableHTTP:
      url: https://payments.internal/mcp
      auth:
        spiffe:
          jwt:
            header: Authorization
            headerValuePrefix: "Bearer "
            audience: mcp://payments
```

## Middleware pipelines

Optional workflow hooks can be invoked before and after tool calls and tool listing. Hooks execute in array order.

- **Before hooks**: if any hook returns an error, the chain stops and the operation is aborted.
- **After hooks**: errors **fail the workflow** — after-hooks can act as authz gates that block the response from reaching the caller.
- **Mutating hooks**: set `mutate: true` to make the hook's return value replace the data flowing through the pipeline (arguments before the tool call, result after it). Default is `false` (observe-only — the hook validates or audits but its output is discarded).

```yaml
spec:
  middleware:
    beforeCallTool:
    - workflow:
        workflowName: rate-limiter
    - workflow:
        workflowName: redact-pii
        appID: auth-service  # Run on a remote Dapr app
      mutate: true             # Hook's return value replaces the arguments
    afterCallTool:
    - workflow:
        workflowName: audit-logger
    - workflow:
        workflowName: response-filter
      mutate: true             # Hook's return value replaces the tool result
```

See [MCPServer spec]({{% ref mcpserver-schema %}}) for the full middleware field reference.

## App scoping

Restrict which Dapr applications can use an MCPServer with `scopes`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: MCPServer
metadata:
  name: payments-mcp
spec:
  endpoint:
    streamableHTTP:
      url: https://payments.internal/mcp
scopes:
- agent-app-1
- agent-app-2
```

## Tolerating load failures

By default, an MCPServer that fails to load (validation error, unreachable endpoint, bad credentials) causes daprd to exit. Set `spec.ignoreErrors: true` to keep the sidecar running and log the failure instead — useful when one MCP server is optional or when other resources on the same daprd must remain available:

```yaml
apiVersion: dapr.io/v1alpha1
kind: MCPServer
metadata:
  name: optional-mcp
spec:
  ignoreErrors: true
  endpoint:
    streamableHTTP:
      url: https://maybe-flaky.internal/mcp
```

When `ignoreErrors` is `true` and load fails, the MCPServer's workflows are not registered, so calls to `dapr.internal.mcp.<server>.*` return `ERR_WORKFLOW_NAME_RESERVED` until the server loads successfully (e.g. via hot-reload).

## Related links

- [MCPServer spec reference]({{% ref mcpserver-schema %}})
- [How-To: Use MCPServer resources]({{% ref howto-use-mcpserver.md %}})
- [Workflow API reference]({{% ref workflow_api %}})
- [How-To: Enable preview features]({{% ref preview-features %}})
