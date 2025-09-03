---
type: docs
title: "Alibaba Cloud TableStore"
linkTitle: "Alibaba Cloud TableStore"
description: "Detailed information on the Alibaba Cloud TableStore state store component for use with Dapr"
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-alicloud-tablestore/"
---

## Component format

To set up an Alibaba Cloud TableStore state store, create a component of type `state.alicloud.tablestore`.
See [this guide]({{% ref "howto-get-save-state.md#step-1-setup-a-state-store" %}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.alicloud.tablestore
  version: v1
  metadata:
  - name: endpoint
    value: <REPLACE-WITH-ENDPOINT>
  - name: instanceName
    value: <REPLACE-WITH-INSTANCE-NAME>
  - name: tableName
    value: <REPLACE-WITH-TABLE-NAME>
  - name: accessKeyID
    value: <REPLACE-WITH-ACCESS-KEY-ID>
  - name: accessKey
    value: <REPLACE-WITH-ACCESS-KEY>
````

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings.
It is recommended to use a secret store for the secrets as described [here]({{% ref component-secrets.md %}}).
{{% /alert %}}

## Spec metadata fields

| Field          | Required | Details                                                                           | Example                             |
| -------------- | :------: | --------------------------------------------------------------------------------- | ----------------------------------- |
| `endpoint`     |     Y    | The endpoint of the Alibaba Cloud TableStore instance                                  | `"https://tablestore.aliyuncs.com"` |
| `instanceName` |     Y    | The name of the Alibaba Cloud TableStore instance                                      | `"my_instance"`                     |
| `tableName`    |     Y    | The name of the table to use for Dapr state. Will be created if it does not exist | `"my_table"`                        |
| `accessKeyID`  |     Y    | The access key ID for authentication                                              | `"my_access_key_id"`                |
| `accessKey`    |     Y    | The access key for authentication                                                 | `"my_access_key"`                   |

---

## Authentication

Alibaba Cloud TableStore supports authentication using an **Access Key** and **Access Key ID**.

You can also use Dapr's \[secret store]\({{% ref component-secrets.md %}}) to securely store these values instead of including them directly in the YAML file.

Example using secret references:

```yaml
- name: accessKeyID
  secretKeyRef:
    name: alicloud-secrets
    key: accessKeyID
- name: accessKey
  secretKeyRef:
    name: alicloud-secrets
    key: accessKey
```

---


## Related links
- [Basic schema for a Dapr component]({{% ref component-schema %}})
- Read [this guide]({{% ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" %}}) for instructions on configuring state store components
- [State management building block]({{% ref state-management %}})
