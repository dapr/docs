---
type: docs
title: "Core Concepts"
linkTitle: "Core Concepts"
weight: 40
description: "Learn about the core concepts of Dapr Agents"
---

Dapr Agents provides a structured way to build and orchestrate applications that use LLMs without getting bogged down in infrastructure details. The primary goal is to enable AI development by abstracting away the complexities of working with LLMs, tools, memory management, and distributed systems, allowing developers to focus on the business logic of their AI applications. Agents in this framework are the fundamental building blocks.

## Agents

Agents are autonomous units powered by Large Language Models (LLMs), designed to execute tasks, reason through problems, and collaborate within workflows. Acting as intelligent building blocks, agents combine reasoning with tool integration, memory, and collaboration features to get to the desired outcome.

![Concepts Agents](/images/dapr-agents/concepts-agents.png)

Dapr Agents provides two agent types, each designed for different use cases:

### Agent
The standard `Agent` class is a conversational agent that manages tool calls and conversations using a language model. It provides, synchronous execution with built-in conversation memory.

```python
@tool
def my_weather_func() -> str:
    """Get current weather."""
    return "It's 72°F and sunny"

async def main():
    weather_agent = Agent(
        name="WeatherAgent",
        role="Weather Assistant",
        instructions=["Help users with weather information"],
        tools=[my_weather_func],
        memory=ConversationDaprStateMemory(store_name="historystore", session_id="some-id"),
    )

    response1 = await weather_agent.run("What's the weather?")
    response2 = await weather_agent.run("How about now?")
```

This example shows how to create a simple agent with tool integration. The agent processes queries synchronously and maintains conversation context across multiple interactions using Dapr State Store API.

### Durable Agent

The `DurableAgent` class is a workflow-based agent that extends the standard Agent with Dapr Workflows for long-running, fault-tolerant, and durable execution. It provides persistent state management, automatic retry mechanisms, and deterministic execution across failures.

```python

travel_planner = DurableAgent(
        name="TravelBuddy",
        role="Travel Planner",
        instructions=["Help users find flights and remember preferences"],
        tools=[search_flights],
        memory=ConversationDaprStateMemory(
            store_name="conversationstore", session_id="my-unique-id"
        ),
        
        # DurableAgent Configurations
        message_bus_name="messagepubsub",
        state_store_name="workflowstatestore",
        state_key="workflow_state",
        agents_registry_store_name="registrystatestore",
        agents_registry_key="agents_registry",
    )

    travel_planner.as_service(port=8001)
    await travel_planner.start()

```
This example demonstrates creating a workflow-backed agent that runs autonomously in the background. The agent can be triggered once and continues execution even across system restarts.

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

In Summary:

| Agent Type      | Memory Type             | Execution                 | Interaction Mode             |
|-----------------|-------------------------|---------------------------|------------------------------|
| `Agent`         | In-memory or Persistent | Ephemeral                 | Synchronous / Conversational |
| `Durable Agent` | In-memory or Persistent | Durable (Workflow-backed) | Asynchronous / Headless      |


- Regular `Agent`: Interaction is synchronous—you send conversational prompts and receive responses immediately. The conversation can be stored in memory or persisted, but the execution is ephemeral and does not survive restarts.

- `DurableAgent` (Workflow-backed): Interaction is asynchronous—you trigger the agent once, and it runs autonomously in the background until completion. The conversation state can also be in memory or persisted, but the execution is durable and can resume across failures or restarts.


## Core Agent Features
An agentic system is a distributed system that requires a variety of behaviors and supporting infrastructure.

### LLM Integration

Dapr Agents provides a unified interface to connect with LLM inference APIs. This abstraction allows developers to seamlessly integrate their agents with cutting-edge language models for reasoning and decision-making. The framework includes multiple LLM clients for different providers and modalities:

- `DaprChatClient`: Unified API for LLM interactions via Dapr's Conversation API with built-in security (scopes, secrets, PII obfuscation), resiliency (timeouts, retries, circuit breakers), and observability via OpenTelemetry & Prometheus
- `OpenAIChatClient`: Full spectrum support for OpenAI models including chat, embeddings, and audio
- `HFHubChatClient`: For Hugging Face models supporting both chat and embeddings
- `NVIDIAChatClient`: For NVIDIA AI Foundation models supporting local inference and chat
- `ElevenLabs`: Support for speech and voice capabilities

### Prompt Flexibility

Dapr Agents supports flexible prompt templates to shape agent behavior and reasoning. Users can define placeholders within prompts, enabling dynamic input of context for inference calls. By leveraging prompt formatting with [Jinja templates](https://jinja.palletsprojects.com/en/stable/templates/) and Python f-string formatting, users can include loops, conditions, and variables, providing precise control over the structure and content of prompts. This flexibility ensures that LLM responses are tailored to the task at hand, offering modularity and adaptability for diverse use cases.

### Structured Outputs

Agents in Dapr Agents leverage structured output capabilities, such as [OpenAI’s Function Calling](https://platform.openai.com/docs/guides/function-calling), to generate predictable and reliable results. These outputs follow [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/release-notes.html) and [OpenAPI Specification v3.1.0](https://github.com/OAI/OpenAPI-Specification) standards, enabling easy interoperability and tool integration.

```python
# Define our data model
class Dog(BaseModel):
    name: str
    breed: str
    reason: str

# Initialize the chat client
llm = OpenAIChatClient()

# Get structured response
response = llm.generate(
    messages=[UserMessage("One famous dog in history.")], response_format=Dog
)

print(json.dumps(response.model_dump(), indent=2))
```
This demonstrates how LLMs generate structured data according to a schema. The Pydantic model (Dog) specifies the exact structure and data types expected, while the response_format parameter instructs the LLM to return data matching the model, ensuring consistent and predictable outputs for downstream processing.


### Tool Calling

Tool Calling is an essential pattern in autonomous agent design, allowing AI agents to interact dynamically with external tools based on user input. Agents dynamically select the appropriate tool for a given task, using LLMs to analyze requirements and choose the best action.

```python
@tool(args_model=GetWeatherSchema)
def get_weather(location: str) -> str:
    """Get weather information based on location."""
    import random
    temperature = random.randint(60, 80)
    return f"{location}: {temperature}F."
```

Each tool has a descriptive docstring that helps the LLM understand when to use it. The `@tool` decorator marks a function as a tool, while the Pydantic model (`GetWeatherSchema`) defines input parameters for structured validation.

![Tool Call Flow](/images/dapr-agents/concepts_agents_toolcall_flow.png)

1. The user submits a query specifying a task and the available tools.
2. The LLM analyzes the query and selects the right tool for the task.
3. The LLM provides a structured JSON output containing the tool's unique ID, name, and arguments.
4. The AI agent parses the JSON, executes the tool with the provided arguments, and sends the results back as a tool message.
5. The LLM then summarizes the tool's execution results within the user's context to deliver a comprehensive final response.

This is supported directly through LLM parametric knowledge and enhanced by [Function Calling](https://platform.openai.com/docs/guides/function-calling), ensuring tools are invoked efficiently and accurately.


### MCP Support
Dapr Agents includes built-in support for the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), enabling agents to dynamically discover and invoke external tools through a standardized interface. Using the provided MCPClient, agents can connect to MCP servers via three transport options: stdio for local development, sse for remote or distributed environments, and via streamable HTTP transport.

```python
client = MCPClient()
await client.connect_sse("local", url="http://localhost:8000/sse")

# Convert MCP tools to AgentTool list
tools = client.get_all_tools()
```

Once connected, the MCP client fetches all available tools from the server and prepares them for immediate use within the agent’s toolset. This allows agents to incorporate capabilities exposed by external processes—such as local Python scripts or remote services without hardcoding or preloading them. Agents can invoke these tools at runtime, expanding their behavior based on what’s offered by the active MCP server.

### Memory
Agents retain context across interactions, enhancing their ability to provide coherent and adaptive responses. Memory options range from simple in-memory lists for managing chat history to vector databases for semantic search, and also integrates with [Dapr state stores](https://docs.dapr.io/developing-applications/building-blocks/state-management/howto-get-save-state/), for scalable and persistent memory for advanced use cases from 28 different state store providers.


```python
# ConversationListMemory (Simple In-Memory) - Default
memory_list = ConversationListMemory()

# ConversationVectorMemory (Vector Store)
memory_vector = ConversationVectorMemory(
    vector_store=your_vector_store_instance,
    distance_metric="cosine"
)

# 3. ConversationDaprStateMemory (Dapr State Store)
memory_dapr = ConversationDaprStateMemory(
    store_name="historystore",  # Maps to Dapr component name
    session_id="some-id"
)

# Using with an agent
agent = Agent(
    name="MyAgent",
    role="Assistant",
    memory=memory_dapr  # Pass any memory implementation
)

```
`ConversationListMemory` is the default memory implementation when none is specified. It provides fast, temporary storage in Python lists for development and testing. The Dapr's memory implementations are interchangeable, allowing you to switch between them without modifying your agent logic.

| Memory Implementation | Type | Persistence | Search | Use Case |
|---|---|---|---|---|
| `ConversationListMemory` (Default) | In-Memory | ❌ | Linear | Development |
| `ConversationVectorMemory` | Vector Store | ✅ | Semantic | RAG/AI Apps |
| `ConversationDaprStateMemory` | Dapr State Store | ✅ | Query | Production |


### Agent Services

`DurableAgents` are exposed as independent services using [FastAPI and Dapr applications](https://docs.dapr.io/developing-applications/sdks/python/python-sdk-extensions/python-fastapi/). This modular approach separates the agent's logic from its service layer, enabling seamless reuse, deployment, and integration into multi-agent systems.

```python
travel_planner.as_service(port=8001)
await travel_planner.start()
```
This exposes the agent as a REST service, allowing other systems to interact with it through standard HTTP requests such as this one:

```
curl -i -X POST http://localhost:8001/start-workflow \
-H "Content-Type: application/json" \
-d '{"task": "I want to find flights to Paris"}'
```
Unlike conversational agents that provide immediate synchronous responses, durable agents operate as headless services that are triggered asynchronously. You trigger it, receive a workflow instance ID, and can track progress over time. This enables long-running, fault-tolerant operations that can span multiple systems and survive restarts, making them ideal for complex multi-step processes in environments requiring high levels of durability and resiliency.

## Multi-agent Systems (MAS)

While it's tempting to build a fully autonomous agent capable of handling many tasks, in practice, it's more effective to break this down into specialized agents equipped with appropriate tools and instructions, then coordinate interactions between multiple agents.

Multi-agent systems (MAS) distribute workflow execution across multiple coordinated agents to efficiently achieve shared objectives. This approach, called agent orchestration, enables better specialization, scalability, and maintainability compared to monolithic agent designs.

![Agent Orchestration](/images/dapr-agents/home_concepts_principles_workflows.png)

Dapr Agents supports two primary orchestration approaches via [Dapr Workflows](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/) and [Dapr PubSub](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-overview/):

- **Deterministic Workflow-based Orchestration** - Provides clear, repeatable processes with predefined sequences and decision points
- **Event-driven Orchestration** - Enables dynamic, adaptive collaboration through message-based coordination among agents

Both approaches utilize a central orchestrator that coordinates multiple specialized agents, each handling specific tasks or domains, ensuring efficient task distribution and seamless collaboration across the system.

## Deterministic Workflows

Workflows are structured processes where LLM agents and tools collaborate in predefined sequences to accomplish complex tasks. Unlike fully autonomous agents that make all decisions independently, workflows provide a balance of structure and predictability from the workflow definition, intelligence and flexibility from LLM agents, and reliability and durability from Dapr's workflow engine.

This approach is particularly suitable for business-critical applications where you need both the intelligence of LLMs and the reliability of traditional software systems.

```python
# Define Workflow logic
@workflow(name="task_chain_workflow")
def task_chain_workflow(ctx: DaprWorkflowContext):
    result1 = yield ctx.call_activity(get_character)
    result2 = yield ctx.call_activity(get_line, input={"character": result1})
    return result2

@task(description="Pick a random character from The Lord of the Rings and respond with the character's name only")
def get_character() -> str:
    pass

@task(description="What is a famous line by {character}")
def get_line(character: str) -> str:
    pass
```

This workflow demonstrates sequential task execution where the output of one task becomes the input for the next, enabling complex multi-step processes with clear dependencies and data flow.

Dapr Agents supports coordination of LLM interactions at different levels of granularity:

### Prompt Tasks
Tasks created from prompts that leverage LLM reasoning capabilities for specific, well-defined operations.

```python
@task(description="Pick a random character from The Lord of the Rings and respond with the character's name only")
def get_character() -> str:
    pass
```

While technically not full agents (as they lack tools and memory), prompt tasks serve as lightweight agentic building blocks that perform focused LLM interactions within the broader workflow context.

### Agent Tasks
Tasks based on agents with tools, providing greater flexibility and capability for complex operations requiring external integrations.

```python
@task(agent=custom_agent, description="Retrieve stock data for {ticker}")
def get_stock_data(ticker: str) -> dict:
    pass
```
Agent tasks enable workflows to leverage specialized agents with their own tools, memory, and reasoning capabilities while maintaining the structured coordination benefits of workflow orchestration.

> **Note:** Agent tasks must use regular `Agent` instances, not `DurableAgent` instances, as workflows manage the execution context and durability through the Dapr workflow engine.

### Workflow Patterns

Workflows enable the implementation of various agentic patterns through structured orchestration, including Prompt Chaining, Routing, Parallelization, Orchestrator-Workers, Evaluator-Optimizer, Human-in-the-loop, and others. For detailed implementations and examples of these patterns, see the [Patterns documentation]({{< ref dapr-agents-patterns.md >}}).

### Workflows vs. Durable Agents

Both DurableAgent and workflow-based agent orchestration use Dapr workflows behind the scenes for durability and reliability, but they differ in how control flow is determined.

| Aspect | Workflows | Durable Agents           |
|--------|-----------|------------------------------------|
| Control | Developer-defined process flow | Agent determines next steps        |
| Predictability | Higher | Lower                              |
| Flexibility | Fixed overall structure, flexible within steps | Completely flexible                |
| Reliability | Very high (workflow engine guarantees) | Very high (underlying agent implementation guarantees)    |
| Complexity | Structured workflow patterns | Dynamic, flexible execution paths     |
| Use Cases | Business processes, regulated domains | Open-ended research, creative tasks |

The key difference lies in control flow determination: with DurableAgent, the underlying workflow is created dynamically by the LLM's planning decisions, executing entirely within a single agent context. In contrast, with deterministic workflows, the developer explicitly defines the coordination between one or more LLM interactions, providing structured orchestration across multiple tasks or agents.


## Event-Driven Orchestration
Event-driven agent orchestration enables multiple specialized agents to collaborate through asynchronous [Pub/Sub messaging](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-overview/). This approach provides powerful collaborative problem-solving, parallel processing, and division of responsibilities among specialized agents through independent scaling, resilience via service isolation, and clear separation of responsibilities.

### Core Participants
The core participants in this multi-agent coordination systems are the following.

#### Durable Agents

Each agent runs as an independent service with its own lifecycle, configured as a standard DurableAgent with pub/sub enabled:

```python
hobbit_service = DurableAgent(
    name="Frodo",
    instructions=["Speak like Frodo, with humility and determination."],
    message_bus_name="messagepubsub",
    state_store_name="workflowstatestore",
    state_key="workflow_state",
    agents_registry_store_name="agentstatestore",
    agents_registry_key="agents_registry", 
)
```

#### Orchestrator

The orchestrator coordinates interactions between agents and manages conversation flow by selecting appropriate agents, managing interaction sequences, and tracking progress. Dapr Agents offers three orchestration strategies: Random, RoundRobin, and LLM-based orchestration.

```python
llm_orchestrator = LLMOrchestrator(
    name="LLMOrchestrator",
    message_bus_name="messagepubsub",
    state_store_name="agenticworkflowstate",
    state_key="workflow_state",
    agents_registry_store_name="agentstatestore",
    agents_registry_key="agents_registry",
    max_iterations=3
)
```

The LLM-based orchestrator uses intelligent agent selection for context-aware decision making, while Random and RoundRobin provide alternative coordination strategies for simpler use cases.

### Communication Flow

Agents communicate through an event-driven pub/sub system that enables asynchronous communication, decoupled architecture, scalable interactions, and reliable message delivery. The typical collaboration flow involves client query submission, orchestrator-driven agent selection, agent response processing, and iterative coordination until task completion.

This approach is particularly effective for complex problem solving requiring multiple expertise areas, creative collaboration from diverse perspectives, role-playing scenarios, and distributed processing of large tasks.

### How Messaging Works

Messaging connects agents in workflows, enabling real-time communication and coordination. It acts as the backbone of event-driven interactions, ensuring that agents work together effectively without requiring direct connections.

Through messaging, agents can:

* **Collaborate Across Tasks**: Agents exchange messages to share updates, broadcast events, or deliver task results.
* **Orchestrate Workflows**: Tasks are triggered and coordinated through published messages, enabling workflows to adjust dynamically.
* **Respond to Events**: Agents adapt to real-time changes by subscribing to relevant topics and processing events as they occur.

By using messaging, workflows remain modular and scalable, with agents focusing on their specific roles while seamlessly participating in the broader system.

#### Message Bus and Topics

The message bus serves as the central system that manages topics and message delivery. Agents interact with the message bus to send and receive messages:

* **Publishing Messages**: Agents publish messages to a specific topic, making the information available to all subscribed agents.
* **Subscribing to Topics**: Agents subscribe to topics relevant to their roles, ensuring they only receive the messages they need.
* **Broadcasting Updates**: Multiple agents can subscribe to the same topic, allowing them to act on shared events or updates.

#### Why Pub/Sub Messaging for Agentic Workflows?

Pub/Sub messaging is essential for event-driven agentic workflows because it:

* **Decouples Components**: Agents publish messages without needing to know which agents will receive them, promoting modular and scalable designs.
* **Enables Real-Time Communication**: Messages are delivered as events occur, allowing agents to react instantly.
* **Fosters Collaboration**: Multiple agents can subscribe to the same topic, making it easy to share updates or divide responsibilities.
* **Enables Scalability**:The message bus ensures that communication scales effortlessly, whether you are adding new agents, expanding workflows, or adapting to changing requirements. Agents remain loosely coupled, allowing workflows to evolve without disruptions.

This messaging framework ensures that agents operate efficiently, workflows remain flexible, and systems can scale dynamically. 