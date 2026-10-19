---
type: docs
title: "Vector Stores"
linkTitle: "Vector Stores"
weight: 60
description: "Integrations for vector stores"
---

Dapr Agents includes built-in vector store implementations for use with `ConversationVectorMemory` and RAG pipelines. Each store is available from `dapr_agents.storage.vectorstores`.

Vector stores share the same interface and are interchangeable as the `vector_store` argument to `ConversationVectorMemory`:

```python
from dapr_agents.storage.vectorstores import ChromaVectorStore  # Replace with your vector store
from dapr_agents.document.embedder.openai import OpenAIEmbedder  # Replace with your embedding model
from dapr_agents.memory import ConversationVectorMemory

store = ChromaVectorStore(
    collection_name="my_collection",
    embedding_function=OpenAIEmbedder(),
)
memory = ConversationVectorMemory(
    vector_store=store,
    distance_metric="cosine",
)
```

To keep the core installation minimal, vector store dependencies must be installed separately.
