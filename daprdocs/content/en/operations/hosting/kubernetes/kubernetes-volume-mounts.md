---
type: docs
title: "How-to: Mount Pod volumes to the Dapr sidecar"
linkTitle: "How-to: Mount Pod volumes"
weight: 80000
description: "Configure the Dapr sidecar to mount Pod Volumes"
---

## Introduction

The Dapr sidecar can be configured to mount any Volume attached to the application Pod. These volumes can be accessed by the sidecar in _read-only_ or _read-write_ modes. If a Volume is configured to be mounted but it does not exist in the Pod, Dapr logs a warning and ignores it.
For more information on different types of Volumes, check [Volumes | Kubernetes](https://kubernetes.io/docs/concepts/storage/volumes/).

## Configuration

You can set the following annotations in your deployment YAML:
1. **dapr.io/volume-mounts**: for read-only volume mounts
1. **dapr.io/volume-mounts-rw**: for read-write volume mounts

These annotations are comma separated pairs of `volume:path`. Make sure that the corresponding Volumes exist in the Pod spec.

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

## Example

### Custom secrets storage using local file secret store
Since any type of Kubernetes Volume can be attached to the sidecar, you can use the local file secret store to read secrets from a variety of places. Example, if you have an NFS server running at `10.201.202.203`, with secrets stored at `/secrets/stage/secrets.json`, you can use that as a secrets storage.

1. Configure the application pod to mount the NFS and attach it to the Dapr sidecar.
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
...
spec:
  ...
  template:
    ...
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "myapp"
        dapr.io/app-port: "8000"
        dapr.io/volume-mounts: "nfs-ss-vol:/usr/secrets"
    spec:
      volumes:
        - name: nfs-ss-vol
          nfs:
            server: 10.201.202.203
            path: /secrets/stage
...
```
2. Point the secret store component to the attached file.
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: local-secret-store
  namespace: default
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: /usr/secrets/secret.json
```
3. Use the secrets.
```
GET http://localhost:<daprPort>/v1.0/secrets/local-secret-store/my-secret
```

## Related links
- [Dapr Kubernetes pod annotations spec]({{< ref arguments-annotations-overview.md >}})
