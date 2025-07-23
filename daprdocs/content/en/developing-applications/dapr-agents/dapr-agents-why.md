---
type: docs
title: "Why Dapr Agents"
linkTitle: "Why Dapr Agents"
weight: 30
description: "Understanding the benefits and use cases for Dapr Agents"
---

Dapr Agents is an open-source framework for building and orchestrating LLM-based autonomous agents that leverages Dapr's proven distributed systems foundation. Unlike other agentic frameworks that require developers to build infrastructure from scratch, Dapr Agents enables teams to focus on agent intelligence by providing enterprise-grade scalability, state management, and messaging capabilities out of the box. This approach eliminates the complexity of recreating distributed system fundamentals while delivering production-ready agentic workflows.RetryClaude can make mistakes. Please double-check responses.
 
### The Problem

Many agentic frameworks today attempt to redefine how microservices are built and orchestrated by developing their own platforms for core distributed system capabilities. While these efforts showcase innovation, they often lead to steep learning curves, fragmented systems, and unnecessary complexity when scaling or adapting to new environments.

These frameworks require developers to adopt entirely new paradigms or recreate foundational infrastructure, rather than building on existing solutions that are proven to handle these challenges at scale. This added complexity diverts focus from the primary goal: designing and implementing intelligent, effective agents.

### Dapr Agents' Approach

Dapr Agents takes a different approach by building on Dapr, leveraging its proven APIs and patterns including [workflows](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/), [Pub/Sub messaging](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-overview/), [state management](https://docs.dapr.io/developing-applications/building-blocks/state-management/state-management-overview/), and [service communication](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/service-invocation-overview/). This integration eliminates the need to recreate foundational components from scratch.

By integrating with Dapr's runtime and modular components, Dapr Agents empowers developers to build and deploy agents that work as collaborative services within larger systems. Whether experimenting with a single agent or orchestrating workflows involving multiple agents, Dapr Agents allows teams to concentrate on the intelligence and behavior of LLM-powered agents while leveraging a proven framework for scalability and reliability.

## Dapr Agents Benefits

### Scalable Workflows as First-Class Citizens

Dapr Agents uses a [durable-execution workflow engine](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/) that guarantees each agent task executes to completion despite network interruptions, node crashes, and other disruptive failures. Developers do not need to understand the underlying workflow engine concepts—simply write an agent that performs any number of tasks and these will be automatically distributed across the cluster. If any task fails, it will be retried and recover its state from where it left off.

### Cost-Effective AI Adoption

Dapr Agents builds on Dapr's Workflow API, which represents each agent as an actor, a single unit of compute and state that is thread-safe and natively distributed. This design enables a scale-to-zero architecture that minimizes infrastructure costs, making AI adoption accessible to organizations of all sizes. The underlying virtual actor model allows thousands of agents to run on demand on a single machine with low latency when scaling from zero. When unused, agents are reclaimed by the system but retain their state until needed again. This design eliminates the trade-off between performance and resource efficiency.

### Data-Centric AI Agents

With built-in connectivity to over 50 enterprise data sources, Dapr Agents efficiently handles structured and unstructured data. From basic [PDF extraction]({{< ref "/developing-applications/dapr-agents/dapr-agents-integrations.md" >}}) to large-scale database interactions, it enables data-driven AI workflows with minimal code changes. Dapr's [bindings](https://docs.dapr.io/developing-applications/building-blocks/bindings/bindings-overview/) and [state stores](https://docs.dapr.io/reference/components-reference/supported-state-stores/), along with MCP support, provide access to numerous data sources for agent data ingestion.

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

By building on Dapr, platform and infrastructure teams can apply Dapr's [resiliency policies](https://docs.dapr.io/operations/resiliency/policies/) to the database and message broker components used by Dapr Agents. These policies include timeouts, retry/backoff strategies, and circuit breakers. For [security](https://docs.dapr.io/concepts/security-concept/), Dapr provides options to scope access to specific databases or message brokers to one or more agentic app deployments. Additionally, Dapr Agents uses mTLS to encrypt communication between its underlying components.

### Built-in Messaging and State Infrastructure

- **Service-to-Service Invocation**: Enables direct communication between agents with built-in service discovery, error handling, and distributed tracing. Agents can use this for synchronous messaging in multi-agent workflows.
- **Publish and Subscribe**: Supports loosely coupled collaboration between agents through a shared message bus. This enables real-time, event-driven interactions for task distribution and coordination.
- **Durable Workflow**: Defines long-running, persistent workflows that combine deterministic processes with LLM-based decision-making. Dapr Agents uses this to orchestrate complex multi-step agentic workflows.
- **State Management**: Provides a flexible key-value store for agents to retain context across interactions, ensuring continuity and adaptability during workflows.
- **LLM Integration**: Uses Dapr [Conversation API](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) to abstract LLM inference APIs for chat completion, and provides native clients for other LLM integrations such as embeddings and audio processing.

### Vendor-Neutral and Open Source

As part of the **CNCF**, Dapr Agents is vendor-neutral, eliminating concerns about lock-in, intellectual property risks, or proprietary restrictions. Organizations gain full flexibility and control over their AI applications using open-source software they can audit and contribute to.