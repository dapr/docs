# GCP Storage Bucket Spec

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.gcp.bucket
  metadata:
  - name: bucket
    value: mybucket
  - name: type
    value: service_account
  - name: project_id
    value: project_111
  - name: private_key_id
    value: *************
  - name: client_email
    value: name@domain.com
  - name: client_id
    value: '1111111111111111'
  - name: auth_uri
    value: https://accounts.google.com/o/oauth2/auth
  - name: token_uri
    value: https://oauth2.googleapis.com/token
  - name: auth_provider_x509_cert_url
    value: https://www.googleapis.com/oauth2/v1/certs
  - name: client_x509_cert_url
    value: https://www.googleapis.com/robot/v1/metadata/x509/<project-name>.iam.gserviceaccount.com
  - name: private_key
    value: PRIVATE KEY
```

- `bucket` is the bucket name.
- `type` is the GCP credentials type.
- `project_id` is the GCP project id.
- `private_key_id` is the GCP private key id.
- `client_email` is the GCP client email.
- `client_id` is the GCP client id.
- `auth_uri` is Google account oauth endpoint.
- `token_uri` is Google account token uri.
- `auth_provider_x509_cert_url` is the GCP credentials cert url.
- `client_x509_cert_url` is the GCP credentials project x509 cert url.
- `private_key` is the GCP credentials private key.

> **Note:** In production never place passwords or secrets within Dapr components. For information on securely storing and retrieving secrets refer to [Setup Secret Store](../../../howto/setup-secret-store)

## Output Binding Supported Operations

* create