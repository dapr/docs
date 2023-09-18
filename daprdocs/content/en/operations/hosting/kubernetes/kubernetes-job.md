---
type: docs
title: "Running Dapr with a Kubernetes Job"
linkTitle: "Kubernetes Jobs"
weight: 70000
description: "Use Dapr API in a Kubernetes Job context"
type: docs
---

The Dapr sidecar is designed to be a long running process. In the context of a [Kubernetes Job](https://kubernetes.io/docs/concepts/workloads/controllers/job/) this behavior can block your job completion.

To address this issue, the Dapr sidecar has an endpoint to `Shutdown` the sidecar.

When running a basic [Kubernetes Job](https://kubernetes.io/docs/concepts/workloads/controllers/job/), you need to call the `/shutdown` endpoint for the sidecar to gracefully stop and the job to be considered `Completed`.

When a job is finished without calling `Shutdown`, your job is in a `NotReady` state with only the `daprd` container running endlessly.

Stopping the Dapr sidecar causes its readiness and liveness probes to fail in your container.

To prevent Kubernetes from trying to restart your job, set your job's `restartPolicy` to `Never`.

Be sure to use the *POST* HTTP verb when calling the shutdown HTTP API. For example:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: job-with-shutdown
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "with-shutdown"
    spec:
      containers:
      - name: job
        image: alpine
        command: ["/bin/sh", "-c", "apk --no-cache add curl && sleep 20 && curl -X POST localhost:3500/v1.0/shutdown"]
      restartPolicy: Never
```

You can also call the `Shutdown` from any of the Dapr SDKs. For example, for the Go SDK:

```go
package main

import (
	"context"
	"log"
	"os"

	dapr "github.com/dapr/go-sdk/client"
)

func main() {
  client, err := dapr.NewClient()
  if err != nil {
    log.Panic(err)
  }
  defer client.Close()
  defer client.Shutdown()
  // Job
}
```

## Related links

- [Deploy Dapr on Kubernetes]({{< ref kubernetes-deploy.md >}})
- [Upgrade Dapr on Kubernetes]({{< ref kubernetes-upgrade.md >}})