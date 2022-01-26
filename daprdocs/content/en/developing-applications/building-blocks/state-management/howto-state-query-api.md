---
type: docs
title: "How-To: Query state"
linkTitle: "How-To: Query state"
weight: 250
description: "API for querying state stores"
---

{{% alert title="alpha" color="warning" %}}
The state query API is in **alpha** stage.
{{% /alert %}}

## Introduction

The state query API provides a way of querying the key/value data stored in state store components. This query API is not a replacement for a complete query language, and is focused on retrieving, filtering and sorting key/value data that you have saved through the state management APIs.

Even though the state store is a key/value store, the `value` might be a JSON document with its own hierarchy, keys, and values.
The query API allows you to use those keys and values to retrive corresponding documents.

### Limitations
The state query API has the following limitations:

 - The API does not support querying of actor state stored in a state store. For that you need to use the query API for the specific database. See [querying actor state]({{< ref "state-management-overview.md#querying-actor-state" >}}).
 - The API does not work with Dapr [encrypted state stores]({{<ref howto-encrypt-state>}}) capability. Since the encryption is done by the Dapr runtime and stored as encrypted data, then this effectively prevents server side querying. 
 
 

You can find additional information in the [related links]({{< ref "#related-links" >}}) section.

## Querying the state

You submit query requests via HTTP POST/PUT or gRPC.
The body of the request is the JSON map with 3 entries: `filter`, `sort`, and `page`.

The `filter` is an optional section. It specifies the query conditions in the form of a tree of key/value operations, where the key is the operator and the value is the operands.

The following operations are supported:

| Operator |  Operands   | Description  |
|----------|-------------|--------------|
| `EQ`     | key:value   | key == value |
| `IN`     | key:[]value | key == value[0] OR key == value[1] OR ... OR key == value[n] |
| `AND`    | []operation |  operation[0] AND operation[1] AND ... AND operation[n] |
| `OR`     | []operation |  operation[0] OR operation[1] OR ... OR operation[n] |

If `filter` section is omitted, the query returns all entries.

The `sort` is an optional section and is an ordered array of `key:order` pairs, where `key` is a key in the state store, and the `order` is an optional string indicating sorting order: `"ASC"` for ascending and `"DESC"` for descending. If omitted, ascending order is the default.

The `page` is an optional section containing `limit` and `token` parameters. `limit` sets the page size. `token` is an iteration token returned by the component, and is used in subsequent queries.

For some background understanding, this query request is translated into the native query language and executed by the state store component.

## Example data and query

Let's look at some real examples, starting with simple and progressing towards more complex ones.

As a dataset, let's consider a [collection of with employee records](../query-api-examples/dataset.json) containing employee ID, organization, state, and city.
Notice that this dataset is an array of key/value pairs where `key` is the unique ID, and the `value` is the JSON object with employee record.
To better illustrate functionality, let's have organization name (org) and employee ID (id) as a nested JSON person object.

First, you need to create an instance of MongoDB, which is your state store.
```bash
docker run -d --rm -p 27017:27017 --name mongodb mongo:5
```

Next is to start a Dapr application. Refer to this [component configuration file](../query-api-examples/components/mongodb.yml), which instructs Dapr to use MongoDB as its state store.
```bash
dapr run --app-id demo --dapr-http-port 3500 --components-path query-api-examples/components
```

Now populate the state store with the employee dataset, so you can then query it later.
```bash
curl -X POST -H "Content-Type: application/json" -d @query-api-examples/dataset.json http://localhost:3500/v1.0/state/statestore
```

Once populated, you can examine the data in the state store. The image below a section of the MongoDB UI displaying employee records.
<table><tr><td>
    <img src="/images/state-management-query-mongodb-dataset.png" width=500 alt="Sample dataset" class="center">
</td></tr></table>

Each entry has the `_id` member as a concatenated object key, and the `value` member containing the JSON record.

The query API allows you to select records from this JSON structure.

Now you can run the queries.

### Example 1

First, let's find all employees in the state of California and sort them by their employee ID in descending order.

This is the [query](../query-api-examples/query1.json):
```json
{
    "filter": {
        "EQ": { "value.state": "CA" }
    },
    "sort": [
        {
            "key": "value.person.id",
            "order": "DESC"
        }
    ]
}
```

An equivalent of this query in SQL is:
```sql
SELECT * FROM c WHERE
  value.state = "CA"
ORDER BY
  value.person.id DESC
```

Execute the query with the following command:
{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" >}}
{{% codetab %}}
```bash
curl -s -X POST -H "Content-Type: application/json" -d @query-api-examples/query1.json http://localhost:3500/v1.0-alpha1/state/statestore/query | jq .
```
{{% /codetab %}}
{{% codetab %}}
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -InFile query-api-examples/query1.json -Uri 'http://localhost:3500/v1.0-alpha1/state/statestore/query'
```
{{% /codetab %}}
{{< /tabs >}}

The query result is an array of matching key/value pairs in the requested order:
```json
{
  "results": [
    {
      "key": "3",
      "data": {
        "person": {
          "org": "Finance",
          "id": 1071
        },
        "city": "Sacramento",
        "state": "CA"
      },
      "etag": "44723d41-deb1-4c23-940e-3e6896c3b6f7"
    },
    {
      "key": "7",
      "data": {
        "city": "San Francisco",
        "state": "CA",
        "person": {
          "id": 1015,
          "org": "Dev Ops"
        }
      },
      "etag": "0e69e69f-3dbc-423a-9db8-26767fcd2220"
    },
    {
      "key": "5",
      "data": {
        "state": "CA",
        "person": {
          "org": "Hardware",
          "id": 1007
        },
        "city": "Los Angeles"
      },
      "etag": "f87478fa-e5c5-4be0-afa5-f9f9d75713d8"
    },
    {
      "key": "9",
      "data": {
        "person": {
          "org": "Finance",
          "id": 1002
        },
        "city": "San Diego",
        "state": "CA"
      },
      "etag": "f5cf05cd-fb43-4154-a2ec-445c66d5f2f8"
    }
  ]
}
```

### Example 2

Let's now find all employees from the "Dev Ops" and "Hardware" organizations.

This is the [query](../query-api-examples/query2.json):
```json
{
    "filter": {
        "IN": { "value.person.org": [ "Dev Ops", "Hardware" ] }
    }
}
```

An equivalent of this query in SQL is:
```sql
SELECT * FROM c WHERE
  value.person.org IN ("Dev Ops", "Hardware")
```

Execute the query with the following command:
{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" >}}
{{% codetab %}}
```bash
curl -s -X POST -H "Content-Type: application/json" -d @query-api-examples/query2.json http://localhost:3500/v1.0-alpha1/state/statestore/query | jq .
```
{{% /codetab %}}
{{% codetab %}}
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -InFile query-api-examples/query2.json -Uri 'http://localhost:3500/v1.0-alpha1/state/statestore/query'
```
{{% /codetab %}}
{{< /tabs >}}

Similar to the previous example, the result is an array of matching key/value pairs.

### Example 3

In this example let's find all employees from the "Dev Ops" department
and those employees from the "Finance" departing residing in the states of Washington and California.

In addition, let's sort the results first by state in descending alphabetical order, and then by employee ID in ascending order.
Also, let's process up to 3 records at a time.

This is the [query](../query-api-examples/query3.json):

```json
{
    "filter": {
        "OR": [
            {
                "EQ": { "value.person.org": "Dev Ops" }
            },
            {
                "AND": [
                    {
                        "EQ": { "value.person.org": "Finance" }
                    },
                    {
                        "IN": { "value.state": [ "CA", "WA" ] }
                    }
                ]
            }
        ]
    },
    "sort": [
        {
            "key": "value.state",
            "order": "DESC"
        },
        {
            "key": "value.person.id"
        }
    ],
    "page": {
        "limit": 3
    }
}
```

An equivalent of this query in SQL is:
```sql
SELECT * FROM c WHERE
  value.person.org = "Dev Ops" OR
  (value.person.org = "Finance" AND value.state IN ("CA", "WA"))
ORDER BY
  value.state DESC,
  value.person.id ASC
LIMIT 3
```

Execute the query with the following command:
{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" >}}
{{% codetab %}}
```bash
curl -s -X POST -H "Content-Type: application/json" -d @query-api-examples/query3.json http://localhost:3500/v1.0-alpha1/state/statestore/query | jq .
```
{{% /codetab %}}
{{% codetab %}}
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -InFile query-api-examples/query3.json -Uri 'http://localhost:3500/v1.0-alpha1/state/statestore/query'
```
{{% /codetab %}}
{{< /tabs >}}

Upon successful execution, the state store returns a JSON object with a list of matching records and the pagination token:
```json
{
  "results": [
    {
      "key": "1",
      "data": {
        "person": {
          "org": "Dev Ops",
          "id": 1036
        },
        "city": "Seattle",
        "state": "WA"
      },
      "etag": "6f54ad94-dfb9-46f0-a371-e42d550adb7d"
    },
    {
      "key": "4",
      "data": {
        "person": {
          "org": "Dev Ops",
          "id": 1042
        },
        "city": "Spokane",
        "state": "WA"
      },
      "etag": "7415707b-82ce-44d0-bf15-6dc6305af3b1"
    },
    {
      "key": "10",
      "data": {
        "person": {
          "org": "Dev Ops",
          "id": 1054
        },
        "city": "New York",
        "state": "NY"
      },
      "etag": "26bbba88-9461-48d1-8a35-db07c374e5aa"
    }
  ],
  "token": "3"
}
```

The pagination token is used "as is" in the [subsequent query](../query-api-examples/query3-token.json) to get the next batch of records:

```json
{
    "filter": {
        "OR": [
            {
                "EQ": { "value.person.org": "Dev Ops" }
            },
            {
                "AND": [
                    {
                        "EQ": { "value.person.org": "Finance" }
                    },
                    {
                        "IN": { "value.state": [ "CA", "WA" ] }
                    }
                ]
            }
        ]
    },
    "sort": [
        {
            "key": "value.state",
            "order": "DESC"
        },
        {
            "key": "value.person.id"
        }
    ],
    "page": {
        "limit": 3,
        "token": "3"
    }
}
```

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" >}}
{{% codetab %}}
```bash
curl -s -X POST -H "Content-Type: application/json" -d @query-api-examples/query3-token.json http://localhost:3500/v1.0-alpha1/state/statestore/query | jq .
```
{{% /codetab %}}
{{% codetab %}}
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -InFile query-api-examples/query3-token.json -Uri 'http://localhost:3500/v1.0-alpha1/state/statestore/query'
```
{{% /codetab %}}
{{< /tabs >}}

And the result of this query is:
```json
{
  "results": [
    {
      "key": "9",
      "data": {
        "person": {
          "org": "Finance",
          "id": 1002
        },
        "city": "San Diego",
        "state": "CA"
      },
      "etag": "f5cf05cd-fb43-4154-a2ec-445c66d5f2f8"
    },
    {
      "key": "7",
      "data": {
        "city": "San Francisco",
        "state": "CA",
        "person": {
          "id": 1015,
          "org": "Dev Ops"
        }
      },
      "etag": "0e69e69f-3dbc-423a-9db8-26767fcd2220"
    },
    {
      "key": "3",
      "data": {
        "person": {
          "org": "Finance",
          "id": 1071
        },
        "city": "Sacramento",
        "state": "CA"
      },
      "etag": "44723d41-deb1-4c23-940e-3e6896c3b6f7"
    }
  ],
  "token": "6"
}
```
That way you can update the pagination token in the query and iterate through the results until no more records are returned.

## Related links
 - [Query API reference ]({{< ref "state_api.md#state-query" >}})
 - [State store components with those that implement query support]({{< ref supported-state-stores.md >}})
 - [State store query API implementation guide](https://github.com/dapr/components-contrib/blob/master/state/Readme.md#implementing-state-query-api)
