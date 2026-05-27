---
type: docs
title: "Workflow history signing"
linkTitle: "History signing"
weight: 9000
description: "Cryptographic tamper detection for workflow execution histories"
---

Dapr workflow history signing provides cryptographic tamper detection for
workflow execution histories. Every history event produced during a workflow's
lifetime is signed using the sidecar's mTLS identity (X.509 SPIFFE Verifiable Identity Document (SVID)), creating an
auditable chain of signatures that is verified each time the workflow state is
loaded.

## Overview

Workflows in Dapr execute as a series of deterministic replay steps. Each step
appends history events to the [actor state store]({{% ref "workflow-architecture.md" %}}). History signing ensures that those events have
not been modified, reordered, or removed after they were written.

When signing is active, Dapr:

1. Deterministically marshals each new history event.
2. Computes a SHA-256 digest over the batch of events.
3. Chains the new digest to the previous signature's digest.
4. Signs the combined input using the sidecar's [SPIFFE](https://spiffe.io/) X.509 private key (SVID).
5. Persists the signature and the signing certificate alongside the history.

On every subsequent load of that workflow's state, Dapr walks the full
signature chain and verifies every link before allowing execution to continue.

{{< mermaid >}}
flowchart LR
    subgraph History["Workflow History"]
        E0["Event 0"] --- E1["Event 1"] --- E2["Event 2"] --- E3["Event 3"] --- E4["Event 4"] --- E5["Event 5"]
    end

    subgraph Signatures["Signature Chain"]
        S0["Sig 0<br/>Events [0,2)"]
        S1["Sig 1<br/>Events [2,4)"]
        S2["Sig 2<br/>Events [4,6)"]
        S0 -->|prev digest| S1 -->|prev digest| S2
    end

    E0 & E1 -.-> S0
    E2 & E3 -.-> S1
    E4 & E5 -.-> S2

    subgraph Certs["Certificate Table"]
        C0["Cert 0<br/>SVID from Boot 1"]
        C1["Cert 1<br/>SVID from Boot 2"]
    end

    S0 -.->|cert index 0| C0
    S1 -.->|cert index 0| C0
    S2 -.->|cert index 1| C1
{{< /mermaid >}}

Each signature covers a contiguous range of events and references the previous
signature's digest, forming a hash chain. A certificate table stores the
DER-encoded X.509 certificate chains used for signing, indexed by position.
When the sidecar's SVID rotates (for example, after a restart), a new certificate
entry is appended and subsequent signatures reference the new index.

## Prerequisites

History signing requires [mTLS]({{% ref "mtls.md" %}}) to be enabled. mTLS provides the SPIFFE
X.509 identity that is used as the signing key. Without mTLS, there is no
identity material available and signing is silently disabled.

In a standard Dapr deployment with the [Sentry service]({{% ref "security-concept.md" %}}), mTLS is enabled by default.

## Configuration

History signing is controlled by the `WorkflowHistorySigning` feature flag. It is
**disabled by default** and must be explicitly enabled.

### Enabling signing

To enable signing, set the feature flag to `true` in your Dapr configuration:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: my-config
spec:
  features:
    - name: WorkflowHistorySigning
      enabled: true
```

### Conditions for signing to be active

Both conditions must be true for signing to occur:

| Condition | How to check |
|-----------|-------------|
| mTLS is enabled | Sentry service is running and the sidecar has a valid SVID |
| `WorkflowHistorySigning` is enabled | Feature flag is explicitly set to `true` |

If mTLS is disabled (no Sentry), the signer is `nil` regardless of the feature
flag, and signing does not occur.

{{% alert title="Important" color="warning" %}}
**Signing is a one-way commitment.** Once a workflow is created with signing
enabled, it must always run on signing-enabled hosts. Disabling signing on a
host that loads a previously signed workflow will cause the workflow to fail.
Similarly, enabling signing on a host that loads a previously unsigned workflow
will cause the workflow to fail. See [one-way commitment](#one-way-commitment)
for details.
{{% /alert %}}

### Scope

Signing is applied at the sidecar level. When the feature flag is enabled on
a Dapr configuration, **every workflow that runs on a sidecar using that
configuration is signed** - there is no per-workflow-type or per-instance
opt-in. If you need to introduce signing only for a subset of workflows, run
those workflows under a separate appID with a configuration that enables the
feature.

### Activating signing on an existing deployment

Because signing is a [one-way commitment](#one-way-commitment), turning the
feature on against a cluster that already has running unsigned workflows will
cause those in-flight workflows to fail to load. You do **not** need a brand
new deployment, but you do need to drain unsigned work before flipping the
flag. A typical rollout looks like:

1. Stop scheduling new workflow instances on the appIDs that will get signing.
2. Allow in-flight workflows to complete naturally, or
   [purge]({{% ref "howto-manage-workflow.md" %}}) ones you don't need to keep.
3. Confirm there is no unsigned workflow state remaining for those appIDs.
4. Update the Dapr configuration to set `WorkflowHistorySigning` to `true`.
5. Wait for the configuration change to propagate to the sidecars (Dapr
   [hot-reloads]({{% ref "component-updates.md" %}}) configurations by default,
   so no restart is needed; just allow time for propagation across all
   sidecars).
6. Resume scheduling. New workflow instances are signed from the first event.

If you cannot drain in-flight workflows, run a parallel appID (with signing
enabled) for new work and let the original appID complete its workflows
without signing. Once the original appID has no remaining instances, retire it.

## One-way commitment

Signing is a permanent commitment per workflow. Once a workflow is created with
signing enabled, all subsequent operations on that workflow must occur on
signing-enabled hosts. There are two invariants:

1. **Signed workflow on non-signing host**: If a workflow has signed history but
   the current host does not have a signer configured (mTLS is off or the
   feature flag is disabled), loading the workflow fails. The workflow cannot
   execute and is effectively terminated.

2. **Unsigned workflow on signing host**: If a workflow was created without
   signing (the feature flag was off) and is later loaded by a signing-enabled
   host, loading fails. The unsigned history has no integrity proof and
   cannot be retroactively signed.

{{% alert title="Migration guidance" color="warning" %}}
Before enabling signing cluster-wide, ensure all existing unsigned workflows
have completed or been purged. Once signing is enabled, new workflows are
signed and existing unsigned workflows fail to load.
{{% /alert %}}

## Certificate rotation

Dapr handles certificate rotation transparently. When the sidecar's SVID
rotates (for example, after a restart where Sentry issues a new short-lived
certificate, or when the SVID naturally expires), the signing system:

1. Detects that the current certificate differs from the last entry in the
   certificate table.
2. Appends a new certificate entry to the table.
3. New signatures reference the new certificate index.

Previous signatures remain valid because they reference their original
certificate, which is still in the table and verifiable against the CA trust
anchors.

{{< mermaid >}}
gantt
    title Signature Certificate Usage Over Time
    dateFormat X
    axisFormat %s

    section Boot 1
    Sig 0 - Cert A : 0, 2
    Sig 1 - Cert A : 2, 4

    section Restart
    SVID rotates : milestone, 4, 0

    section Boot 2
    Sig 2 - Cert B : 4, 6
    Sig 3 - Cert B : 6, 8
{{< /mermaid >}}

Both Cert A and Cert B chain to the same Sentry CA, so all signatures remain
valid.

In multi-replica deployments, each replica has its own private key and SVID
certificate. When the workflow runtime migrates between replicas (for
example, due to scaling or rebalancing), the new replica's certificate is
appended to the table. All certificates are validated as belonging to the same
app ID via SPIFFE identity binding.

{{% alert title="Important" color="warning" %}}
**Certificate rotation** (new leaf SVID, same CA root) works seamlessly.

A full **CA rotation** (completely different root CA) will cause verification
to fail for workflows signed under the old CA, because the old signing
certificates will not chain to the new trust anchors. This is by design: if
the trust root changes, previously signed data cannot be verified.
{{% /alert %}}

### Long-running workflows and root CA expiry

This is the operational consideration that has the biggest practical impact
on signed workflows, and is worth calling out separately.

By default Dapr generates a self-signed root CA that is valid for **one year**.
If that root expires (or is replaced with a CA built from a different private
key), any workflow whose signature chain trusts the old root **stops being
verifiable**. Signed long-running workflows that outlive a CA rotation will
fail to load and surface as `FAILED` with `SignatureVerificationFailed`.

To keep long-running signed workflows healthy across CA renewals, do **one**
of the following:

1. **Rotate the leaf/issuer cert, keep the same root key.** This is the
   recommended path. The Dapr CLI supports it with
   `dapr mtls renew-certificate -k --private-key <existing-root-key>` (see
   [renew certificates]({{% ref "mtls.md#root-and-issuer-certificate-upgrade-using-cli-recommended" %}})).
   Existing signed workflows continue to verify against the same root.
2. **Bring your own CA.** Provide a root certificate whose private key you
   control and store securely (for example, in your own HSM or secret store).
   Renew the leaf/issuer with the same root key indefinitely. See
   [bringing your own certificates]({{% ref "mtls.md#bringing-your-own-certificates" %}}).
3. **Drain before rotating to a new root.** If you must rotate to a brand new
   root key, complete or purge in-flight signed workflows first. Signing is a
   one-way commitment, so there is no "re-sign with the new root" operation.

{{% alert title="Plan your CA lifecycle before enabling signing" color="warning" %}}
If your workflows can run for weeks or months, **back up your root private
key** and treat root CA rotation as a planned, drain-and-rotate event. Losing
the root key or rotating to a freshly generated root will permanently break
verification for any signed workflow that was issued under the old root.
{{% /alert %}}

## How signing works

### Signing new events

After each workflow execution step, Dapr signs the newly appended
history events.

{{< mermaid >}}
flowchart LR
    A["Marshal events<br/>(deterministic<br/>protobuf)"] --> B["Compute digests<br/>& chain to<br/>previous signature"] --> C["Sign with<br/>SVID private key"]
    C --> D["Persist signature<br/>+ certificate<br/>+ history events"]
{{< /mermaid >}}

The signing process works as follows:

1. **Deterministic marshaling**: Each new `HistoryEvent` is marshaled using
   protobuf's deterministic mode, producing stable bytes for the same message.
   These exact bytes are both signed and persisted to the state store.

2. **Events digest**: A SHA-256 hash is computed over the batch of marshaled
   events, with each event length-prefixed (big-endian uint64) to prevent
   concatenation ambiguity.

3. **Chain linkage**: The SHA-256 digest of the previous `HistorySignature`
   protobuf message is computed. The root signature (first in the chain) has
   no previous digest.

4. **Signature input**: The final signing input is
   `SHA-256(previousSignatureDigest || eventsDigest)`.

5. **Cryptographic signing**: The input is signed using the sidecar's SPIFFE
   X.509 private key. The signing key type is whatever Sentry issues to the
   sidecar; Dapr supports Ed25519, ECDSA P-256, and RSA. You don't choose the
   key type per workflow: it follows from the [mTLS]({{% ref "mtls.md" %}})
   setup (Dapr-generated keys default to Ed25519 from 1.18 onwards, custom CAs
   sign with whatever algorithm the issuer key uses).

6. **Certificate resolution**: If the current SVID certificate matches the
   last entry in the certificate table, the existing index is reused.
   Otherwise, a new entry is appended. This handles [certificate rotation](#certificate-rotation)
   transparently.

7. **Persistence**: The signature, any new certificate entry, and the history
   events are all persisted to the state store in a single transactional write,
   ensuring atomicity.

### Verification on load

Every time workflow state is loaded (whether for execution or a metadata query)
the full signature chain is verified.

{{< mermaid >}}
flowchart TD
    A["Load workflow state<br/>from state store"] --> B{"Signatures<br/>present?"}
    B -->|"No, but signer<br/>configured and<br/>history exists"| N["FAIL: unsigned<br/>history cannot<br/>be loaded with<br/>signing enabled"]
    B -->|"No, signer not<br/>configured"| C["Continue without<br/>verification"]
    B -->|Yes| D{"Signer<br/>configured?"}
    D -->|No| W["FAIL: signed<br/>history cannot<br/>be loaded without<br/>a signer"]
    D -->|Yes| E["Verify chain<br/>linkage"]
    E --> F["Verify event<br/>range contiguity"]
    F --> G["Recompute events<br/>digest from raw bytes"]
    G --> H["Verify cryptographic<br/>signature"]
    H --> I["Validate certificate<br/>time window"]
    I --> J["Verify certificate<br/>chain-of-trust to CA"]
    J --> K["Verify SPIFFE<br/>app identity"]
    K --> L["All events<br/>covered?"]
    L -->|Yes| P["Verification<br/>passed ✓"]
    L -->|No| M["Verification<br/>failed ✗"]
    E -->|Mismatch| M
    F -->|Gap| M
    G -->|Mismatch| M
    H -->|Failed| M
    I -->|Expired| M
    J -->|Untrusted| M
    K -->|Wrong app| M
{{< /mermaid >}}

The verification steps for each signature in the chain are:

| Step | Check | Detects |
|------|-------|---------|
| Chain linkage | `previousSignatureDigest` matches `SHA-256(previous signature)` | Reordered or inserted signatures |
| Contiguity | Event ranges are adjacent with no gaps | Missing signatures |
| Events digest | Recompute SHA-256 from raw stored bytes | Tampered, inserted, or deleted events |
| Cryptographic signature | Verify against public key from the signing certificate | Forged signatures |
| Certificate validity | Certificate was valid at the time of the last signed event | Expired or backdated certificates |
| Chain-of-trust | Certificate chains to a trusted Sentry CA root | Signing by untrusted identity |
| App identity | SPIFFE ID in certificate matches the workflow's owning app | Cross-app signature forgery |
| Full coverage | Signatures cover every event from index 0 to the end | Partially unsigned history |

Verification uses the **raw bytes from the state store**, not re-marshaled
events. This ensures that any byte-level modification to persisted events is
detected.

### Inbox event validation

When signing is enabled, the Dapr workflow runtime validates inbox events before
processing them. Result events (`TaskCompleted`, `TaskFailed`,
`ChildWorkflowInstanceCompleted`, `ChildWorkflowInstanceFailed`) must reference
an operation that was actually scheduled in the signed history. Events that
reference non-existent operations, such as a `TaskCompleted` for a task ID
that was never scheduled, are considered injected and are purged from the
inbox. This prevents an attacker with state store access from injecting fake
activity or child workflow results that would otherwise be signed into the
history chain.

### Child workflow and activity attestation

The same-workflow signature chain only protects history that the workflow
itself produced. Cross-identity completion events (a child workflow or activity
running under a different SPIFFE identity reporting back to the parent) need
their own cryptographic proof. Dapr emits an attestation on every cross-identity
completion and verifies it before the event enters the parent's inbox.

When a child workflow or activity completes, the executor attaches one of:

- `ChildCompletionAttestation` (on `ChildWorkflowInstanceCompleted` /
  `ChildWorkflowInstanceFailed`).
- `ActivityCompletionAttestation` (on `TaskCompleted` / `TaskFailed`).

Each attestation commits to a deterministic, language-independent payload:

| Field | Description |
| --- | --- |
| `parentInstanceId` + `parentTaskScheduledId` | Bind the proof to a specific invocation. Prevents cross-instance and cross-task replay. |
| `ioDigest` | SHA-256 over canonicalized, NFC-normalized input and output bytes. Identical across SDKs because the encoding is wire-format-independent and spec-versioned. |
| `signerCertDigest` | SHA-256 of the signer's DER-encoded X.509 chain. The chain itself travels alongside the attestation as a wire-only companion field. |
| `terminalStatus` | The workflow or activity outcome. For activities, the activity name is also committed. |

On receipt, the parent's Dapr workflow runtime runs `verifyInboxAttestation` before the
event is appended to the inbox:

1. The attestation must be present (signing on implies sender must attest).
2. The companion certificate's digest must match the committed
   `signerCertDigest`.
3. The certificate chain must validate against a Sentry trust anchor.
4. The signature must verify over the exact attestation payload bytes (no
   re-marshaling on the receiver side).
5. `parentInstanceId` must equal the receiving workflow's actor ID.
6. `parentTaskScheduledId` must resolve to a `TaskScheduled` or
   `ChildWorkflowInstanceCreated` event already present in the signed history.
7. `ioDigest` must equal the canonical digest of the parent's scheduling input
   together with the reported output.
8. `terminalStatus` must match the enclosing event type.

If any check fails, the inbound completion is rejected and the workflow is
tombstoned into failure. Once verified, the foreign certificate is absorbed
into a content-addressed `ext-sigcert-NNNNNN` table on the receiver so the same
signer is not re-validated on every subsequent completion. The chain-of-trust
result is also cached per workflow instance for the lifetime of that instance,
so a workflow that calls the same foreign signer repeatedly pays chain
validation cost only once.

### Lineage propagation verification

When a workflow's history is forwarded to another workflow as
`IncomingHistory` under `PropagateLineage` (typically multi-hop child
invocations across apps), the receiving workflow needs to verify the forwarded
content. Because the propagated bytes do not become part of the receiver's own
signed `History`, an independent per-chunk signature is attached at dispatch
time.

Each `PropagatedHistoryChunk` carries:

- The original events as produced by the chunk's authoring app, byte-for-byte.
- A fresh chunk-local signature over those events, produced by the chunk's app
  using its current SPIFFE X.509 key.
- The DER-encoded certificate chain for that signing key.

On ingestion, every chunk is verified independently:

| Check | Detects |
| --- | --- |
| Chain-of-trust to a Sentry trust anchor (reusing the per-instance cache) | Forged or self-signed lineage |
| Leaf SPIFFE ID's app component matches the chunk's declared `appId` | Lineage produced by the wrong app |
| Per-chunk signature covers exactly the events in the chunk, contiguously | Splicing, gaps, or partial omission |
| Empty-with-signatures, missing-signatures, missing-certificate variants | Malformed chunks that would otherwise short-circuit verification |

Verified foreign certificates are absorbed into the same `ext-sigcert-NNNNNN`
table used by completion attestations, so downstream attestation lookups can
content-address them.

## What happens when verification fails

When signature verification fails, Dapr's response depends on whether the
workflow is still in custody of the executor, and on whether the failure is a
genuine tamper or a host configuration mismatch. In every case the original
history, signatures, and inbox are **never modified**; the untrusted data is
preserved for forensic analysis.

### Tamper of an in-flight workflow

When the Dapr workflow runtime loads a running workflow and detects tampering,
Dapr stops the executor from acting on forged input by appending a single
**unsigned terminal `ExecutionCompleted` event** marked with the well-known
error type `DAPR_WORKFLOW_HISTORY_TAMPERED`. This:

1. Halts further execution: the workflow is now in a terminal state and the
   Dapr workflow runtime will not replay or schedule new work on it.
2. Provides a stable, machine-matchable signal for clients
   (`DAPR_WORKFLOW_HISTORY_TAMPERED`).
3. Preserves the original (untrusted) history and signatures so operators can
   inspect what was tampered with.

From an application perspective the workflow surfaces as `FAILED`, and any
client that calls `GetWorkflow` (or the equivalent SDK method) on the instance
receives the failure with the `DAPR_WORKFLOW_HISTORY_TAMPERED` error type in
the failure details. SDKs raise this as the same exception type that a normal
workflow failure would raise, so existing error-handling paths can match on
the error type to specifically detect tampering. The Dapr sidecar also emits
an error-level log entry naming the workflow instance ID and the specific
verification check that failed.

`LoadWorkflowState` recognises the tamper marker and bypasses signature
verification on subsequent loads, so the workflow can be read back and surfaced
as `FAILED` rather than failing to load entirely. Reminders for the workflow
and its activities are deleted to stop the engine from endlessly retrying a
compromised workflow.

The tamper-recovery path is scoped to workflows still in custody of the
executor. **Workflows that had already completed** before the tamper happened
are left untouched: there is nothing for the executor to do, and the
verification error is surfaced to readers (metadata queries) who are
responsible for detecting the tampering at read time.

### Configuration error

A mismatch between signed history and host signing configuration (signed
workflow loaded by a host without a signer, or unsigned workflow loaded by a
signing-enabled host) is reported as a distinct `ConfigurationError`, not as
tampering. The tamper-recovery path described above does not run against these
intact-but-unloadable workflows: their history is byte-identical to what was
written, so appending a tamper-terminal event would itself be a destructive
edit. Fix the host configuration, or purge the workflow, to recover.

The error is visible in two places: the Dapr sidecar logs an error-level entry
on the failed load (naming the workflow instance ID and whether the host was
expected to have or not have a signer), and callers that issue a workflow
metadata query (`GET /v1.0/workflows/<id>` or the SDK equivalent) receive the
`ConfigurationError` directly in the response, allowing programmatic detection.

### Metadata queries (API path)

When a workflow metadata query (such as `GET /v1.0/workflows/<id>` or
`FetchWorkflowMetadata`) encounters a verification error, the error is returned
directly to the caller. The error message contains the specific reason for
failure (for example, digest mismatch, attestation verification failure, or
certificate trust failure).

{{< mermaid >}}
flowchart TD
    A["Load workflow state"] --> B["Verify signature chain<br/>+ attestations + lineage"]
    B -->|Pass| C["Continue normal<br/>execution"]
    B -->|Fail| D{"Failure type"}
    D -->|Tamper, in-flight| E["Append unsigned<br/>terminal event<br/>(DAPR_WORKFLOW_HISTORY_TAMPERED)<br/>+ delete reminders"]
    D -->|Tamper, completed| F["Return error<br/>to reader"]
    D -->|ConfigurationError| G["Return error<br/>to reader<br/>(no terminal append)"]
    D -->|Metadata query path| F
    E --> H["Workflow surfaces<br/>as FAILED on<br/>next read"]
    F --> I["State store<br/>NOT modified"]
    G --> I
{{< /mermaid >}}

### Common failure causes

| Cause | What happened | Detection |
|-------|--------------|-----------|
| Tampered history | A history event was modified directly in the state store | Events digest mismatch |
| Deleted event | A history event was removed from the state store | Event count or coverage mismatch |
| Inserted event | An event was added outside of normal workflow execution | Events digest mismatch |
| Reordered events | Events were rearranged in the state store | Events digest mismatch |
| Injected inbox event | A fake result was written to the inbox in the state store | Inbox validation: no matching scheduled operation |
| CA change | Sentry CA was rotated to a completely new root | Certificate chain-of-trust failure |
| Cross-app forgery | A certificate from a different app was used to sign | SPIFFE app identity mismatch |
| Corrupted signature | A signature entry was modified in the state store | Cryptographic signature verification failure or chain linkage mismatch |
| Forged child or activity completion | A cross-identity completion event was injected without a valid attestation | Inbox attestation verification fails (missing attestation, bad signature, wrong parent ID or task scheduled ID, ioDigest mismatch) |
| Tampered propagated lineage | A `PropagatedHistoryChunk` was modified, swapped, or signed by the wrong app | Per-chunk signature, chain-of-trust, or SPIFFE app-ID check fails |
| Signing disabled (ConfigurationError) | A signed workflow was loaded by a non-signing host | "signed history but no signer is configured" |
| Signing enabled on unsigned (ConfigurationError) | An unsigned workflow was loaded by a signing host | "unsigned history events but signing is enabled" |

## State store layout

Workflow signing data is stored alongside the workflow state using the
following key prefixes. All keys are scoped to the workflow instance's
ID.

| Key pattern | Content | Format |
|------------|---------|--------|
| `history-NNNNNN` | History events | Protobuf `HistoryEvent` |
| `signature-NNNNNN` | Signature entries | Protobuf `HistorySignature` |
| `sigcert-NNNNNN` | Signing certificates (own SPIFFE identity) | Protobuf `SigningCertificate` (DER-encoded X.509 chain) |
| `ext-sigcert-NNNNNN` | Foreign signing certificates absorbed from verified completion attestations and lineage chunks (deduped by digest) | Protobuf `SigningCertificate` (DER-encoded X.509 chain) |
| `metadata` | Counts and generation | Protobuf `WorkflowStateMetadata` |

The `NNNNNN` suffix is a zero-padded 6-digit index (for example, `signature-000000`,
`signature-000001`).

The `metadata` entry tracks the count of each entry type so the loader knows
exactly how many keys to fetch. All writes (history events, signatures,
certificates, metadata) are persisted in a single transactional state
operation, ensuring atomicity.

## Security properties

| Property | Guarantee |
|----------|-----------|
| **Tamper detection** | Any modification to persisted history events changes the events digest, breaking verification |
| **Chain integrity** | The `previousSignatureDigest` linkage prevents reordering, inserting, or removing signatures |
| **Non-repudiation** | Each signature is bound to a specific X.509 identity (SPIFFE SVID) |
| **App identity binding** | The SPIFFE ID in each signing certificate is validated against the workflow's owning app ID, preventing cross-app forgery |
| **Time binding** | Certificate validity is checked against the event timestamp, preventing use of expired credentials |
| **Trust anchoring** | All signing certificates are verified against the Sentry CA trust bundle |
| **Inbox validation** | Activity and child workflow results are validated against scheduled operations in signed history, preventing injection of fake results |
| **Cross-identity attestation** | Child workflow and activity completions are cryptographically attested by the executing identity and verified by the parent before they enter the inbox |
| **Lineage integrity** | Forwarded `PropagatedHistoryChunk`s are individually signed and verified against the producing app's SPIFFE identity |
| **Immutable history** | Dapr never modifies the existing workflow history, signatures, or inbox; the only write on tamper detection is an unsigned terminal `ExecutionCompleted` event with error type `DAPR_WORKFLOW_HISTORY_TAMPERED` |
| **One-way commitment** | Signing cannot be disabled for signed workflows or enabled for unsigned workflows |

## Frequently asked questions

### Does signing add latency to workflow execution?

The signing operation itself (SHA-256 hashing and ECDSA/Ed25519/RSA signing) is
fast and adds negligible CPU latency. The measurable cost is on the state store
side: each workflow step now persists additional entries (a signature entry,
and on certificate rotation a new certificate entry) alongside the history
events. These extra entries are written in the same transactional batch as the
history events, so they cost one larger transaction rather than additional
round-trips, but they do increase the payload size and the storage footprint
per workflow. The exact impact depends on your state store's pricing and write
characteristics.

### What happens if I disable signing on a workflow that was previously signed?

The workflow **fails to load**. Signing is a [one-way commitment](#one-way-commitment):
once a workflow has signed history, it must always run on a signing-enabled
host. This prevents an attacker from disabling signing to bypass verification.

### Can I enable signing on workflows that were created without it?

**No.** Enabling signing on a host that loads unsigned workflow history causes a
verification error. The unsigned history has no integrity proof and cannot be
retroactively signed, because events written without signing could have been
tampered with. Ensure all unsigned workflows complete or are purged before
enabling signing cluster-wide.

### What happens during a Sentry CA rotation?

**Certificate rotation** (new leaf SVID, same CA root): works seamlessly.
Multiple certificates are stored in the certificate table and each signature
references its specific certificate. All certificates chain to the same CA.

**CA rotation** (completely new root CA): verification fails for workflows
whose signing certificates were issued by the old CA. The workflow is
reported as FAILED with `SignatureVerificationFailed`. This is intentional:
the trust root has changed and previously signed data cannot be verified
against the new trust anchors. See [long-running workflows and root CA
expiry](#long-running-workflows-and-root-ca-expiry) for the operational
guidance to avoid this.

### What about multi-replica deployments?

Each replica of the same app ID has its own private key and SVID certificate.
When the workflow runtime migrates between replicas, each replica's
certificate is stored in the certificate table and the signature chain remains
valid. All certificates are verified as belonging to the same app ID via SPIFFE
identity binding.

### What state store backends are supported?

History signing works with any state store that supports the actor state
transactional API. The signing data is stored as additional key-value entries
alongside the existing workflow state.

## Related links

- [Workflow overview]({{% ref workflow-overview.md %}})
- [Workflow architecture]({{% ref workflow-architecture.md %}})
- [Setup & configure mTLS]({{% ref mtls.md %}})
- [Multi-app workflows]({{% ref workflow-multi-app.md %}})
- [History retention policy]({{% ref workflow-history-retention-policy.md %}})
