---
type: docs
title: "Dapr Scheduler control plane service overview"
linkTitle: "Scheduler"
description: "Overview of the Dapr scheduler service"
---

The Dapr Scheduler service is used to schedule different types of jobs, running in [self-hosted mode]({{% ref self-hosted %}}) or on [Kubernetes]({{% ref kubernetes %}}).
- Jobs created through the Jobs API
- Actor reminder jobs (used by the actor reminders)
- Actor reminder jobs created by the Workflow API (which uses actor reminders)

From Dapr v1.15, the Scheduler service is used by default to schedule actor reminders as well as actor reminders for the Workflow API.

There is no concept of a leader Scheduler instance. All Scheduler service replicas are considered peers. All receive jobs to be scheduled for execution and the jobs are allocated between the available Scheduler service replicas for load balancing of the trigger events.

The diagram below shows how the Scheduler service is used via the jobs API when called from your application. All the jobs that are tracked by the Scheduler service are stored in the Etcd database.

<img src="/images/scheduler/scheduler-architecture.png" alt="Diagram showing the Scheduler control plane service and the jobs API">

By default, Etcd is embedded in the Scheduler service, which means that the Scheduler service runs its own instance of Etcd.
See [Scheduler service flags]({{% ref "#flag-tuning" %}}) for more information on how to configure the Scheduler service.

## Actor Reminders

Prior to Dapr v1.15, [actor reminders]({{% ref "actors-timers-reminders#actor-reminders" %}}) were run using the Placement service. Now, by default, the [`SchedulerReminders` feature flag]({{% ref "support-preview-features#current-preview-features" %}}) is set to `true`, and all new actor reminders you create are run using the Scheduler service to make them more scalable.

When you deploy Dapr v1.15, any _existing_ actor reminders are automatically migrated from the Actor State Store to the Scheduler service as a one time operation for each actor type. Each replica will only migrate the reminders whose actor type and id are associated with that host. This means that only when all replicas implementing an actor type are upgraded to 1.15, will all the reminders associated with that type be migrated. There will be _no_ loss of reminder triggers during the migration. However, you can prevent this migration and keep the existing actor reminders running using the Actor State Store by setting the `SchedulerReminders` flag to `false` in the application configuration file for the actor type.

To confirm that the migration was successful, check the Dapr sidecar logs for the following:

```sh
Running actor reminder migration from state store to scheduler
```
coupled with
```sh
Migrated X reminders from state store to scheduler successfully
```
or
```sh
Skipping migration, no missing scheduler reminders found
```

## Job Locality

### Default Job Behavior

By default, when the Scheduler service triggers jobs, they are sent back to a single replica for the same app ID that scheduled the job in a randomly load balanced manner. This provides basic load balancing across your application's replicas, which is suitable for most use cases where strict locality isn't required.

### Using Actor Reminders for Perfect Locality

For users who require perfect job locality (having jobs triggered on the exact same host that created them), actor reminders provide a solution. To enforce perfect locality for a job:

1. Create an actor type with a random UUID that is unique to the specific replica
2. Use this actor type to create an actor reminder

This approach ensures that the job will always be triggered on the same host which created it, rather than being randomly distributed among replicas.

## Job Triggering

### Job Failure Policy and Staging Queue

When the Scheduler service triggers a job and it has a client side error, the job is retried by default with a 1s interval and 3 maximum retries. 

For non-client side errors, for example, when a job cannot be sent to an available Dapr sidecar at trigger time, it is placed in a staging queue within the Scheduler service. Jobs remain in this queue until a suitable sidecar instance becomes available, at which point they are automatically sent to the appropriate Dapr sidecar instance.

## Self-hosted mode

The Scheduler service Docker container is started automatically as part of `dapr init`. It can also be run manually as a process if you are running in [slim-init mode]({{% ref self-hosted-no-docker %}}).

The Scheduler can be run in both high availability (HA) and non-HA modes in self-hosted deployments. However, non-HA mode is not recommended for production use. If switching between non-HA and HA modes, the existing data directory must be removed, which results in loss of jobs and actor reminders. [Run a back-up]({{% ref "#back-up-and-restore-scheduler-data" %}}) before making this change to avoid losing data.

## Kubernetes mode

The Scheduler service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. Scheduler always runs in high availability (HA) mode in Kubernetes deployments. Scaling the Scheduler service replicas up or down is not possible without incurring data loss due to the nature of the embedded data store. [Learn more about setting HA mode in your Kubernetes service.]({{% ref "kubernetes-production#individual-service-ha-helm-configuration" %}})

When a Kubernetes namespace is deleted, all the Job and Actor Reminders corresponding to that namespace are deleted.

## Docker Compose Example

Here's how to expose the etcd ports in a Docker Compose configuration for standalone mode.
When running in HA mode, you only need to expose the ports for one scheduler instance to perform backup operations.

```yaml
version: "3.5"
services:
  scheduler-0:
    image: "docker.io/daprio/scheduler:1.16.0"
    command:
    - "./scheduler"
    - "--etcd-data-dir=/var/run/dapr/scheduler"
    - "--id=scheduler-0"
    - "--etcd-initial-cluster=scheduler-0=http://scheduler-0:2380,scheduler-1=http://scheduler-1:2380,scheduler-2=http://scheduler-2:2380"
    ports:
      - 2379:2379
    volumes:
      - ./dapr_scheduler/0:/var/run/dapr/scheduler
  scheduler-1:
    image: "docker.io/daprio/scheduler:1.16.0"
    command:
    - "./scheduler"
    - "--etcd-data-dir=/var/run/dapr/scheduler"
    - "--id=scheduler-1"
    - "--etcd-initial-cluster=scheduler-0=http://scheduler-0:2380,scheduler-1=http://scheduler-1:2380,scheduler-2=http://scheduler-2:2380"
    volumes:
      - ./dapr_scheduler/1:/var/run/dapr/scheduler
  scheduler-2:
    image: "docker.io/daprio/scheduler:1.16.0"
    command:
    - "./scheduler"
    - "--etcd-data-dir=/var/run/dapr/scheduler"
    - "--id=scheduler-2"
    - "--etcd-initial-cluster=scheduler-0=http://scheduler-0:2380,scheduler-1=http://scheduler-1:2380,scheduler-2=http://scheduler-2:2380"
    volumes:
      - ./dapr_scheduler/2:/var/run/dapr/scheduler
```

## Back Up and Restore Scheduler Data

In production environments, it's recommended to perform periodic backups of this data at an interval that aligns with your recovery point objectives.

### Port Forward for Backup Operations

To perform backup and restore operations, you'll need to access the embedded etcd instance. This requires port forwarding to expose the etcd ports (port 2379).

#### Kubernetes Example

Here's how to port forward and connect to the etcd instance:

```shell
kubectl port-forward svc/dapr-scheduler-server 2379:2379 -n dapr-system
```

### Performing Backup and Restore

Once you have access to the etcd ports, you can follow the [official etcd backup and restore documentation](https://etcd.io/docs/v3.5/op-guide/recovery/) to perform backup and restore operations. The process involves using standard etcd commands to create snapshots and restore from them.

## Monitoring Scheduler's etcd Metrics

Port forward the Scheduler instance and view etcd's metrics with the following:

```shell
curl -s http://localhost:2379/metrics
```

Fine tune the embedded etcd to your needs by [reviewing and configuring the Scheduler's etcd flags as needed](https://github.com/dapr/dapr/blob/master/charts/dapr/README#dapr-scheduler-options).

## Disabling the Scheduler service

If you are not using any features that require the Scheduler service (Jobs API, Actor Reminders, or Workflows), you can disable it by setting `global.scheduler.enabled=false`.

For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{% ref kubernetes %}}).

## Flag tuning

A number of Etcd flags are exposed on Scheduler which can be used to tune for your deployment use case.

###  External Etcd database

Scheduler can be configured to use an external Etcd database instead of the embedded one inside the Scheduler service replicas.
It may be interesting to decouple the storage volume from the Scheduler StatefulSet or container, because of how the cluster or environment is administered or what storage backend is being used.
It can also be the case that moving the persistent storage outside of the scheduler runtime completely is desirable, or there is some existing Etcd cluster provider which will be reused.
Externalising the Etcd database also means that the Scheduler replicas can be horizontally scaled at will, however note that during scale events, job triggering will be paused.
Scheduler replica count does not need to match the [Etcd node count constraints](https://etcd.io/docs/v3.3/faq/#what-is-maximum-cluster-size).

To use an external Etcd cluster, set the `--etcd-embed` flag to `false` and provide the `--etcd-client-endpoints` flag with the endpoints of your Etcd cluster.
Optionally also include `--etcd-client-username` and `--etcd-client-password` flags for authentication if the Etcd cluster requires it.

```
--etcd-embed              bool         When enabled, the Etcd database is embedded in the scheduler server. If false, the scheduler connects to an external Etcd cluster using the --etcd-client-endpoints flag. (default true)
--etcd-client-endpoints   stringArray  Comma-separated list of etcd client endpoints to connect to. Only used when --etcd-embed is false.
--etcd-client-username    string       Username for etcd client authentication. Only used when --etcd-embed is false.
--etcd-client-password    string       Password for etcd client authentication. Only used when --etcd-embed is false.
```

Helm:

```yaml
dapr_scheduler.etcdEmbed=true
dapr_scheduler.etcdClientEndpoints=[]
dapr_scheduler.etcdClientUsername=""
dapr_scheduler.etcdClientPassword=""
```

### Etcd leadership election tuning

To improve the speed of election leadership of rescue nodes in the event of a failure, the following flag may be used to speed up the election process.

```
--etcd-initial-election-tick-advance  Whether to fast-forward initial election ticks on boot for faster election. When it is true, then local member fast-forwards election ticks to speed up “initial” leader election trigger. This benefits the case of larger election ticks. Disabling this would slow down initial bootstrap process for cross datacenter deployments. Make your own tradeoffs by configuring this flag at the cost of slow initial bootstrap.
```

Helm:

```yaml
dapr_scheduler.etcdInitialElectionTickAdvance=true
```

### Storage tuning

The following options can be used to tune the embedded Etcd storage to the needs of your deployment.
A deeper understanding of what these flags do can be found in the [Etcd documentation](https://etcd.io/docs/v3.5/op-guide/configuration/).

{{% alert title="Note" color="primary" %}}
Changing these flags can greatly change the performance and behaviour of the Scheduler, so caution is advised when modifying them from the default set by Dapr.
Changing these settings should always been done first in a testing environment, and monitored closely before applying to production.
{{% /alert %}}

```
--etcd-backend-batch-interval string                            Maximum time before committing the backend transaction. (default "50ms")
--etcd-backend-batch-limit int                                  Maximum operations before committing the backend transaction. (default 5000)
--etcd-compaction-mode string                                   Compaction mode for etcd. Can be 'periodic' or 'revision' (default "periodic")
--etcd-compaction-retention string                              Compaction retention for etcd. Can express time  or number of revisions, depending on the value of 'etcd-compaction-mode' (default "10m")
--etcd-experimental-bootstrap-defrag-threshold-megabytes uint   Minimum number of megabytes needed to be freed for etcd to consider running defrag during bootstrap. Needs to be set to non-zero value to take effect. (default 100)
--etcd-max-snapshots uint                                       Maximum number of snapshot files to retain (0 is unlimited). (default 10)
--etcd-max-wals uint                                            Maximum number of write-ahead logs to retain (0 is unlimited). (default 10)
--etcd-snapshot-count uint                                      Number of committed transactions to trigger a snapshot to disk. (default 10000)
```

Helm:

```yaml
dapr_scheduler.etcdBackendBatchInterval="50ms"
dapr_scheduler.etcdBackendBatchLimit=5000
dapr_scheduler.etcdCompactionMode="periodic"
dapr_scheduler.etcdCompactionRetention="10m"
dapr_scheduler.etcdDefragThresholdMB=100
dapr_scheduler.etcdMaxSnapshots=10
```

## Related links

[Learn more about the Jobs API.]({{% ref jobs_api %}})
