---
type: docs
title: "Infisical"
linkTitle: "Infisical"
description: Detailed information on the Infisical secret store component
---

## Component format

To set up an Infisical secret store, create a component of type `secretstores.infisical`. See [this guide]({{% ref "setup-secret-store.md#apply-the-configuration" %}}) on how to create and apply a secret store configuration. See [this guide on referencing secrets]({{% ref component-secrets.md %}}) to retrieve and use the secret with Dapr components.

{{< tabpane text=true >}}

{{% tab "Universal Auth" %}}
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: infisical
spec:
  type: secretstores.infisical
  version: v1
  metadata:
    - name: projectId
      value: "[infisical_project_id]"
    - name: environment
      value: "dev"
    - name: apiUrl # Optional. Default: "https://app.infisical.com"
      value: "https://app.infisical.com"
    - name: clientId
      value: "[infisical_client_id]"
    - name: clientSecret
      value: "[infisical_client_secret]"
```
{{% /tab %}}

{{% tab "Access Token" %}}
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: infisical
spec:
  type: secretstores.infisical
  version: v1
  metadata:
    - name: projectId
      value: "[infisical_project_id]"
    - name: environment
      value: "dev"
    - name: apiUrl # Optional. Default: "https://app.infisical.com"
      value: "https://app.infisical.com"
    - name: accessToken
      value: "[infisical_access_token]"
```
{{% /tab %}}

{{< /tabpane >}}

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a local secret store such as [Kubernetes secret store]({{% ref kubernetes-secret-store.md %}}) or a [local file]({{% ref file-secret-store.md %}}) to bootstrap secure key storage.
{{% /alert %}}

## Spec metadata fields

| Field | Required | Details | Example |
| --- | :---: | --- | --- |
| `projectId` | Y | Infisical project (workspace) ID. `workspaceId` is accepted as an alias. | `"2c95d8c8-cc6e-4ca8-88f9-c8e318dbf544"` |
| `environment` | Y | Infisical environment slug to query secrets from. | `"dev"` |
| `apiUrl` | N | Infisical API or app URL. Defaults to `"https://app.infisical.com"`. | `"https://app.infisical.com"` |
| `caPem` | N | Inlined contents of the CA certificate to use, in PEM format (for self-hosted Infisical instances with custom TLS). | `"-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"` |
| `clientId` | Y* | Infisical Universal Auth client ID. Required with `clientSecret` when `accessToken` is not provided. | `"<infisical-client-id>"` |
| `clientSecret` | Y* | Infisical Universal Auth client secret. Required with `clientId` when `accessToken` is not provided. | `"<infisical-client-secret>"` |
| `accessToken` | Y* | Infisical access token used for authentication (`token` is accepted as an alias). Required when `clientId` and `clientSecret` are not provided. | `"<infisical-access-token>"` |
| `secretPath` | N | Secret path to use when fetching and listing secrets. Defaults to `"/"`. | `"/"` |
| `includeImports` | N | Include imported secrets in `GetSecret` and `BulkGetSecret` calls. Defaults to `"false"`. | `"true"` |
| `expandSecretReferences` | N | Expand secret references in `GetSecret` and `BulkGetSecret` calls. Defaults to `"false"`. | `"false"` |
| `recursive` | N | Recursively list secrets from subdirectories in `BulkGetSecret` calls. Defaults to `"true"`. | `"true"` |

\* Specify either `accessToken` (or `token`), or both `clientId` and `clientSecret`, not both.

## Optional per-request metadata properties

The following [optional query parameters]({{% ref "secrets_api#query-parameters" %}}) can be provided when retrieving secrets from this secret store:

Query Parameter | Description
--- | ---
`metadata.projectId` | Override the Infisical project ID for the request (takes precedence over `metadata.workspaceId`).
`metadata.workspaceId` | Alias for `metadata.projectId`.
`metadata.environment` | Override the Infisical environment slug for the request.
`metadata.secretPath` | Override the secret path for the request.
`metadata.type` | Secret type for `GetSecret` (for example, `"shared"` or `"personal"`).
`metadata.version_id` | Positive integer version for the given secret key (`GetSecret` only).
`metadata.includeImports` | Boolean (`"true"` / `"false"`) overriding `includeImports` for the request.
`metadata.expandSecretReferences` | Boolean (`"true"` / `"false"`) overriding `expandSecretReferences` for the request.
`metadata.recursive` | Boolean (`"true"` / `"false"`) overriding `recursive` for `BulkGetSecret`.

## Setup an Infisical instance

Set up Infisical using the [Infisical documentation](https://infisical.com/docs).

## Related links

- [Secrets building block]({{% ref secrets %}})
- [How-To: Retrieve a secret]({{% ref "howto-secrets.md" %}})
- [How-To: Reference secrets in Dapr components]({{% ref component-secrets.md %}})
- [Secrets API reference]({{% ref secrets_api.md %}})
