---
type: docs
title: "Supported stores"
linkTitle: "Supported stores"
description: "The supported state stores that interface with Dapr"
weight: 20000
no_list: true
---

### Generic

| Name                                                           | CRUD | Transactional </br>(Supports Actors) | ETag | Status |
|----------------------------------------------------------------|------|---------------------|------|--------|
| [Aerospike]({{< ref setup-aerospike.md >}})                    | ✅   | ❌                  | ✅    | Alpha  |
| [Apache Cassandra]({{< ref setup-cassandra.md >}})             | ✅   | ❌                  | ❌    | Alpha  |
| [Cloudstate]({{< ref setup-cloudstate.md >}})                  | ✅   | ❌                  | ✅    | Alpha  |
| [Couchbase]({{< ref setup-couchbase.md >}})                    | ✅   | ❌                  | ✅    | Alpha  |
| [Hashicorp Consul]({{< ref setup-consul.md >}})                | ✅   | ❌                  | ❌    | Alpha  |
| [Hazelcast]({{< ref setup-hazelcast.md >}})                    | ✅   | ❌                  | ❌    | Alpha  |
| [Memcached]({{< ref setup-memcached.md >}})                    | ✅   | ❌                  | ❌    | Alpha  |
| [MongoDB]({{< ref setup-mongodb.md >}})                        | ✅   | ✅                  | ❌    | Alpha  |
| [MySQL]({{< ref setup-mysql.md >}})                            | ✅   | ✅                  | ✅    | Alpha  |
| [PostgreSQL]({{< ref setup-postgresql.md >}})                  | ✅   | ✅                  | ✅    | Alpha  |
| [Redis]({{< ref setup-redis.md >}})                            | ✅   | ✅                  | ✅    | Alpha  |
| RethinkDB                                                      | ✅   | ✅                  | ✅    | Alpha  |
| [Zookeeper]({{< ref setup-zookeeper.md >}})                    | ✅   | ❌                  | ✅    | Alpha  |


### Amazon Web Services (AWS)
| Name                                                  | CRUD | Transactional </br>(Supports Actors) | ETag | Status |
|-------------------------------------------------------|------|---------------|--------|
| [AWS DynamoDB]({{< ref setup-dynamodb.md >}})         | ✅   | ❌            | ❌     |  Alpha  |

### Google Cloud Platform (GCP)
| Name                                                  | CRUD | Transactional </br>(Supports Actors) | ETag | Status |
|-------------------------------------------------------|------|---------------------|------|--------|
| [GCP Firestore]({{< ref setup-firestore.md >}})       | ✅   | ❌                  | ❌     | Alpha  |
### Microsoft Azure

| Name                                                             | CRUD | Transactional </br>(Supports Actors) | ETag | Status |
|------------------------------------------------------------------|------|---------------------|------|--------|
| [Azure Blob Storage]({{< ref setup-azure-blobstorage.md >}})     | ✅   | ❌                  | ✅    | Alpha  |
| [Azure CosmosDB]({{< ref setup-azure-cosmosdb.md >}})            | ✅   | ✅                  | ✅    | Alpha  |
| [Azure SQL Server]({{< ref setup-sqlserver.md >}})               | ✅   | ✅                  | ✅    | Alpha  |
| [Azure Table Storage]({{< ref setup-azure-tablestorage.md >}})   | ✅   | ❌                  | ✅    | Alpha  |

### Amazon Web Services (AWS)
| Name                                                             | CRUD | Transactional </br>(Supports Actors) | ETag | Status |
|------------------------------------------------------------------|------|---------------------|------|--------|
| AWS DynamoDB                                                     | ✅   | ❌                   | ❌   |  Alpha |
