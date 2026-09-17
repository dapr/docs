---
type: docs
title: "Performance results"
linkTitle: "Performance results"
weight: 10000
description: "Performance benchmarks and charts for Dapr APIs"
---

The charts below show the performance benchmarks for the Dapr APIs on this version of Dapr, per API. Each section leads with a **throughput per resource** table (iterations/sec against the CPU and memory consumed by the app and its Dapr sidecar combined) followed by the latency, throughput, resource and data-volume charts for every scenario.

To view the results for a different Dapr version, use the version selector at the top of the docs.

## How this data is produced

Benchmarks run in the [`dapr-perf`](https://github.com/dapr/dapr/tree/master/tests/perf) suite for each Dapr release. The raw report is the source of truth and is committed to the [dapr/dapr](https://github.com/dapr/dapr/tree/master/tests/perf/report/data) repository; the rendered charts are published to the `perf-charts` branch and pulled into this page automatically. Nothing on this page is version-specific, the results shown always match the Dapr version you are viewing.

{{< dapr-perf-results >}}
