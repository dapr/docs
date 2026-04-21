---
type: docs
title: "MCP server tool reference"
linkTitle: "Tool reference"
weight: 30
description: "Complete reference for every MCP tool exposed by dapr-mcp-server, including input schemas, safety classifications, and example payloads"
---

This page is the authoritative reference for every tool exposed by [`dapr-mcp-server`](https://github.com/dapr/dapr-mcp-server). The server emits these same schemas to MCP clients at connection time; this document mirrors them in human- and agent-readable form so you can plan tool calls without inspecting the live server.

## Conventions

### Registration modes

| Mode | When | Tools |
| --- | --- | --- |
| **Core** — always registered | On every startup, regardless of configured components | `get_components`, `invoke_service`, `invoke_actor_method` |
| **Conditional** — registered only when a matching Dapr component is configured | Server inspects components at startup via `daprd` metadata and registers the corresponding tool group | `state.*` → state tools · `pubsub.*` → pub/sub tools · `bindings.*` → binding tool · `secretstores.*` → secret tools · `lock.*` → lock tools · `conversation.*` → conversation tool · `crypto.*` → crypto tools |

Call `get_components` first to learn which tools your client will actually see.

### Safety classification

Every tool is tagged with one or more of:

| Tag | Meaning |
| --- | --- |
| `read-only` | No state change; safe to call repeatedly without consequence |
| `side-effect` | Changes external state (publishes, writes, acquires a lock, etc.) |
| `destructive` | Can delete or overwrite data, trigger production behavior, expose secrets |
| `idempotent` | Repeated calls with identical input produce the same end state |
| `not-idempotent` | Repeated calls produce additional effects (second publish → second message) |

Use these tags to decide whether a call is safe to auto-retry, whether it needs human approval, and how to compose tools in a workflow.

---

## Metadata

### `get_components`

Retrieves the list of Dapr components currently loaded in the sidecar. Always call this first when you need to discover valid component names or capabilities.

**Safety:** `read-only`, `idempotent`

**Inputs:** none.

**Returns:** array of components, each with:

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Unique component name (e.g., `statestore-redis`) |
| `type` | string | Component type (e.g., `state.redis`, `pubsub.kafka`) |
| `version` | string (optional) | Component version (e.g., `v1`) |
| `capabilities` | array of strings | Component capabilities advertised by Dapr |

**Example response**

```json
{
  "components": [
    {"name": "statestore", "type": "state.redis", "version": "v1", "capabilities": ["TRANSACTIONAL", "ETAG"]},
    {"name": "pubsub",     "type": "pubsub.redis", "version": "v1", "capabilities": []}
  ]
}
```

---

## Service invocation

### `invoke_service`

Calls a method on another Dapr-enabled service. Wraps the Dapr runtime's [Service Invocation API]({{% ref service_invocation_api.md %}}).

**Safety:** `destructive`, `not-idempotent`, `side-effect`

**Inputs:**

| Field | Type | Required | Description |
| --- | --- | :-: | --- |
| `appID` | string | ✓ | Dapr app-id of the target service (e.g., `order-processor`) |
| `method` | string | ✓ | Method / endpoint on the target (e.g., `status`) |
| `data` | string | ✓ | Request body payload, typically JSON-encoded |
| `httpVerb` | string | ✓ | HTTP verb — `GET`, `POST`, `PUT`, `DELETE`. Default: `POST` |
| `metadata` | map[string]string | – | Optional HTTP headers |

**Returns:** parsed response or raw response data, wrapped as the MCP result content.

**Example request**

```json
{
  "appID": "order-processor",
  "method": "orders",
  "httpVerb": "POST",
  "data": "{\"orderId\":\"A-12\",\"qty\":2}",
  "metadata": {"Content-Type": "application/json"}
}
```

---

## Actors

### `invoke_actor_method`

Executes a method on a Dapr virtual actor instance. Wraps the [Actors API]({{% ref actors_api.md %}}).

**Safety:** `destructive`, `not-idempotent`, `side-effect`

**Inputs:**

| Field | Type | Required | Description |
| --- | --- | :-: | --- |
| `actorType` | string | ✓ | Registered actor type (e.g., `payment-processor`) |
| `actorID` | string | ✓ | Unique actor instance ID (e.g., `user-1001`) |
| `method` | string | ✓ | Method name on the actor (e.g., `ProcessOrder`) |
| `data` | string | ✓ | Payload passed to the actor method, typically JSON |

**Returns:** structured result with `actor_type`, `actor_id`, `actor_method`, `actor_response`.

---

## State management

Registered when any `state.*` component is configured. Wraps the [State Management API]({{% ref state_api.md %}}).

### `save_state`

Persists a single key/value pair.

**Safety:** `side-effect`, `idempotent`

**Inputs:**

| Field | Type | Required | Description |
| --- | --- | :-: | --- |
| `storeName` | string | ✓ | State store component name (e.g., `statestore`) |
| `key` | string | ✓ | Storage key. Convention: `<AppID>||<ResourceURI>||<Index>` |
| `value` | string | ✓ | Value to persist, plain string or JSON-encoded |

**Returns:** `key_saved`, `store_name`.

### `get_state`

Retrieves the value for a single key.

**Safety:** `read-only`, `idempotent`

**Inputs:**

| Field | Type | Required | Description |
| --- | --- | :-: | --- |
| `storeName` | string | ✓ | State store component name |
| `key` | string | ✓ | Key to read |

**Returns:** `key`, `value` (or `nil` if not found).

### `delete_state`

Removes a key.

**Safety:** `destructive`, `idempotent`, `side-effect`

**Inputs:** same shape as `get_state`.

**Returns:** `key_deleted`, `store_name`.

### `execute_transaction`

Executes a batch of save/delete operations atomically. Requires a transactional state store (see `capabilities` from `get_components`).

**Safety:** `destructive`, `not-idempotent`, `side-effect`

**Inputs:**

| Field | Type | Required | Description |
| --- | --- | :-: | --- |
| `storeName` | string | ✓ | State store component name |
| `items` | array of TransactionItem | ✓ | Operations to execute atomically |

Each `TransactionItem`:

| Field | Type | Required | Description |
| --- | --- | :-: | --- |
| `key` | string | ✓ | State key |
| `value` | string | ✓ | Value to set; ignored when `isDelete=true` |
| `isDelete` | boolean | ✓ | `true` to delete the key, `false` to save/update |

**Returns:** `operations_executed` count, `store_name`.

---

## Pub/Sub

Registered when any `pubsub.*` component is configured. Wraps the [Pub/Sub API]({{% ref pubsub_api.md %}}).

### `publish_event`

Publishes a message to a topic.

**Safety:** `not-idempotent`, `side-effect`

**Inputs:**

| Field | Type | Required | Description |
| --- | --- | :-: | --- |
| `pubsubName` | string | ✓ | Pub/sub component name |
| `topic` | string | ✓ | Topic name (e.g., `orders`) |
| `message` | string | ✓ | Payload, typically JSON-encoded |

**Returns:** `status`, `pubsub_name`, `topic`.

### `publish_event_with_metadata`

Same as `publish_event` plus message metadata (headers / routing / TTL).

**Safety:** `not-idempotent`, `side-effect`

**Inputs:** adds `metadata` (map[string]string) — e.g., `{"ttlInSeconds": "60"}`.

**Returns:** `status`, `pubsub_name`, `topic`, `metadata_keys` count.

---

## Bindings

Registered when any `bindings.*` component is configured. Wraps the [Output Bindings API]({{% ref bindings_api.md %}}).

### `invoke_output_binding`

Invokes an operation on an output binding to reach an external system (webhook, queue, object store, database, etc.).

**Safety:** `destructive`, `not-idempotent`, `side-effect`

**Inputs:**

| Field | Type | Required | Description |
| --- | --- | :-: | --- |
| `bindingName` | string | ✓ | Binding component name |
| `operation` | string | ✓ | Binding-specific operation (e.g., `create`, `get`, `delete`) |
| `data` | string | ✓ | Payload |
| `metadata` | map[string]string | ✓ | Binding-specific metadata (e.g., `key` for a storage binding) |

**Returns:** `binding_name`, `operation`, `response_data`.

---

## Secrets

Registered when any `secretstores.*` component is configured. Wraps the [Secrets API]({{% ref secrets_api.md %}}).

### `get_secret`

Retrieves a single secret by name.

**Safety:** `read-only`, `idempotent`

**Inputs:**

| Field | Type | Required | Description |
| --- | --- | :-: | --- |
| `storeName` | string | ✓ | Secret store component name (e.g., `vault`) |
| `secretName` | string | ✓ | Name of the secret |
| `metadata` | map[string]string | – | Optional per-request metadata (e.g., `version_id`) |

**Returns:** secret key/value pairs as JSON.

### `get_bulk_secrets`

Retrieves every secret the application has access to from a store. **High-risk** — invoke only when the user explicitly asks to enumerate.

**Safety:** `read-only`, `idempotent`

**Inputs:**

| Field | Type | Required | Description |
| --- | --- | :-: | --- |
| `storeName` | string | ✓ | Secret store component name |
| `metadata` | map[string]string | – | Optional per-request metadata |

**Returns:** count of secrets retrieved plus the full JSON payload.

---

## Conversation

Registered when any `conversation.*` component is configured. Wraps the [Conversation API]({{% ref conversation_api.md %}}).

### `converse_with_llm`

Delegates a reasoning / text generation turn to a downstream LLM component. Useful when the current agent needs to specialize (route to a reasoning-heavy model) or resume a long-running conversation session.

**Safety:** `read-only`, `idempotent`

**Inputs:**

| Field | Type | Required | Description |
| --- | --- | :-: | --- |
| `name` | string | ✓ | LLM component name (e.g., `ollama`, `openai`) |
| `prompt` | string | ✓ | User prompt / instruction |
| `contextId` | string | – | Continues an existing session; omit to start a new one |
| `temperature` | float64 | – | `0.0`–`1.0`. Default `0.7` |

**Returns:** full LLM response object including choices and tool calls if any.

---

## Cryptography

Registered when any `crypto.*` component is configured. Wraps the [Cryptography API]({{% ref cryptography_api.md %}}).

### `encrypt_data`

Encrypts plaintext using a cryptography component.

**Safety:** `destructive`, `not-idempotent`, `side-effect`

**Inputs:**

| Field | Type | Required | Description |
| --- | --- | :-: | --- |
| `componentName` | string | ✓ | Crypto component name |
| `plainText` | string | ✓ | Plaintext to encrypt |

**Returns:** `cipher_text`.

### `decrypt_data`

Reverses `encrypt_data`.

**Safety:** `read-only`, `idempotent`

**Inputs:**

| Field | Type | Required | Description |
| --- | --- | :-: | --- |
| `componentName` | string | ✓ | Crypto component name |
| `cipherText` | string | ✓ | Base64-encoded ciphertext produced by `encrypt_data` |

**Returns:** `plain_text`, `component_name`.

---

## Distributed locking

Registered when any `lock.*` component is configured. Wraps the [Distributed Lock API]({{% ref distributed_lock_api.md %}}).

### `acquire_lock`

Attempts to acquire a named lock. Always pair with `release_lock` in the same workflow.

**Safety:** `idempotent`, `side-effect`

**Inputs:**

| Field | Type | Required | Description |
| --- | --- | :-: | --- |
| `storeName` | string | ✓ | Lock store component name |
| `resourceID` | string | ✓ | Unique resource name to lock |
| `lockOwner` | string | ✓ | Unique owner ID (e.g., `ai-agent-42`) |
| `expiryInSeconds` | int32 | ✓ | Auto-release timeout. Recommend 5–60 s |

**Returns:** `lock_acquired` (bool), `resource_id`, `owner_id`.

### `release_lock`

Releases a lock acquired earlier by the same owner.

**Safety:** `not-idempotent`, `side-effect`

**Inputs:**

| Field | Type | Required | Description |
| --- | --- | :-: | --- |
| `storeName` | string | ✓ | Lock store component name |
| `resourceID` | string | ✓ | Resource name from the matching `acquire_lock` |
| `lockOwner` | string | ✓ | Same owner ID as the matching `acquire_lock` |

**Returns:** `release_status_code`, `release_status_text`, `resource_id`. Status codes: `SUCCESS`, `LOCK_UNEXIST`, `LOCK_BELONG_TO_OTHERS`, `INTERNAL_ERROR`.

---

## Related

- [Overview]({{% ref mcp-server-overview.md %}}) — what `dapr-mcp-server` is and when to use it
- [Getting started]({{% ref mcp-server-getting-started.md %}}) — install, configure, first request
- [Authentication]({{% ref mcp-authentication.md %}}) — securing the server with OAuth2, SPIFFE, or Dapr Sentry
- [Integrations]({{% ref mcp-server-integrations.md %}}) — wiring up Claude Desktop, VS Code, Cursor, dapr-agents
