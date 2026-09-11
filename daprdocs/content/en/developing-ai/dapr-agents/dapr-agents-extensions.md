---
type: docs
title: "Extensions and Activation Hooks"
linkTitle: "Extensions"
weight: 55
description: "Attach custom trigger sources to a DurableAgent with a one-line activation hook"
aliases:
  - /developing-applications/dapr-agents/dapr-agents-extensions
---

The Dapr Agents **activation hook** is the supported seam for *extending* a `DurableAgent` with your own trigger source — a change-data-capture feed, a message queue, a cron timer, a webhook — without modifying the agent or its workflow. You register one callback with `agent.add_activation(...)`; the runner invokes it **exactly once** when the agent is hosted and tears it down on shutdown.

Out of the box, a `DurableAgent` is triggered by a `TriggerAction` message on its pub/sub topic. An activation hook lets an extension stand up *any* event source and translate its events into agent runs — entirely from a separate package, with no changes to agent code.

## How it works

1. An extension registers a callback: `agent.add_activation(cb)`.
2. When the agent is hosted via **any** `AgentRunner` entry point — `serve()`, `subscribe()`, `register_routes()`, `workflow()`, or `run()` — the runner fires each registered callback exactly once, passing an `ActivationContext`.
3. The callback opens its event source (a subscription, a route, a poller) and **returns an optional closer** — a zero-arg callable the runner invokes on `shutdown()`.
4. For each external event, the extension schedules an agent run with `ctx.runner.run(ctx.agent, payload={"task": ...}, wait=False)`.

The callback fires once per `(runner, agent)` pair. Hosting the same agent through several entry points (for example `serve()`, which calls `subscribe()` internally) still fires it only once.

## The `ActivationContext`

Each callback receives an immutable `ActivationContext`. Treat every field as read-only.

| Field | Type | Always present? | Notes |
|-------|------|-----------------|-------|
| `agent` | `DurableAgent` | yes | The agent being hosted. |
| `runner` | `AgentRunner` | yes | Schedule runs with `runner.run(agent, payload=..., wait=False)`. |
| `dapr_client` | `DaprClient` | yes | A live client — guaranteed even under `workflow()`/`run()`, which otherwise never create one. Use it to open a streaming subscription. |
| `wf_client` | `DaprWorkflowClient` | yes | The runner's workflow client. |
| `app` | `FastAPI` \| `None` | **no** | Present only under `serve()` and `register_routes(fastapi_app=...)`. It is `None` under `subscribe()`, `workflow()`, and `run()`. |

Because `app` may be `None`, a robust extension **branches on the transport**: mount an HTTP route when `ctx.app` is available, otherwise open a streaming subscription through `ctx.dapr_client`.

## Writing an extension

The canonical shape is a factory that builds an `_activate(ctx)` closure, registers it, and returns it (so it can also be used as a decorator over a mapper):

```python
from dapr_agents import ActivationContext

def queue_trigger(agent, *, source, mapper=None):
    """Attach an external-queue trigger to an agent."""
    mapper = mapper or (lambda event: {"task": str(event)})

    def _activate(ctx: ActivationContext):
        # Branch on transport: no FastAPI app under subscribe()/workflow()/run().
        if ctx.app is not None:
            handle = _mount_route(ctx.app, ctx, mapper)      # HTTP-style source
        else:
            handle = _open_stream(ctx.dapr_client, source, ctx, mapper)  # streaming source

        closed = {"done": False}
        def _close():                       # closers MUST be idempotent
            if closed["done"]:
                return
            closed["done"] = True
            handle.cancel()
        return _close

    agent.add_activation(_activate)
    return _activate

def _open_stream(dapr_client, source, ctx, mapper):
    def on_event(event):
        task = mapper(event)               # translate to a TriggerAction payload
        if task:                            # return None from mapper to skip an event
            ctx.runner.run(ctx.agent, payload=task, wait=False)
    return dapr_client.subscribe_with_handler(...)   # returns a cancel handle
```

The consumer attaches it with one line, then hosts the agent normally:

```python
from dapr_agents import DurableAgent, AgentRunner

agent = DurableAgent(name="frodo", role="...", goal="...", tools=[...])
queue_trigger(agent, source="orders")     # attach — no other wiring

AgentRunner().serve(agent)                # the trigger comes up automatically
```

### Rules an extension must follow

1. **Do all I/O inside `_activate`, never in the factory.** The factory only registers; opening connections eagerly breaks the "fires once when hosted" guarantee and leaks resources if the agent is configured but never hosted.
2. **Branch on `ctx.app is None`.** With no FastAPI app, use `ctx.dapr_client` instead of mounting a route.
3. **Return an idempotent closer.** `shutdown()` may run per-agent and then globally; a repeated call must be a no-op, and a closer must never raise.
4. **Schedule runs via `ctx.runner.run(...)`** with a `TriggerAction`-shaped payload (`{"task": "..."}`), `wait=False` from inside event handlers.
5. **Register before hosting.** Calling `add_activation` after the agent is hosted raises `RuntimeError` — the registration window closes on first attach.

## Lifecycle

```text
runner.subscribe(agent)        # or serve / register_routes / workflow / run
  └─ first attach? → for cb in agent.activations: closer = cb(ActivationContext(...))
                       runner stores each returned closer
... agent runs, extension feeds tasks via runner.run(...) ...
runner.shutdown()              # or shutdown(agent)
  └─ each stored closer is invoked (errors logged, not raised)
  └─ the fire-once guard resets, so re-hosting re-activates
```

If a callback raises during activation, the runner rolls back closers already collected in that attach and re-raises a clear error naming the failing callback — so a half-wired extension never leaks a live subscription.

## Packaging an extension

Extensions ship as standalone distributions under the `dapr_agents.ext` namespace, mirroring the Dapr Python SDK's `ext/` layout (for example `dapr-ext-fastapi`):

```text
ext/
  dapr-agents-ext-<name>/
    pyproject.toml                       # depends on dapr-agents
    dapr_agents/
      ext/
        <name>/
          __init__.py                    # exports your `*_trigger` factory
```

`dapr_agents.ext` is a [PEP 420 namespace package](https://peps.python.org/pep-0420/): do **not** add a `dapr_agents/ext/__init__.py` in any distribution, so multiple extension packages can coexist under the same namespace. Consumers then install your package and `from dapr_agents.ext.<name> import <name>_trigger`.

## See also

- [Dapr Agents core concepts]({{< ref dapr-agents-core-concepts.md >}})
- [Integrations]({{< ref integrations >}})
