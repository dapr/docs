# Local secret store (for Development)

This document shows how to enable Local secret store using [Dapr Secrets Component](../../concepts/secrets/README.md) for Development scenarios in Standalone mode. This Dapr secret store component reads plain text JSON from a given file and does not use authentication.

> The Local secret store is in no way recommended for production environments.

## Contents

- [Create JSON file to hold the secrets](#create-json-file-to-hold-the-secrets)
- [Use Local secret store in Standalone mode](#use-local-secret-store-in-standalone-mode)
- [References](#references)

## Create JSON file to hold the secrets

This creates new JSON file to hold the secrets.

1. Create a json file (i.e. secrets.json) with the following contents:

```json
{
    "redisPassword": "your redis passphrase"
}
```

## Use Local secret store in Standalone mode

This section walks you through how to enable an Local secret store to store a password to access a Redis state store in Standalone mode.

1. Create a file called localsecretstore.yaml in the components directory

Now create a Dapr localsecretstore component. Create a file called localsecretstore.yaml and add it to your components directory with the following content

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localsecretstore
  namespace: default
spec:
  type: secretstores.local.localsecretstore
  metadata:
  - name: secretsFile
    value: [path to the secrets.json you created in the previous section]
  - name: nestedSeparator
    value: ":"
```

2. Create redis.yaml in the components directory with the content below

Create a statestore component file. This Redis component yaml shows how to use the `redisPassword` secret stored in a Local secret store called localsecretstore as a Redis connection password.

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
      key: redisPassword
auth:
    secretStore: localsecretstore
```

3. Run your app

You can check that `secretstores.local.localsecretstore` component is loaded and redis server connects successfully by looking at the log output when using the dapr `run` command.

Here is the log when you run [HelloWorld sample](https://github.com/dapr/samples/tree/master/1.hello-world) with Local Secret secret store.

```bash
$ dapr run --app-id mynode --app-port 3000 --port 3500 node app.js

ℹ️  Starting Dapr with id mynode on port 3500
✅  You're up and running! Both Dapr and your app logs will appear here.

...
== DAPR == time="2019-09-25T17:57:37-07:00" level=info msg="loaded component localsecretstore (secretstores.local.localsecretstore)"
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
- [Secrets API Samples](https://github.com/dapr/samples/blob/master/9.secretstore/README.md)