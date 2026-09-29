---
type: docs
title: "How to: Autoscale workflow activities with KEDA"
linkTitle: "KEDA for workflows"
description: "Scale a Dapr Workflow application on the number of activities waiting to run, using pull dispatch and KEDA"
weight: 3100
---

This guide scales a Dapr Workflow application on how much activity work it has waiting. It applies to applications whose activities are long-running and expensive, such as media transcoding, model training or report generation, where the goal is one replica per job rather than a fixed pool.

## Why scale on the activity backlog

CPU and memory are poor scaling signals for a workflow worker fleet. The problem you are usually trying to solve is that some replicas sit idle while work waits, and idle replicas have low CPU. What you want to scale on is the amount of work that is waiting for a free replica.

Under the default [hashed activity dispatch]({{% ref "workflow-concurrency.md#activity-dispatch-modes" %}}) that number does not exist: pending activities are pinned to the replicas their IDs hashed to, and adding a replica does not help because nothing that is already waiting can move to it.

[Pull dispatch]({{% ref "workflow-concurrency.md#activity-dispatch-modes" %}}) changes both halves of that. The Dapr scheduler holds every activity that has no free slot, so it knows exactly how much work is waiting and exports it as the gauge `dapr_scheduler_workflow_activity_backlog`. And a replica that joins takes waiting work as soon as it connects, so scaling out actually drains the backlog.

With one activity slot per replica and a scaling threshold of one, the fleet converges on one replica per waiting activity: it grows while work is queued and shrinks as the queue drains.

## Prerequisites

- A Kubernetes cluster with Dapr installed through Helm. Scheduler metrics are on by default (`global.prometheus.enabled=true`, port `9090`).
- Prometheus scraping the Dapr control plane. The `dapr` job in [How to: Observe metrics with Prometheus]({{% ref prometheus.md %}}) scrapes the scheduler pods in `dapr-system`; the `dapr-sidecars` job alone is not enough, because the backlog gauge is exported by the scheduler, not by the sidecar.
- [KEDA](https://keda.sh/docs/latest/deploy/) installed in the cluster.
- A workflow application whose activities you want to scale. This guide uses an application with the ID `transcode-workers` that runs a `Transcode` activity.

## Step 1: Enable pull dispatch for the application

Create a Configuration that turns on pull dispatch and gives each replica one activity slot. The slot count is `maxConcurrentActivityInvocations`; it is required whenever pull is used.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: transcode-config
spec:
  workflow:
    maxConcurrentActivityInvocations: 1
    activityDispatchMode: pull
```

If only some activity names are expensive, keep the application on the default and pull those names only:

```yaml
spec:
  workflow:
    maxConcurrentActivityInvocations: 1
    activityConcurrencyLimits:
      - name: Transcode
        dispatchMode: pull
```

Reference the Configuration from the worker Deployment. The Deployment name is what KEDA scales.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: transcode-workers
spec:
  replicas: 1
  selector:
    matchLabels:
      app: transcode-workers
  template:
    metadata:
      labels:
        app: transcode-workers
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "transcode-workers"
        dapr.io/app-port: "3000"
        dapr.io/config: "transcode-config"
    spec:
      containers:
        - name: worker
          image: <your-worker-image>
```

Apply both and check the sidecar started. A sidecar that rejects the Configuration logs `workflow activity dispatchMode pull requires maxConcurrentActivityInvocations to be set to a positive value` and exits.

```bash
kubectl apply -f transcode-config.yaml -f transcode-workers.yaml
kubectl logs deploy/transcode-workers -c daprd | grep -i "dispatch\|FastPath"
```

## Step 2: Verify the backlog gauge

Schedule more activities than the fleet has slots, then read the gauge straight from a scheduler pod:

```bash
kubectl -n dapr-system port-forward dapr-scheduler-server-0 9090:9090 &
curl -s localhost:9090/ | grep dapr_scheduler_workflow_activity_backlog
```

You should see one series per waiting activity name:

```
dapr_scheduler_workflow_activity_backlog{activity_name="Transcode",app_id="transcode-workers",namespace="default"} 7
```

The value is the number of activities of that name waiting for a slot on that scheduler instance. In Prometheus, sum it across instances:

```
sum(dapr_scheduler_workflow_activity_backlog{app_id="transcode-workers"})
```

If the query returns nothing, check that Prometheus has the scheduler pods as targets (**Status** > **Targets**, job `dapr`) and that the application is actually in pull mode: the gauge is not reported for applications on hashed dispatch.

## Step 3: Deploy the KEDA ScaledObject

Paste the following into `transcode-scaler.yaml`:

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: transcode-workers
spec:
  scaleTargetRef:
    name: transcode-workers
  pollingInterval: 15
  minReplicaCount: 1
  maxReplicaCount: 50
  advanced:
    horizontalPodAutoscalerConfig:
      behavior:
        scaleDown:
          stabilizationWindowSeconds: 1800
  triggers:
    - type: prometheus
      metadata:
        serverAddress: http://dapr-prom-prometheus-server.dapr-monitoring.svc.cluster.local
        query: sum(dapr_scheduler_workflow_activity_backlog{app_id="transcode-workers"})
        threshold: "1"
```

| Field | Description |
|-------|-------------|
| `scaleTargetRef.name` | The Kubernetes Deployment of the worker application, `transcode-workers` here. |
| `pollingInterval` | How often, in seconds, KEDA runs the query. |
| `minReplicaCount` | Keep this at `1` or more. With zero replicas no sidecar hosts the activity actor type, so the scheduler cannot park activities in the backlog and the gauge reads `0`: KEDA would never scale up from zero. |
| `maxReplicaCount` | The most replicas KEDA creates. Size it to the resources a replica needs and to any `globalMaxConcurrentActivityInvocations` you have set, since replicas beyond the global limit stay idle. |
| `scaleDown.stabilizationWindowSeconds` | How long the backlog must stay low before KEDA removes replicas. Set it to at least the longest run of an activity; see the scale-in note below. |
| `serverAddress` | Your Prometheus server. The address shown matches the Helm install in the Prometheus how-to. |
| `query` | The summed backlog for the application. Add `activity_name="Transcode"` to scale on one name only. |
| `threshold` | KEDA sizes the Deployment to `ceil(backlog / threshold)` replicas within the min and max. With one slot per replica, `1` means one new replica per waiting activity. With `N` slots per replica, `N` is the equivalent starting point. |

Deploy it:

```bash
kubectl apply -f transcode-scaler.yaml
kubectl get scaledobject transcode-workers
```

## Step 4: Watch it scale

Schedule a batch of workflows that each call the expensive activity and watch the fleet grow:

```bash
kubectl get hpa keda-hpa-transcode-workers -w
kubectl get pods -l app=transcode-workers -w
```

New replicas begin running waiting activities within a few seconds of their sidecar connecting to the scheduler. As activities complete the backlog falls to `0`, and after the stabilization window KEDA scales the Deployment back to `minReplicaCount`.

## Behaviour to be aware of

**Scale-in can interrupt a running activity.** The backlog counts waiting activities only, so it reaches `0` while the last activities are still running. If KEDA removes a replica that is mid-activity, the scheduler redelivers that activity to a surviving replica and it runs again from the start; the first run's result is discarded when it arrives. This is the at-least-once guarantee all Dapr Workflow activities have, but for a 20 minute job it is an expensive retry. Two settings limit it:

- `scaleDown.stabilizationWindowSeconds` at or above the longest activity run keeps replicas around until the work they took has had time to finish.
- Make expensive activities idempotent, so a repeated run is safe even when it does happen.

**Limits still apply.** `globalMaxConcurrentActivityInvocations` and per-name `maxConcurrent` limits hold under pull. Activities held back by a limit also count in the backlog, so a fleet scaled past the limit gains idle replicas, not throughput. Cap `maxReplicaCount` accordingly.

**One scheduler instance holds each waiting activity.** The gauge is per scheduler instance; always `sum()` it. A scheduler restart releases its waiting activities, which are redelivered and re-counted once the sidecars reconnect, so the gauge can dip briefly during a control plane rollout.

**Hashed applications are unaffected.** An application on the default dispatch mode reports no backlog and cannot be scaled this way. Scaling it out does not move work that is already pinned; see [Choosing a mode]({{% ref "workflow-concurrency.md#choosing-a-mode" %}}).

## Related links

- [Workflow concurrency limits and activity dispatch]({{% ref workflow-concurrency.md %}})
- [How to: Observe metrics with Prometheus]({{% ref prometheus.md %}})
- [How to: Autoscale a Dapr app with KEDA]({{% ref autoscale-keda.md %}}) for pub/sub workloads
- [KEDA Prometheus scaler](https://keda.sh/docs/latest/scalers/prometheus/)
