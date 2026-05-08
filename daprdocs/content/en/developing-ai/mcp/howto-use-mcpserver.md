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

Add a `beforeCallTool` hook for RBAC:

```yaml
spec:
  middleware:
    beforeCallTool:
    - workflow:
        workflowName: rbac-check
```

Register a workflow named `rbac-check` in your application. It receives `{mcpServerName, toolName, arguments}` as input. Return an error to deny the call; return nil to allow it.

Add a mutating `beforeCallTool` hook to redact arguments before the tool call:

```yaml
spec:
  middleware:
    beforeCallTool:
    - workflow:
        workflowName: redact-pii
      mutate: true
```

When `mutate: true`, the hook's return value replaces the arguments flowing to the tool call. The hook receives and returns a `{mcpServerName, toolName, arguments}` payload — modify the `arguments` map to redact, transform, or inject defaults.

## Related links

- [MCPServer resource overview]({{% ref mcp-server-resource.md %}})
- [MCPServer spec reference]({{% ref mcpserver-schema %}})
- [Workflow API reference]({{% ref workflow_api %}})
