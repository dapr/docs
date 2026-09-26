---
type: docs
title: "Postgres"
linkTitle: "Postgres"
weight: 30
description: "Perform similarity searches with persistent Postgres storage"
---

Uses [Postgres with pgvector](https://github.com/pgvector/pgvector) for production-grade vector similarity search.

## Installation

{{< tabpane text=true >}}

{{% tab header="pip" %}}

```bash
pip install "psycopg[binary,pool]" pgvector
```

{{% /tab %}}

{{% tab header="uv" %}}

```bash
uv add 'psycopg[binary,pool]' pgvector
```

{{% /tab %}}

{{< /tabpane >}}

## Usage

```python
from dapr_agents.storage.vectorstores import PostgresVectorStore
from dapr_agents.document.embedder.openai import OpenAIEmbedder  # Replace with your embedding model

store = PostgresVectorStore(
    connection_string="postgresql://user:pass@localhost:5432/mydb",
    embedding_function=OpenAIEmbedder(),
    embedding_dimensions=1536,
)
```
