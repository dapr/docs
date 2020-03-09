# Dapr Secrets Management

Dapr offers developers a consistent way to extract application secrets, without needing to know the specifics of the secret store being used.
Secret stores are components in Dapr. Dapr allows users to write new secret stores component implementations that can be used both to hold secrets for other Dapr components (for example secrets used by a state store components to read/write state) as well as serving the application with a dedicated secret building block API. Using the secrets building block API, you can easily read secrets that can be used by the application from the a named secrets store. 

Some examples for secret stores include `Kubernetes`, `Hashicorp Vault`, `Azure KeyVault`. See [secret stores](https://github.com/dapr/components-contrib/tree/master/secretstores)

## Referencing Secret Stores in Dapr Components

Instead of including credentials within a Dapr component, you can place the credentials within a Dapr supported secret store and reference the secret within the Dapr component. For more information read [Referencing Secret Stores in Components](./component-secrets.md)

## Retrieving Secrets

Service code can call the secrets building block API to retrieve secrets out of the Dapr supported secret store. Read [Secrets API Specification](./secrets_api.md) for more information.
