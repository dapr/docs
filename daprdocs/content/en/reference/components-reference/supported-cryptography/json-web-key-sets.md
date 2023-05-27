---
type: docs
title: "JSON Web Key Sets (JWKS)"
linkTitle: "JSON Web Key Sets (JWKS)"
description: Detailed information on the JWKS cryptography component
---

## Component format

The purpose of this component is to load keys from a JSON Web Key Set ([RFC 7517](https://www.rfc-editor.org/rfc/rfc7517)). These are JSON documents that contain 1 or more keys as JWK (JSON Web Key); they can be public, private, or shared keys.

This component supports loading a JWKS:

- From a local file; in this case, Dapr watches for changes to the file on disk and reloads it automatically.
- From a HTTP(S) URL, which is periodically refreshed.
- By passing the actual JWKS in the `jwks` metadata property, as a string (optionally, base64-encoded).

{{% alert title="Note" color="primary" %}}
This component uses the cryptographic engine in Dapr to perform operations. Although keys are never exposed to your application, Dapr has access to the raw key material.

{{% /alert %}}

A Dapr `crypto.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: jwks
spec:
  type: crypto.jwks
  version: v1
  metadata:
    # Example 1: load JWKS from file
    - name: "jwks"
      value: "fixtures/crypto/jwks/jwks.json"
    # Example 2: load JWKS from a HTTP(S) URL
    # Only "jwks" is required
    - name: "jwks"
      value: "https://example.com/.well-known/jwks.json"
    - name: "requestTimeout"
      value: "30s"
    - name: "minRefreshInterval"
      value: "10m"
    # Option 3: include the actual JWKS
    - name: "jwks"
      value: |
        {
          "keys": [
            {
              "kty": "RSA",
              "use": "sig",
              "kid": "…",
              "n": "…",
              "e": "…",
              "issuer": "https://example.com"
            }
          ]
        }
    # Option 3b: include the JWKS base64-encoded
    - name: "jwks"
      value: |
        eyJrZXlzIjpbeyJ…
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| jwks               | Y        | Connection-string for the JWKS host  | `fixtures/crypto/jwks/jwks.json`
| requestTimeout     | N        | Amount of time before request timeout; Default: 30 seconds  | `30`
| minRefreshInterval | N        | Minimum interval for request refresh; Default: 10 minutes  | `10`

## Related links
[Cryptography building block]({{< ref cryptography >}})