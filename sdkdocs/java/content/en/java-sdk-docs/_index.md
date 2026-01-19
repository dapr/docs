---
type: docs
title: "Dapr Java SDK"
linkTitle: "Java"
weight: 1000
description: Java SDK packages for developing Dapr applications
cascade:
  github_repo: https://github.com/dapr/java-sdk
  github_subdir: daprdocs/content/en/java-sdk-docs
  path_base_for_github_subdir: content/en/developing-applications/sdks/java/
  github_branch: master
---

Dapr offers a variety of packages to help with the development of Java applications. Using them you can create Java clients, servers, and virtual actors with Dapr.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}}) installed
- Initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- JDK 11 or above - the published jars are compatible with Java 8:
    - [AdoptOpenJDK 11 - LTS](https://adoptopenjdk.net/)
    - [Oracle's JDK 15](https://www.oracle.com/java/technologies/javase-downloads.html)
    - [Oracle's JDK 11 - LTS](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)
    - [OpenJDK](https://openjdk.java.net/)
- Install one of the following build tools for Java:
    - [Maven 3.x](https://maven.apache.org/install.html)
    - [Gradle 6.x](https://gradle.org/install/)

## Import Dapr's Java SDK

Next, import the Java SDK packages to get started. Select your preferred build tool to learn how to import.

{{< tabpane text=true >}}

{{% tab header="Maven" %}}
<!--Maven-->

For a Maven project, add the following to your `pom.xml` file: 

```xml
<project>
  ...
  <dependencies>
    ...
    <!-- Dapr's core SDK with all features, except Actors. -->
    <dependency>
      <groupId>io.dapr</groupId>
      <artifactId>dapr-sdk</artifactId>
      <version>1.16.0</version>
    </dependency>
    <!-- Dapr's SDK for Actors (optional). -->
    <dependency>
      <groupId>io.dapr</groupId>
      <artifactId>dapr-sdk-actors</artifactId>
      <version>1.16.0</version>
    </dependency>
    <!-- Dapr's SDK integration with SpringBoot (optional). -->
    <dependency>
      <groupId>io.dapr</groupId>
      <artifactId>dapr-sdk-springboot</artifactId>
      <version>1.16.0</version>
    </dependency>
    ...
  </dependencies>
  ...
</project>
```
{{% /tab %}}

{{% tab header="Gradle" %}}
<!--Gradle-->

For a Gradle project, add the following to your `build.gradle` file:

```java
dependencies {
...
    // Dapr's core SDK with all features, except Actors.
    compile('io.dapr:dapr-sdk:1.16.0')
    // Dapr's SDK for Actors (optional).
    compile('io.dapr:dapr-sdk-actors:1.16.0')
    // Dapr's SDK integration with SpringBoot (optional).
    compile('io.dapr:dapr-sdk-springboot:1.16.0')
}
```

{{% /tab %}}

{{< /tabpane >}}

If you are also using Spring Boot, you may run into a common issue where the `OkHttp` version that the Dapr SDK uses conflicts with the one specified in the Spring Boot _Bill of Materials_.

You can fix this by specifying a compatible `OkHttp` version in your project to match the version that the Dapr SDK uses:

```xml
<dependency>
  <groupId>com.squareup.okhttp3</groupId>
  <artifactId>okhttp</artifactId>
  <version>1.16.0</version>
</dependency>
```

## Try it out

Put the Dapr Java SDK to the test. Walk through the Java quickstarts and tutorials to see Dapr in action:

| SDK samples | Description |
| ----------- | ----------- |
| [Quickstarts]({{% ref quickstarts %}}) | Experience Dapr's API building blocks in just a few minutes using the Java SDK. |
| [SDK samples](https://github.com/dapr/java-sdk/tree/master/examples) | Clone the SDK repo to try out some examples and get started. |

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

## Available packages

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Client</b></h5>
      <p class="card-text">Create Java clients that interact with a Dapr sidecar and other Dapr applications.</p>
      <a href="{{% ref java-client %}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Workflow</b></h5>
      <p class="card-text">Create and manage workflows that work with other Dapr APIs in Java.</p>
      <a href="{{% ref workflow %}}" class="stretched-link"></a>
    </div>
  </div>
</div>
