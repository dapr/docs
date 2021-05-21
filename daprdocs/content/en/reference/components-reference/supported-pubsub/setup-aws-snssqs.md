---
type: docs
title: "AWS SNS/SQS"
linkTitle: "AWS SNS/SQS"
description: "Detailed documentation on the AWS SNS/SQS pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-aws-snssqs/"
---

## Component format
To setup AWS SNS/SQS for pub/sub, you create a component of type `pubsub.snssqs`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: snssqs-pubsub
  namespace: default
spec:
  type: pubsub.snssqs
  version: v1
  metadata:
    - name: accessKey
      value: "AKIAIOSFODNN7EXAMPLE"
    - name: secretKey
      value: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    - name: region
      value: "us-east-1"
    - name: sessionToken
      value: "TOKEN"
    - name: messageVisibilityTimeout
      value: 10
    - name: messageRetryLimit
      value: 10
    - name: messageWaitTimeSeconds
      value: 1
    - name: messageMaxNumber
      value: 10
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| accessKey          | Y  | ID of the AWS account with appropriate permissions to SNS and SQS. Can be `secretKeyRef` to use a secret reference  | `"AKIAIOSFODNN7EXAMPLE"`
| secretKey          | Y  | Secret for the AWS user. Can be `secretKeyRef` to use a secret reference   |`"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"`
| region             | Y  | The AWS region to the instance. See this page for valid regions: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html. Ensure that SNS and SQS are available in that region.| `"us-east-1"`
| endpoint          | N  |AWS endpoint for the component to use. Only used for local development. The `endpoint` is unncessary when running against production AWS   | `"http://localhost:4566"`
| sessionToken      | N  |AWS session token to use.  A session token is only required if you are using temporary security credentials | `"TOKEN"`
| messageVisibilityTimeout | N  |Amount of time in seconds that a message is hidden from receive requests after it is sent to a subscriber. Default: `10`   | `10`
| messageRetryLimit        | N  |Number of times to resend a message after processing of that message fails before removing that message from the queue. Default: `10`   | `10`
| messageWaitTimeSeconds   | N  |amount of time to await receipt of a message before making another request. Default: `1`   | `1`
| messageMaxNumber         | N  |maximum number of messages to receive from the queue at a time. Default: `10`, Maximum: `10`   | `10`

## Create an SNS/SQS instance

{{< tabs "Self-Hosted" "Kubernetes" "AWS" >}}

{{% codetab %}}
For local development the [localstack project](https://github.com/localstack/localstack) is used to integrate AWS SNS/SQS. Follow the instructions [here](https://github.com/localstack/localstack#installing) to install the localstack CLI.

In order to use localstack with your pubsub binding, you need to provide the `endpoint` configuration
in the component metadata. The `endpoint` is unncessary when running against production AWS.

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: snssqs-pubsub
spec:
  type: pubsub.snssqs
  version: v1
  metadata:
    - name: endpoint
      value: http://localhost:4566
    # Use us-east-1 for localstack
    - name: region
      value: us-east-1
```
{{% /codetab %}}

{{% codetab %}}
To run localstack on Kubernetes, you can apply the configuration below. Localstack is then
reachable at the DNS name `http://localstack.default.svc.cluster.local:4566`
(assuming this was applied to the default namespace) and this should be used as the `endpoint`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: localstack
  namespace: default
spec:
  # using the selector, we will expose the running deployments
  # this is how Kubernetes knows, that a given service belongs to a deployment
  selector:
    matchLabels:
      app: localstack
  replicas: 1
  template:
    metadata:
      labels:
        app: localstack
    spec:
      containers:
      - name: localstack
        image: localstack/localstack:latest
        ports:
          # Expose the edge endpoint
          - containerPort: 4566
---
kind: Service
apiVersion: v1
metadata:
  name: localstack
  labels:
    app: localstack
spec:
  selector:
    app: localstack
  ports:
  - protocol: TCP
    port: 4566
    targetPort: 4566
  type: LoadBalancer

```
{{% /codetab %}}

{{% codetab %}}
In order to run in AWS, you should create an IAM user with permissions to the SNS and SQS services.
Use the `AWS account ID` and `AWS account secret` and plug them into the `accessKey` and `secretKey` in the component metadata using Kubernetes secrets and `secretKeyRef`.
{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Pub/Sub building block]({{< ref pubsub >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [AWS SQS as subscriber to SNS](https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html)
- [AWS SNS API reference](https://docs.aws.amazon.com/sns/latest/api/Welcome.html)
- [AWS SQS API reference](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/Welcome.html)
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
