---
type: docs
title: "JSON Web Key Sets (JWKS)"
linkTitle: "JSON Web Key Sets (JWKS)"
description: Detailed information on the JWKS cryptography component
---

## Component format

Todo: update component format to correct format for cryptography

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
    - name: jwks
      value: fixtures/crypto/jwks/jwks.json
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