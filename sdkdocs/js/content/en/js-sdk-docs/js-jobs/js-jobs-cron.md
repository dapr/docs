---
type: docs
title: "Build cron schedules using the JavaScript SDK"
linkTitle: "Cron schedules"
weight: 52000
description: Use raw cron expressions, descriptors, time zones, and CronExpressionBuilder to schedule Dapr Jobs
---

Use a cron schedule for calendar-based jobs, such as a report at 09:30 every weekday. The JavaScript SDK accepts a raw schedule string or a `CronExpressionBuilder` directly in `JobOptions.schedule`. These examples target **`@dapr/dapr` 3.19.0-rc.4 or later**.

## Provide a schedule string

Dapr cron expressions use **six fields, including seconds**, not the five fields used by many Unix cron tools:

```text
second minute hour dayOfMonth month dayOfWeek
```

For example, `"0 30 9 * * 1-5"` runs at 09:30 on weekdays. Sunday is `0` and Saturday is `6`.

```javascript
await client.jobs.schedule("weekday-report", {
  schedule: "0 30 9 * * 1-5",
  data: { report: "daily" },
});
```

The snippet assumes a configured `DaprClient`. Register a matching handler in the receiving application as shown in the [how-to guide]({{% ref js-jobs-howto.md %}}).

You can also pass runtime-supported descriptors directly:

| Descriptor | Schedule |
| --- | --- |
| `@every 5m` | A fixed five-minute interval. |
| `@hourly` | The beginning of every hour. |
| `@daily` or `@midnight` | Midnight each day. |
| `@weekly` | Midnight on Sunday. |
| `@monthly` | Midnight on the first day of each month. |
| `@yearly` or `@annually` | Midnight on January 1. |

Use `dueTime` without `schedule` for a one-time job. The runtime validates raw schedule strings; the SDK does not parse them locally.

## Use CronExpressionBuilder

The fluent builder follows the .NET SDK's `on`, `through`, `each`, and `every` model, but uses string period names instead of .NET enums:

```javascript
import { CronExpressionBuilder } from "@dapr/dapr";

const schedule = new CronExpressionBuilder()
  .on("second", 0)
  .on("minute", 30)
  .on("hour", 9)
  .through("dayOfWeek", 1, 5)
  .withTimeZone("America/New_York");

console.log(schedule.toString());
// CRON_TZ=America/New_York 0 30 9 * * 1-5

await client.jobs.schedule("weekday-report", {
  schedule,
  data: { report: "daily" },
});
```

All fields initially contain `*`. An untouched builder produces `"* * * * * *"`, which matches every second, not once per minute. Set the seconds field explicitly when you want minute-level or less frequent execution.

### Periods and bounds

The exported TypeScript `CronPeriod` type accepts these names:

| Period | Integer values |
| --- | --- |
| `second` | 0-59 |
| `minute` | 0-59 |
| `hour` | 0-23 |
| `dayOfMonth` | 1-31 |
| `month` | 1-12 |
| `dayOfWeek` | 0-6, starting with Sunday |

### Builder operations

| Method | Result |
| --- | --- |
| `on(period, ...values)` | Select values, such as `on("hour", 9, 17)`. Values are sorted and deduplicated. At least one is required. |
| `through(period, from, to)` | Select an inclusive range, such as `through("dayOfWeek", 1, 5)`. `from` must be less than `to`. |
| `each(period)` | Reset a field to `*`. |
| `every(period, interval)` | Set a step expression, such as `every("minute", 15)` producing `*/15`. |
| `withTimeZone(timeZone)` | Prefix the expression with `CRON_TZ=` using a validated IANA time zone. |
| `toString()` | Return the six-field expression as a string, including its time zone if set. |

Each fluent method mutates and returns the same builder. A later call for a period **replaces** that field; it does not append another constraint. For example, `on("hour", 9).on("hour", 17)` selects only 17, while `on("hour", 9, 17)` selects both.

Values and range endpoints must be integers within the period's bounds. A step must be a positive integer no larger than the number of values in that field: up to 60 for seconds or minutes, 24 for hours, 31 for days of the month, 12 for months, and 7 for days of the week. Invalid fields or values throw `RangeError`.

Steps are cron field steps, not elapsed-time intervals. For example, `every("hour", 2)` selects every second hour of the day; it does not mean two hours after registration. Use `"@every 2h"` for an elapsed interval.

`toString()` can be used independently of the Jobs client. Passing the builder to `schedule` takes its current string value; mutating the builder afterward does not update an already stored job. Reschedule with `overwrite: true` to change the stored schedule.

## Specify a time zone

By default, Dapr evaluates a cron schedule in the Scheduler service's local time zone, not necessarily the Node.js process's time zone. Use an explicit IANA zone for a predictable wall-clock schedule:

```javascript
const schedule = new CronExpressionBuilder()
  .on("second", 0)
  .on("minute", 0)
  .on("hour", 9)
  .withTimeZone("Europe/Rome");
```

The builder validates the time zone using Node.js `Intl.DateTimeFormat`. Empty, whitespace-containing, or unrecognized names are rejected. A subsequent `withTimeZone` call replaces the previous zone.

You can also pass the runtime's time zone prefix in a raw string, for example `"CRON_TZ=Europe/Rome 0 0 9 * * *"` or `"CRON_TZ=Europe/Rome @daily"`. Use `"UTC"` when daylight saving changes are not desired. With a regional zone, Dapr evaluates the local wall-clock schedule across daylight saving transitions.

Do not combine a time zone prefix with `@every`: fixed-duration intervals do not have a wall-clock time zone and the runtime rejects that combination. See the [Jobs API reference]({{% ref jobs_api.md %}}) for runtime schedule syntax.
