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
    # - name: endpoint # Optional. 
    #   value: "http://localhost:4566"
    # - name: sessionToken  # Optional (mandatory if using AssignedRole, i.e. temporary accessKey and secretKey)
    #   value: "TOKEN"
    # - name: messageVisibilityTimeout # Optional
    #   value: 10
    # - name: messageRetryLimit # Optional
    #   value: 10
    # - name: messageReceiveLimit # Optional
    #   value: 10
    # - name: sqsDeadLettersQueueName # Optional
    # - value: "myapp-dlq"
    # - name: messageWaitTimeSeconds # Optional
    #   value: 1
    # - name: messageMaxNumber # Optional
    #   value: 10
    # - name: fifo # Optional
    #   value: "true"
    # - name: fifoMessageGroupID # Optional
    #   value: "app1-mgi"
    # - name: disableEntityManagement # Optional
    #   value: "false"
    # - name: disableDeleteOnRetryLimit # Optional
    #   value: "false"
    # - name: assetsManagementTimeoutSeconds # Optional
    #   value: 5



```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| accessKey          | Y  | ID of the AWS account/role with appropriate permissions to SNS and SQS (see below) | `"AKIAIOSFODNN7EXAMPLE"`
| secretKey          | Y  | Secret for the AWS user/role. If using an `AssumeRole` access, you will also need to provide a `sessionToken` |`"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"`
| region             | Y  | The AWS region where the SNS/SQS assets are located or be created in. See [this page](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/?p=ugi&l=na) for valid regions. Ensure that SNS and SQS are available in that region | `"us-east-1"`
| endpoint          | N  | AWS endpoint for the component to use. Only used for local development with, for example, [localstack](https://github.com/localstack/localstack). The `endpoint` is unncessary when running against production AWS | `"http://localhost:4566"`
| sessionToken      | N  | AWS session token to use.  A session token is only required if you are using temporary security credentials | `"TOKEN"`
| messageReceiveLimit | N  | Number of times a message is received, after processing of that message fails, that once reached, results in removing of that message from the queue. If `sqsDeadLettersQueueName` is specified, `messageReceiveLimit` is the number of times a message is received, after processing of that message fails, that once reached, results in moving of the message to the SQS dead-letters queue. Default: `10` | `10`
| sqsDeadLettersQueueName | N  | Name of the dead letters queue for this application | `"myapp-dlq"`
| messageVisibilityTimeout | N  | Amount of time in seconds that a message is hidden from receive requests after it is sent to a subscriber. Default: `10` | `10`
| messageRetryLimit        | N  | Number of times to resend a message after processing of that message fails before removing that message from the queue. Default: `10` | `10`
| messageWaitTimeSeconds   | N  | The duration (in seconds) for which the call waits for a message to arrive in the queue before returning. If a message is available, the call returns sooner than `messageWaitTimeSeconds`. If no messages are available and the wait time expires, the call returns successfully with an empty list of messages. Default: `1` | `1`
| messageMaxNumber         | N  | Maximum number of messages to receive from the queue at a time. Default: `10`, Maximum: `10` | `10`
| fifo | N  | Use SQS FIFO queue to provide message ordering and deduplication.  Default: `"false"`. See further details about [SQS FIFO](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html) | `"true"`, `"false"`
| fifoMessageGroupID | N | If `fifo` is enabled, instructs Dapr to use a custom [Message Group ID](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/using-messagegroupid-property.html) for the pubsub deployment. This is not mandatory as Dapr creates a custom Message Group ID for each producer, thus ensuring ordering of messages per a Dapr producer. Default: `""` | `"app1-mgi"`
| disableEntityManagement | N  | When set to true, SNS topics, SQS queues and the SQS subscriptions to SNS do not get created automatically. Default: `"false"` | `"true"`, `"false"`
| disableDeleteOnRetryLimit | N  | When set to true, after retrying and failing of `messageRetryLimit` times processing a message, reset the message visibility timeout so that other consumers can try processing, instead of deleting the message from SQS (the default behvior). Default: `"false"` | `"true"`, `"false"`
| assetsManagementTimeoutSeconds | N  | Amount of time in seconds, for an AWS asset management operation, before it times out and cancelled. Asset management operations are any operations performed on STS, SNS and SQS, except message publish and consume operations that implement the default Dapr component retry behavior. The value can be set to any non-negative float/integer. Default: `5` | `0.5`, `10`


* Dapr created SNS topic and SQS queue names conform with [AWS specifications](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/quotas-queues.html). By default, Dapr creates an SQS queue name based on the consumer `app-id`, therefore Dapr might perform name standardization to meet with AWS specifications.
* Using SQS FIFO (`fifo` metadata field set to `"true"`), per AWS specifications, provides message ordering and deduplication, but incurs a lower SQS processing throughput, among other caveats
* Be aware that specifying `fifoMessageGroupID` limits the number of concurrent consumers of the FIFO queue used to only one but guarantees global ordering of messages published by the app's Dapr sidecars. See [this](https://aws.amazon.com/blogs/compute/solving-complex-ordering-challenges-with-amazon-sqs-fifo-queues/) post to better understand the topic of Message Group IDs and FIFO queues.



## Create an SNS/SQS instance

{{< tabs "Self-Hosted" "Kubernetes" "AWS" >}}

{{% codetab %}}
For local development the [localstack project](https://github.com/localstack/localstack) is used to integrate AWS SNS/SQS. Follow the instructions [here](https://github.com/localstack/localstack#running) to run localstack.

To run localstack locally from the command line using Docker, apply the following cmd:
```shell
docker run --rm -it -p 4566:4566 -p 4571:4571 -e SERVICES="sts,sns,sqs" -e AWS_DEFAULT_REGION="us-east-1" localstack/localstack
```


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
    - name: accessKey
      value: "anyString"
    - name: secretKey
      value: "anyString"
    - name: endpoint
      value: http://localhost:4566
    # Use us-east-1 or any other region if provided to localstack as defined by "AWS_DEFAULT_REGION" envvar
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
In order to run in AWS, you should create or assign an IAM user with permissions to the SNS and SQS services having a Policy such as:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "YOUR_POLICY_NAME",
      "Effect": "Allow",
      "Action": [
        "sns:CreateTopic",
        "sns:GetTopicAttributes",
        "sns:ListSubscriptionsByTopic",
        "sns:Publish",
        "sns:Subscribe",
        "sns:TagResource",
        "sqs:ChangeMessageVisibility",
        "sqs:CreateQueue",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes",
        "sqs:GetQueueUrl",
        "sqs:ReceiveMessage",
        "sqs:SetQueueAttributes",
        "sqs:TagQueue"
      ],
      "Resource": [
        "arn:aws:sns:AWS_REGION:AWS_ACCOUNT_ID:*",
        "arn:aws:sqs:AWS_REGION:AWS_ACCOUNT_ID:*"
      ]
    }
  ]
}
```
Use the `AWS account ID` and `AWS account secret` and plug them into the `accessKey` and `secretKey` in the component metadata using Kubernetes secrets and `secretKeyRef`.


Alternatively, if you want to provision the SNS and SQS assets using your own tool of choice (e.g. Terraform), while preventing Dapr from doing so dynamically, you need to enable `disableEntityManagement` and assign your Dapr-using application with an IAM Role having a Policy such as:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "YOUR_POLICY_NAME",
      "Effect": "Allow",
      "Action": [
        "sqs:DeleteMessage",
        "sqs:ReceiveMessage",
        "sqs:ChangeMessageVisibility",
        "sqs:GetQueueUrl",
        "sqs:GetQueueAttributes",
        "sns:Publish",
        "sns:ListSubscriptionsByTopic",
        "sns:GetTopicAttributes"

      ],
      "Resource": [
        "arn:aws:sns:AWS_REGION:AWS_ACCOUNT_ID:APP_TOPIC_NAME",
        "arn:aws:sqs:AWS_REGION:AWS_ACCOUNT_ID:APP_ID"
      ]
    }
  ]
}
```

If you are running your applications on an EKS cluster with dynamic assets creation (the default Dapr behavior)
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
