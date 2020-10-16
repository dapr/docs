---
type: docs
title: "Local file (for Development)"
linkTitle: "Local file"
weight: 20
---

This Dapr secret store component reads plain text JSON from a given file and does not use authentication.

## Setup JSON file to hold the secrets

1. Create a JSON file (i.e. `secrets.json`) with the following contents:
    
    ```json
    {
        "redisPassword": "your redis passphrase"
    }
    ```

2. Save this file to your `./components` directory or a secure location in your filesystem

## Configure Dapr component

Create a Dapr component file (ex. `localSecretStore.yaml`) with following content:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: local-secret-store
  namespace: default
spec:
  type: secretstores.local.file
  metadata:
  - name: secretsFile
    value: [path to the JSON file]
  - name: nestedSeparator
    value: ":"
```

The `nestedSeparator` parameter is optional (default value is ':'). It is used by the store when flattening the json hierarchy to a map. 

## Example

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
- [How-To: Retreive a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})