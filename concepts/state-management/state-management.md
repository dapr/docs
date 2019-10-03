# State Management 

Dapr brings reliable state management to applications through a simple state API. Developers can use this API to retrive, save and delete states by keys.

Dapr data stores are pluggable. Dapr ships with [Redis](https://redis.io
) out-of-box. And it allows you to plug in other data stores such as [Azure CosmosDB](https://azure.microsoft.com/Databases/Cosmos_DB
), [AWS DynamoDB](https://aws.amazon.com/DynamoDB
), [GCP Cloud Spanner](https://cloud.google.com/spanner
) and [Cassandra](http://cassandra.apache.org/).

## State Store Behaviors
Dapr allows developers to attach to a state operation request additional metadata that describes how the request is expected to be handled. For example, you can attach concurrency requirement, consistency requirement, and retry poliy to any state operation requests.

By default, your application should assume a data store is **eventually consistent** and uses a **last-write-wins** concurrency pattern. On the other hand, if you do attach metadata to your requests, Dapr passes the metadata along with the reuqests to the state store and expects the data store or fullfill the requests.

Not all stores are created equal. To ensure portability of your application, you can query the capabilities of the store and make your code adaptive to different store capabilites.

The following table summarizes the capbilites of existing data store implemenatations.

Store | Strong Consistent Write | Strong Consistent Read | ETag|
----|----|----|----
Cosmos DB | Yes | Yes | Yes
Redis | Yes | Yes | Yes
Redis (clustered)| Yes | No | Yes

## Concurrency
Dapr supports optimsistic concurrency control (OCC) using ETags. When a state is requested, Dapr always attach an **ETag** property to the returned state. And when the user code tries to update or delete a state, it's expected to attach the ETag through the **If-Match** header. The write operation can succeed only when the provided ETag matches with the ETag in the database.

Dapr chooses OCC because in many applications, data update conflicts are rare because clients are naturally partitioned by business contexts to operate on different data. However, if your application chooses to use ETags, a request may get rejected because of mismatched ETags. So, it's recommended you use a [Retry Policy](#Retry-Policies) to compensate for such conflicts when using ETags.

If your application omits ETags in writing requests, Dapr skips ETag checks while handling the requests. This essentially enables the **last-write-win** pattern, comparing to the **first-write-win** pattern with ETags.

> **NOTE:** For stores that don't natively support ETags, it's expected that the corresponding Dapr state store implementation to simulate ETags and to follow the Dapr spec when handling states. Becasue Dapr state store implementations are technically clients to the underlying data store, such simulation should be straightforward using existing concurrency control machenisms provided by the store.

## Consistency
Dapr supports both **strong consistency** and **eventual consistency**, with eventual consistency as the default behavior.

When strong consistency is used, Dapr waits for all replicas (or desingated quorums) to acknowlege before it acknowledges a write request. When eventual consistency is used, Dapr returns as soons as the write request is accepted by the underlying data store. 

## Retry Policies
Dapr allows you to attach a retry policy to any write request. A policy is described by an **inteval**, a **pattern** and a **threshold**. Dapr keeps retries the request at the given interval up to the specified threshold. You can choose between a **linear** retry pattern and a **exponential** (backoff) pattern. When the **exponential** pattern is used, the retry interval is doubled after each attempt. 

## Bulk Operations

Dapr supports two types of bulk operations - **bulk** or **multi**. You can group several requests with the same type into a bulk (or a batch). Dapr submits requests in the bulk as individual requests to the underlying data store. In other words, bulk operations are not transactional. On the other hand, you can group requests of different types into a multi-operation, which is handled as an atomic transaction.

## References
* [Dapr state managment spec](https://github.com/dapr/spec/blob/master/state.md)