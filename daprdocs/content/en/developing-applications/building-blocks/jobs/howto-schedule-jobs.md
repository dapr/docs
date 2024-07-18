---
type: docs
title: "How-To: Schedule jobs"
linkTitle: "How-To: Schedule jobs"
weight: 2000
description: "Learn how to use the jobs API to schedule jobs"
---

Now that you've learned what the [jobs building block]({{< ref jobs-overview.md >}}) provides, let's look at an example of how to use the API. The code example below describes an application that schedules jobs for a **TBD** application.

<!-- 
Include a diagram or image, if possible. 
-->

## Start the Scheduler service

When you [run `dapr init` in either self-hosted mode or on Kubernetes]({{< ref install-dapr-selfhost.md >}}), the Dapr scheduler service is started.

## Set up the Jobs API

In your code, set up and schedule jobs within your application.

{{< tabs ".NET" "Go" >}}

{{% codetab %}}

<!--.net-->


{{% /codetab %}}

{{% codetab %}}

<!--go-->

The Go SDK triggers the job called `daprc.Job` to schedule jobs. Job data is housed in a backup database (`"my-prod-db"`) and are called with `ScheduleJobAlpha1`. For example:

```go
package main

import (
    //...

	daprc "github.com/dapr/go-sdk/client"
	"github.com/dapr/go-sdk/examples/dist-scheduler/api"
	"github.com/dapr/go-sdk/service/common"
	daprs "github.com/dapr/go-sdk/service/grpc"
)

func main() {

    // Initialize the server
	server, err := daprs.NewService(":50070")

    // ...

	ctx := context.Background()

    // Set up backup location
	jobData, err := json.Marshal(&api.DBBackup{
		Task: "db-backup",
		Metadata: api.Metadata{
			DBName:         "my-prod-db",
			BackupLocation: "/backup-dir",
		},
	},
	)
	
    // ...

    // Set up the job data
	job := daprc.Job{
		Name:     "prod-db-backup",
		Schedule: "@every 1s",
		Repeats:  10,
		Data: &anypb.Any{
			Value: jobData,
		},
	}

	// Create the client
	client, err := daprc.NewClient()
    //...

    // Schedule job
	err = client.ScheduleJobAlpha1(ctx, &job)

    // ...

    // Get job
	resp, err := client.GetJobAlpha1(ctx, "prod-db-backup")
    // ...

    // Delete job
	err = client.DeleteJobAlpha1(ctx, "prod-db-backup")
    // ..
}

var jobCount = 0
```

{{% /codetab %}}


{{< /tabs >}}

## Run the Dapr sidecar 

Once you've set up the Jobs API in your application, run the Dapr sidecar. 

```bash
dapr run --app-id=distributed-scheduler --metrics-port=9091 --scheduler-host-address=localhost:50006 --dapr-grpc-port 50001 --app-port 50070 --app-protocol grpc --log-level debug go run ./main.go
```

## Next steps

- [Learn more about the Scheduler control plane service]({{< ref "concepts/dapr-services/scheduler.md" >}})
- [Jobs API reference]({{< ref jobs_api.md >}})