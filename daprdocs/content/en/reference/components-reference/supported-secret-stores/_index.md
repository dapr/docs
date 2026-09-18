---
type: docs
title: "Secret store component specs"
linkTitle: "Secret stores"
weight: 9000
description: The supported secret stores that interface with Dapr
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/"
no_list: true
---

The following table lists secret stores supported by the Dapr secrets building block. [Learn how to set up different secret stores for Dapr secrets management.]({{% ref setup-secret-store.md %}})

{{< partial "components/description.html" >}}

{{< partial "components/secret-stores.html" >}}

## Multiple key-values per secret

The **Multiple Key-Values Per Secret** column in the tables above indicates whether the secret store can return multiple key-value pairs from a single secret.

When a secret store supports multiple key-values per secret (✅), retrieving a secret returns a JSON object with the keys stored in that secret as fields. The secret name is not part of the response. For example, retrieving the `db-secret` secret from a Kubernetes secret store returns:

```json
{
  "key1": "value1",
  "key2": "value2"
}
```

When a secret store does not support multiple key-values per secret (empty box), the secret store has name/value semantics: retrieving a secret returns a JSON object with a single field, where the field name is the secret name and the value is the secret value. For example, retrieving the same `db-secret` secret returns:

```json
{
  "db-secret": "value1"
}
```

Some secret stores let you choose between the two behaviors through a component metadata field, such as `multipleKeyValuesPerSecret` for [AWS Secrets Manager]({{% ref aws-secret-manager.md %}}), `multiValued` for the [local file secret store]({{% ref file-secret-store.md %}}), and `vaultValueType` for [HashiCorp Vault]({{% ref hashicorp-vault.md %}}). See the [secrets API reference]({{% ref "secrets_api.md#response-body" %}}) for more details on the response format.
