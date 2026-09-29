---
type: docs
title: "arXiv"
linkTitle: "arXiv"
weight: 10
description: "Load research papers with the arXiv API"
---

The Arxiv Fetcher module in Dapr Agents provides a powerful interface to interact with the [arXiv API](https://info.arxiv.org/help/api/index.html). It is designed to help users programmatically search for, retrieve, and download scientific papers from arXiv. With advanced querying capabilities, metadata extraction, and support for downloading PDF files, the Arxiv Fetcher is ideal for researchers, developers, and teams working with academic literature.

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

{{< tabpane text=true >}}

{{% tab header="pip" %}}

```bash
pip install arxiv
```

{{% /tab %}}

{{% tab header="uv" %}}

```bash
uv add arxiv
```

{{% /tab %}}

{{< /tabpane >}}

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
