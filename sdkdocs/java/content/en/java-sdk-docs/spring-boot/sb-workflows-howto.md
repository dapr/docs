---
type: docs
title: "How to: Author and manage Dapr Workflow with Spring Boot"
linkTitle: "How to: Author and manage workflows with Spring Boot"
weight: 40000
description: How to get up and running with workflows using the Spring Boot integration
---


Following the same approach that we used for Spring Data and Spring Messaging, the [`dapr-spring-boot-starter`](_index.md) brings Dapr Workflow integration for Spring Boot users. 

With Dapr Workflows you define complex orchestrations (workflows) in Java code. The Dapr Spring Boot Starter makes your development easier by managing `Workflow`s and `WorkflowActivity`s as Spring Beans.

In order to enable the automatic bean discovery you annotate your `@SpringBootApplication` with the `@EnableDaprWorkflows` annotation: 

```
@SpringBootApplication
@EnableDaprWorkflows
public class MySpringBootApplication {
  ...
}
```

By adding this annotation, all the `Workflow`s and `WorkflowActivity`s beans are automatically discovered by Spring and registered to the workflow engine. 

## Creating Workflows and Activities

Inside your Spring Boot application you can define as many workflows as you want. You do that by creating new implementations of the `Workflow` interface. 

```
@Component
public class MyWorkflow implements Workflow {
    
    @Override
    public WorkflowStub create() {
      return ctx -> {
         <WORKFLOW LOGIC>
      };
    }

}
```

From inside your workflow definitions, you can perform service to service interactions, schedule timers or receive external events. 

By having all `WorkflowActivity`s as managed beans you can use the Spring `@Autowired` mechanism to inject any bean that the workflow activity might need to implement its functionality. For example the `@RestTemplate`:

```
@Component
public class MyWorkflowActivity implements WorkflowActivity {

  @Autowired
  private RestTemplate restTemplate;
```

## Creating and interacting with Workflows


To create and interact with Workflow instances you use the `DaprWorkflowClient` that you can also `@Autowired`. 

```
@Autowired
private DaprWorkflowClient daprWorkflowClient;
```

Applications can now schedule new workflow instances and raise events.

```
String instanceId = daprWorkflowClient.scheduleNewWorkflow(MyWorkflow.class, payload);
```

and

```
daprWorkflowClient.raiseEvent(instanceId, "MyEvenet", event);
```

[Check a full example here](https://github.com/dapr/java-sdk/blob/master/spring-boot-examples/workflows/patterns/src/main/java/io/dapr/springboot/examples/wfp/chain/ChainWorkflow.java)



## Next Steps & Resources

Check the blog post from [Baeldung covering Dapr Workflows and Dapr Pubsub](https://www.baeldung.com/dapr-workflows-pubsub) with a full working example.

Check the [Dapr Workflow documentation](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/) for more information about how to work with Dapr Workflows.