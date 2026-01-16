---
type: docs
title: "Agent Sessions"
linkTitle: "Agent Sessions"
weight: 20
description: "How to use Dapr to reliably and securely manage agent state"
---

## Overview

By using Dapr to manage the state and [session data for OpenAI agents](https://openai.github.io/openai-agents-python/sessions/), users can store agent state in all databases supported by Dapr, including key/value stores, caches and SQL databases. Developers also get built-in tracing, metrics and resiliency policies that make agent session data operate reliably in production.

## Getting Started

Initialize Dapr locally to set up a self-hosted environment for development. This process fetches and installs the Dapr sidecar binaries, runs essential services as Docker containers, and prepares a default components folder for your application. For detailed steps, see the official [guide on initializing Dapr locally]({{% ref install-dapr-cli.md %}}).

To initialize the Dapr control plane containers and create a default configuration file, run:

```bash
dapr init
```

Verify you have container instances with `daprio/dapr`, `openzipkin/zipkin`, and `redis` images running:

```bash
docker ps
```

### Install Python

{{% alert title="Note" color="info" %}}
Make sure you have Python already installed. `Python >=3.10`. For installation instructions, visit the official [Python installation guide](https://www.python.org/downloads/).
{{% /alert %}}

### Install Dependencies

```bash
pip install openai-agents dapr
```

### Create an OpenAI Agent

Let's create a simple OpenAI agent. Put the following in a file named `openai_agent.py`:

```python
import asyncio
from agents import Agent, Runner
from agents.extensions.memory.dapr_session import DaprSession

async def main():
    agent = Agent(
        name="Assistant",
        instructions="Reply very concisely.",
    )

    session = DaprSession.from_address(
        session_id="123",
        state_store_name="statestore"
    )

    result = await Runner.run(agent, "What city is the Golden Gate Bridge in?", session=session)
    print(result.final_output)

    result = await Runner.run(agent, "What state is it in?", session=session)
    print(result.final_output)

    result = await Runner.run(agent, "What's the population?", session=session)
    print(result.final_output)

asyncio.run(main())
```

### Set an OpenAI API key

```bash
export OPENAI_API_KEY=sk-...
```

### Create a Python venv

```bash
python -m venv .venv                                                                                                                                                                      
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### Create the database component

The component file is how Dapr connects to your databae. The full list of supported databases can be found [here]({{% ref supported-state-stores %}}). Create a `components` directory and this file in it:

`statestore.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

### Run The Agent

Now run the local Dapr process and your Python script using the Dapr CLI.

```bash
dapr run --app-id openaisessions --dapr-grpc-port 50001 --resources-path ./components -- python3 ./openai_agent.py
```

Open `http://localhost:9411` to view your the traces and dependency graph.

You can see [the session data stored in Redis]({{% ref "getting-started/get-started-api" %}}#step-4-see-how-the-state-is-stored-in-redis) with the following command

```bash
hgetall "123:messages" 
```

## Next Steps

Now that you have an OpenAI agent using Dapr to manage the agent sessions, explore more you can do with the [State API]({{% ref "state-management-overview" %}}) and how to enable [resiliency policies]({{% ref resiliency-overview %}}) for enhanced reliability.

Read more about OpenAI agent sessions and Dapr [here](https://openai.github.io/openai-agents-python/sessions/).
