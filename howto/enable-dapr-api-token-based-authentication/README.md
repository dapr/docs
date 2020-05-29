# Enable Dapr APIs token-based authentication

By default, Dapr relies on the network boundary to limit access to its public API. If your use-case requires additional level of security, you can enable JWT token-based authentication for Dapr APIs which will cause Dapr to inspect every incoming gRPC and HTTP request to its public APIs for presence of authentication token, before allowing the request to pass through. 

## Creation of JWT token

To configure Dapr APIs authentication, start by generating your token using any [JWT token](https://jwt.io/) compatible tool (e.g. https://jwt.io/). During that process you will need to provide a secret. That secret necessary to generate a token and Dapr doesn't need to know about it.

## Configure API token authentication in Dapr

The token authentication configuration is slightly different for either Kubernetes or Self-hosted Dapr deployments, so let's consider them individually: 
 
### Self-hosted 

In self-hosting scenario, Dapr looks for the presence of `DAPR_API_TOKEN` environment variable. If that environment variable is set while `daprd` process launches, Dapr will secure its public APIs: 

```shell
export DAPR_API_TOKEN=<JWT-TOKEN>
```

To rotate the configured token, simply set the `DAPR_API_TOKEN` environment variable to the new value and restart the `daprd` process. 

### Kubernetes  

In Kubernetes deployment, Dapr leverages the Kubernetes secret to hold the JWT token. To configure Dapr APIs authentication start by creating a new secret:

```shell
kubectl create secret generic dapr-api-token --from-literal=token=<JWT-TOKEN> 
```

> Note, the above secret needs to be created in each namespace in which you want to enable Dapr token authentication 

And to indicate to Dapr that it needs to secure its public APIs add an annotation to your Deployment template spec. The Dapr sidecar injector will then automatically create a secret reference and inject the actual value into `DAPR_API_TOKEN` environment variable.

```yaml
annotations: 
  dapr.io/enabled: "true" 
  dapr.io/api-token-secret: "dapr-api-token" # name of the Kubernetes secret
```

To rotate the configured token simply update the Kubernates secret with the new token in each namespace. Note, the `kubectl` CLI does not allow updates so Kubernates secret so your new JWT token will have to define it in a manifest:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dapr-api-token
  namespace: <namespace-name>
type: Opaque
data:
  token: <your-new-token>
```

And then apply it:

```shell
kubectl apply -f token-secret.yaml 
```

To cause Dapr to start using the new token trigger a rolling upgrade to each one of your deployments: 

```shell
kubectl rollout restart deployment/<your-deployment-name> 
```

> Note, assuming your service is configured with more than one replica, the key rotation process does not result in any downtime. 
 
## Adding JWT token to client API invocations 

Once token authentication is configured in Dapr, the clients invoking its API will have to append the JWT token to each request.

### HTTP

In case of HTTP, Dapr inspect the incoming request for presence of HTTP header:

```shell
dapr-api-token: <token>
```

### gRPC

Then using the gRPC protocol, Dapr will inspect an incoming call for the API token on the gRPC metadata for the following value:

```shell
dapr-api-token[0].
```