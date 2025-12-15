---
type: docs
title: "Integrations"
linkTitle: "Integrations"
weight: 60
description: "Various integrations and tools available in Dapr Agents"
---

# Out-of-the-box Tools

## Text Splitter

The Text Splitter module is a foundational integration in `Dapr Agents` designed to preprocess documents for use in [Retrieval-Augmented Generation (RAG)](https://en.wikipedia.org/wiki/Retrieval-augmented_generation) workflows and other `in-context learning` applications. Its primary purpose is to break large documents into smaller, meaningful chunks that can be embedded, indexed, and efficiently retrieved based on user queries.

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

```python
pip install pypdf
```

Then, initialize the reader to load the PDF file.

```python
from dapr_agents.document.reader.pdf.pypdf import PyPDFReader

reader = PyPDFReader()
documents = reader.load(local_pdf_path)
```

#### Step 3: Split the Document

```python
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

## Arxiv Fetcher

The Arxiv Fetcher module in `Dapr Agents` provides a powerful interface to interact with the [arXiv API](https://info.arxiv.org/help/api/index.html). It is designed to help users programmatically search for, retrieve, and download scientific papers from arXiv. With advanced querying capabilities, metadata extraction, and support for downloading PDF files, the Arxiv Fetcher is ideal for researchers, developers, and teams working with academic literature.

### Why Use the Arxiv Fetcher?

The Arxiv Fetcher simplifies the process of accessing research papers, offering features like:

* **Automated Literature Search**: Query arXiv for specific topics, keywords, or authors.
* **Metadata Retrieval**: Extract structured metadata, such as titles, abstracts, authors, categories, and submission dates.
* **Precise Filtering**: Limit search results by date ranges (e.g., retrieve the latest research in a field).
* **PDF Downloading**: Fetch full-text PDFs of papers for offline use.

### How to Use the Arxiv Fetcher

#### Step 1: Install Required Modules

{{% alert title="Note" color="primary" %}}
The Arxiv Fetcher relies on a [lightweight Python wrapper](https://github.com/lukasschwab/arxiv.py) for the arXiv API, which is not included in the Dapr Agents core module. This design choice helps maintain modularity and avoids adding unnecessary dependencies for users who may not require this functionality. To use the Arxiv Fetcher, ensure you install the [library](https://pypi.org/project/arxiv/) separately.
{{% /alert %}}

```python
pip install arxiv
```

#### Step 2: Initialize the Fetcher

Set up the `ArxivFetcher` to begin interacting with the arXiv API.

```python
from dapr_agents.document import ArxivFetcher

# Initialize the fetcher
fetcher = ArxivFetcher()
```

#### Step 3: Perform Searches

**Basic Search by Query String**

Search for papers using simple keywords. The results are returned as Document objects, each containing:

* `text`: The abstract of the paper.
* `metadata`: Structured metadata such as title, authors, categories, and submission dates.

```python
# Search for papers related to "machine learning"
results = fetcher.search(query="machine learning", max_results=5)

# Display metadata and summaries
for doc in results:
    print(f"Title: {doc.metadata['title']}")
    print(f"Authors: {', '.join(doc.metadata['authors'])}")
    print(f"Summary: {doc.text}\n")
```

**Advanced Querying**

Refine searches using logical operators like AND, OR, and NOT or perform field-specific searches, such as by author.

Examples:

Search for papers on "agents" and "cybersecurity":

```python
results = fetcher.search(query="all:(agents AND cybersecurity)", max_results=10)
```

Exclude specific terms (e.g., "quantum" but not "computing"):

```python
results = fetcher.search(query="all:(quantum NOT computing)", max_results=10)
```

Search for papers by a specific author:

```python
results = fetcher.search(query='au:"John Doe"', max_results=10)
```

**Filter Papers by Date**

Limit search results to a specific time range, such as papers submitted in the last 24 hours.

```python
from datetime import datetime, timedelta

# Calculate the date range
last_24_hours = (datetime.now() - timedelta(days=1)).strftime("%Y%m%d")
today = datetime.now().strftime("%Y%m%d")

# Search for recent papers
recent_results = fetcher.search(
    query="all:(agents AND cybersecurity)",
    from_date=last_24_hours,
    to_date=today,
    max_results=5
)

# Display metadata
for doc in recent_results:
    print(f"Title: {doc.metadata['title']}")
    print(f"Authors: {', '.join(doc.metadata['authors'])}")
    print(f"Published: {doc.metadata['published']}")
    print(f"Summary: {doc.text}\n")
```

#### Step 4: Download PDFs

Fetch the full-text PDFs of papers for offline use. Metadata is preserved alongside the downloaded files.

```python
import os
from pathlib import Path

# Create a directory for downloads
os.makedirs("arxiv_papers", exist_ok=True)

# Download PDFs
download_results = fetcher.search(
    query="all:(agents AND cybersecurity)",
    max_results=5,
    download=True,
    dirpath=Path("arxiv_papers")
)

for paper in download_results:
    print(f"Downloaded Paper: {paper['title']}")
    print(f"File Path: {paper['file_path']}\n")
```

#### Step 5: Extract and Process PDF Content

Use `PyPDFReader` from `Dapr Agents` to extract content from downloaded PDFs. Each page is treated as a separate Document object with metadata.

```python
from pathlib import Path
from dapr_agents.document import PyPDFReader

reader = PyPDFReader()
docs_read = []

for paper in download_results:
    local_pdf_path = Path(paper["file_path"])
    documents = reader.load(local_pdf_path, additional_metadata=paper)
    docs_read.extend(documents)

# Verify results
print(f"Extracted {len(docs_read)} documents.")
print(f"First document text: {docs_read[0].text}")
print(f"Metadata: {docs_read[0].metadata}")
```

### Practical Applications

The Arxiv Fetcher enables various use cases for researchers and developers:

* **Literature Reviews**: Quickly retrieve and organize relevant papers on a given topic or by a specific author.
* **Trend Analysis**: Identify the latest research in a domain by filtering for recent submissions.
* **Offline Research Workflows**: Download and process PDFs for local analysis and archiving.

### Next Steps

While the Arxiv Fetcher provides robust functionality for retrieving and processing research papers, its output can be integrated into advanced workflows:

* **Building a Searchable Knowledge Base**: Combine fetched papers with integrations like text splitting and vector embeddings for advanced search capabilities.
* **Retrieval-Augmented Generation (RAG)**: Use processed papers as inputs for RAG pipelines to power question-answering systems.
* **Automated Literature Surveys**: Generate summaries or insights based on the fetched and processed research. 