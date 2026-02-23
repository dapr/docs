---
type: docs
title: "How to: Author and manage Dapr Jobs in the Java SDK"
linkTitle: "How to: Author and manage Jobs"
weight: 20000
description: How to get up and running with Jobs using the Dapr Java SDK
---

As part of this demonstration we will schedule a Dapr Job. The scheduled job will trigger an endpoint registered in the
same app. With the [provided jobs example](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/jobs), you will:

- Schedule a Job [Job scheduling example](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/jobs/DemoJobsClient.java)
- Register an endpoint for the dapr sidecar to invoke at trigger time [Endpoint Registration](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/jobs/DemoJobsSpringApplication.java)

This example uses the default configuration from `dapr init` in [self-hosted mode](https://github.com/dapr/cli#install-dapr-on-your-local-machine-self-hosted).

## Prerequisites

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 11 (or greater):
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads), or
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html), version 3.x.
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

## Set up the environment

Clone the [Java SDK repo](https://github.com/dapr/java-sdk) and navigate into it.

```bash
git clone https://github.com/dapr/java-sdk.git
cd java-sdk
```

Run the following command to install the requirements for running the jobs example with the Dapr Java SDK.

```bash
mvn clean install -DskipTests
```

From the Java SDK root directory, navigate to the examples' directory.

```bash
cd examples
```

Run the Dapr sidecar.

```sh
dapr run --app-id jobsapp --dapr-grpc-port 51439 --dapr-http-port 3500 --app-port 8080
```

> Now, Dapr is listening for HTTP requests at `http://localhost:3500` and internal Jobs gRPC requests at `http://localhost:51439`.

## Schedule and Get a job

In the `DemoJobsClient` there are steps to schedule a job. Calling `scheduleJob` using the `DaprPreviewClient`
will schedule a job with the Dapr Runtime. 

```java
public class DemoJobsClient {

  /**
   * The main method of this app to schedule and get jobs.
   */
  public static void main(String[] args) throws Exception {
    try (DaprPreviewClient client = new DaprClientBuilder().withPropertyOverrides(overrides).buildPreviewClient()) {

      // Schedule a job.
      System.out.println("**** Scheduling a Job with name dapr-jobs-1 *****");
      ScheduleJobRequest scheduleJobRequest = new ScheduleJobRequest("dapr-job-1",
          JobSchedule.fromString("* * * * * *")).setData("Hello World!".getBytes());
      client.scheduleJob(scheduleJobRequest).block();

      System.out.println("**** Scheduling job dapr-jobs-1 completed *****");
    }
  }
}
```

Call `getJob` to retrieve the job details that were previously created and scheduled.
```
client.getJob(new GetJobRequest("dapr-job-1")).block()
```

Run the `DemoJobsClient` with the following command.

```sh
java -jar target/dapr-java-sdk-examples-exec.jar io.dapr.examples.jobs.DemoJobsClient
```

### Sample output
```
**** Scheduling a Job with name dapr-jobs-1 *****
**** Scheduling job dapr-jobs-1 completed *****
**** Retrieving a Job with name dapr-jobs-1 *****
```

## Set up an endpoint to be invoked when the job is triggered

The `DemoJobsSpringApplication` class starts a Spring Boot application that registers the endpoints specified in the `JobsController`
This endpoint acts like a callback for the scheduled job requests.

```java
@RestController
public class JobsController {

  /**
   * Handles jobs callback from Dapr.
   *
   * @param jobName name of the job.
   * @param payload data from the job if payload exists.
   * @return Empty Mono.
   */
  @PostMapping("/job/{jobName}")
  public Mono<Void> handleJob(@PathVariable("jobName") String jobName,
                              @RequestBody(required = false) byte[] payload) {
    System.out.println("Job Name: " + jobName);
    System.out.println("Job Payload: " + new String(payload));

    return Mono.empty();
  }
}
```

Parameters:

* `jobName`: The name of the triggered job.
* `payload`: Optional payload data associated with the job (as a byte array).

Run the Spring Boot application with the following command.

```sh
java -jar target/dapr-java-sdk-examples-exec.jar io.dapr.examples.jobs.DemoJobsSpringApplication
```

### Sample output
```
Job Name: dapr-job-1
Job Payload: Hello World!
```

## Delete a scheduled job

```java
public class DemoJobsClient {

  /**
   * The main method of this app deletes a job that was previously scheduled.
   */
  public static void main(String[] args) throws Exception {
    try (DaprPreviewClient client = new DaprClientBuilder().buildPreviewClient()) {

      // Delete a job.
      System.out.println("**** Delete a Job with name dapr-jobs-1 *****");
      client.deleteJob(new DeleteJobRequest("dapr-job-1")).block();
    }
  }
}
```

## Next steps
- [Learn more about Jobs]({{% ref jobs-overview.md %}})
- [Jobs API reference]({{% ref jobs_api.md %}})