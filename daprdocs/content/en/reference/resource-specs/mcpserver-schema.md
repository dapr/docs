---
type: docs
title: "MCPServer spec"
linkTitle: "MCPServer"
description: "The basic spec for a Dapr MCPServer resource"
weight: 3500
---

The `MCPServer` is a Dapr resource that declares a connection to an MCP (Model Context Protocol) server. Dapr loads these at startup, discovers the server's tools, and registers built-in durable workflow orchestrations for each one: `dapr.internal.mcp.<server>.ListTools` for tool discovery and `dapr.internal.mcp.<server>.CallTool.<tool>` per discovered tool for durable tool execution. Callers invoke them through the standard [Dapr Workflow API]({{% ref workflow_api %}}).

{{% alert title="Note" color="primary" %}}
Any MCPServer resource can be restricted to a particular [namespace]({{% ref isolation-concept.md %}}) and restricted access through scopes to any particular set of applications.
{{% /alert %}}

## Format

Exactly one of `streamableHTTP`, `sse`, or `stdio` must be set under `endpoint`.

### Streamable HTTP transport

```yaml
apiVersion: dapr.io/v1alpha1
kind: MCPServer
metadata:
  name: <NAME>
spec:
  ignoreErrors: <REPLACE-WITH-BOOL> # Optional. When true, daprd keeps running if this MCPServer fails to load.
  endpoint:
    streamableHTTP:
      url: <REPLACE-WITH-URL> # Required. The endpoint URL of the MCP server.
      protocolVersion: <REPLACE-WITH-VERSION> # Optional. MCP spec version (e.g. "2025-06-18").
      timeout: <REPLACE-WITH-TIMEOUT> # Optional. Per-call deadline (e.g. "30s").
      headers: # Optional
        - name: <REPLACE-WITH-HEADER-NAME>
          value: <REPLACE-WITH-HEADER-VALUE>
        - name: <REPLACE-WITH-HEADER-NAME>
          secretKeyRef:
            name: <REPLACE-WITH-SECRET-NAME>
            key: <REPLACE-WITH-SECRET-KEY>
      auth: # Optional
        secretStore: <REPLACE-WITH-SECRETSTORE>
        oauth2:
          issuer: <REPLACE-WITH-TOKEN-ENDPOINT>
          clientID: <REPLACE-WITH-CLIENT-ID> # Optional. OAuth2 client identifier.
          audience: <REPLACE-WITH-AUDIENCE>
          scopes:
            - <REPLACE-WITH-SCOPE>
          secretKeyRef:
            name: <REPLACE-WITH-SECRET-NAME>
            key: <REPLACE-WITH-SECRET-KEY>
        spiffe:
          jwt:
            header: <REPLACE-WITH-HEADER-NAME>
            headerValuePrefix: <REPLACE-WITH-PREFIX>
            audience: <REPLACE-WITH-AUDIENCE>
  middleware: # Optional
    beforeCallTool:
      - workflow:
          workflowName: <REPLACE-WITH-WORKFLOW-NAME>
          appID: <REPLACE-WITH-APP-ID> # Optional. Remote app.
        mutate: <REPLACE-WITH-BOOL> # Optional. When true, hook return value replaces the arguments.
    afterCallTool:
      - workflow:
          workflowName: <REPLACE-WITH-WORKFLOW-NAME>
        mutate: <REPLACE-WITH-BOOL> # Optional. When true, hook return value replaces the result.
    beforeListTools:
      - workflow:
          workflowName: <REPLACE-WITH-WORKFLOW-NAME>
    afterListTools:
      - workflow:
          workflowName: <REPLACE-WITH-WORKFLOW-NAME>
        mutate: <REPLACE-WITH-BOOL> # Optional. When true, hook return value replaces the result.
  catalog: # Optional. Informational only.
    displayName: <REPLACE-WITH-DISPLAY-NAME>
    description: <REPLACE-WITH-DESCRIPTION>
    owner:
      team: <REPLACE-WITH-TEAM>
      contact: <REPLACE-WITH-CONTACT>
    tags:
      - <REPLACE-WITH-TAG>
    links:
      docs: <REPLACE-WITH-URL>
scopes: # Optional
  - <REPLACE-WITH-SCOPED-APPIDS>
```

### SSE transport

```yaml
apiVersion: dapr.io/v1alpha1
kind: MCPServer
metadata:
  name: <NAME>
spec:
  endpoint:
    sse:
      url: <REPLACE-WITH-URL>
      protocolVersion: <REPLACE-WITH-VERSION> # Optional
      timeout: <REPLACE-WITH-TIMEOUT> # Optional
      headers: # Optional. Same format as streamableHTTP.
        - name: <REPLACE-WITH-HEADER-NAME>
          value: <REPLACE-WITH-HEADER-VALUE>
      auth: # Optional. Same format as streamableHTTP.
        secretStore: <REPLACE-WITH-SECRETSTORE>
```

### Stdio transport

This is not supported in Kubernetes-hosted modes.

```yaml
apiVersion: dapr.io/v1alpha1
kind: MCPServer
metadata:
  name: <NAME>
spec:
  endpoint:
    stdio:
      command: <REPLACE-WITH-COMMAND> # Required.
      args: # Optional
        - <REPLACE-WITH-ARG>
      env: # Optional
        - name: <REPLACE-WITH-ENV-NAME>
          value: <REPLACE-WITH-ENV-VALUE>
        - name: <REPLACE-WITH-ENV-NAME>
          secretKeyRef:
            name: <REPLACE-WITH-SECRET-NAME>
            key: <REPLACE-WITH-SECRET-KEY>
```

## Spec fields

### Top-level

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| ignoreErrors | N | When `true`, daprd keeps running if this MCPServer fails validation or secret resolution. When `false` (default), such failures cause daprd to exit gracefully. | `true` |
| endpoint | Y | The transport and target of the MCP server. See [Endpoint](#endpoint) below. | |
| middleware | N | Optional workflow hooks invoked around tool and list operations. See [Middleware fields](#middleware-fields) below. | |
| catalog | N | Informational governance metadata. See [Catalog fields](#catalog-fields) below. | |

### Endpoint

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| endpoint.streamableHTTP | N* | Configuration for the streamable HTTP transport. | See format above |
| endpoint.sse | N* | Configuration for the legacy SSE transport. | See format above |
| endpoint.stdio | N* | Configuration for the stdio subprocess transport. | See format above |

\* Exactly one of `streamableHTTP`, `sse`, or `stdio` must be set.

### Streamable HTTP / SSE fields

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| url | Y | The endpoint URL of the MCP server. | `"https://mcp.example.com/"` |
| protocolVersion | N | MCP spec version in date format. When unset, the SDK negotiates automatically. | `"2025-06-18"` |
| timeout | N | Per-call deadline for MCP requests. | `"30s"` |
| headers | N | HTTP headers injected on all outbound requests. Supports `value`, `secretKeyRef`, and `envRef`. | `name: "Authorization"` `secretKeyRef.name: "my-secret"` `secretKeyRef.key: "token"` |
| auth | N | Authentication configuration. See auth fields below. | |

### Auth fields

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| auth.secretStore | N | Dapr secret store for resolving `secretKeyRef` entries in headers. Defaults to `"kubernetes"`. | `"my-secret-store"` |
| auth.oauth2.issuer | Y (if oauth2) | Token endpoint of the authorization server. | `"https://auth.example.com/token"` |
| auth.oauth2.clientID | N | OAuth2 client identifier sent to the token endpoint. Required by RFC 6749 for standard `client_credentials` flow; may be left empty for non-standard flows. | `"my-client-id"` |
| auth.oauth2.audience | N | Audience claim for the token request. | `"mcp://payments"` |
| auth.oauth2.scopes | N | Scopes requested in the token. | `["read", "write"]` |
| auth.oauth2.secretKeyRef | N | Reference to the client secret in the secret store. | `name: "oauth-secret"` `key: "clientSecret"` |
| auth.spiffe.jwt.header | Y (if spiffe) | HTTP header name to inject the JWT into. | `"Authorization"` |
| auth.spiffe.jwt.headerValuePrefix | N | String prepended to the JWT value. | `"Bearer "` |
| auth.spiffe.jwt.audience | Y (if spiffe) | Intended audience for the JWT. | `"mcp://payments"` |

### Stdio fields

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| stdio.command | Y | The executable to run. | `"npx"` |
| stdio.args | N | Command-line arguments. | `["-y", "@modelcontextprotocol/server-filesystem"]` |
| stdio.env | N | Environment variables for the subprocess. Supports `value`, `secretKeyRef`, and `envRef`. | `name: "API_KEY"` `value: "secret"` |

### Middleware fields

Middleware hooks are executed in array order. Error behavior differs by hook type:

- `beforeCallTool` errors abort the chain; the workflow completes with `CallToolResult{isError: true}` so the caller can self-correct.
- `beforeListTools` errors abort the chain and the error is returned.
- `afterCallTool` errors **fail the workflow** — these hooks can act as authorization gates that block the response.
- `afterListTools` errors are logged but do not affect the result.

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| middleware.beforeCallTool | N | Hooks invoked before each CallTool. | See format above |
| middleware.afterCallTool | N | Hooks invoked after each CallTool. | See format above |
| middleware.beforeListTools | N | Hooks invoked before each ListTools. | See format above |
| middleware.afterListTools | N | Hooks invoked after each ListTools. | See format above |

Each hook entry:

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| workflow.workflowName | Y | Name of the workflow to invoke. | `"rbac-check"` |
| workflow.appID | N | Target a remote Dapr app. When unset, runs locally. | `"auth-service"` |
| mutate | N | When `true`, the hook's return value replaces the data flowing through the pipeline (arguments for `beforeCallTool`; result for `afterCallTool` and `afterListTools`). When `false` (default), the hook is observe-only. Not supported on `beforeListTools`. | `true` |

### Catalog fields

Catalog fields are purely informational and have no effect on runtime behavior.

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| catalog.displayName | N | Human-readable display name. | `"Payments MCP"` |
| catalog.description | N | Description of the MCP server. | `"Payment processing tools"` |
| catalog.owner.team | N | Team responsible for the MCP server. | `"platform-team"` |
| catalog.owner.contact | N | Contact information. | `"platform@example.com"` |
| catalog.tags | N | Tags for categorization. | `["payments", "production"]` |
| catalog.links | N | Named URLs (docs, runbook, dashboard). | `docs: "https://..."` |

## Related links

- [MCPServer resource overview]({{% ref mcp-server-resource.md %}})
- [How-To: Use MCPServer resources]({{% ref howto-use-mcpserver.md %}})
- [How-To: Enable preview features]({{% ref preview-features %}})
