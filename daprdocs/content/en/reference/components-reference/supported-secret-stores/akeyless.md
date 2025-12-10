---
type: docs
title: "Akeyless"
linkTitle: "Akeyless"
description: Information about the Akeyless secret store component configuration.
---

## Create the Akeyless component

To setup Akeyless secret store create a component of type `secretstores.akeyless`. See [this guide]({{% ref "setup-secret-store.md#apply-the-configuration" %}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{% ref component-secrets.md %}}) to retrieve and use the secret with Dapr components.


## Component Format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: akeyless
spec:
  type: secretstores.akeyless
  version: v1
  metadata:
  - name: gatewayUrl
    value: "http://gw.akeyless.svc.cluster.local/api/v2"
  - name: gatewayTLSCA
    value: "LS0tLS1CRUdJTi..."
  - name: accessId
    value: "p-abcdefg1234am"
  - name: accessKey
    value: "abcd/1234="
  - name: jwt
    value: "ZXlKa..."
  - name: k8sAuthConfigName
    value: aks-cluster-1-auth-conf
  - name: k8sServiceAccountToken
    value: "Z1234ch/sasw1..."
```

## Spec metadata fields

| Field              | Required | Details                                                                 | Example             |
|--------------------|:--------:|-------------------------------------------------------------------------|---------------------|
| `gatewayUrl`       | N        | The Akeyless Gateway API URL. Defaults to https://api.akeyless.io.                                           | `http://gw.akeyless.svc.cluster.local:8000/api/v2` |
| `gatewayTLSCA` | No | The `base64`-encoded PEM certificate of the Akeyless Gateway. Use this when connecting to a gateway with a self-signed or custom CA certificate. | `LS0tLS1CRUdJTi...` |
| `accessID`         | Y        | The Akeyless Access ID of the authentication method                    | `p-1234567890am`    |
| `accessKey`        | N        | Fill in when using an API Key (`access_key`) authentication method.              | `ABCD1233...=`    |
| `jwt`              | N        | Fill in a `base64`-encoded string of the JWT when using OAuth2.0/JWT (`jwt`) authentication method                | `base64 -i "eyJ..."`          |
| `k8sAuthConfigName`| N        | Fill in when using Kubernetes Authentication (`k8s`) authentication method     | `my-k8s-auth-conf`                |
| `k8sGatewayUrl`    | N        | Fill in when using Kubernetes Authentication (`k8s`) authentication method. If not filled in, will default to value set for `akeylessGWApiURL`. | `http://gw.akeyless.svc.cluster.local:8000` |
| `k8sServiceAccountToken`  | N        |  Fill in a `base64`-encoded string of the JWT when using Kubernetes Authentication (`k8s`) authentication method. If not filled in, will read from k8s token in container filesystem | ``base64 -i "eyJ..."`` |


## Authentication Methods

The following authentication methods are supported:

### [API Key](https://docs.akeyless.io/docs/api-key)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: akeyless
spec:
  type: secretstores.akeyless
  version: v1
  metadata:
  - name: gatewayUrl
    value: "https://api.akeyless.io"
  - name: accessId
    value: "p-123..."
  - name: accessKey
    value: "ABCD1233...="
```

### [AWS IAM](https://docs.akeyless.io/docs/aws-iam)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: akeyless
spec:
  type: secretstores.akeyless
  version: v1
  metadata:
  - name: gatewayUrl
    value: "https://api.akeyless.io"
  - name: accessId
    value: "p-123..."
```

### [OAuth2.0/JWT](https://docs.akeyless.io/docs/oauth20jwt)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: akeyless
spec:
  type: secretstores.akeyless
  version: v1
  metadata:
  - name: gatewayUrl
    value: "https://api.akeyless.io"
  - name: accessId
    value: "p-123..."
  - name: jwt
    value: "base64 encoded JWT"
```

### [Kubernetes](https://docs.akeyless.io/docs/kubernetes-auth)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: akeyless
spec:
  type: secretstores.akeyless
  version: v1
  metadata:
  - name: gatewayUrl
    value: "http://release-gw.akeyless.svc.cluster.local:8000/api/v2"
  - name: accessID
    value: "p-123..."
  - name: k8sAuthConfigName
    value: "my-k8s-auth-config"
  - name: k8sGatewayUrl
    value: "http://release-gw.akeyless.svc.cluster.local:8000"
  - name: k8sServiceAccountToken
    value: "eyJ..."
```

{{% alert title="Warning" color="warning" %}}
The above examples use secrets as plain strings. It is recommended to use a local secret store such as [Kubernetes secret store]({{% ref kubernetes-secret-store.md %}}) or a [local file]({{% ref file-secret-store.md %}}) to bootstrap secure key storage.
{{% /alert %}}


## Retrieve secrets

Once configured, you can retrieve secrets using the Dapr secrets API:

```bash
# Get a single secret
curl http://localhost:3500/v1.0/secrets/akeyless/my-secret

# Get all secrets (static, dynamic, rotated) from root (/) path
curl http://localhost:3500/v1.0/secrets/akeyless/bulk

# Get all secrets static secrets
curl http://localhost:3500/v1.0/secrets/akeyless/bulk?metadata.secrets_type=static

# Get all static and dynamic secrets from a specific path (/my/org)
curl http://localhost:3500/v1.0/secrets/akeyless/bulk?metadata.secrets_type=static,dynamic&metadata.path=/my/org
```

### Language Tab: Golang
Or using the Dapr SDK. The example below retrieves all static secrets from path `/path/to/department`:

```go
log.Println("Starting test application")
	client, err := dapr.NewClient()
	if err != nil {
		log.Printf("Error creating Dapr client: %v\n", err)
		panic(err)
	}
	log.Println("Dapr client created successfully")
	const daprSecretStore = "akeyless"

	defer client.Close()
	ctx := context.Background()
	akeylessBulkMetadata := map[string]string{
		"path":         "/path/to/department",
		"secrets_type": "static",
	}
	secrets, err := client.GetBulkSecret(ctx, daprSecretStore, akeylessBulkMetadata)
	if err != nil {
		log.Printf("Error fetching secrets: %v\n", err)
		panic(err)
	}
	log.Printf("Found %d secrets: ", len(secrets))
	for secretName, secretValue := range secrets {
		log.Printf("Secret: %s, Value: %s", secretName, secretValue)
	}
```

{{% alert title="Failing Retrieval in Bulk" color="info" %}}
When retrieving secrets using the bulk API, all successfully-retrieved secrets are returned and failed ones are logged in the component log.
{{% /alert %}}

## Setup Akeyless instance

To get started with Akeyless:

1. Sign up for an Akeyless account at [https://www.akeyless.io](https://www.akeyless.io)
2. Create an Access ID and configure your preferred authentication method.
3. Set up your secrets in the Akeyless.
4. Configure the Dapr component using one of the authentication methods above.

For more detailed setup instructions, refer to the [Akeyless documentation](https://docs.akeyless.io/).

## Related links
- [Akeyless Sign Up](https://console.akeyless.io/registration)
- [Secrets building block]({{% ref secrets %}})
- [How-To: Retrieve a secret]({{% ref "howto-secrets.md" %}})
- [How-To: Reference secrets in Dapr components]({{% ref component-secrets.md %}})
- [Secrets API reference]({{% ref secrets_api.md %}})