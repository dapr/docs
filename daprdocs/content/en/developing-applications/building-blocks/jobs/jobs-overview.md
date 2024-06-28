---
type: docs
title: "Jobs overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the jobs API building block"
---

Many applications require job scheduling, or the need to take an action in the future. The jobs API is an orchestrator for scheduling these future jobs, either at a specific time or for a specific interval. 

Not only does the jobs API help you with scheduling jobs, but internally, Dapr uses the scheduler serviceit is also used by Dapr to schedule actor reminders.  

Jobs in Dapr consist of:
- The jobs API building block
- [The Scheduler control plane service]({{< ref "concepts/dapr-services/scheduler.md" >}})

[See example scenarios.]({{< ref "#scenarios" >}})

<img src="/images/scheduler/scheduler-architecture.png" alt="Diagram showing the Scheduler control plane service and the jobs API">

## How it works

The jobs API is a job scheduler, not the executor which runs the job. The design guarantees *at least once* job execution with a bias towards durability and horizontal scaling over precision. This means:
- **Guaranteed:** A job is never invoked *before* the schedule time is due.
- **Not guaranteed:** A ceiling time on when the job is invoked *after* the due time is reached.

All job details and user-associated data for scheduled jobs are stored in an embedded Etcd database in the Scheduler service. 
You can use jobs to:

- **Delay your [pub/sub messaging]({<< ref pubsub-overview.md >>}).** You can publish a message in a future specific time (for example: a week from today, or a specific UTC date/time).
- **Schedule [service invocation]({{< ref service-invocation-overview.md >}}) method calls between applications.**

## Scenarios

Job scheduling can prove helpful in the following scenarios:

- **Automated Database Backups**:   
   Ensure a database is backed up daily to prevent data loss. Schedule a backup script to run every night at 2 AM, which will create a backup of the database and store it in a secure location.

- **Regular Data Processing and ETL (Extract, Transform, Load)**:  
   Process and transform raw data from various sources and load it into a data warehouse. Schedule ETL jobs to run at specific times (for example: hourly, daily) to fetch new data, process it, and update the data warehouse with the latest information.

- **Email Notifications and Reports**:  
   Receive daily sales reports and weekly performance summaries via email. Schedule a job that generates the required reports and sends them via email at 6 a.m. every day for daily reports and 8 a.m. every Monday for weekly summaries.

- **Maintenance Tasks and System Updates**:  
   Perform regular maintenance tasks such as clearing temporary files, updating software, and checking system health. Schedule various maintenance scripts to run at off-peak hours, such as weekends or late nights, to minimize disruption to users.

- **Batch Processing for Financial Transactions**:  
   Processes a large number of transactions that need to be batched and settled at the end of each business day. Schedule batch processing jobs to run at 5 PM every business day, aggregating the day’s transactions and performing necessary settlements and reconciliations.

Dapr's jobs API ensures the tasks represented in these scenarios are performed consistently and reliably without manual intervention, improving efficiency and reducing the risk of errors. 

## Features

The jobs API provides several features to make it easy for you to schedule jobs.

### Schedule jobs across multiple replicas

The Scheduler service enables the scheduling of jobs to scale across multiple replicas, while guaranteeing that a job is only triggered by 1 scheduler service instance.

### Actor reminders

Actors have actor reminders, but present some limitations involving scalability using the Placement service implementation. You can make reminders more scalable by using [`SchedulerReminders`]({{< ref support-preview-features.md >}}).  This is set in the configuration for your actor application. 

## Try out the jobs API

You can try out the jobs API in your application. After [Dapr is installed]({{< ref install-dapr-cli.md >}}), you can begin using the jobs API, starting with [the How-to: Schedule jobs guide]({{< ref howto-schedule-jobs.md >}}).

## Next steps

- [Learn how to use the jobs API]({{< ref howto-schedule-jobs.md >}})
- [Learn more about the Scheduler control plane service]({{< ref "concepts/dapr-services/scheduler.md" >}})
- [Jobs API reference]({{< ref jobs_api.md >}})
