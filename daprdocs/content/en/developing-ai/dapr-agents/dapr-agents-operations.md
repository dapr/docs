---
type: docs
title: "Operations"
linkTitle: "Operations"
weight: 80
description: "Get started with secure and reliable operations of Dapr Agents"
aliases:
  - /developing-ai/dapr-agents/dapr-agents-operations
---

## Operations

### Agent Registry 

#### Agent Metadata Schema

Dapr Agents utilizes an Agent Registry (often referenced as `agent-registry` statestore) to communicate Agent capabilities. The Agent Registry contains Agent metadata, including the agent's name, description, version and much more. 
  
In order to facilitate easier handling of version changes to the agent metadata, Dapr Agents supplies versioned JSON schemas. Within the [dapr agents repository] you'll find 3 types of JSON schema files:

- [index.json](https://raw.githubusercontent.com/dapr/dapr-agents/main/schemas/agent-metadata/index.json)
- [latest.json](https://raw.githubusercontent.com/dapr/dapr-agents/main/schemas/agent-metadata/latest.json)
- `v{version}.json`

The `index.json` can be used as a lookup table and looks like:

```
{
  "current_version": "X.Y.Z",
  "schema_url": "https://raw.githubusercontent.com/dapr/dapr-agents/main/schemas/agent-metadata/vX.Y.Z.json",
  "available_versions": [
    "vX.Y.Z",
    "vA.B.C"
  ]
}
```

When the agent starts up it will insert its own metadata into the supplied Agent Registry. The Agent Metadata object contains the key `schema_version` which can be used as a reference to fetch the valid schema for that agent version:

```sh
curl -s -v "https://raw.githubusercontent.com/dapr/dapr-agents/main/schemas/agent-metadata/v$(jq -r '.schema_version' agent-metadata.json).json"
```
