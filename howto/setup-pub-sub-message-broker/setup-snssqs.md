# Setup AWS SNS/SQS for pub/sub

This article describes configuring Dapr to use AWS SNS/SQS for pub/sub on local and Kubernetes environments. For local development, the [localstack project](https://github.com/localstack/localstack) is used to integrate AWS SNS/SQS.
Follow the instructions [here](https://github.com/localstack/localstack#installing) to install the localstack CLI.

## Locally

In order to use localstack with your pubsub binding, you need to provide the `awsEndpoint` configuration 
in the component metadata. The `awsEndpoint` is unncessary when running against production AWS.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
spec:
  type: pubsub.snssqs
  metadata:
    - name: awsEndpoint
      value: http://localhost:4566
    # Use us-east-1 for localstack
    - name: awsRegion
      value: us-east-1
```

## Kubernetes

To run localstack on Kubernetes, you can apply the configuration below. Localstack is then 
reachable at the DNS name `http://localstack.default.svc.cluster.local:4566` 
(assuming this was applied to the default namespace) and this should be used as the `awsEndpoint`
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

## Run in AWS
In order to run in AWS, you should create an IAM user with permissions to the SNS and SQS services. 
Use the account ID and account secret and plug them into the `awsAccountID` and `awsAccountSecret`
in the component metadata using kubernetes secrets.

## Create a Dapr component

The next step is to create a Dapr component for SNS/SQS.

Create the following YAML file named `snssqs.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: pubsub.snssqs
  metadata:
    # ID of the AWS account with appropriate permissions to SNS and SQS
    - name: awsAccountID
      value: <AWS account ID>
    # Secret for the AWS user
    - name: awsSecret
      value: <AWS secret>
    # The AWS region you want to operate in. 
    # See this page for valid regions: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html
    # Make sure that SNS and SQS are available in that region.
    - name: awsRegion
      value: us-east-1
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md).

## Apply the configuration

### In Kubernetes

To apply the SNS/SQS component to Kubernetes, use the `kubectl` command:

```
kubectl apply -f kafka.yaml
```

### Running locally

Place the above components file `snssqs.yaml` in the local components directory (either the default directory or in a path you define when running the CLI command `dapr run`)


## Related Links
- [AWS SQS as subscriber to SNS](https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html)
- [AWS SNS API refernce](https://docs.aws.amazon.com/sns/latest/api/Welcome.html)
- [AWS SQS API refernce](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/Welcome.html)
