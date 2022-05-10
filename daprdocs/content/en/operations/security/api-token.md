---
type: docs
title: "Enable API token authentication in Dapr"
linkTitle: "Dapr API token authentication"
weight: 3000
description: "Require every incoming API request for Dapr to include an authentication token before allowing that request to pass through"
---

By default, Dapr relies on the network boundary to limit access to its public API. If you plan on exposing the Dapr API outside of that boundary, or if your deployment demands an additional level of security, consider enabling the token authentication for Dapr APIs. This will cause Dapr to require every incoming gRPC and HTTP request for its APIs for to include authentication token, before allowing that request to pass through.

## Create a token

Dapr uses shared tokens for API authentication. You are free to define the API token to use.

Although Dapr does not impose any format for the shared token, a good idea is to generate a random byte sequence and encode it to Base64. For example, this command generates a random 32-byte key and encodes that as Base64:

```sh
openssl rand 16 | base64
```

## Configure API token authentication in Dapr

The token authentication configuration is slightly different for either Kubernetes or self-hosted Dapr deployments:

### Self-hosted

In self-hosting scenario, Dapr looks for the presence of `DAPR_API_TOKEN` environment variable. If that environment variable is set when the `daprd` process launches, Dapr enforces authentication on its public APIs:

```shell
export DAPR_API_TOKEN=<token>
```

To rotate the configured token, update the `DAPR_API_TOKEN` environment variable to the new value and restart the `daprd` process.

### Kubernetes

In a Kubernetes deployment, Dapr leverages Kubernetes secrets store to hold the shared token. To configure Dapr APIs authentication, start by creating a new secret:

```shell
kubectl create secret generic dapr-api-token --from-literal=token=<token>
```

> Note, the above secret needs to be created in each namespace in which you want to enable Dapr token authentication.

To indicate to Dapr to use that secret to secure its public APIs, add an annotation to your Deployment template spec:

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/api-token-secret: "dapr-api-token" # name of the Kubernetes secret
```

When deployed, Dapr sidecar injector will automatically create a secret reference and inject the actual value into `DAPR_API_TOKEN` environment variable.

## Rotate a token

### Self-hosted

To rotate the configured token in self-hosted, update the `DAPR_API_TOKEN` environment variable to the new value and restart the `daprd` process.

### Kubernetes

To rotate the configured token in Kubernates, update the previously-created secret with the new token in each namespace. You can do that using `kubectl patch` command, but a simpler way to update these in each namespace is by using a manifest:

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

> Assuming your service is configured with more than one replica, the key rotation process does not result in any downtime.

## Adding API token to client API invocations

Once token authentication is configured in Dapr, all clients invoking Dapr API will have to append the API token token to every request:

### HTTP

In case of HTTP, Dapr requires the API token in the `dapr-api-token` header. For example:

```text
GET http://<daprAddress>/v1.0/metadata
dapr-api-token: <token>
```

Using curl, you can pass the header using the `--header` (or `-H`) option. For example:

```sh
curl http://localhost:3500/v1.0/metadata \
  --header "dapr-api-token: my-token"
```

### gRPC

When using gRPC protocol, Dapr will inspect the incoming calls for the API token on the gRPC metadata:

```text
dapr-api-token[0].
```

## Accessing the token from the app

### Kubernetes

In Kubernetes, it's recommended to mount the secret to your pod as an environment variable, as shown in the example below, where a Kubernetes secret with the name `dapr-api-token` is used to hold the token.

```yaml
containers:
  - name: mycontainer
    image: myregistry/myapp
    envFrom:
    - secretRef:
      name: dapr-api-token
```

### Self-hosted

In self-hosted mode, you can set the token as an environment variable for your app:

```sh
export DAPR_API_TOKEN=<my-dapr-token>
```

## Related Links

- Learn about [Dapr security concepts]({{< ref security-concept.md >}})
- Learn [HowTo authenticate requests from Dapr using token authentication]({{< ref app-api-token.md >}})
