# Cron Binding Spec

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.cron
  metadata:
  - name: schedule
    value: "@every 15m" # valid cron schedule  
```

## Schedule Format 

The Dapr cron binding supports following formats: 

| Character |	Descriptor        | Acceptable values                             |
|:---------:|-------------------|-----------------------------------------------|
| 1	        | Second	          | 0 to 59, or *                                 |
| 2	        | Minute	          | 0 to 59, or *                                 |
| 3	        | Hour	            | 0 to 23, or * (UTC)                           |
| 4	        | Day of the month	| 1 to 31, or *                                 |
| 5	        | Month	            | 1 to 12, or *                                 |
| 6	        | Day of the week	  | 0 to 7 (where 0 and 7 represent Sunday), or * |

For example: 

* `30 * * * * *` - every 30 seconds
* `0 15 * * * *` - every 15 minutes
* `0 30 3-6,20-23 * * *` - every hour on the half hour in the range 3-6am, 8-11pm
* `CRON_TZ=America/New_York 0 0 30 04 * * *` - every day at 4:30am New York time

> You can learn more about cron and the supported formats [here](https://en.wikipedia.org/wiki/Cron)

For ease of use, the Dapr cron binding also supports few shortcuts:

* `@every 15s` where `s` is seconds, `m` minutes, and `h` hours
* `@daily` or `@hourly` which runs at that period from the time the binding is initialized  
