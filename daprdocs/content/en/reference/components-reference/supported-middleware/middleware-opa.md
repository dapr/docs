---
type: docs
title: "Apply Open Policy Agent (OPA) policies"
linkTitle: "Open Policy Agent (OPA)"
description: "Use middleware to apply Open Policy Agent (OPA) policies on incoming requests"
aliases:
- /developing-applications/middleware/supported-middleware/middleware-opa/
---

The Open Policy Agent (OPA) [HTTP middleware]({{< ref middleware.md >}}) applys [OPA Policies](https://www.openpolicyagent.org/) to incoming Dapr HTTP requests. This can be used to apply reusable authorization policies to app endpoints.

## Component format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: my-policy
  namespace: default
spec:
  type: middleware.http.opa
  version: v1
  metadata:
    # `includedHeaders` is a comma-separated set of case-insensitive headers to include in the request input.
    # Request headers are not passed to the policy by default. Include to receive incoming request headers in
    # the input
    - name: includedHeaders
      value: "x-my-custom-header, x-jwt-header"

    # `defaultStatus` is the status code to return for denied responses
    - name: defaultStatus
      value: 403

    # `rego` is the open policy agent policy to evaluate. required
    # The policy package must be http and the policy must set data.http.allow
    - name: rego
      value: |
        package http

        default allow = true

        # Allow may also be an object and include other properties

        # For example, if you wanted to redirect on a policy failure, you could set the status code to 301 and set the location header on the response:
        allow = {
            "status_code": 301,
            "additional_headers": {
                "location": "https://my.site/authorize"
            }
        } {
            not jwt.payload["my-claim"]
        }

        # You can also allow the request and add additional headers to it:
        allow = {
            "allow": true,
            "additional_headers": {
                "x-my-claim": my_claim
            }
        } {
            my_claim := jwt.payload["my-claim"]
        }
        jwt = { "payload": payload } {
            auth_header := input.request.headers["authorization"]
            [_, jwt] := split(auth_header, " ")
            [_, payload, _] := io.jwt.decode(jwt)
        }
```

You can prototype and experiment with policies using the [official opa playground](https://play.openpolicyagent.org). For example, [you can find the example policy above here](https://play.openpolicyagent.org/p/oRIDSo6OwE).

## Spec metadata fields

| Field  | Details | Example |
|--------|---------|---------|
| rego | The Rego policy language | See above |
| defaultStatus   | The status code to return for denied responses | `"https://accounts.google.com"`, `"https://login.salesforce.com"`
| includedHeaders | A comma-separated set of case-insensitive headers to include in the request input. Request headers are not passed to the policy by default. Include to receive incoming request headers in the input | `"x-my-custom-header, x-jwt-header"` 

## Dapr configuration

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware.md#customize-processing-pipeline">}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: my-policy
      type: middleware.http.opa
```

## Input

This middleware supplies a [`HTTPRequest`](#httprequest) as input.

### HTTPRequest

The `HTTPRequest` input contains all the relevant information about an incoming HTTP Request except it's body.

```go
type Input struct {
  request HTTPRequest
}

type HTTPRequest struct {
  // The request method (e.g. GET,POST,etc...)
  method string
  // The raw request path (e.g. "/v2/my-path/")
  path string
  // The path broken down into parts for easy consumption (e.g. ["v2", "my-path"])
  path_parts string[]
  // The raw query string (e.g. "?a=1&b=2")
  raw_query string
  // The query broken down into keys and their values
  query map[string][]string
  // The request headers
  // NOTE: By default, no headers are included. You must specify what headers
  // you want to receive via `spec.metadata.includedHeaders` (see above)
  headers map[string]string
  // The request scheme (e.g. http, https)
  scheme string
}
```

## Result

The policy must set `data.http.allow` with either a `boolean` value, or an `object` value with an `allow` boolean property. A `true` `allow` will allow the request, while a `false` value will reject the request with the status specified by `defaultStatus`. The following policy, with defaults, demonstrates a `403 - Forbidden` for all requests:

```go
package http

default allow = false
```

which is the same as:

```go
package http

default allow = {
  "allow": false
}
```

### Changing the rejected response status code

When rejecting a request, you can override the status code the that gets returned. For example, if you wanted to return a `401` instead of a `403`, you could do the following:

```go
package http

default allow = {
  "allow": false,
  "status_code": 401
}
```

### Adding response headers

To redirect, add headers and set the `status_code` to the returned result:

```go
package http

default allow = {
  "allow": false,
  "status_code": 301,
  "additional_headers": {
    "Location": "https://my.redirect.site"
  }
}
```

### Adding request headers

You can also set additional headers on the allowed request:

```go
package http

default allow = false

allow = { "allow": true, "additional_headers": { "X-JWT-Payload": payload } } {
  not input.path[0] == "forbidden"
  // Where `jwt` is the result of another rule
  payload := base64.encode(json.marshal(jwt.payload))
}
```

### Result structure
```go
type Result bool
// or
type Result struct {
  // Whether to allow or deny the incoming request
  allow bool
  // Overrides denied response status code; Optional
  status_code int
  // Sets headers on allowed request or denied response; Optional
  additional_headers map[string]string
}
```

## Related links

- [Open Policy Agent](https://www.openpolicyagent.org)
- [HTTP API example](https://www.openpolicyagent.org/docs/latest/http-api-authorization/)
- [Middleware]({{< ref middleware.md >}})
- [Configuration concept]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
