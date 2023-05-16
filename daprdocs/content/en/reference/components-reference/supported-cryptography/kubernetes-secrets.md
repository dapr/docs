---
type: docs
title: "Kubernetes Secrets"
linkTitle: "Kubernetes Secrets"
description: Detailed information on the Kubernetes secret cryptography component
---

## Component format

Todo: update component format to correct format for cryptography

A Dapr `crypto.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: crypto.<TYPE>
  version: v1.0-alpha1
  metadata:
  - name: <NAME>
    value: <VALUE>
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
|           |        |   | 

## Related links
[Cryptography building block]({{< ref cryptography >}})