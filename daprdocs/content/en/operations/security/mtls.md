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
*The control plane will continue to use mTLS*

```bash
kubectl create ns dapr-system

helm install \
  --set global.mtls.enabled=false \
  --namespace dapr-system \
  dapr \
  dapr/dapr
```

### Disabling mTLS with the CLI
*The control plane will continue to use mTLS*

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

{{% alert title="Avoiding downtime" color="warning" %}}
To avoid downtime when rotating expiring certificates always sign your certificates with the same private root key.
{{% /alert %}}

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
# skip the following line to reuse an existing root key, required for rotating expiring certificates
openssl ecparam -genkey -name prime256v1 | openssl ec -out root.key
openssl req -new -nodes -sha256 -key root.key -out root.csr -config root.conf -extensions v3_req
openssl x509 -req -sha256 -days 365 -in root.csr -signkey root.key -outform PEM -out root.pem -extfile root.conf -extensions v3_req
```

Next run the following to generate the issuer cert and key:

```bash
# skip the following line to reuse an existing issuer key, required for rotating expiring certificates
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
### Root and issuer certificate upgrade using CLI (Recommended)
The CLI commands below can be used to renew root and issuer certificates in your Kubernetes cluster. 

#### Generate brand new certificates

1. The command below generates brand new root and issuer certificates, signed by a newly generated private root key.

> **Note: The `Dapr sentry service` followed by rest of the control plane services must be restarted for them to be able to read the new certificates. This can be done by supplying `--restart` flag to the command.**

```bash
dapr mtls renew-certificate -k --valid-until <days> --restart
```
2. The command below generates brand new root and issuer certificates, signed by provided private root key.

> **Note: If your existing deployed certificates are signed by this same private root key, the `Dapr Sentry service` can then read these new certificates without restarting.**

```bash
dapr mtls renew-certificate -k --private-key <private_key_file_path> --valid-until <days>
```
#### Renew certificates by using provided custom certificates
To update the provided certificates in the Kubernetes cluster, the CLI command below can be used.

> **Note - It does not support `valid-until` flag to specify validity for new certificates.**

```bash
dapr mtls renew-certificate -k --ca-root-certificate <ca.crt> --issuer-private-key <issuer.key> --issuer-public-certificate <issuer.crt> --restart
```

### Updating root or issuer certs using Kubectl

If the Root or Issuer certs are about to expire, you can update them and restart the required system services.

{{% alert title="Avoiding downtime when rotating certificates" color="warning" %}}
To avoid downtime when rotating expiring certificates your new certificates must be signed with the same private root key as the previous certificates. This is not currently possible using self-signed certificates generated by Dapr.
{{% /alert %}}

#### Dapr-generated self-signed certificates

1. Clear the existing Dapr Trust Bundle secret by saving the following YAML to a file (e.g. `clear-trust-bundle.yaml`) and applying this secret.
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dapr-trust-bundle
  labels:
    app: dapr-sentry
data:
```

```bash
kubectl apply -f `clear-trust-bundle.yaml` -n <DAPR_NAMESPACE>
```

2. Restart the Dapr Sentry service. This will generate a new certificate bundle and update the `dapr-trust-bundle` Kubernetes secret.

```bash
kubectl rollout restart -n <DAPR_NAMESPACE> deployment/dapr-sentry
```

3. Once the Sentry service has been restarted, restart the rest of the Dapr control plane to pick up the new Dapr Trust Bundle.

```bash
kubectl rollout restart deploy/dapr-operator -n <DAPR_NAMESPACE>
kubectl rollout restart statefulsets/dapr-placement-server -n <DAPR_NAMESPACE>
```

4. Restart your Dapr applications to pick up the latest trust bundle.

{{% alert title="Potential application downtime with mTLS enabled." color="warning" %}}
Restarts of deployments using service to service invocation using mTLS will fail until the callee service has also been restarted (thereby loading the new Dapr Trust Bundle). Additionally, the placement service will not be able to assign new actors (while existing actors remain unaffected) until applications have been restarted to load the new Dapr Trust Bundle.
{{% /alert %}}

```bash
kubectl rollout restart deployment/mydaprservice1 kubectl deployment/myotherdaprservice2
```

#### Custom certificates (bring your own)

First, issue new certificates using the step above in [Bringing your own certificates](#bringing-your-own-certificates).

Now that you have the new certificates, use Helm to upgrade the certificates:

```bash
helm upgrade \
  --set-file dapr_sentry.tls.issuer.certPEM=issuer.pem \
  --set-file dapr_sentry.tls.issuer.keyPEM=issuer.key \
  --set-file dapr_sentry.tls.root.certPEM=root.pem \
  --namespace dapr-system \
  dapr \
  dapr/dapr
```

Alternatively, you can update the Kubernetes secret that holds them:

```bash
kubectl edit secret dapr-trust-bundle -n <DAPR_NAMESPACE>
```

Replace the `ca.crt`, `issuer.crt` and `issuer.key` keys in the Kubernetes secret with their corresponding values from the new certificates.
*__Note: The values must be base64 encoded__*

If you signed the new cert root with the **same private key** the Dapr Sentry service will pick up the new certificates automatically. You can restart your application deployments using `kubectl rollout restart` with zero downtime. It is not necessary to restart all deployments at once, as long as deployments are restarted before original certificate expiration.

If you signed the new cert root with a **different private key**, you must restart the Dapr Sentry service, followed by the remainder of the Dapr control plane service.

```bash
kubectl rollout restart deploy/dapr-sentry -n <DAPR_NAMESPACE>
```

Once Sentry has been completely restarted run:

```bash
kubectl rollout restart deploy/dapr-operator -n <DAPR_NAMESPACE>
kubectl rollout restart statefulsets/dapr-placement-server -n <DAPR_NAMESPACE>
```

Next, you must restart all Dapr-enabled pods.
The recommended way to do this is to perform a rollout restart of your deployment:

```
kubectl rollout restart deploy/myapp
```

You will experience potential downtime due to mismatching certificates until all deployments have successfully been restarted (and hence loaded the new Dapr certificates).

### Kubernetes video demo 
Watch this video to show how to update mTLS certificates on Kubernetes

<iframe width="1280" height="720" src="https://www.youtube.com/embed/_U9wJqq-H1g" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### Set up monitoring for Dapr control plane mTLS certificate expiration

Beginning 30 days prior to mTLS root certificate expiration the Dapr sentry service will emit hourly warning level logs indicating that the root certificate is about to expire.

As an operational best practice for running Dapr in production we recommend configuring monitoring for these particular sentry service logs so that you are aware of the upcoming certificate expiration.

```bash
"Dapr root certificate expiration warning: certificate expires in 2 days and 15 hours"
```

Once the certificate has expired you will see the following message:

```bash
"Dapr root certificate expiration warning: certificate has expired."
```

In Kubernetes you can view the sentry service logs like so:

```bash
kubectl logs deployment/dapr-sentry -n dapr-system
```

The log output will appear like the following:"

```bash
{"instance":"dapr-sentry-68cbf79bb9-gdqdv","level":"warning","msg":"Dapr root certificate expiration warning: certificate expires in 2 days and 15 hours","scope":"dapr.sentry","time":"2022-04-01T23:43:35.931825236Z","type":"log","ver":"1.6.0"}
```

As an additional tool to alert you to the upcoming certificate expiration beginning with release 1.7.0 the CLI now prints the certificate expiration status whenever you interact with a Kubernetes-based deployment.

Example:
```bash
dapr status -k

  NAME                   NAMESPACE    HEALTHY  STATUS   REPLICAS  VERSION   AGE  CREATED
  dapr-sentry            dapr-system  True     Running  1         1.7.0     17d  2022-03-15 09:29.45
  dapr-dashboard         dapr-system  True     Running  1         0.9.0     17d  2022-03-15 09:29.45
  dapr-sidecar-injector  dapr-system  True     Running  1         1.7.0     17d  2022-03-15 09:29.45
  dapr-operator          dapr-system  True     Running  1         1.7.0     17d  2022-03-15 09:29.45
  dapr-placement-server  dapr-system  True     Running  1         1.7.0     17d  2022-03-15 09:29.45
⚠  Dapr root certificate of your Kubernetes cluster expires in 2 days. Expiry date: Mon, 04 Apr 2022 15:01:03 UTC.
 Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```

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

To have Dapr generate new certificates, delete the existing certificates at `$HOME/.dapr/certs` and restart the sentry service to generate new certificates.

```bash
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local --config=./config.yaml
```

To replace with your own certificates, first generate new certificates using the step above in [Bringing your own certificates](#bringing-your-own-certificates).

Copy `ca.crt`, `issuer.crt` and `issuer.key` to the filesystem path of every configured system service, and restart the process or container.
By default, system services will look for the credentials in `/var/run/dapr/credentials`. The examples above use `$HOME/.dapr/certs` as a custom location.

*Note: If you signed the cert root with a different private key, restart the Dapr instances.*

## Community call video on certificate rotation
Watch this [video](https://www.youtube.com/watch?v=Hkcx9kBDrAc&feature=youtu.be&t=1400) on how to perform certificate rotation if your certicates are expiring.

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/Hkcx9kBDrAc?start=1400"></iframe>
</div>
