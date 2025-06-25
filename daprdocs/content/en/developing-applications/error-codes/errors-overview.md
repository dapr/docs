---
type: docs
title: "Errors overview"
linkTitle: "Overview"
weight: 10
description: "Overview of Dapr errors"
---

An error code is a numeric or alphamueric code that indicates the nature of an error and, when possible, why it occured. 

Dapr error codes are standardized strings for over 80+ common errors across HTTP and gRPC requests when using the Dapr APIs. These codes are both:
- Returned in the JSON response body of the request.
- When enabled, logged in debug-level logs in the runtime.
  - If you're running in Kubernetes, error codes are logged in the sidecar.
  - If you're running in self-hosted, you can enable and run debug logs.

## Error format

Dapr error codes consist of a prefix, a category, and shorthand of the error itself. For example:

| Prefix | Category | Error shorthand |  
| ------ | -------- | --------------- |
| ERR_ | PUBSUB_ | NOT_FOUND |

Some of the most common errors returned include:

- ERR_ACTOR_TIMER_CREATE
- ERR_PURGE_WORKFLOW
- ERR_STATE_STORE_NOT_FOUND
- ERR_HEALTH_NOT_READY

> **Note:** [See a full list of error codes in Dapr.]({{< ref error-codes-reference.md >}})

An error returned for a state store not found might look like the following:

```json
{
  "error": "Bad Request",
  "error_msg": "{\"errorCode\":\"ERR_STATE_STORE_NOT_FOUND\",\"message\":\"state store <name> is not found\",\"details\":[{\"@type\":\"type.googleapis.com/google.rpc.ErrorInfo\",\"domain\":\"dapr.io\",\"metadata\":{\"appID\":\"nodeapp\"},\"reason\":\"DAPR_STATE_NOT_FOUND\"}]}",
  "status": 400
}
```

The returned error includes:
- The error code: `ERR_STATE_STORE_NOT_FOUND`
- The error message describing the issue: `state store <name> is not found`
- The app ID in which the error is occuring: `nodeapp`
- The reason for the error: `DAPR_STATE_NOT_FOUND`

## Dapr error code metrics

Metrics help you see when exactly errors are occuring from within the runtime. Error code metrics are collected using the `error_code_total` endpoint. This endpoint is disabled by default. You can [enable it using the `recordErrorCodes` field in your configuration file]({{< ref "metrics-overview.md#configuring-metrics-for-error-codes" >}}). 

## Demo

Watch a demo presented during [Diagrid's Dapr v1.15 celebration](https://www.diagrid.io/videos/dapr-1-15-deep-dive) to see how to enable error code metrics and handle error codes returned in the runtime.

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/NTnwoDhHIcQ?si=I2uCB_TINGxlu-9v&amp;start=2812" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Next step

{{< button text="See a list of all Dapr error codes" page="error-codes-reference" >}}