---
type: docs
title: "mtls renew certificate CLI command reference"
linkTitle: "mtls renew certificate"
description: "Detailed information on the mtls renew certificate CLI command"
weight: 3000
---

### Description
This command can be used to renew expiring Dapr certificates in Kubernetes cluster.
It renews root CA certificate, issuer certificate and issuer key.

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
| `--kubernetes`, `-k` |                      | `false` | supprted platform|                             |
| `--valid-until`  |                      | 365 days |  Validity for newly created certificates |
| `--restart`  |                      | false |  Restarts Dapr control plane services (Sentry service, Operator service and Placement server) |
| `--timeout`  |                      | 300 sec |  The timeout for the certificate renewal process |
| `--ca-root-certificate`  |                      |  |  User provided root certificate pem file path|
| `--issuer-public-certificate`  |                      |  |  User provided issuer certificate pem file path|
| `--issuer-private-key`  |                      |  |  User provided issue private key file path|
| `--private-key`  |                      |  |  User provided root.key file which is used to generate root certificate|

### Examples

#### Renew certificates by generating fresh new certificates
Generates new root and issuer certificates for Dapr kubernetes cluster with a default validity of 365 days.
```bash
dapr mtls renew-certificate -k
```
Generates new root and issuer certificates for kubernetes cluster with a default validity of 365 days and restart the control plane services.
```bash
dapr mtls renew-certificate -k --restart
```
Generates new root and issuer certificates for kubernetes cluster with a given validity.
```bash
dapr mtls renew-certificate -k --valid-until <no of days>
```
Generates new root and issuer certificates for kubernetes cluster with a given validity and restart the control place services.
```bash
dapr mtls renew-certificate -k --valid-until <no of days> --restart
```
#### Renew certificate by using user provided certificates
Rotates certificate of your kubernetes cluster with provided ca.pem, issuer.pem and issuer.key file path and restart the control plane services
```bash
dapr mtls renew-certificate -k --ca-root-certificate <ca.pem> --issuer-private-key <issuer.key> --issuer-public-certificate <issuer.pem> --restart
```
Rotates certificate of your kubernetes cluster with provided ca.pem, issuer.pem and issuer.key file path.
```bash
dapr mtls renew-certificate -k --ca-root-certificate <ca.pem> --issuer-private-key <issuer.key> --issuer-public-certificate <issuer.pem>
```
#### Renew certificates by generating fresh certificates using provided root private key
Uses existing private root.key to generate new root and issuer certificates for kubernetes cluster with a given validity for created certs.
```bash
dapr mtls renew-certificate -k --private-key myprivatekey.key --valid-until <no of days>
```
Uses existing private root.key to generate new root and issuer certificates for kubernetes cluster with a default validity of 365 days for created certs.
```bash
dapr mtls renew-certificate -k --private-key myprivatekey.key
```