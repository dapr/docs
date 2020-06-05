# Secret store for AWS Secret Manager

This document shows how to enable AWS Secret Manager secret store using [Dapr Secrets Component](../../concepts/secrets/README.md) for self hosted and Kubernetes mode.

## Create an AWS Secret Manager instance

Setup AWS Secret Manager using the AWS documentation: https://docs.aws.amazon.com/secretsmanager/latest/userguide/tutorials_basic.html.

## Create the component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awssecretmanager
  namespace: default
spec:
  type: secretstores.aws.secretmanager
  metadata:
  - name: region
    value: [aws_region] # Required.
  - name: accessKey # Required.
    value: "[aws_access_key]"
  - name: secretKey # Required.
    value: "[aws_secret_key]"
  - name: sessionToken # Required.
    value: "[aws_session_token]"
```

To deploy in Kubernetes, save the file above to `aws_secret_manager.yaml` and then run:

```bash
kubectl apply -f aws_secret_manager.yaml
```

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.

## AWS Secret Manager reference example

This example shows you how to set the Redis password from the AWS Secret Manager secret store.
Here, you created a secret named `redisPassword` in AWS Secret Manager. Note its important to set it both as the `name` and `key` properties.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  metadata:
  - name: redisHost
    value: "[redis]:6379"
  - name: redisPassword
    secretKeyRef:
      name: redisPassword
      key: redisPassword
auth:
    secretStore: awssecretmanager
```
