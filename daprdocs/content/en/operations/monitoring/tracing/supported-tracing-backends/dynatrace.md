---
type: docs
title: "How-To: Set up Dynatrace OneAgent for distributed tracing"
linkTitle: "Dynatrace"
weight: 1000
description: "Set up Dynatrace OneAgent for distributed tracing and deep code-level insights in Kubernetes"
---

[Dynatrace](https://www.dynatrace.com) OneAgent is responsible for collecting all telemetry within your monitored environment. 

It automatically instruments your applications built with Dapr without the need for further configuration. 

![Distributed Trace](/images/dt-waterfall.png)

![Codelevel-Trace](/images/dt-ppath.png)

## Installation

OneAgent is container-aware and comes with built-in support for out-of-the-box monitoring of Kubernetes. The following instrunctions describe how to monitor your Dapr enabled applications when deployed to Kubernetes.

### Prerequisites

- A Dynatrace account. If you don't have an account, sign-up for a [free trial](https://www.dynatrace.com/trial/)

- Generate an [API token](https://www.dynatrace.com/support/help/dynatrace-api/basics/dynatrace-api-authentication/) and a [PaaS token](https://www.dynatrace.com/support/help/shortlink/token#paas-token-) in your Dynatrace environment.Make sure to assign permissions to access problem and event feed, metrics, and topology for your API token.

### Install OneAgent operator using kubectl

Create the necessary objects for OneAgent operator. 

```bash
$ kubectl create namespace dynatrace
$ kubectl apply -f https://github.com/Dynatrace/dynatrace-oneagent-operator/releases/latest/download/kubernetes.yaml
$ kubectl -n dynatrace logs -f deployment/dynatrace-oneagent-operator
```
&nbsp;

Create a secret holding API- and PaaS-Token for authentication to the Dynatrace cluster.  

Replace `API_TOKEN` and `PAAS_TOKEN` in the following snippet with the values explained in the prerequisites.

```bash
$ kubectl -n dynatrace create secret generic oneagent --from-literal="apiToken=API_TOKEN" --from-literal="paasToken=PAAS_TOKEN"
```
&nbsp;

The rollout of Dynatrace OneAgent is governed by a custom resource. Retrieve the `cr.yaml` file from the GitHub repository.

```bash
$ curl -o cr.yaml https://raw.githubusercontent.com/Dynatrace/dynatrace-oneagent-operator/master/deploy/cr.yaml
```
&nbsp;

Adapt the API endpoint within the custom resource

| **Parameter** | **Description** 
| ------------- | ---------------  | 
| `apiUrl`| <ul><li> For Dynatrace SaaS, where OneAgent can connect to the internet, replace the Dynatrace `ENVIRONMENTID` in `https://ENVIRONMENTID.live.dynatrace.com/api`.</li><br/><li> For environment ActiveGates (SaaS or Managed), use the following to download the OneAgent, as well as to communicate OneAgent traffic through the ActiveGate: `https://YourActiveGateIP` or `FQDN:9999/e/<ENVIRONMENTID>/api`. </li></ul> |
&nbsp;

Finally create the custom resource, to roll out the OneAgent operator.

```bash
$ kubectl apply -f cr.yaml
```

&nbsp;

For advanced configurations and  different deployment mechanis, visit [Dynatrace help](https://www.dynatrace.com/support/help/technology-support/cloud-platforms/kubernetes/deploy-oneagent-k8/)


## Intelligent Observability
Dynatrace captures and unifies the dependencies between all observability data in order to intelligently combine metrics, logs, traces and user experience data. 

![Smartscape](/images/dt-smartscape.png)

This real-time entity topology map is the basis for intelligent observability to provide automatic root-cause analysis and advanced troubleshooting for your Dapr applications.

![Dapr Calculator Service](/images/dt-dapr-calculator.png)


## References
* [How-To: Setup Dynatrace to capture Dapr metrics ]({{< ref dynatrace-metrics.md >}})
