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
| multiValued        | N        | `"true"` sets the `multipleKeyValuesPerSecret` behavior. Allows one level of multi-valued key/value pairs before flattening JSON hierarchy. Defaults to `"false"` | `"true"` |

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

The flag `multiValued` determines whether the secret store presents a [name/value behavior or a multiple key-value per secret behavior]({{< ref "secrets_api.md#response-body" >}}).

### Name/Value semantics


If `multiValued` is `false`, the store loads [the JSON file]({{< ref "#setup-json-file-to-hold-the-secrets" >}}) and create a map with the following key-value pairs:

| flattened key           | value                           |
| ---                     | ---                             |
|"redisPassword"          | `"your redis password"`           |
|"connectionStrings:sql"  | `"your sql connection string"`    |
|"connectionStrings:mysql"| `"your mysql connection string"`  |


If the `multiValued` setting set to true, invoking a `GET` request on the key `connectionStrings` results in a 500 HTTP response and an error message. For example:

```shell
$ curl http://localhost:3501/v1.0/secrets/local-secret-store/connectionStrings
```
```json
{
  "errorCode": "ERR_SECRET_GET",
  "message": "failed getting secret with key connectionStrings from secret store local-secret-store: secret connectionStrings not found"
}
```

This error is expected, since the `connectionStrings` key is not present, per the table above.

However, requesting for flattened key `connectionStrings:sql` would result in a successful response, with the following:

```shell
$ curl http://localhost:3501/v1.0/secrets/local-secret-store/connectionStrings:sql
```
```json
{
  "connectionStrings:sql": "your sql connection string"
}
```

### Multiple key-values behavior

If `multiValued` is `true`, the secret store enables multiple key-value per secret behavior:
- Nested structures after the top level will be flattened.
- It parses the [same JSON file]({{< ref "#setup-json-file-to-hold-the-secrets" >}}) into this table:

| key                | value                           |
| ---                | ---                             |
|"redisPassword"     | `"your redis password"`           |
|"connectionStrings" | `{"mysql":"your mysql connection string","sql":"your sql connection string"}`    |

Notice that in the above table:
- `connectionStrings` is now a JSON object with two keys: `mysql` and `sql`. 
- The `connectionStrings:sql` and `connectionStrings:mysql` flattened keys from the [table mapped for name/value semantics]({{< ref "#namevalue-semantics" >}}) are missing.

Invoking a `GET` request on the key `connectionStrings` now results in a successful HTTP response similar to the following:

```shell
$ curl http://localhost:3501/v1.0/secrets/local-secret-store/connectionStrings
```
```json
{
  "sql": "your sql connection string",
  "mysql": "your mysql connection string"
}
```

Meanwhile, requesting for the flattened key `connectionStrings:sql` would now return a 500 HTTP error response with the following:

```json
{
  "errorCode": "ERR_SECRET_GET",
  "message": "failed getting secret with key connectionStrings:sql from secret store local-secret-store: secret connectionStrings:sql not found"
}
```


#### Handling deeper nesting levels

Notice that, as stated in the [spec metadata fields table](#spec-metadata-fields), `multiValued` only handles a single nesting level.

Let's say you have a local file secret store with `multiValued` enabled, pointing to a `secretsFile` with the following JSON content:

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
The contents of key `mysql` under `connectionStrings` has a nesting level greater than 1 and would be flattened.

Here is how it would look in memory:

| key                | value                           |
| ---                | ---                             |
|"redisPassword"     | `"your redis password"`           |
|"connectionStrings" | `{ "mysql:username": "your mysql username", "mysql:password": "your mysql password" }`    |


Once again, requesting for key `connectionStrings` results in a successful HTTP response but its contents, as shown in the table above, would be flattened:

```shell
$ curl http://localhost:3501/v1.0/secrets/local-secret-store/connectionStrings
```
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
