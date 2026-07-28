---
type: docs
title: "Redis"
linkTitle: "Redis"
weight: 50
description: "Perform similarity searches with in-memory or persistent Redis storage"
---

Uses [Redis Stack](https://redis.io/docs/latest/develop/ai/search-and-query/vectors/) via the `redisvl` library for vector similarity search.

## Installation

{{% alert title="Note" color="primary" %}}
The Redis instance started by `dapr init` is a **vanilla Redis server** and does **not** include the Search/vector modules required by Redis Stack. To use `RedisVectorStore`, you must run [Redis Stack](https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/) (or a Redis deployment with the `RediSearch` module enabled) separately.
{{% /alert %}}

{{< tabpane text=true >}}

{{% tab header="pip" %}}

```bash
pip install redisvl
```

{{% /tab %}}

{{% tab header="uv" %}}

```bash
uv add redisvl
```

{{% /tab %}}

{{< /tabpane >}}

## Usage

```python
from dapr_agents.storage.vectorstores import RedisVectorStore
from dapr_agents.document.embedder.openai import OpenAIEmbedder

store = RedisVectorStore(
    url="redis://localhost:6379",
    index_name="my_agent",
    embedding_function=OpenAIEmbedder(),
    embedding_dimensions=1536,
    distance_metric="cosine",  # "cosine", "l2", or "ip"
    storage_type="hash",       # "hash" or "json"
)
```
