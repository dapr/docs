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
# yaml-language-server: $schema=../../component-metadata-schema.json
schemaVersion: v1
type: secretstores
name: akeyless
version: v1
status: beta
title: "Akeyless Secret Store"
urls:
  - title: Reference
    url: https://docs.dapr.io/reference/components-reference/supported-secret-stores/akeyless/
metadata:
  - name: gatewayUrl
    required: false
    description: |
      The URL to the Akeyless Gateway API. Default is https://api.akeyless.io.
    default: "https://api.akeyless.io"
    example: "https://your.akeyless.gw"
    type: string
  - name: accessId
    required: true
    description: |
      The Akeyless Access ID. Currently supported authentication methods are: API keys (`access_key`, default), JWT (`jwt`) and AWS IAM (`aws_iam`).
    example: "p-123456780wm"
    type: string
  - name: jwt
    required: false
    description: |
      If using the JWT authentication method, specify it here.
    example: "eyJ..."
    type: string
    sensitive: true
  - name: accessKey
    required: false
    description: |
      If using the API key (access_key) authentication method, specify it here.
    example: "ABCD1233...="
    type: string
    sensitive: true
  - name: k8sAuthConfigName
    required: false
    description: |
      If using the k8s auth method, specify the name of the k8s auth config.
    example: "k8s-auth-config"
    type: string
  - name: k8sGatewayUrl
    required: false
    description: |
      The gateway URL that where the k8s auth config is located.
    example: "http://gw.akeyless.svc.cluster.local:8000"
    type: string
  - name: k8sServiceAccountToken
    required: false
    description: |
      If using the k8s auth method, specify the service account token. If not specified,
      we will try to read it from the default service account token file.
    example: "eyJ..."
    type: string
    sensitive: true
```

## Spec metadata fields

| Field              | Required | Details                                                                 | Example             |
|--------------------|:--------:|-------------------------------------------------------------------------|---------------------|
| `gatewayUrl`   | N        | The Akeyless Gateway API URL. Defaults to https://api.akeyless.io.                                           | `http://gw-release.akeyless.svc.cluster.local:8000/api/v2` |
| `accessID`           | Y        | The Akeyless Access ID of the authentication method                    | `p-1234567890`    |
| `accessKey`          | N        | Fill in when using an API Key (`access_key`) authentication method.              | `ABCD1233...=`    |
| `jwt`                | N        | Fill in a `base64`-encoded string of the JWT when using OAuth2.0/JWT (`jwt`) authentication method                | `eyJ...`          |
| `k8sAuthConfigName`  | N        | Fill in when using Kubernetes Authentication (`k8s`) authentication method     | `my-k8s-auth-conf`                |
| `k8sGatewayUrl`      | N        | Fill in when using Kubernetes Authentication (`k8s`) authentication method. If not filled in, will default to value set for `akeylessGWApiURL`. | `http://gw-release.akeyless.svc.cluster.local:8000/api/v2` |
| `k8sServiceAccountToken`  | N        |  Fill in a `base64`-encoded string of the JWT when using Kubernetes Authentication (`k8s`) authentication method. If not filled in, will read from k8s token in container filesystem | `ej...` |


## Authentication Methods

We currently support the following authentication methods:

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
    value: "eyJ..."
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
    value: "http://release-gw.akeyless.svc.cluster.local:8000/api/v2"
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
When retrieving secrets using the bulk API, all successfully-retrieved secrets will be returned and failed ones will be logged in the component log.
{{% /alert %}}

## Setup Akeyless instance

To get started with Akeyless:

1. Sign up for an Akeyless account at [https://www.akeyless.io](https://www.akeyless.io)
2. Create an Access ID and configure your preferred authentication method.
3. Set up your secrets in the Akeyless.
4. Configure the Dapr component using one of the authentication methods above.

For more detailed setup instructions, refer to the [Akeyless documentation](https://docs.akeyless.io/).

## Related links

- [Secrets building block]({{% ref secrets %}})
- [How-To: Retrieve a secret]({{% ref "howto-secrets.md" %}})
- [How-To: Reference secrets in Dapr components]({{% ref component-secrets.md %}})
- [Secrets API reference]({{% ref secrets_api.md %}})