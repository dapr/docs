---
type: docs
title: "Jobs API reference"
linkTitle: "Jobs API"
description: "Detailed documentation on the jobs API"
weight: 900
---

{{% alert title="Note" color="primary" %}}
The jobs API is currently in alpha.
{{% /alert %}}

With the jobs API, you can schedule jobs and tasks in the future.

> The HTTP APIs are intended for development and testing only. For production scenarios, the use of the SDKs is strongly
> recommended as they implement the gRPC APIs providing higher performance and capability than the HTTP APIs. This is because HTTP does JSON marshalling which can be expensive, while with gRPC, the data is transmitted over the wire and stored as-is being more performant.

## Schedule a job

Schedule a job with a name. Jobs are scheduled based on the clock of the server where the Scheduler service is running. The timestamp is not converted to UTC. You can provide the timezone with the timestamp in RFC3339 format to specify which timezone you'd like the job to adhere to. If no timezone is provided, the server's local time is used.

```
POST http://localhost:<daprPort>/v1.0-alpha1/jobs/<name>
```

### URL parameters

{{% alert title="Note" color="primary" %}}
At least one of `schedule` or `dueTime` must be provided, but they can also be provided together.
{{% /alert %}}

Parameter | Description
--------- | -----------
`name` | Name of the job you're scheduling
`data` | A JSON serialized value or object.
`schedule` | An optional schedule at which the job is to be run. Details of the format are below.
`dueTime` | An optional time at which the job should be active, or the "one shot" time, if other scheduling type fields are not provided. Accepts a "point in time" string in the format of RFC3339, Go duration string (calculated from creation time), or non-repeating ISO8601.
`repeats` | An optional number of times in which the job should be triggered. If not set, the job runs indefinitely or until expiration.
`ttl` | An optional time to live or expiration of the job. Accepts a "point in time" string in the format of RFC3339, Go duration string (calculated from job creation time), or non-repeating ISO8601.
`overwrite` | A boolean value to specify if the job can overwrite an existing one with the same name. Default value is `false`
`failure_policy` | An optional failure policy for the job. Details of the format are below. If not set, the job is retried up to 3 times with a delay of 1 second between retries.

#### schedule
`schedule` accepts both systemd timer-style cron expressions, as well as human readable '@' prefixed period strings, as defined below.

Systemd timer style cron accepts 6 fields:
seconds | minutes | hours | day of month | month        | day of week
---     | ---     | ---   | ---          | ---          | ---
0-59    | 0-59    | 0-23  | 1-31         | 1-12/jan-dec | 0-6/sun-sat

##### Example 1
"0 30 * * * *" - every hour on the half hour

##### Example 2
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

#### failure_policy

`failure_policy` specifies how the job should handle failures.

It can be set to `constant` or `drop`.
- The `constant` policy retries the job constantly with the following configuration options.
  - `max_retries` configures how many times the job should be retried. Defaults to retrying indefinitely. `nil` denotes unlimited retries, while `0` means the request will not be retried.
  - `interval` configures the delay between retries. Defaults to retrying immediately. Valid values are of the form `200ms`, `15s`, `2m`, etc.
- The `drop` policy drops the job after the first failure, without retrying.

##### Example 1

```json
{
  //...
  "failure_policy": {
    "constant": {
      "max_retries": 3,
      "interval": "10s"
    }
  }
}
```
##### Example 2

```json
{
  //...
  "failure_policy": {
    "drop": {}
  }
}
```

### Request body

```json
{
  "data": "some data",
  "dueTime": "30s"
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
  -H "Content-Type: application/json" \
  -d '{
        "data": "{\"value\":\"Running spice\"}",
        "schedule": "@every 1m",
        "repeats": 5
    }'
```

## Get job data

Get a job from its name.

```
GET http://localhost:<daprPort>/v1.0-alpha1/jobs/<name>
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
  "data": 123
}
```
## Delete a job

Delete a named job.

```
DELETE http://localhost:<daprPort>/v1.0-alpha1/jobs/<name>
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

[Jobs API overview]({{% ref jobs-overview.md %}})
