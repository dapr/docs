---
type: docs
title: "Distributed Scheduler overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the distributed scheduler API building block"
---

Dapr users have a need for a distributed scheduler. The idea is to have an *orchestrator* for scheduling jobs in the future either at a specific time or a specific interval.

Examples include:
- Scalable actor reminders
- Scheduling any Dapr API to run at specific times or intervals. For example sending Pub/Sub messages, calling service invocations, input bindings, saving state to a state store. 

Implement a change into `dapr/dapr` that facilitates a seamless experience allowing for the scheduling of jobs across API building blocks using a new scheduler API building block and control plane service. The Scheduler Building Block is a job orchestrator, not executor. The design guarantees *at least once* job execution with a bias towards durability and horizontal scaling over precision. This means we **can** guarantee that a job will never be invoked *before* the schedule is due, but we **cannot** guarantee a ceiling time on when the job is invoked *after* the due time is reached.

The **Workflows** building block is built on top of Actor Reminders, which have scale limitation issues today. The goal is to improve the performance and scale of Actor Reminder by using the distributed scheduler.

Currently, Dapr users are able to use the **Publish and Subscribe** building block, but are unable to have delayed PubSub scheduling. This scheduler  service enables users to publish a message in a future specific time , for example a week from today or a specific UTC date/time.

For **Service Invocation**, this building block could also benefit from a scheduler in that it would enable the scheduling of method calls between applications.

As of now, Dapr does have an **input cron binding** component, which can allow users to schedule tasks. This requires the component yaml file, where users can listen on an endpoint that is scheduled. This is limited to being an input binding only. The Scheduler Service will enable the scheduling of jobs to scale across multiple replicas, while guaranteeing that a job will only be triggered by 1 Scheduler Service instance.

*Note:* Performance is the primary focus while implementing this feature given the current shortfalls.

If a user would like to store their user associated data in a specific state store of their choosing, then they can provision a state store using the Dapr State Management Building Block and set `jobStateStore ` as `true` in the state store component’s metadata section. Having the `jobStateStore` set to `true` means that their user associate data will be stored in the state store of their choosing, but their job details will still be stored in the embedded etcd. If the `jobStateStore` is not configured, then the embedded etcd will be used to store both the job details and the user associated data.

*Note:* The Scheduler functionality is usable by both Standalone (Self-Hosted) and Kubernetes modes.

<!-- 
Include a diagram or image, if possible. 
-->

## Features

### Delayed pub/sub

### Scheduled service invocation

### Actor reminders



## Try out <concept>

<!-- 
If applicable, include a section with links to the related quickstart, how-to guides, or tutorials. --> 

### Quickstarts and tutorials

Want to put the Dapr <topic> API to the test? Walk through the following quickstart and tutorials to see <topic> in action:

| Quickstart/tutorial | Description |
| ------------------- | ----------- |
| [<topic> quickstart](link) | Description of the quickstart. |
| [<topic> tutorial](link) | Description of the tutorial. |

### Start using <topic> directly in your app

Want to skip the quickstarts? Not a problem. You can try out the <topic> building block directly in your application. After [Dapr is installed](link), you can begin using the <topic> API, starting with [the <topic> how-to guide](link).


-->

## Next steps

<!--
Link to related pages and examples. For example, the related API spec, related building blocks, etc.
-->
