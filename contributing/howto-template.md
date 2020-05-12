# [Title] 

>Title should be descriptive of what this article helps achieve. Imagine it continues a sentence that starts with ***How to...*** so should start with a word such as "Setup", "Configure", "Implement" etc.
>
>Does not need to include the word *Dapr* in it (as it is in the context of the Dapr docs repo)
>
>If it is specific to an environment (e.g. Kubernetes), should call out the environment.
>
>Capital letters only for first word and product/technology names.
>
>Example:
># Set up Zipkin for distributed tracing in Kubernetes

[Intro paragraph]

> Intro paragraph should be a short description of what this article covers to set expectations of the reader. Include links if they can provide context and clarity to the reader.
>
> Example:
>
> This article will provide guidance on how to enable Dapr distributed tracing capabilities on Kubernetes using [Zipkin](https://zipkin.io/) as a tracing broker. 

## Pre-requisites

>List the required setup this article assumes with links on how to achieve each prerequisite.
>
>Example:
>
> - [Setup Dapr on a Kubernetes cluster](https://github.com/dapr/docs/blob/master/getting-started/environment-setup.md#installing-dapr-on-a-kubernetes-cluster)
> - [Install Helm](https://helm.sh/docs/intro/install/)
> - [Install Python](https://www.python.org/downloads/) version >= 3.7

## [Step header] - (multiple)

>
>Name each step section in a clear descriptive way which allows readers to understand what this section covers. Example: **Create a configuration file**
>
>If using terminal commands, make sure to allow easy copy/paste by having each terminal command in a separate line with the markdown (indented as needed when appearing in bullets or numbered lists). If Windows/Linux/MacOS instructions differ, make sure to include instructions for each.
>
>Example (note the indentation of the commands):
>
>- Clone the Dapr samples repository:
>   ```bash
>   git clone https://github.com/dapr/samples.git
>   ```
>- Go to the hello world sample:
>   ```
>   cd 1.hello-world
>   ```
> 
>Add sections as needed for multiple steps.
>

## Cleanup

>
> If possible, provide steps that undo the steps above. These should bring the user environment back to the pre-requisites stage. If using terminal commands, make sure to allow easy copy/paste by having each terminal command in a separate line with the markdown (indented as needed when appearing in bullets or numbered lists). If Windows/Linux/MacOS instructions differ, make sure to include instructions for each.
>
>Example:
>
>1. Delete the deployments from the cluster
>       ```
>       kubectl delete -f file.yaml
>       ```
>2. Delete the Helm chart from the cluster
>       ```
>       helm del --purge dapr-kafka
>       ```
>

## Related links

>
> Reference other documentation that may be relevant to a user interested in this How To. Include any of the following:
>
>- Other **How To** articles in related topics or alternative technology integrations.
>- **Concept** articles that are relevant.
>- **Reference** and **API** documentation that can be helpful
>- **Samples** that provide code reference relevant to this guidance.
>- Any other documentation link that may be a logical next step for a reader interested in this guidance (for example, if this is a how to on publishing to a pub/sub topic, a logical next step would be a how to which describes consuming from a topic).
>


