---
type: docs
title: "Why Dapr Agents"
linkTitle: "Why Dapr Agents"
weight: 30
description: "Understanding the benefits and use cases for Dapr Agents"
---

Dapr Agents is an open-source framework for building and orchestrating LLM-based autonomous agents, designed to simplify the complexity of creating scalable agentic workflows and microservices. Inspired by the growing need for frameworks that integrate seamlessly with distributed systems, Dapr Agents enables developers to focus on designing intelligent agents without getting bogged down by infrastructure concerns.

### The Problem

Many agentic frameworks today attempt to redefine how microservices are built and orchestrated by developing their own platforms for core distributed system capabilities. While these efforts showcase innovation, they often lead to a steep learning curve, fragmented systems, and unnecessary complexity when scaling or adapting to new environments.

Many of these frameworks require developers to adopt entirely new paradigms or recreate foundational infrastructure, rather than building on existing solutions that are proven to handle these challenges at scale. This added complexity often diverts focus from the primary goal: designing and implementing intelligent, effective agents.

### Dapr Agents' Approach

Dapr Agents takes a distinct approach by building on Dapr, leveraging its proven APIs and patterns including [workflows](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/), [Pub/Sub messaging](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-overview/), [state management](https://docs.dapr.io/developing-applications/building-blocks/state-management/state-management-overview/), and [service communication](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/service-invocation-overview/). This integration eliminates the need to recreate foundational components from scratch.

By integrating seamlessly with Dapr's runtime and modular components, Dapr Agents empowers developers to build and deploy agents that integrate as collaborative services within larger systems. Whether experimenting with a single agent or orchestrating workflows involving multiple agents, Dapr Agents' approach allows teams to concentrate on the intelligence and behavior of LLM-powered agents while leveraging a proven framework for scalability and reliability, rather than reinventing distributed systems capabilities.

## Dapr Agents Benefits

### Scalable Workflows as a First Class Citizen

Dapr Agents uses a [durable-execution workflow engine](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/) that guarantees each agent task executes to completion in the face of network interruptions, node crashes and other types of disruptive failures. Developers do not need to know about the underlying concepts of the workflow engine - simply write an agent that performs any number of tasks and these will get automatically distributed across the cluster. If any task fails, it will be retried and recover its state from where it left off.

### Cost-Effective AI Adoption

Dapr Agents builds on top of Dapr's Workflow API, which under the hood represents each agent as an actor, a single unit of compute and state that is thread-safe and natively distributed, lending itself well to an agentic Scale-To-Zero architecture. This minimizes infrastructure costs, making AI adoption accessible to everyone. The underlying virtual actor model allows thousands of agents to run on demand on a single core machine with double-digit millisecond latency when scaling from zero. When unused, the agents are reclaimed by the system but retain their state until the next time they are needed. With this design, there's no trade-off between performance and resource efficiency.

### Data-Centric AI Agents

With built-in connectivity to over 50 enterprise data sources, Dapr Agents efficiently handles structured and unstructured data. From basic [PDF extraction]({{< ref "/developing-applications/dapr-agents/dapr-agents-integrations.md" >}}) to large-scale database interactions, it enables seamless data-driven AI workflows with minimal code changes. Dapr's [bindings](https://docs.dapr.io/developing-applications/building-blocks/bindings/bindings-overview/) and [state stores](https://docs.dapr.io/reference/components-reference/supported-state-stores/), along with MCP support, provide access to a large number of data sources that can be used to ingest data to an agent.

### Accelerated Development

Dapr Agents provides a set of AI features that give developers a complete API surface to tackle common problems. Some of these include:


- Flexible prompting
- Structured outputs
- Multiple LLM providers
- Contextual memory
- Intelligent tool selection
- [MCP integration](https://docs.anthropic.com/en/docs/agents-and-tools/mcp)
- Multi-agent communications

### Integrated Security and Reliability

By building on top of Dapr, platform and infrastructure teams can apply Dapr's [resiliency policies](https://docs.dapr.io/operations/resiliency/policies/) to the database and/or message broker of their choice that are used by Dapr Agents. These policies include timeouts, retry/backoffs and circuit breakers. When it comes to [security](https://docs.dapr.io/concepts/security-concept/), Dapr provides the option to scope access to a given database or message broker to one or more agentic app deployments. In addition, Dapr Agents uses mTLS to encrypt the communication layer of its underlying components.

### Built-in Messaging and State Infrastructure

 - **Service-to-Service Invocation**: Facilitates direct communication between agents with built-in service discovery, error handling, and distributed tracing. Agents can leverage this for synchronous messaging in multi-agent workflows.
- **Publish and Subscribe**: Supports loosely coupled collaboration between agents through a shared message bus. This enables real-time, event-driven interactions critical for task distribution and coordination.
- **Durable Workflow**: Defines long-running, persistent workflows that combine deterministic processes with LLM-based decision-making. Dapr Agents uses this to orchestrate complex multi-step agentic workflows seamlessly.
- **State Management**: Provides a flexible key-value store for agents to retain context across interactions, ensuring continuity and adaptability during workflows.
- **LLM Integration**: Uses Dapr [Conversation API](https://docs.dapr.io/developing-applications/building-blocks/conversation/conversation-overview/) to abstract LLM inference APIs for chat completion, or provides native clients for other LLM integrations such as embeddings, audio, etc. 

### Vendor-Neutral and Open Source

As a part of **CNCF**, Dapr Agents is vendor-neutral, eliminating concerns about lock-in, intellectual property risks, or proprietary restrictions. Organizations gain full flexibility and control over their AI applications using open-source software they can audit and contribute to.

 