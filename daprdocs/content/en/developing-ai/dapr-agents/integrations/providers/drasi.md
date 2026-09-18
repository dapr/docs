---
type: docs
title: "Drasi"
linkTitle: "Drasi"
weight: 10
description: "Integrations for Drasi"
---

{{% alert title="Note" color="primary" %}}
This integration is currently in Alpha; breaking changes may occur at any time.
{{% /alert %}}

The Drasi extension in Dapr Agents enables `DurableAgent` runs to be triggered by Drasi events.

## Why Use Drasi?

Many systems need to react to changes produced by other systems in near real-time. Traditional polling cannot detect the absence of change, or changes that occur at an extremely high frequency without unnecessary load on source systems (even without considering network delay). Raw changes are usually not actionable, requiring custom change data capture (CDC) pipelines to process changes at scale and convert them into meaningful domain events. However, these pipelines can be expensive (if managed) or difficult to set up and maintain (if self-hosted).

For many use cases, [Drasi](https://drasi.io/) is a viable alternative. Drasi is a **CNCF Sandbox** project that addresses the issues mentioned above with a simple architecture centered around detecting and reacting to changes:
- **Sources** to ingest changes from existing systems
- **Queries** allowing high-level "business conditions" to be defined across a variety of data sources, which emit events when those conditions are satisfied
- **Reactions** to push events to downstream consumers

## Installation

{{< tabpane text=true >}}

{{% tab header="pip" %}}

```bash
pip install "dapr-agents[drasi]"
```

{{% /tab %}}

{{% tab header="uv" %}}

```bash
uv add dapr-agents[drasi]
```

{{% /tab %}}

{{< /tabpane >}}

## Usage

```python
from dapr_agents import AgentRunner, DurableAgent
from dapr_agents.agents.configs import AgentPubSubConfig

from dapr_agents.ext.drasi import drasi_trigger

agent = DurableAgent(
    name="InventoryAgent",
    pubsub=AgentPubSubConfig(
        pubsub_name="pubsub",           # Replace with your pub/sub component
        agent_topic="inventory-agent",  # Replace with your agent pub/sub topic
    ),
)

drasi_trigger(
    agent,
    query_id="low-stock-products",      # Replace with your Drasi query ID
)

AgentRunner().serve(agent)
```

## API

### `drasi_trigger`

`drasi_trigger` creates a static subscription to a Drasi query and allows agents to be triggered by Drasi events via Dapr pub/sub.

#### Parameters

Parameter | Type | Required | Details | Example
--------- | ---- | -------- | ------- | -------
`agent` | `DurableAgent` | Y | The target agent. | N/A
`query_id` | `str` | Y | The Drasi query ID to subscribe to. | `"low-stock-products"`
`pubsub` | `str` | N | The name of the Dapr pub/sub component to use. Defaults to the agent's pub/sub component. | `"pubsub"`
`topic` | `str` | N | The topic to subscribe to. Defaults to `"drasi-events-" + query_id`. | N/A
`dead_letter_topic` | `str` | N | Dead-letter topic to publish failed messages to. | `"low-stock-events-dlq"`
`task_mapper` | `Callable[[DrasiChangeEvent, MessageContext], TriggerAction]` | N | Callable to map Drasi change events to agent task messages. Defaults to instructing the agent to return the serialized Drasi event as-is. | N/A
`operations` | `DrasiOperation \| str \| list[DrasiOperation \| str]` | N | Drasi operation(s) to filter change events by. Accepts `DrasiOperation` or equivalent string literals. | N/A
`change_model` | `type[Any]` | N | Model to use to validate the change data in Drasi events. | N/A

### `DrasiOperation`

`DrasiOperation` is an enum representing the supported Drasi change operations.

#### Operations

Operation | Value | Details
--------- | ----- | -------
`DrasiOperation.i` | `"i"` | A record was added to the result set tracked by the Drasi query.
`DrasiOperation.u` | `"u"` | A record was updated in the result set tracked by the Drasi query.
`DrasiOperation.d` | `"d"` | A record was deleted from the result set tracked by the Drasi query.

### `DrasiChangeEvent`

`DrasiChangeEvent` is a Pydantic model representing a change event emitted by a query.

#### Attributes

Attribute | Type | Required | Details | Example
--------- | ---- | -------- | ------- | -------
`op` | `DrasiOperation` | Y | The change event operation (insert, update, delete). | `DrasiOperation.u`
`ts_ms` | `int` | Y | The timestamp of the change event in milliseconds. | `42`
`seq` | `int` | Y | The sequence number of the change event. | `1`
`payload` | `dict[str, Any]` | Y | The change data for the change event. | `{"source": {"queryId": "low-stock-products", "ts_ms": 42}, "before": {"a": 1}, "after": {"a": 2}}`

#### Example Structure

```json
{
    "op": "u",
    "ts_ms": 42,
    "seq": 1,
    "payload": {
        "source": {
            "queryId": "low-stock-products",
            "ts_ms": 42
        },
        "before": {"a": 1},
        "after": {"a": 2}
    }
}
```

## Examples

See the [Extension Examples]({{< ref "developing-ai/dapr-agents/dapr-agents-quickstarts.md#extension-examples" >}}) for a list of working examples for the Drasi extension.
