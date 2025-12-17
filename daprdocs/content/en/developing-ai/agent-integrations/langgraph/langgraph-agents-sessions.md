---
type: docs
title: "Dapr Python SDK integration with LangGraph"
linkTitle: "LangGraph"
weight: 30
description: "How to use Dapr reliably and securely manage LangGraph Agent Checkpointers"
---

## Overview

The Dapr Python SDK provides integration with LangGraph Checkpointer using the `dapr-ext-langgraph` extension.

## Getting Started

### Install Python

{{% alert title="Note" color="info" %}}
Make sure you have Python already installed. `Python >=3.10`. For installation instructions, visit the official [Python installation guide](https://www.python.org/downloads/).
{{% /alert %}}

### Download Dependencies

Download and install the Dapr LangGraph extension with:

{{< tabpane text=true >}}

{{% tab header="Stable" %}}

```bash
pip install dapr-ext-langgraph
```

{{% /tab %}}

{{% tab header="Development" %}}
{{% alert title="Note" color="warning" %}}
The development package will contain features and behavior that will be compatible with the pre-release version of the Dapr runtime. Make sure to uninstall any stable versions of the Python SDK extension before installing the `dapr-dev` package.
{{% /alert %}}

```bash
pip install dapr-ext-langgraph-dev
```

{{% /tab %}}

{{< /tabpane >}}

## Example

To let Dapr handle the checkpointer (memory in LangGraph) utilize the `DaprCheckpointer` as the checkpointer object when compiling the graph. Given the following Redis state store component:

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
```

Pass the checkpointer just like any other checkpointer provider:

```python
from langgraph.graph import StateGraph, MessageState
from dapr.ext.langgraph import DaprCheckpointer

# Build the graph with nodes and edges
builder = StateGraph(MessagesState)

memory = DaprCheckpointer(store_name='statestore', key_prefix='dapr')
graph = builder.compile(checkpointer=memory)
```

For a full example refer to this [langgraph example](https://github.com/dapr/python-sdk/tree/main/examples/langgraph-checkpointer) in the Dapr Python SDK repository.
