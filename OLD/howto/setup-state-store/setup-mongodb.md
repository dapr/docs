# Setup MongoDB 

## Locally

You can run MongoDB locally using Docker:

```
docker run --name some-mongo -d mongo
```

You can then interact with the server using `localhost:27017`.

## Kubernetes

The easiest way to install MongoDB on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/mongodb):

```
helm install mongo stable/mongodb
```

This will install MongoDB into the `default` namespace.
To interact with MongoDB, find the service with: `kubectl get svc mongo-mongodb`.

For example, if installing using the example above, the MongoDB host address would be:

`mongo-mongodb.default.svc.cluster.local:27017`


Follow the on-screen instructions to get the root password for MongoDB.
The username will be `admin` by default.

## Create a Dapr component

The next step is to create a Dapr component for MongoDB.

Create the following YAML file named `mongodb.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.mongodb
  metadata:
  - name: host
    value: <REPLACE-WITH-HOST> # Required. Example: "mongo-mongodb.default.svc.cluster.local:27017"
  - name: username
    value: <REPLACE-WITH-USERNAME> # Optional. Example: "admin"
  - name: password
    value: <REPLACE-WITH-PASSWORD> # Optional.
  - name: databaseName
    value: <REPLACE-WITH-DATABASE-NAME> # Optional. default: "daprStore"
  - name: collectionName
    value: <REPLACE-WITH-COLLECTION-NAME> # Optional. default: "daprCollection"
  - name: writeconcern
    value: <REPLACE-WITH-WRITE-CONCERN> # Optional.
  - name: readconcern
    value: <REPLACE-WITH-READ-CONCERN> # Optional.
  - name: operationTimeout
    value: <REPLACE-WITH-OPERATION-TIMEOUT> # Optional. default: "5s"
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md).

The following example uses the Kubernetes secret store to retrieve the username and password:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.mondodb
  metadata:
  - name: host
    value: <REPLACE-WITH-HOST>
  - name: username
    secretKeyRef:
      name: <KUBERNETES-SECRET-NAME>
      key: <KUBERNETES-SECRET-KEY>
  - name: password
    secretKeyRef:
      name: <KUBERNETES-SECRET-NAME>
      key: <KUBERNETES-SECRET-KEY>
  ...
``` 


## Apply the configuration

### In Kubernetes

To apply the MondoDB state store to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f mongodb.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
