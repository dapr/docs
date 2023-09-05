---
type: docs
title: "Set up a Google Kubernetes Engine (GKE) cluster"
linkTitle: "Google Kubernetes Engine (GKE)"
weight: 3000
description: "Set up a Google Kubernetes Engine cluster"
---

### Prerequisites

- Install: 
   - [kubectl](https://kubernetes.io/docs/tasks/tools/)
   - [Google Cloud SDK](https://cloud.google.com/sdk)

## Create a new cluster

Create a GKE cluster by running the following:

```bash
$ gcloud services enable container.googleapis.com && \
  gcloud container clusters create $CLUSTER_NAME \
  --zone $ZONE \
  --project $PROJECT_ID
```
For more options:
- Refer to the [Google Cloud SDK docs](https://cloud.google.com/sdk/gcloud/reference/container/clusters/create).
- Create a cluster through the [Cloud Console](https://console.cloud.google.com/kubernetes) for a more interactive experience.

## Sidecar injection for private GKE clusters

_**Sidecar injection for private clusters requires extra steps.**_

In private GKE clusters, an automatically created firewall rule for master access doesn't open port 4000, which Dapr needs for sidecar injection.

Review the relevant firewall rule:

```bash
$ gcloud compute firewall-rules list --filter="name~gke-${CLUSTER_NAME}-[0-9a-z]*-master"
```

Replace the existing rule and allow Kubernetes master access to port 4000:

```bash
$ gcloud compute firewall-rules update <firewall-rule-name> --allow tcp:10250,tcp:443,tcp:4000
```

## Retrieve your credentials for `kubectl`

Run the following command to retrieve your credentials:

```bash
$ gcloud container clusters get-credentials $CLUSTER_NAME \
    --zone $ZONE \
    --project $PROJECT_ID
```

## Install Helm v3 (optional)

If you are using Helm, install the [Helm v3 client](https://helm.sh/docs/intro/install/).

{{% alert title="Important" color="warning" %}}
The latest Dapr Helm chart no longer supports Helm v2. [Migrate from Helm v2 to Helm v3](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/).
{{% /alert %}}

## Troubleshooting

### Kubernetes dashboard permissions

Let's say you receive an error message similar to the following: 

```
configmaps is forbidden: User "system:serviceaccount:kube-system:kubernetes-dashboard" cannot list configmaps in the namespace "default"
``` 

Execute this command:

```bash
kubectl create clusterrolebinding kubernetes-dashboard -n kube-system --clusterrole=cluster-admin --serviceaccount=kube-system:kubernetes-dashboard
```

## Related links
- [Learn more about GKE clusters](https://cloud.google.com/kubernetes-engine/docs)
- [Try out a Dapr quickstart]({{< ref quickstarts.md >}})
- Learn how to [deploy Dapr on your cluster]({{< ref kubernetes-deploy.md >}})
- [Upgrade Dapr on Kubernetes]({{< ref kubernetes-upgrade.md >}})
- [Kubernetes production guidelines]({{< ref kubernetes-production.md >}})