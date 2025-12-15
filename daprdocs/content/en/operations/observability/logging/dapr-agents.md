---
type: docs
title: "How-To: Set up logging for Dapr Agents"
linkTitle: "Dapr Agents"
weight: 2000
description: "How to set up logging for Dapr Agents"
---

## Prerequisites

You'll need to make install the required packages:

```sh
openinference-instrumentation>=0.1.42
openinference-semantic-conventions>=0.1.25
opentelemetry-api>=1.39.0
opentelemetry-exporter-otlp>=1.39.0
opentelemetry-exporter-zipkin-json>=1.39.0
opentelemetry-instrumentation-requests>=0.60b0
opentelemetry-instrumentation-grpc>=0.60b0
opentelemetry-proto>=1.39.0
```

## Setup

Dapr Agents has bindings for using OpenTelemetry for instrumentation. This means you can use a common Python logger to set the required log level (`DEBUG`, `INFO`, `WARNING` and `ERROR`):

```python
import logging

logging.basicConfig(level=logging.WARNING)
```

This log level will propagate to all third party libraries.

### OpenTelemetry integration

Dapr Agents support OpenTelemetry by setting the appropriate provider and processor:

```python
from opentelemetry import _logs
from opentelemetry.sdk._logs import LoggerProvider
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor, ConsoleLogRecordExporter
from dapr_agents.observability import DaprAgentsInstrumentor

logger_provider = LoggerProvider()
log_processor = BatchLogRecordProcessor(ConsoleLogRecordExporter())
logger_provider.add_log_record_processor(log_processor)
_logs.set_logger_provider(logger_provider)
instrumentor = DaprAgentsInstrumentor()
instrumentor.instrument(logger_provider=logger_provider, skip_dep_check=True)
```

Please refer to the current release level for the [Python SDK of OpenTelemetry](https://opentelemetry.io/docs/languages/python/) as the logs API is currently in `development` state.