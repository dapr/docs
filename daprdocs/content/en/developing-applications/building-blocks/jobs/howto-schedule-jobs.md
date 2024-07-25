---
type: docs
title: "How-To: Schedule jobs"
linkTitle: "How-To: Schedule jobs"
weight: 2000
description: "Learn how to use the jobs API to schedule jobs"
---

Now that you've learned what the [jobs building block]({{< ref jobs-overview.md >}}) provides, let's look at an example of how to use the API. The code example below describes an application that schedules jobs for a database backup application.

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

The Go SDK schedules the job named `prod-db-backup`. Job data is housed in a backup database (`"my-prod-db"`) and are called with `ScheduleJobAlpha1`. For example:

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

	if err != nil {
		log.Fatalf("failed to start the server: %v", err)
	}

	if err = server.AddJobEventHandler("prod-db-backup", prodDBBackupHandler); err != nil {
		log.Fatalf("failed to register job event handler: %v", err)
	}

	log.Println("starting server")
	go func() {
		if err = server.Start(); err != nil {
			log.Fatalf("failed to start server: %v", err)
		}
	}()

	// Brief intermission to allow for the server to initialize.
	time.Sleep(10 * time.Second)
	
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

	if err != nil {
		panic(err)
	}
	
    // Set up the job
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
	if err != nil {
		panic(err)
	}
	defer client.Close()

    // Schedule job
	err = client.ScheduleJobAlpha1(ctx, &job)
	if err != nil {
		panic(err)
	}


	fmt.Println("schedulejob - success")

	time.Sleep(3 * time.Second)

	// Get job
	resp, err := client.GetJobAlpha1(ctx, "prod-db-backup")
	if err != nil {
		panic(err)
	}
	fmt.Printf("getjob - resp: %v\n", resp) // parse
	
    // Delete job
	err = client.DeleteJobAlpha1(ctx, "prod-db-backup")
	if err != nil {
		fmt.Printf("job deletion error: %v\n", err)
	} else {
		fmt.Println("deletejob - success")
	}

	if err = server.Stop(); err != nil {
		log.Fatalf("failed to stop server: %v\n", err)
	}
}

var jobCount = 0


func prodDBBackupHandler(ctx context.Context, job *common.JobEvent) error {
	var jobData common.Job
	if err := json.Unmarshal(job.Data, &jobData); err != nil {
		return fmt.Errorf("failed to unmarshal job: %v", err)
	}
	decodedPayload, err := base64.StdEncoding.DecodeString(jobData.Value)
	if err != nil {
		return fmt.Errorf("failed to decode job payload: %v", err)
	}
	var jobPayload api.DBBackup
	if err := json.Unmarshal(decodedPayload, &jobPayload); err != nil {
		return fmt.Errorf("failed to unmarshal payload: %v", err)
	}
	fmt.Printf("job %d received:\n type: %v \n typeurl: %v\n value: %v\n extracted payload: %v\n", jobCount, job.JobType, jobData.TypeURL, jobData.Value, jobPayload)
	jobCount++
	return nil
}

```

{{% /codetab %}}


{{< /tabs >}}

## Run the Dapr sidecar 

Once you've set up the Jobs API in your application, run the Dapr sidecar. 

```bash
dapr run --app-id=distributed-scheduler --metrics-port=9091 --dapr-grpc-port 50001 --app-port 50070 --app-protocol grpc --log-level debug go run ./main.go
```

## Next steps

- [Learn more about the Scheduler control plane service]({{< ref "concepts/dapr-services/scheduler.md" >}})
- [Jobs API reference]({{< ref jobs_api.md >}})