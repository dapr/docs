---
type: docs
title: "Supported stores"
linkTitle: "Supported stores"
description: "CRUD and/or transactional support for supported stores"
weight: 20000
no_list: true
---

The following stores are supported, at various levels, by the Dapr state management building block:

### Generic

| Name                                                           | CRUD | Transactional | Status |
|----------------------------------------------------------------|------|---------------|--------|
| [Aerospike]({{< ref setup-aerospike.md >}})                    | ✅   | ❌            |  Alpha  |
| [Apache Cassandra]({{< ref setup-cassandra.md >}})             | ✅   | ❌            |  Alpha  |
| [Cloudstate]({{< ref setup-cloudstate.md >}})                  | ✅   | ❌            |  Alpha  |
| [Couchbase]({{< ref setup-couchbase.md >}})                    | ✅   | ❌            |  Alpha  |
| [Hashicorp Consul]({{< ref setup-consul.md >}})                | ✅   | ❌            |  Alpha  |
| [Hazelcast]({{< ref setup-hazelcast.md >}})                    | ✅   | ❌            |  Alpha  |
| [Memcached]({{< ref setup-memcached.md >}})                    | ✅   | ❌            |  Alpha  |
| [MongoDB]({{< ref setup-mongodb.md >}})                        | ✅   | ✅            |  Alpha  |
| [MySQL]({{< ref setup-mysql.md >}})                            | ✅   | ✅            |  Alpha  |
| [PostgreSQL]({{< ref setup-postgresql.md >}})                  | ✅   | ✅            |  Alpha  |
| [Redis]({{< ref setup-redis.md >}})                            | ✅   | ✅            |  Alpha  |
| [Zookeeper]({{< ref setup-zookeeper.md >}})                    | ✅   | ❌            |  Alpha  |


### Amazon Web Services (AWS)
| Name                                                  | CRUD | Transactional | Status |
|-------------------------------------------------------|------|---------------|--------|
| [AWS DynamoDB]({{< ref setup-dynamodb.md >}})                      | ✅   | ❌            |  Alpha  |

### Google Cloud Platform (GCP)
| Name                                                  | CRUD | Transactional | Status |
|-------------------------------------------------------|------|---------------|--------|
| [GCP Firestore]({{< ref setup-firestore.md >}})       | ✅   | ❌             | Alpha  |
### Microsoft Azure

| Name                                                             | CRUD | Transactional | Status |
|------------------------------------------------------------------|------|---------------|--------|
| [Azure Blob Storage]({{< ref setup-azure-blobstorage.md >}})     | ✅   | ❌             | Alpha  |
| [Azure CosmosDB]({{< ref setup-azure-cosmosdb.md >}})            | ✅   | ✅             | Alpha  |
| [Azure SQL Server]({{< ref setup-sqlserver.md >}})               | ✅   | ❌             | Alpha  |
| [Azure Table Storage]({{< ref setup-azure-tablestorage.md >}})   | ✅   | ❌             | Alpha  |


