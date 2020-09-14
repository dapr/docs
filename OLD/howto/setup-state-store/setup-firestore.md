# Setup Google Cloud Firestore (Datastore mode) 

## Locally

You can use the GCP Datastore emulator to run locally using the instructions [here](https://cloud.google.com/datastore/docs/tools/datastore-emulator).

You can then interact with the server using `localhost:8081`.

## Google Cloud

Follow the instructions [here](https://cloud.google.com/datastore/docs/quickstart) to get started with setting up Firestore in Google Cloud.

## Create a Dapr component

The next step is to create a Dapr component for Firestore.

Create the following YAML file named `firestore.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.gcp.firestore
  metadata:
  - name: type
    value: <REPLACE-WITH-CREDENTIALS-TYPE> # Required. Example: "serviceaccount"
  - name: project_id
    value: <REPLACE-WITH-PROJECT-ID> # Required.
  - name: private_key_id
    value: <REPLACE-WITH-PRIVATE-KEY-ID> # Required.
  - name: private_key
    value: <REPLACE-WITH-PRIVATE-KEY> # Required.
  - name: client_email
    value: <REPLACE-WITH-CLIENT-EMAIL> # Required.
  - name: client_id
    value: <REPLACE-WITH-CLIENT-ID> # Required.
  - name: auth_uri
    value: <REPLACE-WITH-AUTH-URI> # Required.
  - name: token_uri
    value: <REPLACE-WITH-TOKEN-URI> # Required.
  - name: auth_provider_x509_cert_url
    value: <REPLACE-WITH-AUTH-X509-CERT-URL> # Required.
  - name: client_x509_cert_url
    value: <REPLACE-WITH-CLIENT-x509-CERT-URL> # Required.
  - name: entity_kind
    value: <REPLACE-WITH-ENTITY-KIND> # Optional. default: "DaprState"
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md)


## Apply the configuration

### In Kubernetes

To apply the Firestore state store to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f firestore.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
