---
type: docs
title: "How-to: Persist Scheduler Jobs"
linkTitle: "How-to: Persist Scheduler Jobs"
weight: 50000
description: "Configure Scheduler to persist its database to make it resilient to restarts"
---

The [Scheduler]({{% ref scheduler.md %}}) service is responsible for writing jobs to its Etcd database and scheduling them for execution.
On fresh Dapr v1.18+ installs, the Scheduler service database embeds Etcd and writes data to a Persistent Volume Claim volume of size `16Gi`, using the cluster's default [storage class](https://kubernetes.io/docs/concepts/storage/storage-classes/). Earlier versions defaulted to `1Gi`, and clusters upgraded from those versions keep their original PVC size because `spec.volumeClaimTemplates` is immutable on an existing StatefulSet; the Helm chart detects the existing StatefulSet and pins `storageSize` to the value already in use.
This means that there is no additional parameter required to run the scheduler service reliably on most Kubernetes deployments, although you will need [additional configuration](#storage-class) if a default StorageClass is not available or when running a production environment.

{{% alert title="Warning" color="warning" %}}
Clusters upgraded from before Dapr v1.18 keep their original Scheduler PVC size (typically `1Gi`), which is likely not sufficient for most production deployments.
Remember that the Scheduler is used for [Actor Reminders]({{% ref actors-timers-reminders.md %}}) & [Workflows]({{% ref workflow-overview.md %}}), and the [Jobs API]({{% ref jobs_api.md %}}).
If your cluster is in this state, see [Increase existing Scheduler Storage Size](#increase-existing-scheduler-storage-size) below to expand the PVCs in place, or reinstall Dapr with a larger Scheduler storage.
For more information, see the [ETCD Storage Disk Size](#etcd-storage-disk-size) section below.
{{% /alert %}}

## Production Setup

### ETCD Storage Disk Size

The default storage size for the Scheduler is `16Gi` on fresh Dapr v1.18+ installs, and `1Gi` on earlier versions (and clusters upgraded from them).
The legacy `1Gi` is likely not sufficient for most production deployments, and even the new `16Gi` default may need to be raised for higher-throughput workloads.
When the storage size is exceeded, the Scheduler will log an error similar to the following:

```
error running scheduler: etcdserver: mvcc: database space exceeded
```

Knowing the safe upper bound for your storage size is not an exact science, and relies heavily on the number, persistence, and the data payload size of your application jobs.
The [Job API]({{% ref jobs_api.md %}}) and [Actor Reminders]({{% ref actors-timers-reminders.md %}}) transparently maps one to one to the usage of your applications.
Workflows create a large number of jobs as Actor Reminders, however these jobs are short lived- matching the lifecycle of each workflow execution.
The data payload of jobs created by Workflows is typically empty or small.

The Scheduler uses Etcd as its storage backend database.
By design, Etcd persists historical transactions and data in form of [Write-Ahead Logs (WAL) and snapshots](https://etcd.io/docs/v3.5/learning/persistent-storage-files/).
This means the actual disk usage of Scheduler will be higher than the current observable database state, often by a number of multiples.

### Setting the Storage Size on Installation

If you need to increase an **existing** Scheduler storage size, see the [Increase Scheduler Storage Size](#increase-existing-scheduler-storage-size) section below.
To set the storage size explicitly (in this example matching the `16Gi` default) for a **fresh** Dapr installation, you can use the following command:

{{< tabpane text=true >}}
 <!-- Dapr CLI -->
{{% tab "Dapr CLI" %}}

```bash
dapr init -k --set dapr_scheduler.cluster.storageSize=16Gi --set dapr_scheduler.etcdSpaceQuota=16Gi
```

{{% /tab %}}

 <!-- Helm -->
{{% tab "Helm" %}}

```bash
helm upgrade --install dapr dapr/dapr \
--version={{% dapr-latest-version short="true" %}} \
--namespace dapr-system \
--create-namespace \
--set dapr_scheduler.cluster.storageSize=16Gi \
--set dapr_scheduler.etcdSpaceQuota=16Gi \
--wait
```

{{% /tab %}}
{{< /tabpane >}}

{{% alert title="Note" color="primary" %}}
For storage providers that do NOT support dynamic volume expansion: If Dapr has ever been installed on the cluster before, the Scheduler's Persistent Volume Claims must be manually uninstalled in order for new ones with increased storage size to be created.
```bash
kubectl delete pvc -n dapr-system dapr-scheduler-data-dir-dapr-scheduler-server-0 dapr-scheduler-data-dir-dapr-scheduler-server-1 dapr-scheduler-data-dir-dapr-scheduler-server-2
```
Persistent Volume Claims are not deleted automatically with an [uninstall]({{% ref dapr-uninstall.md %}}). This is a deliberate safety measure to prevent accidental data loss.
{{% /alert %}}

#### Increase existing Scheduler Storage Size

{{% alert title="Warning" color="warning" %}}
Not all storage providers support dynamic volume expansion.
Please see your storage provider documentation to determine if this feature is supported, and what to do if it is not.
{{% /alert %}}

On clusters upgraded from before Dapr v1.18, each Scheduler PVC is typically `1Gi` (inherited from the earlier default) against the [default `standard` storage class](#storage-class) for each Scheduler replica. The procedure below applies whenever you need to grow existing PVCs, regardless of their starting size.
These will look similar to the following, where in this example we are running Scheduler in HA mode.

```
NAMESPACE     NAME                                              STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
dapr-system   dapr-scheduler-data-dir-dapr-scheduler-server-0   Bound    pvc-9f699d2e-f347-43b0-aa98-57dcf38229c5   1Gi        RWO            standard       <unset>                 3m25s
dapr-system   dapr-scheduler-data-dir-dapr-scheduler-server-1   Bound    pvc-f4c8be7b-ffbe-407b-954e-7688f2482caa   1Gi        RWO            standard       <unset>                 3m25s
dapr-system   dapr-scheduler-data-dir-dapr-scheduler-server-2   Bound    pvc-eaad5fb1-98e9-42a5-bcc8-d45dba1c4b9f   1Gi        RWO            standard       <unset>                 3m25s
```

```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                                         STORAGECLASS   VOLUMEATTRIBUTESCLASS   REASON   AGE
pvc-9f699d2e-f347-43b0-aa98-57dcf38229c5   1Gi        RWO            Delete           Bound    dapr-system/dapr-scheduler-data-dir-dapr-scheduler-server-0   standard       <unset>                          4m24s
pvc-eaad5fb1-98e9-42a5-bcc8-d45dba1c4b9f   1Gi        RWO            Delete           Bound    dapr-system/dapr-scheduler-data-dir-dapr-scheduler-server-2   standard       <unset>                          4m24s
pvc-f4c8be7b-ffbe-407b-954e-7688f2482caa   1Gi        RWO            Delete           Bound    dapr-system/dapr-scheduler-data-dir-dapr-scheduler-server-1   standard       <unset>                          4m24s
```

To expand the storage size of the Scheduler, follow these steps:

1. First, ensure that the storage class supports volume expansion, and that the `allowVolumeExpansion` field is set to `true` if it is not already.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard
provisioner: my.driver
allowVolumeExpansion: true
...
```

2. Delete the Scheduler StatefulSet whilst preserving the Bound Persistent Volume Claims.

```bash
kubectl delete sts -n dapr-system dapr-scheduler-server --cascade=orphan
```

3. Increase the size of the Persistent Volume Claims to the desired size by editing the `spec.resources.requests.storage` field.
 Again in this case, we are assuming that the Scheduler is running in HA mode with 3 replicas.

```bash
kubectl edit pvc -n dapr-system dapr-scheduler-data-dir-dapr-scheduler-server-0 dapr-scheduler-data-dir-dapr-scheduler-server-1 dapr-scheduler-data-dir-dapr-scheduler-server-2
```

4. Recreate the Scheduler StatefulSet by [installing Dapr with the desired storage size](#setting-the-storage-size-on-installation).

### Persistent Volume Write Access (fsGroup)

The Scheduler process runs as a non-root user (UID/GID `65532`). For the mounted persistent volume to be writable by that process, the pod's `securityContext` can specify an `fsGroup`, which causes the kubelet to chown the volume on mount — though some storage drivers already set ownership and permissions correctly, so this may not always be necessary.

As of Dapr v1.19, `dapr_scheduler.securityContext.fsGroup` is **opt-in** (no default value). Previously it was hardcoded to `65532`, which caused problems on OpenShift, where each project's Security Context Constraints (SCC) assigns its own `fsGroup` from an allowed range, making an explicit value invalid.

The guidance is:

- **Standard Kubernetes** (GKE, EKS, AKS, and most self-managed clusters): If your storage provisioner does not automatically grant write access to a mounted volume, set `fsGroup` explicitly so the kubelet chowns the volume on mount:

  {{< tabpane text=true >}}
  <!-- Dapr CLI -->
  {{% tab "Dapr CLI" %}}

  ```bash
  dapr init -k --set dapr_scheduler.securityContext.fsGroup=65532
  ```

  {{% /tab %}}

  <!-- Helm -->
  {{% tab "Helm" %}}

  ```bash
  helm upgrade --install dapr dapr/dapr \
  --version={{% dapr-latest-version short="true" %}} \
  --namespace dapr-system \
  --create-namespace \
  --set dapr_scheduler.securityContext.fsGroup=65532 \
  --wait
  ```

  {{% /tab %}}
  {{< /tabpane >}}

- **OpenShift**: Leave `fsGroup` unset (do not pass `--set dapr_scheduler.securityContext.fsGroup`). OpenShift assigns an `fsGroup` automatically from the project's allowed SCC range. Setting it explicitly overrides that assignment and can prevent the pod from starting.

{{% alert title="Note" color="primary" %}}
Many managed Kubernetes storage providers (such as AWS EBS CSI and GCE PD CSI) already set the correct ownership on the volume without requiring an explicit `fsGroup`. Check your storage class documentation to confirm whether write access is granted automatically.
{{% /alert %}}

### Storage Class

In case your Kubernetes deployment does not have a default storage class or you are configuring a production cluster, defining a storage class is required.

A persistent volume is backed by a real disk that is provided by the hosted Cloud Provider or Kubernetes infrastructure platform.
Disk size is determined by how many jobs are expected to be persisted at once; however, 64Gb should be more than sufficient for most production scenarios.

For production, use a premium SSD-backed storage class to give Etcd the IOPS and latency profile it requires. On lower-tier storage classes the Scheduler's embedded Etcd can log slow-disk heartbeat warnings (`leader failed to send out heartbeat on time; took too long, leader is overloaded likely from slow disk`). 

Where supported, also prefer storage classes that support multi-zone failover (for example, zone-redundant or regional persistent disks) so Scheduler PVCs are not locked to a single availability zone. Zone-locked PVCs can block Scheduler recovery during cluster upgrades or zonal disruption until the original zone becomes available again.

Some Kubernetes providers recommend using a [CSI driver](https://kubernetes.io/docs/concepts/storage/volumes/#csi) to provision the underlying disks.
Below are a list of useful links to the relevant documentation for creating a persistent disk for the major cloud providers:
- [Google Cloud Persistent Disk](https://cloud.google.com/compute/docs/disks)
- [Amazon EBS Volumes](https://aws.amazon.com/blogs/storage/persistent-storage-for-kubernetes/)
- [Azure AKS Storage Options](https://learn.microsoft.com/azure/aks/concepts-storage)
- [Digital Ocean Block Storage](https://www.digitalocean.com/docs/kubernetes/how-to/add-volumes/)
- [VMWare vSphere Storage](https://docs.vmware.com/VMware-vSphere/7.0/vmware-vsphere-with-tanzu/GUID-A19F6480-40DC-4343-A5A9-A5D3BFC0742E.html)
- [OpenShift Persistent Storage](https://docs.openshift.com/container-platform/4.6/storage/persistent_storage/persistent-storage-aws-efs.html)
- [Alibaba Cloud Disk Storage](https://www.alibabacloud.com/help/ack/ack-managed-and-ack-dedicated/user-guide/create-a-pvc)


Once the storage class is available, you can install Dapr using the following command, with Scheduler configured to use the storage class (replace `my-storage-class` with the name of the storage class):

{{% alert title="Note" color="primary" %}}
If Dapr is already installed, the control plane needs to be completely [uninstalled]({{% ref dapr-uninstall.md %}}) in order for the Scheduler `StatefulSet` to be recreated with the new persistent volume.
{{% /alert %}}

{{< tabpane text=true >}}
 <!-- Dapr CLI -->
{{% tab "Dapr CLI" %}}

```bash
dapr init -k --set dapr_scheduler.cluster.storageClassName=my-storage-class
```

{{% /tab %}}

 <!-- Helm -->
{{% tab "Helm" %}}

```bash
helm upgrade --install dapr dapr/dapr \
--version={{% dapr-latest-version short="true" %}} \
--namespace dapr-system \
--create-namespace \
--set dapr_scheduler.cluster.storageClassName=my-storage-class \
--wait
```

{{% /tab %}}
{{< /tabpane >}}

## Ephemeral Storage

When running in non-HA mode, the Scheduler can be optionally made to use ephemeral storage, which is in-memory storage that is **not** resilient to restarts. For example, all jobs data is lost after a Scheduler restart.
This is useful in non-production deployments or for testing where storage is not available or required.

{{% alert title="Note" color="primary" %}}
If Dapr is already installed, the control plane needs to be completely [uninstalled]({{% ref dapr-uninstall.md %}}) in order for the Scheduler `StatefulSet` to be recreated without the persistent volume.
{{% /alert %}}

{{< tabpane text=true >}}
 <!-- Dapr CLI -->
{{% tab "Dapr CLI" %}}

```bash
dapr init -k --set dapr_scheduler.cluster.inMemoryStorage=true
```

{{% /tab %}}

 <!-- Helm -->
{{% tab "Helm" %}}

```bash
helm upgrade --install dapr dapr/dapr \
--version={{% dapr-latest-version short="true" %}} \
--namespace dapr-system \
--create-namespace \
--set dapr_scheduler.cluster.inMemoryStorage=true \
--wait
```

{{% /tab %}}
{{< /tabpane >}}
