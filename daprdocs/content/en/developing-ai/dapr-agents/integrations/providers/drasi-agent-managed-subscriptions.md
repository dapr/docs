---
type: docs
title: 'Agent-managed Drasi subscriptions'
linkTitle: 'Agent-managed subscriptions'
weight: 11
description:
  'Let a durable agent select persistent monitoring from a Drasi query catalog'
---

{{% alert title="Preview" color="warning" %}}
This page describes an unreleased API proposed for Dapr Agents. The published
`dapr-agents-ext-drasi==0.1.0` package does not include either
`register_drasi_trigger()` or `drasi_subscription_lifecycle()`. The proposed core
requirement is `dapr-agents>=1.0.7,<2.0.0`; final submission validation and the next
extension release version are pending. Do not treat the examples below as
released-package guidance.
{{% /alert %}}

Agent-managed subscriptions let a `DurableAgent` choose which operator-approved
Drasi query changes it should receive. Drasi performs deterministic change
detection, while Dapr Workflow provides durable agent execution after a matching
change.

The original agent task can finish while its subscriptions remain active. A
later Drasi delivery starts a new workflow with the saved handling instructions
and event data. It does not resume the original Python call stack or
conversation.

## Compare subscription modes

| Mode              | Subscription owner               | API                              | Use when                                                                         |
| ----------------- | -------------------------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| Author-configured | Application author or deployment | `register_drasi_trigger()`       | Query IDs and task mapping are fixed before the agent is hosted.                 |
| Agent-managed     | Agent using generated tools      | `drasi_subscription_lifecycle()` | The agent selects persistent monitoring from an operator-curated router catalog. |

The two modes cannot be combined on the same logical agent.

## Review the feature implementation

The published extension does not contain this lifecycle yet. From a checkout of
the lifecycle contribution, install the core and extension using the repository's
ordinary development setup:

```bash
uv sync --group dev --group test --extra drasi
```

This contribution uses the published `drasi-agent-router-contracts==0.1.0a1`
wire-contract package. The managed API and the
[author-configured trigger API]({{< ref "drasi.md" >}}) are documented together;
installation instructions for a released version will follow release selection.

## Prerequisites

Before starting the lifecycle, configure:

- A fresh `DurableAgent` using the normal LLM and tool loop, constructed without
  `runtime=` and with an unshared, unreplaced workflow runtime.
- An `AgentStateConfig.store` backed by a state component that supports ETags
  and strong reads.
- An `AgentPubSubConfig`, or an explicit lifecycle `pubsub` override.
- A deployed Drasi `DaprAgentRouter` with an operator-curated query catalog.
- Stable Dapr application and agent names.

Use one logical agent per application and one application replica in a private,
trusted deployment. The lifecycle's active-application guard is process-local,
not a distributed lease or multi-tenant authorization boundary.

## Host an agent-managed lifecycle

Use a FastAPI lifespan so preparation completes before application readiness is
exposed:

```python
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from dapr_agents import DurableAgent
from dapr_agents.agents.configs import AgentPubSubConfig, AgentStateConfig
from dapr_agents.ext.drasi import drasi_subscription_lifecycle
from dapr_agents.storage.daprstores.stateservice import StateStoreService
from dapr_agents.workflow.utils.core import wait_for_shutdown


agent = DurableAgent(
    name="CheckoutSRE",
    llm=...,       # Configure a supported chat client.
    tools=[...],   # Add the actions the agent may perform.
    pubsub=AgentPubSubConfig(
        pubsub_name="agent-pubsub",
        agent_topic="checkout-sre.requests",
        broadcast_topic="checkout-sre.broadcast",
    ),
    state=AgentStateConfig(
        store=StateStoreService(store_name="agent-state")
    ),
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    async with drasi_subscription_lifecycle(
        agent,
        router_id="drasi-system/sre-router-reaction",
        namespace="applications",
        app=app,
    ):
        yield


app = FastAPI(lifespan=lifespan)
```

With no `app` argument, the context starts workflow hosting and yields an
`AgentRunner` for direct calls. Retain the lifecycle object so unresolved
cleanup can be retried:

```python
lifecycle = drasi_subscription_lifecycle(
    agent,
    router_id="drasi-system/sre-router-reaction",
    namespace="applications",
)

async with lifecycle as runner:
    await runner.run(
        agent,
        {"task": "Monitor checkout errors and assess relevant changes."},
        wait=False,
    )
    await wait_for_shutdown()
```

## Lifecycle arguments

| Argument                  | Default           | Description                                                                                        |
| ------------------------- | ----------------- | -------------------------------------------------------------------------------------------------- |
| `router_id`               | Required          | Router identity in `<namespace>/<app-id>` form.                                                    |
| `namespace`               | Required          | Namespace of the subscriber application.                                                           |
| `app`                     | `None`            | If supplied, host with `AgentRunner.serve()` on the application-owned FastAPI app.                 |
| `workflow_client`         | `None`            | Optional caller-owned workflow client. The lifecycle does not close an injected client.            |
| `pubsub`                  | Agent message bus | Override the application-facing Pub/Sub component used by the derived inbox and dead-letter topic. |
| `dapr_http_port`          | `DAPR_HTTP_PORT`  | Override the local Dapr HTTP port used for router service invocation.                              |
| `router_timeout_seconds`  | `30.0`            | Deadline for each router MCP exchange.                                                             |
| `startup_timeout_seconds` | `30.0`            | Deadline for workflow-worker readiness.                                                            |

The lifecycle derives subscriber identity, workflow name, inbox topic, and
dead-letter topic from trusted application configuration. The model cannot
choose infrastructure identities or broker destinations.

## Startup and readiness

On entry, the lifecycle:

1. Validates the supported agent profile.
2. Loads the router catalog through Dapr service invocation.
3. Loads saved intent and builds query-specific subscription and cleanup tools.
4. Reconciles durable subscription intent.
5. Starts normal agent hosting.
6. Waits for the workflow worker to become ready.
7. Opens the Drasi inbox last.

No startup model turn is performed. An empty catalog still provides `list_drasi_subscriptions()` and unsubscribe-only tools for any saved subscriptions.

## Shutdown and recovery

Ordinary shutdown stops intake and runtime resources without deleting durable
intent or router rules. A fresh lifecycle reconciles that state after restart.

Subscribe and update retain the subscription incarnation; completed unsubscribe
followed by a new subscription creates a new incarnation. A definitively rejected
router operation leaves that intent `unavailable`, retaining its instructions,
incarnation, and last outcome. Reconciliation continues for unrelated queries.
An uncertain outcome remains pending and prevents readiness until reconciled.
Listing reports local intent and recovery guidance, not live router health.

Recover unavailable intent with explicit unsubscribe; subscribe again only if the query is in the prepared catalog.

If an operator removes a query from the catalog, the agent still gets an unsubscribe-only tool for its saved subscription. For example, an agent that previously monitored service errors can clean up that subscription even after the errors query is removed. It cannot start a new subscription to the retired query.

Cleanup removes the agent's matching router rule if it still exists, then deletes the saved subscription. If the router confirms the rule is already absent, the saved subscription is deleted anyway. Other subscriptions are unchanged, and repeating cleanup is a successful no-op.

A missing query is not the same as an unreachable router. Router failures retain state so cleanup can be retried. A conflicting subscription incarnation requires operator inspection and resolution of the conflicting rule before retrying; it never permits silent replacement or blind local deletion. The cleanup tool takes no query ID or infrastructure arguments from the model.

The lifecycle is one-shot. After failure or shutdown, create fresh agent and
lifecycle objects. If context exit reports unresolved cleanup, retain the
lifecycle object from the example above. After addressing the reported
dependency or shutdown problem, retry cleanup as a separate operation:

```python
# Run later from the application's shutdown supervisor.
await lifecycle.aclose()
```

`aclose()` retries cleanup only. It never rehosts the agent or unsubscribes
persistent monitoring.

The lifecycle closes its own workflow and Dapr clients. An injected
`workflow_client=` remains caller-owned and is not closed. Failed cleanup keeps
the unresolved resources and application guard available for a later `aclose()`;
cleanup errors do not replace an application's original exception or cancellation.

## Supported restrictions

The preview lifecycle:

- Requires a fresh agent constructed without `runtime=`.
- Does not support `RuntimeSubscriptionConfig` on the same agent.
- Does not support pre-existing activation callbacks on the same agent.
- Does not support external `executor=` runtimes or orchestrator mode.
- Supports one active dynamic lifecycle per Dapr application.
- Does not mix author-configured and agent-managed Drasi modes on one agent.

These are integration restrictions, not general Dapr Agents framework rules.
Runtime ownership is a caller precondition: the public core API cannot completely
verify that a runtime was not injected, shared, or replaced. Previously
runner-hosted agents are rejected even after shutdown.

## Delivery behavior

- The router stores delivery rules; the agent state store retains handling
  instructions and lifecycle status.
- Each admitted delivery freezes the saved handling instructions and event into
  an independent workflow task. Later subscription changes do not rewrite an
  already admitted task. Row values are untrusted observations, not instructions.
- Insert, update, and removal describe changes to the query result, not
  necessarily creation, modification, or deletion of source records.
- Missing, unavailable, unsubscribing, and stale-incarnation intent is discarded
  without scheduling. Pending subscribe/update intent and state failures request
  retry. Active intent is checked against the selected operation filter.
- The agent acknowledges a delivery after workflow scheduling is accepted, not
  after local enqueue or workflow completion.
- Malformed or wrong-router deliveries request dead-letter handling without
  invoking the model. Configure the broker and Dapr retry/dead-letter policy.
- Delivery is at least once where the configured runtime and broker permit it.
- Duplicate workflows and repeated activities remain possible, including reuse
  of a terminal workflow ID. There is no permanent deduplication ledger.
- Router rules are evaluated at each processing attempt. A delayed or retried
  query-result event can reach a later subscription; there is no strict
  source-timestamp cutoff at subscribe. Use fresh query IDs when recreating a
  query or changing its meaning; incarnations do not fence query generations.
- External actions must enforce their own business idempotency.
- Retry exhaustion or dead-letter publication failure can still result in loss.
- There is no historical replay, permanent deduplication ledger, automatic
  query-recreation recovery, or scale-to-zero guarantee.

## Verification and reference deployment

The lifecycle contribution includes credential-free runtime coverage using a
scripted local model, the real router, Dapr sidecars, Redis, and native workflow
scheduling. It injects query-result fixtures; it does not validate a PostgreSQL
source or the Drasi query engine.

A Kubernetes/PostgreSQL walkthrough is a separate planned contribution, not an
upstream example available from this page. Review this documentation with the
public API contribution; release installation guidance remains gated on a new
extension release and validation of its core minimum.
