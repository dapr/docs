---
type: docs
title: "Features and concepts"
linkTitle: "Features and concepts"
weight: 2000
description: "Learn more about the Dapr Jobs features and concepts"
---

Now that you've learned about the [jobs building block]({{< ref jobs-overview.md >}}) at a high level, let's deep dive 
into the features and concepts included with Dapr Jobs and the various SDKs. Dapr Jobs:
- Provides a robust and scalable API for scheduling operations to be triggered in the future.
- Exposes several capabilities which are common across all supported languages.



## Job identity

All jobs are registered with a case-sensitive job name. These names are intended to be unique across all services 
interfacing with the Dapr runtime. The name is used as an identifier when creating and modifying the job as well as 
to indicate which job a triggered invocation is associated with.

Only one job can be associated with a name at any given time. Any attempt to create a new job using the same name
as an existing job will result in an overwrite of this existing job.

## Scheduling Jobs
A job can be scheduled using any of the following mechanisms:
- Intervals using Cron expressions, duration values, or period expressions
- Specific dates and times

For all time-based schedules, if a timestamp is provided with a time zone via the RFC3339 specification, that 
time zone is used. When not provided, the time zone used by the server running Dapr is used. 
In other words, do **not** assume that times run in UTC time zone, unless otherwise specified when scheduling
the job.

### Schedule using a Cron expression
When scheduling a job to execute on a specific interval using a Cron expression, the expression is written using 6
fields spanning the values specified in the table below:

| seconds | minutes | hours | day of month | month | day of week |
| -- | -- | -- | -- | -- | -- |
| 0-59 | 0-59 | 0-23 | 1-31 | 1-12/jan-dec | 0-6/sun-sat |

#### Example 1
`"0 30 * * * *"` triggers every hour on the half-hour mark.

#### Example 2
`"0 15 3 * * *"` triggers every day at 03:15.

### Schedule using a duration value
You can schedule jobs using [a Go duration string](https://pkg.go.dev/time#ParseDuration), in which
a string consists of a (possibly) signed sequence of decimal numbers, each with an optional fraction and a unit suffix. 
Valid time units are `"ns"`, `"us"`, `"ms"`, `"s"`, `"m"`, or `"h"`.

#### Example 1
`"2h45m"` triggers every 2 hours and 45 minutes.

#### Example 2
`"37m25s"` triggers every 37 minutes and 25 seconds.

### Schedule using a period expression
The following period expressions are supported. The "@every" expression also accepts a [Go duration string](https://pkg.go.dev/time#ParseDuration).

| Entry | Description | Equivalent Cron expression |
| -- | -- | -- |
| @every | Run every (e.g. "@every 1h30m") | N/A |
| @yearly (or @annually) | Run once a year, midnight, January 1st | 0 0 0 1 1 * |
| @monthly | Run once a month, midnight, first of month | 0 0 0 1 * * |
| @weekly | Run once a week, midnight on Sunday | 0 0 0 * * 0 |
| @daily or @midnight | Run once a day at midnight | 0 0 0 * * * |
| @hourly | Run once an hour at the beginning of the hour | 0 0 * * * * |

### Schedule using a specific date/time
A job can also be scheduled to run at a particular point in time by providing a date using the 
[RFC3339 specification](https://www.rfc-editor.org/rfc/rfc3339).

#### Example 1
`"2025-12-09T16:09:53+00:00"` Indicates that the job should be run on December 9, 2025 at 4:09:53 PM UTC.

## Scheduled triggers
When a scheduled Dapr job is triggered, the runtime sends a message back to the service that scheduled the job using
either the HTTP or gRPC approach, depending on which is registered with Dapr when the service starts.

### gRPC
When a job reaches its scheduled trigger time, the triggered job is sent back to the application via the following
callback function:

> **Note:** The following example is in Go, but applies to any programming language with gRPC support.

```go
import rtv1 "github.com/dapr/dapr/pkg/proto/runtime/v1"
...
func (s *JobService) OnJobEventAlpha1(ctx context.Context, in *rtv1.JobEventRequest) (*rtv1.JobEventResponse, error) {
    // Handle the triggered job
}
```

This function processes the triggered jobs within the context of your gRPC server. When you set up the server, ensure that
you register the callback server, which invokes this function when a job is triggered:

```go
...
js := &JobService{}
rtv1.RegisterAppCallbackAlphaServer(server, js)
```

In this setup, you have full control over how triggered jobs are received and processed, as they are routed directly
through this gRPC method.

### HTTP
If a gRPC server isn't registered with Dapr when the application starts up, Dapr instead triggers jobs by making a 
POST request to the endpoint `/job/<job-name>`. The body includes the following information about the job:
- `Schedule`: When the job triggers occur
- `RepeatCount`: An optional value indicating how often the job should repeat
- `DueTime`: An optional point in time representing either the one time when the job should execute (if not recurring)
or the not-before time from which the schedule should take effect
- `Ttl`: An optional value indicating when the job should expire
- `Payload`: A collection of bytes containing data originally stored when the job was scheduled

The `DueTime` and `Ttl` fields will reflect an RC3339 timestamp value reflective of the time zone provided when the job was
originally scheduled. If no time zone was provided, these values indicate the time zone used by the server running
Dapr.