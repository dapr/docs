---
type: docs
title: "Introduction"
linkTitle: "Introduction"
weight: 10
description: "Overview of Dapr Agents and its key features"
---

![Agent Overview](/images/dapr-agents/concepts-agents-overview.png)


Dapr Agents is a developer framework for building durable and resilient AI agent systems powered by Large Language Models (LLMs). Built on the battle-tested Dapr project, it enables developers to create autonomous systems that reason through problems, make dynamic decisions, and collaborate seamlessly. It includes built-in observability and stateful workflow execution to ensure agentic workflows complete successfully, regardless of complexity. Whether you're developing single-agent applications or complex multi-agent workflows, Dapr Agents provides the infrastructure for intelligent, adaptive systems that scale across environments.

## Core Capabilities

- **Scale and Efficiency**: Run thousands of agents efficiently on a single core. Dapr distributes single and multi-agent apps transparently across fleets of machines and handles their lifecycle.
- **Workflow Resilience**: Automatically retry agentic workflows and to ensure task completion.
- **Data-Driven Agents**: Directly integrate with databases, documents, and unstructured data by connecting to dozens of different data sources.
- **Multi-Agent Systems**: Secure and observable by default, enabling collaboration between agents.
- **Kubernetes-Native**: Easily deploy and manage agents in Kubernetes environments.
- **Platform-Ready**: Access scopes and declarative resources enable platform teams to integrate Dapr Agents into their systems.
- **Vendor-Neutral & Open Source**: Avoid vendor lock-in and gain flexibility across cloud and on-premises deployments.

## Key Features

Dapr Agents provides specialized modules designed for creating intelligent, autonomous systems. Each module is designed to work independently, allowing you to use any combination that fits your application needs.  

 
| Feature                                                                                      | Description |
|----------------------------------------------------------------------------------------------|-------------|
| [**LLM Integration**]({{% ref "dapr-agents-core-concepts.md#llm-integration" %}})            | Uses Dapr [Conversation API]({{% ref conversation-overview.md %}}) to abstract LLM inference APIs for chat completion, or provides native clients for other LLM integrations such as embeddings, audio, etc.
| [**Structured Outputs**]({{% ref "dapr-agents-core-concepts.md#structured-outputs" %}})      | Leverage capabilities like OpenAI's Function Calling to generate predictable, reliable results following JSON Schema and OpenAPI standards for tool integration.
| [**Tool Selection**]({{% ref "dapr-agents-core-concepts.md#tool-calling" %}})                      | Dynamic tool selection based on requirements, best action, and execution through [Function Calling](https://platform.openai.com/docs/guides/function-calling) capabilities.
| [**MCP Support**]({{% ref "dapr-agents-core-concepts.md#mcp-support" %}})                            | Built-in support for [Model Context Protocol](https://modelcontextprotocol.io/) enabling agents to dynamically discover and invoke external tools through standardized interfaces.
| [**Memory Management**]({{% ref "dapr-agents-core-concepts.md#memory" %}})        | Retain context across interactions with options from simple in-memory lists to vector databases, integrating with [Dapr state stores]({{% ref state-management-overview.md %}}) for scalable, persistent memory.
| [**Durable Agents**]({{% ref "dapr-agents-core-concepts.md#durable-agents" %}})              | Workflow-backed agents that provide fault-tolerant execution with persistent state management and automatic retry mechanisms for long-running processes.
| [**Headless Agents**]({{% ref "dapr-agents-core-concepts.md#agent-services" %}})               | Expose agents over REST for long-running tasks, enabling programmatic access and integration without requiring user interfaces or human intervention.
| [**Event-Driven Communication**]({{% ref "dapr-agents-core-concepts.md#event-driven-orchestration" %}})       | Enable agent collaboration through [Pub/Sub messaging]({{% ref pubsub-overview.md %}}) for event-driven communication, task distribution, and real-time coordination in distributed systems.
| [**Agent Orchestration**]({{% ref "dapr-agents-core-concepts.md#deterministic-workflows" %}}) | Deterministic agent orchestration using [Dapr Workflows]({{% ref workflow-overview.md %}}) with higher-level tasks that interact with LLMs for complex multi-step processes.
 
 
## Agentic Patterns
Dapr Agents enables a comprehensive set of patterns that represent different approaches to building intelligent systems. 

<img src="/images/dapr-agents/agents-patterns-overview.png" width=1200 style="padding-bottom:15px;">

These patterns exist along a spectrum of autonomy, from predictable workflow-based approaches to fully autonomous agents that can dynamically plan and execute their own strategies. Each pattern addresses specific use cases and offers different trade-offs between deterministic outcomes and autonomy:

| Pattern                                                                                | Description |
|----------------------------------------------------------------------------------------|-------------|
| [**Augmented LLM**]({{% ref "dapr-agents-patterns.md#augmented-llm" %}})               | Enhances a language model with external capabilities like memory and tools, providing a foundation for AI-driven applications.
| [**Durable Agent**]({{% ref "dapr-agents-patterns.md#durable-agent" %}})               | Extends the Augmented LLM by adding durability and persistence to agent interactions using Dapr's state stores.
| [**Prompt Chaining**]({{% ref "dapr-agents-patterns.md#prompt-chaining" %}})           | Decomposes complex tasks into a sequence of steps where each LLM call processes the output of the previous one.
| [**Evaluator-Optimizer**]({{% ref "dapr-agents-patterns.md#evaluator-optimizer" %}})   | Implements a dual-LLM process where one model generates responses while another provides evaluation and feedback in an iterative loop.
| [**Parallelization**]({{% ref "dapr-agents-patterns.md#parallelization" %}})           | Processes multiple dimensions of a problem simultaneously with outputs aggregated programmatically for improved efficiency.
| [**Routing**]({{% ref "dapr-agents-patterns.md#routing" %}})                           | Classifies inputs and directs them to specialized follow-up tasks, enabling separation of concerns and expert specialization.
| [**Orchestrator-Workers**]({{% ref "dapr-agents-patterns.md#orchestrator-workers" %}}) | Features a central orchestrator LLM that dynamically breaks down tasks, delegates them to worker LLMs, and synthesizes results.


 
## Developer Experience

Dapr Agents is a Python framework built on top of the [Python Dapr SDK]({{% ref "developing-applications/sdks/python/_index.md" %}}), providing a comprehensive development experience for building agentic systems.

### Getting Started

Get started with Dapr Agents by following the instructions on the [Getting Started page]({{% ref dapr-agents-getting-started.md %}}).

### Framework Integrations

Dapr Agents integrates with popular Python frameworks and tools. For detailed integration guides and examples, see the [integrations page]({{% ref "developing-applications/dapr-agents/dapr-agents-integrations.md" %}}).
 
## Operational Support

Dapr Agents inherits Dapr's enterprise-grade operational capabilities, providing comprehensive support for durable and reliable deployments of agentic systems.

### Built-in Operational Features

- **[Observability]({{% ref observability-concept.md %}})** - Distributed tracing, metrics collection, and logging for agent interactions and workflow execution
- **[Security]({{% ref security-concept.md %}})** - mTLS encryption, access control, and secrets management for secure agent communication
- **[Resiliency]({{% ref resiliency-concept.md %}})** - Automatic retries, circuit breakers, and timeout policies for fault-tolerant agent operations
- **[Infrastructure Abstraction]({{% ref components-concept.md %}})** - Dapr components abstract LLM providers, memory stores, storage and messaging backends, enabling seamless transitions between different environments

These capabilities enable teams to monitor agent performance, secure multi-agent communications, and ensure reliable execution of complex agentic workflows.

## Contributing

Whether you're interested in enhancing the framework, adding new integrations, or improving documentation, we welcome contributions from the community.

For development setup and guidelines, see our [Contributor Guide]({{% ref "contributing/dapr-agents.md" %}}).