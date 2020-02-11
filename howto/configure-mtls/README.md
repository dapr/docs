# Setup and Configure Mututal TLS

Dapr supports in-transit encryption of communication between Dapr instances using Sentry, a central Certificate Authority.

Dapr allows operators and developers to bring in their own certificates, or let Dapr automatically create and persist self signed root and issuer certificates.

For detailed information on mTLS, visit the concepts section [here](../../concepts/security/security.md).

If custom certificates have not been provided, Dapr will automaically create and persist self signed certs valid for one year.
In Kubernetes, the certs will be persisted to a secret that resides in the namespace of the Dapr system pods, accessible only to them.
In Self Hosted mode, the certs will be persisted to disk. More information on that is shown below.

## Sentry Configuration

mTLS settings reside in a Dapr configuration file.
The following file shows all the available settings for mTLS in a configuration resource:

```
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: default
spec:
  mtls:
    enabled: true
    workloadCertTTL: "24h"
    allowedClockSkew: "15m"
```

The file here shows the default configuration settings. The examples below will show you how to change and apply this configuration to Sentry in Kubernetes and Self hosted modes.


## Kubernetes

### Setting up mTLS with the configuration resource

In Kubernetes, Dapr creates a default configuration resource with mTLS enabled.

Depending on how you install Dapr, this resource may reside in the `default` namespace if you installed Dapr using the Dapr CLI, or the `dapr-system` namespace if deployed using Helm.

You can view the configuration resource with the following command:

`kubectl get configurations/default --namespace <DAPR_NAMESPACE> -o yaml`.

To make changes to the configuration resource, you can run the following command to edit it:

```
kubectl edit configurations/default --namespace <DAPR_NAMESPACE>
```

Once the changes are saved, you need to restart the Sentry pod in order for the changes to take effect.
You can restart Sentry using the following command:

```
kubectl delete pod --selector=app=dapr-sentry --namespace <DAPR_NAMESPACE>
```

### Viewing logs

In order to view Sentry logs, run the following command:

```
kubectl logs --selector=app=dapr-sentry --namespace <DAPR_NAMESPACE>
```

### Bringing your own certificates

Using Helm, you can provide the PEM encoded root cert, issuer cert and private key that will be populated in the Kubernetes secret.

*Note: This examples uses step to create the certificates. You can install step [here](https://smallstep.com/docs/getting-started/). Windows binaries available [here](https://github.com/smallstep/cli/releases)*

Create the root certificate:

```
step certificate create cluster.local ca.crt ca.key --profile root-ca --no-password --insecure
```

Create the issuer certificate:

```
step certificate create cluster.local issuer.crt issuer.key --ca ca.crt --ca-key ca.key --profile intermediate-ca --not-after 8760h --no-password --insecure
```

This will create the root and issuer certs and keys.

Install Helm and pass the root cert, issuer cert and issuer key to Sentry via configuration:

```
kubectl create ns dapr-system

helm install \
  --set-file dapr_sentry.tls.issuer.certPEM=issuer.crt \
  --set-file dapr_sentry.tls.issuer.keyPEM=issuer.key \
  --set-file dapr_sentry.tls.root.certPEM=ca.crt \
  --namespace dapr-system \
  dapr \
  dapr/dapr
```

## Self-hosted

### Running Sentry

In order to run Sentry, you can either build from source, or download a release binary from [here](https://github.com/dapr/dapr/releases).

When building from source, please refer to [this](https://github.com/dapr/dapr/blob/master/docs/development/developing-dapr.md#build-the-dapr-binaries) guide on how to build Dapr.

Second, create a directory for Sentry to create the self signed root certs:

```
mkdir -p $HOME/.dapr/certs
```

Run Sentry locally with the following command:

```
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local
```

If successful, sentry will run and create the root certs in the given directory.
This command will use default configuration values as no custom config file was given. See below on how to start Sentry with a custom configuration.

### Setting up mTLS with the configuration resource

#### Dapr instance configuration

When running Dapr in self hosted mode, mTLS is disabled by default. you can enable it by creating the following configuration file:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: default
spec:
  mtls:
    enabled: true
```

If using the Dapr CLI, point Dapr to the config file above to run the Dapr instance with mTLS enabled:

```
dapr run --app-id myapp --config ./config.yaml node myapp.js
```

If using `daprd` directly, use the following flags to enable mTLS:

```
daprd --app-id myapp --enable-mtls --sentry-address localhost:50001 --config=./config.yaml
```

#### Sentry configuration

Here's an example of a configuration for Sentry that changes the workload cert TTL to 25 seconds:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: default
spec:
  mtls:
    enabled: true
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

*Note: This examples uses step to create the certificates. You can install step [here](https://smallstep.com/docs/getting-started/). Windows binaries available [here](https://github.com/smallstep/cli/releases)*

Create the root certificate:

```
step certificate create cluster.local ca.crt ca.key --profile root-ca --no-password --insecure
```

Create the issuer certificate:

```
step certificate create cluster.local issuer.crt issuer.key --ca ca.crt --ca-key ca.key --profile intermediate-ca --not-after 8760h --no-password --insecure
```

This will create the root and issuer certs and keys.
Place `ca.crt`, `issuer.crt` and `issuer.key` in a desired path (`$HOME/.dapr/certs` in the example below), and launch Sentry:

```
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local
```
