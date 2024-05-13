---
type: docs
title: "How to: Integrate using Diagrid's Testcontainers Dapr Module"
linkTitle: "Diagrid Testcontainers"
weight: 3000
description: "Use the Dapr Testcontainer module from your Java application"
---

You can use the Testcontainers Dapr Module provided by Diagrid to set up Dapr locally in your Java applications. Simply add the following dependency to your Mave project:

```xml
<dependency>
    <groupId>io.diagrid.dapr</groupId>
	<artifactId>testcontainers-dapr</artifactId>
	<version>0.10.x</version>
</dependency>
```

[If you're using Spring Boot, you can also use the Spring Boot Starter.](https://github.com/diagridio/spring-boot-starter-dapr)  

{{< button text="Use the Testcontainers Dapr Module" link="https://github.com/diagridio/testcontainers-dapr" >}}