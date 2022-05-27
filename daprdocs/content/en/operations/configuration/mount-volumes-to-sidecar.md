---
type: docs
title: "How-To: Mount volumes to Dapr sidecar"
linkTitle: "Mount volumes to sidecar"
weight: 6500
description: "Configure sidecar to mount Pod Volumes"
---

The Dapr sidecar can be configured to mount any Volume attached to the application Pod. These volumes can be accessed by the sidecar in _read-only_ or _read-write_ modes. If a Volume is configured to be mounted but it does not exist in the Pod, Dapr logs a warning and ignores it.
For more information on different types of Volumes, check [Volumes | Kubernetes](https://kubernetes.io/docs/concepts/storage/volumes/).


{{< tabs Kubernetes >}}

{{% codetab %}}

You can set the following annotations in your App deployment YAML:
1. **dapr.io/volume-mounts**: for read-only volume mounts
1. **dapr.io/volume-mounts-rw**: for read-write volume mounts

Make sure that the corresponding Volumes exist in the Pod spec.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: default
  labels:
    app: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "myapp"
        dapr.io/app-port: "8000"
        dapr.io/volume-mounts: "my-volume1:/tmp/sample1,my-volume2:/tmp/sample2"
        dapr.io/volume-mounts-rw: "my-volume3:/tmp/sample3"
    spec:
      volumes:
        - name: my-volume1
          hostPath:
            path: /sample
        - name: my-volume2
          persistentVolumeClaim:
            claimName: pv-sample
        - name: my-volume3
          emptyDir: {}
...
```

{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Dapr Kubernetes pod annotations spec]({{< ref arguments-annotations-overview.md >}})
