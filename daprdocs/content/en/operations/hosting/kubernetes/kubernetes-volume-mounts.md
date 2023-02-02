---
type: docs
title: "How-to: Mount Pod volumes to the Dapr sidecar"
linkTitle: "How-to: Mount Pod volumes"
weight: 80000
description: "Configure the Dapr sidecar to mount Pod Volumes"
---

## Introduction

The Dapr sidecar can be configured to mount any Kubernetes Volume attached to the application Pod. These Volumes can be accessed by the `daprd` (sidecar) container in _read-only_ or _read-write_ modes. If a Volume is configured to be mounted but it does not exist in the Pod, Dapr logs a warning and ignores it.

For more information on different types of Volumes, check the [Kubernetes documentation](https://kubernetes.io/docs/concepts/storage/volumes/).

## Configuration

You can set the following annotations in your deployment YAML:

1. **dapr.io/volume-mounts**: for read-only volume mounts
1. **dapr.io/volume-mounts-rw**: for read-write volume mounts

These annotations are comma separated pairs of `volume-name:path/in/container`. Make sure that the corresponding Volumes exist in the Pod spec.

Within the official container images, Dapr runs as a process with user ID (UID) `65532`. Make sure that folders and files inside the mounted Volume are writable or readable by user `65532` as appropriate.

Although you can mount a Volume in any folder within the Dapr sidecar container, prevent conflicts and ensure smooth operations going forward by placing all mountpoints within one of these two locations, or in a subfolder within them:

- `/mnt` is recommended for Volumes containing persistent data that the Dapr sidecar process can read and/or write.
- `/tmp` is recommended for Volumes containing temporary data, such as scratch disks.

### Example

In the example Deployment resource below, `my-volume1` and `my-volume2` are available inside the sidecar container at `/mnt/sample1` and `/mnt/sample2` respectively, in read-only mode. `my-volume3` is available inside the sidecar container at `/tmp/sample3` in read-write mode.

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
        dapr.io/volume-mounts: "my-volume1:/mnt/sample1,my-volume2:/mnt/sample2"
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

## Examples

### Custom secrets storage using local file secret store

Since any type of Kubernetes Volume can be attached to the sidecar, you can use the local file secret store to read secrets from a variety of places. For example, if you have a Network File Share (NFS) server running at `10.201.202.203`, with secrets stored at `/secrets/stage/secrets.json`, you can use that as a secrets storage.

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
          dapr.io/volume-mounts: "nfs-secrets-vol:/mnt/secrets"
      spec:
        volumes:
          - name: nfs-secrets-vol
            nfs:
              server: 10.201.202.203
              path: /secrets/stage
  ...
  ```

2. Point the local file secret store component to the attached file.  

  ```yaml
  apiVersion: dapr.io/v1alpha1
  kind: Component
  metadata:
    name: local-secret-store
  spec:
    type: secretstores.local.file
    version: v1
    metadata:
    - name: secretsFile
      value: /mnt/secrets/secrets.json
  ```
  
3. Use the secrets.  
  
  ```
  GET http://localhost:<daprPort>/v1.0/secrets/local-secret-store/my-secret
  ```

## Related links

- [Dapr Kubernetes pod annotations spec]({{< ref arguments-annotations-overview.md >}})
