---
type: docs
title: "OCI Object Storage "
linkTitle: "OCI Object Storage "
description: Detailed information on the OCI Object Storage state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-oci-objectstorage/"
---

## Component format

To setup OCI Object Storage state store create a component of type `state.oci.objectstorage`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.oci.objectstorage
  version: v1
  metadata:
 - name: tenancyOCID
   value: <REPLACE-WITH-TENANCY-OCID>
 - name: userOCID
   value: <REPLACE-WITH-USER-OCID>
 - name: fingerPrint
   value: <REPLACE-WITH-FINGERPRINT>
 - name: privateKey
   value: |
          -----BEGIN RSA PRIVATE KEY-----
          REPLACE-WIH-PRIVATE-KEY-AS-IN-PEM-FILE
          -----END RSA PRIVATE KEY-----
 - name: region
   value: <REPLACE-WITH-OCI-REGION>
 - name: bucketName
	 value: <REPLACE-WITH-BUCKET-NAME>
 - name: compartmentOCID
   value: <REPLACE-WITH-COMPARTMENT-OCID>

```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| tenancyOCID        | Y        | The OCI tenancy identifier.  | `"ocid1.tenancy.oc1..aaaaaaaag7c7sljhsdjhsdyuwe723"`.
| userOCID         | Y        | The OCID for an OCI account (this account requires permissions to access OCI Object Storage).| `"ocid1.user.oc1..aaaaaaaaby4oyyyuqwy7623yuwe76"`
| fingerPrint         | Y        | Fingerprint of the public key.  | `"02:91:6c:49:e2:94:21:15:a7:6b:0e:a7:34:e1:3d:1b"`
| privateKey         | Y        | Private key of the RSA key pair | `"MIIEoyuweHAFGFG2727as+7BTwQRAIW4V"`
| region         | Y        | OCI Region | `"us-ashburn-1"`
| bucketName         | Y        | Name of the bucket written to and read from (and if necessary created) | `"application-state-store-bucket"`
| compartmentOCID         | Y        | The OCID for the compartment that contains the bucket | `"ocid1.compartment.oc1..aaaaaaaacsssekayyuq7asjh78"`

## Setup OCI Object Storage
The OCI Object Storage state store needs to interact through an OCI account that has permissions to create, read and delete objects through OCI Object Storage in the indicated bucket and that is allowed to create a bucket in the specified compartment if the bucket is not created beforehand. The OCI documentation [describes how to create an OCI Account](https://docs.oracle.com/en-us/iaas/Content/GSG/Tasks/addingusers.htm#Adding_Users). The interaction by the state store is performed using the public key's fingerprint and a private key from an RSA Key Pair generated for the OCI account. The [instructions for generating the key pair and getting hold of the required information](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm) are available in the OCI documentation. 

If you wish to create the bucket for Dapr to use, you can do so beforehand. However, Object Storage state provider will create one - in the specified compartment - for you automatically if it doesn't exist.

In order to setup OCI Object Storage as a state store, you will need the following properties:
- **tenancyOCID**: The identifier for the OCI cloud tenancy in which the state is to be stored.
- **userOCID**: The identifier for the account used by the state store component to connect to OCI; this must be an account with appropriate permissions on the OCI Object Storage service in the specified compartment and bucket 
- **fingerPrint**: The fingerprint for the public key in the RSA key pair generated for the account indicated by **userOCID** 
- **privateKey**: The private key in the RSA key pair generated for the account indicated by **userOCID** 
- **region**: The OCI region - for example **us-ashburn-1**, **eu-amsterdam-1**, **ap-mumbai-1**
- **bucketName**: The name of the bucket on OCI Object Storage in which state will be created. This bucket can exist already when the state store is initialized or it will be created during initialization of the state store. Note that the name of buckets is unique within a namespace
- **compartmentOCID**: The identifier of the compartment within the tenancy in which the bucket exists or will be created. 


## What Happens at Runtime?

Every state entry is represented by an object in OCI Object Storage. The OCI Object Storage state store uses the `key` property provided in the requests to the Dapr API to determine the name of the object. The `value` is stored as the (literal) content of the object. Each object is assigned a unique ETag value - whenever it is created or updated (aka overwritten).

For example, the following operation 

```shell
curl -X POST http://localhost:3500/v1.0/state \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "nihilus",
          "value": "darth"
        }
      ]'
```

will create the following object:

| Bucket | Object Name  | Object Content |
| ------------ | ------- | ----- |
| as specified with **bucketName** in components.yaml    | nihilus | darth |

You will be able to inspect all state stored through the OCI Object Storage state store by inspecting the contents of the bucket through the console, the APIs, CLI or SDKs. By going directly to the bucket, you can prepare state that will be available as state to your application at runtime.

## Concurrency

OCI Object Storage state concurrency is achieved by using `ETag`s. Each object in OCI Object Storage is assigned a unique ETag when it is created or updated (aka replaced). When the Set and Delete requests for this state store specify the FirstWrite concurrency policy, then the request need to provide the actual ETag value for the state to be written or removed for the request to be successful. 

## Consistency

OCI Object Storage state does not support Transactions.

## Query

OCI Object Storage state does not support the Query API.


## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
