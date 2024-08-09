---
type: docs
title: "How-to: Persist Scheduler Jobs"
linkTitle: "How-to: Persist Scheduler Jobs"
weight: 50000
description: "Configure Scheduler to persist its database to make it resilient to restarts"
---

The [Scheduler]({{< ref scheduler.md >}}) service is responsible for writing jobs to its embedded database and scheduling them for execution. On installation, a Persistent Volume Claim (PVC) is automatically created on the default storage class, providing durable storage for the Scheduler database and making it resilient to restarts or cluster failure. 
This persistent volume is backed by a real disk that is provided by the hosted Cloud Provider or Kubernetes infrastructure platform.

You can create the persistent volume on a different storage class by specifying the `dapr_scheduler.cluster.storageClassName` parameter during installation.

Disk size is determined by how many jobs are expected to be persisted at once; however, 64Gb should be more than sufficient for most use cases.
Some Kubernetes providers recommend using a [CSI driver](https://kubernetes.io/docs/concepts/storage/volumes/#csi) to provision the underlying disks.
Below are a list of useful links to the relevant documentation for creating a persistent disk for the major cloud providers:
- [Google Cloud Persistent Disk](https://cloud.google.com/compute/docs/disks)
- [Amazon EBS Volumes](https://aws.amazon.com/blogs/storage/persistent-storage-for-kubernetes/)
- [Azure AKS Storage Options](https://learn.microsoft.com/azure/aks/concepts-storage)
- [Digital Ocean Block Storage](https://www.digitalocean.com/docs/kubernetes/how-to/add-volumes/)
- [VMWare vSphere Storage](https://docs.vmware.com/VMware-vSphere/7.0/vmware-vsphere-with-tanzu/GUID-A19F6480-40DC-4343-A5A9-A5D3BFC0742E.html)
- [OpenShift Persistent Storage](https://docs.openshift.com/container-platform/4.6/storage/persistent_storage/persistent-storage-aws-efs.html)
- [Alibaba Cloud Disk Storage](https://www.alibabacloud.com/help/ack/ack-managed-and-ack-dedicated/user-guide/create-a-pvc)


Once the persistent volume class is available, you can install Dapr using the following command, with Scheduler configured to use the persistent volume class (replace `my-storage-class` with the name of the storage class):

{{% alert title="Note" color="primary" %}}
If Dapr is already installed, the control plane needs to be completely [uninstalled]({{< ref dapr-uninstall.md >}}) in order for the Scheduler `StatefulSet` to be recreated with the new persistent volume.
{{% /alert %}}

{{< tabs "Dapr CLI" "Helm" >}}
 <!-- Dapr CLI -->
{{% codetab %}}

```bash
dapr init -k --set dapr_scheduler.cluster.storageClassName=my-storage-class
```

{{% /codetab %}}

 <!-- Helm -->
{{% codetab %}}

```bash
helm upgrade --install dapr dapr/dapr \
--version={{% dapr-latest-version short="true" %}} \
--namespace dapr-system \
--create-namespace \
--set dapr_scheduler.cluster.storageClassName=my-storage-class \
--wait
```

{{% /codetab %}}
{{< /tabs >}}
