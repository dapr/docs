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
schemaVersion: v1
type: secretstores
name: akeyless
version: v1
status: beta
title: "Akeyless Secret Store"
urls:
  - title: Reference
    url: https://docs.dapr.io/reference/components-reference/supported-secret-stores/akeyless/
authenticationProfiles:
  - title: API Key
    description: Authenticate using an API key.
    metadata:
      - name: accessId
        required: true
        description: The Akeyless Access ID.
        example: "p-123456780wm"
        type: string
      - name: accessKey
        required: true
        description: The Akeyless API key.
        example: "ABCD1233...="
        type: string
        sensitive: true
  - title: JWT
    description: Authenticate using a JSON Web Token.
    metadata:
      - name: accessId
        required: true
        description: The Akeyless Access ID.
        example: "p-123456780wm"
        type: string
      - name: jwt
        required: true
        description: The JSON Web Token.
        example: "eyJ..."
        type: string
        sensitive: true
  - title: AWS IAM
    description: Authenticate using AWS IAM.
    metadata:
      - name: accessId
        required: true
        description: The Akeyless Access ID.
        example: "p-123456780wm"
        type: string
  - title: Kubernetes
    description: Authenticate using Kubernetes.
    metadata:
      - name: accessId
        required: true
        description: The Akeyless Access ID.
        example: "p-123456780wm"
        type: string
      - name: k8sAuthConfigName
        required: true
        description: The name of the k8s auth config.
        example: "k8s-auth-config"
        type: string
      - name: k8sGatewayUrl
        required: true
        description: The gateway URL that where the k8s auth config is located.
        example: "http://gw.akeyless.svc.cluster.local:8000"
        type: string
      - name: k8sServiceAccountToken
        required: true
        description: The service account token.
        example: "eyJ..."
        type: string
        sensitive: true
metadata:
  - name: gatewayUrl
    required: false
    description: |
      The URL to the Akeyless Gateway API. Default is https://api.akeyless.io.
    default: "https://api.akeyless.io"
    example: "https://your.akeyless.gw"
    type: string
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

You can retrieve secrets from Akeyless using the Dapr secrets API:

```bash
curl http://localhost:3500/v1.0/secrets/akeyless/my-secret
```

This returns the secret value stored in Akeyless with the name `my-secret`.

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