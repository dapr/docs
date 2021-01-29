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

| Name                                                           | CRUD | Transactional |
|----------------------------------------------------------------|------|---------------|
| [Aerospike]({{< ref setup-aerospike.md >}})                    | ✅  | ❌            |
| [Apache Cassandra]({{< ref setup-cassandra.md >}})             | ✅  | ❌            |
| [Cloudstate]({{< ref setup-cloudstate.md >}})                  | ✅  | ❌            |
| [Couchbase]({{< ref setup-couchbase.md >}})                    | ✅  | ❌            |
| [Hashicorp Consul]({{< ref setup-consul.md >}})                | ✅  | ❌            |
| [Hazelcast]({{< ref setup-hazelcast.md >}})                    | ✅  | ❌            |
| [Memcached]({{< ref setup-memcached.md >}})                    | ✅  | ❌            |
| [MongoDB]({{< ref setup-mongodb.md >}})                        | ✅  | ✅            |
| [MySQL]({{< ref setup-mysql.md >}})                            | ✅  | ✅            |
| [PostgreSQL]({{< ref setup-postgresql.md >}})                  | ✅  | ✅            |
| [Redis]({{< ref setup-redis.md >}})                            | ✅  | ✅            |
| [Zookeeper]({{< ref setup-zookeeper.md >}})                    | ✅  | ❌            |

### Google Cloud Platform (GCP)
| Name                                                  | CRUD | Transactional |
|-------------------------------------------------------|------|---------------|
| [GCP Firestore]({{< ref setup-firestore.md >}})       | ✅   | ❌             |
### Microsoft Azure

| Name                                                             | CRUD | Transactional |
|------------------------------------------------------------------|------|---------------|
| [Azure Blob Storage]({{< ref setup-azure-blobstorage.md >}})     | ✅   | ❌             |
| [Azure CosmosDB]({{< ref setup-azure-cosmosdb.md >}})            | ✅   | ✅             |
| [Azure SQL Server]({{< ref setup-sqlserver.md >}})               | ✅   | ❌             |
| [Azure Table Storage]({{< ref setup-azure-tablestorage.md >}})   | ✅   | ❌             |


