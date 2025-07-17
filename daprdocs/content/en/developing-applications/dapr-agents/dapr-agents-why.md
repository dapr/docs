---
type: docs
title: "Why Dapr Agents"
linkTitle: "Why Dapr Agents"
weight: 25
description: "Understanding the benefits and use cases for Dapr Agents"
---

Dapr Agents is an open-source framework for building and orchestrating LLM-based autonomous agents, designed to simplify the complexity of creating scalable agentic workflows and microservices. Inspired by the growing need for frameworks that integrate seamlessly with distributed systems, Dapr Agents enables developers to focus on designing intelligent agents without getting bogged down by infrastructure concerns.

### The Problem

Many agentic frameworks today attempt to redefine how microservices are built and orchestrated by developing their own platforms for workflows, Pub/Sub messaging, state management, and service communication. While these efforts showcase innovation, they often lead to a steep learning curve, fragmented systems, and unnecessary complexity when scaling or adapting to new environments.

Many of these frameworks require developers to adopt entirely new paradigms or recreate foundational infrastructure, rather than building on existing solutions that are proven to handle these challenges at scale. This added complexity often diverts focus from the primary goal: designing and implementing intelligent, effective agents.

### Dapr Agents' Approach

Dapr Agents takes a distinct approach by building on [Dapr](https://dapr.io/), a portable and event-driven runtime optimized for distributed systems. Dapr offers built-in APIs and patterns such as state management, Pub/Sub messaging, service invocation, and virtual actors—that eliminate the need to recreate foundational components from scratch. By integrating seamlessly with Dapr, Dapr Agents empowers developers to focus on the intelligence and behavior of LLM-powered agents while leveraging a proven framework for scalability and reliability.

Rather than reinventing microservices, Dapr Agents enables developers to design, test, and deploy agents that seamlessly integrate as collaborative services within larger systems. Whether experimenting with a single agent or orchestrating workflows involving multiple agents, Dapr Agents simplifies the exploration and implementation of scalable agentic workflows.

[//]: # (### Conclusion)

[//]: # ()
[//]: # (Dapr Agents provides a unified framework for designing, deploying, and orchestrating LLM-powered agents. By leveraging Dapr’s runtime and modular components, Dapr Agents allows developers to focus on building intelligent systems without worrying about the complexities of distributed infrastructure. Whether you're creating standalone agents or orchestrating multi-agent workflows, Dapr Agents empowers you to explore the future of intelligent, scalable, and collaborative systems.)


## Dapr Agents Benefits

### Scalable Workflows as a First Class Citizen

Dapr Agents uses a [durable-execution workflow engine](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/) that guarantees each agent task executes to completion in the face of network interruptions, node crashes and other types of disruptive failures. Developers do not need to know about the underlying concepts of the workflow engine - simply write an agent that performs any number of tasks and these will get automatically distributed across the cluster. If any task fails, it will be retried and recover its state from where it left off.

### Cost-Effective AI Adoption

Dapr Agents builds on top of Dapr's Workflow API, which under the hood represents each agent as an actor, a single unit of compute and state that is thread-safe and natively distributed, lending itself well to an agentic Scale-To-Zero architecture. This minimizes infrastructure costs, making AI adoption accessible to everyone. The underlying virtual actor model allows thousands of agents to run on demand on a single core machine with double-digit millisecond latency when scaling from zero. When unused, the agents are reclaimed by the system but retain their state until the next time they are needed. With this design, there's no trade-off between performance and resource efficiency.

### Data-Centric AI Agents

With built-in connectivity to over 50 enterprise data sources, Dapr Agents efficiently handles structured and unstructured data. From basic [PDF extraction]({{< ref "/developing-applications/dapr-agents/dapr-agents-tools.md" >}}) to large-scale database interactions, it enables seamless data-driven AI workflows with minimal code changes. Dapr's [bindings](https://docs.dapr.io/reference/components-reference/supported-bindings/) and [state stores](https://docs.dapr.io/reference/components-reference/supported-state-stores/), along with [MCP](https://modelcontextprotocol.io/) support, provide access to a large number of data sources that can be used to ingest data to an agent.

### Accelerated Development

Dapr Agents provides a set of AI features that give developers a complete API surface to tackle common problems. Some of these include:

- Multi-agent communications
- Structured outputs
- Multiple LLM providers
- Contextual memory
- Flexible prompting
- Intelligent tool selection
- [MCP integration](https://docs.anthropic.com/en/docs/agents-and-tools/mcp)

### Integrated Security and Reliability

By building on top of Dapr, platform and infrastructure teams can apply Dapr's [resiliency policies](https://docs.dapr.io/operations/resiliency/policies/) to the database and/or message broker of their choice that are used by Dapr Agents. These policies include timeouts, retry/backoffs and circuit breakers. When it comes to security, Dapr provides the option to scope access to a given database or message broker to one or more agentic app deployments. In addition, Dapr Agents uses mTLS to encrypt the communication layer of its underlying components.

### Built-in Messaging and State Infrastructure

 - **Service-to-Service Invocation**: Facilitates direct communication between agents with built-in service discovery, error handling, and distributed tracing. Agents can leverage this for synchronous messaging in multi-agent workflows.
- **Publish and Subscribe**: Supports loosely coupled collaboration between agents through a shared message bus. This enables real-time, event-driven interactions critical for task distribution and coordination.
- **Durable Workflow**: Defines long-running, persistent workflows that combine deterministic processes with LLM-based decision-making. Dapr Agents uses this to orchestrate complex multi-step agentic workflows seamlessly.
- **State Management**: Provides a flexible key-value store for agents to retain context across interactions, ensuring continuity and adaptability during workflows.
- **Actors**: Implements the Virtual Actor pattern, allowing agents to operate as self-contained, stateful units that handle messages sequentially. This eliminates concurrency concerns and enhances scalability in agentic systems.

### Vendor-Neutral and Open Source

As a part of **CNCF**, Dapr Agents is vendor-neutral, eliminating concerns about lock-in, intellectual property risks, or proprietary restrictions. Organizations gain full flexibility and control over their AI applications using open-source software they can audit and contribute to.

 