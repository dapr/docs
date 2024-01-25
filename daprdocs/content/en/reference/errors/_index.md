---
type: docs
title: Dapr errors
linkTitle: "Dapr errors"
weight: 700
description: "Information on Dapr errors and how to handle them"
---

## Error handling: Understanding errors model and reporting

Initially, errors followed the [Standard gRPC error model](https://grpc.io/docs/guides/error/#standard-error-model). However, to provide more detailed and informative error messages, an enhanced error model has been defined which aligns with the gRPC [Richer error model](https://grpc.io/docs/guides/error/#richer-error-model). 

{{% alert title="Note" color="primary" %}}
Not all Dapr errors have been converted to the richer gRPC error model.
{{% /alert %}}

### Standard gRPC Error Model

The [Standard gRPC error model](https://grpc.io/docs/guides/error/#standard-error-model) is an approach to error reporting in gRPC. Each error response includes an error code and an error message. The error codes are standardized and reflect common error conditions. 

**Example of a Standard gRPC Error Response:**
```
ERROR:
  Code: InvalidArgument
  Message: input key/keyPrefix 'bad||keyname' can't contain '||'
```

### Richer gRPC Error Model

The [Richer gRPC error model](https://grpc.io/docs/guides/error/#richer-error-model) extends the standard error model by providing additional context and details about the error. This model includes the standard error `code` and `message`, along with a `details` section that can contain various types of information, such as `ErrorInfo`, `ResourceInfo`, and `BadRequest` details.


**Example of a Richer gRPC Error Response:**
```
ERROR:
  Code: InvalidArgument
  Message: input key/keyPrefix 'bad||keyname' can't contain '||'
  Details:
  1)	{
    	  "@type": "type.googleapis.com/google.rpc.ErrorInfo",
    	  "domain": "dapr.io",
    	  "reason": "DAPR_STATE_ILLEGAL_KEY"
    	}
  2)	{
    	  "@type": "type.googleapis.com/google.rpc.ResourceInfo",
    	  "resourceName": "statestore",
    	  "resourceType": "state"
    	}
  3)	{
    	  "@type": "type.googleapis.com/google.rpc.BadRequest",
    	  "fieldViolations": [
    	    {
    	      "field": "bad||keyname",
    	      "description": "input key/keyPrefix 'bad||keyname' can't contain '||'"
    	    }
    	  ]
    	}
```

For HTTP clients, Dapr translates the gRPC error model to a similar structure in JSON format. The response includes an `errorCode`, a `message`, and a `details` array that mirrors the structure found in the richer gRPC model.

**Example of an HTTP error response:**
```json
{
    "errorCode": "ERR_MALFORMED_REQUEST",
    "message": "api error: code = InvalidArgument desc = input key/keyPrefix 'bad||keyname' can't contain '||'",
    "details": [
        {
            "@type": "type.googleapis.com/google.rpc.ErrorInfo",
            "domain": "dapr.io",
            "metadata": null,
            "reason": "DAPR_STATE_ILLEGAL_KEY"
        },
        {
            "@type": "type.googleapis.com/google.rpc.ResourceInfo",
            "description": "",
            "owner": "",
            "resource_name": "statestore",
            "resource_type": "state"
        },
        {
            "@type": "type.googleapis.com/google.rpc.BadRequest",
            "field_violations": [
                {
                    "field": "bad||keyname",
                    "description": "api error: code = InvalidArgument desc = input key/keyPrefix 'bad||keyname' can't contain '||'"
                }
            ]
        }
    ]
}
```

You can find the specification of all the possible status details [here](https://github.com/googleapis/googleapis/blob/master/google/rpc/error_details.proto).

## Related Links

- [Authoring error codes](https://github.com/dapr/dapr/tree/master/pkg/api/errors)
- [Using error codes in the Go SDK](https://docs.dapr.io/developing-applications/sdks/go/go-client/#error-handling)
