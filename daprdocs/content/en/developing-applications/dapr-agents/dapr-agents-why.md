---
type: docs
title: "Why Dapr Agents"
linkTitle: "Why Dapr Agents"
weight: 30
description: "Understanding the benefits and use cases for Dapr Agents"
---

Dapr Agents is an open-source framework for building and orchestrating LLM-based autonomous agents that leverages Dapr's proven distributed systems foundation. Unlike other agentic frameworks that require developers to build infrastructure from scratch, Dapr Agents enables teams to focus on agent intelligence by providing enterprise-grade scalability, state management, and messaging capabilities out of the box. This approach eliminates the complexity of recreating distributed system fundamentals while delivering agentic workflows powered by Dapr.

### Challenges with Existing Frameworks

Many agentic frameworks today attempt to redefine how microservices are built and orchestrated by developing their own platforms for core distributed system capabilities. While these efforts showcase innovation, they often lead to steep learning curves, fragmented systems, and unnecessary complexity when scaling or adapting to new environments.

These frameworks require developers to adopt entirely new paradigms or recreate foundational infrastructure, rather than building on existing solutions that are proven to handle these challenges at scale. This added complexity diverts focus from the primary goal: designing and implementing intelligent, effective agents.

### How Dapr Agents Solves It

Dapr Agents takes a different approach by building on Dapr, leveraging its proven APIs and patterns including [workflows]({{% ref workflow-overview.md %}}), [pub/sub messaging]({{% ref pubsub-overview.md %}}), [state management]({{% ref state-management-overview %}}), and [service communication]({{% ref service-invocation-overview.md %}}). This integration eliminates the need to recreate foundational components from scratch.

By integrating with Dapr's runtime and modular components, Dapr Agents empowers developers to build and deploy agents that work as collaborative services within larger systems. Whether experimenting with a single agent or orchestrating workflows involving multiple agents, Dapr Agents allows teams to concentrate on the intelligence and behavior of LLM-powered agents while leveraging a proven framework for scalability and reliability.


## Principles

### Agent-Centric Design

Dapr Agents is designed to place agents, powered by LLMs, at the core of task execution and workflow orchestration. This principle emphasizes:

* **LLM-Powered Agents**: Dapr Agents enables the creation of agents that leverage LLMs for reasoning, dynamic decision-making, and natural language interactions.
* **Adaptive Task Handling**: Agents in Dapr Agents are equipped with flexible patterns like tool calling and reasoning loops (e.g., ReAct), allowing them to autonomously tackle complex and evolving tasks.
* **Multi-agent Systems**: Dapr Agents' framework allows agents to act as modular, reusable building blocks that integrate seamlessly into workflows, whether they operate independently or collaboratively.

While Dapr Agents centers around agents, it also recognizes the versatility of using LLMs directly in deterministic workflows or simpler task sequences. In scenarios where the agent's built-in task-handling patterns, like `tool calling` or `ReAct` loops, are unnecessary, LLMs can act as core components for reasoning and decision-making. This flexibility ensures users can adapt Dapr Agents to suit diverse needs without being confined to a single approach.

{{% alert title="Note" color="info" %}}
Agents can be used standalone and create workflows behind the scene, or act as autonomous steps in deterministic workflows.
{{% /alert %}}

![Modular Principles](/images/dapr-agents/home_concepts_principles_modular.png)

### Backed by Durable Workflows

Dapr Agents places durability at the core of its architecture, leveraging [Dapr Workflows]({{% ref workflow-overview.md %}}) as the foundation for durable agent execution and deterministic multi-agent orchestration.

* **Durable Agent Execution**: DurableAgents are fundamentally workflow-backed, ensuring all LLM calls and tool executions remain durable, auditable, and resumable. Workflow checkpointing guarantees agents can recover from any point of failure while maintaining state consistency.
* **Deterministic Multi-Agent Orchestration**: Workflows provide centralized control over task dependencies and coordination between multiple agents. Dapr's code-first workflow engine enables reliable orchestration of complex business processes while preserving agent autonomy where appropriate.

By integrating workflows as the foundational layer, Dapr Agents enables systems that combine the reliability of deterministic execution with the intelligence of LLM-powered agents, ensuring reliability and scalability.

{{% alert title="Note" color="info" %}}
Workflows in Dapr Agents provide the foundation for building durable agentic systems that combine reliable execution with LLM-powered intelligence.
{{% /alert %}}

### Modular Component Model

Dapr Agents utilizes [Dapr's pluggable component framework]({{% ref components-concept.md %}}) and building blocks to simplify development and enhance flexibility:

* **Building Blocks for Core Functionality**: Dapr provides API building blocks, such as Pub/Sub messaging, state management, service invocation, and more, to address common microservice challenges and promote best practices.
* **Interchangeable Components**: Each building block operates on swappable components (e.g., Redis, Kafka, Azure CosmosDB), allowing you to replace implementations without changing application code.
* **Seamless Transitions**: Develop locally with default configurations and deploy effortlessly to cloud environments by simply updating component definitions.

{{% alert title="Note" color="info" %}}
Developers can easily switch between different components (e.g., Redis to DynamoDB, OpenAI to Anthropic) based on their deployment environment, ensuring portability and adaptability.
{{% /alert %}}

### Message-Driven Communication

Dapr Agents emphasizes the use of Pub/Sub messaging for event-driven communication between agents. This principle ensures:

* **Decoupled Architecture**: Asynchronous communication for scalability and modularity.
* **Real-Time Adaptability**: Agents react dynamically to events for faster, more flexible task execution.
* **Event-Driven Workflows**: : By combining Pub/Sub messaging with workflow capabilities, agents can collaborate through event streams while participating in larger orchestrated workflows, enabling both autonomous coordination and structured task execution.

{{% alert title="Note" color="info" %}}
Pub/Sub messaging serves as the backbone for Dapr Agents' event-driven workflows, enabling agents to communicate and collaborate in real time while maintaining loose coupling.
{{% /alert %}}

![Message Principles](/images/dapr-agents/home_concepts_principles_message.png)

### Decoupled Infrastructure Design

Dapr Agents ensures a clean separation between agents and the underlying infrastructure, emphasizing simplicity, scalability, and adaptability:

* **Agent Simplicity**: Agents focus purely on reasoning and task execution, while Pub/Sub messaging, routing, and validation are managed externally by modular infrastructure components.
* **Scalable and Adaptable Systems**: By offloading non-agent-specific responsibilities, Dapr Agents allows agents to scale independently and adapt seamlessly to new use cases or integrations.

{{% alert title="Note" color="info" %}}
Decoupling infrastructure keeps agents focused on tasks while enabling seamless scalability and integration across systems.
{{% /alert %}}

![Decoupled Principles](/images/dapr-agents/home_concepts_principles_decoupled.png)


## Dapr Agents Benefits

### Scalable Workflows as First-Class Citizens

Dapr Agents uses a [durable-execution workflow engine]({{% ref workflow-overview.md %}}) that guarantees each agent task executes to completion despite network interruptions, node crashes, and other disruptive failures. Developers do not need to understand the underlying workflow engine concepts—simply write an agent that performs any number of tasks and these will be automatically distributed across the cluster. If any task fails, it will be retried and recover its state from where it left off.

### Cost-Effective AI Adoption

Dapr Agents builds on Dapr's Workflow API, which represents each agent as an actor, a single unit of compute and state that is thread-safe and natively distributed. This design enables a scale-to-zero architecture that minimizes infrastructure costs, making AI adoption accessible to organizations of all sizes. The underlying virtual actor model allows thousands of agents to run on demand on a single machine with low latency when scaling from zero. When unused, agents are reclaimed by the system but retain their state until needed again. This design eliminates the trade-off between performance and resource efficiency.

### Data-Centric AI Agents

With built-in connectivity to over 50 enterprise data sources, Dapr Agents efficiently handles structured and unstructured data. From basic [PDF extraction]({{% ref "/developing-applications/dapr-agents/dapr-agents-integrations.md" %}}) to large-scale database interactions, it enables data-driven AI workflows with minimal code changes. Dapr's [bindings]({{% ref bindings-overview.md %}}) and [state stores]({{% ref supported-state-stores.md %}}), along with MCP support, provide access to numerous data sources for agent data ingestion.

### Accelerated Development

Dapr Agents provides AI features that give developers a complete API surface to tackle common problems, including:

- Flexible prompting
- Structured outputs
- Multiple LLM providers
- Contextual memory
- Intelligent tool selection
- [MCP integration](https://docs.anthropic.com/en/docs/agents-and-tools/mcp)
- Multi-agent communications

### Integrated Security and Reliability

By building on Dapr, platform and infrastructure teams can apply Dapr's [resiliency policies]({{% ref "operations/resiliency/policies/_index.md" %}}) to the database and message broker components used by Dapr Agents. These policies include timeouts, retry/backoff strategies, and circuit breakers. For [security]({{% ref security-concept.md %}}), Dapr provides options to scope access to specific databases or message brokers to one or more agentic app deployments. Additionally, Dapr Agents uses mTLS to encrypt communication between its underlying components.

### Built-in Messaging and State Infrastructure

- **Service-to-Service Invocation**: Enables direct communication between agents with built-in service discovery, error handling, and distributed tracing. Agents can use this for synchronous messaging in multi-agent workflows.
- **Publish and Subscribe**: Supports loosely coupled collaboration between agents through a shared message bus. This enables real-time, event-driven interactions for task distribution and coordination.
- **Durable Workflow**: Defines long-running, persistent workflows that combine deterministic processes with LLM-based decision-making. Dapr Agents uses this to orchestrate complex multi-step agentic workflows.
- **State Management**: Provides a flexible key-value store for agents to retain context across interactions, ensuring continuity and adaptability during workflows.
- **LLM Integration**: Uses Dapr [Conversation API]({{% ref conversation-overview.md %}}) to abstract LLM inference APIs for chat completion, and provides native clients for other LLM integrations such as embeddings and audio processing.

### Vendor-Neutral and Open Source

As part of the **CNCF**, Dapr Agents is vendor-neutral, eliminating concerns about lock-in, intellectual property risks, or proprietary restrictions. Organizations gain full flexibility and control over their AI applications using open-source software they can audit and contribute to.