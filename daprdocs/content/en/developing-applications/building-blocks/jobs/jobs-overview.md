---
type: docs
title: "Jobs overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the jobs API building block"
---

Many applications require job scheduling, the need to take an action in the future. The jobs API is an orchestrator for scheduling these jobs in the future, either at a specific time or a specific interval. 
Some typically example scenarios include;
- **Automated Database Backups**: Ensure its database is backed up daily to prevent data loss. Schedule a backup script to run every night at 2 AM, which will create a backup of the database and store it in a secure location.
- **Regular Data Processing and ETL (Extract, Transform, Load)**: Process and transform raw data from various sources and load it into a data warehouse. Schedule ETL jobs to run at specific times (e.g., hourly, daily) to fetch new data, process it, and update the data warehouse with the latest information.
**Email Notifications and Reports**: Receive daily sales reports and weekly performance summaries via email. Schedule a job that generates the required reports and sends them via email at 6 AM every day for daily reports and 8 AM every Monday for weekly summaries.
**Maintenance Tasks and System Updates**: Perform regular maintenance tasks such as clearing temporary files, updating software, and checking system health. Schedule various maintenance scripts to run at off-peak hours, such as weekends or late nights, to minimize disruption to users.
**Batch Processing for Financial Transactions**: Processes a large number of transactions that need to be batched and settled at the end of each business day. Schedule batch processing jobs to run at 5 PM every business day, aggregating the day’s transactions and performing necessary settlements and reconciliations.
Using the jobs API in these scenarios ensures that tasks are performed consistently and reliably without manual intervention, improving efficiency and reducing the risk of errors. The jobs API helps you with scheduling jobs, and internally it is also used by Dapr to schedule actor reminders. 

### Delayed pub/sub

Use jobs to delay your pub/sub messaging. You can publish a message in a future specific time -- for example, a week from today, or a specific UTC date/time.

### Scheduled service invocation

Use jobs with [service invocation]({{< ref service-invocation-overview.md >}}) to schedules method calls between applications.



Jobs consist of:
- The jobs API building block
- [The scheduler control plane service]({{< ref "concepts/dapr-services/scheduler.md" >}})

<img src="/images/scheduler/scheduler-architecture.png" alt="Diagram showing basics of the Scheduler control plane and the Scheduler API">

## How it works

The Jobs API is a job orchestrator, not the executor which run the job. The design guarantees *at least once* job execution with a bias towards durability and horizontal scaling over precision. This means:
- **Guaranteed:** A job is never invoked *before* the schedule time is due.
- **Not guaranteed:** A ceiling time on when the job is invoked *after* the due time is reached.

All job details and user-associated data for scheduled jobs are stored in an embedded Etcd database in the Scheduler service. 

## Features

The jobs API provides several features to make it easy for you to schedule jobs.

### Schedule jobs across multiple replicas

The Scheduler service enables the scheduling of jobs to scale across multiple replicas, while guaranteeing that a job is only triggered by 1 scheduler service instance.

### Actor reminders

Actors have actor reminders, but present some limitations involving scalability. Make reminders scalable by using `SchedulerReminders`. 

## Try out the jobs API

You can try out the jobs API in your application. After [Dapr is installed]({{< ref install-dapr-cli.md >}}), you can begin using the jobs API, starting with [the How-to: Schedule jobs guide]({{< ref howto-schedule-jobs.md >}}).

## Next steps

- [Learn how to use jobs in your environment]({{< ref howto-schedule-jobs.md >}})
- [Learn more about the Scheduler control plane service]({{< ref "concepts/dapr-services/scheduler.md" >}})
- [Jobs API reference]({{< ref jobs_api.md >}})
