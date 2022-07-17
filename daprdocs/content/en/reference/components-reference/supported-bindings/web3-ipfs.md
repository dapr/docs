---
type: docs
title: "IPFS binding spec"
linkTitle: "IPFS"
description: "Detailed documentation on the IPFS binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/web3.ipfs/"
---

This binding allows interacting with [IPFS](https://ipfs.io/), the peer-to-peer network for content distribution.

It supports connecting to the public IPFS network, or you can create a private one. This binding creates an IPFS node within Dapr, or you can use this binding to connect to an external IPFS node via its RESTful APIs.

## Setup Dapr component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.web3.ipfs
  version: v1
  metadata:
    ### Optional values:

    # - name: externalAPI
    #   # Using HTTP(S) address:
    #   value: http://127.0.0.1:5001
    #   # Using a multi-address
    #   value: /ip4/127.0.0.1/tcp/5001

    # - name: repoPath
    #   value: /var/ipfs/repo

    # - name: bootstrapNodes
    #   value: /dnsaddr/bootstrap.example.com/p2p/Qm…,/ip4/10.20.30.40/tcp/4001/p2p/Qm…

    # - name: swarmKey
    #   value: |
    #     /key/swarm/psk/1.0.0/
    #     /base16/
    #     7dbdb5a…

    # - name: routing
    #   value: dht

    # - name: storageMax
    #   value: 10GB

    # - name: storageGCWatermark
    #   value: 90

    # - name: storageGCPeriod
    #   value: 1h
```

## Spec metadata fields

| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|--------|--------|---------|
| `externalAPI` | N | Output | If set, uses an external IPFS daemon, connecting to its APIs. Can be a HTTP(S) address or a multi-address. In this case, a local node will not be started or initialized. | `http://127.0.0.1:5001` or `/ip4/127.0.0.1/tcp/5001`
| `repoPath` | N | Output | Path where to store the IPFS repository. It will be initialized automatically if needed. Defaults to the "best known path" set by IPFS. | `/var/ipfs/repo`

These metadata options are used only when first initializing a new, local repo:

| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|--------|--------|---------|
| `bootstrapNodes` | N | Output | List of bootstrap nodes, as a comma-separated string. If empty, defaults to the official bootstrap nodes provided by the IPFS project. You should not modify this unless you're using a private cluster. | `/dnsaddr/bootstrap.example.com/p2p/Qm…,/ip4/10.20.30.40/tcp/4001/p2p/Qm…`
| `swarmKey` | N | Output | Swarm key to use for connecting to private IPFS networks. If empty, the node will connect to the default, public IPFS network. Generate with [Kubuxu/go-ipfs-swarm-key-gen](https://github.com/Kubuxu/go-ipfs-swarm-key-gen). When using a swarm key, you should also configure the bootstrap nodes. | 3 lines; see example in YAML above
| `routing` | N | Output | Routing mode: `dht` (default) or `dhtclient` | `dht`
| `storageMax` | N | Output | Max local storage used. Default: the default value used by go-ipfs (currently, `10GB`) | `10GB`
| `storageGCWatermark` | N | Output | Watermark for running garbage collection, 0-100 (as a percentage). Default: the default value used by go-ipfs (currently, `90`) | `90`
| `storageGCPeriod` | N | Output | Interval for running garbage collection. Default: the default value used by go-ipfs (currently, `1h`) | `1h`

## Usage

This binding can be used with public or private IPFS networks, or you can connect to an external IPFS daemon via its RESTful APIs.

### Public IPFS network

If you don't specify any metadata option, Dapr creates an in-process IPFS node and connects to the public network automatically.

Dapr re-uses an existing repository on disk, and if it cannot find one, it will create one. If needed, you can configure the path to the local repository with the metadata key `repoPath`.

When initializing a new repository, you can configure it with these options (which are ignored if the repository already exists): `routing`, `storageMax`, `storageGCWatermark`, `storageGCPeriod`. See the table above for a description of these properties and their values.

> When connecting to the public IPFS network, setting `routing` to `dhtclient` drastically reduces network usage, although it has a slight negative impact on performance.

### Private IPFS cluster

You can also bootstrap and connect to a private IPFS cluster, for example for all your Dapr-ized applications.

To use a private IPFS cluster, configure the metadata (on a new repository) with:

- `bootstrapNodes`: a comma-separated list of multi-addresses of other IPFS nodes that are part of the private cluster
- `swarmKey`: the private key for joining the cluster. You can generate it using [Kubuxu/go-ipfs-swarm-key-gen](https://github.com/Kubuxu/go-ipfs-swarm-key-gen).

You can also set the other metadata options that are used to configure the newly-initialized repository: `routing`, `storageMax`, `storageGCWatermark`, `storageGCPeriod`.

### External IPFS node

By default, Dapr initializes an in-process IPFS node. If you prefer, you can connect to an external IPFS node that exposes RESTful APIs.

To connect to an external node, configure `externalAPI` to the HTTP(S) URL or the multi-address of the IPFS node.

When connecting to an external IPFS node, all other metadata options are ignored.

## Binding support

This component is an **output binding** that supports the following operations, modeled after commands in the IPFS CLI:

- `get`:  Retrieve a document
- `add` or `create`: Add (publish) a document in the IPFS network
- `ls` or `list`: Lists the contents of an IPFS path
- `pin-add`: Pins a document in the current IPFS node
- `pin-ls`: Lists all pinned documents in the current IPFS node
- `pin-rm` or `delete`: Un-pins a document from the current IPFS node

## Operations

### Retrieve a document

> Similar to the [`ipfs cat`](https://docs.ipfs.io/reference/cli/#ipfs-cat) command.

To retrieve data from the IPFS network, invoke the binding with the `get` operation, and specify the the object's path in the metadata:

```json
{
  "operation": "get",
  "metadata": {
    "path": "/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme"
  }
}
```

The value of `path` can be an IPFS path like in the example above, or a CID (`QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB`).

The response contains the contents of the document as the response body.

> Only files can be retrieved with this command. Retrieving a folder (e.g. `/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/`) will return an error.

Example:

```sh
curl -d '{"operation": "get", "metadata": {"path": "<path>"} }' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

### Add (publish) a document

> Similar to the [`ipfs add`](https://docs.ipfs.io/reference/cli/#ipfs-add) command.

You can add a document to the IPFS network (publishing it on the network) by invoking the binding with the `add` (or `create`) operation, and passing the document's contents in the `data` property.

```json
{
  "operation": "add",
  "data": "<data>"
}
```

You can pass options in the metadata, all optional:

- `cidVersion` (integer): version of CID to use; equivalent to the CLI option `--cid-version`. Defaults to `0` (CIDv0) unless an option that requires CIDv1 is passed.
- `pin` (boolean): whether to pin the document after adding it; equivalent to the CLI option `--pin`. Defaults to `true`.
- `hash` (string): hashing algorithm to use; equivalent to the CLI option `--hash`. Defaults to `sha2-256`.
- `inline` (boolean): inline small blocks into CIDs; equivalent to the CLI option `--inline`. Defaults to `false`.
- `inlineLimit` (integer): maximum block size to inline; equivalent to the CLI option `--inline-limit`. Defaults to `32`.

The response contains the path of the newly-added document:

Example:

```sh
curl -d '{"operation": "add", "data": "<message>", "metadata": {"pin": "true"} }' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

Example response:

```json
{
  "path": "/ipfs/Qmetmo3FinsnmxVzkgMJM8WLKGpHZDRZVZKti2WRucdnJT"
}
```

### List the contents of a path

> Similar to the [`ipfs ls`](https://docs.ipfs.io/reference/cli/#ipfs-ls) command.

To list the contents of a path, invoke the binding with the `ls` (or `list`) operation, and specify the path in the metadata

```json
{
  "operation": "ls",
  "metadata": {
    "path": "/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
  }
}
```

The value of `path` can be an IPFS path like in the example above, or a CID (`QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`).

The response contains the list of documents in that path.

Example:

```sh
curl -d '{"operation": "ls", "metadata": {"path": "<path>"} }' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

Example response (for path: `QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`):

```json
[
  {
    "name": "about",
    "size": 1677,
    "cid": "QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V",
    "type": "file"
  },
  {
    "name": "contact",
    "size": 189,
    "cid": "QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y",
    "type": "file"
  },
  {
    "name": "help",
    "size": 311,
    "cid": "QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7",
    "type": "file"
  },
  {
    "name": "quick-start",
    "size": 1717,
    "cid": "QmdncfsVm2h5Kqq9hPmU7oAVX2zTSVP3L869tgTbPYnsha",
    "type": "file"
  },
  {
    "name": "readme",
    "size": 1091,
    "cid": "QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB",
    "type": "file"
  },
  {
    "name": "security-notes",
    "size": 1016,
    "cid": "QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ",
    "type": "file"
  }
]
```

### Pin a document

> Similar to the [`ipfs pin add`](https://docs.ipfs.io/reference/cli/#ipfs-pin-add) command.

You can pin a document or folder in the current IPFS node by invoking the binding with the `pin-add` operation. Pass the object's path in the metadata:

```json
{
  "operation": "pin-add",
  "metadata": {
    "path": "/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
  }
}
```

Additional, optional, metadata options:

- `recursive` (boolean): pin directory paths recursively; equivalent to the CLI option `--recursive`. Defaults to `true`.

The response is empty.

Example:

```sh
curl -d '{"operation": "pin-add", "metadata": {"path": "<path>"} }' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

### List pinned documents

> Similar to the [`ipfs pin ls`](https://docs.ipfs.io/reference/cli/#ipfs-pin-ls) command.

To list all paths currently pinned in this node, invoke the binding with the `pin-ls` operation:

```json
{
  "operation": "pin-ls"
}
```

Additional, optional, metadata options:

- `type` (string): type of request. Possible values: `direct`, `recursive`, `indirect`, `all` (default).

The response contains the list of CIDs pinned.

Example:

```sh
curl -d '{"operation": "pin-ls" }' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

Example response:

```json
[
  {
    "cid": "QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB",
    "type": "direct"
  }
]
```

### Un-pin a document

> Similar to the [`ipfs pin rm`](https://docs.ipfs.io/reference/cli/#ipfs-pin-rm) command.

You can un-pin a document or folder in the current IPFS node by invoking the binding with the `pin-rm` operation. Pass the object's path in the metadata:

```json
{
  "operation": "pin-rm",
  "metadata": {
    "path": "/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
  }
}
```

Additional, optional, metadata options:

- `recursive` (boolean): un-pin directory paths recursively; equivalent to the CLI option `--recursive`. Defaults to `true`.

The response is empty.

Example:

```sh
curl -d '{"operation": "pin-rm", "metadata": {"path": "<path>"} }' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

> Note: un-pinning a path does not delete the documents from the IPFS node. Documents that are not pinned could be periodically purged by garbage collection.

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
