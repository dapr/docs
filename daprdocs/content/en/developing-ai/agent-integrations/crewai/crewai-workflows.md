---
type: docs
title: "CrewAI Workflows"
linkTitle: "CrewAI Workflows"
weight: 25
description: "How to run CrewAI agents with durable, fault-tolerant execution using Dapr Workflows"
---

## Overview

Dapr Workflows make it possible to run CrewAI agents **reliably**, **durably**, and **with built-in resiliency**.  
By orchestrating CrewAI tasks with the Dapr Workflow engine, developers can:

- Ensure long-running CrewAI work survives crashes and restarts.
- Get automatic checkpoints, retries, and state recovery.
- Run each CrewAI task as a durable activity.
- Observe execution through tracing, metrics, and structured logs.

This guide walks through orchestrating multiple CrewAI tasks using Dapr Workflows, ensuring each step is run *exactly once* even if the process restarts.

## Getting Started

Initialize Dapr locally to set up a self-hosted environment for development. This process installs the Dapr sidecar binaries, provisions the workflow engine, and prepares a default components directory. For full details, see [guide on initializing Dapr locally]({{% ref install-dapr-selfhost.md %}}).

Initialize Dapr:

```bash
dapr init
```

Verify that daprio/dapr, openzipkin/zipkin, and redis are running:

```bash
docker ps
```

### Install Python

{{% alert title="Note" color="info" %}}
Make sure you have Python already installed. `Python >=3.10`. For installation instructions, visit the official [Python installation guide](https://www.python.org/downloads/).
{{% /alert %}}

### Create a Python Virtual Environment (recommended)

```bash
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
```

### Install Dependencies

```bash
pip install dapr dapr-ext-workflow crewai
```

### Create a Workflow to Run CrewAI Tasks

Create a file named crewai_workflow.py and paste the following:

```python
from dapr.ext.workflow import (
    WorkflowRuntime,
    DaprWorkflowContext,
    WorkflowActivityContext,
    DaprWorkflowClient,
)
from crewai import Agent, Task, Crew
import time

wfr = WorkflowRuntime()

# ------------------------------------------------------------
# 1. Define Agent, Tasks, and Task Dictionary
# ------------------------------------------------------------
agent = Agent(
    role="Research Analyst",
    goal="Research and summarize impactful technology updates.",
    backstory="A skilled analyst who specializes in researching and summarizing technology topics.",
)

tasks = {
    "latest_ai_news": Task(
        description="Find the latest news about artificial intelligence.",
        expected_output="A 3-paragraph summary of the top 3 stories.",
        agent=agent,
    ),
    "ai_startup_launches": Task(
        description="Summarize the most impactful AI startup launches in the last 6 months.",
        expected_output="A list summarizing 2 AI startups with links.",
        agent=agent,
    ),
    "ai_policy_updates": Task(
        description="Summarize the newest AI government policy and regulation updates.",
        expected_output="A bullet-point list summarizing the latest policy changes.",
        agent=agent,
    ),
}

# ------------------------------------------------------------
# 2. Activity — runs ONE task by name
# ------------------------------------------------------------
@wfr.activity(name="run_task")
def run_task_activity(ctx: WorkflowActivityContext, task_name: str):
    print(f"Running CrewAI task: {task_name}", flush=True)

    task = tasks[task_name]

    # Create a Crew for just this one task
    temp_crew = Crew(agents=[agent], tasks=[task])

    # kickoff() works across CrewAI versions
    result = temp_crew.kickoff()

    return str(result)

# ------------------------------------------------------------
# 3. Workflow — orchestrates tasks durably
# ------------------------------------------------------------
@wfr.workflow(name="crewai_multi_task_workflow")
def crewai_workflow(ctx: DaprWorkflowContext):
    print("Starting multi-task CrewAI workflow", flush=True)

    latest_news = yield ctx.call_activity(run_task_activity, input="latest_ai_news")
    startup_summary = yield ctx.call_activity(run_task_activity, input="ai_startup_launches")
    policy_updates = yield ctx.call_activity(run_task_activity, input="ai_policy_updates")

    return {
        "latest_news": latest_news,
        "startup_summary": startup_summary,
        "policy_updates": policy_updates,
    }

# ------------------------------------------------------------
# 4. Runtime + Client (entry point)
# ------------------------------------------------------------
if __name__ == "__main__":
    wfr.start()

    client = DaprWorkflowClient()
    instance_id = "crewai-multi-01"

    client.schedule_new_workflow(
        workflow=crewai_workflow,
        input=None,
        instance_id=instance_id
    )

    state = client.wait_for_workflow_completion(instance_id, timeout_in_seconds=60)
    print(state.serialized_output)
```

This CrewAI agent starts a workflow that does news gathering and summary for the subjects of AI and startups.

### Create the Workflow Database Component

Dapr Workflows persist durable state using any [Dapr state store]({{% ref supported-state-stores %}}) that supports workflows.
Create a directory named `components`, then create the file workflowstore.yaml:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: workflowstore
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

This component stores:

* Code execution checkpoints
* Execution history
* Deterministic resumption state
* Final output data

### Set a CrewAI LLM Provider

CrewAI needs an LLM configuration or token to run. See instructions [here](https://docs.crewai.com/en/concepts/llms#setting-up-your-llm).

For example, to set up OpenAI:

```
export OPENAI_API_KEY=sk-...
```

### Run the Workflow

Launch the CrewAI workflow using the Dapr CLI:

```bash
dapr run \
  --app-id crewaiwf \
  --dapr-grpc-port 50001 \
  --resources-path ./components \
  -- python3 ./crewai_workflow.py
```

As the workflow runs, each CrewAI task is executed as a durable activity.
If the process crashes, the workflow resumes exactly where it left off. You can try this by killing the process after the first activity and then rerunning that command line above with the same app ID.

Open Zipkin to view workflow traces:

```
http://localhost:9411
```
