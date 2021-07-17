---
type: docs
title: "Enable API token authentication in Dapr"
linkTitle: "Dapr API token authentication"
weight: 3000
description: "Require every incoming API request for Dapr to include an authentication token before allowing that request to pass through"
---

By default, Dapr relies on the network boundary to limit access to its public API. If you plan on exposing the Dapr API outside of that boundary, or if your deployment demands an additional level of security, consider enabling the token authentication for Dapr APIs. This will cause Dapr to require every incoming gRPC and HTTP request for its APIs for to include authentication token, before allowing that request to pass through.

## Create a token

Dapr uses [JWT](https://jwt.io/) tokens for API authentication.

> Note, while Dapr itself is actually not the JWT token issuer in this implementation, being explicit about the use of JWT standard enables federated implementations in the future (e.g. OAuth2).

To configure API authentication, start by generating your token using any JWT token compatible tool (e.g. https://jwt.io/) and your secret.

> Note, that secret is only necessary to generate the token, and Dapr doesn't need to know about or store it

## Configure API token authentication in Dapr

The token authentication configuration is slightly different for either Kubernetes or self-hosted Dapr deployments:

### Self-hosted

In self-hosting scenario, Dapr looks for the presence of `DAPR_API_TOKEN` environment variable. If that environment variable is set while `daprd` process launches, Dapr will enforce authentication on its public APIs:

```shell
export DAPR_API_TOKEN=<token>
```

To rotate the configured token, simply set the `DAPR_API_TOKEN` environment variable to the new value and restart the `daprd` process.

### Kubernetes

In Kubernetes deployment, Dapr leverages Kubernetes secrets store to hold the JWT token. To configure Dapr APIs authentication start by creating a new secret:

```shell
kubectl create secret generic dapr-api-token --from-literal=token=<token>
```

> Note, the above secret needs to be created in each namespace in which you want to enable Dapr token authentication

To indicate to Dapr to use that secret to secure its public APIs, add an annotation to your Deployment template spec:

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/api-token-secret: "dapr-api-token" # name of the Kubernetes secret
```

When deployed, Dapr sidecar injector will automatically create a secret reference and inject the actual value into `DAPR_API_TOKEN` environment variable.

## Rotate a token

### Self-hosted

To rotate the configured token in self-hosted, simply set the `DAPR_API_TOKEN` environment variable to the new value and restart the `daprd` process.

### Kubernetes

To rotate the configured token in Kubernates, update the previously created secret with the new token in each namespace. You can do that using `kubectl patch` command, but the easiest way to update these in each namespace is by using manifest:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dapr-api-token
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

> Note, assuming your service is configured with more than one replica, the key rotation process does not result in any downtime.


## Adding JWT token to client API invocations

Once token authentication is configured in Dapr, all clients invoking Dapr API will have to append the JWT token to every request:

### HTTP

In case of HTTP, Dapr inspect the incoming request for presence of `dapr-api-token` parameter in HTTP header:

```shell
dapr-api-token: <token>
```

### gRPC

When using gRPC protocol, Dapr will inspect the incoming calls for the API token on the gRPC metadata:

```shell
dapr-api-token[0].
```

## Accessing the token from the app

### Kubernetes

In Kubernetes, it's recommended to mount the secret to your pod as an environment variable, as shown in the example below, where a Kubernetes secret with the name `dapr-api-token` is used to hold the token.

```
containers:
  - name: mycontainer
    image: myregistry/myapp
    envFrom:
    - secretRef:
      name: dapr-api-token
```

### Self-hosted

In self-hosted mode, you can set the token as an environment variable for your app:

```
export DAPR_API_TOKEN=<my-dapr-token>
```

## Related Links

- Learn about [Dapr security concepts]({{< ref security-concept.md >}})
- Learn [HowTo authenticate requests from Dapr using token authentication]({{< ref app-api-token.md >}})
