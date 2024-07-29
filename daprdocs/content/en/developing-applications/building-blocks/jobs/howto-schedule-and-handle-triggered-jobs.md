---
type: docs
title: "How-To: Schedule and handle triggered jobs"
linkTitle: "How-To: Schedule and handle triggered jobs"
weight: 2000
description: "Learn how to use the jobs API to schedule and handle triggered jobs"
---

Now that you've learned what the [jobs building block]({{< ref jobs-overview.md >}}) provides, let's look at an example of how to use the API. The code example below describes an application that schedules jobs for a database backup application and handles them at trigger time, also known as the time the job was sent back to the application because it reached it's dueTime.

<!-- 
Include a diagram or image, if possible. 
-->

## Start the Scheduler service

When you [run `dapr init` in either self-hosted mode or on Kubernetes]({{< ref install-dapr-selfhost.md >}}), the Dapr Scheduler service is started.

## Set up the Jobs API

In your code, set up and schedule jobs within your application.

{{< tabs "Go" >}}

{{% codetab %}}

<!--go-->

The following Go SDK code sample schedules the job named `prod-db-backup`. Job data is housed in a backup database (`"my-prod-db"`) and is scheduled with `ScheduleJobAlpha1`. This provides the `jobData`, which includes:
- The backup `Task` name
- The backup task's `Metadata`, including:
  - The database name (`DBName`)
  - The database location (`BackupLocation`)


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

	if err = server.AddJobEventHandler("prod-db-backup", prodDBBackupHandler); err != nil {
		log.Fatalf("failed to register job event handler: %v", err)
	}

	log.Println("starting server")
	go func() {
		if err = server.Start(); err != nil {
			log.Fatalf("failed to start server: %v", err)
		}
	}()
    // ...

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
}
```

The job is scheduled with a `Schedule` set and the amount of `Repeats` desired. These settings determine a max amount of times the job should be triggered and sent back to the app. 

In this example, at trigger time, which is `@every 1s` according to the `Schedule`, this job is triggered and sent back to the application up to the max `Repeats` (`10`). 

```go	
    // ...
    // Set up the job
	job := daprc.Job{
		Name:     "prod-db-backup",
		Schedule: "@every 1s",
		Repeats:  10,
		Data: &anypb.Any{
			Value: jobData,
		},
	}
```

At the trigger time, the `prodDBBackupHandler` function is called, executing the desired business logic for this job at trigger time. For example:

```go
// ...

// At job trigger time this function is called
func prodDBBackupHandler(ctx context.Context, job *common.JobEvent) error {
	var jobData common.Job
	if err := json.Unmarshal(job.Data, &jobData); err != nil {
		// ...
	}
	decodedPayload, err := base64.StdEncoding.DecodeString(jobData.Value)
	// ...

	var jobPayload api.DBBackup
	if err := json.Unmarshal(decodedPayload, &jobPayload); err != nil {
		// ...
	}
	fmt.Printf("job %d received:\n type: %v \n typeurl: %v\n value: %v\n extracted payload: %v\n", jobCount, job.JobType, jobData.TypeURL, jobData.Value, jobPayload)
	jobCount++
	return nil
}
```

{{% /codetab %}}

{{< /tabs >}}

## Run the Dapr sidecar 

Once you've set up the Jobs API in your application, in a terminal window run the Dapr sidecar with the following command. 

{{< tabs "Go" >}}

{{% codetab %}}

```bash
dapr run --app-id=distributed-scheduler \
                --metrics-port=9091 \
                --dapr-grpc-port 50001 \
                --app-port 50070 \
                --app-protocol grpc \
                --log-level debug \
                go run ./main.go
```

{{% /codetab %}}

{{< /tabs >}}


## Next steps

- [Learn more about the Scheduler control plane service]({{< ref "concepts/dapr-services/scheduler.md" >}})
- [Jobs API reference]({{< ref jobs_api.md >}})