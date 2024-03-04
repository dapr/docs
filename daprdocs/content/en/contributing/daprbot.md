---
type: docs
title: "Dapr bot reference"
linkTitle: "Dapr bot"
weight: 15
description: "List of Dapr bot capabilities."
---

Dapr bot is triggered by a list of commands that helps with common tasks in the Dapr organization. It is set up individually for each repository ([example](https://github.com/dapr/dapr/blob/master/.github/workflows/dapr-bot.yml)) and can be configured to run on specific events. Below is a list of commands and the list of repositories they are implemented on.

## Command reference

| Command          | Target                | Description                                                                                              | Who can use                                                                                     | Repository                             |
| ---------------- | --------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------- |
| `/assign`        | Issue                 | Assigns an issue to a user or group of users                                                             | Anyone                                                                                          | `dapr`, `docs`, `quickstarts`, `cli`, `components-contrib`, `go-sdk`, `js-sdk`, `java-sdk`, `python-sdk`, `dotnet-sdk` |
| `/ok-to-test`    | Pull request          | `dapr`: trigger end to end tests <br/> `components-contrib`: trigger conformance and certification tests | Users listed in the [bot](https://github.com/dapr/dapr/blob/master/.github/scripts/dapr_bot.js) | `dapr`, `components-contrib`           |
| `/ok-to-perf`    | Pull request          | Trigger performance tests.                                                                               | Users listed in the [bot](https://github.com/dapr/dapr/blob/master/.github/scripts/dapr_bot.js) | `dapr`                                 |
| `/make-me-laugh` | Issue or pull request | Posts a random joke                                                                                      | Users listed in the [bot](https://github.com/dapr/dapr/blob/master/.github/scripts/dapr_bot.js) | `dapr`, `components-contrib`           |

## Label reference

You can query issues created by the Dapr bot by using the `created-by/dapr-bot` label ([query](https://github.com/search?q=org%3Adapr%20is%3Aissue%20label%3Acreated-by%2Fdapr-bot%20&type=issues)).

| Label                    | Target                | What does it do?                                                 | Repository           |
| ------------------------ | --------------------- | ---------------------------------------------------------------- | -------------------- |
| `docs-needed`            | Issue                 | Creates a new issue in `dapr/docs` to track doc work             | `dapr`               |
| `sdk-needed`             | Issue                 | Creates new issues across the SDK repos to track SDK work        | `dapr`               |
| `documentation required` | Issue or pull request | Creates a new issue in `dapr/docs` to track doc work             | `components-contrib` |
| `new component`          | Issue or pull request | Creates a new issue in `dapr/dapr` to register the new component | `components-contrib` |
