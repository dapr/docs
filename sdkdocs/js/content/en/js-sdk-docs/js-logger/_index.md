---
type: docs
title: "Logging in JavaScript SDK"
linkTitle: "Logging"
weight: 4000
description: Configuring logging in JavaScript SDK
---

## Introduction

The JavaScript SDK comes with a out-of-box `Console` based logger. The SDK emits various internal logs to help users understand the chain of events and troubleshoot problems. A consumer of this SDK can customize the verbosity of the log, as well as provide their own implementation for the logger.

## Configure log level

There are five levels of logging in **descending order of importance** - `error`, `warn`, `info`, `verbose`, and `debug`. Setting the log to a level means that the logger will emit all the logs that are at least as important as the mentioned level. For example, setting to `verbose` log means that the SDK will not emit `debug` level logs. The default log level is `info`.

### Dapr Client

```js
import { CommunicationProtocolEnum, DaprClient, LogLevel } from "@dapr/dapr";

// create a client instance with log level set to verbose.
const client = new DaprClient({
  daprHost,
  daprPort,
  communicationProtocol: CommunicationProtocolEnum.HTTP,
  logger: { level: LogLevel.Verbose },
});
```

> For more details on how to use the Client, see [JavaScript Client]({{% ref js-client %}}).

### DaprServer

```ts
import { CommunicationProtocolEnum, DaprServer, LogLevel } from "@dapr/dapr";

// create a server instance with log level set to error.
const server = new DaprServer({
  serverHost,
  serverPort,
  clientOptions: {
    daprHost,
    daprPort,
    logger: { level: LogLevel.Error },
  },
});
```

> For more details on how to use the Server, see [JavaScript Server]({{% ref js-server %}}).

## Custom LoggerService

The JavaScript SDK uses the in-built `Console` for logging. To use a custom logger like Winston or Pino, you can implement the `LoggerService` interface.

### Winston based logging:

Create a new implementation of `LoggerService`.

```ts
import { LoggerService } from "@dapr/dapr";
import * as winston from "winston";

export class WinstonLoggerService implements LoggerService {
  private logger;

  constructor() {
    this.logger = winston.createLogger({
      transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
    });
  }

  error(message: any, ...optionalParams: any[]): void {
    this.logger.error(message, ...optionalParams);
  }
  warn(message: any, ...optionalParams: any[]): void {
    this.logger.warn(message, ...optionalParams);
  }
  info(message: any, ...optionalParams: any[]): void {
    this.logger.info(message, ...optionalParams);
  }
  verbose(message: any, ...optionalParams: any[]): void {
    this.logger.verbose(message, ...optionalParams);
  }
  debug(message: any, ...optionalParams: any[]): void {
    this.logger.debug(message, ...optionalParams);
  }
}
```

Pass the new implementation to the SDK.

```ts
import { CommunicationProtocolEnum, DaprClient, LogLevel } from "@dapr/dapr";
import { WinstonLoggerService } from "./WinstonLoggerService";

const winstonLoggerService = new WinstonLoggerService();

// create a client instance with log level set to verbose and logger service as winston.
const client = new DaprClient({
  daprHost,
  daprPort,
  communicationProtocol: CommunicationProtocolEnum.HTTP,
  logger: { level: LogLevel.Verbose, service: winstonLoggerService },
});
```
