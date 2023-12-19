---
type: docs
title: Dapr Errors
linkTitle: "Dapr Errors"
weight: 700
description: "Information on Dapr errors and how to handle them"
---

# Dapr Error Handling: Understanding the Error Models

Initially, Dapr followed the standard gRPC error model. However, to provide more detailed and informative error messages, Dapr is gradually transitioning to a richer error model as defined by gRPC. 

> Not all Dapr errors have been converted to the richer gRPC error model.

### Standard gRPC Error Model

The [standard gRPC error model](https://grpc.io/docs/guides/error/#standard-error-model) is a straightforward approach to error reporting gRPC. Each error response includes an error code and an error message. The error codes are standardized and reflect common error conditions. 

Example of a Standard gRPC Error Response:
```
ERROR:
  Code: InvalidArgument
  Message: input key/keyPrefix 'bad||keyname' can't contain '||'
```

### Richer gRPC Error Model

The richer error model enhances the standard model by providing additional context and details about the error. This model includes the standard error code and message, along with a Details section that can contain various types of information, such as ErrorInfo, ResourceInfo, and BadRequest details.


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

For HTTP clients, Dapr translates the gRPC error model to a similar structure in JSON format. The response includes an errorCode, a message, and a details array that mirrors the structure found in the richer gRPC model.

**Example of an HTTP Error Response:**
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