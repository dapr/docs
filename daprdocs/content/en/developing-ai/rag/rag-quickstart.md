---
type: docs
title: "Quickstart: Durable RAG ingestion"
linkTitle: "Quickstart"
weight: 30
description: "Ingest documents into a versioned vector index and query them, running entirely on your machine"
---

This quickstart runs a complete `DurableRAGPipeline` ingest-and-query cycle locally: documents are
discovered from an object store, parsed, chunked, embedded with OpenAI, and written into a local
[pgvector](https://github.com/pgvector/pgvector) index. You'll then query that index and get back
the document that answers your question.

Pick whichever source matches how you'll actually deploy — the rest of the pipeline (embedding,
pgvector, the worker/CLI commands, everything after "Set up the environment") is identical either
way:

- **AWS** — `S3Source` against [LocalStack](https://www.localstack.cloud/), a local S3 emulator. No
  AWS account needed, and the same code and configuration shape work against real Amazon S3.
- **Azure** — `AzureBlobSource` against [Azurite](https://github.com/Azure/Azurite), Azure's local
  Storage emulator. No Azure account needed, and the same code and configuration shape work against
  a real Azure Storage account.
- **Generic (any S3-compatible store)** — `S3Source` against
  [S3Mock](https://github.com/adobe/S3Mock), a minimal S3-compatible test server. Use this tab to
  confirm `S3Source` isn't AWS-specific: it talks to any S3-compatible endpoint over the same API,
  so pointing `RAG_S3_ENDPOINT_URL` at your own self-hosted object store (MinIO, Ceph RGW, and
  similar) instead works the same way — just with that store's own real credentials in place of the
  placeholder ones below.

The same pipeline also works unmodified against real Pinecone/Azure AI Search and real Azure
OpenAI — see [the RAG overview]({{% ref rag %}}) for every supported combination. Only embeddings
need a real external account for this quickstart; an
[OpenAI API key](https://platform.openai.com/api-keys) is the one credential you can't run locally.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}}) installed and an initialized
  [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- [Python 3.10+](https://www.python.org/downloads/) installed
- [Docker](https://docs.docker.com/get-docker/), for the local storage emulator and pgvector
  containers
- An [OpenAI API key](https://platform.openai.com/api-keys)

## Set up the environment

Clone the Python SDK repo and go to the RAG example:

```bash
git clone https://github.com/dapr/python-sdk.git
cd python-sdk/examples/rag
```

Install the example's dependencies:

```bash
pip3 install -r requirements.txt
```

Start a local pgvector-enabled Postgres — used by every source below. Port `5544` is used since
`5432` is often already taken by a locally-installed Postgres:

```bash
docker run -d --rm --name rag-pgvector -p 5544:5432 \
    -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ragdb pgvector/pgvector:pg16
```

Copy the example's configuration file — every tab below edits the same one:

```bash
cp .env.example .env
```

Now follow the tab for your source:

{{< tabpane text=true >}}

{{% tab header="AWS" %}}
Start LocalStack:

```bash
docker run -d --rm --name rag-localstack -p 4566:4566 -e SERVICES=s3 localstack/localstack:3
```

Edit `.env` and set:

```bash
OPENAI_API_KEY=<your real key>
RAG_S3_ENDPOINT_URL=http://localhost:4566
RAG_PGVECTOR_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5544/ragdb
```

Load it, plus two placeholder AWS variables LocalStack requires (any non-empty value works — a
real AWS deployment should never set these):

```bash
export $(grep -v '^#' .env | xargs)
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
```

Create the bucket and upload a sample document:

```bash
python3 -c "
import boto3
s3 = boto3.client('s3', endpoint_url='http://localhost:4566', region_name='us-east-1')
s3.create_bucket(Bucket='company-docs')
s3.put_object(Bucket='company-docs', Key='policies/remote-work.txt',
              Body=b'Employees may work remotely up to three days per week.')
"
```
{{% /tab %}}

{{% tab header="Azure" %}}
Start Azurite:

```bash
docker run -d --rm --name rag-azurite -p 10000:10000 -p 10001:10001 -p 10002:10002 \
    mcr.microsoft.com/azure-storage/azurite
```

Edit `.env` and set:

```bash
OPENAI_API_KEY=<your real key>
RAG_SOURCE=azure-blob
RAG_AZURE_CONNECTION_STRING=UseDevelopmentStorage=true
RAG_PGVECTOR_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5544/ragdb
```

Load it:

```bash
export $(grep -v '^#' .env | xargs)
```

Create the container and upload a sample document:

```bash
python3 -c "
from azure.storage.blob import BlobServiceClient
client = BlobServiceClient.from_connection_string('UseDevelopmentStorage=true')
client.create_container('company-docs')
client.get_container_client('company-docs').upload_blob(
    'policies/remote-work.txt', b'Employees may work remotely up to three days per week.'
)
"
```
{{% /tab %}}

{{% tab header="Generic (S3-compatible)" %}}
Start S3Mock:

```bash
docker run -d --rm --name rag-s3mock -p 9090:9090 adobe/s3mock
```

Edit `.env` and set:

```bash
OPENAI_API_KEY=<your real key>
RAG_S3_ENDPOINT_URL=http://localhost:9090
RAG_PGVECTOR_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5544/ragdb
```

Load it, plus two placeholder AWS variables S3Mock requires (any non-empty value works — your own
self-hosted store would need its own real credentials here instead):

```bash
export $(grep -v '^#' .env | xargs)
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
```

Create the bucket and upload a sample document:

```bash
python3 -c "
import boto3
s3 = boto3.client('s3', endpoint_url='http://localhost:9090', region_name='us-east-1')
s3.create_bucket(Bucket='company-docs')
s3.put_object(Bucket='company-docs', Key='policies/remote-work.txt',
              Body=b'Employees may work remotely up to three days per week.')
"
```
{{% /tab %}}

{{< /tabpane >}}

{{% alert title="Note" color="info" %}}
Every `export` above only applies to the current shell. Every new terminal you run a command from
in this quickstart needs it run again.
{{% /alert %}}

## Run the application locally

Start the worker and leave it running in this terminal — watch for `Worker ready.`:

```bash
dapr run --app-id rag-worker --resources-path components/ -- python3 worker.py
```

In a **second terminal**, re-export `.env` plus whichever extra credential variables your chosen
tab above used (`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` for AWS or Generic — it's a new shell,
so none of that is still set here), then start ingestion. Use the **same** `--app-id` as the worker
(`rag-worker`), not a new one — Dapr Workflow is backed by Dapr Actors internally, and the CLI needs
to reach the same actor runtime the worker registered:

```bash
export $(grep -v '^#' .env | xargs)

dapr run --app-id rag-worker --resources-path components/ -- python3 cli.py start --version v1
dapr run --app-id rag-worker --resources-path components/ -- python3 cli.py status --version v1
```

Re-run the `status` command (a few seconds apart) until it shows `"stage": "completed"` and
`"activation_succeeded": true`. The full response is a JSON dump of every tracked counter
(documents pending/completed/failed, chunks embedded vs. reused, retry counts, timestamps, ...); the
fields that matter for this quickstart look like:

```json
{
  "pipeline_id": "company-knowledge",
  "requested_version": "v1",
  "stage": "completed",
  "total_documents": 1,
  "completed_documents": 1,
  "validation_succeeded": true,
  "activation_succeeded": true,
  "active_version": "v1"
}
```

Now query it:

```bash
dapr run --app-id rag-worker --resources-path components/ -- python3 cli.py query "What is the remote work policy?"
```

You should see `remote-work.txt` as the top-scoring match.

## What happened?

1. **`worker.py`** started a Dapr Workflow worker hosting the `rag_ingest` orchestrator and its
   activities (`discover_and_manifest`, `process_document`, `validate_version`, `activate_version`,
   ...) — this is the process that must keep running for ingestion to make progress.
2. **`cli.py start --version v1`** scheduled a new workflow instance for version `v1`. The
   orchestrator listed the bucket or container, found one document, downloaded and chunked it,
   embedded the chunk with OpenAI, and wrote it into the `v1` namespace of your pgvector table — all
   of it inside workflow activities, so a crash at any point would have resumed from the last
   completed step instead of starting over.
3. Once every document finished, the orchestrator **validated** that the vector store's chunk count
   matched what was expected, then **activated** `v1` — flipping a single, ETag-guarded pointer so
   that queries now read from it. Until that validation passed, `v1` was never visible to a query.
4. **`cli.py query`** used `ActiveVersionResolver` to resolve the active version (`v1`), embed your
   question, and search only that version's vectors.

Stop the worker with `Ctrl+C`, and stop the containers when you're done — `rag-pgvector` plus
whichever source emulator you started (`rag-localstack`, `rag-azurite`, or `rag-s3mock`):

```bash
docker stop rag-pgvector rag-localstack rag-azurite rag-s3mock
```

{{% alert title="Note" color="info" %}}
`docker stop` on a container name that isn't running just prints an error for that name and moves
on to the rest — harmless if you only started one of the three.
{{% /alert %}}

{{% alert title="Re-running this later?" color="warning" %}}
Use a new `--version` (e.g. `v2`), not `v1` again. `cli.py start --version v1` against a version
that's already been used reattaches to that same, deterministic workflow instance instead of
starting a fresh one — this matches real usage: a version is meant to be unique per batch of
content, not reused across attempts.
{{% /alert %}}

## Next steps

- See the crash/recovery behavior for yourself: the
  [Failure and resume demo](https://github.com/dapr/python-sdk/tree/main/examples/rag#failure-and-resume-demo)
  kills the worker process mid-run and shows it resume without re-embedding completed work.
- Learn about [event-driven ingestion]({{% ref "rag#event-driven-ingestion" %}}) —
  triggering a reconciliation run automatically when documents change.
- Go further on Azure: the
  [Azure-native flagship path](https://github.com/dapr/python-sdk/tree/main/examples/rag#the-azure-native-flagship-path)
  replaces OpenAI and pgvector above with Azure OpenAI and Azure AI Search too, ending in a grounded
  answer with citations.
