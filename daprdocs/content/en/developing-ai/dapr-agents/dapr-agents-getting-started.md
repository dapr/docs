---
type: docs
title: "Getting Started"
linkTitle: "Getting Started"
weight: 20
description: "How to install Dapr Agents and run your first agent"
aliases:
  - /developing-applications/dapr-agents/dapr-agents-getting-started
---

{{% alert title="Dapr Agents Concepts" color="primary" %}}
If you are looking for an introductory overview of Dapr Agents and want to learn more about basic Dapr Agents terminology, we recommend starting with the [introduction](dapr-agents-introduction.md) and [concepts](dapr-agents-core-concepts.md) sections.
{{% /alert %}}

## Install Dapr CLI

While simple examples in Dapr Agents can be used without the sidecar, the recommended mode is with the Dapr sidecar. To benefit from the full power of Dapr Agents, install the Dapr CLI for running Dapr locally or on Kubernetes for development purposes. For a complete step-by-step guide, follow the  [Dapr CLI installation page]({{% ref install-dapr-cli.md %}}).


Verify the CLI is installed by restarting your terminal/command prompt and running the following:

```bash
dapr -h
```

## Initialize Dapr in Local Mode

{{% alert title="Note" color="info" %}}
Make sure you have [Docker](https://docs.docker.com/get-started/get-docker/) already installed.
{{% /alert %}}

Initialize Dapr locally to set up a self-hosted environment for development. This process fetches and installs the Dapr sidecar binaries, runs essential services as Docker containers, and prepares a default components folder for your application. For detailed steps, see the official [guide on initializing Dapr locally]({{% ref install-dapr-selfhost.md %}}).

![Dapr Initialization](/images/dapr-agents/home_installation_init.png)

To initialize the Dapr control plane containers and create a default configuration file, run:

```bash
dapr init
```

Verify you have container instances with `daprio/dapr`, `openzipkin/zipkin`, and `redis` images running:

```bash
docker ps
```

## Install Python

{{% alert title="Note" color="info" %}}
Make sure you have Python already installed. `Python >=3.10`. For installation instructions, visit the official [Python installation guide](https://www.python.org/downloads/).
{{% /alert %}}

## Prepare your environment

In this getting started guide, you’ll work directly from the [Dapr Agents' quickstarts](https://github.com/dapr/dapr-agents/tree/main/quickstarts). We’ll focus on the **`06_durable_agent_http.py`** example, which is a reliable durable agent implemented with Dapr’s workflow engine and exposed over HTTP.

### 1. Clone the repository and examine its content

```bash
git clone https://github.com/dapr/dapr-agents.git
cd dapr-agents/quickstarts/01-dapr-agents-fundamentals
```

### 2. Create a virtual environment and install dependencies

From the `01-dapr-agents-fundamentals` folder, do:

```bash
python3.10 -m venv .venv

# Activate the virtual environment 
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies from the quickstart
pip install -r requirements.txt
```

This installs `dapr-agents` and any additional libraries needed by the examples.

## Understand the application

This example creates an agent that assists with weather information and uses Dapr to handle LLM interactions, persist conversation history, and provide reliable, durable execution of the agent’s steps.

For this quickstart you’ll primarily work with:

* `06_durable_agent_http.py` – the main durable weather agent application exposed over HTTP
* `function_tools.py` – contains `slow_weather_func`, the tool used by the agent
* `resources/llm-provider.yaml` – Conversation API and LLM configuration
* `resources/conversation-statestore.yaml` – conversation memory state store
* `resources/workflow-statestore.yaml` – workflow and durable execution state store


Open `06_durable_agent_http.py`:

```python
from dapr_agents.llm import DaprChatClient

from dapr_agents import DurableAgent
from dapr_agents.agents.configs import AgentMemoryConfig, AgentStateConfig
from dapr_agents.memory import ConversationDaprStateMemory
from dapr_agents.storage.daprstores.stateservice import StateStoreService
from dapr_agents.workflow.runners import AgentRunner
from function_tools import slow_weather_func


def main() -> None:
    # This agent is of type durable agent where the execution is durable
    weather_agent = DurableAgent(
        name="WeatherAgent",
        role="Weather Assistant",
        instructions=["Help users with weather information"],
        tools=[slow_weather_func],
        # Configure this agent to use Dapr Conversation API.
        llm=DaprChatClient(component_name="llm-provider"),
        # Configure the agent to use Dapr State Store for conversation history.
        memory=AgentMemoryConfig(
            store=ConversationDaprStateMemory(
                store_name="conversation-statestore",
                session_id="06-durable-agent-http",
            )
        ),
        # This is where the execution state is stored
        state=AgentStateConfig(
            store=StateStoreService(store_name="workflow-statestore"),
        ),
    )

    # AgentRunner exposes the weather agent over HTTP on port 8001 using serve.
    # The same runner supports PubSub subscriptions and direct in-process invocation.
    runner = AgentRunner()
    try:
        runner.serve(weather_agent, port=8001)
    finally:
        runner.shutdown()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nInterrupted by user. Exiting gracefully...")
```

This single file is the full application and shows how to create a production-style durable agent with Dapr:

* **`DurableAgent`** wraps the LLM and tools in a workflow-backed execution model. Each step of reasoning and tool calls is persisted.
* **`slow_weather_func`** (from `function_tools.py`) represents a slow external call, allowing you to observe how durable workflows resume after interruptions.
* **`AgentRunner`** exposes the agent over HTTP on port `8001`, so other services (or `curl`) can start and query durable tasks.

The sections below break down the key configuration areas and show how each Python configuration maps to a Dapr component.

### LLM calls via Dapr Conversation API

In the agent definition:

```python
llm=DaprChatClient(component_name="llm-provider"),
```

This uses [Dapr Conversation API]({{% ref "conversation-overview" %}}) via the `llm-provider` component. The corresponding Dapr component is defined in `resources/llm-provider.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: llm-provider
spec:
  type: conversation.openai
  version: v1
  metadata:
  - name: key
    value: "{{OPENAI_API_KEY}}"
  - name: model
    value: gpt-4.1-2025-04-14
```

* The `conversation.openai` component type configures the LLM provider and model.
* `key` holds the API key used to authenticate with the LLM provider.

Replace `{{OPENAI_API_KEY}}` with your actual API key so the Conversation API can perform chat completion.

With this setup, you can swap models or even providers by editing the component YAML without changing the agent code.

### Conversation memory with a Dapr state store

In the agent definition, conversation memory is configured as:

```python
memory=AgentMemoryConfig(
  store=ConversationDaprStateMemory(
      store_name="conversation-statestore",
      session_id="06-durable-agent-http",
  )
),
```

This tells the agent to store conversation history in a Dapr state store named `conversation-statestore`, under a given `session_id`. The matching Dapr component is `resources/conversation-statestore.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: conversation-statestore
spec:
  type: state.redis
  version: v1
  metadata:
    - name: redisHost
      value: localhost:6379
    - name: redisPassword
      value: ""
```

* The state store uses Redis to persist conversation turns.
* The agent reads and writes messages here so the LLM can maintain context across multiple HTTP calls.

You can browse this state later (for example, with Redis Insight) to see how conversation history is stored.

### Durable execution state with a workflow state store

The agent’s durable execution state is configured as:

```python
state=AgentStateConfig(
  store=StateStoreService(store_name="workflow-statestore"),
),
```

This uses a Dapr state store named `workflow-statestore` to persist workflow and agent execution state. The corresponding component is `resources/workflow-statestore.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: workflow-statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
```

* This is another Redis state store that holds the durable workflow state.
* `actorStateStore: "true"` this is a required setting that enables storage suitable for workflows.
* If the process stops mid-execution, the workflow engine uses this state to resume from the last persisted step instead of starting over. This prevents complex agent workflows from starting from again from the initial step and performing the repetitive LLM and tool calls.

Together, these features make the agent **durable**, **reliable**, and **provider-agnostic**, while keeping the agent code itself focused on behavior and tools.

## Run the durable agent with Dapr

From the `01-dapr-agents-fundamentals` folder, with your virtual environment activated:

```bash
dapr run --app-id durable-agent --resources-path resources -- python 06_durable_agent_http.py
```

This:

* Starts a Dapr sidecar using the components in `resources/`.
* Runs `06_durable_agent_http.py` with the durable `WeatherAgent`.
* Exposes the agent’s HTTP API on port `8001`.

### Trigger the agent with a prompt

In a separate terminal, ask the agent about the weather.

```bash
curl -i -X POST http://localhost:8001/agent/run \
  -H "Content-Type: application/json" \
  -d '{"task": "What is the weather in London?"}'
```

The response includes a `WORKFLOW_ID` that represents the workflow execution.

### Query the workflow status or result

Use the `WORKFLOW_ID` from the POST response to query progress or final result:

```bash
curl -i -X GET http://localhost:8001/agent/instances/WORKFLOW_ID
```

Replace `WORKFLOW_ID` with the value you received from the POST request.

### Expected behavior

* The agent exposes a REST endpoint at `/agent/run`.
* A POST to `/agent/run` accepts a prompt, schedules a workflow execution, and returns a workflow ID.
* You can GET `/agent/instances/{WORKFLOW_ID}` at any time (even after stopping and restarting the agent) to check status or retrieve the final answer.
* The workflow orchestrates:

    * An LLM call to interpret the task and decide if a tool is needed.
    * A tool call (using `slow_weather_func`) to fetch the weather data.
    * A final LLM step that incorporates the tool result into the response.
* Every step is durably persisted, so no LLM or tool call is repeated unless fails.

## Test durability by interrupting the agent

To see durable execution in action:

1. **Start a run**
   Send the POST request to `/agent/run` as shown above and note the `WORKFLOW_ID`.

2. **Kill the agent process**
   While the request is being processed (during the `slow_weather_func` which is on purpose 5 seconds delayed), stop the agent process:

    * Go to the terminal running `dapr run ...`.
    * Press `Ctrl+C` to stop the app and sidecar.

3. **Restart the agent**
   Start it again with the same command:

```bash
   dapr run --app-id durable-agent --resources-path resources -- python 06_durable_agent_http.py
```

4. **Query the same workflow**
   In the other terminal, query the same workflow ID:

   ```bash
   curl -i -X GET http://localhost:8001/agent/instances/WORKFLOW_ID
   ```

You’ll see that the workflow continues from its last persisted step instead of starting over. The tool call or LLM calls are not re-executed unless required, and you do not need to send a new prompt. Once the workflow completes, the GET request returns the final result.

In summary, the Dapr Workflow engine preserves the execution state of the agent across restarts, enabling reliable long-running interactions that combine LLM calls, tools, and stateful reasoning.
 
## Inspect workflow executions with Diagrid Dashboard

After starting the durable agent with Dapr, you can use the local [Diagrid Dashboard](https://diagrid.ws/diagrid-dashboard-docs) to visualize and inspect your workflow state, including detailed execution history for each run. The dashboard runs as a container and connects to the same state store used by Dapr workflows (by default, the local Redis instance).

<img src="/images/workflow-overview/workflow-diagrid-dashboard.png" width=800 alt="Diagrid Dashboard showing local workflow executions"/><br/>

Start the Diagrid Dashboard container using Docker:

```bash
docker run -p 8080:8080 ghcr.io/diagridio/diagrid-dashboard:latest
```

Open the dashboard in a browser at `http://localhost:8080` to explore your local workflow executions.

## Inspect Conversation History with Redis Insights 

Dapr uses [Redis]({{% ref setup-redis.md %}}) by default for state management and pub/sub messaging, which are fundamental to Dapr Agents’ agentic workflows. To inspect the Redis instance and see both **conversation** state for this durable agent, you can use Redis Insight.

Run Redis Insight:

```bash
docker run --rm -d --name redisinsight -p 5540:5540 redis/redisinsight:latest
```

Once running, access the Redis Insight interface at `http://localhost:5540/`.

Inside Redis Insight, you can connect to the Redis instance used by Dapr:

* Port: 6379
* Host (Linux): `172.17.0.1`
* Host (Windows/Mac): `host.docker.internal` (for example, `host.docker.internal:6379`)

Redis Insight makes it easy to inspect keys and values stored in the state stores (such as `conversation-statestore` and `workflow-statestore`), which is useful for debugging and understanding how your durable agents behave.

![Redis Dashboard](/images/dapr-agents/redis_dashboard.png)

Here you can browse the state stores used by the agent (`conversation-statestore`) and explore their data.

## Next Steps

Now that you have Dapr Agents installed via the quickstart, and a durable HTTP agent running end-to-end, explore more examples and patterns in the [quickstarts]({{% ref dapr-agents-quickstarts.md %}}) section to learn about multi-agent workflows, pub/sub-driven agents, tracing, and deeper integration with Dapr’s building blocks.
