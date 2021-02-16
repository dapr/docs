---
type: docs
title: "Supported stores"
linkTitle: "Supported stores"
description: "The supported state stores that interface with Dapr"
weight: 20000
no_list: true
---

### Generic

| Name                                                           | CRUD | Transactional </br>(Supports Actors) | ETag | Version | Status |
|----------------------------------------------------------------|------|--------------------- |-------|--------|--------|
| [Aerospike]({{< ref setup-aerospike.md >}})                    | ✅   | ❌                  | ✅    | v1     | Alpha |
| [Apache Cassandra]({{< ref setup-cassandra.md >}})             | ✅   | ❌                  | ❌    | v1     | Alpha |
| [Cloudstate]({{< ref setup-cloudstate.md >}})                  | ✅   | ❌                  | ✅    | v1     | Alpha |
| [Couchbase]({{< ref setup-couchbase.md >}})                    | ✅   | ❌                  | ✅    | v1     | Alpha |
| [Hashicorp Consul]({{< ref setup-consul.md >}})                | ✅   | ❌                  | ❌    | v1     | Alpha |
| [Hazelcast]({{< ref setup-hazelcast.md >}})                    | ✅   | ❌                  | ❌    | v1     | Alpha |
| [Memcached]({{< ref setup-memcached.md >}})                    | ✅   | ❌                  | ❌    | v1     | Alpha |
| [MongoDB]({{< ref setup-mongodb.md >}})                        | ✅   | ✅                  | ❌    | v1     | Alpha |
| [MySQL]({{< ref setup-mysql.md >}})                            | ✅   | ✅                  | ✅    | v1     | Alpha |
| [PostgreSQL]({{< ref setup-postgresql.md >}})                  | ✅   | ✅                  | ✅    | v1     | Alpha |
| [Redis]({{< ref setup-redis.md >}})                            | ✅   | ✅                  | ✅    | v1     | Alpha |
| RethinkDB                                                      | ✅   | ✅                  | ✅    | v1     | Alpha |
| [Zookeeper]({{< ref setup-zookeeper.md >}})                    | ✅   | ❌                  | ✅    | v1     | Alpha |

### Google Cloud Platform (GCP)
| Name                                                           | CRUD | Transactional </br>(Supports Actors) | ETag | Version | Status |
|----------------------------------------------------------------|------|--------------------- |-------|--------|--------|
| [GCP Firestore]({{< ref setup-firestore.md >}})       | ✅   | ❌                  | ❌     | v1     | Alpha |
### Microsoft Azure

| Name                                                           | CRUD | Transactional </br>(Supports Actors) | ETag | Version | Status |
|----------------------------------------------------------------|------|--------------------- |-------|--------|--------|
| [Azure Blob Storage]({{< ref setup-azure-blobstorage.md >}})     | ✅  | ❌                  | ✅    | v1     | Alpha |
| [Azure CosmosDB]({{< ref setup-azure-cosmosdb.md >}})            | ✅  | ✅                  | ✅    | v1     | Alpha |
| [Azure SQL Server]({{< ref setup-sqlserver.md >}})               | ✅  | ✅                  | ✅    | v1     | Alpha |
| [Azure Table Storage]({{< ref setup-azure-tablestorage.md >}})   | ✅  | ❌                  | ✅    | v1     | Alpha |

### Amazon Web Services (AWS)
| Name                                                           | CRUD | Transactional </br>(Supports Actors) | ETag | Version | Status |
|----------------------------------------------------------------|------|--------------------- |-------|--------|--------|
| AWS DynamoDB                                                     | ✅  | ❌                   | ❌   |  v1     | Alpha |
