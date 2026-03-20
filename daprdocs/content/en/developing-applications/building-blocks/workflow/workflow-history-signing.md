---
type: docs
title: "Workflow history signing"
linkTitle: "History signing"
weight: 9000
description: "Cryptographic tamper detection for workflow execution histories"
---

Dapr workflow history signing provides cryptographic tamper detection for
workflow execution histories. Every history event produced during a workflow's
lifetime is signed using the sidecar's mTLS identity (X.509 SVID), creating an
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
4. Signs the combined input using the sidecar's [SPIFFE](https://spiffe.io/) X.509 private key.
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

History signing is controlled by the `WorkflowSignState` feature flag. It is
**enabled by default** when mTLS is active.

### Default behavior (signing enabled)

No configuration is needed. When Dapr starts with mTLS, workflow history
signing is automatically active.

### Disabling signing

To explicitly disable signing, set the feature flag to `false` in your Dapr
configuration:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: my-config
spec:
  features:
    - name: WorkflowSignState
      enabled: false
```

When signing is disabled:

- New history events are written without signatures.
- Existing signatures in the state store are ignored during loading.
- No signing certificates are stored.

### Conditions for signing to be active

Both conditions must be true for signing to occur:

| Condition | How to check |
|-----------|-------------|
| mTLS is enabled | Sentry is running and the sidecar has a valid SVID |
| `WorkflowSignState` is not disabled | Feature flag is absent (defaults to `true`) or explicitly set to `true` |

If mTLS is disabled (no Sentry), the signer is `nil` regardless of the feature
flag, and signing does not occur.

## How signing works

### Signing new events

After each workflow execution step, the orchestrator signs the newly appended
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
   X.509 private key. Supported key types are Ed25519, ECDSA P-256, and RSA.

6. **Certificate resolution**: If the current SVID certificate matches the
   last entry in the certificate table, the existing index is reused.
   Otherwise, a new entry is appended. This handles [certificate rotation](#certificate-rotation)
   transparently.

7. **Persistence**: The signature, any new certificate entry, and the history
   events are all persisted to the state store in a single transactional write,
   ensuring atomicity.

### Verification on load

Every time workflow state is loaded — whether for execution or a metadata query —
the full signature chain is verified.

{{< mermaid >}}
flowchart TD
    A["Load workflow state<br/>from state store"] --> B["Signatures<br/>present?"]
    B -->|No| C["Continue without<br/>verification"]
    B -->|Yes| D["Signer<br/>configured?"]
    D -->|No| W["Log warning,<br/>skip verification"]
    D -->|Yes| E["Verify chain<br/>linkage"]
    E --> F["Verify event<br/>range contiguity"]
    F --> G["Recompute events<br/>digest from raw bytes"]
    G --> H["Verify cryptographic<br/>signature"]
    H --> I["Validate certificate<br/>time window"]
    I --> J["Verify certificate<br/>chain-of-trust to CA"]
    J --> K["All events<br/>covered?"]
    K -->|Yes| L["Verification<br/>passed ✓"]
    K -->|No| M["Verification<br/>failed ✗"]
    E -->|Mismatch| M
    F -->|Gap| M
    G -->|Mismatch| M
    H -->|Failed| M
    I -->|Expired| M
    J -->|Untrusted| M
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
| Full coverage | Signatures cover every event from index 0 to the end | Partially unsigned history |

Verification uses the **raw bytes from the state store**, not re-marshaled
events. This ensures that any byte-level modification to persisted events is
detected.

## What happens when verification fails

When signature verification fails, Dapr takes two actions depending on the
code path. In both cases, the history and signatures in the state store are
**never modified** — the original data is preserved for forensic analysis.

### Running workflows (orchestrator path)

When the orchestrator actor loads workflow state and verification fails:

1. **Reminders are deleted** for both the workflow and its activities. This
   prevents the workflow engine from endlessly retrying a workflow whose
   history has been compromised.
2. The error is propagated. The workflow will not execute further.

### Metadata queries (API path)

When a workflow metadata query (such as `GET /v1.0/workflows/<id>` or
`FetchWorkflowMetadata`) encounters a verification error:

1. The workflow is reported as **FAILED** with the following failure details:
   - **Error type**: `SignatureVerificationFailed`
   - **Error message**: Contains `"signature verification failed"` and the
     specific reason (for example, digest mismatch or certificate trust failure)
   - **Non-retriable**: `true`

2. The actual history and signatures remain untouched in the state store.

{{< mermaid >}}
flowchart TD
    A["Load workflow state"] --> B["Verify signature chain"]
    B -->|Pass| C["Continue normal<br/>execution"]
    B -->|Fail| D{"Code path?"}
    D -->|Orchestrator| E["Delete reminders<br/>to stop retries"]
    D -->|Metadata query| F["Return FAILED status<br/>ErrorType: SignatureVerificationFailed"]
    E --> G["State store<br/>NOT modified"]
    F --> G
{{< /mermaid >}}

### Common failure causes

| Cause | What happened | Detection |
|-------|--------------|-----------|
| Tampered history | A history event was modified directly in the state store | Events digest mismatch |
| Deleted event | A history event was removed from the state store | Event count or coverage mismatch |
| Inserted event | An event was added outside of normal workflow execution | Events digest mismatch |
| Reordered events | Events were rearranged in the state store | Events digest mismatch |
| CA change | Sentry CA was rotated to a completely new root | Certificate chain-of-trust failure |
| Corrupted signature | A signature entry was modified in the state store | Cryptographic signature verification failure or chain linkage mismatch |

## Certificate rotation

Dapr handles certificate rotation transparently. When the sidecar's SVID
rotates (for example, after a restart where Sentry issues a new short-lived
certificate), the signing system:

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

{{% alert title="Important" color="warning" %}}
**Certificate rotation** (new leaf SVID, same CA root) works seamlessly.

A full **CA rotation** (completely different root CA) will cause verification
to fail for workflows signed under the old CA, because the old signing
certificates will not chain to the new trust anchors. This is by design: if
the trust root changes, previously signed data cannot be verified.
{{% /alert %}}

## Catch-up signing

When a workflow starts on a host where signing is disabled (or mTLS is not
configured) and later moves to a signing-enabled host (for example, after enabling the
feature flag and restarting), Dapr creates **catch-up signatures** to cover the
previously unsigned events.

{{< mermaid >}}
flowchart LR
    subgraph Phase1["Phase 1: No signing"]
        U0["Event 0<br/>(unsigned)"]
        U1["Event 1<br/>(unsigned)"]
        U2["Event 2<br/>(unsigned)"]
    end

    subgraph Phase2["Phase 2: Signing enabled"]
        CS["Catch-up Sig<br/>covers [0,3)<br/>using raw<br/>stored bytes"]
        E3["Event 3"]
        E4["Event 4"]
        NS["New Sig<br/>covers [3,5)"]
    end

    U0 & U1 & U2 -.-> CS
    CS -->|prev digest| NS
    E3 & E4 -.-> NS
{{< /mermaid >}}

The catch-up signature uses the raw bytes already stored in the state store
(not re-marshaled), ensuring it signs exactly what was persisted. After
catch-up, the signature chain provides contiguous coverage from event index 0.

## State store layout

Workflow signing data is stored alongside the workflow state using the
following key prefixes. All keys are scoped to the workflow instance's actor
ID.

| Key pattern | Content | Format |
|------------|---------|--------|
| `history-NNNNNN` | History events | Protobuf `HistoryEvent` |
| `signature-NNNNNN` | Signature entries | Protobuf `HistorySignature` |
| `sigcert-NNNNNN` | Signing certificates | Protobuf `SigningCertificate` (DER-encoded X.509 chain) |
| `metadata` | Counts and generation | Protobuf `WorkflowStateMetadata` |

The `NNNNNN` suffix is a zero-padded 6-digit index (for example, `signature-000000`,
`signature-000001`).

The `metadata` entry tracks the count of each entry type so the loader knows
exactly how many keys to fetch. All writes (history events, signatures,
certificates, metadata) are persisted in a single transactional state
operation, ensuring atomicity.

## Warnings and logging

### Signed history without signer configured

If Dapr loads workflow state that contains signatures but the current sidecar
does not have a signer configured (mTLS is off or the feature flag is
disabled), a warning is logged:

```
WARN: Workflow '<id>' has signed history but no signer is configured; signature verification skipped
```

The workflow continues to execute, but signatures are not verified and
new events are not signed.

### Signature verification failure

When verification fails, a warning is logged with the workflow actor ID:

```
WARN: Workflow actor '<id>': signature verification failed, deleting reminders to stop retries
```

## Security properties

| Property | Guarantee |
|----------|-----------|
| **Tamper detection** | Any modification to persisted history events changes the events digest, breaking verification |
| **Chain integrity** | The `previousSignatureDigest` linkage prevents reordering, inserting, or removing signatures |
| **Non-repudiation** | Each signature is bound to a specific X.509 identity (SPIFFE SVID) |
| **Time binding** | Certificate validity is checked against the event timestamp, preventing use of expired credentials |
| **Trust anchoring** | All signing certificates are verified against the Sentry CA trust bundle |
| **Immutable history** | Dapr never modifies workflow history after it is written, even on verification failure |

## Frequently asked questions

### Does signing add latency to workflow execution?

The signing operation (SHA-256 hashing and ECDSA/Ed25519 signing) is fast and
adds negligible latency. The main cost is the additional state store writes for
the signature and certificate entries, which are batched in the same
transactional write as the history events.

### What happens if I disable signing on a workflow that was previously signed?

The workflow continues to execute normally. Existing signatures in the
state store are ignored when no signer is configured. A warning is logged. New
events are not signed.

### Can I re-enable signing after disabling it?

Yes. When signing is re-enabled, [catch-up signatures](#catch-up-signing) are created to cover the
events that were written while signing was disabled. This restores contiguous
signature coverage from index 0.

### What happens during a Sentry CA rotation?

**Certificate rotation** (new leaf SVID, same CA root): works seamlessly.
Multiple certificates are stored in the certificate table and each signature
references its specific certificate. All certificates chain to the same CA.

**CA rotation** (completely new root CA): verification fails for workflows
whose signing certificates were issued by the old CA. The workflow is
reported as FAILED with `SignatureVerificationFailed`. This is intentional —
the trust root has changed and previously signed data cannot be verified
against the new trust anchors.

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
