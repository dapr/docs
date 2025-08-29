---
type: docs
title: "Agentic Patterns"
linkTitle: "Agentic Patterns"
weight: 50
description: "Common design patterns and use cases for building agentic systems"
---

Dapr Agents simplify the implementation of agentic systems, from simple augmented LLMs to fully autonomous agents in enterprise environments. The following sections describe several application patterns that can benefit from Dapr Agents.

## Overview

Agentic systems use design patterns such as reflection, tool use, planning, and multi-agent collaboration to achieve better results than simple single-prompt interactions. Rather than thinking of "agent" as a binary classification, it's more useful to think of systems as being agentic to different degrees.

This ranges from simple workflows that prompt a model once, to sophisticated systems that can carry out multiple iterative steps with greater autonomy. 
There are two fundamental architectural approaches:

* **Workflows**: Systems where LLMs and tools are orchestrated through predefined code paths (more prescriptive)
* **Agents**: Systems where LLMs dynamically direct their own processes and tool usage (more autonomous)

On one end, we have predictable workflows with well-defined decision paths and deterministic outcomes. On the other end, we have AI agents that can dynamically direct their own strategies. While fully autonomous agents might seem appealing, workflows often provide better predictability and consistency for well-defined tasks. This aligns with enterprise requirements where reliability and maintainability are crucial.

<img src="/images/dapr-agents/agents-patterns-overview.png" width=1200 style="padding-bottom:15px;">

The patterns in this documentation start with the Augmented LLM, then progress through workflow-based approaches that offer predictability and control, before moving toward more autonomous patterns. Each addresses specific use cases and offers different trade-offs between deterministic outcomes and autonomy.

## Augmented LLM

The Augmented LLM pattern is the foundational building block for any kind of agentic system. It enhances a language model with external capabilities like memory and tools, providing a basic but powerful foundation for AI-driven applications.

<img src="/images/dapr-agents/agents-augmented-llm.png" width=600 alt="Diagram showing how the augmented LLM pattern works">

This pattern is ideal for scenarios where you need an LLM with enhanced capabilities but don't require complex orchestration or autonomous decision-making. The augmented LLM can access external tools, maintain conversation history, and provide consistent responses across interactions.

**Use Cases:**
- Personal assistants that remember user preferences
- Customer support agents that access product information
- Research tools that retrieve and analyze information

**Implementation with Dapr Agents:**

```python
from dapr_agents import Agent, tool

@tool
def search_flights(destination: str) -> List[FlightOption]:
    """Search for flights to the specified destination."""
    # Mock flight data (would be an external API call in a real app)
    return [
        FlightOption(airline="SkyHighAir", price=450.00),
        FlightOption(airline="GlobalWings", price=375.50)
    ]

# Create agent with memory and tools
travel_planner = Agent(
    name="TravelBuddy",
    role="Travel Planner Assistant",
    instructions=["Remember destinations and help find flights"],
    tools=[search_flights],
)
```

Dapr Agents automatically handles:
- **Agent configuration** - Simple configuration with role and instructions guides the LLM behavior
- **Memory persistence** - The agent manages conversation memory 
- **Tool integration** - The `@tool` decorator handles input validation, type conversion, and output formatting

The foundational building block of any agentic system is the Augmented LLM - a language model enhanced with external capabilities like memory, tools, and retrieval. In Dapr Agents, this is represented by the `Agent` class. However, while this provides essential capabilities, it alone is often not sufficient for complex enterprise scenarios. This is why it's typically combined with workflow orchestration that provides structure, reliability, and coordination for multi-step processes.

## Prompt Chaining

The Prompt Chaining pattern addresses complex requirements by decomposing tasks into a sequence of steps, where each LLM call processes the output of the previous one. This pattern allows for better control of the overall process, validation between steps, and specialization of each step.

<img src="/images/dapr-agents/agents-prompt-chaining.png" width=800 alt="Diagram showing how the prompt chaining pattern works">

**Use Cases:**
- Content generation (creating outlines first, then expanding, then reviewing)
- Multi-stage analysis (performing complex analysis into sequential steps)
- Quality assurance workflows (adding validation between processing steps)

**Implementation with Dapr Agents:**

```python
from dapr_agents import DaprWorkflowContext, workflow

@workflow(name='travel_planning_workflow')
def travel_planning_workflow(ctx: DaprWorkflowContext, user_input: str):
    # Step 1: Extract destination using a simple prompt (no agent)
    destination_text = yield ctx.call_activity(extract_destination, input=user_input)
    
    # Gate: Check if destination is valid
    if "paris" not in destination_text.lower():
        return "Unable to create itinerary: Destination not recognized or supported."
    
    # Step 2: Generate outline with planning agent (has tools)
    travel_outline = yield ctx.call_activity(create_travel_outline, input=destination_text)
    
    # Step 3: Expand into detailed plan with itinerary agent (no tools)
    detailed_itinerary = yield ctx.call_activity(expand_itinerary, input=travel_outline)
    
    return detailed_itinerary
```

The implementation showcases three different approaches:
- **Basic prompt-based task** (no agent)
- **Agent-based task** without tools
- **Agent-based task** with tools

Dapr Agents' workflow orchestration provides:
- **Workflow as Code** - Tasks are defined in developer-friendly ways
- **Workflow Persistence** - Long-running chained tasks survive process restarts
- **Hybrid Execution** - Easily mix prompts, agent calls, and tool-equipped agents

## Routing

The Routing pattern addresses diverse request types by classifying inputs and directing them to specialized follow-up tasks. This allows for separation of concerns and creates specialized experts for different types of queries.

<img src="/images/dapr-agents/agents-routing.png" width=600 alt="Diagram showing how the routing pattern works">

**Use Cases:**
- Resource optimization (sending simple queries to smaller models)
- Multi-lingual support (routing queries to language-specific handlers)
- Customer support (directing different query types to specialized handlers)
- Content creation (routing writing tasks to topic specialists)
- Hybrid LLM systems (using different models for different tasks)

**Implementation with Dapr Agents:**

```python
@workflow(name="travel_assistant_workflow")
def travel_assistant_workflow(ctx: DaprWorkflowContext, input_params: dict):
    user_query = input_params.get("query")
    
    # Classify the query type using an LLM
    query_type = yield ctx.call_activity(classify_query, input={"query": user_query})

    # Route to the appropriate specialized handler
    if query_type == QueryType.ATTRACTIONS:
        response = yield ctx.call_activity(
            handle_attractions_query,
            input={"query": user_query}
        )
    elif query_type == QueryType.ACCOMMODATIONS:
        response = yield ctx.call_activity(
            handle_accommodations_query,
            input={"query": user_query}
        )
    elif query_type == QueryType.TRANSPORTATION:
        response = yield ctx.call_activity(
            handle_transportation_query,
            input={"query": user_query}
        )
    else:
        response = "I'm not sure how to help with that specific travel question."
        
    return response
```

The advantages of Dapr's approach include:
- **Familiar Control Flow** - Uses standard programming if-else constructs for routing
- **Extensibility** - The control flow can be extended for future requirements easily
- **LLM-Powered Classification** - Uses an LLM to categorize queries dynamically

## Parallelization

The Parallelization pattern enables processing multiple dimensions of a problem simultaneously, with outputs aggregated programmatically. This pattern improves efficiency for complex tasks with independent subtasks that can be processed concurrently.

<img src="/images/dapr-agents/agents-parallelization.png" width=600 alt="Diagram showing how the parallelization pattern works">

**Use Cases:**
- Complex research (processing different aspects of a topic in parallel)
- Multi-faceted planning (creating various elements of a plan concurrently)
- Product analysis (analyzing different aspects of a product in parallel)
- Content creation (generating multiple sections of a document simultaneously)

**Implementation with Dapr Agents:**

```python
@workflow(name="travel_planning_workflow")
def travel_planning_workflow(ctx: DaprWorkflowContext, input_params: dict):
    destination = input_params.get("destination")
    preferences = input_params.get("preferences")
    days = input_params.get("days")

    # Process three aspects of the travel plan in parallel
    parallel_tasks = [
        ctx.call_activity(research_attractions, input={
            "destination": destination, 
            "preferences": preferences, 
            "days": days
        }),
        ctx.call_activity(recommend_accommodations, input={
            "destination": destination, 
            "preferences": preferences, 
            "days": days
        }),
        ctx.call_activity(suggest_transportation, input={
            "destination": destination, 
            "preferences": preferences, 
            "days": days
        })
    ]

    # Wait for all parallel tasks to complete
    results = yield wfapp.when_all(parallel_tasks)
    
    # Aggregate results into final plan
    final_plan = yield ctx.call_activity(create_final_plan, input={"results": results})
    
    return final_plan
```

The benefits of using Dapr for parallelization include:
- **Simplified Concurrency** - Handles the complex orchestration of parallel tasks
- **Automatic Synchronization** - Waits for all parallel tasks to complete
- **Workflow Durability** - The entire parallel process is durable and recoverable

## Orchestrator-Workers

For highly complex tasks where the number and nature of subtasks can't be known in advance, the Orchestrator-Workers pattern offers a powerful solution. This pattern features a central orchestrator LLM that dynamically breaks down tasks, delegates them to worker LLMs, and synthesizes their results.

<img src="/images/dapr-agents/agents-orchestrator-workers.png" width=600 alt="Diagram showing how the orchestrator-workers pattern works">

Unlike previous patterns where workflows are predefined, the orchestrator determines the workflow dynamically based on the specific input.

**Use Cases:**
- Software development tasks spanning multiple files
- Research gathering information from multiple sources
- Business analysis evaluating different facets of a complex problem
- Content creation combining specialized content from various domains

**Implementation with Dapr Agents:**

```python
@workflow(name="orchestrator_travel_planner")
def orchestrator_travel_planner(ctx: DaprWorkflowContext, input_params: dict):
    travel_request = input_params.get("request")

    # Step 1: Orchestrator analyzes request and determines required tasks
    plan_result = yield ctx.call_activity(
        create_travel_plan,
        input={"request": travel_request}
    )

    tasks = plan_result.get("tasks", [])

    # Step 2: Execute each task with a worker LLM
    worker_results = []
    for task in tasks:
        task_result = yield ctx.call_activity(
            execute_travel_task,
            input={"task": task}
        )
        worker_results.append({
            "task_id": task["task_id"],
            "result": task_result
        })

    # Step 3: Synthesize the results into a cohesive travel plan
    final_plan = yield ctx.call_activity(
        synthesize_travel_plan,
        input={
            "request": travel_request,
            "results": worker_results
        }
    )

    return final_plan
```

The advantages of Dapr for the Orchestrator-Workers pattern include:
- **Dynamic Planning** - The orchestrator can dynamically create subtasks based on input
- **Worker Isolation** - Each worker focuses on solving one specific aspect of the problem
- **Simplified Synthesis** - The final synthesis step combines results into a coherent output

## Evaluator-Optimizer

Quality is often achieved through iteration and refinement. The Evaluator-Optimizer pattern implements a dual-LLM process where one model generates responses while another provides evaluation and feedback in an iterative loop.

<img src="/images/dapr-agents/agents-evaluator-optimizer.png" width=600 alt="Diagram showing how the evaluator-optimizer pattern works">

**Use Cases:**
- Content creation requiring adherence to specific style guidelines
- Translation needing nuanced understanding and expression
- Code generation meeting specific requirements and handling edge cases
- Complex search requiring multiple rounds of information gathering and refinement

**Implementation with Dapr Agents:**

```python
@workflow(name="evaluator_optimizer_travel_planner")
def evaluator_optimizer_travel_planner(ctx: DaprWorkflowContext, input_params: dict):
    travel_request = input_params.get("request")
    max_iterations = input_params.get("max_iterations", 3)
    
    # Generate initial travel plan
    current_plan = yield ctx.call_activity(
        generate_travel_plan,
        input={"request": travel_request, "feedback": None}
    )

    # Evaluation loop
    iteration = 1
    meets_criteria = False

    while iteration <= max_iterations and not meets_criteria:
        # Evaluate the current plan
        evaluation = yield ctx.call_activity(
            evaluate_travel_plan,
            input={"request": travel_request, "plan": current_plan}
        )

        score = evaluation.get("score", 0)
        feedback = evaluation.get("feedback", [])
        meets_criteria = evaluation.get("meets_criteria", False)
        
        # Stop if we meet criteria or reached max iterations
        if meets_criteria or iteration >= max_iterations:
            break

        # Optimize the plan based on feedback
        current_plan = yield ctx.call_activity(
            generate_travel_plan,
            input={"request": travel_request, "feedback": feedback}
        )

        iteration += 1

    return {
        "final_plan": current_plan,
        "iterations": iteration,
        "final_score": score
    }
```

The benefits of using Dapr for this pattern include:
- **Iterative Improvement Loop** - Manages the feedback cycle between generation and evaluation
- **Quality Criteria** - Enables clear definition of what constitutes acceptable output
- **Maximum Iteration Control** - Prevents infinite loops by enforcing iteration limits

## Durable Agent

Moving to the far end of the agentic spectrum, the Durable Agent pattern represents a shift from workflow-based approaches. Instead of predefined steps, we have an autonomous agent that can plan its own steps and execute them based on its understanding of the goal.

Enterprise applications often need durable execution and reliability that go beyond in-memory capabilities. Dapr's `DurableAgent` class helps you implement autonomous agents with the reliability of workflows, as these agents are backed by Dapr workflows behind the scenes. The `DurableAgent` extends the basic `Agent` class by adding durability to agent execution.

<img src="/images/dapr-agents/agents-stateful-llm.png" width=600 alt="Diagram showing how the durable agent pattern works">

This pattern doesn't just persist message history – it dynamically creates workflows with durable activities for each interaction, where LLM calls and tool executions are stored reliably in Dapr's state stores. This makes it ideal for environments where reliability and durability is critical.

The Durable Agent also enables the "headless agents" approach where autonomous systems that operate without direct user interaction. Dapr's Durable Agent exposes REST and Pub/Sub APIs, making it ideal for long-running operations that are triggered by other applications or external events.


**Use Cases:**
- Long-running tasks that may take minutes or days to complete
- Distributed systems running across multiple services
- Customer support handling complex multi-session tickets
- Business processes with LLM intelligence at each step
- Personal assistants handling scheduling and information lookup
- Autonomous background processes triggered by external systems

**Implementation with Dapr Agents:**

```python
from dapr_agents import DurableAgent

travel_planner = DurableAgent(
    name="TravelBuddy",
    role="Travel Planner",
    goal="Help users find flights and remember preferences",
    instructions=[
        "Find flights to destinations",
        "Remember user preferences",
        "Provide clear flight info"
    ],
    tools=[search_flights],
    message_bus_name="messagepubsub",
    state_store_name="workflowstatestore",
    state_key="workflow_state",
    agents_registry_store_name="workflowstatestore",
    agents_registry_key="agents_registry",
)
```
The implementation follows Dapr's sidecar architecture model, where all infrastructure concerns are handled by the Dapr runtime:
- **Persistent Memory** - Agent state is stored in Dapr's state store, surviving process crashes
- **Workflow Orchestration** - All agent interactions managed through Dapr's workflow system
- **Service Exposure** - REST endpoints for workflow management come out of the box
- **Pub/Sub Input/Output** - Event-driven messaging through Dapr's pub/sub system for seamless integration

The Durable Agent enables the concept of "headless agents" - autonomous systems that operate without direct user interaction. Dapr's Durable Agent exposes both REST and Pub/Sub APIs, making it ideal for long-running operations that are triggered by other applications or external events. This allows agents to run in the background, processing requests asynchronously and integrating seamlessly into larger distributed systems.


## Choosing the Right Pattern

The journey from simple agentic workflows to fully autonomous agents represents a spectrum of approaches for integrating LLMs into your applications. Different use cases call for different levels of agency and control:

- **Start with simpler patterns** like Augmented LLM and Prompt Chaining for well-defined tasks where predictability is crucial
- **Progress to more dynamic patterns** like Parallelization and Orchestrator-Workers as your needs grow more complex
- **Consider fully autonomous agents** only for open-ended tasks where the benefits of flexibility outweigh the need for strict control
 