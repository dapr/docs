# Setup GCP Pubsub

Follow the instructions [here](https://cloud.google.com/pubsub/docs/quickstart-console) on setting up Google Cloud Pub/Sub system.

## Create a Dapr component

The next step is to create a Dapr component for Google Cloud Pub/Sub

Create the following YAML file named `messagebus.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: pubsub.gcp.pubsub
  metadata:
  - name: topic
    value: <TOPIC_NAME>
  - name: type
    value: service_account
  - name: project_id
    value: <PROJECT_ID> # replace
  - name: private_key_id
    value: <PRIVATE_KEY_ID> #replace
  - name: client_email
    value: <CLIENT_EMAIL> #replace
  - name: client_id
    value: <CLIENT_ID> # replace
  - name: auth_uri
    value: https://accounts.google.com/o/oauth2/auth
  - name: token_uri
    value: https://oauth2.googleapis.com/token
  - name: auth_provider_x509_cert_url
    value: https://www.googleapis.com/oauth2/v1/certs
  - name: client_x509_cert_url
    value: https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com
  - name: private_key
    value: <PRIVATE_KEY> # replace x509 cert here
  - name: disableEntityManagement
    value: <REPLACE-WITH-DISABLE-ENTITY-MANAGEMENT> # Optional. Default: false. When set to true, topics and subscriptions do not get created automatically.
```

- `topic` is the Pub/Sub topic name.
- `type` is the GCP credentials type.
- `project_id` is the GCP project id.
- `private_key_id` is the GCP private key id.
- `client_email` is the GCP client email.
- `client_id` is the GCP client id.
- `auth_uri` is Google account OAuth endpoint.
- `token_uri` is Google account token uri.
- `auth_provider_x509_cert_url` is the GCP credentials cert url.
- `client_x509_cert_url` is the GCP credentials project x509 cert url.
- `private_key` is the GCP credentials private key.
- `disableEntityManagement`  Optional. Default: false. When set to true, topics and subscriptions do not get created automatically.

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md)

## Apply the configuration

### In Kubernetes

To apply the Google Cloud pub/sub to Kubernetes, use the `kubectl` CLI:

```bash
kubectl apply -f messagebus.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
