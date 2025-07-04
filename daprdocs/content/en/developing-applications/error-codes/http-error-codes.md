---
type: docs
title: "Handling HTTP error codes"
linkTitle: "HTTP"
description: "Detailed reference of the Dapr HTTP error codes and how to handle them"
weight: 30
---

For HTTP calls made to Dapr runtime, when an error is encountered, an error JSON is returned in response body. The JSON contains an error code and an descriptive error message. 

```
{
    "errorCode": "ERR_STATE_GET",
    "message": "Requested state key does not exist in state store."
}
```

## Related

- [Error code reference list]({{< ref error-codes-reference.md >}})
- [Handling gRPC error codes]({{< ref grpc-error-codes.md >}})