---
type: docs
title: "Local environment variables (for Development)"
linkTitle: "Local environment variables"
type: docs
---

This document shows how to enable [environment variable](https://en.wikipedia.org/wiki/Environment_variable) secret store using [Dapr Secrets Component](../../concepts/secrets/README.md) for Development scenarios in Standalone mode. This Dapr secret store component locally defined environment variable and does not use authentication.

> Note, this approach to secret management is not recommended for production environments.

## How to enable environment variable secret store

To enable environment variable secret store, create a file with the following content in your components directory:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: envvar-secret-store
  namespace: default
spec:
  type: secretstores.local.env
  metadata:
```

## How to use the environment variable secret store in other components

To use the environment variable secrets in other component you can replace the `value` with `secretKeyRef` containing the name of your local environment variable like this:

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
      name: REDIS_PASSWORD
auth:
    secretStore: envvar-secret-store
```

# How to confirm the secrets are being used

To confirm the secrets are being used you can check the logs output by `dapr run` command. Here is the log when you run [HelloWorld sample](https://github.com/dapr/quickstarts/tree/master/hello-world) with Local Secret secret store.

```bash
$ dapr run --app-id mynode --app-port 3000 --dapr-http-port 3500 node app.js

ℹ️  Starting Dapr with id mynode on port 3500
✅  You're up and running! Both Dapr and your app logs will appear here.

...
== DAPR == time="2019-09-25T17:57:37-07:00" level=info msg="loaded component envvar-secret-store (secretstores.local.env)"
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