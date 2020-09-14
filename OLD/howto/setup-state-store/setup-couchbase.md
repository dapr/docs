# Setup Couchbase 

## Locally

You can run Couchbase locally using Docker:

```
docker run -d --name db -p 8091-8094:8091-8094 -p 11210:11210 couchbase
```

You can then interact with the server using `localhost:8091` and start the server setup.

## Kubernetes

The easiest way to install Couchbase on Kubernetes is by using the [Helm chart](https://github.com/couchbase-partners/helm-charts#deploying-for-development-quick-start):

```
helm repo add couchbase https://couchbase-partners.github.io/helm-charts/
helm install couchbase/couchbase-operator
helm install couchbase/couchbase-cluster
```

## Create a Dapr component

The next step is to create a Dapr component for Couchbase.

Create the following YAML file named `couchbase.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.couchbase
  metadata:
  - name: couchbaseURL
    value: <REPLACE-WITH-URL> # Required. Example: "http://localhost:8091"
  - name: username
    value: <REPLACE-WITH-USERNAME> # Required.
  - name: password
    value: <REPLACE-WITH-PASSWORD> # Required.
  - name: bucketName
    value: <REPLACE-WITH-BUCKET> # Required.
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md)


## Apply the configuration

### In Kubernetes

To apply the Couchbase state store to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f couchbase.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
