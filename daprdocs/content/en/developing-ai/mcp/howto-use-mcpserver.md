---
type: docs
title: "How-To: Use MCPServer resources"
linkTitle: "How-To: Use MCPServer"
weight: 15
description: "Use MCPServer resources to discover and call tools on MCP servers"
---

This guide walks you through declaring an MCPServer resource, listing its tools, and calling a tool through the Dapr Workflow API. Dapr handles the MCP protocol, transport, authentication, and durable retries — your application just starts workflows by name.

## Step 1: Define the MCPServer resource

Create a file `mcpserver.yaml` in your resources directory:

```yaml
apiVersion: dapr.io/v1alpha1
kind: MCPServer
metadata:
  name: my-mcp-server
spec:
  endpoint:
    streamableHTTP:
      url: http://localhost:8080
```

This tells Dapr to connect to an MCP server at `http://localhost:8080` using the streamable HTTP transport.

## Step 2: List available tools

Start a `ListTools` workflow using the Dapr Workflow API:

```bash
curl -X POST "http://localhost:3500/v1.0-beta1/workflows/dapr/dapr.internal.mcp.my-mcp-server.ListTools/start" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:
```json
{"instanceID": "abc123"}
```

Poll for the result:

```bash
curl "http://localhost:3500/v1.0-beta1/workflows/dapr/abc123"
```

When `runtimeStatus` is `"COMPLETED"`, the `properties["dapr.workflow.output"]` field contains the tool list. Each tool's `input_schema` is the raw JSON Schema for its arguments:

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

## Step 3: Call a tool

Each MCP tool gets its own workflow named `dapr.internal.mcp.<server>.CallTool.<tool>`. The tool name is in the workflow name, so the input only carries the arguments:

```bash
curl -X POST "http://localhost:3500/v1.0-beta1/workflows/dapr/dapr.internal.mcp.my-mcp-server.CallTool.get_weather/start" \
  -H "Content-Type: application/json" \
  -d '{
    "arguments": {"city": "Seattle"}
  }'
```

Poll for the result as in Step 2. The output is a `CallMCPToolResponse` proto serialized as JSON. Each entry in `content` is a oneof — text, image, audio, resource_link, or embedded_resource:

```json
{
  "is_error": false,
  "content": [
    {"text": {"text": "Weather in Seattle: sunny, 72°F"}}
  ]
}
```

If the tool call fails at the MCP level (e.g. unknown tool, auth error), `is_error` is `true` and the error is in `content`. The workflow itself completes successfully — `is_error` is not a workflow failure.

If your call is missing a required argument, you get the same `is_error: true` shape immediately — Dapr validates against the tool's cached JSON Schema before contacting the MCP server, so agents/LLMs see actionable errors without burning a network round-trip.

## Step 4 (optional): Add authentication

Add OAuth2 client credentials to authenticate with the MCP server:

```yaml
apiVersion: dapr.io/v1alpha1
kind: MCPServer
metadata:
  name: my-mcp-server
spec:
  endpoint:
    streamableHTTP:
      url: https://mcp.example.com
      auth:
        secretStore: kubernetes
        oauth2:
          issuer: https://auth.example.com/token
          clientID: my-client-id
          audience: mcp://my-server
          secretKeyRef:
            name: mcp-oauth-secret
            key: clientSecret
```

Dapr fetches a token from the issuer and injects it as a Bearer token on every MCP request. HTTP clients are cached per MCPServer for efficiency.

## Step 5 (optional): Add middleware

Middleware hooks let you run authorization, redaction, and audit as Dapr workflows on every tool call — no agent code change. Hooks are wired in the MCPServer spec and registered as plain workflows in your application (or in a dedicated policy app via `appID`).

### Step 5.1: Add an RBAC hook (deny on policy violation)

```yaml
spec:
  middleware:
    beforeCallTool:
    - workflow:
        workflowName: rbac-check
```

Register a workflow named `rbac-check` in your application. It receives an `MCPBeforeCallToolHookInput`:

```text
{ name, tool_name, arguments }
```

`name` is the MCPServer resource name; `arguments` is the JSON object the caller passed. Return an error to deny; return nil to allow.

```text
workflow rbac-check(input):
  # Argument-level RBAC: inspect the payload and decide.
  if input.tool_name == "issue_refund":
    if input.arguments["amount"] > 10_000:
      return error("rbac: refunds over $10K require manual approval")

  if input.tool_name in DESTRUCTIVE_TOOLS:
    if not input.arguments.get("dry_run", false):
      return error("rbac: %s requires dry_run=true",
                   input.tool_name)

  return ok   # nil error so tool call proceeds
```

The hook runs as a durable workflow — if daprd restarts mid-policy-check, Scheduler re-delivers and the decision completes.

> **Caller-keyed RBAC ("which apps can call which tools") belongs at the [`WorkflowAccessPolicy`]({{% ref workflow_api %}}) layer, not the hook.** The hook input doesn't carry caller appID; the policy is. Use the policy as the perimeter and hooks for argument-level decisions.

### Step 5.2: Add a mutating PII redaction hook

To transform `arguments` before they reach the tool — redact PII, normalize values, inject defaults — set `mutate: true`:

```yaml
spec:
  middleware:
    beforeCallTool:
    - workflow:
        workflowName: redact-pii
      mutate: true
```

```text
workflow redact-pii(input):
  # input: { name, tool_name, arguments }
  args = copy(input.arguments)
  if "email" in args:
    args["email"] = mask_email(args["email"])
  return { name: input.name, tool_name: input.tool_name, arguments: args }
```

The hook returns the same shape it receives. The MCP server (and any subsequent hooks in the chain) sees only the transformed `arguments`.

For after-the-fact response filtering or audit logging, wire the same way under `afterCallTool` — see the [overview examples]({{% ref "mcp-server-resource.md#examples-common-patterns" %}}) for the full set of patterns.

### Step 5.3: Centralize policy on a shared app

To run the hook on a dedicated policy app instead of locally, add `appID`:

```yaml
spec:
  middleware:
    beforeCallTool:
    - workflow:
        workflowName: rbac-check
        appID: policy-service   # runs on the Dapr app named "policy-service"
```

The same workflow runs on the named app via service invocation. One shared policy app (RBAC, audit, PII redaction) governs many agent apps without each app embedding the policy. Update the central workflow once; every MCPServer that references it picks up the change without redeploying its callers.

> See the [overview examples]({{% ref "mcp-server-resource.md#examples-common-patterns" %}}) for canonical hook patterns (RBAC, rate limiting, audit, response filtering, tool catalog filtering).

## Related links

- [MCPServer resource overview]({{% ref mcp-server-resource.md %}})
- [MCPServer spec reference]({{% ref mcpserver-schema %}})
- [Workflow API reference]({{% ref workflow_api %}})
