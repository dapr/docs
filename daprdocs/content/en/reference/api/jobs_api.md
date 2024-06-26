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

With the jobs API, you can schedule jobs and tasks in the future.

## Schedule a job

Schedule a job with a name.

```
POST http://localhost:3500/v1.0-alpha1/jobs/<name>
```

### URL parameters

Parameter | Description
--------- | -----------
`name` | Name of the job you're scheduling
`data` | A string value and can be any related content. Content is returned when the reminder expires. For example, this may be useful for returning a URL or anything related to the content.
`dueTime` | Specifies the time after which this job is invoked. Its format should be [time.ParseDuration](https://pkg.go.dev/time#ParseDuration)

### Request body

```json
{
  "job": {
      "data": {
          "@type": "type.googleapis.com/google.type.Expr",
          "expression": "<expression>"
      },
      "dueTime": "30s"
  }
}
```

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or Scheduler control plane service

### Response content

The following example curl command creates a job, naming the job `jobforjabba` and specifying the `dueTime` and the `data`.

```bash
$ curl -X POST \
  http://localhost:3500/v1.0-alpha1/jobs/jobforjabba \
  -H "Content-Type: application/json" 
  -d '{
        "job": {
            "data": {
                "HanSolo": "Running spice"
            },
            "dueTime": "30s"
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
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or Scheduler control plane service

### Response content

After running the following example curl command, the returned response is JSON containing the `name` of the job, the `dueTime`, and the `data`.

```bash
$ curl -X GET http://localhost:3500/v1.0-alpha1/jobs/jobforjabba -H "Content-Type: application/json" 
```

```json
{
  "name":"test1",
  "dueTime":"30s",
  "data": {
     "HanSolo": "Running spice"
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
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or Scheduler control plane service

### Response content

In the following example curl command, the job named `test1` with app-id `sub` will be deleted

```bash
$ curl -X DELETE http://localhost:3500/v1.0-alpha1/jobs/jobforjabba -H "Content-Type: application/json" 
```


## Next steps

[Jobs API overview]({{< ref jobs-overview.md >}})
