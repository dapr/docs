---
type: docs
title: 'OpenBao'
linkTitle: 'OpenBao'
description: 'Detailed information on the OpenBao secret store component.'
aliases:
  - '/operations/components/setup-secret-store/supported-secret-stores/openbao/'
---

## Usage

Currently, there is no dedicated OpenBao Secrets Store. However, you can utilize
the `secretstores.hashicorp.vault` component, which has been tested and
confirmed to work effectively.

For instructions on how to set up and configure a secret store, refer to [the
HashiCorp Vault guide]({{% ref "hashicorp-vault.md" %}}). The same metadata
fields are compatible with OpenBao.

## Example Component

```
---
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: openbao
spec:
  # Use the secrets store provider
  # from vault
  type: secretstores.hashicorp.vault
  version: v1
  metadata:
    - name: vaultAddr
      value: http://openbao.openbao.svc.cluster.local:8200
    - name: skipVerify # Optional. Default: false
      value: true
    - name: vaultToken
      secretKeyRef:
        name: roottoken
        key: token
    - name: enginePath # Optional. default: "secret"
      value: "secrets"
    - name: vaultValueType # Optional. default: "map"
      value: "map"
```

## Further Information

- [OpenBao Website](https://openbao.org)
- [OpenBao Docs](https://openbao.org/docs)
