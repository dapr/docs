---
type: docs
title: "Core Concepts"
linkTitle: "Core Concepts"
weight: 40
description: "Learn about the core concepts and principles of Dapr Agents"
---

## Principles

### Agent-Centric Design

Dapr Agents is designed to place agents, powered by LLMs, at the core of task execution and workflow orchestration. This principle emphasizes:

* **LLM-Powered Agents**: Dapr Agents enables the creation of agents that leverage LLMs for reasoning, dynamic decision-making, and natural language interactions.
* **Adaptive Task Handling**: Agents in Dapr Agents are equipped with flexible patterns like tool calling and reasoning loops (e.g., ReAct), allowing them to autonomously tackle complex and evolving tasks.
* **Seamless Integration**: Dapr Agents' framework allows agents to act as modular, reusable building blocks that integrate seamlessly into workflows, whether they operate independently or collaboratively.

While Dapr Agents centers around agents, it also recognizes the versatility of using LLMs directly in deterministic workflows or simpler task sequences. In scenarios where the agent's built-in task-handling patterns, like `tool calling` or `ReAct` loops, are unnecessary, LLMs can act as core components for reasoning and decision-making. This flexibility ensures users can adapt Dapr Agents to suit diverse needs without being confined to a single approach.

{{% alert title="Note" color="info" %}}
Agents are not standalone; they are building blocks in larger, orchestrated workflows.
{{% /alert %}}

### Decoupled Infrastructure Design

Dapr Agents ensures a clean separation between agents and the underlying infrastructure, emphasizing simplicity, scalability, and adaptability:

* **Agent Simplicity**: Agents focus purely on reasoning and task execution, while Pub/Sub messaging, routing, and validation are managed externally by modular infrastructure components.
* **Scalable and Adaptable Systems**: By offloading non-agent-specific responsibilities, Dapr Agents allows agents to scale independently and adapt seamlessly to new use cases or integrations.

{{% alert title="Note" color="info" %}}
Decoupling infrastructure keeps agents focused on tasks while enabling seamless scalability and integration across systems.
{{% /alert %}}

![Decoupled Principles](/images/dapr-agents/home_concepts_principles_decoupled.png)

### Modular Component Model

Dapr Agents utilizes [Dapr's pluggable component framework](https://docs.dapr.io/concepts/components-concept/) and building blocks to simplify development and enhance flexibility:

* **Building Blocks for Core Functionality**: Dapr provides API building blocks, such as Pub/Sub messaging, state management, service invocation, and more, to address common microservice challenges and promote best practices.
* **Interchangeable Components**: Each building block operates on swappable components (e.g., Redis, Kafka, Azure CosmosDB), allowing you to replace implementations without changing application code.
* **Seamless Transitions**: Develop locally with default configurations and deploy effortlessly to cloud environments by simply updating component definitions.
* **Scalable Foundations**: Build resilient and adaptable architectures using Dapr's modular, production-ready building blocks.

{{% alert title="Note" color="info" %}}
Developers can easily switch between different components (e.g., Redis to DynamoDB) based on their deployment environment, ensuring portability and adaptability.
{{% /alert %}}

![Modular Principles](/images/dapr-agents/home_concepts_principles_modular.png)

### Message-Driven Communication

Dapr Agents emphasizes the use of Pub/Sub messaging for event-driven communication between agents. This principle ensures:

* **Decoupled Architecture**: Asynchronous communication for scalability and modularity.
* **Real-Time Adaptability**: Agents react dynamically to events for faster, more flexible task execution.
* **Seamless Collaboration**: Agents share updates, distribute tasks, and respond to events in a highly coordinated way.

{{% alert title="Note" color="info" %}}
Pub/Sub messaging serves as the backbone for Dapr Agents' event-driven workflows, enabling agents to communicate and collaborate in real time.
{{% /alert %}}

![Message Principles](/images/dapr-agents/home_concepts_principles_message.png)

### Workflow-Oriented Design

Dapr Agents embraces workflows as a foundational concept, integrating [Dapr Workflows](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/) to support both deterministic and event-driven task orchestration. This dual approach enables robust and adaptive systems:

* **Deterministic Workflows**: Dapr Agents uses Dapr Workflows for stateful, predictable task sequences. These workflows ensure reliable execution, fault tolerance, and state persistence, making them ideal for structured, multi-step processes that require clear, repeatable logic.
* **Event-Driven Workflows**: By combining Dapr Workflows with Pub/Sub messaging, Dapr Agents supports workflows that adapt to real-time events. This facilitates decentralized, asynchronous collaboration between agents, allowing workflows to dynamically adjust to changing scenarios.

By integrating these paradigms, Dapr Agents enables workflows that combine the reliability of deterministic execution with the adaptability of event-driven processes, ensuring flexibility and resilience in a wide range of applications.

{{% alert title="Note" color="info" %}}
Dapr Agents workflows blend structured, predictable logic with the dynamic responsiveness of event-driven systems, empowering both centralized and decentralized workflows.
{{% /alert %}}

![Workflow Principles](/images/dapr-agents/home_concepts_principles_workflows.png)

## Agents

Agents in `Dapr Agents` are autonomous systems powered by Large Language Models (LLMs), designed to execute tasks, reason through problems, and collaborate within workflows. Acting as intelligent building blocks, agents seamlessly combine LLM-driven reasoning with tool integration, memory, and collaboration features to enable scalable, production-grade agentic systems.

![Concepts Agents](/images/dapr-agents/concepts-agents.png)

### Core Features

#### 1. LLM Integration

Dapr Agents provides a unified interface to connect with LLM inference APIs. This abstraction allows developers to seamlessly integrate their agents with cutting-edge language models for reasoning and decision-making.

#### 2. Structured Outputs

Agents in Dapr Agents leverage structured output capabilities, such as [OpenAI's Function Calling](https://platform.openai.com/docs/guides/function-calling), to generate predictable and reliable results. These outputs follow [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/release-notes.html) and [OpenAPI Specification v3.1.0](https://github.com/OAI/OpenAPI-Specification) standards, enabling easy interoperability and tool integration.

#### 3. Tool Selection

Agents dynamically select the appropriate tool for a given task, using LLMs to analyze requirements and choose the best action. This is supported directly through LLM parametric knowledge and enhanced by [Function Calling](https://platform.openai.com/docs/guides/function-calling), ensuring tools are invoked efficiently and accurately.

#### 4. MCP Support

Dapr Agents includes built-in support for the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), enabling agents to dynamically discover and invoke external tools through a standardized interface. Using the provided MCPClient, agents can connect to MCP servers via two transport options: stdio for local development and sse for remote or distributed environments.

#### 5. Memory

Agents retain context across interactions, enhancing their ability to provide coherent and adaptive responses. Memory options range from simple in-memory lists for managing chat history to vector databases for semantic search and retrieval.

#### 6. Prompt Flexibility

Dapr Agents supports flexible prompt templates to shape agent behavior and reasoning. Users can define placeholders within prompts, enabling dynamic input of context for inference calls.

#### 7. Agent Services

Agents are exposed as independent services using [FastAPI and Dapr applications](https://docs.dapr.io/developing-applications/sdks/python/python-sdk-extensions/python-fastapi/). This modular approach separates the agent's logic from its service layer, enabling seamless reuse, deployment, and integration into multi-agent systems.

#### 8. Message-Driven Communication

Agents collaborate through [Pub/Sub messaging](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-overview/), enabling event-driven communication and task distribution. This message-driven architecture allows agents to work asynchronously, share updates, and respond to real-time events, ensuring effective collaboration in distributed systems.

#### 9. Workflow Orchestration

Dapr Agents supports both deterministic and event-driven workflows to manage multi-agent systems via [Dapr Workflows](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/). Deterministic workflows provide clear, repeatable processes, while event-driven workflows allow for dynamic, adaptive collaboration between agents in centralized or decentralized architectures.

### Agent Types

Dapr Agents provides two agent types, each designed for different use cases:

#### Agent

The `Agent` class is a conversational agent that manages tool calls and conversations using a language model. It provides immediate, synchronous execution with built-in conversation memory and tool integration capabilities.

**Key Characteristics:**
- Synchronous execution with immediate responses
- Built-in conversation memory and tool history tracking
- Iterative conversation processing with max iteration limits
- Direct tool execution and result processing
- Graceful shutdown support with cancellation handling

**When to use:**
- Building conversational assistants that need immediate responses
- Scenarios requiring real-time tool execution and conversation flow
- When you need direct control over the conversation loop
- Quick prototyping and development of agent interactions

#### DurableAgent

The `DurableAgent` class is a workflow-based agent that extends the standard Agent with Dapr Workflows for long-running, fault-tolerant, and durable execution. It provides persistent state management, automatic retry mechanisms, and deterministic execution across failures.

**Key Characteristics:**
- Workflow-based execution using Dapr Workflows
- Persistent workflow state management across sessions and failures
- Automatic retry and recovery mechanisms
- Deterministic execution with checkpointing
- Built-in message routing and agent communication
- Supports complex orchestration patterns and multi-agent collaboration

**When to use:**
- Multi-step workflows that span time or systems
- Tasks requiring guaranteed progress tracking and state persistence
- Scenarios where operations may pause, fail, or need recovery without data loss
- Complex agent orchestration and multi-agent collaboration
- Production systems requiring fault tolerance and scalability

### Agent Patterns

In Dapr Agents, Agent Patterns define the built-in loops that allow agents to dynamically handle tasks. These patterns enable agents to iteratively reason, act, and adapt, making them flexible and capable problem-solvers.

#### Tool Calling

Tool Calling is an essential pattern in autonomous agent design, allowing AI agents to interact dynamically with external tools based on user input. One reliable method for enabling this is through [OpenAI's Function Calling](https://platform.openai.com/docs/guides/function-calling) capability.

![Tool Call Flow](/images/dapr-agents/concepts_agents_toolcall_flow.png)

1. The user submits a query specifying a task and the available tools.
2. The LLM analyzes the query and selects the right tool for the task.
3. The LLM provides a structured JSON output containing the tool's unique ID, name, and arguments.
4. The AI agent parses the JSON, executes the tool with the provided arguments, and sends the results back as a tool message.
5. The LLM then summarizes the tool's execution results within the user's context to deliver a comprehensive final response.

#### ReAct

The [ReAct (Reason + Act)](https://arxiv.org/pdf/2210.03629.pdf) pattern was introduced in 2022 to enhance the capabilities of LLM-based AI agents by combining reasoning with action. This approach allows agents not only to reason through complex tasks but also to interact with the environment, taking actions based on their reasoning and observing the outcomes.

![ReAct Flow](/images/dapr-agents/concepts_agents_react_flow.png)

* **Thought (Reasoning)**: The agent analyzes the situation and generates a thought or a plan based on the input.
* **Action**: The agent takes an action based on its reasoning.
* **Observation**: After the action is executed, the agent observes the results or feedback from the environment, assessing the effectiveness of its action.

## Messaging

Messaging is how agents communicate, collaborate, and adapt in workflows. It enables them to share updates, execute tasks, and respond to events seamlessly. Messaging is one of the main components of `event-driven` agentic workflows, ensuring tasks remain scalable, adaptable, and decoupled. Built entirely around the `Pub/Sub (publish/subscribe)` model, messaging leverages a message bus to facilitate communication across agents, services, and workflows.

### Key Role of Messaging in Agentic Workflows

Messaging connects agents in workflows, enabling real-time communication and coordination. It acts as the backbone of event-driven interactions, ensuring that agents work together effectively without requiring direct connections.

Through messaging, agents can:

* **Collaborate Across Tasks**: Agents exchange messages to share updates, broadcast events, or deliver task results.
* **Orchestrate Workflows**: Tasks are triggered and coordinated through published messages, enabling workflows to adjust dynamically.
* **Respond to Events**: Agents adapt to real-time changes by subscribing to relevant topics and processing events as they occur.

By using messaging, workflows remain modular and scalable, with agents focusing on their specific roles while seamlessly participating in the broader system.

### How Messaging Works

Messaging relies on the `Pub/Sub` model, which organizes communication into topics. These topics act as channels where agents can publish and subscribe to messages, enabling efficient and decoupled communication.

#### Message Bus and Topics

The message bus serves as the central system that manages topics and message delivery. Agents interact with the message bus to send and receive messages:

* **Publishing Messages**: Agents publish messages to a specific topic, making the information available to all subscribed agents.
* **Subscribing to Topics**: Agents subscribe to topics relevant to their roles, ensuring they only receive the messages they need.
* **Broadcasting Updates**: Multiple agents can subscribe to the same topic, allowing them to act on shared events or updates.

#### Scalability and Adaptability

The message bus ensures that communication scales effortlessly, whether you are adding new agents, expanding workflows, or adapting to changing requirements. Agents remain loosely coupled, allowing workflows to evolve without disruptions.

### Messaging in Event-Driven Workflows

Event-driven workflows depend on messaging to enable dynamic and real-time interactions. Unlike deterministic workflows, which follow a fixed sequence of tasks, event-driven workflows respond to the messages and events flowing through the system.

* **Real-Time Triggers**: Agents can initiate tasks or workflows by publishing specific events.
* **Asynchronous Execution**: Tasks are coordinated through messages, allowing agents to operate independently and in parallel.
* **Dynamic Adaptation**: Agents adjust their behavior based on the messages they receive, ensuring workflows remain flexible and resilient.

### Why Pub/Sub Messaging for Agentic Workflows?

Pub/Sub messaging is essential for event-driven agentic workflows because it:

* **Decouples Components**: Agents publish messages without needing to know which agents will receive them, promoting modular and scalable designs.
* **Enables Real-Time Communication**: Messages are delivered as events occur, allowing agents to react instantly.
* **Fosters Collaboration**: Multiple agents can subscribe to the same topic, making it easy to share updates or divide responsibilities.

This messaging framework ensures that agents operate efficiently, workflows remain flexible, and systems can scale dynamically. 