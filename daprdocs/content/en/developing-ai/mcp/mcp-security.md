---
type: docs
title: "MCP security and trust posture"
linkTitle: "Security posture"
weight: 35
description: "How Dapr enforces agent identity, authorization, and auditability across agents and MCP servers, and what stays your responsibility"
---

Running agents in production raises three questions Dapr is built to answer:

- **Who is this agent?** Can a downstream service prove that a request really came from a specific agent, and not from impersonated or hijacked credentials?
- **What may this agent do?** Are there enforceable limits on which MCP servers the agent can call and which data it can read or modify — limits that the LLM cannot reason its way around?
- **What has this agent done?** When something goes wrong, can the platform produce a record of what happened, by which identity, in what order?

Dapr answers each of these at the infrastructure layer, so the answers stay consistent regardless of which agent framework, language, or LLM you use, and without requiring changes to MCP client or server code.

## How Dapr answers the three questions

| Question | Dapr control |
|---|---|
| **Who is this agent?** | Every Dapr workload — agent App IDs and any MCP server you run as a Dapr app — receives a SPIFFE-based cryptographic identity that Dapr's Sentry component issues, attests, and rotates automatically. All service-to-service traffic is [mTLS-secured]({{% ref mtls.md %}}) using these identities. No static API keys or shared service tokens are required between Dapr apps. |
| **What may this agent do?** | A [`Configuration` resource]({{% ref invoke-allowlist.md %}}) with `accessControl` rules attached to each App ID decides which callers may reach it. Defaults can be set to `deny`, so an MCP server is unreachable until a calling App ID is explicitly allow-listed. A [bearer middleware]({{% ref middleware-bearer.md %}}) layered on the MCP server's `appHttpPipeline` adds JWT validation on top — the LLM cannot reason its way around either control. |
| **What has this agent done?** | Every service-invocation call — MCP calls included — flows through Dapr's data plane and is captured in [logs, metrics, and distributed traces]({{% ref observability-concept %}}). Standard OpenTelemetry exporters ship the data to your SIEM, log warehouse, or tracing backend. |

## Default postures

Dapr's defaults favor refusal over permissiveness. None of the below requires you to "turn on a security mode" — they are how the platform behaves out of the box.

- **No identity is implicit.** An MCP server reached through Dapr service invocation is mTLS-authenticated using the caller's SPIFFE identity. There is no anonymous service-invocation path.
- **Access policies are declarative and explicit.** An `accessControl` block attached to an MCP server's App ID with `defaultAction: deny` makes the server unreachable until callers are explicitly allow-listed. See [MCP access control]({{% ref mcp-access-control.md %}}).
- **Secrets are never exposed to agent code.** Credentials referenced by middleware components (issuer URLs, audiences, signing keys, OAuth client secrets) are stored in your project's [secret store]({{% ref secrets-overview %}}) and resolved at request time. The agent receives tool results, not credentials.
- **mTLS is on everywhere.** Sentry issues short-lived SVIDs to every workload and rotates them automatically. You don't configure it per-resource.

## Threat model

The failure modes below account for most of the security risk when agents operate in production. Dapr's controls map directly to each.

| Failure mode | What it looks like | Dapr control |
|---|---|---|
| **Privilege escalation** | A sub-agent inherits unscoped credentials and acts beyond its principal's authority. | Each agent's App ID has its own SPIFFE identity and its own `accessControl` configuration. Authority does not propagate by inheritance; every hop is independently authorized. |
| **Unauthorized tool use** | An agent or unknown caller tries to reach an MCP server it isn't entitled to use. | `Configuration` `accessControl` rules attached to the MCP server's App ID enforce per-caller allow/deny at the service-invocation boundary. Denied calls are rejected by Dapr before they reach the MCP server process. |
| **Jailbreaking** | A prompt persuades the LLM to attempt an unauthorized action. | The LLM's decision happens before the platform; Dapr's authorization checks run after. A jailbroken LLM that tries to reach a forbidden MCP server still hits a deny from `accessControl` (or a `401` from bearer middleware) before any code on the MCP server runs. |
| **"Agent who?"** | A downstream service cannot confirm which agent originated a call. | SPIFFE workload identity is verified at every hop. The MCP server (if it runs as a Dapr app) or any downstream service the MCP server calls can read the caller's identity from the mTLS connection or from claims in the validated JWT. |
| **Secret sprawl** | API keys appear in logs, prompts, or downstream agent calls. | Credentials used by bearer or OAuth2 middleware are resolved from the secret store at request time and never visible to agent code. SPIFFE SVIDs are short-lived and rotated by Sentry automatically. |
| **No provenance** | No verifiable record of who did what. | Every service-invocation call is recorded by Dapr's [observability pipeline]({{% ref observability-concept %}}) — logs, metrics, traces — and shipped to your sinks via OpenTelemetry. |

## What stays your responsibility

Dapr draws the trust boundary at the platform's surface. Some risks live outside it.

- **Prompt injection and LLM-layer attacks.** Dapr enforces authorization at the service-invocation boundary regardless of what the LLM does, but it does not inspect prompt content. Defense against prompt injection — content filters, allow-listing, output validation — belongs in your agent's pre-LLM and post-LLM layers.
- **The security of the MCP server itself.** When you connect to a third-party MCP server (GitHub, Stripe, an internal tool), Dapr secures the *connection*, not the *server*. Vet third-party MCP servers as you would any other dependency.
- **Audit sink durability and integrity.** Dapr emits observability data to your sinks; the long-term durability and tamper resistance of those records is governed by the sink you write to (your SIEM, log warehouse, immutable bucket). Choose a sink whose retention and integrity guarantees match your compliance obligations.
- **Tool-level granularity at the service-invocation layer.** `accessControl` today is keyed by caller App ID and target App ID. If a single MCP server exposes both low-risk and high-risk tools and you need to grant access to some but not others, either split the tools across separate MCP servers (one App ID per server) so the policy boundary matches the trust boundary, or use the [`MCPServer` resource]({{% ref mcp-server-resource.md %}}) middleware hooks for argument-level RBAC.

## Identity model in one paragraph

Every Dapr workload — agent App IDs and the MCP server itself if it runs as a Dapr app — receives a SPIFFE-based cryptographic identity that Sentry issues and rotates automatically. mTLS between workloads uses these identities. When an agent invokes an MCP server through Dapr, the caller's SPIFFE identity is bound to the request; the MCP server's `Configuration` `accessControl` rules decide whether to allow it.

## Defense in depth

The strongest production deployments layer multiple controls so that defeating one does not grant access:

1. **mTLS with SPIFFE identity** — every call between Dapr workloads is mutually authenticated by default.
2. **`Configuration` `accessControl`** — App-ID-keyed allow/deny on the service-invocation boundary. Default-deny means new callers can't reach the MCP server until they're listed.
3. **Bearer middleware on `appHttpPipeline`** — independent JWT validation against the issuer's JWKS, `iss`, and `aud` claims. An attacker would need to forge or steal a valid App ID *and* obtain a valid signed token.
4. **(Optional) `MCPServer` resource middleware hooks** — argument-level RBAC, redaction, and audit running as durable workflows. Useful when policy depends on the contents of a tool call, not just the caller.

See [MCP access control]({{% ref mcp-access-control.md %}}) for layering ACL + bearer, and [MCPServer resource]({{% ref mcp-server-resource.md %}}) for the workflow-hook layer.

## Next steps

- [MCP access control]({{% ref mcp-access-control.md %}}) — declarative authorization per App ID with `Configuration` `accessControl`.
- [Authenticating an MCP server]({{% ref mcp-authentication.md %}}) — OAuth2 and bearer middleware setup, client-side and server-side.
- [Dapr mTLS]({{% ref mtls.md %}}) — SPIFFE-based mTLS and Sentry-managed identity rotation.
- [Service invocation access control]({{% ref invoke-allowlist.md %}}) — the full `accessControl` schema and HTTP-verb-level controls.
