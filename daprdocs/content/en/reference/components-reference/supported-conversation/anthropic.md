---
type: docs
title: "Anthropic"
linkTitle: "Anthropic"
description: Detailed information on the Anthropic conversation component
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
  name: anthropic
spec:
  type: conversation.anthropic
  metadata:
  - name: key
    value: "mykey"
  - name: model
    value: claude-sonnet-4-6
  - name: responseCacheTTL
    value: 10m
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{% ref component-secrets.md %}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `key`   | N | API key for Anthropic. Required unless `federationRuleId` is set. Prefer [SPIFFE authentication](#spiffe-authentication-recommended). | `"mykey"` |
| `model` | N | The Anthropic LLM to use. Defaults to `claude-sonnet-4-6`. If the `ANTHROPIC_MODEL` environment variable is set on the Dapr sidecar, its value overrides this field. | `claude-sonnet-4-6` |
| `maxTokens` | N | Default maximum number of tokens the model may generate per request. A request-level `maxTokens` value overrides this default. When unset, no cap is sent and the provider's own default applies. | `2048` |
| `responseCacheTTL` | N | Time-to-live for the in-memory response cache. When set, identical requests are served from cache until they expire. | `10m` |

## SPIFFE authentication (recommended)

Instead of an API key, the component can authenticate with the app's SPIFFE identity. It exchanges a JWT SVID minted by Sentry for a short-lived Anthropic access token, using [Anthropic workload identity federation](https://platform.claude.com/docs/en/manage-claude/workload-identity-federation). Set `federationRuleId` to enable it; `key` is then ignored. Requires Dapr 1.20 or later. See [SPIFFE authentication]({{% ref spiffe-authentication.md %}}) for why this is recommended, and for the Dapr prerequisites.

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `federationRuleId` | Y | ID of the federation rule that maps the app's SPIFFE ID to a service account. | `fdrl_01abc` |
| `organizationId` | Y | UUID of the Anthropic organization. | `00000000-0000-0000-0000-000000000000` |
| `serviceAccountId` | Y | ID of the service account the access token acts as. | `svac_01abc` |
| `workspaceId` | N | ID of the workspace to scope the access token to. Required when the federation rule is enabled for more than one workspace. | `wrkspc_01abc` |
| `audience` | N | Audience of the JWT SVID. Defaults to `https://api.anthropic.com`. | `https://api.anthropic.com` |

Workload identity federation is not supported when `apiType` is `foundry`.

In the Claude Console, go to **Workload identity**, select **Connect workload**, and choose **Custom OIDC**:

1. Set the issuer URL to the Sentry JWT issuer. Use discovery if Sentry's OIDC endpoints are publicly reachable, otherwise paste Sentry's JWK set.
2. Create a federation rule with the subject set to the app's SPIFFE ID, for example `spiffe://public/ns/default/my-app`, and the audience set to `https://api.anthropic.com`.
3. Note the federation rule ID, the service account ID, and your organization ID for the component.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: anthropic
spec:
  type: conversation.anthropic
  metadata:
  - name: federationRuleId
    value: "fdrl_01abc"
  - name: organizationId
    value: "00000000-0000-0000-0000-000000000000"
  - name: serviceAccountId
    value: "svac_01abc"
  - name: workspaceId
    value: "wrkspc_01abc"
```

Anthropic accepts each JWT only once. The component mints a new JWT SVID for every token exchange, and refreshes the access token before it expires.

## Related links

- [Conversation API overview]({{% ref conversation-overview.md %}})
