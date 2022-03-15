---
type: docs
title: "State store component specs"
linkTitle: "State stores"
description: "The supported state stores that interface with Dapr"
weight: 1000
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/"
no_list: true
---

Table captions:

> `Status`: [Component certification]({{<ref "certification-lifecycle.md">}}) status
  - [Alpha]({{<ref "certification-lifecycle.md#alpha">}})
  - [Beta]({{<ref "certification-lifecycle.md#beta">}})
  - [Stable]({{<ref "certification-lifecycle.md#stable">}})
> `Since`: defines from which Dapr Runtime version, the component is in the current status

> `Component version`: defines the version of the component


The following stores are supported, at various levels, by the Dapr state management building block:

> State stores can be used for actors if it supports both transactional operations and etag.

### Generic

| Name                                               |CRUD|Transactional|ETag| [TTL]({{< ref state-store-ttl.md >}}) | [Actors]({{< ref howto-actors.md >}}) | [Query]({{< ref howto-state-query-api.md >}}) | Status | Component version | Since |
|----------------------------------------------------|----|-------------|----|----|----|----|-------|----|-----|
| [Aerospike]({{< ref setup-aerospike.md >}})        | ✅ | ❌          | ✅  | ❌ | ❌ | ❌ | Alpha  | v1 | 1.0 |
| [Apache Cassandra]({{< ref setup-cassandra.md >}}) | ✅ | ❌          | ❌  | ✅ | ❌ | ❌ | Alpha  | v1 | 1.0 |
| [CockroachDB]({{< ref setup-cockroachdb.md >}})    | ✅ | ✅          | ✅  | ❌ | ✅ | ✅ | Alpha  | v1 | 1.7 |
| [Couchbase]({{< ref setup-couchbase.md >}})        | ✅ | ❌          | ✅  | ❌ | ❌ | ❌ | Alpha  | v1 | 1.0 |
| [Hashicorp Consul]({{< ref setup-consul.md >}})    | ✅ | ❌          | ❌  | ❌ | ❌ | ❌ | Alpha  | v1 | 1.0 |
| [Hazelcast]({{< ref setup-hazelcast.md >}})        | ✅ | ❌          | ❌  | ❌ | ❌ | ❌ | Alpha  | v1 | 1.0 |
| [JetStream KV]({{< ref setup-jetstream-kv.md >}})  | ✅ | ❌          | ❌  | ❌ | ❌ | ❌ | Alpha  | v1 | 1.7 |
| [Memcached]({{< ref setup-memcached.md >}})        | ✅ | ❌          | ❌  | ✅ | ❌ | ❌ | Alpha  | v1 | 1.0 |
| [MongoDB]({{< ref setup-mongodb.md >}})            | ✅ | ✅          | ✅  | ❌ | ✅ | ✅ | Stable | v1 | 1.0 |
| [MySQL]({{< ref setup-mysql.md >}})                | ✅ | ✅          | ✅  | ❌ | ✅ | ❌ | Alpha  | v1 | 1.0 |
| [Oracle Database]({{< ref setup-oracledatabase.md >}})      | ✅ | ✅          | ✅  | ✅ | ✅ | ❌ | Alpha  | v1 | 1.7 |
| [PostgreSQL]({{< ref setup-postgresql.md >}})      | ✅ | ✅          | ✅  | ❌ | ✅ | ✅ | Alpha  | v1 | 1.0 |
| [Redis]({{< ref setup-redis.md >}})                | ✅ | ✅          | ✅  | ✅ | ✅ | ✅ | Stable | v1 | 1.0 |
| [RethinkDB]({{< ref setup-rethinkdb.md >}})        | ✅ | ✅          | ✅  | ❌ | ✅ | ❌ | Alpha  | v1 | 1.0 |
| [Zookeeper]({{< ref setup-zookeeper.md >}})        | ✅ | ❌          | ✅  | ❌ | ❌ | ❌ | Alpha  | v1 | 1.0 |


### Amazon Web Services (AWS)
| Name                                               |CRUD|Transactional|ETag| [TTL]({{< ref state-store-ttl.md >}}) | [Actors]({{< ref howto-actors.md >}}) | [Query]({{< ref howto-state-query-api.md >}}) | Status | Component version | Since |
|----------------------------------------------------|----|-------------|----|----|----|----|------|----|-----|
| [AWS DynamoDB]({{< ref setup-dynamodb.md>}})       | ✅ | ❌           | ❌ | ✅ | ❌ | ❌ | Alpha | v1 | 1.0 |

### Google Cloud Platform (GCP)
| Name                                               |CRUD|Transactional|ETag| [TTL]({{< ref state-store-ttl.md >}}) | [Actors]({{< ref howto-actors.md >}}) | [Query]({{< ref howto-state-query-api.md >}}) | Status | Component version | Since |
|----------------------------------------------------|------|---------------|----|----|----|----|------|----|-----|
| [GCP Firestore]({{< ref setup-firestore.md >}})    | ✅   | ❌             | ❌ | ❌ | ❌ | ❌ | Alpha | v1 | 1.0 |

### Microsoft Azure

| Name                                                             |CRUD|Transactional|ETag| [TTL]({{< ref state-store-ttl.md >}}) | [Actors]({{< ref howto-actors.md >}}) | [Query]({{< ref howto-state-query-api.md >}}) | Status | Component version | Since |
|------------------------------------------------------------------|----|-------------|----|----|----|----|-------|----|-----|
| [Azure Blob Storage]({{< ref setup-azure-blobstorage.md >}})     | ✅ | ❌           | ✅ | ❌ | ❌ | ❌ | Stable | v1 | 1.0 |
| [Azure CosmosDB]({{< ref setup-azure-cosmosdb.md >}})            | ✅ | ✅           | ✅ | ✅ | ✅ | ✅ | Stable | v1 | 1.0 |
| [Azure SQL Server]({{< ref setup-sqlserver.md >}})               | ✅ | ✅           | ✅ | ❌ | ✅ | ❌ | Stable | v1 | 1.5 |
| [Azure Table Storage]({{< ref setup-azure-tablestorage.md >}})   | ✅ | ❌           | ✅ | ❌ | ❌ | ❌ | Alpha  | v1 | 1.0 |

### Oracle Cloud Infrastructure (OCI)

| Name                                                             |CRUD|Transactional|ETag| [TTL]({{< ref state-store-ttl.md >}}) | [Actors]({{< ref howto-actors.md >}}) | [Query]({{< ref howto-state-query-api.md >}}) | Status | Component version | Since |
|------------------------------------------------------------------|----|-------------|----|----|----|----|-------|----|-----|
| [Autonomous Database (ATP and ADW)]({{< ref setup-oracledatabase.md >}})      | ✅ | ✅          | ✅  | ✅ | ✅ | ❌ | Alpha  | v1 | 1.7 |
| [Object Storage]({{< ref setup-oci-objectstorage.md >}})     | ✅ | ❌           | ✅ | ✅ | ❌ | ❌ | Alpha | v1 | 1.6 |
