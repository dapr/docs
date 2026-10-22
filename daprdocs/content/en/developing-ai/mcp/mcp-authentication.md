---
type: docs
title: "Authenticating an MCP server"
linkTitle: "Getting Started"
weight: 20
description: "How to enable MCP client-side and server-side authentication"
---

## Overview

The [MCP specification](https://modelcontextprotocol.io/specification/) does not mandate any form of authentication between an MCP client and server. The security model is left to the user to plan and implement. This creates a maintenance burden on developers and opens up MCP servers to various attack surfaces.

While MCP servers lack identity, OAuth2 is a well established standard that can be used to properly authenticate MCP clients to MCP servers.

OAuth2 becomes essential when MCP servers are:

* Multi-tenant
* Remote
* Cloud-hosted
* Connected to confidential systems
* Performing privileged actions on behalf of a user
* Exposing tools that must be permission-gated

Dapr enables OAuth2 authentication between MCP clients and servers using [middleware]({{% ref "middleware" %}}) components.

## Types of authentication

Dapr supports two critical authentication mechanisms for production grade deployments of MCP servers - Client-side and Server-side.

### Client-side Authentication

The client initiates OAuth2 to obtain an access token and includes it when connecting to the MCP server.
This proves the user’s identity and permissions and is required for remote, sensitive, or multi-tenant MCP servers.
It ensures the server can trust who is calling and what scopes the client is allowed to use.

### Server-side Authentication

The server validates the client’s token or, if missing or insufficient, triggers an OAuth2 login or scope upgrade.
This is needed for cloud-hosted or shared MCP servers, tenant-aware systems, and integrations that require user-specific authorization.
It enforces access control, isolates users, and protects privileged tools and data.

## How to enable Client-side Authentication

### Define the MCP Server as an HTTPEndpoint

Dapr allows developers and operators to model remote HTTP services as resources that can be governed and invoked using the Dapr [Service Invocation API]({{% ref "service-invocation-overview" %}}).
Create this `HTTPEndpoint` resource to represent the MCP server:

```yaml
apiVersion: dapr.io/v1alpha1
kind: HTTPEndpoint
metadata:
  name: "mcp-server"
spec:
  baseUrl: https://my-mcp-server:443
  headers:
  - name: "Accept"
    value: "text/event-stream"
```

### Define the OAuth2 middleware and configuration components

The following middleware component defines the connection to the OAuth2 provider:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: oauth2
spec:
  type: middleware.http.oauth2
  version: v1
  metadata:
  - name: clientId
    value: "<client-id>"
  - name: clientSecret
    value: "<client-secret>"
  - name: authURL
    value: "<authorization-url>"
  - name: tokenURL
    value: "<token-url>"
  - name: scopes
    value: "<comma-separated scopes>"
```

Next, create the configuration resource which tells Dapr to use the OAuth2 middleware:

```yaml
piVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: auth
spec:
  tracing:
    samplingRate: "1"
  httpPipeline:
    handlers:
    - name: oauth2 # reference the oauth component here
      type: middleware.http.oauth2    
```

{{% alert title="Note" color="primary" %}} 
Visit [this link]({{% ref "component-secrets.md" %}}) to read on how to provide secrets to Dapr components
{{% /alert %}}

### Call the MCP server using an MCP client

Copy the following code to a file named `mcpclient.py`:

```python
import asyncio
from mcp import ClientSession
from mcp.transport.http import HttpClientTransport

async def main():
    # Default address of the Dapr process. Use an environment variable in production
    server_url = "http://localhost:3500/"

    # Create an HTTP/SSE transport with a header to target our HTTPEndpoint defined above
    transport = HttpClientTransport(
        url=server_url,
        headers={
          "dapr-app-id": "mcp-server",
        }
        event_headers={
            "Accept": "text/event-stream",
        },
    )

    # Create an MCP session bound to the transport
    async with ClientSession(transport) as session:
        await session.initialize()

        tools = await session.call("tools/list")
        print("Server Tools:", tools))

        await session.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
```

### Run the MCP client with Dapr

Put the YAML files above into a `components` directory and run Dapr:

```bash
dapr run --app-id mcpclient --resources-path ./components --dapr-http-port 3500 --config ./config.yaml -- python mcpclient.py
```

The MCP client causes Dapr to start an OAuth2 pipeline before connecting to the MCP server.  

## How to enable Server-side Authentication

### Define the OAuth2 middleware and configuration components

Define a middleware component the same as the client example.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: oauth2
spec:
  type: middleware.http.oauth2
  version: v1
  metadata:
  - name: clientId
    value: "<client-id>"
  - name: clientSecret
    value: "<client-secret>"
  - name: authURL
    value: "<authorization-url>"
  - name: tokenURL
    value: "<token-url>"
  - name: scopes
    value: "<comma-separated scopes>"
```

Next, create the configuration component, with the modification of an `appHttpPipeline` field. This tells Dapr to apply the middleware for incoming calls.

```yaml
piVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: auth
spec:
  tracing:
    samplingRate: "1"
  appHttpPipeline:
    handlers:
    - name: oauth2 # reference the oauth component here
      type: middleware.http.oauth2    
```

### Run the MCP server with Dapr

Put the YAML files above in `components` directory and run Dapr:

```bash
dapr run --app-id mcpclient --resources-path ./components --dapr-http-port 3500 --config ./config.yaml -- python mcpserver.py
```

Dapr will start an OAuth2 pipeline when a request for the MCP server arrives.
