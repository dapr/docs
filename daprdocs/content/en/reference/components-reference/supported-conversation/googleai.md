---
type: docs
title: "GoogleAI"
linkTitle: "GoogleAI"
description: Detailed information on the GoogleAI conversation component
---

{{% alert title="Recommended" color="primary" %}}
Authenticate this component with the app's Dapr SPIFFE identity instead of an API key. SPIFFE authentication is secretless: no long-lived credential is stored, and the provider grants access to your app's own Dapr identity. See [SPIFFE authentication](#spiffe-authentication-recommended).
{{% /alert %}}

## Component format

A Dapr `conversation.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: googleai
spec:
  type: conversation.googleai
  metadata:
  - name: key
    value: mykey
  - name: model
    value: gemini-1.5-flash
  - name: responseCacheTTL
    value: 10m
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `key`   | N | API key for GoogleAI. Required unless `workloadIdentityProvider` is set. Prefer [SPIFFE authentication](#spiffe-authentication-recommended). | `mykey` |
| `endpoint` | N | OpenAI-compatible endpoint URL. Defaults to the Gemini API OpenAI-compatible endpoint. | `https://us-central1-aiplatform.googleapis.com/v1/projects/my-project/locations/us-central1/endpoints/openapi` |
| `model` | N | The GoogleAI LLM to use. Defaults to `gemini-1.5-flash`.  | `gemini-2.0-flash` |
| `maxTokens` | N | Default maximum number of tokens the model may generate per request. A request-level `maxTokens` value overrides this default. When unset, no cap is sent and the provider's own default applies. | `2048` |
| `responseCacheTTL` | N | Time-to-live for the in-memory response cache. When set, identical requests are served from cache until they expire. | `10m` |

## SPIFFE authentication (recommended)

Instead of an API key, the component can authenticate with the app's SPIFFE identity. Google Cloud's Security Token Service exchanges a JWT SVID minted by Sentry for a short-lived access token, using [workload identity federation](https://cloud.google.com/iam/docs/workload-identity-federation-with-other-providers). Set `workloadIdentityProvider` to enable it; `key` is then ignored. Requires Dapr 1.20 or later. See [SPIFFE authentication]({{% ref spiffe-authentication.md %}}) for why this is recommended, and for the Dapr prerequisites.

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `workloadIdentityProvider` | Y | Full resource name of the workload identity pool provider. It is also the audience of the JWT SVID. | `//iam.googleapis.com/projects/123456789/locations/global/workloadIdentityPools/dapr/providers/sentry` |
| `serviceAccountEmail` | N | Service account to impersonate. If not set, the federated token is used directly. | `dapr-ai@my-project.iam.gserviceaccount.com` |

1. Create a workload identity pool, and an OIDC provider in it with the Sentry JWT issuer as the issuer URI. Leave the allowed audiences empty, so that the provider's resource name is the expected audience. Upload Sentry's JWK set if Sentry's OIDC endpoints are not publicly reachable.
2. Map `google.subject` to `assertion.sub`.
3. Grant access to the principal `principal://iam.googleapis.com/projects/<number>/locations/global/workloadIdentityPools/dapr/subject/spiffe://public/ns/default/my-app`, either directly or through a service account it can impersonate.
4. Set `endpoint` to an endpoint that accepts Google Cloud access tokens, such as the Vertex AI OpenAI-compatible endpoint.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: googleai
spec:
  type: conversation.googleai
  metadata:
  - name: workloadIdentityProvider
    value: "//iam.googleapis.com/projects/123456789/locations/global/workloadIdentityPools/dapr/providers/sentry"
  - name: endpoint
    value: "https://us-central1-aiplatform.googleapis.com/v1/projects/my-project/locations/us-central1/endpoints/openapi"
  - name: model
    value: "google/gemini-2.5-flash"
```

## Related links

- [Conversation API overview]({{< ref conversation-overview.md >}})