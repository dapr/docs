---
type: docs
title: "Getting started with the Dapr client Java SDK"
linkTitle: "Client"
weight: 3000
description: How to get up and running with the Dapr Java SDK
---

The Dapr client package allows you to interact with other Dapr applications from a Java application.

{{% alert title="Note" color="primary" %}}
If you haven't already, [try out one of the quickstarts]({{% ref quickstarts %}}) for a quick walk-through on how to use the Dapr Java SDK with an API building block.

{{% /alert %}}

## Prerequisites

[Complete initial setup and import the Java SDK into your project]({{% ref java %}})

## Initializing the client

You can initialize a Dapr client as so:

```java
DaprClient client = new DaprClientBuilder().build()
```

This will connect to the default Dapr gRPC endpoint `localhost:50001`. For information about configuring the client using environment variables and system properties, see [Properties]({{% ref properties.md %}}).

#### Error Handling

Initially, errors in Dapr followed the Standard gRPC error model. However, to provide more detailed and informative error 
messages, in version 1.13 an enhanced error model has been introduced which aligns with the gRPC Richer error model. In 
response, the Java SDK extended the DaprException to include the error details that were added in Dapr. 

Example of handling the DaprException and consuming the error details when using the Dapr Java SDK:

```java
...
      try {
        client.publishEvent("unknown_pubsub", "mytopic", "mydata").block();
      } catch (DaprException exception) {
        System.out.println("Dapr exception's error code: " + exception.getErrorCode());
        System.out.println("Dapr exception's message: " + exception.getMessage());
        // DaprException now contains `getStatusDetails()` to include more details about the error from Dapr runtime.
        System.out.println("Dapr exception's reason: " + exception.getStatusDetails().get(
        DaprErrorDetails.ErrorDetailType.ERROR_INFO,
            "reason",
        TypeRef.STRING));
      }
...
```

## Building blocks

The Java SDK allows you to interface with all of the [Dapr building blocks]({{% ref building-blocks %}}).

### Invoke a service

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  // invoke a 'GET' method (HTTP) skipping serialization: \say with a Mono<byte[]> return type
  // for gRPC set HttpExtension.NONE parameters below
  response = client.invokeMethod(SERVICE_TO_INVOKE, METHOD_TO_INVOKE, "{\"name\":\"World!\"}", HttpExtension.GET, byte[].class).block();

  // invoke a 'POST' method (HTTP) skipping serialization: to \say with a Mono<byte[]> return type     
  response = client.invokeMethod(SERVICE_TO_INVOKE, METHOD_TO_INVOKE, "{\"id\":\"100\", \"FirstName\":\"Value\", \"LastName\":\"Value\"}", HttpExtension.POST, byte[].class).block();

  System.out.println(new String(response));

  // invoke a 'POST' method (HTTP) with serialization: \employees with a Mono<Employee> return type      
  Employee newEmployee = new Employee("Nigel", "Guitarist");
  Employee employeeResponse = client.invokeMethod(SERVICE_TO_INVOKE, "employees", newEmployee, HttpExtension.POST, Employee.class).block();
}
```

- For a full guide on service invocation visit [How-To: Invoke a service]({{% ref howto-invoke-discover-services.md %}}).
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/invoke) for code samples and instructions to try out service invocation

### Save & get application state

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import reactor.core.publisher.Mono;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  // Save state
  client.saveState(STATE_STORE_NAME, FIRST_KEY_NAME, myClass).block();

  // Get state
  State<MyClass> retrievedMessage = client.getState(STATE_STORE_NAME, FIRST_KEY_NAME, MyClass.class).block();

  // Delete state
  client.deleteState(STATE_STORE_NAME, FIRST_KEY_NAME).block();
}
```

- For a full list of state operations visit [How-To: Get & save state]({{% ref howto-get-save-state.md %}}).
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/state) for code samples and instructions to try out state management

### Publish & subscribe to messages

##### Publish messages

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.Metadata;
import static java.util.Collections.singletonMap;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  client.publishEvent(PUBSUB_NAME, TOPIC_NAME, message, singletonMap(Metadata.TTL_IN_SECONDS, MESSAGE_TTL_IN_SECONDS)).block();
}
```

##### Subscribe to messages

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import io.dapr.Topic;
import io.dapr.client.domain.BulkSubscribeAppResponse;
import io.dapr.client.domain.BulkSubscribeAppResponseEntry;
import io.dapr.client.domain.BulkSubscribeAppResponseStatus;
import io.dapr.client.domain.BulkSubscribeMessage;
import io.dapr.client.domain.BulkSubscribeMessageEntry;
import io.dapr.client.domain.CloudEvent;
import io.dapr.springboot.annotations.BulkSubscribe;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class SubscriberController {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  @Topic(name = "testingtopic", pubsubName = "${myAppProperty:messagebus}")
  @PostMapping(path = "/testingtopic")
  public Mono<Void> handleMessage(@RequestBody(required = false) CloudEvent<?> cloudEvent) {
    return Mono.fromRunnable(() -> {
      try {
        System.out.println("Subscriber got: " + cloudEvent.getData());
        System.out.println("Subscriber got: " + OBJECT_MAPPER.writeValueAsString(cloudEvent));
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    });
  }

  @Topic(name = "testingtopic", pubsubName = "${myAppProperty:messagebus}",
          rule = @Rule(match = "event.type == 'myevent.v2'", priority = 1))
  @PostMapping(path = "/testingtopicV2")
  public Mono<Void> handleMessageV2(@RequestBody(required = false) CloudEvent envelope) {
    return Mono.fromRunnable(() -> {
      try {
        System.out.println("Subscriber got: " + cloudEvent.getData());
        System.out.println("Subscriber got: " + OBJECT_MAPPER.writeValueAsString(cloudEvent));
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    });
  }

  @BulkSubscribe()
  @Topic(name = "testingtopicbulk", pubsubName = "${myAppProperty:messagebus}")
  @PostMapping(path = "/testingtopicbulk")
  public Mono<BulkSubscribeAppResponse> handleBulkMessage(
          @RequestBody(required = false) BulkSubscribeMessage<CloudEvent<String>> bulkMessage) {
    return Mono.fromCallable(() -> {
      if (bulkMessage.getEntries().size() == 0) {
        return new BulkSubscribeAppResponse(new ArrayList<BulkSubscribeAppResponseEntry>());
      }

      System.out.println("Bulk Subscriber received " + bulkMessage.getEntries().size() + " messages.");

      List<BulkSubscribeAppResponseEntry> entries = new ArrayList<BulkSubscribeAppResponseEntry>();
      for (BulkSubscribeMessageEntry<?> entry : bulkMessage.getEntries()) {
        try {
          System.out.printf("Bulk Subscriber message has entry ID: %s\n", entry.getEntryId());
          CloudEvent<?> cloudEvent = (CloudEvent<?>) entry.getEvent();
          System.out.printf("Bulk Subscriber got: %s\n", cloudEvent.getData());
          entries.add(new BulkSubscribeAppResponseEntry(entry.getEntryId(), BulkSubscribeAppResponseStatus.SUCCESS));
        } catch (Exception e) {
          e.printStackTrace();
          entries.add(new BulkSubscribeAppResponseEntry(entry.getEntryId(), BulkSubscribeAppResponseStatus.RETRY));
        }
      }
      return new BulkSubscribeAppResponse(entries);
    });
  }
}
```

##### Bulk Publish Messages

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.BulkPublishResponse;
import io.dapr.client.domain.BulkPublishResponseFailedEntry;
import java.util.ArrayList;
import java.util.List;
class Solution {
  public void publishMessages() {
    try (DaprClient client = (new DaprClientBuilder()).build()) {
      // Create a list of messages to publish
      List<String> messages = new ArrayList<>();
      for (int i = 0; i < NUM_MESSAGES; i++) {
        String message = String.format("This is message #%d", i);
        messages.add(message);
        System.out.println("Going to publish message : " + message);
      }

      // Publish list of messages using the bulk publish API
      BulkPublishResponse<String> res = client.publishEvents(PUBSUB_NAME, TOPIC_NAME, "text/plain", messages).block()
    }
  }
}
```

- For a full guide on publishing messages and subscribing to a topic [How-To: Publish & subscribe]({{% ref howto-publish-subscribe.md %}}).
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/pubsub/http) for code samples and instructions to try out pub/sub

### Interact with output bindings

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  // sending a class with message; BINDING_OPERATION="create"
  client.invokeBinding(BINDING_NAME, BINDING_OPERATION, myClass).block();

  // sending a plain string
  client.invokeBinding(BINDING_NAME, BINDING_OPERATION, message).block();
}
```

- For a full guide on output bindings visit [How-To: Output bindings]({{% ref howto-bindings.md %}}).
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/bindings/http) for code samples and instructions to try out output bindings.

### Interact with input bindings

```java
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/")
public class myClass {
    private static final Logger log = LoggerFactory.getLogger(myClass);
        @PostMapping(path = "/checkout")
        public Mono<String> getCheckout(@RequestBody(required = false) byte[] body) {
            return Mono.fromRunnable(() ->
                    log.info("Received Message: " + new String(body)));
        }
}
```

- For a full guide on input bindings, visit [How-To: Input bindings]({{% ref howto-triggers %}}).
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/bindings/http) for code samples and instructions to try out input bindings.

### Retrieve secrets

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import java.util.Map;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  Map<String, String> secret = client.getSecret(SECRET_STORE_NAME, secretKey).block();
  System.out.println(JSON_SERIALIZER.writeValueAsString(secret));
}
```

- For a full guide on secrets visit [How-To: Retrieve secrets]({{% ref howto-secrets.md %}}).
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/secrets) for code samples and instructions to try out retrieving secrets

### Actors
An actor is an isolated, independent unit of compute and state with single-threaded execution. Dapr provides an actor implementation based on the [Virtual Actor pattern](https://www.microsoft.com/research/project/orleans-virtual-actors/), which provides a single-threaded programming model and where actors are garbage collected when not in use. With Dapr's implementaiton, you write your Dapr actors according to the Actor model, and Dapr leverages the scalability and reliability that the underlying platform provides. 

```java
import io.dapr.actors.ActorMethod;
import io.dapr.actors.ActorType;
import reactor.core.publisher.Mono;

@ActorType(name = "DemoActor")
public interface DemoActor {

  void registerReminder();

  @ActorMethod(name = "echo_message")
  String say(String something);

  void clock(String message);

  @ActorMethod(returns = Integer.class)
  Mono<Integer> incrementAndGet(int delta);
}
```

- For a full guide on actors visit [How-To: Use virtual actors in Dapr]({{% ref howto-actors.md %}}).
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/actors) for code samples and instructions to try actors

### Get & Subscribe to application configurations

> Note this is a preview API and thus will only be accessible via the DaprPreviewClient interface and not the normal DaprClient interface

```java
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.ConfigurationItem;
import io.dapr.client.domain.GetConfigurationRequest;
import io.dapr.client.domain.SubscribeConfigurationRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

try (DaprPreviewClient client = (new DaprClientBuilder()).buildPreviewClient()) {
  // Get configuration for a single key
  Mono<ConfigurationItem> item = client.getConfiguration(CONFIG_STORE_NAME, CONFIG_KEY).block();

  // Get configurations for multiple keys
  Mono<Map<String, ConfigurationItem>> items =
          client.getConfiguration(CONFIG_STORE_NAME, CONFIG_KEY_1, CONFIG_KEY_2);

  // Subscribe to configuration changes
  Flux<SubscribeConfigurationResponse> outFlux = client.subscribeConfiguration(CONFIG_STORE_NAME, CONFIG_KEY_1, CONFIG_KEY_2);
  outFlux.subscribe(configItems -> configItems.forEach(...));

  // Unsubscribe from configuration changes
  Mono<UnsubscribeConfigurationResponse> unsubscribe = client.unsubscribeConfiguration(SUBSCRIPTION_ID, CONFIG_STORE_NAME)
}
```

- For a full list of configuration operations visit [How-To: Manage configuration from a store]({{% ref howto-manage-configuration.md %}}).
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/configuration) for code samples and instructions to try out different configuration operations.

### Query saved state

> Note this is a preview API and thus will only be accessible via the DaprPreviewClient interface and not the normal DaprClient interface

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.QueryStateItem;
import io.dapr.client.domain.QueryStateRequest;
import io.dapr.client.domain.QueryStateResponse;
import io.dapr.client.domain.query.Query;
import io.dapr.client.domain.query.Sorting;
import io.dapr.client.domain.query.filters.EqFilter;

try (DaprClient client = builder.build(); DaprPreviewClient previewClient = builder.buildPreviewClient()) {
        String searchVal = args.length == 0 ? "searchValue" : args[0];
        
        // Create JSON data
        Listing first = new Listing();
        first.setPropertyType("apartment");
        first.setId("1000");
        ...
        Listing second = new Listing();
        second.setPropertyType("row-house");
        second.setId("1002");
        ...
        Listing third = new Listing();
        third.setPropertyType("apartment");
        third.setId("1003");
        ...
        Listing fourth = new Listing();
        fourth.setPropertyType("apartment");
        fourth.setId("1001");
        ...
        Map<String, String> meta = new HashMap<>();
        meta.put("contentType", "application/json");

        // Save state
        SaveStateRequest request = new SaveStateRequest(STATE_STORE_NAME).setStates(
          new State<>("1", first, null, meta, null),
          new State<>("2", second, null, meta, null),
          new State<>("3", third, null, meta, null),
          new State<>("4", fourth, null, meta, null)
        );
        client.saveBulkState(request).block();
        
        
        // Create query and query state request

        Query query = new Query()
          .setFilter(new EqFilter<>("propertyType", "apartment"))
          .setSort(Arrays.asList(new Sorting("id", Sorting.Order.DESC)));
        QueryStateRequest request = new QueryStateRequest(STATE_STORE_NAME)
          .setQuery(query);

        // Use preview client to call query state API
        QueryStateResponse<MyData> result = previewClient.queryState(request, MyData.class).block();
        
        // View Query state response 
        System.out.println("Found " + result.getResults().size() + " items.");
        for (QueryStateItem<Listing> item : result.getResults()) {
          System.out.println("Key: " + item.getKey());
          System.out.println("Data: " + item.getValue());
        }
}
```

- For a full how-to on query state, visit [How-To: Query state]({{% ref howto-state-query-api.md %}}).
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/querystate) for complete code sample.
### Distributed lock

```java
package io.dapr.examples.lock.grpc;

import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.LockRequest;
import io.dapr.client.domain.UnlockRequest;
import io.dapr.client.domain.UnlockResponseStatus;
import reactor.core.publisher.Mono;

public class DistributedLockGrpcClient {
  private static final String LOCK_STORE_NAME = "lockstore";

  /**
   * Executes various methods to check the different apis.
   *
   * @param args arguments
   * @throws Exception throws Exception
   */
  public static void main(String[] args) throws Exception {
    try (DaprPreviewClient client = (new DaprClientBuilder()).buildPreviewClient()) {
      System.out.println("Using preview client...");
      tryLock(client);
      unlock(client);
    }
  }

  /**
   * Trying to get lock.
   *
   * @param client DaprPreviewClient object
   */
  public static void tryLock(DaprPreviewClient client) {
    System.out.println("*******trying to get a free distributed lock********");
    try {
      LockRequest lockRequest = new LockRequest(LOCK_STORE_NAME, "resouce1", "owner1", 5);
      Mono<Boolean> result = client.tryLock(lockRequest);
      System.out.println("Lock result -> " + (Boolean.TRUE.equals(result.block()) ? "SUCCESS" : "FAIL"));
    } catch (Exception ex) {
      System.out.println(ex.getMessage());
    }
  }

  /**
   * Unlock a lock.
   *
   * @param client DaprPreviewClient object
   */
  public static void unlock(DaprPreviewClient client) {
    System.out.println("*******unlock a distributed lock********");
    try {
      UnlockRequest unlockRequest = new UnlockRequest(LOCK_STORE_NAME, "resouce1", "owner1");
      Mono<UnlockResponseStatus> result = client.unlock(unlockRequest);
      System.out.println("Unlock result ->" + result.block().name());
    } catch (Exception ex) {
      System.out.println(ex.getMessage());
    }
  }
}
```

- For a full how-to on distributed lock, visit [How-To: Use a Lock]({{% ref howto-use-distributed-lock.md %}})
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/lock) for complete code sample.

### Workflow

```java
package io.dapr.examples.workflows;

import io.dapr.workflows.client.DaprWorkflowClient;
import io.dapr.workflows.client.WorkflowState;

import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * For setup instructions, see the README.
 */
public class DemoWorkflowClient {

  /**
   * The main method.
   *
   * @param args Input arguments (unused).
   * @throws InterruptedException If program has been interrupted.
   */
  public static void main(String[] args) throws InterruptedException {
    DaprWorkflowClient client = new DaprWorkflowClient();

    try (client) {
      String separatorStr = "*******";
      System.out.println(separatorStr);
      String instanceId = client.scheduleNewWorkflow(DemoWorkflow.class, "input data");
      System.out.printf("Started new workflow instance with random ID: %s%n", instanceId);

      System.out.println(separatorStr);
      System.out.println("**GetWorkflowMetadata:Running Workflow**");
      WorkflowState workflowMetadata = client.getWorkflowState(instanceId, true);
      System.out.printf("Result: %s%n", workflowMetadata);

      System.out.println(separatorStr);
      System.out.println("**WaitForWorkflowStart**");
      try {
        WorkflowState waitForWorkflowStartResult =
            client.waitForWorkflowStart(instanceId, Duration.ofSeconds(60), true);
        System.out.printf("Result: %s%n", waitForWorkflowStartResult);
      } catch (TimeoutException ex) {
        System.out.printf("waitForWorkflowStart has an exception:%s%n", ex);
      }

      System.out.println(separatorStr);
      System.out.println("**SendExternalMessage**");
      client.raiseEvent(instanceId, "TestEvent", "TestEventPayload");

      System.out.println(separatorStr);
      System.out.println("** Registering parallel Events to be captured by allOf(t1,t2,t3) **");
      client.raiseEvent(instanceId, "event1", "TestEvent 1 Payload");
      client.raiseEvent(instanceId, "event2", "TestEvent 2 Payload");
      client.raiseEvent(instanceId, "event3", "TestEvent 3 Payload");
      System.out.printf("Events raised for workflow with instanceId: %s\n", instanceId);

      System.out.println(separatorStr);
      System.out.println("** Registering Event to be captured by anyOf(t1,t2,t3) **");
      client.raiseEvent(instanceId, "e2", "event 2 Payload");
      System.out.printf("Event raised for workflow with instanceId: %s\n", instanceId);


      System.out.println(separatorStr);
      System.out.println("**waitForWorkflowCompletion**");
      try {
        WorkflowState waitForWorkflowCompletionResult =
            client.waitForWorkflowCompletion(instanceId, Duration.ofSeconds(60), true);
        System.out.printf("Result: %s%n", waitForWorkflowCompletionResult);
      } catch (TimeoutException ex) {
        System.out.printf("waitForWorkflowCompletion has an exception:%s%n", ex);
      }

      System.out.println(separatorStr);
      System.out.println("**purgeWorkflow**");
      boolean purgeResult = client.purgeWorkflow(instanceId);
      System.out.printf("purgeResult: %s%n", purgeResult);

      System.out.println(separatorStr);
      System.out.println("**raiseEvent**");

      String eventInstanceId = client.scheduleNewWorkflow(DemoWorkflow.class);
      System.out.printf("Started new workflow instance with random ID: %s%n", eventInstanceId);
      client.raiseEvent(eventInstanceId, "TestException", null);
      System.out.printf("Event raised for workflow with instanceId: %s\n", eventInstanceId);

      System.out.println(separatorStr);
      String instanceToTerminateId = "terminateMe";
      client.scheduleNewWorkflow(DemoWorkflow.class, null, instanceToTerminateId);
      System.out.printf("Started new workflow instance with specified ID: %s%n", instanceToTerminateId);

      TimeUnit.SECONDS.sleep(5);
      System.out.println("Terminate this workflow instance manually before the timeout is reached");
      client.terminateWorkflow(instanceToTerminateId, null);
      System.out.println(separatorStr);

      String restartingInstanceId = "restarting";
      client.scheduleNewWorkflow(DemoWorkflow.class, null, restartingInstanceId);
      System.out.printf("Started new  workflow instance with ID: %s%n", restartingInstanceId);
      System.out.println("Sleeping 30 seconds to restart the workflow");
      TimeUnit.SECONDS.sleep(30);

      System.out.println("**SendExternalMessage: RestartEvent**");
      client.raiseEvent(restartingInstanceId, "RestartEvent", "RestartEventPayload");

      System.out.println("Sleeping 30 seconds to terminate the eternal workflow");
      TimeUnit.SECONDS.sleep(30);
      client.terminateWorkflow(restartingInstanceId, null);
    }

    System.out.println("Exiting DemoWorkflowClient.");
    System.exit(0);
  }
}
```

- For a full guide on workflows, visit:
   - [How-To: Author workflows]({{% ref howto-author-workflow.md %}}).
   - [How-To: Manage workflows]({{% ref howto-manage-workflow.md %}}).
- [Learn more about how to use workflows with the Java SDK]({{% ref java-workflow.md %}}).

## Sidecar APIs

#### Wait for sidecar
The `DaprClient` also provides a helper method to wait for the sidecar to become healthy (components only). When using
this method, be sure to specify a timeout in milliseconds and block() to wait for the result of a reactive operation.

```java
// Wait for the Dapr sidecar to report healthy before attempting to use Dapr components.
try (DaprClient client = new DaprClientBuilder().build()) {
  System.out.println("Waiting for Dapr sidecar ...");
  client.waitForSidecar(10000).block(); // Specify the timeout in milliseconds
  System.out.println("Dapr sidecar is ready.");
  ...
}

// Perform Dapr component operations here i.e. fetching secrets or saving state.
```

### Shutdown the sidecar
```java
try (DaprClient client = new DaprClientBuilder().build()) {
  logger.info("Sending shutdown request.");
  client.shutdown().block();
  logger.info("Ensuring dapr has stopped.");
  ...
}
```

Learn more about the [Dapr Java SDK packages available to add to your Java applications](https://dapr.github.io/java-sdk/).

## Security

### App API Token Authentication

The building blocks like pubsub, input bindings, or jobs require Dapr to make incoming calls to your application, you can secure these requests using [Dapr App API Token Authentication]({{% ref app-api-token.md %}}). This ensures that only Dapr can invoke your application's endpoints.

#### Understanding the two tokens

Dapr uses two different tokens for securing communication. See [Properties]({{% ref properties.md %}}) for detailed information about both tokens:

- **`DAPR_API_TOKEN`** (Your app → Dapr sidecar): Automatically handled by the Java SDK when using `DaprClient`
- **`APP_API_TOKEN`** (Dapr → Your app): Requires server-side validation in your application

The examples below show how to implement server-side validation for `APP_API_TOKEN`.

#### Implementing server-side token validation

When using gRPC protocol, implement a server interceptor to capture the metadata.

```java
import io.grpc.Context;
import io.grpc.Contexts;
import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.ServerInterceptor;

public class SubscriberGrpcService extends AppCallbackGrpc.AppCallbackImplBase {
  public static final Context.Key<Metadata> METADATA_KEY = Context.key("grpc-metadata");
  
  // gRPC interceptor to capture metadata
  public static class MetadataInterceptor implements ServerInterceptor {
    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
        ServerCall<ReqT, RespT> call,
        Metadata headers,
        ServerCallHandler<ReqT, RespT> next) {
      Context contextWithMetadata = Context.current().withValue(METADATA_KEY, headers);
      return Contexts.interceptCall(contextWithMetadata, call, headers, next);
    }
  }
  
  // Your service methods go here...
}
```

Register the interceptor when building your gRPC server:

```java
Server server = ServerBuilder.forPort(port)
    .intercept(new SubscriberGrpcService.MetadataInterceptor())
    .addService(new SubscriberGrpcService())
    .build();
server.start();
```

Then, in your service methods, extract the token from metadata:

```java
@Override
public void onTopicEvent(DaprAppCallbackProtos.TopicEventRequest request,
    StreamObserver<DaprAppCallbackProtos.TopicEventResponse> responseObserver) {
  try {
    // Extract metadata from context
    Context context = Context.current();
    Metadata metadata = METADATA_KEY.get(context);
    
    if (metadata != null) {
      String apiToken = metadata.get(
          Metadata.Key.of("dapr-api-token", Metadata.ASCII_STRING_MARSHALLER));
      
      // Validate token accordingly
    }
    
    // Process the request
    // ...
    
  } catch (Throwable e) {
    responseObserver.onError(e);
  }
}
```

#### Using with HTTP endpoints

For HTTP-based endpoints, extract the token from the headers:

```java
@RestController
public class SubscriberController {
  
  @PostMapping(path = "/endpoint")
  public Mono<Void> handleRequest(
      @RequestBody(required = false) byte[] body,
      @RequestHeader Map<String, String> headers) {
    return Mono.fromRunnable(() -> {
      try {
        // Extract the token from headers
        String apiToken = headers.get("dapr-api-token");
        
        // Validate token accordingly
        
        // Process the request
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    });
  }
}
```

#### Examples

For working examples with pubsub, bindings, and jobs:
- [PubSub with App API Token Authentication](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/pubsub#app-api-token-authentication-optional)
- [Bindings with App API Token Authentication](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/bindings/http#app-api-token-authentication-optional)
- [Jobs with App API Token Authentication](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/jobs#app-api-token-authentication-optional)

## Related links
- [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples)

For a full list of SDK properties and how to configure them, visit [Properties]({{% ref properties.md %}}).
