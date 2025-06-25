---
type: docs
title: "Error codes reference guide"
linkTitle: "Reference"
description: "List of gRPC and HTTP error codes in Dapr and their descriptions"
weight: 20
---

The following tables list the error codes returned by Dapr runtime.
The error codes are returned in the response body of an HTTP request or in the `ErrorInfo` section of a gRPC status response, if one is present. 
An effort is underway to enrich all gRPC error responses according to the [Richer Error Model]({{< ref "grpc-error-codes.md#richer-grpc-error-model" >}}). Error codes without a corresponding gRPC code indicate those errors have not yet been updated to this model.

### Actors API

| HTTP Code                          | gRPC Code | Description                                                             |
| ---------------------------------- | --------- | ----------------------------------------------------------------------- |
| `ERR_ACTOR_INSTANCE_MISSING`       |           | Missing actor instance                                                  |
| `ERR_ACTOR_INVOKE_METHOD`          |           | Error invoking actor method                                             |
| `ERR_ACTOR_RUNTIME_NOT_FOUND`      |           | Actor runtime not found                                                 |
| `ERR_ACTOR_STATE_GET`              |           | Error getting actor state                                               |
| `ERR_ACTOR_STATE_TRANSACTION_SAVE` |           | Error saving actor transaction                                          |
| `ERR_ACTOR_REMINDER_CREATE`        |           | Error creating actor reminder                                           |
| `ERR_ACTOR_REMINDER_DELETE`        |           | Error deleting actor reminder                                           |
| `ERR_ACTOR_REMINDER_GET`           |           | Error getting actor reminder                                            |
| `ERR_ACTOR_REMINDER_NON_HOSTED`    |           | Reminder operation on non-hosted actor type                             |
| `ERR_ACTOR_TIMER_CREATE`           |           | Error creating actor timer                                              |
| `ERR_ACTOR_NO_APP_CHANNEL`         |           | App channel not initialized                                             |
| `ERR_ACTOR_STACK_DEPTH`            |           | Maximum actor call stack depth exceeded                                 |
| `ERR_ACTOR_NO_PLACEMENT`           |           | Placement service not configured                                        |
| `ERR_ACTOR_RUNTIME_CLOSED`         |           | Actor runtime is closed                                                 |
| `ERR_ACTOR_NAMESPACE_REQUIRED`     |           | Actors must have a namespace configured when running in Kubernetes mode |
| `ERR_ACTOR_NO_ADDRESS`             |           | No address found for actor                                              |


### Workflows API

| HTTP Code                          | gRPC Code | Description                                                                             |
| ---------------------------------- | --------- | --------------------------------------------------------------------------------------- |
| `ERR_GET_WORKFLOW`                 |           | Error getting workflow                                                                  |
| `ERR_START_WORKFLOW`               |           | Error starting workflow                                                                 |
| `ERR_PAUSE_WORKFLOW`               |           | Error pausing workflow                                                                  |
| `ERR_RESUME_WORKFLOW`              |           | Error resuming workflow                                                                 |
| `ERR_TERMINATE_WORKFLOW`           |           | Error terminating workflow                                                              |
| `ERR_PURGE_WORKFLOW`               |           | Error purging workflow                                                                  |
| `ERR_RAISE_EVENT_WORKFLOW`         |           | Error raising event in workflow                                                         |
| `ERR_WORKFLOW_COMPONENT_MISSING`   |           | Missing workflow component                                                              |
| `ERR_WORKFLOW_COMPONENT_NOT_FOUND` |           | Workflow component not found                                                            |
| `ERR_WORKFLOW_EVENT_NAME_MISSING`  |           | Missing workflow event name                                                             |
| `ERR_WORKFLOW_NAME_MISSING`        |           | Workflow name not configured                                                            |
| `ERR_INSTANCE_ID_INVALID`          |           | Invalid workflow instance ID. (Only alphanumeric and underscore characters are allowed) |
| `ERR_INSTANCE_ID_NOT_FOUND`        |           | Workflow instance ID not found                                                          |
| `ERR_INSTANCE_ID_PROVIDED_MISSING` |           | Missing workflow instance ID                                                            |
| `ERR_INSTANCE_ID_TOO_LONG`         |           | Workflow instance ID too long                                                           |


### State management API

| HTTP Code                               | gRPC Code                               | Description                               |
| --------------------------------------- | --------------------------------------- | ----------------------------------------- |
| `ERR_STATE_TRANSACTION`                 |                                         | Error in state transaction                |
| `ERR_STATE_SAVE`                        |                                         | Error saving state                        |
| `ERR_STATE_GET`                         |                                         | Error getting state                       |
| `ERR_STATE_DELETE`                      |                                         | Error deleting state                      |
| `ERR_STATE_BULK_DELETE`                 |                                         | Error deleting state in bulk              |
| `ERR_STATE_BULK_GET`                    |                                         | Error getting state in bulk               |
| `ERR_NOT_SUPPORTED_STATE_OPERATION`     |                                         | Operation not supported in transaction    |
| `ERR_STATE_QUERY`                       | `DAPR_STATE_QUERY_FAILED`               | Error querying state                      |
| `ERR_STATE_STORE_NOT_FOUND`             | `DAPR_STATE_NOT_FOUND`                  | State store not found                     |
| `ERR_STATE_STORE_NOT_CONFIGURED`        | `DAPR_STATE_NOT_CONFIGURED`             | State store not configured                |
| `ERR_STATE_STORE_NOT_SUPPORTED`         | `DAPR_STATE_TRANSACTIONS_NOT_SUPPORTED` | State store does not support transactions |
| `ERR_STATE_STORE_NOT_SUPPORTED`         | `DAPR_STATE_QUERYING_NOT_SUPPORTED`     | State store does not support querying     |
| `ERR_STATE_STORE_TOO_MANY_TRANSACTIONS` | `DAPR_STATE_TOO_MANY_TRANSACTIONS`      | Too many operations per transaction       |
| `ERR_MALFORMED_REQUEST`                 | `DAPR_STATE_ILLEGAL_KEY`                | Invalid key                               |


### Configuration API

| HTTP Code                                | gRPC Code | Description                            |
| ---------------------------------------- | --------- | -------------------------------------- |
| `ERR_CONFIGURATION_GET`                  |           | Error getting configuration            |
| `ERR_CONFIGURATION_STORE_NOT_CONFIGURED` |           | Configuration store not configured     |
| `ERR_CONFIGURATION_STORE_NOT_FOUND`      |           | Configuration store not found          |
| `ERR_CONFIGURATION_SUBSCRIBE`            |           | Error subscribing to configuration     |
| `ERR_CONFIGURATION_UNSUBSCRIBE`          |           | Error unsubscribing from configuration |


### Crypto API

| HTTP Code                             | gRPC Code | Description                     |
| ------------------------------------- | --------- | ------------------------------- |
| `ERR_CRYPTO`                          |           | Error in crypto operation       |
| `ERR_CRYPTO_KEY`                      |           | Error retrieving crypto key     |
| `ERR_CRYPTO_PROVIDER_NOT_FOUND`       |           | Crypto provider not found       |
| `ERR_CRYPTO_PROVIDERS_NOT_CONFIGURED` |           | Crypto providers not configured |


### Secrets API

| HTTP Code                          | gRPC Code | Description                 |
| ---------------------------------- | --------- | --------------------------- |
| `ERR_SECRET_GET`                   |           | Error getting secret        |
| `ERR_SECRET_STORE_NOT_FOUND`       |           | Secret store not found      |
| `ERR_SECRET_STORES_NOT_CONFIGURED` |           | Secret store not configured |
| `ERR_PERMISSION_DENIED`            |           | Permission denied by policy |


### Pub/Sub and messaging errors

| HTTP Code                     | gRPC Code                              | Description                            |
| ----------------------------- | -------------------------------------- | -------------------------------------- |
| `ERR_PUBSUB_EMPTY`            | `DAPR_PUBSUB_NAME_EMPTY`               | Pubsub name is empty                   |
| `ERR_PUBSUB_NOT_FOUND`        | `DAPR_PUBSUB_NOT_FOUND`                | Pubsub not found                       |
| `ERR_PUBSUB_NOT_FOUND`        | `DAPR_PUBSUB_TEST_NOT_FOUND`           | Pubsub not found                       |
| `ERR_PUBSUB_NOT_CONFIGURED`   | `DAPR_PUBSUB_NOT_CONFIGURED`           | Pubsub not configured                  |
| `ERR_TOPIC_NAME_EMPTY`        | `DAPR_PUBSUB_TOPIC_NAME_EMPTY`         | Topic name is empty                    |
| `ERR_PUBSUB_FORBIDDEN`        | `DAPR_PUBSUB_FORBIDDEN`                | Access to topic forbidden for APP ID   |
| `ERR_PUBSUB_PUBLISH_MESSAGE`  | `DAPR_PUBSUB_PUBLISH_MESSAGE`          | Error publishing message               |
| `ERR_PUBSUB_REQUEST_METADATA` | `DAPR_PUBSUB_METADATA_DESERIALIZATION` | Error deserializing metadata           |
| `ERR_PUBSUB_CLOUD_EVENTS_SER` | `DAPR_PUBSUB_CLOUD_EVENT_CREATION`     | Error creating CloudEvent              |
| `ERR_PUBSUB_EVENTS_SER`       | `DAPR_PUBSUB_MARSHAL_ENVELOPE`         | Error marshalling Cloud Event envelope |
| `ERR_PUBSUB_EVENTS_SER`       | `DAPR_PUBSUB_MARSHAL_EVENTS`           | Error marshalling events to bytes      |
| `ERR_PUBSUB_EVENTS_SER`       | `DAPR_PUBSUB_UNMARSHAL_EVENTS`         | Error unmarshalling events             |
| `ERR_PUBLISH_OUTBOX`          |                                        | Error publishing message to outbox     |


### Conversation API

| HTTP Code                         | gRPC Code | Description                                   |
| --------------------------------- | --------- | --------------------------------------------- |
| `ERR_CONVERSATION_INVALID_PARMS`  |           | Invalid parameters for conversation component |
| `ERR_CONVERSATION_INVOKE`         |           | Error invoking conversation                   |
| `ERR_CONVERSATION_MISSING_INPUTS` |           | Missing inputs for conversation               |
| `ERR_CONVERSATION_NOT_FOUND`      |           | Conversation not found                        |


### Service Invocation / Direct Messaging API

| HTTP Code           | gRPC Code | Description            |
| ------------------- | --------- | ---------------------- |
| `ERR_DIRECT_INVOKE` |           | Error invoking service |


### Bindings API

| HTTP Code                   | gRPC Code | Description                   |
| --------------------------- | --------- | ----------------------------- |
| `ERR_INVOKE_OUTPUT_BINDING` |           | Error invoking output binding |


### Distributed Lock API

| HTTP Code                       | gRPC Code | Description               |
| ------------------------------- | --------- | ------------------------- |
| `ERR_LOCK_STORE_NOT_CONFIGURED` |           | Lock store not configured |
| `ERR_LOCK_STORE_NOT_FOUND`      |           | Lock store not found      |
| `ERR_TRY_LOCK`                  |           | Error acquiring lock      |
| `ERR_UNLOCK`                    |           | Error releasing lock      |


### Healthz

| HTTP Code                       | gRPC Code | Description                 |
| ------------------------------- | --------- | --------------------------- |
| `ERR_HEALTH_NOT_READY`          |           | Dapr not ready              |
| `ERR_HEALTH_APPID_NOT_MATCH`    |           | Dapr  App ID does not match |
| `ERR_OUTBOUND_HEALTH_NOT_READY` |           | Dapr outbound not ready     |


### Common

| HTTP Code                    | gRPC Code | Description                |
| ---------------------------- | --------- | -------------------------- |
| `ERR_API_UNIMPLEMENTED`      |           | API not implemented        |
| `ERR_APP_CHANNEL_NIL`        |           | App channel is nil         |
| `ERR_BAD_REQUEST`            |           | Bad request                |
| `ERR_BODY_READ`              |           | Error reading request body |
| `ERR_INTERNAL`               |           | Internal error             |
| `ERR_MALFORMED_REQUEST`      |           | Malformed request          |
| `ERR_MALFORMED_REQUEST_DATA` |           | Malformed request data     |
| `ERR_MALFORMED_RESPONSE`     |           | Malformed response         |


### Scheduler/Jobs API

| HTTP Code                       | gRPC Code                       | Description                            |
| ------------------------------- | ------------------------------- | -------------------------------------- |
| `DAPR_SCHEDULER_SCHEDULE_JOB`   | `DAPR_SCHEDULER_SCHEDULE_JOB`   | Error scheduling job                   |
| `DAPR_SCHEDULER_JOB_NAME`       | `DAPR_SCHEDULER_JOB_NAME`       | Job name should only be set in the url |
| `DAPR_SCHEDULER_JOB_NAME_EMPTY` | `DAPR_SCHEDULER_JOB_NAME_EMPTY` | Job name is empty                      |
| `DAPR_SCHEDULER_GET_JOB`        | `DAPR_SCHEDULER_GET_JOB`        | Error getting job                      |
| `DAPR_SCHEDULER_LIST_JOBS`      | `DAPR_SCHEDULER_LIST_JOBS`      | Error listing jobs                     |
| `DAPR_SCHEDULER_DELETE_JOB`     | `DAPR_SCHEDULER_DELETE_JOB`     | Error deleting job                     |
| `DAPR_SCHEDULER_EMPTY`          | `DAPR_SCHEDULER_EMPTY`          | Required argument is empty             |
| `DAPR_SCHEDULER_SCHEDULE_EMPTY` | `DAPR_SCHEDULER_SCHEDULE_EMPTY` | No schedule provided for job           |


### Generic

| HTTP Code | gRPC Code | Description   |
| --------- | --------- | ------------- |
| `ERROR`   | `ERROR`   | Generic error |

## Next steps

- [Handling HTTP error codes]({{< ref http-error-codes.md >}})
- [Handling gRPC error codes]({{< ref grpc-error-codes.md >}})