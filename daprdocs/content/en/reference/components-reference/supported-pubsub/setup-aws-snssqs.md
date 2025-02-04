---
type: docs
title: "AWS SNS/SQS"
linkTitle: "AWS SNS/SQS"
description: "Detailed documentation on the AWS SNS/SQS pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-aws-snssqs/"
---

## Component format

To set up AWS SNS/SQS pub/sub, create a component of type `pubsub.aws.snssqs`.

By default, the AWS SNS/SQS component:

- Generates the SNS topics
- Provisions the SQS queues
- Configures a subscription of the queues to the topics

{{% alert title="Note" color="primary" %}}
If you only have a publisher and no subscriber, only the SNS topics are created.

However, if you have a subscriber, SNS, SQS, and the dynamic or static subscription thereof are generated.
{{% /alert %}}

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: snssqs-pubsub
spec:
  type: pubsub.aws.snssqs
  version: v1
  metadata:
    - name: accessKey
      value: "AKIAIOSFODNN7EXAMPLE"
    - name: secretKey
      value: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    - name: region
      value: "us-east-1"
    # - name: consumerID # Optional. If not supplied, runtime will create one.
    #   value: "channel1"
    # - name: endpoint # Optional. 
    #   value: "http://localhost:4566"
    # - name: sessionToken  # Optional (mandatory if using AssignedRole; for example, temporary accessKey and secretKey)
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
    # - name: concurrencyMode # Optional
    #   value: "single"
    # - name: concurrencyLimit # Optional
    #   value: "0"

```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use [a secret store for the secrets]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| accessKey          | Y  | ID of the AWS account/role with appropriate permissions to SNS and SQS (see below) | `"AKIAIOSFODNN7EXAMPLE"`
| secretKey          | Y  | Secret for the AWS user/role. If using an `AssumeRole` access, you will also need to provide a `sessionToken` |`"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"`
| region             | Y  | The AWS region where the SNS/SQS assets are located or be created in. See [this page](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/?p=ugi&l=na) for valid regions. Ensure that SNS and SQS are available in that region | `"us-east-1"`
| consumerID       | N | Consumer ID (consumer tag) organizes one or more consumers into a group. Consumers with the same consumer ID work as one virtual consumer; for example, a message is processed only once by one of the consumers in the group. If the `consumerID` is not provided, the Dapr runtime set it to the Dapr application ID (`appID`) value. See the [pub/sub broker component file]({{< ref setup-pubsub.md >}}) to learn how ConsumerID is automatically generated. | Can be set to string value (such as `"channel1"` in the example above) or string format value (such as `"{podName}"`, etc.). [See all of template tags you can use in your component metadata.]({{< ref "component-schema.md#templated-metadata-values" >}})
| endpoint          | N  | AWS endpoint for the component to use. Only used for local development with, for example, [localstack](https://github.com/localstack/localstack). The `endpoint` is unnecessary when running against production AWS | `"http://localhost:4566"`
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
| concurrencyMode | N  | When messages are received in bulk from SQS, call the subscriber sequentially (“single” message at a time), or concurrently (in “parallel”). Default: `"parallel"` | `"single"`, `"parallel"`
| concurrencyLimit | N | Defines the maximum number of concurrent workers handling messages. This value is ignored when concurrencyMode is set to `"single"`. To avoid limiting the number of concurrent workers, set this to `0`. Default: `0` | `100`

### Additional info

#### Conforming with AWS specifications

Dapr created SNS topic and SQS queue names conform with [AWS specifications](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/quotas-queues.html). By default, Dapr creates an SQS queue name based on the consumer `app-id`, therefore Dapr might perform name standardization to meet with AWS specifications.

#### SNS/SQS component behavior

When the pub/sub SNS/SQS component provisions SNS topics, the SQS queues and the subscription behave differently in situations where the component is operating on behalf of a message producer (with no subscriber app deployed), than in situations where a subscriber app is present (with no publisher deployed).

Due to how SNS works without SQS subscription _in publisher only setup_, the SQS queues and the subscription behave as a "classic" pub/sub system that relies on subscribers listening to topic messages. Without those subscribers, messages:

- Cannot be passed onwards and are effectively dropped
- Are not available for future subscribers (no replay of message when the subscriber finally subscribes)

#### SQS FIFO

Using SQS FIFO (`fifo` metadata field set to `"true"`) per AWS specifications provides message ordering and deduplication, but incurs a lower SQS processing throughput, among other caveats.

Specifying `fifoMessageGroupID` limits the number of concurrent consumers of the FIFO queue used to only one but guarantees global ordering of messages published by the app's Dapr sidecars. See [this AWS blog post](https://aws.amazon.com/blogs/compute/solving-complex-ordering-challenges-with-amazon-sqs-fifo-queues/) to better understand the topic of Message Group IDs and FIFO queues.

To avoid losing the order of messages delivered to consumers, the FIFO configuration for the SQS Component requires the `concurrencyMode` metadata field set to `"single"`.

#### Default parallel `concurrencyMode`

Since v1.8.0, the component supports the `"parallel"` `concurrencyMode` as its default mode. In prior versions, the component default behavior was calling the subscriber a single message at a time and waiting for its response.

#### SQS dead-letter Queues

When configuring the PubSub component with SQS dead-letter queues, the metadata fields `messageReceiveLimit` and `sqsDeadLettersQueueName` must both be set to a value. For `messageReceiveLimit`, the value must be greater than `0` and the `sqsDeadLettersQueueName` must not be empty string.

{{% alert title="Important" color="warning" %}}
When running the Dapr sidecar (`daprd`) with your application on EKS (AWS Kubernetes) node/pod already attached to an IAM policy defining access to AWS resources, you **must not** provide AWS access-key, secret-key, and tokens in the definition of the component spec.  
{{% /alert %}}

#### SNS/SQS Contention with Dapr

Fundamentally, SNS aggregates messages from multiple publisher topics into a single SQS queue by creating SQS subscriptions to those topics. As a subscriber, the SNS/SQS pub/sub component consumes messages from that sole SQS queue.

However, like any SQS consumer, the component cannot selectively retrieve the messages published to the SNS topics to which it is specifically subscribed. This can result in the component receiving messages originating from topics without associated handlers. Typically, this occurs during:

- **Component initialization:** If infrastructure subscriptions are ready before component subscription handlers, or
- **Shutdown:** If component handlers are removed before infrastructure subscriptions.

Since this issue affects any SQS consumer of multiple SNS topics, the component cannot prevent consuming messages from topics lacking handlers. When this happens, the component logs an error indicating such messages were erroneously retrieved.

In these situations, the unhandled messages would reappear in SQS with their [receive count](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html#sqs-receive-count) decremented after each pull. Thus, there is a risk that an unhandled message could exceed its `messageReceiveLimit` and be lost.

{{% alert title="Important" color="warning" %}}
Consider potential contention scenarios when using SNS/SQS with Dapr, and configure `messageReceiveLimit` appropriately. It is highly recommended to use SQS dead-letter queues by setting `sqsDeadLettersQueueName` to prevent losing messages.
{{% /alert %}}

## Create an SNS/SQS instance

{{< tabs "Self-Hosted" "Kubernetes" "AWS" >}}

{{% codetab %}}
For local development, the [localstack project](https://github.com/localstack/localstack) is used to integrate AWS SNS/SQS. Follow [these instructions](https://github.com/localstack/localstack#running) to run localstack.

To run localstack locally from the command line using Docker, apply the following cmd:

```shell
docker run --rm -it -p 4566:4566 -p 4571:4571 -e SERVICES="sts,sns,sqs" -e AWS_DEFAULT_REGION="us-east-1" localstack/localstack
```

In order to use localstack with your pub/sub binding, you need to provide the `endpoint` configuration in the component metadata. The `endpoint` is unnecessary when running against production AWS.

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: snssqs-pubsub
spec:
  type: pubsub.aws.snssqs
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
To run localstack on Kubernetes, you can apply the configuration below. Localstack is then reachable at the DNS name `http://localstack.default.svc.cluster.local:4566` (assuming this was applied to the default namespace), which should be used as the `endpoint`.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: localstack
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
In order to run in AWS, create or assign an IAM user with permissions to the SNS and SQS services, with a policy like:

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

Plug the `AWS account ID` and `AWS account secret` into the `accessKey` and `secretKey` in the component metadata, using Kubernetes secrets and `secretKeyRef`.

Alternatively, let's say you want to provision the SNS and SQS assets using your own tool of choice (for example, Terraform) while preventing Dapr from doing so dynamically. You need to enable `disableEntityManagement` and assign your Dapr-using application with an IAM Role, with a policy like:

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

In the above example, you are running your applications on an EKS cluster with dynamic assets creation (the default Dapr behavior).
{{% /codetab %}}

{{< /tabs >}}

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Pub/Sub building block overview and how-to guides]({{< ref pubsub >}})
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
- AWS docs:
  - [AWS SQS as subscriber to SNS](https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html)
  - [AWS SNS API reference](https://docs.aws.amazon.com/sns/latest/api/Welcome.html)
  - [AWS SQS API reference](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/Welcome.html)
