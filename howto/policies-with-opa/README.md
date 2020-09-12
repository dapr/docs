# Apply Open Policy Agent Polices

The Dapr Open Policy Agent (OPA) [middleware](https://github.com/dapr/docs/blob/master/concepts/middleware/README.md) allows applying [OPA Policies](https://www.openpolicyagent.org/docs/latest/http-api-authorization/) to Dapr requests. This can be used to apply reusable authorization policies to app endpoints. 

## Middleware Component Definition
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: my-policy
  namespace: default
spec:
  type: middleware.http.opa
  metadata:
    # `includedHeaders` is a comma-seperated set of case-insensitive headers to include in the request input.
    # By default, request headers are not passed to the policy. To use an incoming header to make an authz decision, you must include it.
    # includedHeaders: "x-my-custom-header, x-jwt-header"

    # `defaultStatus` is the status code to return for denied responses if not specified in the `allow` result.
    # defaultStatus: 403

    # `rego` is the open policy agent policy to evaluate. required
    # The policy package must be http and the policy must set data.http.allow
    rego: |
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