---
type: docs
title: "mtls renew certificate CLI command reference"
linkTitle: "mtls renew certificate"
description: "Detailed information on the mtls renew certificate CLI command"
weight: 3000
---

### Description
This command can be used to renew expiring Dapr certificates. For example the Dapr Sentry service can generate default root and issuer certificates used by applications. For more information see [secure Dapr to Dapr communication]({{< ref "#secure-dapr-to-dapr-communication" >}})

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr mtls renew-certificate [flags]
```

### Flags

| Name           | Environment Variable | Default           | Description                                 |
| -------------- | -------------------- | ----------------- | ------------------------------------------- |
| `--help`, `-h` |                      |                   | help for renew-certificate
| `--kubernetes`, `-k` |                      | `false` | supported platform|                             |
| `--valid-until`  |                      | 365 days |  Validity for newly created certificates |
| `--restart`  |                      | false |  Restarts Dapr control plane services (Sentry service, Operator service and Placement server) |
| `--timeout`  |                      | 300 sec |  The timeout for the certificate renewal process |
| `--ca-root-certificate`  |                      |  |  File path to user provided PEM root certificate|
| `--issuer-public-certificate`  |                      |  |  File path to user provided PEM issuer certificate|
| `--issuer-private-key`  |                      |  |  File path to user provided PEM issue private key|
| `--private-key`  |                      |  |  User provided root.key file which is used to generate root certificate|

### Examples

#### Renew certificates by generating brand new certificates
Generates new root and issuer certificates for the Kubernetes cluster with a default validity of 365 days. The certificates are not applied to the Dapr control plane.
```bash
dapr mtls renew-certificate -k
```
Generates new root and issuer certificates for the Kubernetes cluster with a default validity of 365 days and restarts the Dapr control plane services.
```bash
dapr mtls renew-certificate -k --restart
```
Generates new root and issuer certificates for the Kubernetes cluster with a given validity time.
```bash
dapr mtls renew-certificate -k --valid-until <no of days>
```
Generates new root and issuer certificates for the Kubernetes cluster with a given validity time and restarts the Dapr control plane services.
```bash
dapr mtls renew-certificate -k --valid-until <no of days> --restart
```
#### Renew certificate by using user provided certificates
Rotates certificates for the Kubernetes cluster with the provided ca.pem, issuer.pem and issuer.key file paths and restarts the Dapr control plane services
```bash
dapr mtls renew-certificate -k --ca-root-certificate <ca.pem> --issuer-private-key <issuer.key> --issuer-public-certificate <issuer.pem> --restart
```
Rotates certificates for the Kubernetes cluster with the provided ca.pem, issuer.pem and issuer.key file paths.
```bash
dapr mtls renew-certificate -k --ca-root-certificate <ca.pem> --issuer-private-key <issuer.key> --issuer-public-certificate <issuer.pem>
```
#### Renew certificates by generating brand new certificates using the provided root private key
Uses existing private root.key to generate new root and issuer certificates for the Kubernetes cluster with a given validity time for created certs.
```bash
dapr mtls renew-certificate -k --private-key myprivatekey.key --valid-until <no of days>
```
Uses the existing private root.key to generate new root and issuer certificates for the Kubernetes cluster.
```bash
dapr mtls renew-certificate -k --private-key myprivatekey.key
```