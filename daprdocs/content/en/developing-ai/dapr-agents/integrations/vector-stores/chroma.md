---
type: docs
title: "Chroma"
linkTitle: "Chroma"
weight: 10
description: "Perform similarity searches with in-memory or persistent Chroma storage"
---

Uses [ChromaDB](https://www.trychroma.com/) for in-memory or persistent vector search.

## Installation

{{< tabpane text=true >}}

{{% tab header="pip" %}}

```bash
pip install chromadb
```

{{% /tab %}}

{{% tab header="uv" %}}

```bash
uv add chromadb
```

{{% /tab %}}

{{< /tabpane >}}

## Usage

```python
from dapr_agents.storage.vectorstores import ChromaVectorStore
from dapr_agents.document.embedder.openai import OpenAIEmbedder  # Replace with your embedding model

store = ChromaVectorStore(
    collection_name="my_collection",
    embedding_function=OpenAIEmbedder(),
)
```
