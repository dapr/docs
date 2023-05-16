---
type: docs
title: "Local storage"
linkTitle: "Local storage"
description: Detailed information on the local storage cryptography component
---

## Component format

Todo: update component format to correct format for cryptography

A Dapr `crypto.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mycrypto
spec:
  type: crypto.localstorage
  metadata:
    version: v1
    - name: path
      value: fixtures/crypto/localstorage/
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| path               | Y        | Connection-string for the local storage  | `fixtures/crypto/localstorage/`

## Related links
[Cryptography building block]({{< ref cryptography >}})
