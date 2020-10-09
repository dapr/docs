---
title: "Local file (for Development)"
linkTitle: "Local file"
type: docs
---

This document shows how to enable file-based secret store using [Dapr Secrets Component](../../concepts/secrets/README.md) for Development scenarios in Standalone mode. This Dapr secret store component reads plain text JSON from a given file and does not use authentication.

> Note, this approach to secret management is not recommended for production environments.

## Create JSON file to hold the secrets

This creates new JSON file to hold the secrets.

1. Create a json file (i.e. secrets.json) with the following contents:

```json
{
    "redisPassword": "your redis passphrase"
}
```

## Use file-based secret store in Standalone mode

This section walks you through how to enable a Local secret store to store a password to access a Redis state store in Standalone mode.

1. Create a JSON file in components directory with following content. 

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

The `nestedSeparator` parameter, is not required (default value is ':') and it's used by the store when flattening the json hierarchy to a map. So given the following json:

```json
{
    "redisPassword": "your redis password",
    "connectionStrings": {
        "sql": "your sql connection string",
        "mysql": "your mysql connection string"
    }
}
```

the store will load the file and create a map with the following key value pairs:

| flattened key           | value                           |
| ---                     | ---                             |
|"redis"                  | "your redis password"           |
|"connectionStrings:sql"  | "your sql connection string"    |
|"connectionStrings:mysql"| "your mysql connection string"  |

> Use the flattened key to access the secret.

2. Use secrets in other components

To use the previously created secrets for example in a Redis state store component you can replace the `value` with `secretKeyRef` and a nested name of the key like this:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  metadata:
  - name: redisHost
    value: "[redis]:6379"
  - name: redisPassword
    secretKeyRef:
      name: redisPassword
auth:
    secretStore: local-secret-store
```

# Confirm the secrets are being used

To confirm the secrets are being used you can check the logs output by `dapr run` command. Here is the log when you run [HelloWorld sample](https://github.com/dapr/quickstarts/tree/master/hello-world) with Local Secret secret store.

```bash
$ dapr run --app-id mynode --app-port 3000 --dapr-http-port 3500 node app.js

ℹ️  Starting Dapr with id mynode on port 3500
✅  You're up and running! Both Dapr and your app logs will appear here.

...
== DAPR == time="2019-09-25T17:57:37-07:00" level=info msg="loaded component local-secret-store (secretstores.local.file)"
== APP == Node App listening on port 3000!
== DAPR == time="2019-09-25T17:57:38-07:00" level=info msg="loaded component statestore (state.redis)"
== DAPR == time="2019-09-25T17:57:38-07:00" level=info msg="loaded component messagebus (pubsub.redis)"
...
== DAPR == 2019/09/25 17:57:38 redis: connecting to [redis]:6379
== DAPR == 2019/09/25 17:57:38 redis: connected to [redis]:6379 (localAddr: x.x.x.x:62137, remAddr: x.x.x.x:6379)
...
```

## Related Links

- [Secrets Component](../../concepts/secrets/README.md)
- [Secrets API](../../reference/api/secrets_api.md)
- [Secrets API Samples](https://github.com/dapr/quickstarts/blob/master/secretstore/README.md)