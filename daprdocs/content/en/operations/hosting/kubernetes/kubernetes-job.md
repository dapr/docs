---
type: docs
title: "Running Dapr with a Kubernetes Job"
linkTitle: "Kubernetes Jobs"
weight: 70000
description: "Use Dapr API in a Kubernetes Job context"
type: docs
---

# Kubernetes Job

The Dapr sidecar is designed to be a long running process, in the context of a [Kubernetes Job](https://kubernetes.io/docs/concepts/workloads/controllers/job/) this behaviour can block your job completion.
To address this issue the Dapr sidecar has an endpoint to `Shutdown` the sidecar.

When running a basic [Kubernetes Job](https://kubernetes.io/docs/concepts/workloads/controllers/job/) you will need to call the `/shutdown` endpoint for the sidecar to gracefully stop and the job will be considered `Completed`.

When a job is finish without calling `Shutdown` your job will be in a `NotReady` state with only the `daprd` container running endlessly.

Be sure and use the *POST* HTTP verb when calling the shutdown API.

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

You can also call the `Shutdown` from any of the Dapr SDK

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
