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
```

## Spec metadata fields

| Field              | Required | Details                                                                 | Example                  |
|--------------------|:--------:|-------------------------------------------------------------------------|--------------------------|
| secretsFile        | Y        | The path to the file where secrets are stored   | `"path/to/file.json"` |
| nestedSeparator    | N        | Used by the store when flattening the JSON hierarchy to a map. Defaults to `":"` | `":"` |

## Setup JSON file to hold the secrets

Given the following json:

```json
{
    "redisPassword": "your redis password",
    "connectionStrings": {
        "sql": "your sql connection string",
        "mysql": "your mysql connection string"
    }
}
```

The store will load the file and create a map with the following key value pairs:

| flattened key           | value                           |
| ---                     | ---                             |
|"redis"                  | "your redis password"           |
|"connectionStrings:sql"  | "your sql connection string"    |
|"connectionStrings:mysql"| "your mysql connection string"  |

Use the flattened key (`connectionStrings:sql`) to access the secret.

## Related links
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
