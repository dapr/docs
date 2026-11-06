---
type: docs
title: "Authenticate requests from Dapr using token authentication"
linkTitle: "App API token authentication"
weight: 4000
description: "Require every incoming API request from Dapr to include an authentication token"
---

For some building blocks such as pub/sub, service invocation and input bindings, Dapr communicates with an app over HTTP or gRPC.
To enable the application to authenticate requests that are arriving from the Dapr sidecar, you can configure Dapr to send an API token as a header (in HTTP requests) or metadata (in gRPC requests).

## Create a token

Dapr uses shared tokens for API authentication. You are free to define the API token to use.

Although Dapr does not impose any format for the shared token, a good idea is to generate a random byte sequence and encode it to Base64. For example, this command generates a random 32-byte key and encodes that as Base64:

```sh
openssl rand 16 | base64
```

## Configure app API token authentication in Dapr

The token authentication configuration is slightly different for either Kubernetes or self-hosted Dapr deployments:

### Self-hosted

In self-hosting scenario, Dapr looks for the presence of `APP_API_TOKEN` environment variable. If that environment variable is set when the `daprd` process launches, Dapr includes the token when calling an app:

```shell
export APP_API_TOKEN=<token>
```

By default, Dapr sends this token in the `dapr-api-token` HTTP header or gRPC metadata key. To use a custom name instead, set `DAPR_APP_API_TOKEN_HEADER` when `daprd` launches:

```shell
export DAPR_APP_API_TOKEN_HEADER=<custom-name>
```

The custom name replaces `dapr-api-token`; Dapr does not send both names. If `DAPR_APP_API_TOKEN_HEADER` is unset or empty, Dapr uses `dapr-api-token`. Setting only the custom name without setting `APP_API_TOKEN` does not cause Dapr to send either header or metadata key.

To rotate the configured token or change its header or metadata name, update the environment variable and restart the `daprd` process.

### Kubernetes

In a Kubernetes deployment, Dapr leverages Kubernetes secrets store to hold the shared token. To start, create a new secret:

```shell
kubectl create secret generic app-api-token --from-literal=token=<token>
```

> Note, the above secret needs to be created in each namespace in which you want to enable app token authentication

To indicate to Dapr to use the token in the secret when sending requests to the app, add an annotation to your Deployment template spec:

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-token-secret: "app-api-token" # name of the Kubernetes secret
  dapr.io/app-token-header: "x-api-key" # optional custom HTTP header or gRPC metadata name
```

When deployed, the Dapr Sidecar Injector automatically creates a secret reference and injects the actual value into the `APP_API_TOKEN` environment variable. If `dapr.io/app-token-header` is present, the injector also sets `DAPR_APP_API_TOKEN_HEADER` on the sidecar. The custom name replaces the default `dapr-api-token` name.

## Rotate a token

### Self-hosted

To rotate the configured token in self-hosted, update the `APP_API_TOKEN` environment variable to the new value and restart the `daprd` process.

### Kubernetes

To rotate the configured token in Kubernetes, update the previously-created secret with the new token in each namespace. You can do that using `kubectl patch` command, but a simpler way to update these in each namespace is by using a manifest:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-api-token
type: Opaque
data:
  token: <your-new-token>
```

And then apply it to each namespace:

```shell
kubectl apply --file token-secret.yaml --namespace <namespace-name>
```

To tell Dapr to start using the new token, trigger a rolling upgrade to each one of your deployments:

```shell
kubectl rollout restart deployment/<deployment-name> --namespace <namespace-name>
```

> Assuming your service is configured with more than one replica, the key rotation process does not result in any downtime.

## Authenticating requests from Dapr

Once app token authentication is configured using the environment variable or Kubernetes secret `app-api-token`, the Dapr sidecar includes the token in calls to the app. The default HTTP header or gRPC metadata name is `dapr-api-token`. If you configure `DAPR_APP_API_TOKEN_HEADER` or `dapr.io/app-token-header`, authenticate using that name instead.

<img src="/images/tokens-auth.png" width=800 style="padding-bottom:15px;">

### HTTP

In your code, look for the HTTP header `dapr-api-token` in incoming requests:

```text
dapr-api-token: <token>
```

If you configured a custom name such as `x-api-key`, look for only that header:

```text
x-api-key: <token>
```

### gRPC

When using gRPC protocol, inspect the incoming calls for the API token on the gRPC metadata:

```text
dapr-api-token[0].
```

If you configured a custom name, inspect the corresponding gRPC metadata key instead.

## Accessing the token from the app

### Kubernetes

In Kubernetes, it's recommended to mount the secret to your pod as an environment variable.
Assuming we created a secret with the name `app-api-token` to hold the token:

```yaml
containers:
  - name: mycontainer
    image: myregistry/myapp
    envFrom:
    - secretRef:
      name: app-api-token
```

### Self-hosted

In self-hosted mode, you can set the token as an environment variable for your app:

```sh
export APP_API_TOKEN=<my-app-token>
```

## Related Links

- Learn about [Dapr security concepts]({{% ref security-concept.md %}})
- Learn [HowTo Enable API token authentication in Dapr]({{% ref api-token.md %}})
