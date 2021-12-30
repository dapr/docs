---
type: docs
title: "Setup & configure mTLS certificates"
linkTitle: "Setup & configure mTLS certificates"
weight: 1000
description: "Encrypt communication between applications using self-signed or user supplied x.509 certificates"
---

Dapr supports in-transit encryption of communication between Dapr instances using the Dapr control plane, Sentry service, which is a central Certificate Authority (CA).

Dapr allows operators and developers to bring in their own certificates, or instead let Dapr automatically create and persist self-signed root and issuer certificates.

For detailed information on mTLS, read the [security concepts section]({{< ref "security-concept.md" >}}).

If custom certificates have not been provided, Dapr automatically creates and persist self-signed certs valid for one year.
In Kubernetes, the certs are persisted to a secret that resides in the namespace of the Dapr system pods, accessible only to them.
In self hosted mode, the certs are persisted to disk.

## Control plane Sentry service configuration
The mTLS settings reside in a Dapr control plane configuration file. For example when you deploy the Dapr control plane to Kubernetes this configuration file is automatically created and then you can edit this. The following file shows the available settings for mTLS in a configuration resource, deployed in the `daprsystem` namespace:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprsystem
  namespace: default
spec:
  mtls:
    enabled: true
    workloadCertTTL: "24h"
    allowedClockSkew: "15m"
```

The file here shows the default `daprsystem` configuration settings. The examples below show you how to change and apply this configuration to the control plane Sentry service either in Kubernetes and self hosted modes.

## Kubernetes

### Setting up mTLS with the configuration resource

In Kubernetes, Dapr creates a default control plane configuration resource with mTLS enabled.
The Sentry service, the certificate authority system pod, is installed both with Helm and with the Dapr CLI using `dapr init --kubernetes`.

You can view the control plane configuration resource with the following command:

`kubectl get configurations/daprsystem --namespace <DAPR_NAMESPACE> -o yaml`.

To make changes to the control plane configuration resource, run the following command to edit it:

```
kubectl edit configurations/daprsystem --namespace <DAPR_NAMESPACE>
```

Once the changes are saved, perform a rolling update to the control plane:

```
kubectl rollout restart deploy/dapr-sentry -n <DAPR_NAMESPACE>
kubectl rollout restart deploy/dapr-operator -n <DAPR_NAMESPACE>
kubectl rollout restart statefulsets/dapr-placement-server -n <DAPR_NAMESPACE>
```

*Note: the control plane Sidecar Injector service does not need to be redeployed*

### Disabling mTLS with Helm

```bash
kubectl create ns dapr-system

helm install \
  --set global.mtls.enabled=false \
  --namespace dapr-system \
  dapr \
  dapr/dapr
```

### Disabling mTLS with the CLI

```
dapr init --kubernetes --enable-mtls=false
```

### Viewing logs

In order to view the Sentry service logs, run the following command:

```
kubectl logs --selector=app=dapr-sentry --namespace <DAPR_NAMESPACE>
```

### Bringing your own certificates

Using Helm, you can provide the PEM encoded root cert, issuer cert and private key that will be populated into the Kubernetes secret used by the Sentry service.

_Note: This example uses the OpenSSL command line tool, this is a widely distributed package, easily installed on Linux via the package manager. On Windows OpenSSL can be installed [using chocolatey](https://community.chocolatey.org/packages/openssl). On MacOS it can be installed using brew `brew install openssl`_

Create config files for generating the certificates, this is necessary for generating v3 certificates with the SAN (Subject Alt Name) extension fields. First save the following to a file named `root.conf`:

```ini
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no
[req_distinguished_name]
C = US
ST = VA
L = Daprville
O = dapr.io/sentry
OU = dapr.io/sentry
CN = cluster.local
[v3_req]
basicConstraints = critical, CA:true
keyUsage = critical, digitalSignature, cRLSign, keyCertSign
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names
[alt_names]
DNS.1 = cluster.local
```

Repeat this for `issuer.conf`, paste the same contents into the file, but add `pathlen:0` to the end of the basicConstraints line, as shown below:

```ini
basicConstraints = critical, CA:true, pathlen:0
```

Run the following to generate the root cert and key

```bash
openssl ecparam -genkey -name prime256v1 | openssl ec -out root.key
openssl req -new -nodes -sha256 -key root.key -out root.csr -config root.conf -extensions v3_req
openssl x509 -req -sha256 -days 365 -in root.csr -signkey root.key -outform PEM -out root.pem -extfile root.conf -extensions v3_req
```

Next run the following to generate the issuer cert and key:

```bash
openssl ecparam -genkey -name prime256v1 | openssl ec -out issuer.key
openssl req -new -sha256 -key issuer.key -out issuer.csr -config issuer.conf -extensions v3_req
openssl x509 -req -in issuer.csr -CA root.pem -CAkey root.key -CAcreateserial -outform PEM -out issuer.pem -days 365 -sha256 -extfile issuer.conf -extensions v3_req
```

Install Helm and pass the root cert, issuer cert and issuer key to Sentry via configuration:

```bash
kubectl create ns dapr-system

helm install \
  --set-file dapr_sentry.tls.issuer.certPEM=issuer.pem \
  --set-file dapr_sentry.tls.issuer.keyPEM=issuer.key \
  --set-file dapr_sentry.tls.root.certPEM=root.pem \
  --namespace dapr-system \
  dapr \
  dapr/dapr
```

### Updating root or issuer certs

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
### Kubernetes video demo 
Watch this video to show how to update mTLS certificates on Kubernetes

<iframe width="1280" height="720" src="https://www.youtube.com/embed/_U9wJqq-H1g" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Self hosted
### Running the control plane Sentry service

In order to run the Sentry service, you can either build from source, or download a release binary from [here](https://github.com/dapr/dapr/releases).

When building from source, please refer to [this](https://github.com/dapr/dapr/blob/master/docs/development/developing-dapr.md#build-the-dapr-binaries) guide on how to build Dapr.

Second, create a directory for the Sentry service to create the self signed root certs:

```
mkdir -p $HOME/.dapr/certs
```

Run the Sentry service locally with the following command:

```bash
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local
```

If successful, the Sentry service runs and creates the root certs in the given directory.
This command uses default configuration values as no custom config file was given. See below on how to start the Sentry service with a custom configuration.

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
    enabled: true
```

In addition to the Dapr configuration, you also need to provide the TLS certificates to each Dapr sidecar instance. You can do so by setting the following environment variables before running the Dapr instance:

{{< tabs "Linux/MacOS" Windows >}}

{{% codetab %}}
```bash
export DAPR_TRUST_ANCHORS=`cat $HOME/.dapr/certs/ca.crt`
export DAPR_CERT_CHAIN=`cat $HOME/.dapr/certs/issuer.crt`
export DAPR_CERT_KEY=`cat $HOME/.dapr/certs/issuer.key`
export NAMESPACE=default
```

{{% /codetab %}}

{{% codetab %}}
```powershell
$env:DAPR_TRUST_ANCHORS=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\ca.crt)
$env:DAPR_CERT_CHAIN=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\issuer.crt)
$env:DAPR_CERT_KEY=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\issuer.key)
$env:NAMESPACE="default"
```

{{% /codetab %}}

{{< /tabs >}}

If using the Dapr CLI, point Dapr to the config file above to run the Dapr instance with mTLS enabled:

```
dapr run --app-id myapp --config ./config.yaml node myapp.js
```

If using `daprd` directly, use the following flags to enable mTLS:

```bash
daprd --app-id myapp --enable-mtls --sentry-address localhost:50001 --config=./config.yaml
```

#### Sentry service configuration

Here's an example of a configuration for Sentry that changes the workload cert TTL to 25 seconds:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprsystem
  namespace: default
spec:
  mtls:
    enabled: true
    workloadCertTTL: "25s"
```

In order to start Sentry service with a custom config, use the following flag:

```
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local --config=./config.yaml
```

### Bringing your own certificates

In order to provide your own credentials, create ECDSA PEM encoded root and issuer certificates and place them on the file system.
Tell the Sentry service where to load the certificates from using the `--issuer-credentials` flag.

The next examples creates root and issuer certs and loads them with the Sentry service.

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

### Updating root or issuer certificates

If the Root or Issuer certs are about to expire, you can update them and restart the required system services.

First, issue new certificates using the step above in [Bringing your own certificates](#bringing-your-own-certificates).

Copy `ca.crt`, `issuer.crt` and `issuer.key` to the filesystem path of every configured system service, and restart the process or container.
By default, system services will look for the credentials in `/var/run/dapr/credentials`.

*Note:If you signed the cert root with a different private key, restart the Dapr instances.*
