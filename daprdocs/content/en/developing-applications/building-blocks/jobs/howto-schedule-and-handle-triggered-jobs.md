---
type: docs
title: "How-To: Schedule and handle triggered jobs"
linkTitle: "How-To: Schedule and handle triggered jobs"
weight: 5000
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

{{< tabs ".NET" "Go" >}}

{{% codetab %}}

<!-- .NET -->

The following .NET SDK code sample schedules the job named `prod-db-backup`. The job data contains information
about the database that you'll be seeking to backup regularly. Over the course of this example, you'll:
- Define types used in the rest of the example
- Register an endpoint during application startup that handles all job trigger invocations on the service
- Register the job with Dapr

In the following example, you'll create records that you'll serialize and register alongside the job so the information 
is available when the job is triggered in the future:
- The name of the backup task (`db-backup`)
- The backup task's `Metadata`, including:
  - The database name (`DBName`)
  - The database location (`BackupLocation`)

Create an ASP.NET Core project and add the latest version of `Dapr.Jobs` from NuGet. 

> **Note:** While it's not strictly necessary
for your project to use the `Microsoft.NET.Sdk.Web` SDK to create jobs, as of the time this documentation is authored,
only the service that schedules a job receives trigger invocations for it. As those invocations expect an endpoint
that can handle the job trigger and requires the `Microsoft.NET.Sdk.Web` SDK, it's recommended that you
use an ASP.NET Core project for this purpose.

Start by defining types to persist our backup job data and apply our own JSON property name attributes to the properties 
so they're consistent with other language examples.

```cs
//Define the types that we'll represent the job data with
internal sealed record BackupJobData([property: JsonPropertyName("task")] string Task, [property: JsonPropertyName("metadata")] BackupMetadata Metadata);
internal sealed record BackupMetadata([property: JsonPropertyName("DBName")]string DatabaseName, [property: JsonPropertyName("BackupLocation")] string BackupLocation);
```

Next, set up a handler as part of your application setup that will be called anytime a job is triggered on your
application. It's the responsibility of this handler to identify how jobs should be processed based on the job name provided.

This works by registering a handler with ASP.NET Core at `/job/<job-name>`, where `<job-name>` is parameterized and 
passed into this handler delegate, meeting Dapr's expectation that an endpoint is available to handle triggered named jobs.

Populate your `Program.cs` file with the following: 

```cs
using System.Text;
using System.Text.Json;
using Dapr.Jobs;
using Dapr.Jobs.Extensions;
using Dapr.Jobs.Models;
using Dapr.Jobs.Models.Responses;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprJobsClient();
var app = builder.Build();

//Registers an endpoint to receive and process triggered jobs
var cancellationTokenSource = new CancellationTokenSource(TimeSpan.FromSeconds(5));
app.MapDaprScheduledJobHandler((string jobName, DaprJobDetails jobDetails, ILogger logger, CancellationToken cancellationToken) => {
  logger?.LogInformation("Received trigger invocation for job '{jobName}'", jobName);
  switch (jobName)
  {
    case "prod-db-backup":
      // Deserialize the job payload metadata
      var jobData = JsonSerializer.Deserialize<BackupJobData>(jobDetails.Payload);
      
      // Process the backup operation - we assume this is implemented elsewhere in your code
      await BackupDatabaseAsync(jobData, cancellationToken);
      break;
  }
}, cancellationTokenSource.Token);

await app.RunAsync();
```

Finally, the job itself needs to be registered with Dapr so it can be triggered at a later point in time. You can do this
by injecting a `DaprJobsClient` into a class and executing as part of an inbound operation to your application, but for
this example's purposes, it'll go at the bottom of the `Program.cs` file you started above. Because you'll be using the
`DaprJobsClient` you registered with dependency injection, start by creating a scope so you can access it.

```cs
//Create a scope so we can access the registered DaprJobsClient
await using scope = app.Services.CreateAsyncScope();
var daprJobsClient = scope.ServiceProvider.GetRequiredService<DaprJobsClient>();

//Create the payload we wish to present alongside our future job triggers
var jobData = new BackupJobData("db-backup", new BackupMetadata("my-prod-db", "/backup-dir")); 

//Serialize our payload to UTF-8 bytes
var serializedJobData = JsonSerializer.SerializeToUtf8Bytes(jobData);

//Schedule our backup job to run every minute, but only repeat 10 times
await daprJobsClient.ScheduleJobAsync("prod-db-backup", DaprJobSchedule.FromDuration(TimeSpan.FromMinutes(1)),
    serializedJobData, repeats: 10);
```

{{% /codetab %}}

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

When a job is triggered, Dapr will automatically route the job to the event handler you set up during the server 
initialization. For example, in Go, you'd register the event handler like this:

```go
...
if err = server.AddJobEventHandler("prod-db-backup", prodDBBackupHandler); err != nil {
    log.Fatalf("failed to register job event handler: %v", err)
}
```

Dapr takes care of the underlying routing. When the job is triggered, your `prodDBBackupHandler` function is called with
the triggered job data. Here’s an example of handling the triggered job:

```go
// ...

// At job trigger time this function is called
func prodDBBackupHandler(ctx context.Context, job *common.JobEvent) error {
	var jobData common.Job
	if err := json.Unmarshal(job.Data, &jobData); err != nil {
		// ...
	}

	var jobPayload api.DBBackup
	if err := json.Unmarshal(job.Data, &jobPayload); err != nil {
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
