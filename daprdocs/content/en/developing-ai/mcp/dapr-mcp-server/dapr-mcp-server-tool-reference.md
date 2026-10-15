---
type: docs
title: "Dapr MCP server tool reference"
linkTitle: "Tool reference"
weight: 40
description: "Every tool the Dapr MCP server exposes, its inputs, its safety properties, and the component type that enables it"
aliases:
  - /developing-ai/mcp/mcp-server-tool-reference/
---

The Dapr MCP server exposes 17 tools. Three are always registered. The rest are registered only while the sidecar has at least one component of the matching type, so an agent never sees tools it can't use.

The schema the server sends when a client connects is the authoritative definition of each tool. This page is a readable summary of it.

## Call `get_components` first

Component-specific tools take a component name as input, such as `storeName` or `pubsubName`. An agent should call `get_components` first to learn the names that exist, rather than guess. The server's instructions to the model say the same thing, and tell it to pass `metadata` fields as JSON objects (`{}`), never as strings (`"{}"`).

## Safety properties

Each tool carries the MCP annotations `readOnlyHint`, `destructiveHint`, and `idempotentHint`, which MCP clients can use to decide whether to ask a person before a call. The tables below show them as:

- **Read-only**: reads data and changes nothing.
- **Idempotent**: calling it again with the same inputs has no further effect, so it is safe to retry.
- **Destructive**: may delete or overwrite data, or trigger an action that can't be undone. Consider asking a person to confirm the first call.
- **Side effect**: changes state or triggers an action somewhere.

Every tool except `get_components` also sets `openWorldHint`, because it reaches systems outside the server.

## Tools at a glance

| Tool | Registered when the sidecar has | Safety |
|---|---|---|
| [`get_components`](#get_components) | Always | Read-only, idempotent |
| [`invoke_service`](#invoke_service) | Always | Destructive, side effect, not idempotent |
| [`invoke_actor_method`](#invoke_actor_method) | Always | Destructive, side effect, not idempotent |
| [`save_state`](#save_state) | A `state.*` component | Side effect, idempotent |
| [`get_state`](#get_state) | A `state.*` component | Read-only, idempotent |
| [`delete_state`](#delete_state) | A `state.*` component | Destructive, idempotent |
| [`execute_transaction`](#execute_transaction) | A `state.*` component | Destructive, side effect, not idempotent |
| [`publish_event`](#publish_event) | A `pubsub.*` component | Side effect, not idempotent |
| [`publish_event_with_metadata`](#publish_event_with_metadata) | A `pubsub.*` component | Side effect, not idempotent |
| [`invoke_output_binding`](#invoke_output_binding) | A `bindings.*` component | Destructive, side effect, not idempotent |
| [`get_secret`](#get_secret) | A `secretstores.*` component | Read-only, idempotent |
| [`get_bulk_secrets`](#get_bulk_secrets) | A `secretstores.*` component | Read-only, idempotent |
| [`converse_with_llm`](#converse_with_llm) | A `conversation.*` component | Read-only, idempotent |
| [`encrypt_data`](#encrypt_data) | A `crypto.*` component | Destructive, side effect, not idempotent |
| [`decrypt_data`](#decrypt_data) | A `crypto.*` component | Read-only, idempotent |
| [`acquire_lock`](#acquire_lock) | A `lock.*` component | Side effect, idempotent |
| [`release_lock`](#release_lock) | A `lock.*` component | Side effect, not idempotent |

Tools follow the components loaded in the sidecar. When [component hot reloading]({{% ref "component-updates.md#hot-reloading" %}}) adds the first component of a type, the server registers that type's tools the next time a client lists tools or calls `get_components`, and notifies connected clients that the tool list changed. When the last one is removed, its tools are removed too. Clients that read the tool list only once need to reconnect to see the change.

A tool that fails, because an input is missing or the sidecar returns an error, returns a result marked as an error with a message the model can read, rather than failing the MCP request.

## Metadata

### get_components

Lists the components loaded in the sidecar, with each one's `name`, `type`, `version`, and `capabilities`. Only component types the server has tools for are listed. The list is read live from the sidecar on every call.

Inputs: none.

## Service invocation

### invoke_service

Calls a method on another Dapr app through [service invocation]({{% ref service-invocation-overview.md %}}) and returns the response body.

| Input | Required | Description |
|---|---|---|
| `appID` | Yes | App ID of the target app. |
| `method` | Yes | Method or path to call, for example `orders/status`. |
| `data` | No | Request body, usually JSON. |
| `httpVerb` | No | `GET`, `HEAD`, `POST`, `PUT`, `PATCH`, `DELETE`, or `OPTIONS`. Default `POST`. |
| `contentType` | No | Content type of `data`. Default `application/json` if `data` is valid JSON, `text/plain` otherwise. |
| `metadata` | No | Headers to send to the target app. Keys starting with `dapr-`, `grpc-`, or `:` are rejected. |

## Actors

### invoke_actor_method

Calls a method on a [virtual actor]({{% ref actors-overview.md %}}) and returns its response.

| Input | Required | Description |
|---|---|---|
| `actorType` | Yes | Registered actor type. |
| `actorID` | Yes | ID of the actor instance. |
| `method` | Yes | Actor method to call. |
| `data` | No | Payload to pass to the method. |

## State management

### save_state

Saves one key-value pair to a [state store]({{% ref state-management-overview.md %}}).

| Input | Required | Description |
|---|---|---|
| `storeName` | Yes | State store component name. |
| `key` | Yes | Key to save under. |
| `value` | Yes | Value to save, as a string. JSON is stored as given. |

### get_state

Reads the value of one key. Reports `found: false` when the key doesn't exist.

| Input | Required | Description |
|---|---|---|
| `storeName` | Yes | State store component name. |
| `key` | Yes | Key to read. |

### delete_state

Deletes one key.

| Input | Required | Description |
|---|---|---|
| `storeName` | Yes | State store component name. |
| `key` | Yes | Key to delete. |

### execute_transaction

Runs several saves and deletes as one atomic transaction. The state store must support transactions.

| Input | Required | Description |
|---|---|---|
| `storeName` | Yes | State store component name. |
| `items` | Yes | Non-empty list of operations. Each has a `key` (required), a `value` to save, and `isDelete: true` to delete the key instead. |

## Publish and subscribe

### publish_event

Publishes a message to a topic on a [pub/sub]({{% ref pubsub-overview.md %}}) component.

| Input | Required | Description |
|---|---|---|
| `pubsubName` | Yes | Pub/sub component name. |
| `topic` | Yes | Topic to publish to. |
| `message` | Yes | Message payload, usually JSON. |
| `contentType` | No | Content type of `message`. Default `application/json` if `message` is valid JSON, `text/plain` otherwise. |

### publish_event_with_metadata

Same as `publish_event`, with publish metadata such as `ttlInSeconds`.

| Input | Required | Description |
|---|---|---|
| `pubsubName` | Yes | Pub/sub component name. |
| `topic` | Yes | Topic to publish to. |
| `message` | Yes | Message payload, usually JSON. |
| `contentType` | No | Content type of `message`. |
| `metadata` | No | Publish metadata, for example `{"ttlInSeconds": "60"}`. |

## Bindings

### invoke_output_binding

Invokes an operation on an [output binding]({{% ref bindings-overview.md %}}), such as an HTTP endpoint, a queue, or object storage, and returns the response.

| Input | Required | Description |
|---|---|---|
| `bindingName` | Yes | Binding component name. |
| `operation` | Yes | Operation supported by the binding, for example `create`, `get`, or `delete`. |
| `data` | No | Payload, usually JSON. |
| `metadata` | No | Metadata the binding needs for this operation, for example `key` for a storage binding. |

## Secrets

Secret values are returned to the model in the tool result. Expose only secret stores the agent should read, and narrow them with [secret scopes]({{% ref secrets-scopes.md %}}).

### get_secret

Reads one secret from a [secret store]({{% ref secrets-overview.md %}}).

| Input | Required | Description |
|---|---|---|
| `storeName` | Yes | Secret store component name. |
| `secretName` | Yes | Name of the secret. |
| `metadata` | No | Store-specific options, for example `version_id`. |

### get_bulk_secrets

Reads every secret the app can access in a secret store. The tool description tells the model to use it only when the user explicitly asks for all secrets.

| Input | Required | Description |
|---|---|---|
| `storeName` | Yes | Secret store component name. |
| `metadata` | No | Store-specific options. |

## Conversation

### converse_with_llm

Sends a prompt to another LLM through a [conversation]({{% ref conversation-overview.md %}}) component and returns the reply, along with a `context_id` to continue the conversation.

| Input | Required | Description |
|---|---|---|
| `name` | Yes | Conversation component name. |
| `prompt` | Yes | Prompt to send. |
| `contextId` | No | `context_id` from an earlier call, to continue that conversation. A new one is generated when omitted. |
| `temperature` | No | Sampling temperature from `0.0` to `1.0`. Default `0.7`. |

## Cryptography

### encrypt_data

Encrypts text with a key held by a [cryptography]({{% ref cryptography-overview.md %}}) component and returns the cipher text, base64-encoded.

| Input | Required | Description |
|---|---|---|
| `componentName` | Yes | Cryptography component name. |
| `plainText` | Yes | Text to encrypt. |
| `keyName` | No | Key name, or `name/version`. Default `rsa-private-key.pem`. |
| `keyWrapAlgorithm` | No | Key wrap algorithm, for example `RSA`, `RSA-OAEP-256`, or `A256KW`. Default `RSA`. |

### decrypt_data

Decrypts cipher text produced by `encrypt_data` and returns the plain text.

| Input | Required | Description |
|---|---|---|
| `componentName` | Yes | Cryptography component name. |
| `cipherText` | Yes | Base64-encoded cipher text. |
| `keyName` | No | Key name, or `name/version`. When omitted, the key named in the cipher text header is used. |

## Distributed lock

Always pair `acquire_lock` with `release_lock`, and set an expiry so a lock isn't held forever if the agent stops.

### acquire_lock

Tries to acquire a [distributed lock]({{% ref distributed-lock-api-overview.md %}}) on a resource. If another owner holds it, the call succeeds with `lock_acquired: false`.

| Input | Required | Description |
|---|---|---|
| `storeName` | Yes | Lock store component name. |
| `resourceID` | Yes | Name of the resource to lock. |
| `lockOwner` | Yes | Unique ID of the caller, used again to release the lock. |
| `expiryInSeconds` | Yes | Lock lifetime in seconds, greater than zero. The lock expires automatically after this time. |

### release_lock

Releases a lock. Fails if the lock doesn't exist or belongs to a different owner.

| Input | Required | Description |
|---|---|---|
| `storeName` | Yes | Lock store component name. |
| `resourceID` | Yes | Name of the locked resource. |
| `lockOwner` | Yes | The owner ID used to acquire the lock. |
