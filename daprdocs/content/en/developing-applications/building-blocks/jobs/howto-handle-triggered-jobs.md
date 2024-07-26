
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

The following is application code to handle the triggered jobs that are sent back to the application at their dueTime.

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

Once you've set up the Jobs API in your application, run the Dapr sidecar.

```bash
// service to handle the triggered jobs
// run locally to the directory where the job handler service lives
dapr run --app-id job-service --app-port 6200 --dapr-http-port 6280 -- go run .

// service to schedule a job to be sent back at some point in the future
// run locally to the directory where the job scheduler service lives
dapr run --app-id job-scheduler --app-port 6300 --dapr-http-port 6380 -- go run .
```

## Next steps

- [Learn more about the Scheduler control plane service]({{< ref "concepts/dapr-services/scheduler.md" >}})
- [Jobs API reference]({{< ref jobs_api.md >}})