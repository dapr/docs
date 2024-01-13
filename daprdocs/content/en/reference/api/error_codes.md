---
type: docs
title: "Error codes returned by APIs"
linkTitle: "Error codes"
description: "Detailed reference of the Dapr API error codes"
weight: 1400
---

For http calls made to Dapr runtime, when an error is encountered, an error json is returned in http response body. The json contains an error code and an descriptive error message, e.g.
```
{
    "errorCode": "ERR_STATE_GET",
    "message": "Requested state key does not exist in state store."
}
```

Following table lists the error codes returned by Dapr runtime:

| Error Code                        | Description |
|-----------------------------------|-------------|
| ERR_ACTOR_INSTANCE_MISSING        | Error getting an actor instance. This means that actor is now hosted in some other service replica.
| ERR_ACTOR_RUNTIME_NOT_FOUND       | Error getting the actor instance.
| ERR_ACTOR_REMINDER_CREATE         | Error creating a reminder for an actor.
| ERR_ACTOR_REMINDER_DELETE         | Error deleting a reminder for an actor.
| ERR_ACTOR_TIMER_CREATE            | Error creating a timer for an actor.
| ERR_ACTOR_TIMER_DELETE            | Error deleting a timer for an actor.
| ERR_ACTOR_REMINDER_GET            | Error getting a reminder for an actor.
| ERR_ACTOR_INVOKE_METHOD           | Error invoking a method on an actor.
| ERR_ACTOR_STATE_DELETE            | Error deleting the state for an actor.
| ERR_ACTOR_STATE_GET               | Error getting the state for an actor.
| ERR_ACTOR_STATE_TRANSACTION_SAVE  | Error storing actor state transactionally.
| ERR_PUBSUB_NOT_FOUND              | Error referencing the Pub/Sub component in Dapr runtime.
| ERR_PUBSUB_PUBLISH_MESSAGE        | Error publishing a message.
| ERR_PUBSUB_FORBIDDEN              | Error message forbidden by access controls.
| ERR_PUBSUB_CLOUD_EVENTS_SER       | Error serializing Pub/Sub event envelope.
| ERR_STATE_STORE_NOT_FOUND         | Error referencing a state store not found.
| ERR_STATE_STORES_NOT_CONFIGURED   | Error no state stores configured.
| ERR_NOT_SUPPORTED_STATE_OPERATION | Error transaction requested on a state store with no transaction support.
| ERR_STATE_GET                     | Error getting a state for state store.
| ERR_STATE_DELETE                  | Error deleting a state from state store.
| ERR_STATE_SAVE                    | Error saving a state in state store.
| ERR_INVOKE_OUTPUT_BINDING         | Error invoking an output binding.
| ERR_MALFORMED_REQUEST             | Error with a malformed request.
| ERR_DIRECT_INVOKE                 | Error in direct invocation.
| ERR_DESERIALIZE_HTTP_BODY         | Error deserializing an HTTP request body.
| ERR_SECRET_STORES_NOT_CONFIGURED  | Error that no secret store is configured.
| ERR_SECRET_STORE_NOT_FOUND        | Error that specified secret store is not found.
| ERR_HEALTH_NOT_READY              | Error that Dapr is not ready.
| ERR_METADATA_GET                  | Error parsing the Metadata information.
