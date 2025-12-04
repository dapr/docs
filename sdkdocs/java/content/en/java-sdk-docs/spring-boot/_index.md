---
type: docs
title: "Getting started with the Dapr and Spring Boot"
linkTitle: "Spring Boot Integration"
weight: 4000
description: How to get started with Dapr and Spring Boot  
---

By combining Dapr and Spring Boot, we can create infrastructure independent Java applications that can be deployed across different environments, supporting a wide range of on-premises and cloud provider services. 

First, we will start with a simple integration covering the `DaprClient` and the [Testcontainers](https://testcontainers.com/) integration, to then use Spring and Spring Boot mechanisms and programming model to leverage the Dapr APIs under the hood. This helps teams to remove dependencies such as clients and drivers required to connect to environment-specific infrastructure (databases, key-value stores, message brokers, configuration/secret stores, etc) 

{{% alert title="Note" color="primary" %}}
The Spring Boot integration requires Spring Boot 3.x+ to work. This will not work with Spring Boot 2.x.
The Spring Boot integration remains in alpha. We need your help and feedback to graduate it. 
Please join the [#java-sdk discord channel](https://discord.com/channels/778680217417809931/778749797242765342) discussion or open issues in the [dapr/java-sdk](https://github.com/dapr/java-sdk/issues).

{{% /alert %}}


## Adding the Dapr and Spring Boot integration to your project

If you already have a Spring Boot application, you can directly add the following dependencies to your project: 

```
	<dependency>
        <groupId>io.dapr.spring</groupId>
		<artifactId>dapr-spring-boot-starter</artifactId>
		<version>0.16.0</version>
	</dependency>
	<dependency>
		<groupId>io.dapr.spring</groupId>
		<artifactId>dapr-spring-boot-starter-test</artifactId>
		<version>0.16.0</version>
		<scope>test</scope>
	</dependency>
```

You can find the [latest released version here](https://central.sonatype.com/artifact/io.dapr.spring/dapr-spring-boot-starter). 

By adding these dependencies, you can: 
- Autowire a `DaprClient` to use inside your applications
- Use the Spring Data and Messaging abstractions and programming model that uses the Dapr APIs under the hood
- Improve your inner-development loop by relying on [Testcontainers](https://testcontainers.com/) to bootstrap Dapr Control plane services and default components

Once these dependencies are in your application, you can rely on Spring Boot autoconfiguration to autowire a `DaprClient` instance:

```java
@Autowired
private DaprClient daprClient;

```

This will connect to the default Dapr gRPC endpoint `localhost:50001`, requiring you to start Dapr outside of your application. 

{{% alert title="Note" color="primary" %}}
By default, the following properties are preconfigured for `DaprClient` and `DaprWorkflowClient`:
```properties
dapr.client.httpEndpoint=http://localhost
dapr.client.httpPort=3500
dapr.client.grpcEndpoint=localhost
dapr.client.grpcPort=50001
dapr.client.apiToken=<your remote api token>
```
These values are used by default, but you can override them in your `application.properties` file to suit your environment. Please note that both kebab case and camel case are supported.
{{% /alert %}}

You can use the `DaprClient` to interact with the Dapr APIs anywhere in your application, for example from inside a REST endpoint: 

```java 
@RestController
public class DemoRestController {
  @Autowired
  private DaprClient daprClient;

  @PostMapping("/store")
  public void storeOrder(@RequestBody Order order){
    daprClient.saveState("kvstore", order.orderId(), order).block();
  }
}

record Order(String orderId, Integer amount){}
```

If you want to avoid managing Dapr outside of your Spring Boot application, you can rely on [Testcontainers](https://testcontainers.com/) to bootstrap Dapr beside your application for development purposes. 
To do this we can create a test configuration that uses `Testcontainers` to bootstrap all we need to develop our applications using the Dapr APIs. 

Using [Testcontainers](https://testcontainers.com/) and Dapr integrations, we let the `@TestConfiguration` bootstrap Dapr for our applications. 
Notice that for this example, we are configuring Dapr with a Statestore component called `kvstore` that connects to an instance of `PostgreSQL` also bootstrapped by Testcontainers.

```java
@TestConfiguration(proxyBeanMethods = false)
public class DaprTestContainersConfig {
  @Bean
  @ServiceConnection
  public DaprContainer daprContainer(Network daprNetwork, PostgreSQLContainer<?> postgreSQLContainer){
    
    return new DaprContainer("daprio/daprd:1.16.0-rc.5")
            .withAppName("producer-app")
            .withNetwork(daprNetwork)
            .withComponent(new Component("kvstore", "state.postgresql", "v1", STATE_STORE_PROPERTIES))
            .withComponent(new Component("kvbinding", "bindings.postgresql", "v1", BINDING_PROPERTIES))
            .dependsOn(postgreSQLContainer);
  }
}
```

Inside the test classpath you can add a new Spring Boot Application that uses this configuration for tests: 

```java
@SpringBootApplication
public class TestProducerApplication {

  public static void main(String[] args) {

    SpringApplication
            .from(ProducerApplication::main)
            .with(DaprTestContainersConfig.class)
            .run(args);
  }
  
}
```

Now you can start your application with: 
```bash
mvn spring-boot:test-run
```

Running this command will start the application, using the provided test configuration that includes the Testcontainers and Dapr integration. In the logs you should be able to see that the `daprd` and the `placement` service containers were started for your application. 

Besides the previous configuration (`DaprTestContainersConfig`) your tests shouldn't be testing Dapr itself, just the REST endpoints that your application is exposing. 


## Leveraging Spring & Spring Boot programming model with Dapr

The Java SDK allows you to interface with all of the [Dapr building blocks]({{% ref building-blocks %}}). 
But if you want to leverage the Spring and Spring Boot programming model you can use the `dapr-spring-boot-starter` integration. 
This includes implementations of Spring Data (`KeyValueTemplate` and `CrudRepository`) as well as a `DaprMessagingTemplate` for producing and consuming messages 
(similar to [Spring Kafka](https://spring.io/projects/spring-kafka), [Spring Pulsar](https://spring.io/projects/spring-pulsar) and [Spring AMQP for RabbitMQ](https://spring.io/projects/spring-amqp)) and Dapr workflows. 

## Using Spring Data `CrudRepository` and `KeyValueTemplate`

You can use well known Spring Data constructs relying on a Dapr-based implementation. 
With Dapr, you don't need to add any infrastructure-related driver or client, making your Spring application lighter and decoupled from the environment where it is running. 

Under the hood these implementations use the Dapr Statestore and Binding APIs. 

### Configuration parameters

With Spring Data abstractions you can configure which statestore and bindings will be used by Dapr to connect to the available infrastructure. 
This can be done by setting the following properties:

```properties
dapr.statestore.name=kvstore
dapr.statestore.binding=kvbinding
```

Then you can `@Autowire` a `KeyValueTemplate` or a `CrudRepository` like this: 

```java
@RestController
@EnableDaprRepositories
public class OrdersRestController {
  @Autowired
  private OrderRepository repository;
  
  @PostMapping("/orders")
  public void storeOrder(@RequestBody Order order){
    repository.save(order);
  }

  @GetMapping("/orders")
  public Iterable<Order> getAll(){
    return repository.findAll();
  }


}
```

Where `OrderRepository` is defined in an interface that extends the Spring Data `CrudRepository` interface:

```java 
public interface OrderRepository extends CrudRepository<Order, String> {}
```

Notice that the `@EnableDaprRepositories` annotation does all the magic of wiring the Dapr APIs under the `CrudRespository` interface.
Because Dapr allow users to interact with different StateStores from the same application, as a user you need to provide the following beans as a Spring Boot `@Configuration`: 

```java
@Configuration
@EnableConfigurationProperties({DaprStateStoreProperties.class})
public class ProducerAppConfiguration {
  
  @Bean
  public KeyValueAdapterResolver keyValueAdapterResolver(DaprClient daprClient, ObjectMapper mapper, DaprStateStoreProperties daprStatestoreProperties) {
    String storeName = daprStatestoreProperties.getName();
    String bindingName = daprStatestoreProperties.getBinding();

    return new DaprKeyValueAdapterResolver(daprClient, mapper, storeName, bindingName);
  }

  @Bean
  public DaprKeyValueTemplate daprKeyValueTemplate(KeyValueAdapterResolver keyValueAdapterResolver) {
    return new DaprKeyValueTemplate(keyValueAdapterResolver);
  }
  
}
```

## Using Spring Messaging for producing and consuming events

Similar to Spring Kafka, Spring Pulsar and Spring AMQP you can use the `DaprMessagingTemplate` to publish messages to the configured infrastructure. To consume messages you can use the `@Topic` annotation (soon to be renamed to `@DaprListener`). 

To publish events/messages you can `@Autowired` the `DaprMessagingTemplate` in your Spring application. 
For this example we will be publishing `Order` events and we are sending messages to the topic named `topic`.

```java
@Autowired
private DaprMessagingTemplate<Order> messagingTemplate;

@PostMapping("/orders")
public void storeOrder(@RequestBody Order order){
  repository.save(order);
  messagingTemplate.send("topic", order);
}

```

Similarly to the `CrudRepository` we need to specify which PubSub broker do we want to use to publish and consume our messages.

```properties
dapr.pubsub.name=pubsub
```

Because with Dapr you can connect to multiple PubSub brokers you need to provide the following bean to let Dapr know which PubSub broker your `DaprMessagingTemplate` will use: 
```java
@Bean
public DaprMessagingTemplate<Order> messagingTemplate(DaprClient daprClient,
                                                             DaprPubSubProperties daprPubSubProperties) {
  return new DaprMessagingTemplate<>(daprClient, daprPubSubProperties.getName());
}
```

Finally, because Dapr PubSub requires a bidirectional connection between your application and Dapr you need to expand your Testcontainers configuration with a few parameters: 

```java
@Bean
@ServiceConnection
public DaprContainer daprContainer(Network daprNetwork, PostgreSQLContainer<?> postgreSQLContainer, RabbitMQContainer rabbitMQContainer){
    
    return new DaprContainer("daprio/daprd:1.16.0-rc.5")
            .withAppName("producer-app")
            .withNetwork(daprNetwork)
            .withComponent(new Component("kvstore", "state.postgresql", "v1", STATE_STORE_PROPERTIES))
            .withComponent(new Component("kvbinding", "bindings.postgresql", "v1", BINDING_PROPERTIES))
            .withComponent(new Component("pubsub", "pubsub.rabbitmq", "v1", rabbitMqProperties))
            .withAppPort(8080)
            .withAppChannelAddress("host.testcontainers.internal")
            .dependsOn(rabbitMQContainer)
            .dependsOn(postgreSQLContainer);
}
```

Now, in the Dapr configuration we have included a `pubsub` component that will connect to an instance of RabbitMQ started by Testcontainers. 
We have also set two important parameters `.withAppPort(8080)` and `.withAppChannelAddress("host.testcontainers.internal")` which allows Dapr to 
contact back to the application when a message is published in the broker.

To listen to events/messages you need to expose an endpoint in the application that will be responsible to receive the messages. 
If you expose a REST endpoint you can use the `@Topic` annotation to let Dapr know where it needs to forward the events/messages too: 

```java
@PostMapping("subscribe")
@Topic(pubsubName = "pubsub", name = "topic")
public void subscribe(@RequestBody CloudEvent<Order> cloudEvent){
    events.add(cloudEvent);
}
```

Upon bootstrapping your application, Dapr will register the subscription to messages to be forwarded to the `subscribe` endpoint exposed by your application. 

If you are writing tests for these subscribers you need to ensure that Testcontainers knows that your application will be running on port 8080, 
so containers started with Testcontainers know where your application is: 

```java
@BeforeAll
public static void setup(){
  org.testcontainers.Testcontainers.exposeHostPorts(8080);
}
```

You can check and run the [full example source code here](https://github.com/salaboy/dapr-spring-boot-docs-examples).

## Using Dapr Workflows with Spring Boot

Following the same approach that we used for Spring Data and Spring Messaging, the `dapr-spring-boot-starter` brings Dapr Workflow integration for Spring Boot users. 

To work with Dapr Workflows you need to define and implement your workflows using code. The Dapr Spring Boot Starter makes your life easier by managing `Workflow`s and `WorkflowActivity`s as Spring beans.

In order to enable the automatic bean discovery you can annotate your `@SpringBootApplication` with the `@EnableDaprWorkflows` annotation: 

```
@SpringBootApplication
@EnableDaprWorkflows
public class MySpringBootApplication {}
```

By adding this annotation, all the `WorkflowActivity`s will be automatically managed by Spring and registered to the workflow engine. 

By having all `WorkflowActivity`s as managed beans we can use Spring `@Autowired` mechanism to inject any bean that our workflow activity might need to implement its functionality, for example the `@RestTemplate`:

```
public class MyWorkflowActivity implements WorkflowActivity {

  @Autowired
  private RestTemplate restTemplate;
```

You can also `@Autowired` the `DaprWorkflowClient` to create new instances of your workflows. 

```
@Autowired
private DaprWorkflowClient daprWorkflowClient;
```

This enable applications to schedule new workflow instances and raise events.

```
String instanceId = daprWorkflowClient.scheduleNewWorkflow(MyWorkflow.class, payload);
```

and

```
daprWorkflowClient.raiseEvent(instanceId, "MyEvenet", event);
```

Check the [Dapr Workflow documentation](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/) for more information about how to work with Dapr Workflows.


## Next steps

Learn more about the [Dapr Java SDK packages available to add to your Java applications](https://dapr.github.io/java-sdk/).

## Related links
- [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples)
