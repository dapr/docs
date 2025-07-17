---
type: docs
title: "Quickstarts"
linkTitle: "Quickstarts"
weight: 55
description: "Get started with Dapr Agents through practical examples and tutorials"
---

# Dapr Agents Quickstarts

[Quickstarts](https://github.com/dapr/dapr-agents/tree/main/quickstarts) demonstrate how to use Dapr Agents to build applications with LLM-powered autonomous agents and event-driven workflows. Each quickstart builds upon the previous one, introducing new concepts incrementally.

{{% alert title="Note" color="info" %}}
Not all quickstarts require Docker, but it is recommended to have your [local Dapr environment set up]({{< ref "/developing-applications/dapr-agents/dapr-agents-getting-started.md" >}}) with Docker for the best development experience and to follow the steps in this guide seamlessly.
{{% /alert %}}

## Available Quickstarts

| Scenario | What You'll Learn |
|----------|-------------------|
| [Hello World](https://github.com/dapr/dapr-agents/tree/main/quickstarts/01-hello-world)<br>A rapid introduction that demonstrates core Dapr Agents concepts through simple, practical examples. | - **Basic LLM Usage**: Simple text generation with OpenAI models <br> - **Creating Agents**: Building agents with custom tools in under 20 lines of code <br> - **ReAct Pattern**: Implementing reasoning and action cycles in agents <br> - **Simple Workflows**: Setting up multi-step LLM processes |
| [LLM Call with Dapr Chat Client](https://github.com/dapr/dapr-agents/tree/main/quickstarts/02_llm_call_dapr)<br>Explore interaction with Language Models through Dapr Agents' `DaprChatClient`, featuring basic text generation with plain text prompts and templates. | - **Text Completion**: Generating responses to prompts <br> - **Swapping LLM providers**: Switching LLM backends without application code change <br> - **Resilience**: Setting timeout, retry and circuit-breaking <br> - **PII Obfuscation**: Automatically detect and mask sensitive user information |
| [LLM Call with OpenAI Client](https://github.com/dapr/dapr-agents/tree/main/quickstarts/02_llm_call_open_ai)<br>Discover how to leverage native LLM client libraries with Dapr Agents using the OpenAI Client for chat completion, audio processing, and embeddings. | - **Text Completion**: Generating responses to prompts <br> - **Structured Outputs**: Converting LLM responses to Pydantic objects <br><br> *Note: Other quickstarts for specific clients are available for [Elevenlabs](https://github.com/dapr/dapr-agents/tree/main/quickstarts/02_llm_call_elevenlabs), [Hugging Face](https://github.com/dapr/dapr-agents/tree/main/quickstarts/02_llm_call_hugging_face), and [Nvidia](https://github.com/dapr/dapr-agents/tree/main/quickstarts/02_llm_call_nvidia).* |
| [Agent Tool Call](https://github.com/dapr/dapr-agents/tree/main/quickstarts/03-agent-tool-call)<br>Build your first AI agent with custom tools by creating a practical weather assistant that fetches information and performs actions. | - **Tool Definition**: Creating reusable tools with the `@tool` decorator <br> - **Agent Configuration**: Setting up agents with roles, goals, and tools <br> - **Function Calling**: Enabling LLMs to execute Python functions |
| [Agentic Workflow](https://github.com/dapr/dapr-agents/tree/main/quickstarts/04-agentic-workflow)<br>Dive into stateful workflows with Dapr Agents by orchestrating sequential and parallel tasks through powerful workflow capabilities. | - **LLM-powered Tasks**: Using language models in workflows <br> - **Task Chaining**: Creating resilient multi-step processes executing in sequence <br> - **Fan-out/Fan-in**: Executing activities in parallel; then synchronizing these activities until all preceding activities have completed |
| [Multi-Agent Workflows](https://github.com/dapr/dapr-agents/tree/main/quickstarts/05-multi-agent-workflow-dapr-workflows)<br>Explore advanced event-driven workflows featuring a Lord of the Rings themed multi-agent system where autonomous agents collaborate to solve problems. | - **Multi-agent Systems**: Creating a network of specialized agents <br> - **Event-driven Architecture**: Implementing pub/sub messaging between agents <br> - **Actor Model**: Using Dapr Actors for stateful agent management <br> - **Workflow Orchestration**: Coordinating agents through different selection strategies <br><br> *Note: To see Actor-based workflow see [Multi-Agent Actors](https://github.com/dapr/dapr-agents/tree/main/quickstarts/05-multi-agent-workflow-actors).* |
| [Multi-Agent Workflow on Kubernetes](https://github.com/dapr/dapr-agents/tree/main/quickstarts/07-k8s-multi-agent-workflow)<br>Run multi-agent workflows in Kubernetes, demonstrating deployment and orchestration of event-driven agent systems in a containerized environment. | - **Kubernetes Deployment**: Running agents on Kubernetes <br> - **Container Orchestration**: Managing agent lifecycles with K8s <br> - **Service Communication**: Inter-agent communication in K8s |
| [Document Agent with Chainlit](https://github.com/dapr/dapr-agents/tree/main/quickstarts/06-document-agent-chainlit)<br>Create a conversational agent with an operational UI that can upload, and learn unstructured documents while retaining long-term memory. | - **Conversational Document Agent**: Upload and converse over unstructured documents <br> - **Cloud Agnostic Storage**: Upload files to multiple storage providers <br> - **Conversation Memory Storage**: Persists conversation history using external storage. |
| [Data Agent with MCP and Chainlit](https://github.com/dapr/dapr-agents/tree/main/quickstarts/08-data-agent-mcp-chainlit)<br>Build a conversational agent over a Postgres database using Model Composition Protocol (MCP) with a ChatGPT-like interface. | - **Database Querying**: Natural language queries to relational databases <br> - **MCP Integration**: Connecting to databases without DB-specific code <br> - **Data Analysis**: Complex data analysis through conversation |

## Agentic Workflows

{{% alert title="Note" color="info" %}}
This quickstart requires `Dapr CLI` and `Docker`. You must have your [local Dapr environment set up]({{< ref "/developing-applications/dapr-agents/dapr-agents-getting-started.md" >}}).
{{% /alert %}}

Traditional workflows follow fixed, step-by-step processes, while autonomous agents make real-time decisions based on reasoning and available data. Agentic workflows combine the best of both approaches, integrating structured execution with reasoning loops to enable more adaptive decision-making.

This allows systems to analyze information, adjust to new conditions, and refine actions dynamically rather than strictly following a predefined sequence. By incorporating planning, feedback loops, and model-driven adjustments, agentic workflows provide both scalability and predictability while still allowing for autonomous adaptation.

In `Dapr Agents`, agentic workflows leverage LLM-based tasks, reasoning loop patterns, and an event-driven system powered by pub/sub messaging and a shared message bus. Agents operate autonomously, responding to events in real time, making decisions, and collaborating dynamically. This makes the system highly adaptable—agents can communicate, share tasks, and adjust based on new information, ensuring fluid coordination across distributed environments.

{{% alert title="Tip" color="primary" %}}
We will demonstrate this concept using the [Multi-Agent Workflow Guide](https://github.com/dapr/dapr-agents/tree/main/cookbook/workflows/multi_agents/basic_lotr_agents_as_workflows) from our Cookbook, which outlines a step-by-step guide to implementing a basic agentic workflow.
{{% /alert %}}

### Agents as Services: Dapr Workflows

In `Dapr Agents`, agents can be implemented using [Dapr Workflows](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/), both of which are exposed as microservices via [FastAPI servers](https://docs.dapr.io/developing-applications/sdks/python/python-sdk-extensions/python-fastapi/).

#### Agents as Dapr Workflows (Orchestration, Complex Execution)

[Dapr Workflows](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/) define the structured execution of agent behaviors, reasoning loops, and tool selection. Workflows allow agents to:

✅ Define complex execution sequences instead of just reacting to events.
✅ Integrate with message buses to listen and act on real-time inputs.
✅ Orchestrate multi-step reasoning, retrieval-augmented generation (RAG), and tool use.
✅ Best suited for goal-driven, structured, and iterative decision-making workflows.

🚀 Dapr agents uses Dapr Workflows for orchestration and complex multi-agent collaboration.

**Example: An Agent as a Dapr Workflow**

```python
from dapr_agents import DurableAgent
from dotenv import load_dotenv
import asyncio
import logging

async def main():
    try:
        # Define Agent
        wizard_service = DurableAgent(
            name="Gandalf",
            role="Wizard",
            goal="Guide the Fellowship with wisdom and strategy, using magic and insight to ensure the downfall of Sauron.",
            instructions=[
                "Speak like Gandalf, with wisdom, patience, and a touch of mystery.",
                "Provide strategic counsel, always considering the long-term consequences of actions.",
                "Use magic sparingly, applying it when necessary to guide or protect.",
                "Encourage allies to find strength within themselves rather than relying solely on your power.",
                "Respond concisely, accurately, and relevantly, ensuring clarity and strict alignment with the task."
            ],
            message_bus_name="messagepubsub",
            state_store_name="agenticworkflowstate",
            state_key="workflow_state",
            agents_registry_store_name="agentsregistrystore",
            agents_registry_key="agents_registry",
        )

        await wizard_service.start()
    except Exception as e:
        print(f"Error starting service: {e}")

if __name__ == "__main__":
    load_dotenv()
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
```

Here, `Gandalf` is an `DurableAgent` implemented as a workflow, meaning it executes structured reasoning, plans actions, and integrates tools within a managed workflow execution loop.

#### How We Use Dapr Workflows for Orchestration

In dapr agents, the orchestrator itself is a Dapr Workflow, which:

✅ Coordinates execution of agentic workflows (LLM-driven or rule-based).
✅ Delegates tasks to agents implemented as either other workflows.
✅ Manages reasoning loops, plan adaptation, and error handling dynamically.

🚀 The LLM default orchestrator is a Dapr Workflow that interacts with agent workflows.

**Example: The Orchestrator as a Dapr Workflow**

```python
from dapr_agents import LLMOrchestrator
from dotenv import load_dotenv
import asyncio
import logging

async def main():
    try:
        agentic_orchestrator = LLMOrchestrator(
            name="Orchestrator",
            message_bus_name="messagepubsub",
            state_store_name="agenticworkflowstate",
            state_key="workflow_state",
            agents_registry_store_name="agentsregistrystore",
            agents_registry_key="agents_registry",
            max_iterations=25
        ).as_service(port=8009)

        await agentic_orchestrator.start()
    except Exception as e:
        print(f"Error starting service: {e}")

if __name__ == "__main__":
    load_dotenv()
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
```

This orchestrator acts as a central controller, ensuring that agentic workflows communicate effectively, execute tasks in order, and handle iterative reasoning loops.

### Structuring A Multi-Agent Project

The way to structure such a project is straightforward. We organize our services into a directory that contains individual folders for each agent, along with a `components` directory for Dapr resources configurations. Each agent service includes its own app.py file, where the FastAPI server and the agent logic are defined.

```
dapr.yaml                  # Dapr main config file
components/                # Dapr resource files
├── statestore.yaml        # State store configuration
├── pubsub.yaml            # Pub/Sub configuration
└── ...                    # Other Dapr components
services/                  # Directory for agent services
├── agent1/                # First agent's service
│   ├── app.py             # FastAPI app for agent1
│   └── ...                # Additional agent1 files
│── agent2/                # Second agent's service
│   ├── app.py             # FastAPI app for agent2
│   └── ...                # Additional agent2 files
└── ...                    # More agents
```

### Set Up an Environment Variables File

This example uses our default `LLM Orchestrator`. Therefore, you have to create an `.env` file to securely store your Inference Service (i.e. OpenAI) API keys and other sensitive information. For example:

```
OPENAI_API_KEY="your-api-key"
OPENAI_BASE_URL="https://api.openai.com/v1"
```

### Define Your First Agent Service

Let's start by defining a `Hobbit` service with a specific `name`, `role`, `goal` and `instructions`.

```
services/                  # Directory for agent services
├── hobbit/                # Hobbit Service
│   ├── app.py             # Dapr Enabled FastAPI app for Hobbit
```

Create the `app.py` script and provide the following information.

```python
from dapr_agents import DurableAgent
from dotenv import load_dotenv
import asyncio
import logging

async def main():
    try:
        # Define Agent and expose it as a service
        hobbit_agent = DurableAgent(
            role="Hobbit",
            name="Frodo",
            goal="Carry the One Ring to Mount Doom, resisting its corruptive power while navigating danger and uncertainty.",
            instructions=[
                "Speak like Frodo, with humility, determination, and a growing sense of resolve.",
                "Endure hardships and temptations, staying true to the mission even when faced with doubt.",
                "Seek guidance and trust allies, but bear the ultimate burden alone when necessary.",
                "Move carefully through enemy-infested lands, avoiding unnecessary risks.",
                "Respond concisely, accurately, and relevantly, ensuring clarity and strict alignment with the task."
            ],
            message_bus_name="messagepubsub",
            agents_registry_store_name="agentsregistrystore",
            agents_registry_key="agents_registry",
        ).as_service(8001)

        await hobbit_service.start()
    except Exception as e:
        print(f"Error starting service: {e}")

if __name__ == "__main__":
    load_dotenv()
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
```

Now, you can define multiple services following this format, but it's essential to pay attention to key areas to ensure everything runs smoothly. Specifically, focus on correctly configuring the components (e.g., `statestore` and `pubsub` names) and incrementing the ports for each service.

**Key Considerations:**

* Ensure the `message_bus_name` matches the `pub/sub` component name in your `pubsub.yaml` file.
* Verify the `agents_registry_store_name` matches the state store component defined in your `agentstate.yaml` file.
* Increment the `service_port` for each new agent service (e.g., 8001, 8002, 8003). 