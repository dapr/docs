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

{{< tabs ".NET" "Go" >}}

{{% codetab %}}

<!-- .net -->

The following .NET SDK code sample schedules the job named `prod-db-backup`. Job data is housed in a backup database (`"my-prod-db"`) and is schedueled with `ScheduleJobAsync` from the Dapr Jobs client.  This provides the `jobData` which includes:
- The backup `Task` name
- The backup tasks's `Metadata` including:
  - The database name (`DBName`)
  - The database location (`BackupLocation`)

```csharp
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Dapr.Jobs;
using Dapr.Jobs.Extensions;
using Dapr.Jobs.Models;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprJobsClient();
var app = builder.Build();

// In practice, this would likely be in another service, but for completeness, we'll put this sample in a single file
var DoProdDbBackupHandler = (DbBackupJobPayload? payload) => {
	//Do something
};

// Set a handler for incoming jobs
var cancellationTokenSource = new CancellationTokenSource(TimeSpan.FromSeconds(5));
app.MapDaprScheduledJobHandler((string? jobName, DaprJobDetails? jobDetails, CancellationToken cancellationToken) => {
	switch (jobName)
	{
		case "prod-db-backup":
			var deserializedPayload = JsonSerializer.Deserialize<DbBackupJobPayload>(jobDetails?.Payload) ?? null;
			DoProdDbBackupHandler(deserializedPayload);
			break;
		default:
			break;
	}
	return Task.CompletedTask;
}, cancellationTokenSource.Token);
app.Run();

//Typically you'd just inject DaprJobsClient into a service/controller, 
await using var scope = app.Services.CreateAsyncScope();
var daprJobsClient = scope.ServiceProvider.GetRequiredService<DaprJobsClient>();

//Set up the job payload
var jobPayload = new DbBackupJobPayload("db-backup", new("my-prod-db", "/backup-dir"));
var payloadBytes = JsonSerializer.SerializeToUtf8Bytes(jobPayload);

//Schedule the job
await daprJobsClient.ScheduleJobAsync("prod-db-backup", DaprJobSchedule.FromExpression("@every 1s"), payloadBytes, repeats: 10);

//Specify the records and their JSON property names comprising the sample job payload
sealed record DbBackupJobPayload(
	[property: JsonPropertyName("Task")] string Task, 
	[property: JsonPropertyName("Metadata")] DatabaseMetadata Metadata);
sealed record DatabaseMetadata(
	[property: JsonPropertyName("DBName")] string Name, 
	[property: JsonPropertyName("BackupLocation")] string BackupLocation);
```

The job is using the free-form `@every` expressions to let the developer indicate that the job should be triggered `@every 1s` and sets the optional `repeats` argument to indicate the maximum number of times the job should be triggered and sent back to the app; in this scenario, we set a value of 10 indicating that the job should be triggered a maximum of ten times.

At the trigger time, the registered handler will be invoked and will execute the desired business logic for the job. In this sample, we apply a switch statement with a value known at compile-time, but in a real-world app, this would very well perform a more dynamic service lookup in order to determine how any given job name should be handled.

The `MapDaprScheduledJobHandler` accepts a delegate that works much like the ASP.NET Core minimal API parameter binding logic. The first parameter will always contain the name of the job, the second will reflect the job details provided in the callback and the last parameter must be a cancellation token. Otherwise, the developer is free to provide any additional services registered via dependency injection before the cancellation token argument and they will be injected at runtime.

#### HTTP
When you create a job using Jobs API, Dapr assumes there is an endpoint available at `/job/<job-name>`. For example, if you schedule a job named `test`, Dapr expects your application to listen for job events at `job/test`. Ensure your application has a handler set up for this endpoint to process the job when it is triggered. For example:

```csharp

[ApiController]
public JobsController : ControllerBase
{
	[HttpPost("/job/{jobName}"]
	public async Task HandleJobsAsync(string jobName, DeserializableDaprJobDetails jobDetails)
	{
		//...
	}

	[HttpPost("/job/prod-db-backup")]
	public async Task HandleSpecificJobAsync(DeserializableDaprJobDetails jobDetails)
	{
		//...
	}
}

```

{{% /codetab %}}

{{% codetab %}}

<!--go-->

The following Go SDK code sample schedules the job named `prod-db-backup`. Job data is housed in a backup database (`"my-prod-db"`) and is scheduled with `ScheduleJobAlpha1`. This provides the `jobData` which includes:
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

At the trigger time, the `prodDBBackupHandler` function is called, executing the desired business logic for this job at trigger time.

#### HTTP

When you create a job using Dapr's Jobs API, Dapr will automatically assume there is an endpoint available at 
`/job/<job-name>`. For instance, if you schedule a job named `test`, Dapr expects your application to listen for job 
events at `/job/test`. Ensure your application has a handler set up for this endpoint to process the job when it is 
triggered. For example:

*Note: The following example is in Go but applies to any programming language.*

```go

func main() {
    ...
    http.HandleFunc("/job/", handleJob)
	http.HandleFunc("/job/<job-name>", specificJob)
    ...
}

func specificJob(w http.ResponseWriter, r *http.Request) {
    // Handle specific triggered job
}

func handleJob(w http.ResponseWriter, r *http.Request) {
    // Handle the triggered jobs
}
```

#### gRPC

When a job reaches its scheduled trigger time, the triggered job is sent back to the application via the following 
callback function:

*Note: The following example is in Go but applies to any programming language with gRPC support.*

```go
import rtv1 "github.com/dapr/dapr/pkg/proto/runtime/v1"
...
func (s *JobService) OnJobEventAlpha1(ctx context.Context, in *rtv1.JobEventRequest) (*rtv1.JobEventResponse, error) {
    // Handle the triggered job
}
```

This function processes the triggered jobs within the context of your gRPC server. When you set up the server, ensure that 
you register the callback server, which will invoke this function when a job is triggered:

```go
...
js := &JobService{}
rtv1.RegisterAppCallbackAlphaServer(server, js)
```

In this setup, you have full control over how triggered jobs are received and processed, as they are routed directly 
through this gRPC method.

#### SDKs

For SDK users, handling triggered jobs is simpler. When a job is triggered, Dapr will automatically route the job to the 
event handler you set up during the server initialization. For example, in Go, you'd register the event handler like this:

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
