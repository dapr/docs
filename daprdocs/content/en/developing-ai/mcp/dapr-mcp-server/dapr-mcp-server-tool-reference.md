---
type: docs
title: "Dapr MCP server tool reference"
linkTitle: "Tool reference"
weight: 40
description: "Every tool the Dapr MCP server exposes, its inputs, its safety properties, and the component type that enables it"
aliases:
  - /developing-ai/mcp/mcp-server-tool-reference/
---

The Dapr MCP server exposes 28 tools. Thirteen are always registered: `get_components`, `invoke_service`, `invoke_actor_method`, and the ten workflow tools. The rest are registered only while the sidecar has at least one component of the matching type, so an agent never sees tools it can't use.

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
| [`list_workflows`](#list_workflows) | Always | Read-only, idempotent |
| [`get_workflow_status`](#get_workflow_status) | Always | Read-only, idempotent |
| [`get_workflow_history`](#get_workflow_history) | Always | Read-only, idempotent |
| [`start_workflow`](#start_workflow) | Always | Side effect, not idempotent |
| [`raise_workflow_event`](#raise_workflow_event) | Always | Side effect, not idempotent |
| [`pause_workflow`](#pause_workflow) | Always | Side effect, idempotent |
| [`resume_workflow`](#resume_workflow) | Always | Side effect, idempotent |
| [`rerun_workflow`](#rerun_workflow) | Always | Side effect, not idempotent |
| [`terminate_workflow`](#terminate_workflow) | Always | Destructive, idempotent |
| [`purge_workflow`](#purge_workflow) | Always | Destructive, side effect, not idempotent |
| [`save_state`](#save_state) | A `state.*` component | Side effect, idempotent |
| [`get_state`](#get_state) | A `state.*` component | Read-only, idempotent |
| [`get_bulk_state`](#get_bulk_state) | A `state.*` component | Read-only, idempotent |
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

## Workflows

The workflow tools manage [Dapr Workflow]({{% ref workflow-overview.md %}}) instances of the app whose sidecar the server is connected to. Workflows are part of the Dapr runtime rather than a component, so these tools are always registered. They need Dapr 1.18.2 or later, and a sidecar that can run workflows, which means an [actor state store]({{% ref "state-management-overview.md#actor-state" %}}) is configured. On older runtimes, a history query against a sidecar without an actor state store makes `daprd` exit ([dapr/dapr#10217](https://github.com/dapr/dapr/issues/10217)).

`terminate_workflow` and `purge_workflow` can't be undone. The server's instructions tell the model to confirm with the user before calling either one, unless the user explicitly asked for it.

### list_workflows

Lists the app's workflow instances with their workflow name, runtime status, and creation time, plus counts per workflow and per status. It does not fetch inputs, outputs, or custom status; use `get_workflow_status` for those. The tool does not filter: the model filters the returned list itself. When more instances exist, the result includes a `continuation_token` for the next page.

| Input | Required | Description |
|---|---|---|
| `limit` | No | Maximum number of instances to return. Default `100`, maximum `500`. |
| `continuationToken` | No | Continuation token from an earlier `list_workflows` call. |

### get_workflow_status

Returns the runtime status of one instance (`RUNNING`, `COMPLETED`, `FAILED`, `SUSPENDED`, `TERMINATED`, or `PENDING`), with its creation and last-update times, output, custom status, and failure details.

| Input | Required | Description |
|---|---|---|
| `instanceID` | Yes | Workflow instance ID. |

### get_workflow_history

Returns the event history of one instance: scheduled and completed activities, timers, raised events, and failures. Only events that schedule work, such as `taskScheduled` and `timerCreated`, carry an `event_id`. An outcome event such as `taskCompleted` or `taskFailed` points back to the event that scheduled it, through `task_scheduled_id` (or `timer_id` for a timer), so a failure can be traced to the activity that failed.

| Input | Required | Description |
|---|---|---|
| `instanceID` | Yes | Workflow instance ID. |

### start_workflow

Starts a new instance of a workflow, immediately or at a scheduled time. Not idempotent unless you pass an `instanceID`.

| Input | Required | Description |
|---|---|---|
| `workflowName` | Yes | Name of the workflow, as registered by the workflow app. |
| `instanceID` | No | ID for the new instance. Dapr generates one when omitted. |
| `input` | No | Input for the workflow, usually a JSON string. It is passed on as given. |
| `startTime` | No | Scheduled start time in RFC 3339 format, for example `2026-07-15T06:00:00Z`. The workflow starts immediately when omitted. |

### raise_workflow_event

Delivers an external event, such as an approval, to an instance that is waiting for it.

| Input | Required | Description |
|---|---|---|
| `instanceID` | Yes | ID of the instance waiting for the event. |
| `eventName` | Yes | Event name, matching the name used in the workflow code. |
| `eventData` | No | Event payload, usually a JSON string. |

### pause_workflow

Requests that a running instance be suspended until `resume_workflow` is called. The tool sends the request and does not read the state back.

| Input | Required | Description |
|---|---|---|
| `instanceID` | Yes | Workflow instance ID. |
| `reason` | No | Short reason, recorded for operators. |

### resume_workflow

Requests that a suspended instance continue. The tool sends the request and does not read the state back.

| Input | Required | Description |
|---|---|---|
| `instanceID` | Yes | Workflow instance ID. |
| `reason` | No | Short reason, recorded for operators. |

### rerun_workflow

Reruns an instance from an event in its history as a new instance, reusing the results recorded before that event. Pass the `event_id` of a scheduling event, such as `taskScheduled`, from `get_workflow_history`. Not idempotent unless you pass a `newInstanceID`.

| Input | Required | Description |
|---|---|---|
| `instanceID` | Yes | ID of the instance to rerun, typically a failed one. |
| `eventID` | Yes | `event_id` of the scheduling event to rerun from. |
| `newInstanceID` | No | ID for the new instance. Dapr generates one when omitted. |
| `input` | No | Replacement input, usually a JSON string. The original input is reused when omitted. |

### terminate_workflow

Requests that a running instance stop without running its remaining steps. It also terminates the child workflows the instance started.

| Input | Required | Description |
|---|---|---|
| `instanceID` | Yes | Workflow instance ID. |

### purge_workflow

Permanently deletes the state and history of a completed, failed, or terminated instance. The purge is not recursive: child workflows keep their state and must be purged separately.

| Input | Required | Description |
|---|---|---|
| `instanceID` | Yes | Workflow instance ID. |

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

### get_bulk_state

Reads several keys in one call, instead of one `get_state` call per key. Each returned item has `key`, `found`, `value`, and `etag`. A key the store could not read carries an `error` on its own item instead of failing the whole call. The summary line says how many items the store returned out of the keys asked for, and how many were found.

| Input | Required | Description |
|---|---|---|
| `storeName` | Yes | State store component name. |
| `keys` | Yes | Non-empty list of keys to read. |
| `parallelism` | No | Maximum number of parallel reads the state store performs. Omit or pass `0` to let Dapr choose. |

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
