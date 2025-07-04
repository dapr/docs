---
type: docs
title: "Quickstart: Jobs"
linkTitle: Jobs
weight: 80
description: Get started with the Dapr jobs building block
---

{{% alert title="Alpha" color="warning" %}}
The jobs building block is currently in **alpha**. 
{{% /alert %}}

Let's take a look at the [Dapr jobs building block]({{< ref jobs-overview.md >}}), which schedules and runs jobs at a specific time or interval. In this Quickstart, you'll schedule, get, and delete a job using Dapr's Job API.

You can try out this jobs quickstart by either:

- [Running all applications in this sample simultaneously with the Multi-App Run template file]({{< ref "#run-using-multi-app-run" >}}), or
- [Running one application at a time]({{< ref "#run-one-job-application-at-a-time" >}})

## Run using Multi-App Run

Select your preferred language-specific Dapr SDK before proceeding with the Quickstart. Currently, you can experiment with the jobs API with the Go SDK.

{{< tabs Go >}}

 <!-- Go -->
{{% codetab %}}

This quickstart includes two apps:

- **`job-scheduler.go`:** schedules, retrieves, and deletes jobs.
- **`job-service.go`:** handles the scheduled jobs.

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest version of Go](https://go.dev/dl/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/jobs/go/sdk).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstarts directory, navigate into the jobs directory:

```bash
cd jobs/go/sdk
```

### Step 3: Schedule jobs

Run the application and schedule jobs with one command:

```bash
dapr run -f .
```

**Expected output**

```text
== APP - job-service == dapr client initializing for: 127.0.0.1:6281
== APP - job-service == Registered job handler for:  R2-D2
== APP - job-service == Registered job handler for:  C-3PO
== APP - job-service == Registered job handler for:  BB-8
== APP - job-service == Starting server on port: 6200
== APP - job-service == Job scheduled:  R2-D2
== APP - job-service == Job scheduled:  C-3PO
== APP - job-service == 2024/07/17 18:09:59 job:{name:"C-3PO"  due_time:"10s"  data:{value:"{\"droid\":\"C-3PO\",\"Task\":\"Memory Wipe\"}"}}
== APP - job-scheduler == Get job response:  {"droid":"C-3PO","Task":"Memory Wipe"}
== APP - job-service == Job scheduled:  BB-8
== APP - job-service == 2024/07/17 18:09:59 job:{name:"BB-8"  due_time:"15s"  data:{value:"{\"droid\":\"BB-8\",\"Task\":\"Internal Gyroscope Check\"}"}}
== APP - job-scheduler == Get job response:  {"droid":"BB-8","Task":"Internal Gyroscope Check"}
== APP - job-scheduler == Deleted job:  BB-8
```

After 5 seconds, the terminal output should present the `R2-D2` job being processed:

```text
== APP - job-service == Starting droid: R2-D2
== APP - job-service == Executing maintenance job: Oil Change
```

After 10 seconds, the terminal output should present the `C3-PO` job being processed:

```text
== APP - job-service == Starting droid: C-3PO
== APP - job-service == Executing maintenance job: Memory Wipe
```

Once the process has completed, you can stop and clean up application processes with a single command.

```bash
dapr stop -f .
```

### What happened?

When you ran `dapr init` during Dapr install:

- The `dapr_scheduler` control plane was started alongside other Dapr services.
- [The `dapr.yaml` Multi-App Run template file]({{< ref "#dapryaml-multi-app-run-template-file" >}}) was generated in the `.dapr/components` directory.

Running `dapr run -f .` in this Quickstart started both the `job-scheduler` and the `job-service`. In the terminal output, you can see the following jobs being scheduled, retrieved, and deleted.

- The `R2-D2` job is being scheduled.
- The `C-3PO` job is being scheduled.
- The `C-3PO` job is being retrieved.
- The `BB-8` job is being scheduled.
- The `BB-8` job is being retrieved.
- The `BB-8` job is being deleted.
- The `R2-D2` job is being executed after 5 seconds.
- The `R2-D2` job is being executed after 10 seconds.

#### `dapr.yaml` Multi-App Run template file

Running the [Multi-App Run template file]({{< ref multi-app-dapr-run >}}) with `dapr run -f .` starts all applications in your project. In this Quickstart, the `dapr.yaml` file contains the following:

```yml
version: 1
apps:
  - appDirPath: ./job-service/
    appID: job-service
    appPort: 6200
    daprGRPCPort: 6281
    appProtocol: grpc
    command: ["go", "run", "."]
  - appDirPath: ./job-scheduler/
    appID: job-scheduler
    appPort: 6300
    command: ["go", "run", "."]
```

#### `job-service` app

The `job-service` application creates service invocation handlers to manage the lifecycle of the job (`scheduleJob`, `getJob`, and `deleteJob`).

```go
if err := server.AddServiceInvocationHandler("scheduleJob", scheduleJob); err != nil {
	log.Fatalf("error adding invocation handler: %v", err)
}

if err := server.AddServiceInvocationHandler("getJob", getJob); err != nil {
	log.Fatalf("error adding invocation handler: %v", err)
}

if err := server.AddServiceInvocationHandler("deleteJob", deleteJob); err != nil {
	log.Fatalf("error adding invocation handler: %v", err)
}
```

Next, job event handlers are registered for all droids:

```go
for _, jobName := range jobNames {
	if err := server.AddJobEventHandler(jobName, handleJob); err != nil {
		log.Fatalf("failed to register job event handler: %v", err)
	}
	fmt.Println("Registered job handler for: ", jobName)
}

fmt.Println("Starting server on port: " + appPort)
if err = server.Start(); err != nil {
	log.Fatalf("failed to start server: %v", err)
}
```

The `job-service` then call functions that handle scheduling, getting, deleting, and handling job events. 

```go
// Handler that schedules a DroidJob
func scheduleJob(ctx context.Context, in *common.InvocationEvent) (out *common.Content, err error) {

	if in == nil {
		err = errors.New("no invocation parameter")
		return
	}

	droidJob := DroidJob{}
	err = json.Unmarshal(in.Data, &droidJob)
	if err != nil {
		fmt.Println("failed to unmarshal job: ", err)
		return nil, err
	}

	jobData := JobData{
		Droid: droidJob.Name,
		Task:  droidJob.Job,
	}

	content, err := json.Marshal(jobData)
	if err != nil {
		fmt.Printf("Error marshalling job content")
		return nil, err
	}

	// schedule job
	job := daprc.Job{
		Name:    droidJob.Name,
		DueTime: droidJob.DueTime,
		Data: &anypb.Any{
			Value: content,
		},
	}

	err = app.daprClient.ScheduleJobAlpha1(ctx, &job)
	if err != nil {
		fmt.Println("failed to schedule job. err: ", err)
		return nil, err
	}

	fmt.Println("Job scheduled: ", droidJob.Name)

	out = &common.Content{
		Data:        in.Data,
		ContentType: in.ContentType,
		DataTypeURL: in.DataTypeURL,
	}

	return out, err

}

// Handler that gets a job by name
func getJob(ctx context.Context, in *common.InvocationEvent) (out *common.Content, err error) {

	if in == nil {
		err = errors.New("no invocation parameter")
		return nil, err
	}

	job, err := app.daprClient.GetJobAlpha1(ctx, string(in.Data))
	if err != nil {
		fmt.Println("failed to get job. err: ", err)
	}

	out = &common.Content{
		Data:        job.Data.Value,
		ContentType: in.ContentType,
		DataTypeURL: in.DataTypeURL,
	}

	return out, err
}

// Handler that deletes a job by name
func deleteJob(ctx context.Context, in *common.InvocationEvent) (out *common.Content, err error) {
	if in == nil {
		err = errors.New("no invocation parameter")
		return nil, err
	}

	err = app.daprClient.DeleteJobAlpha1(ctx, string(in.Data))
	if err != nil {
		fmt.Println("failed to delete job. err: ", err)
	}

	out = &common.Content{
		Data:        in.Data,
		ContentType: in.ContentType,
		DataTypeURL: in.DataTypeURL,
	}

	return out, err
}

// Handler that handles job events
func handleJob(ctx context.Context, job *common.JobEvent) error {
    var jobData common.Job
    if err := json.Unmarshal(job.Data, &jobData); err != nil {
        return fmt.Errorf("failed to unmarshal job: %v", err)
    }

    var jobPayload JobData
    if err := json.Unmarshal(job.Data, &jobPayload); err != nil {
        return fmt.Errorf("failed to unmarshal payload: %v", err)
    }

    fmt.Println("Starting droid:", jobPayload.Droid)
    fmt.Println("Executing maintenance job:", jobPayload.Task)

    return nil
}
```

#### `job-scheduler` app

In the `job-scheduler` application, the R2D2, C3PO, and BB8 jobs are first defined as `[]DroidJob`:

```go
droidJobs := []DroidJob{
	{Name: "R2-D2", Job: "Oil Change", DueTime: "5s"},
	{Name: "C-3PO", Job: "Memory Wipe", DueTime: "15s"},
	{Name: "BB-8", Job: "Internal Gyroscope Check", DueTime: "30s"},
}
```


The jobs are then scheduled, retrieved, and deleted using the jobs API. As you can see from the terminal output, first the R2D2 job is scheduled:

```go
// Schedule R2D2 job
err = schedule(droidJobs[0])
if err != nil {
	log.Fatalln("Error scheduling job: ", err)
}
```

Then, the C3PO job is scheduled, and returns job data:

```go
// Schedule C-3PO job
err = schedule(droidJobs[1])
if err != nil {
	log.Fatalln("Error scheduling job: ", err)
}

// Get C-3PO job
resp, err := get(droidJobs[1])
if err != nil {
	log.Fatalln("Error retrieving job: ", err)
}
fmt.Println("Get job response: ", resp)
```

The BB8 job is then scheduled, retrieved, and deleted:

```go
// Schedule BB-8 job
err = schedule(droidJobs[2])
if err != nil {
	log.Fatalln("Error scheduling job: ", err)
}

// Get BB-8 job
resp, err = get(droidJobs[2])
if err != nil {
	log.Fatalln("Error retrieving job: ", err)
}
fmt.Println("Get job response: ", resp)

// Delete BB-8 job
err = delete(droidJobs[2])
if err != nil {
	log.Fatalln("Error deleting job: ", err)
}
fmt.Println("Job deleted: ", droidJobs[2].Name)
```

The `job-scheduler.go` also defines the `schedule`, `get`, and `delete` functions, calling from `job-service.go`.

```go
// Schedules a job by invoking grpc service from job-service passing a DroidJob as an argument
func schedule(droidJob DroidJob) error {
	jobData, err := json.Marshal(droidJob)
	if err != nil {
		fmt.Println("Error marshalling job content")
		return err
	}

	content := &daprc.DataContent{
		ContentType: "application/json",
		Data:        []byte(jobData),
	}

	// Schedule Job
	_, err = app.daprClient.InvokeMethodWithContent(context.Background(), "job-service", "scheduleJob", "POST", content)
	if err != nil {
		fmt.Println("Error invoking method: ", err)
		return err
	}

	return nil
}

// Gets a job by invoking grpc service from job-service passing a job name as an argument
func get(droidJob DroidJob) (string, error) {
	content := &daprc.DataContent{
		ContentType: "text/plain",
		Data:        []byte(droidJob.Name),
	}

	//get job
	resp, err := app.daprClient.InvokeMethodWithContent(context.Background(), "job-service", "getJob", "GET", content)
	if err != nil {
		fmt.Println("Error invoking method: ", err)
		return "", err
	}

	return string(resp), nil
}

// Deletes a job by invoking grpc service from job-service passing a job name as an argument
func delete(droidJob DroidJob) error {
	content := &daprc.DataContent{
		ContentType: "text/plain",
		Data:        []byte(droidJob.Name),
	}

	_, err := app.daprClient.InvokeMethodWithContent(context.Background(), "job-service", "deleteJob", "DELETE", content)
	if err != nil {
		fmt.Println("Error invoking method: ", err)
		return err
	}

	return nil
}
```

{{% /codetab %}}

{{< /tabs >}}

## Run one job application at a time

{{< tabs Go >}}

 <!-- Go -->
{{% codetab %}}

This quickstart includes two apps:

- **`job-scheduler.go`:** schedules, retrieves, and deletes jobs.
- **`job-service.go`:** handles the scheduled jobs.

### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest version of Go](https://go.dev/dl/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/jobs).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstarts directory, navigate into the jobs directory:

```bash
cd jobs/go/sdk
```

### Step 3: Schedule jobs

In the terminal, run the `job-service` app:

```bash
dapr run --app-id job-service --app-port 6200 --dapr-grpc-port 6281 --app-protocol grpc -- go run .
```

**Expected output**

```text
== APP == dapr client initializing for: 127.0.0.1:6281
== APP == Registered job handler for:  R2-D2
== APP == Registered job handler for:  C-3PO
== APP == Registered job handler for:  BB-8
== APP == Starting server on port: 6200
```

In a new terminal window, run the `job-scheduler` app:

```bash
dapr run --app-id job-scheduler --app-port 6300 -- go run .
```

**Expected output**

```text
== APP == dapr client initializing for: 
== APP == Get job response:  {"droid":"C-3PO","Task":"Memory Wipe"}
== APP == Get job response:  {"droid":"BB-8","Task":"Internal Gyroscope Check"}
== APP == Job deleted:  BB-8
```

Return to the `job-service` app terminal window. The output should be:

```text
== APP == Job scheduled:  R2-D2
== APP == Job scheduled:  C-3PO
== APP == 2024/07/17 18:25:36 job:{name:"C-3PO"  due_time:"10s"  data:{value:"{\"droid\":\"C-3PO\",\"Task\":\"Memory Wipe\"}"}}
== APP == Job scheduled:  BB-8
== APP == 2024/07/17 18:25:36 job:{name:"BB-8"  due_time:"15s"  data:{value:"{\"droid\":\"BB-8\",\"Task\":\"Internal Gyroscope Check\"}"}}
== APP == Starting droid: R2-D2
== APP == Executing maintenance job: Oil Change
== APP == Starting droid: C-3PO
== APP == Executing maintenance job: Memory Wipe
```

Unpack what happened in the [`job-service`]({{< ref "#job-service-app" >}}) and [`job-scheduler`]({{< ref "#job-scheduler-app" >}}) applications when you ran `dapr run`.

{{% /codetab %}}

{{< /tabs >}}


## Watch the demo

See the jobs API in action using a Go HTTP example, recorded during the [Dapr Community Call #107(https://www.youtube.com/live/WHGOc7Ec_YQ?si=JlOlcJKkhRuhf5R1&t=849)].

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/WHGOc7Ec_YQ?si=JlOlcJKkhRuhf5R1&amp;start=849" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Tell us what you think!

We're continuously working to improve our Quickstart examples and value your feedback. Did you find this Quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps

- HTTP samples of this quickstart:
  - [Go](https://github.com/dapr/quickstarts/tree/master/jobs/go/http)
- Learn more about [the jobs building block]({{< ref jobs-overview.md >}})
- Learn more about [the scheduler control plane]({{< ref scheduler.md >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
