---
type: docs
title: "Git"
linkTitle: "Git"
description: Detailed information on the Git configuration store component
---

## Component format

To set up a Git configuration store, create a component of type `configuration.git`. See [this guide]({{% ref "howto-manage-configuration.md#configure-a-dapr-configuration-store" %}}) on how to create and apply a configuration store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: configuration.git
  version: v1
  metadata:
  - name: remoteUrl
    value: "https://github.com/example/agent-config.git"
  # Optional: branch to track
  - name: branch
    value: "main"
  # Optional: subdirectory inside the repo to scope
  - name: path
    value: "."
  # Optional: file/agentYaml/prompty
  - name: mappingMode
    value: "file"
  # Optional: how often to poll the upstream for new commits
  - name: pollInterval
    value: "5m"
```

The authentication profile is **auto-detected** from which fields are set — there is no explicit `authMode` selector. See [Authentication](#authentication) for details.

{{% alert title="Warning" color="warning" %}}
The above example has no credentials (suitable for a public repo or a `file://` URL). When using PAT, SSH, or GitHub App authentication, reference credentials from a [secret store]({{% ref component-secrets.md %}}) instead of embedding them inline. See [Authentication](#authentication) below.
{{% /alert %}}

## Spec metadata fields

### General

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| `remoteUrl` | Y | Git URL of the upstream remote (the same value `git remote get-url origin` would return for a clone). Supports `https://`, `ssh://`, `git@host:org/repo` (SCP-style), and `file://` schemes. URLs with the `git@` or `ssh://` prefix auto-select the SSH auth profile. `http://` is rejected for any authenticated profile to prevent cleartext credential transmission. Embedding credentials inline (`https://user:tok@host/`) is also rejected — supply them via the appropriate auth profile field backed by a configured secret store. | `"https://github.com/example/agent-config.git"` |
| `branch` | N | Branch to track. | `"main"` (default) |
| `path` | N | Subdirectory inside the repository to treat as the configuration root. Files outside this directory are not surfaced as configuration items. Must be repo-relative (no leading `/`, no `..` components, no segment may be `.git`). | `"agents/weather"`, `"."` (default) |
| `depth` | N | Clone depth. `0` (default) performs a full clone, matching git's default behaviour when no `--depth` is passed. `go-git`'s shallow incremental fetch has known limitations; full clones are the safe choice for anything but trivial config repos. | `"0"` (default) |
| `pollInterval` | N | How often to poll the upstream for changes. Hard floor is `1s` for remote URLs; `file://` URLs may go down to `100ms`. Intervals below `5s` log a warning at startup. Default `5m` gives plenty of head-room against provider rate limits even on multi-replica deployments — at `5m` × 10 replicas you issue 120 requests/h, well below GitHub's 5000/h PAT and 15000/h GitHub App limits. If the upstream responds with HTTP 429 or a transport-level rate-limit error, the poll loop pauses for `rateLimitRetryAfter` (or the server-supplied `Retry-After` when available) before its next tick. | `"5m"` (default) |
| `rateLimitRetryAfter` | N | How long the poll loop waits before its next tick when the upstream responds with a rate-limit error and no `Retry-After` header was supplied. | `"5m"` (default) |
| `fetchTimeout` | N | Per-fetch timeout applied to fetch operations. | `"30s"` (default) |
| `includeHidden` | N | When `false` (default), files whose name begins with `.` are skipped during the worktree walk. The `.git` directory is **always** excluded regardless of this flag — credentials in `.git/config` (e.g. from an inline-credential URL) can never leak into the configuration items. | `"false"` (default) |
| `maxFileSize` | N | Maximum per-file size in bytes that the walker will read into memory. Files larger than this are skipped with a warning. Protects the sidecar from OOM if a large blob is accidentally committed. | `"1048576"` (1 MiB default) |
| `snapshotCacheSize` | N | Number of past snapshots to retain in the LRU cache used as diff bases when computing per-subscriber update events. Higher values reduce over-emit churn when many subscribers are at slightly different delivered HEAD values. With the default `pollInterval` of `5m`, the default of `4` covers ~20 minutes of commit history for the most-stale subscriber. | `"4"` (default) |
| `emitInitialState` | N | When `true` (default), `Subscribe` synchronously delivers the current snapshot to the handler before returning — callers don't need a separate `Get` + `Subscribe` pair. Set to `false` if the caller already has fresh state and would receive a duplicate. | `"true"` (default) |
| `mappingMode` | N | Strategy for mapping repository files to configuration items. Matching is case-insensitive. Non-matching files in scope are a **hard error**. See [Mapping modes](#mapping-modes). | `"file"` (default), `"agentYaml"`, `"prompty"` |

### Personal Access Token

Use the PAT profile by setting `token`. Works with both GitHub classic PATs (`ghp_…`) and fine-grained PATs (`github_pat_…`).

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| `token` | Y | Personal access token used to authenticate. Sent as the password in HTTP basic auth. Source from a configured secret store. | `"ghp_xxxxxxxxxxxx"` |
| `username` | N | Username sent with the token. Defaults to `"x-access-token"`, which is the GitHub-recommended placeholder. Other providers may require a real username. | `"x-access-token"` (default) |

### SSH

Use the SSH profile by setting an SSH-scheme `remoteUrl` (`git@…` or `ssh://…`) plus a private key.

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| `user` | N | SSH user used when connecting. Defaults to `"git"`, matching the convention used by GitHub, GitLab, Bitbucket, and most self-hosted providers. | `"git"` (default) |
| `privateKey` | Y* | PEM-encoded SSH private key. Either `privateKey` or `privateKeyPath` must be set. | `"-----BEGIN OPENSSH PRIVATE KEY-----\n..."` |
| `privateKeyPath` | Y* | Path to a PEM-encoded SSH private key on disk. Mutually exclusive with `privateKey`. | `"/var/run/secrets/git-ssh-key"` |
| `passphrase` | N | Passphrase for the SSH private key, if encrypted. | |
| `knownHosts` | Y** | Inline OpenSSH known_hosts entries used to verify the remote host key. Either `knownHosts` or `knownHostsPath` must be set unless `insecureIgnoreHostKey` is `true`. Hostname is bound to key — a key registered for one host will not match another. | `"github.com ssh-rsa AAAA..."` |
| `knownHostsPath` | Y** | Path to an OpenSSH `known_hosts` file on disk. | `"/etc/ssh/ssh_known_hosts"` |
| `insecureIgnoreHostKey` | N | **DANGEROUS.** Disable SSH host key verification. Only use for local development or testing. When enabled, the component logs a warning at startup. Never enable in production; a MITM attacker can intercept configuration values. | `"false"` (default) |

`*` Exactly one of `privateKey` / `privateKeyPath` is required.
`**` Exactly one of `knownHosts` / `knownHostsPath` is required unless `insecureIgnoreHostKey: true`.

### GitHub App

Use the GitHub App profile by setting `appId`. The component mints an RS256 JWT, exchanges it for a 1-hour installation token, and refreshes the token before expiry. On HTTP 429 (or 403 with rate-limit headers) the component honours `Retry-After` and retries once; persistent rate-limit responses trigger the poll-loop back-off.

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| `appId` | Y | Numeric GitHub App ID. | `"123456"` |
| `installationId` | Y | Numeric GitHub App installation ID for the target organisation or repository. | `"78901234"` |
| `privateKey` | Y* | PEM-encoded RSA private key for the GitHub App. Accepts both PKCS#1 (`RSA PRIVATE KEY`) and PKCS#8 (`PRIVATE KEY`) encodings — GitHub Apps may be downloaded in either form. | `"-----BEGIN RSA PRIVATE KEY-----\n..."` |
| `privateKeyPath` | Y* | Path to a PEM-encoded RSA private key on disk. Mutually exclusive with `privateKey`. | `"/var/run/secrets/github-app-key.pem"` |
| `apiBase` | N | Base URL of the GitHub API. Override for GitHub Enterprise Server. Must use `https://`. | `"https://api.github.com"` (default) |
| `refreshSkew` | N | Refresh the installation token when it has less than this much time left before expiry. | `"5m"` (default) |

`*` Exactly one of `privateKey` / `privateKeyPath` is required.

## Authentication

There is **no explicit `authMode` selector** — the active profile is inferred from which fields are set:

1. `appId` set → **GitHub App** profile.
2. URL begins with `git@` or `ssh://` → **SSH** profile.
3. `token` set → **PAT** profile.
4. Otherwise → no auth (public HTTPS or local `file://`).

Sensitive fields (`token`, `privateKey`, `passphrase`) should be sourced from a configured secret store via `secretKeyRef`. Embedding credentials directly in the URL (e.g. `https://user:tok@host/repo`) is rejected at component init — operators must use a structured auth profile.

The `auth.secretStore` field at the bottom of each example below names the [configured secret store component]({{% ref supported-secret-stores %}}) Dapr should use to resolve the `secretKeyRef` entries in `metadata`. When running in Kubernetes with a Kubernetes secret store, this field defaults to `kubernetes` and can be omitted. See [How-To: Reference secrets in components]({{% ref component-secrets.md %}}) for details.

### Example: PAT with secret reference

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: configstore
spec:
  type: configuration.git
  version: v1
  metadata:
  - name: remoteUrl
    value: "https://github.com/example/private-config.git"
  - name: token
    secretKeyRef:
      name: github-pat
      key: token
auth:
  # Name of the configured secret store component that holds the secrets
  # referenced above. Defaults to "kubernetes" in K8s deployments.
  secretStore: <SECRET_STORE_NAME>
```

### Example: SSH with deploy key

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: configstore
spec:
  type: configuration.git
  version: v1
  metadata:
  - name: remoteUrl
    value: "git@github.com:example/private-config.git"
  - name: privateKey
    secretKeyRef:
      name: git-ssh-deploy-key
      key: privateKey
  - name: knownHosts
    secretKeyRef:
      name: git-ssh-known-hosts
      key: knownHosts
auth:
  # Name of the configured secret store component that holds the secrets
  # referenced above. Defaults to "kubernetes" in K8s deployments.
  secretStore: <SECRET_STORE_NAME>
```

### Example: GitHub App

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: configstore
spec:
  type: configuration.git
  version: v1
  metadata:
  - name: remoteUrl
    value: "https://github.com/example/private-config.git"
  - name: appId
    value: "123456"
  - name: installationId
    value: "78901234"
  - name: privateKey
    secretKeyRef:
      name: github-app-key
      key: privateKey
auth:
  # Name of the configured secret store component that holds the secrets
  # referenced above. Defaults to "kubernetes" in K8s deployments.
  secretStore: <SECRET_STORE_NAME>
```

## Mapping modes

The `mappingMode` field selects how files in the repository become configuration items. Matching is case-insensitive. **Non-matching files in the configured scope cause `Init` to fail** — if your scope contains a mix of file types, either narrow `path` to the homogeneous subset or use `mappingMode: file`.

### `file` (default)

Each file becomes one configuration item. The relative POSIX path is the key, the file contents are the value.

```text
repo/
├── agents/weather/agent_role.txt   → key "agents/weather/agent_role.txt"
└── agents/weather/agent_goal.txt   → key "agents/weather/agent_goal.txt"
```

Recommended when the consumer expects scalar configuration keys.

### `agentYaml`

Each `*.yaml`, `*.yml`, or `*.json` file is parsed as a flat top-level map. Each top-level field becomes a key prefixed by the filename stem with directory separators replaced by `_`. **Non-YAML/JSON files in scope cause `Init` to fail.**

```yaml
# repo/agents/weather.yaml
agent_role: Weather expert
agent_goal: Help users plan trips
agent_instructions:
  - be concise
  - cite sources
```

Produces:

```text
agents_weather/agent_role          = "Weather expert"
agents_weather/agent_goal          = "Help users plan trips"
agents_weather/agent_instructions  = "- be concise\n- cite sources"  (YAML-serialised)
```

Non-scalar field values round-trip via YAML re-serialisation — consumers can re-parse them with any YAML decoder.

### `prompty`

Each `*.prompty` file's YAML frontmatter and body are split. Frontmatter fields produce `<stem>/<field>` keys (using the same directory-aware stem rules as `agentYaml`); the body is emitted as `<stem>/agent_system_prompt`. See the [Prompty spec](https://github.com/microsoft/prompty) for the file format. **Non-`.prompty` files in scope cause `Init` to fail.**

```text
---
name: Weather Agent
agent_role: Weather expert
agent_goal: Help users plan trips
---
You are a friendly weather assistant.
```

Produces:

```text
weather/name                  = "Weather Agent"
weather/agent_role            = "Weather expert"
weather/agent_goal            = "Help users plan trips"
weather/agent_system_prompt   = "You are a friendly weather assistant."
```

## How it works

### Polling

On `Init`, the component clones the upstream repository into a temporary working directory and builds an initial snapshot from the worktree. A single polling goroutine then runs every `pollInterval`:

1. Fetch the configured branch from the upstream.
2. If the remote tracking ref hasn't moved, do nothing.
3. Otherwise, hard-reset the worktree to the new tip, walk the files under `path`, run the configured mapping strategy, and install the new snapshot.
4. For each active subscriber, compute the diff against the snapshot the subscriber last saw and dispatch a notification.

`Get` returns the most-recently-polled snapshot and may be up to `pollInterval` old. It does not contact the upstream — use `Subscribe` to receive change notifications.

### Subscriptions

When `emitInitialState` is `true` (the default), `Subscribe` synchronously delivers the current snapshot to the handler before returning. This means callers can issue `Subscribe` without a preceding `Get`. If the initial delivery fails, the subscription is rolled back and the error is returned.

Per-subscriber diffs are computed against an LRU cache of the last `snapshotCacheSize` snapshots keyed by commit SHA. On an LRU miss (subscriber sat through more commits than the cache holds without delivery), the diff degrades to a one-shot over-emit — every key is emitted as added or changed, which is idempotent on the receiver.

### Deletion semantics

When a key is removed in the upstream repo, the notification includes:

```json
{
  "value": "",
  "version": "<short-sha>",
  "metadata": {"deleted": "true"}
}
```

The `deleted: true` sentinel distinguishes a removed key from a key set to the empty string. This is the same shape used by the [Kubernetes ConfigMap configuration store]({{% ref kubernetes-configmap-configuration-store.md %}}).

### Versioning

The version on every emitted item is the short (7-character) commit SHA of the upstream tip at the time of the snapshot.

### Rate limiting

On HTTP 429 from the GitHub API (used by the GitHub App installation-token exchange), or a transport-level rate-limit error from `go-git`, the poll loop pauses for `rateLimitRetryAfter` (default `5m`) — or the server-supplied `Retry-After` when present — before its next tick. The component never retries a rate-limited response in a tight loop.

### Security considerations

- `http://` URLs are rejected when any authenticated profile is in use to prevent cleartext credential transmission. Use `https://`, `ssh://`, or `file://`.
- Inline credentials in the URL (`https://user:token@host/repo`) are rejected. Always use a structured auth profile sourced from a configured secret store.
- The `.git` directory is always excluded from the worktree walk, regardless of `includeHidden`. This prevents the remote URL and any credentials stored in `.git/config` from leaking into configuration items. A `path` containing a `.git` segment is rejected at `Init`.
- `insecureIgnoreHostKey: true` is supported for development but loud-logged at startup. Production deployments must always provide `knownHosts` or `knownHostsPath`.
- Polling rate cumulatively counts against the git provider's rate limit. Multi-replica deployments multiply request volume — see the `pollInterval` row in the metadata table for the calculation.

{{% alert title="Note" color="primary" %}}
The component is **read-only**. It never writes to the upstream repository. Configuration changes must be made by committing to the repo through your normal git workflow (PR review, branch protection, etc.).
{{% /alert %}}

## Limitations

- **Single GitHub App installation per component.** Multi-tenant routing (different repos via different installations on the same component) is not supported.

## Related links

- [Basic schema for a Dapr component]({{% ref component-schema.md %}})
- [Configuration building block]({{% ref configuration-api-overview.md %}})
- Read [How-To: Manage configuration from a store]({{% ref "howto-manage-configuration.md" %}}) for instructions on how to use a configuration store.
- [GitHub: dapr/components-contrib `configuration/git`](https://github.com/dapr/components-contrib/tree/main/configuration/git)
