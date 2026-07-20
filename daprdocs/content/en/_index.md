---
type: docs
no_list: true
---
# Dapr Docs

## The durable execution engine for workflows and AI agents

Dapr provides durable, verifiable execution so your workflows and AI agents survive failure and keep running to completion. Its durable execution workflow engine guarantees every step runs to completion despite crashes, restarts, and network outages, recovering state from exactly where it left off. Each workflow's execution history is [cryptographically signed and verifiable]({{% ref workflow-history-signing.md %}}), making what ran tamper-evident and auditable. The same engine powers durable AI agents that reason, call tools, and recover from any point of failure without losing progress. As a CNCF distributed application runtime, Dapr's infrastructure-agnostic APIs give you portability across clouds and environments, with the security, resiliency, and observability required for production systems.

{{< button text="Get started" page="getting-started.md" >}}

### Use Cases

<div class="d-card-grid">
  <a class="d-card c-blue" href="{{% ref workflow-overview %}}"><span class="d-card-head"><img class="d-card-icon" src="/images/homepage/workflow.svg" alt="" width="40" height="40"><span class="d-card-title">Durable Workflows</span></span><span class="d-card-desc">Orchestrate durable, verifiable workflows that always run to completion.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-sky" href="{{% ref "../developing-ai" %}}"><span class="d-card-head"><img class="d-card-icon" src="/images/homepage/dapr-agents.svg" alt="" width="40" height="40"><span class="d-card-title">Durable AI Agents</span></span><span class="d-card-desc">Build durable AI agents that recover from any failure.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-blue" href="{{% ref service-invocation-overview %}}"><span class="d-card-head"><img class="d-card-icon" src="/images/homepage/service-invocation.svg" alt="" width="40" height="40"><span class="d-card-title">Microservices</span></span><span class="d-card-desc">Build resilient microservices using the Dapr service invocation API.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-sky" href="{{% ref pubsub-overview %}}"><span class="d-card-head"><img class="d-card-icon" src="/images/homepage/pub-sub.svg" alt="" width="40" height="40"><span class="d-card-title">Event Driven Architecture</span></span><span class="d-card-desc">Create event-driven applications with the Dapr pub/sub API.</span><span class="d-card-more">Learn more →</span></a>
</div>

### Languages

<div class="d-card-grid cols-3">
  <a class="d-card c-blue" href="{{% ref dotnet %}}"><span class="d-card-head"><img class="d-card-icon" src="/images/homepage/dotnet.png" alt="" width="40" height="40"><span class="d-card-title">.NET</span></span><span class="d-card-desc">Learn more about the .NET SDK.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-sky" href="{{% ref python %}}"><span class="d-card-head"><img class="d-card-icon" src="/images/homepage/python.png" alt="" width="40" height="40"><span class="d-card-title">Python</span></span><span class="d-card-desc">Learn more about the Python SDK.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-blue" href="{{% ref js %}}"><span class="d-card-head"><img class="d-card-icon" src="/images/homepage/javascript.png" alt="" width="40" height="40"><span class="d-card-title">JavaScript</span></span><span class="d-card-desc">Learn more about the JavaScript SDK.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-sky" href="{{% ref java %}}"><span class="d-card-head"><img class="d-card-icon" src="/images/homepage/javalang.png" alt="" width="40" height="40"><span class="d-card-title">Java</span></span><span class="d-card-desc">Learn more about the Java SDK.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-blue" href="{{% ref go %}}"><span class="d-card-head"><img class="d-card-icon" src="/images/homepage/golang.svg" alt="" width="40" height="40"><span class="d-card-title">Go</span></span><span class="d-card-desc">Learn more about the Go SDK.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-sky" href="{{% ref php %}}"><span class="d-card-head"><img class="d-card-icon" src="/images/homepage/php.png" alt="" width="40" height="40"><span class="d-card-title">PHP</span></span><span class="d-card-desc">Learn more about the PHP SDK.</span><span class="d-card-more">Learn more →</span></a>
</div>

### Start developing with Dapr

<div class="d-card-grid cols-3">
  <a class="d-card c-blue" href="{{% ref getting-started %}}"><span class="d-card-title">Getting started</span><span class="d-card-desc">How to get up and running with Dapr in your environment in minutes.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-sky" href="{{% ref quickstarts %}}"><span class="d-card-title">Quickstarts</span><span class="d-card-desc">A collection of tutorials with code samples to get you started quickly with Dapr.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-blue" href="{{% ref concepts %}}"><span class="d-card-title">Concepts</span><span class="d-card-desc">Learn about Dapr, including its main features and capabilities.</span><span class="d-card-more">Learn more →</span></a>
</div>

### Learn more about Dapr

<div class="d-card-grid cols-3">
  <a class="d-card c-blue" href="{{% ref developing-applications %}}"><span class="d-card-title">Developing applications</span><span class="d-card-desc">Tools, tips, and information on how to build your application with Dapr.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-sky" href="{{% ref building-blocks-concept %}}"><span class="d-card-title">Building blocks</span><span class="d-card-desc">Capabilities that solve common development challenges for distributed applications.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-blue" href="{{% ref operations %}}"><span class="d-card-title">Operations</span><span class="d-card-desc">Hosting options, best-practices, and other guides and running your application on Dapr.</span><span class="d-card-more">Learn more →</span></a>
</div>

### Additional info

<div class="d-card-grid cols-3">
  <a class="d-card c-blue" href="{{% ref reference %}}"><span class="d-card-title">Reference</span><span class="d-card-desc">Detailed documentation on the Dapr API, CLI, bindings and more.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-sky" href="{{% ref contributing %}}"><span class="d-card-title">Contributing</span><span class="d-card-desc">How to contribute to the Dapr project and the various repositories.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-blue" href="{{% ref roadmap.md %}}"><span class="d-card-title">Roadmap</span><span class="d-card-desc">Learn about Dapr's roadmap and change process.</span><span class="d-card-more">Learn more →</span></a>
</div>

### Tooling and resources

<div class="d-card-grid cols-3">
  <a class="d-card c-blue" href="{{% ref ides %}}"><span class="d-card-head"><img class="d-card-icon" src="/images/homepage/vscode.svg" alt="" width="40" height="40"><span class="d-card-title">IDE Integrations</span></span><span class="d-card-desc">Learn how to get up and running with Dapr in your preferred integrated development environment.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-sky" href="{{% ref sdks %}}"><span class="d-card-head"><img class="d-card-icon" src="/images/homepage/code.svg" alt="" width="40" height="40"><span class="d-card-title">Language SDKs</span></span><span class="d-card-desc">Create Dapr applications in your preferred language using the Dapr SDKs.</span><span class="d-card-more">Learn more →</span></a>
  <a class="d-card c-blue" href="https://www.diagrid.io/dapr-university"><span class="d-card-head"><img class="d-card-icon" src="/images/homepage/dark-blue-dapr.svg" alt="" width="40" height="40"><span class="d-card-title">Dapr University</span></span><span class="d-card-desc">Learn Dapr through a series of free hands-on courses in a cloud-based sandbox environment.</span><span class="d-card-more">Learn more →</span></a>
</div>
