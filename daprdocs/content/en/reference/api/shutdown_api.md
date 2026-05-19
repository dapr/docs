---
type: docs
title: "Shutdown API reference"
linkTitle: "Shutdown API"
description: "Detailed documentation on the Shutdown API"
weight: 1100
---

The Shutdown API triggers a graceful shutdown of the Dapr sidecar (`daprd`). It is the same shutdown path that runs when daprd receives a `SIGTERM`: input bindings and pub/sub subscriptions are closed, in-flight requests are allowed to complete (subject to `--dapr-graceful-shutdown-seconds`), reminders and components are flushed, and then the process exits.

The API has two modes:

- **Graceful** (default): triggers the normal shutdown sequence and returns.
- **Force**: skips the graceful sequence and exits the process via `os.Exit(1)` after a short delay so the HTTP/gRPC response can flush. Intended for stuck sidecars where draining is not making progress.

## HTTP request

```
POST http://localhost:<daprPort>/v1.0/shutdown
```

### URL parameters

This endpoint takes no path or query parameters.

### Request headers

| Header | Required | Description |
| --- | :---: | --- |
| `Dapr-Force-Shutdown` | N | When present (any non-empty value), causes daprd to skip the graceful shutdown sequence and exit immediately via `os.Exit(1)` after flushing the HTTP response. |

### Response

A successful call returns HTTP `204 No Content`. The sidecar then begins shutting down asynchronously, which means subsequent requests against the sidecar will start failing as services close. Callers should not depend on the response timing as a signal that shutdown has completed; use process or container lifecycle signals for that.

### Examples

Trigger a graceful shutdown:

```bash
curl -X POST http://localhost:3500/v1.0/shutdown
```

Force an immediate shutdown without draining:

```bash
curl -X POST -H "Dapr-Force-Shutdown: 1" http://localhost:3500/v1.0/shutdown
```

## gRPC request

The gRPC equivalent is `dapr.proto.runtime.v1.Dapr/Shutdown` (`v1`) and `dapr.proto.runtime.v1.Dapr/ShutdownAlpha1` is **not** offered; the Shutdown RPC is GA at `v1`.

### gRPC metadata

| Metadata key | Required | Description |
| --- | :---: | --- |
| `dapr-force-shutdown` | N | When present, daprd skips graceful shutdown and exits via `os.Exit(1)` after a short delay. Equivalent to the `Dapr-Force-Shutdown` HTTP header (the HTTP handler bridges the header onto the gRPC metadata context so `Universal.Shutdown` keeps a single code path). |

## When to use which mode

| Mode | When | Caveats |
| --- | --- | --- |
| Graceful (default) | Normal operator-driven shutdown, automated CI cleanup, a [Kubernetes Job that needs daprd to exit cleanly]({{% ref "kubernetes-job.md" %}}) | Bounded by `--dapr-graceful-shutdown-seconds` (default 5) and `--dapr-block-shutdown-duration`. The sidecar will not exit before the configured drain or block windows complete. |
| Force | A sidecar that is wedged and not making drain progress, end-to-end tests that need a deterministic teardown | The exit code is `1`. Container orchestrators that interpret non-zero exits as failures will treat this as a crash; use only when that is acceptable. |

## API allowlist

`Shutdown` can be allowed or denied via the [API allowlist]({{% ref "api-allowlist.md" %}}) using `shutdown` as the API name (HTTP: `v1.0`, gRPC: `v1`).

## Related links

- [Dapr Kubernetes Jobs]({{% ref "kubernetes-job.md" %}})
- [Sidecar health and graceful shutdown]({{% ref "sidecar-health.md#delay-graceful-shutdown" %}})
- [Sidecar arguments and annotations]({{% ref "arguments-annotations-overview.md" %}})
- [API allowlist]({{% ref "api-allowlist.md" %}})
