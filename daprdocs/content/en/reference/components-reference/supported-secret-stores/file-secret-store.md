---
type: docs
title: "Local file (for Development)"
linkTitle: "Local file"
description: Detailed information on the local file secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/file-secret-store/"
---

This Dapr secret store component reads plain text JSON from a given file and does not use authentication.

{{% alert title="Warning" color="warning" %}}
This approach to secret management is not recommended for production environments.
{{% /alert %}}

## Component format

To setup local file based secret store create a component of type `secretstores.local.file`. Create a file with the following content in your `./components` directory:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: local-secret-store
  namespace: default
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: [path to the JSON file]
  - name: nestedSeparator
    value: ":"
  - name: multiValued
    value: "false"
```

## Spec metadata fields

| Field              | Required | Details                                                                 | Example                  |
|--------------------|:--------:|-------------------------------------------------------------------------|--------------------------|
| secretsFile        | Y        | The path to the file where secrets are stored   | `"path/to/file.json"` |
| nestedSeparator    | N        | Used by the store when flattening the JSON hierarchy to a map. Defaults to `":"` | `":"` 
| multiValued        | N        | Allows one level of multi-valued key/value pairs before flattening JSON hierarchy. Defaults to `"false"` | `"true"` |

## Setup JSON file to hold the secrets

Given the following JSON loaded from `secretsFile`:

```json
{
    "redisPassword": "your redis password",
    "connectionStrings": {
        "sql": "your sql connection string",
        "mysql": "your mysql connection string"
    }
}
```

If `multiValued` is `"false"`, the store will load the file and create a map with the following key value pairs:

| flattened key           | value                           |
| ---                     | ---                             |
|"redis"                  | "your redis password"           |
|"connectionStrings:sql"  | "your sql connection string"    |
|"connectionStrings:mysql"| "your mysql connection string"  |

Use the flattened key (`connectionStrings:sql`) to access the secret. The following JSON map returned:

```json
{
  "connectionStrings:sql": "your sql connection string"
}
```

If `multiValued` is `"true"`, you would instead use the top level key. In this example, `connectionStrings` would return the following map:

```json
{
  "sql": "your sql connection string",
  "mysql": "your mysql connection string"
}
```

Nested structures after the top level will be flattened. In this example, `connectionStrings` would return the following map:

JSON from `secretsFile`:

```json
{
    "redisPassword": "your redis password",
    "connectionStrings": {
        "mysql": {
          "username": "your mysql username",
          "password": "your mysql password"
        }
    }
}
```

Response:

```json
{
  "mysql:username": "your mysql username",
  "mysql:password": "your mysql password"
}
```

This is useful in order to mimic secret stores like Vault or Kubernetes that return multiple key/value pairs per secret key.

## Related links
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
