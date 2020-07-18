# Setup and configure mutual TLS

Dapr supports in-transit encryption of communication between Dapr instances using Sentry, a central Certificate Authority.

Dapr allows operators and developers to bring in their own certificates, or let Dapr automatically create and persist self signed root and issuer certificates.

For detailed information on mTLS, go to the concepts section [here](../../concepts/security/README.md).

If custom certificates have not been provided, Dapr will automatically create and persist self signed certs valid for one year.
In Kubernetes, the certs are persisted to a secret that resides in the namespace of the Dapr system pods, accessible only to them.
In Self Hosted mode, the certs are persisted to disk. More information on that is shown below.

## Sentry configuration

mTLS settings reside in a Dapr configuration file.
The following file shows all the available settings for mTLS in a configuration resource:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprsystem
  namespace: default
spec:
  mtls:
    enabled: "true"
    workloadCertTTL: "24h"
    allowedClockSkew: "15m"
```

The file here shows the default `daprsystem` configuration settings. The examples below show you how to change and apply this configuration to Sentry in Kubernetes and Self hosted modes.

## Kubernetes

### Setting up mTLS with the configuration resource

In Kubernetes, Dapr creates a default configuration resource with mTLS enabled.
Sentry, the certificate authority system pod, is installed both with Helm and with the Dapr CLI using `dapr init --kubernetes`. 

Depending on how you install Dapr, this resource may reside in the `default` namespace if you installed Dapr using the Dapr CLI, or the `dapr-system` namespace if deployed using Helm.

You can view the configuration resource with the following command:

`kubectl get configurations/daprsystem --namespace <DAPR_NAMESPACE> -o yaml`.

To make changes to the configuration resource, you can run the following command to edit it:

```
kubectl edit configurations/daprsystem --namespace <DAPR_NAMESPACE>
```

Once the changes are saved, perform a rolling update to the control plane:

```
kubectl rollout restart deploy/dapr-sentry -n <DAPR_NAMESPACE>
kubectl rollout restart deploy/dapr-operator -n <DAPR_NAMESPACE>
kubectl rollout restart deploy/dapr-placement -n <DAPR_NAMESPACE>
```

*Note: the sidecar injector does not need to be redeployed*

### Disabling mTLS with Helm

```bash
kubectl create ns dapr-system

helm install \
  --set global.mtls.enabled=false \
  --namespace dapr-system \
  dapr \
  dapr/dapr
```

### Viewing logs

In order to view Sentry logs, run the following command:

```
kubectl logs --selector=app=dapr-sentry --namespace <DAPR_NAMESPACE>
```

### Bringing your own certificates

Using Helm, you can provide the PEM encoded root cert, issuer cert and private key that will be populated into the Kubernetes secret.

*Note: This example uses the step tool to create the certificates. You can install step tool from [here](https://smallstep.com/docs/getting-started/). Windows binaries available [here](https://github.com/smallstep/cli/releases)*

Create the root certificate:

```
step certificate create cluster.local ca.crt ca.key --profile root-ca --no-password --insecure
```

Create the issuer certificate:

```
step certificate create cluster.local issuer.crt issuer.key --ca ca.crt --ca-key ca.key --profile intermediate-ca --not-after 8760h --no-password --insecure
```

This creates the root and issuer certs and keys.

Install Helm and pass the root cert, issuer cert and issuer key to Sentry via configuration:

```bash
kubectl create ns dapr-system

helm install \
  --set-file dapr_sentry.tls.issuer.certPEM=issuer.crt \
  --set-file dapr_sentry.tls.issuer.keyPEM=issuer.key \
  --set-file dapr_sentry.tls.root.certPEM=ca.crt \
  --namespace dapr-system \
  dapr \
  dapr/dapr
```

### Updating Root or Issuer Certs

If the Root or Issuer certs are about to expire, you can update them and restart the required system services.

First, issue new certificates using the step above in [Bringing your own certificates](#bringing-your-own-certificates).

Now that you have the new certificates, you can update the Kubernetes secret that holds them.
Edit the Kubernetes secret:

```
kubectl edit secret dapr-trust-bundle -n <DAPR_NAMESPACE>
```

Replace the `ca.crt`, `issuer.crt` and `issuer.key` keys in the Kubernetes secret with their corresponding values from the new certificates.
*__Note: The values must be base64 encoded__*

If you signed the new cert root with a different private key, restart all Dapr-enabled pods.
The recommended way to do this is to perform a rollout restart of your deployment:

```
kubectl rollout restart deploy/myapp
```

## Self-hosted

### Running Sentry system service

In order to run Sentry, you can either build from source, or download a release binary from [here](https://github.com/dapr/dapr/releases).

When building from source, please refer to [this](https://github.com/dapr/dapr/blob/master/docs/development/developing-dapr.md#build-the-dapr-binaries) guide on how to build Dapr.

Second, create a directory for Sentry to create the self signed root certs:

```
mkdir -p $HOME/.dapr/certs
```

Run Sentry locally with the following command:

```bash
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local
```

If successful, sentry will run and create the root certs in the given directory.
This command uses default configuration values as no custom config file was given. See below on how to start Sentry with a custom configuration.

### Setting up mTLS with the configuration resource

#### Dapr instance configuration

When running Dapr in self hosted mode, mTLS is disabled by default. you can enable it by creating the following configuration file:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprsystem
  namespace: default
spec:
  mtls:
    enabled: "true"
```

If using the Dapr CLI, point Dapr to the config file above to run the Dapr instance with mTLS enabled:

```
dapr run --app-id myapp --config ./config.yaml node myapp.js
```

If using `daprd` directly, use the following flags to enable mTLS:

```bash
daprd --app-id myapp --enable-mtls --sentry-address localhost:50001 --config=./config.yaml
```

#### Sentry configuration

Here's an example of a configuration for Sentry that changes the workload cert TTL to 25 seconds:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprsystem
  namespace: default
spec:
  mtls:
    enabled: "true"
    workloadCertTTL: "25s"
```

In order to start Sentry with a custom config, use the following flag:

```
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local --config=./config.yaml
```

### Bringing your own certificates

In order to provide your own credentials, create ECDSA PEM encoded root and issuer certificates and place them on the file system.
Tell Sentry where to load the certificates from using the `--issuer-credentials` flag.

The next examples creates root and issuer certs and loads them with Sentry.

*Note: This example uses the step tool to create the certificates. You can install step tool from [here](https://smallstep.com/docs/getting-started/). Windows binaries available [here](https://github.com/smallstep/cli/releases)*

Create the root certificate:

```bash
step certificate create cluster.local ca.crt ca.key --profile root-ca --no-password --insecure
```

Create the issuer certificate:

```bash
step certificate create cluster.local issuer.crt issuer.key --ca ca.crt --ca-key ca.key --profile intermediate-ca --not-after 8760h --no-password --insecure
```

This creates the root and issuer certs and keys.
Place `ca.crt`, `issuer.crt` and `issuer.key` in a desired path (`$HOME/.dapr/certs` in the example below), and launch Sentry:

```bash
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local
```

### Updating Root or Issuer Certs

If the Root or Issuer certs are about to expire, you can update them and restart the required system services.

First, issue new certificates using the step above in [Bringing your own certificates](#bringing-your-own-certificates).

Copy `ca.crt`, `issuer.crt` and `issuer.key` to the filesystem path of every configured system service, and restart the process or container.
By default, system services will look for the credentials in `/var/run/dapr/credentials`.

*Note:If you signed the cert root with a different private key, restart the Dapr instances.*
