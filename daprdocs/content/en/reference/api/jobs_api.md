---
type: docs
title: "Jobs API reference"
linkTitle: "Jobs API"
description: "Detailed documentation on the jobs API"
weight: 1300
---

{{% alert title="Note" color="primary" %}}
The jobs API is currently in alpha.
{{% /alert %}}

{{% alert title="Warning" color="warning" %}}
By default, Job data is not resilient to [Scheduler]({{< ref scheduler.md >}}) service restarts.
A persistent volume must be provided to Scheduler to ensure job data is not lost in either [Kubernetes]({{< ref kubernetes-persisting-scheduler.md >}}) or Self-Hosted (TODO) mode.
{{% /alert %}}

With the jobs API, you can schedule jobs and tasks in the future.

> The HTTP APIs are intended for development and testing only. For production scenarios, the use of the SDKs is strongly
> recommended as they implement the gRPC APIs providing higher performance and capability than the HTTP APIs.

## Schedule a job

Schedule a job with a name.

```
POST http://localhost:3500/v1.0-alpha1/jobs/<name>
```

### URL parameters

> **At least one of `schedule` or `dueTime` must be provided, but they can also be provided together**.

Parameter | Description
--------- | -----------
`name` | Name of the job you're scheduling
`data` | A protobuf message `@type` `value` pair. `@type` must be of a [well-known type](https://protobuf.dev/reference/protobuf/google.protobuf). Value is the serialized data.
`schedule` | schedule is an optional schedule at which the job is to be run. Details of the format are below.
`dueTime` | dueTime is the optional time at which the job should be active, or the "one shot" time if other scheduling type fields are not provided. Accepts a "point in time" string in the format of RFC3339, Go duration string (calculated from creation time), or non-repeating ISO8601.
`repeats` | repeats is the optional number of times in which the job should be triggered. If not set, the job will run indefinitely or until expiration.
`ttl` | ttl is the optional time to live or expiration of the job. Accepts a "point in time" string in the format of RFC3339, Go duration string (calculated from job creation time), or non-repeating ISO8601.

#### schedule
`schedule` accepts both systemd timer style cron expressions, as well as human readable '@' prefixed period strings as defined below.

Systemd timer style cron accepts 6 fields:
seconds | minutes | hours | day of month | month        | day of week
0-59    | 0-59    | 0-23  | 1-31         | 1-12/jan-dec | 0-7/sun-sat

"0 30 * * * *" - every hour on the half hour
"0 15 3 * * *" - every day at 03:15

Period string expressions:
Entry                  | Description                                | Equivalent To
-----                  | -----------                                | -------------
@every <duration>      | Run every <duration> (e.g. '@every 1h30m') | N/A
@yearly (or @annually) | Run once a year, midnight, Jan. 1st        | 0 0 0 1 1 *
@monthly               | Run once a month, midnight, first of month | 0 0 0 1 * *
@weekly                | Run once a week, midnight on Sunday        | 0 0 0 * * 0
@daily (or @midnight)  | Run once a day, midnight                   | 0 0 0 * * *
@hourly                | Run once an hour, beginning of hour        | 0 0 * * * *


### Request body

```json
{
  "job": {
    "data": {
	  "@type": "type.googleapis.com/google.protobuf.StringValue",
	  "value": "\"someData\""
    },
    "dueTime": "30s"
  }
}
```

### HTTP response codes

Code | Description
---- | -----------
`204`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or Scheduler control plane service

### Response content

The following example curl command creates a job, naming the job `jobforjabba` and specifying the `schedule`, `repeats` and the `data`.

```bash
$ curl -X POST \
  http://localhost:3500/v1.0-alpha1/jobs/jobforjabba \
  -H "Content-Type: application/json"
  -d '{
        "job": {
            "data": {
	            "@type": "type.googleapis.com/google.protobuf.StringValue",
	            "value": "Running spice"
            },
            "scheudle": "@every 1m",
            "repeats": 5
        }
    }'
```


## Get job data

Get a job from its name.

```
GET http://localhost:3500/v1.0-alpha1/jobs/<name>
```

### URL parameters

Parameter | Description
--------- | -----------
`name` | Name of the scheduled job you're retrieving

### HTTP response codes

Code | Description
---- | -----------
`200`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, Job doesn't exist or error in dapr code or Scheduler control plane service

### Response content

After running the following example curl command, the returned response is JSON containing the `name` of the job, the `dueTime`, and the `data`.

```bash
$ curl -X GET http://localhost:3500/v1.0-alpha1/jobs/jobforjabba -H "Content-Type: application/json"
```

```json
{
  "name": "jobforjabba",
  "schedule": "@every 1m",
  "repeats": 5,
  "data": {
    "@type": "type.googleapis.com/google.protobuf.StringValue",
    "value": "Running spice"
  }
}
```
## Delete a job

Delete a named job.

```
DELETE http://localhost:3500/v1.0-alpha1/jobs/<name>
```

### URL parameters

Parameter | Description
--------- | -----------
`name` | Name of the job you're deleting

### HTTP response codes

Code | Description
---- | -----------
`204`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or Scheduler control plane service

### Response content

In the following example curl command, the job named `test1` with app-id `sub` will be deleted

```bash
$ curl -X DELETE http://localhost:3500/v1.0-alpha1/jobs/jobforjabba -H "Content-Type: application/json"
```


## Next steps

[Jobs API overview]({{< ref jobs-overview.md >}})
