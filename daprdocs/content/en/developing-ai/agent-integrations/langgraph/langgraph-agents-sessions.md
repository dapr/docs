---
type: docs
title: "Agent Sessions"
linkTitle: "Agent Sessions"
weight: 30
description: "How to use Dapr reliably and securely manage LangGraph Agent Checkpointers"
---

## Overview

The Dapr Python SDK provides integration with LangGraph Checkpointer using the `dapr-ext-langgraph` extension.

## Getting Started

Initialize Dapr locally to set up a self-hosted environment for development. This process fetches and installs the Dapr sidecar binaries, runs essential services as Docker containers, and prepares a default components folder for your application. For detailed steps, see the official [guide on initializing Dapr locally]({{% ref install-dapr-cli.md %}}).

To initialize the Dapr control plane containers and create a default configuration file, run:

```bash
dapr init
```

Verify you have container instances with `daprio/dapr`, `openzipkin/zipkin`, and `redis` images running:

```bash
docker ps
```

### Install Python

{{% alert title="Note" color="info" %}}
Make sure you have Python already installed. `Python >=3.10`. For installation instructions, visit the official [Python installation guide](https://www.python.org/downloads/).
{{% /alert %}}

### Download Dependencies

Download and install the Dapr LangGraph extension with:

{{< tabpane text=true >}}

{{% tab header="Stable" %}}

```bash
pip install dapr-ext-langgraph langchain_openai langchain_core langgraph langgraph-prebuilt
```

{{% /tab %}}

{{% tab header="Development" %}}
{{% alert title="Note" color="warning" %}}
The development package will contain features and behavior that will be compatible with the pre-release version of the Dapr runtime. Make sure to uninstall any stable versions of the Python SDK extension before installing the `dapr-dev` package.
{{% /alert %}}

```bash
pip install dapr-ext-langgraph-dev langchain_openai langchain_core langgraph langgraph-prebuilt
```

{{% /tab %}}

{{< /tabpane >}}

### Create a LangGraph Agent

To let Dapr handle the agent memory, utilize the `DaprCheckpointer` as the checkpointer object when compiling the graph. Pass the checkpointer just like any other checkpointer provider:

```python
from dapr.ext.langgraph import DaprCheckpointer
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition


def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b

tools = [add]
llm = ChatOpenAI(model="gpt-4o")
llm_with_tools = llm.bind_tools(tools)

sys_msg = SystemMessage(
    content='You are a helpful assistant tasked with performing arithmetic on a set of inputs.'
)

def assistant(state: MessagesState):
    return {'messages': [llm_with_tools.invoke([sys_msg] + state['messages'])]}

builder = StateGraph(MessagesState)
builder.add_node('assistant', assistant)
builder.add_node('tools', ToolNode(tools))
builder.add_edge(START, 'assistant')
builder.add_conditional_edges(
    'assistant',
    tools_condition,
)
builder.add_edge('tools', 'assistant')

memory = DaprCheckpointer(store_name='statestore', key_prefix='dapr')
react_graph_memory = builder.compile(checkpointer=memory)

config = {'configurable': {'thread_id': '1'}}

messages = [HumanMessage(content='Add 3 and 4.')]
messages = react_graph_memory.invoke({'messages': messages}, config)
for m in messages['messages']:
    m.pretty_print()
```

### Set an OpenAI API key

```bash
export OPENAI_API_KEY=sk-...
```

### Create a Python venv

```bash
python -m venv .venv                                                                                                                                                                      
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

## Create the database component

The component file is how Dapr connects to your databae. The full list of supported databases can be found [here]({{% ref supported-state-stores %}}). Create a `components` directory and this file in it:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

## Next Steps

Now that you have a LangGraph agent using Dapr to manage the agent sessions, explore more you can do with the [State API]({{% ref "state-management-overview" %}}) and how to enable [resiliency policies]({{% ref resiliency-overview %}}) for enhanced reliability.
