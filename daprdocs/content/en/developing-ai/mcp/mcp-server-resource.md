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
- **Per-tool RBAC, audit, and redaction in YAML.** Order-preserving `beforeCallTool` / `afterCallTool` / `beforeListTools` / `afterListTools` hooks run argument-level authorization, rate limiting, PII redaction, audit logging, and response filtering as Dapr workflows. Set `appID` on a hook to route it to a centralized policy app, so one shared RBAC service governs every agent without each app embedding the policy.
- **Durable execution.** Tool calls run as workflow activities backed by Dapr Scheduler reminders. If daprd is restarted mid-call, the scheduler re-delivers the activity to the new instance and the call completes — agents don't have to implement their own retry/resume logic. Inside a single activity, transient connection drops are absorbed automatically: Dapr keeps one warm session per MCPServer (with keep-alive pings) and reconnects once on `ErrConnectionClosed` before the workflow ever sees the blip.
- **Fast feedback for callers.** Required-field validation runs against the cached JSON Schema *before* the MCP server is contacted. Missing arguments come back as a structured `mcp.CallToolResult{isError: true}` immediately — agents and LLMs get an actionable error without burning a network round-trip.
- **Per-tool observability.** Each tool gets its own workflow name (`dapr.internal.mcp.<server>.CallTool.<tool>`), so traces, metrics, and audit logs are sliced per-tool out of the box. You see exactly which tool was called, by whom, with what arguments, and what came back.
- **Declarative authentication.** OAuth2 client credentials, SPIFFE workload identity, and static-header auth are all configured in YAML. Dapr fetches and refreshes tokens, caches per-MCPServer HTTP clients, and never exposes raw credentials to your app.
- **Scoping and multi-tenancy.** MCPServers are namespaced and `scopes`-restricted, just like other Dapr resources. One MCP server can be shared across many apps with different access policies.
- **Hot reload.** Add, remove, or modify MCPServer resources at runtime — Dapr reloads them without a sidecar restart.

| Without MCPServer | With MCPServer |
|---|---|
| Application manages MCP connections, retries, and credentials | Declare YAML, Dapr handles the rest |
| Sidecar crash mid-call = lost call | Scheduler reminder re-delivers the activity, workflow resumes |
| Per-tool tracing/metrics requires custom instrumentation | One workflow per tool — built-in observability slicing |
| Each app hardcodes its own MCP connection logic | Single resource, shared across apps via `scopes` |
| Tool-call RBAC and audit logic embedded in agent code | Declared per MCPServer in YAML, enforced as durable workflows, centralizable via `appID` |

## How it works

For each loaded MCPServer named `<server>`, daprd:

1. **Connects** to the MCP server using the configured transport (streamable HTTP, SSE, or stdio).
2. **Discovers** the tools the server exposes (one MCP `tools/list` round-trip).
3. **Registers** durable workflow orchestrations:
   - `dapr.internal.mcp.<server>.ListTools` — returns the cached tool list.
   - `dapr.internal.mcp.<server>.CallTool.<tool>` — one workflow per discovered tool. Each invokes the tool durably as an activity, with optional middleware hooks before/after.

Callers start these workflows through the standard [Dapr Workflow API]({{% ref workflow_api %}}). Dapr Workflows takes care of scheduling, retries on transient failures, and resuming after sidecar restarts.

You don't need to enable workflows separately — loading an MCPServer is sufficient. Dapr's workflow engine activates as soon as any MCPServer resource is present, even if no SDK workflow client ever connects.

### Calling a tool

Start a `CallTool.<tool>` workflow with just the arguments — the tool name is encoded in the workflow name itself:

```
POST /v1.0-beta1/workflows/dapr/dapr.internal.mcp.<server>.CallTool.<tool>/start
Content-Type: application/json

{
  "arguments": {"city": "Seattle"}
}
```

Poll for the result with `GET /v1.0-beta1/workflows/dapr/<instanceID>`. The workflow output is a [MCP `CallToolResult`](https://modelcontextprotocol.io/specification/2025-11-25/server/tools) — byte-for-byte the same shape as the MCP wire spec. Each entry in `content` is a flat tagged union (`type` discriminator + per-variant fields):

```json
{
  "isError": false,
  "content": [
    {"type": "text", "text": "Weather in Seattle: sunny, 72°F"}
  ]
}
```

Other content shapes are similarly flat: `{"type": "image", "data": "<base64>", "mimeType": "image/png"}` (likewise for `audio`); resource references use `{"type": "resource_link", "uri": "...", "name": "...", "mimeType": "...", "description": "..."}` or `{"type": "resource", "resource": {"uri": "...", "mimeType": "...", "text": "..." | "blob": "<base64>"}}`.

If the tool call fails at the MCP level (unknown tool, validation failure, server-side auth error), `isError` is `true` and the failure is described in `content` — the workflow itself completes successfully so the calling agent or LLM receives a structured error it can act on (retry, pick a different tool, or surface to the user).

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
      "inputSchema": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"]
      }
    }
  ]
}
```

Tool definitions are cached at MCPServer load time and refreshed on hot-reload. Subsequent `ListTools` workflow calls return instantly from the cache — no upstream `tools/list` round-trip — so agents that call `ListTools` repeatedly pay zero MCP-server latency after the initial load.

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

### Built-in limits

Dapr applies a few hard limits to MCP server interactions so that a misbehaving or hostile MCP server can't exhaust sidecar resources:

- **Tool list pagination**: at most 500 pages per `tools/list` round-trip. A server that returns more is rejected at load time rather than silently truncated.
- **Schema cache**: per MCPServer, at most 500 cached tool schemas, each capped at 1 MB.
- **HTTP response-headers timeout**: 5 seconds time-to-first-byte on every outbound request. SSE streams remain unaffected because the timeout only bounds initial header receipt.

These are intentionally not user-tunable — they're sized for typical production MCP servers and ensure the sidecar stays bounded under adversarial input.

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

Dapr injects a SPIFFE JWT SVID per request. No secrets needed — Sentry issues the SVID automatically. The SVID is fetched fresh on every outbound request rather than cached in-process, so there's no in-memory token cache, no refresh races, and no stale-credential window.

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

Middleware hooks turn tool-call governance into declarative YAML enforced by Dapr Workflows. Optional hooks run in array order before and after tool calls and tool listing. See the [examples](#examples-common-patterns) below for the canonical patterns.

- **Before hooks**: if any hook returns an error, the chain stops and the operation is aborted.
- **`afterCallTool` hooks**: errors **fail the workflow** — these hooks can act as authz gates that block the response from reaching the caller.
- **`afterListTools` hooks**: errors are logged but do not affect the result returned to the caller.
- **Mutating hooks**: set `mutate: true` to make the hook's return value replace the data flowing through the pipeline (arguments before the tool call, result after it). Default is `false` (observe-only — the hook validates or audits but its output is discarded). `mutate` is not supported on `beforeListTools`.

### Hook input shapes

Each hook is a Dapr workflow that receives a typed input from the runtime:

```text
beforeCallTool input:  { name, toolName, arguments }
afterCallTool  input:  { name, toolName, arguments, result }   # result: bytes — JSON-encoded MCP CallToolResult
beforeListTools input: { name }
afterListTools  input: { name, result }                         # result: bytes — JSON-encoded MCP ListToolsResult
```

`name` is the MCPServer resource name. `arguments` is the JSON object the caller passed. `result` is the JSON-encoded MCP-spec result (camelCase wire shape, byte-compatible with the [MCP specification](https://modelcontextprotocol.io/specification/)). Hook workflows deserialize it with the language's MCP SDK or with plain JSON decoding:

```python
# Python hook example
import json
def after_call_tool(ctx, input):
    result = json.loads(input["result"])
    is_error = result["isError"]
    text = result["content"][0]["text"] if result["content"] else ""
    ...
```

Mutating hooks return the same shape they receive — modify, then return.

### Worked example: argument-level RBAC

A common need is "deny this tool call based on what's in `arguments`" — for example, refuse refunds above a threshold, block tools that touch a tenant the request doesn't belong to, or reject calls whose payload matches a denylist. Wire a `beforeCallTool` hook with `mutate: false`:

```yaml
spec:
  middleware:
    beforeCallTool:
      - workflow:
          workflowName: rbac-check
          appID: policy-service   # optional — see "Centralized policy app" below
```

Workflow body (pseudocode — language-neutral):

```text
workflow rbac-check(input):
  # input: { name, toolName, arguments }
  if input.toolName == "issue_refund":
    amount = input.arguments["amount"]
    if amount > 10_000:
      return error("rbac: refunds over $10K require manual approval")

  if input.toolName in DESTRUCTIVE_TOOLS:
    if not input.arguments.get("dry_run", false):
      return error("rbac: %s requires dry_run=true in this environment",
                   input.toolName)

  return ok   # mutate=false → return value is discarded; nil error means allow
```

A few choices worth naming:

- **`mutate: false`** because the hook only decides allow/deny — it never reshapes arguments. (For PII redaction, you'd flip to `mutate: true` and return the cleaned `arguments`.)
- **`beforeCallTool`** because denial should run *before* the MCP server sees the request. An equivalent `afterCallTool` hook can also gate (after-hook errors fail the workflow), but you've already paid for the upstream call.
- **Caller-keyed RBAC ("who can call which tool") belongs at the [policy layer](#observability-and-access-control), not the hook** — the hook input doesn't carry caller appID.

### Worked example: audit logging

After-hooks observe the result. Wire an `afterCallTool` hook with `mutate: false` to write an audit record without altering the response:

```yaml
spec:
  middleware:
    afterCallTool:
      - workflow:
          workflowName: audit-logger
```

```text
workflow audit-logger(input):
  # input: { name, toolName, arguments, result }
  # `result` is bytes carrying a JSON-encoded MCP CallToolResult; decode first.
  result = json_decode(input.result)
  emit_audit({
    server:    input.name,
    tool:      input.toolName,
    args:      redact(input.arguments),
    succeeded: not result.isError,
    at:        now(),
  })
  return ok   # mutate=false → result reaches the caller unchanged
```

Because the audit hook is itself a Dapr Workflow, the write is durable: an emitter restart between `emit_audit` activity start and ack does not drop the record.

### Centralized policy app

When a hook sets `appID: <other-app>`, the hook workflow runs on the named remote Dapr app via service invocation rather than locally. A single shared policy app — RBAC service, audit logger, PII redactor — can govern many agent apps without each app embedding the policy. Update the central workflow once; every MCPServer that references it picks up the change without redeploying its callers.

```yaml
spec:
  middleware:
    beforeCallTool:
      - workflow:
          workflowName: rbac-check
          appID: policy-service
      - workflow:
          workflowName: redact-pii
          appID: policy-service
        mutate: true
    afterCallTool:
      - workflow:
          workflowName: audit-logger
          appID: policy-service
```

### Examples: common patterns

| Pattern | Phase | `mutate` | Sketch |
|---|---|---|---|
| Argument RBAC | `beforeCallTool` | `false` | Inspect `arguments`, return error to deny. |
| Rate limiting | `beforeCallTool` | `false` | Look up budget keyed by `toolName`; return error when exhausted. |
| PII redaction (request) | `beforeCallTool` | `true` | Transform `arguments`, return the cleaned shape. |
| Audit logging | `afterCallTool` | `false` | Emit `{toolName, arguments, result.isError}` (decode `result` bytes first) to a state store / log sink. |
| Response filtering | `afterCallTool` | `true` | Strip / mask fields inside the decoded `CallToolResult` `content`, then JSON-encode and return. |
| Tool list filtering | `afterListTools` | `true` | Drop tools the caller isn't entitled to discover, return the updated `ListToolsResult` as JSON bytes. |

Each pattern is a single workflow with the input/output shape from [Hook input shapes](#hook-input-shapes) above. See the [MCPServer spec]({{% ref mcpserver-schema %}}) for the full middleware field reference.

## Observability and access control

Because each MCP tool gets its own workflow name (`dapr.internal.mcp.<server>.CallTool.<tool>`), every standard Dapr Workflow telemetry surface — instance status, traces, metrics — slices automatically per-tool. No custom instrumentation required. Operators can build per-tool dashboards or alerts using the workflow name as the slicing dimension.

For access control, MCP workflows participate in `WorkflowAccessPolicy` the same way user workflows do. The policy is an allow-list keyed by workflow name + caller appID, so operators can deny or restrict who is permitted to invoke `dapr.internal.mcp.<server>.CallTool.<tool>` (or `ListTools`) from outside the daprd that owns the resource. Self-call exemption (caller appID equals target appID) keeps in-process invocations open by default. This is how a central agent platform restricts which agents can call which tools, even when many agents share a single MCP gateway.

`WorkflowAccessPolicy` and [middleware hooks](#middleware-pipelines) compose, they don't overlap. `WorkflowAccessPolicy` decides *whether a caller can start `CallTool.<tool>` at all* — coarse-grained, appID-keyed, enforced at the workflow boundary. Middleware hooks decide *what happens once the call is in flight* — fine-grained, with full visibility into `arguments` and `result`. Use both: the policy as the perimeter, hooks for tool-call-level argument RBAC, redaction, and audit.

For agents that reach MCP servers through the [service invocation path]({{% ref mcp-service-invocation.md %}}) instead of the workflow client, the equivalent perimeter is `Configuration` `accessControl` attached to the MCP server's App ID — see [MCP access control]({{% ref mcp-access-control.md %}}).

## Deployment topologies

Dapr Workflow's cross-app routing means an MCPServer's workflows don't have to live on the same daprd as the calling agent — the workflow actor's appID determines hosting. Three patterns this enables:

- **MCP gateway** — one dedicated daprd app loads many MCPServer resources (payments, github, internal tools, …). All agent apps invoke MCP workflows on this gateway. Centralized credentials, centralized egress, centralized policy, single place to rotate secrets. Combine with `WorkflowAccessPolicy` to control which agents can reach which tools.
- **One-to-one** — each agent app loads only the MCPServers it needs. Tightest tenant isolation, no cross-app dependency. Best fit when teams own their own MCP integrations end-to-end.
- **Mixed** — some MCPServers on a shared gateway (common infrastructure), some on individual apps (tenant-specific). Use `WorkflowAccessPolicy` to gate gateway tools per-app.

`MCPServer` itself doesn't add anything for this — it's the existing Dapr Workflow cross-app routing. The takeaway: pick whichever topology fits your governance and isolation model; you don't have to flatten everything onto one daprd to use `MCPServer`.

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
- [MCP through Dapr service invocation]({{% ref mcp-service-invocation.md %}}) — for agents that need to keep using off-the-shelf MCP clients
- [MCP access control]({{% ref mcp-access-control.md %}}) — App-ID-keyed `Configuration` `accessControl` for the service-invocation path
- [Python SDK MCP example](https://github.com/dapr/python-sdk/tree/main/examples/mcp) — `DaprMCPClient`, a framework-agnostic client for invoking MCPServer tools from any agent framework
- [dapr-agents MCPServer example](https://github.com/dapr/dapr-agents/tree/main/examples/10-mcpserver) — zero-config MCPServer tool discovery; `DurableAgent` automatically picks up MCPServer tools from sidecar metadata
