---
type: docs
title: "Dapr Python SDK integration with LangGraph"
linkTitle: "LangGraph"
weight: 500000
description: How to let Dapr handle LangGraph Checkpointer (Memory)
---

The Dapr Python SDK provides integration with LangGraph Checkpointer using the `dapr-ext-langgraph` extension.

## Installation

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

To let Dapr handle the checkpointer (memory in LangGraph) you only need to utilize the `DaprCheckpointer` as the checkpointer object when compiling the graph. Given the below Component for redis State Manager:

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

For a full example refer to the [langgraph example](https://github.com/dapr/python-sdk/tree/main/examples/langgraph-checkpointer).
