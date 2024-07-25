---
type: docs
title: "How-To: Handle triggered jobs"
linkTitle: "How-To: Handle triggered jobs"
weight: 2000
description: "Learn how to use the jobs API to schedule jobs and handle triggered jobs"
---

Now that you've learned what the [jobs building block]({{< ref jobs-overview.md >}}) provides, let's look at an example of how to use the API. This guide follows an example that uses two applications to set up the jobs API:
- `job-scheduler` application: schedules jobs for droid maintenance.
- `job-service` application: handles the triggered jobs that are sent back to the app at their `dueTime`.

<!-- 
Include a diagram or image, if possible. 
-->

## Start the Scheduler service

When you [run `dapr init` in either self-hosted mode or on Kubernetes]({{< ref install-dapr-selfhost.md >}}), the Dapr Scheduler service is started.

## Set up the Jobs API

### Schedule jobs

In your code, start by setting up and scheduling jobs your project. In the first application, create a new job, including its `name`, `data`, and `dueTime` values.

{{< tabs "Go" >}}

{{% codetab %}}

<!--go-->

For example, the following `job-scheduler` application code uses Go HTTP client to schedule a job named `R2-D2` with a `"value"` of `"R2-D2:Oil Change"` and a `dueTime` of `"2s"`. 

```go
package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

var r2d2JobBody = `{
        "data": {
          "@type": "type.googleapis.com/google.protobuf.StringValue",
          "value": "R2-D2:Oil Change"
        },
        "dueTime": "2s"
    }`

func main() {
	//Sleep for 5 seconds to wait for job-service to start
	time.Sleep(5 * time.Second)

	daprHost := os.Getenv("DAPR_HOST")
	if daprHost == "" {
		daprHost = "http://localhost"
	}

	schedulerDaprHttpPort := "6280"

	client := http.Client{
		Timeout: 30 * time.Second,
	}

	// Schedule a job using the Dapr Jobs API with short dueTime
	jobName := "R2-D2"
	reqURL := daprHost + ":" + schedulerDaprHttpPort + "/v1.0-alpha1/jobs/" + jobName

	req, err := http.NewRequest("POST", reqURL, strings.NewReader(r2d2JobBody))
	if err != nil {
		log.Fatal(err.Error())
	}

	req.Header.Set("Content-Type", "application/json")

	// Schedule a job using the Dapr Jobs API
	res, err := client.Do(req)
	if err != nil {
		log.Fatal(err)
	}

	if res.StatusCode != http.StatusNoContent {
		log.Fatalf("failed to register job event handler. status code: %v", res.StatusCode)
	}

	defer res.Body.Close()

	fmt.Println("Job Scheduled:", jobName)

	// ...
}	
```

### Create a job handler

Next, in a second application, you need to create a job handler that handles the triggered jobs that are sent back to the application. 

For example, the following `job-service` application code has a job handler called `handleJob` to deal with the triggered R2D2 job from earlier, at its `"dueTime": "2s"`.

```go
package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)


type Job struct {
	TypeURL string `json:"type_url"`
	Value   string `json:"value"`
}

type DroidJob struct {
	Droid string `json:"droid"`
	Task  string `json:"task"`
}

func main() {
	appPort := os.Getenv("APP_PORT")
	if appPort == "" {
		appPort = "6200"
	}

	// Setup job handler
	http.HandleFunc("/job/", handleJob)

	fmt.Printf("Server started on port %v\n", appPort)
	err := http.ListenAndServe(":"+appPort, nil)
	if err != nil {
		log.Fatal(err)
	}

}

func handleJob(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Received job request...")
	rawBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("error reading request body: %v", err), http.StatusBadRequest)
		return
	}

	var jobData Job
	if err := json.Unmarshal(rawBody, &jobData); err != nil {
		http.Error(w, fmt.Sprintf("error decoding JSON: %v", err), http.StatusBadRequest)
		return
	}

	// Decoding job data
	decodedValue, err := base64.RawStdEncoding.DecodeString(jobData.Value)
	if err != nil {
		fmt.Printf("Error decoding base64: %v", err)
		http.Error(w, fmt.Sprintf("error decoding base64: %v", err), http.StatusBadRequest)
		return
	}

	// Creating Droid Job from decoded value
	droidJob := setDroidJob(string(decodedValue))

	fmt.Println("Starting droid:", droidJob.Droid)
	fmt.Println("Executing maintenance job:", droidJob.Task)

	w.WriteHeader(http.StatusOK)
}

func setDroidJob(decodedValue string) DroidJob {
	// Removing new lines from decoded value - Workaround for base64 encoding issue
	droidStr := strings.ReplaceAll(decodedValue, "\n", "")
	droidArray := strings.Split(droidStr, ":")

	droidJob := DroidJob{Droid: droidArray[0], Task: droidArray[1]}
	return droidJob
}
```

{{% /codetab %}}


{{< /tabs >}}

## Run the Dapr sidecar

Once you've set up the Jobs API in your application, run the Dapr sidecar. In a terminal window, run the following Dapr command for the `job-service` application.

```bash
// service to handle the triggered jobs
// run locally to the directory where the job handler service lives
dapr run --app-id job-service --app-port 6200 --dapr-http-port 6280 -- go run .
```

In a second terminal window, run the following Dapr command to start the `job-scheduler` application.

```bash
// service to schedule a job to be sent back at some point in the future
// run locally to the directory where the job scheduler service lives
dapr run --app-id job-scheduler --app-port 6300 --dapr-http-port 6380 -- go run .
```

**Expected output**

```text

```



## Next steps

- [Learn more about the Scheduler control plane service]({{< ref "concepts/dapr-services/scheduler.md" >}})
- [Jobs API reference]({{< ref jobs_api.md >}})