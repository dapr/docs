---
type: docs
title: "Dapr Scheduler control plane service overview"
linkTitle: "Scheduler"
description: "Overview of the Dapr scheduler service"
---

The Dapr Scheduler service is used to schedule different types of jobs, running in [self-hosted mode]({{< ref self-hosted >}}) or on [Kubernetes]({{< ref kubernetes >}}). 
- Jobs created through the Jobs API
- Actor reminder jobs (used by the actor reminders)
- Actor reminder jobs created by the Workflow API (which uses actor reminders)

From Dapr v1.15, the Scheduler service is used by default to schedule actor reminders as well as actor reminders for the Workflow API.

There is no concept of a leader Scheduler instance. All Scheduler service replicas are considered peers. All receive jobs to be scheduled for execution and the jobs are allocated between the available Scheduler service replicas for load balancing of the trigger events.

The diagram below shows how the Scheduler service is used via the jobs API when called from your application. All the jobs that are tracked by the Scheduler service are stored in an embedded etcd database. 

<img src="/images/scheduler/scheduler-architecture.png" alt="Diagram showing the Scheduler control plane service and the jobs API">

## Actor Reminders

Prior to Dapr v1.15, [actor reminders]({{< ref "actors-timers-reminders.md#actor-reminders" >}}) were run using the Placement service. Now, by default, the [`SchedulerReminders` feature flag]({{< ref "support-preview-features.md#current-preview-features" >}}) is set to `true`, and all new actor reminders you create are run using the Scheduler service to make them more scalable.

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

The Scheduler service Docker container is started automatically as part of `dapr init`. It can also be run manually as a process if you are running in [slim-init mode]({{< ref self-hosted-no-docker.md >}}).

The Scheduler can be run in both high availability (HA) and non-HA modes in self-hosted deployments. However, non-HA mode is not recommended for production use. If switching between non-HA and HA modes, the existing data directory must be removed, which results in loss of jobs and actor reminders. [Run a back-up]({{< ref "#back-up-and-restore-scheduler-data" >}}) before making this change to avoid losing data.

## Kubernetes mode

The Scheduler service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. Scheduler always runs in high availability (HA) mode in Kubernetes deployments. Scaling the Scheduler service replicas up or down is not possible without incurring data loss due to the nature of the embedded data store. [Learn more about setting HA mode in your Kubernetes service.]({{< ref "kubernetes-production.md#individual-service-ha-helm-configuration" >}})

When a Kubernetes namespace is deleted, all the Job and Actor Reminders corresponding to that namespace are deleted.

## Back Up and Restore Scheduler Data

In production environments, it's recommended to perform periodic backups of this data at an interval that aligns with your recovery point objectives.

### Port Forward for Backup Operations

To perform backup and restore operations, you'll need to access the embedded etcd instance. This requires port forwarding to expose the etcd ports (port 2379).

#### Kubernetes Example

Here's how to port forward and connect to the etcd instance:

```shell
kubectl port-forward svc/dapr-scheduler-server 2379:2379 -n dapr-system
```

#### Docker Compose Example

Here's how to expose the etcd ports in a Docker Compose configuration for standalone mode:

```yaml
scheduler-1:
    image: "diagrid/dapr/scheduler:dev110-linux-arm64"
    command: ["./scheduler",
      "--etcd-data-dir", "/var/run/dapr/scheduler",
      "--replica-count", "3",
      "--id","scheduler-1",
      "--initial-cluster", "scheduler-1=http://scheduler-1:2380,scheduler-0=http://scheduler-0:2380,scheduler-2=http://scheduler-2:2380",
      "--etcd-client-ports", "scheduler-0=2379,scheduler-1=2379,scheduler-2=2379",
      "--etcd-client-http-ports", "scheduler-0=2330,scheduler-1=2330,scheduler-2=2330",
      "--log-level=debug"
    ]
    ports:
      - 2379:2379
    volumes:
      - ./dapr_scheduler/1:/var/run/dapr/scheduler
    networks:
      - network
```

When running in HA mode, you only need to expose the ports for one scheduler instance to perform backup operations.

### Performing Backup and Restore

Once you have access to the etcd ports, you can follow the [official etcd backup and restore documentation](https://etcd.io/docs/v3.5/op-guide/recovery/) to perform backup and restore operations. The process involves using standard etcd commands to create snapshots and restore from them.

## Monitoring Scheduler's etcd Metrics

Port forward the Scheduler instance and view etcd's metrics with the following:

```shell
curl -s http://localhost:2379/metrics
```

Fine tune the embedded etcd to your needs by [reviewing and configuring the Scheduler's etcd flags as needed](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md#dapr-scheduler-options).

## Disabling the Scheduler service

If you are not using any features that require the Scheduler service (Jobs API, Actor Reminders, or Workflows), you can disable it by setting `global.scheduler.enabled=false`.

For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{< ref kubernetes >}}).

## Related links

[Learn more about the Jobs API.]({{< ref jobs_api.md >}})
