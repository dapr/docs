---
type: docs
title: "Text"
linkTitle: "Text"
weight: 10
description: "Split text documents into chunks"
---

The Text Splitter module is a foundational integration in Dapr Agents designed to preprocess documents for use in [Retrieval-Augmented Generation (RAG)](https://en.wikipedia.org/wiki/Retrieval-augmented_generation) workflows and other in-context learning applications. Its primary purpose is to break large documents into smaller, meaningful chunks that can be embedded, indexed, and efficiently retrieved based on user queries.

By focusing on manageable chunk sizes and preserving contextual integrity through overlaps, the Text Splitter ensures documents are processed in a way that supports downstream tasks like question answering, summarization, and document retrieval.

### Why Use a Text Splitter?

When building RAG pipelines, splitting text into smaller chunks serves these key purposes:

* **Enabling Effective Indexing**: Chunks are embedded and stored in a vector database, making them retrievable based on similarity to user queries.
* **Maintaining Semantic Coherence**: Overlapping chunks help retain context across splits, ensuring the system can connect related pieces of information.
* **Handling Model Limitations**: Many models have input size limits. Splitting ensures text fits within these constraints while remaining meaningful.

This step is crucial for preparing knowledge to be embedded into a searchable format, forming the backbone of retrieval-based workflows.

### Strategies for Text Splitting

The Text Splitter supports multiple strategies to handle different types of documents effectively. These strategies balance the size of each chunk with the need to maintain context.

#### 1. Character-Based Length

* **How It Works**: Counts the number of characters in each chunk.
* **Use Case**: Simple and effective for text splitting without dependency on external tokenization tools.

Example:

```python
from dapr_agents.document.splitter.text import TextSplitter

# Character-based splitter (default)
splitter = TextSplitter(chunk_size=1024, chunk_overlap=200)
```

#### 2. Token-Based Length

* **How It Works**: Counts tokens, which are the semantic units used by language models (e.g., words or subwords).
* **Use Case**: Ensures compatibility with models like GPT, where token limits are critical.

**Example**:

```python
import tiktoken
from dapr_agents.document.splitter.text import TextSplitter

enc = tiktoken.get_encoding("cl100k_base")

def length_function(text: str) -> int:
    return len(enc.encode(text))

splitter = TextSplitter(
    chunk_size=1024,
    chunk_overlap=200,
    chunk_size_function=length_function
)
```

The flexibility to define the chunk size function makes the Text Splitter adaptable to various scenarios.

### Chunk Overlap

To preserve context, the Text Splitter includes a chunk overlap feature. This ensures that parts of one chunk carry over into the next, helping maintain continuity when chunks are processed sequentially.

Example:

* With `chunk_size=1024` and `chunk_overlap=200`, the last `200` tokens or characters of one chunk appear at the start of the next.
* This design helps in tasks like text generation, where maintaining context across chunks is essential.

### How to Use the Text Splitter

Here's a practical example of using the Text Splitter to process a PDF document:

#### Step 1: Load a PDF

```python
import requests
from pathlib import Path

# Download PDF
pdf_url = "https://arxiv.org/pdf/2412.05265.pdf"
local_pdf_path = Path("arxiv_paper.pdf")

if not local_pdf_path.exists():
    response = requests.get(pdf_url)
    response.raise_for_status()
    with open(local_pdf_path, "wb") as pdf_file:
        pdf_file.write(response.content)
```

#### Step 2: Read the Document

For this example, we use Dapr Agents' `PyPDFReader`.

{{% alert title="Note" color="primary" %}}
The PyPDF Reader relies on the [pypdf python library](https://pypi.org/project/pypdf/), which is not included in the Dapr Agents core module. This design choice helps maintain modularity and avoids adding unnecessary dependencies for users who may not require this functionality. To use the PyPDF Reader, ensure that you install the library separately.
{{% /alert %}}

{{< tabpane text=true >}}

{{% tab header="pip" %}}

```bash
pip install pypdf
```

{{% /tab %}}

{{% tab header="uv" %}}

```bash
uv add pypdf
```

{{% /tab %}}

{{< /tabpane >}}

Then, initialize the reader to load the PDF file.

```python
from dapr_agents.document.reader.pdf.pypdf import PyPDFReader

reader = PyPDFReader()
documents = reader.load(local_pdf_path)
```

#### Step 3: Split the Document

```python
import tiktoken
from dapr_agents.document.splitter.text import TextSplitter

enc = tiktoken.get_encoding("cl100k_base")

def length_function(text: str) -> int:
    return len(enc.encode(text))

splitter = TextSplitter(
    chunk_size=1024,
    chunk_overlap=200,
    chunk_size_function=length_function
)
chunked_documents = splitter.split_documents(documents)
```

#### Step 4: Analyze Results

```python
print(f"Original document pages: {len(documents)}")
print(f"Total chunks: {len(chunked_documents)}")
print(f"First chunk: {chunked_documents[0]}")
```

### Key Features

* **Hierarchical Splitting**: Splits text by separators (e.g., paragraphs), then refines chunks further if needed.
* **Customizable Chunk Size**: Supports character-based and token-based length functions.
* **Overlap for Context**: Retains portions of one chunk in the next to maintain continuity.
* **Metadata Preservation**: Each chunk retains metadata like page numbers and start/end indices for easier mapping.

By understanding and leveraging the `Text Splitter`, you can preprocess large documents effectively, ensuring they are ready for embedding, indexing, and retrieval in advanced workflows like RAG pipelines.
