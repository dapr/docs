# Secret Store for AWS Secret Manager

This document shows how to enable AWS Secret Manager secret store using [Dapr Secrets Component](../../concepts/components/secrets.md) for Standalone and Kubernetes mode.

## Create an AWS Secret Manager instance

Setup AWS Secret Manager using the AWS documentation: https://docs.aws.amazon.com/secretsmanager/latest/userguide/tutorials_basic.html.

## Create the component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awssecretmanager
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

When running in self hosted mode, place this file in a `components` directory from the Dapr working directory.

## AWS Secret Manager reference example

This example shows you how to take the Redis password from the AWS Secret Manager secret store.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  metadata:
  - name: redisHost
    value: "[redis]:6379"
  - name: redisPassword
    secretKeyRef:
      name: redisPassword
auth:
    secretStore: awssecretmanager
```
