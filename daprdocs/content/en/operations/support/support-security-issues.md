---
type: docs
title: "Reporting security issues"
linkTitle: "Reporting security issues "
weight: 3000
description: "How to report a security concern or vulnerability to the Dapr maintainers."
---

The Dapr project and maintainers make security a central focus of how we operate and design our software. From the Dapr binaries to the GitHub release processes, we take numerous steps to ensure user applications and data is secure. For more information on Dapr security features, visit the [security page]({{< ref security-concept.md >}}).

## Repositories and issues covered

When we say "a security vulnerability in Dapr", this means a security issue
in any repository under the [dapr GitHub organization](https://github.com/dapr/).

This reporting process is intended only for security issues in the Dapr
project itself, and doesn't apply to applications _using_ Dapr or to
issues which do not affect security.

If the issue cannot be fixed by a change to one of the covered
repositories above, then it's recommended to create a GitHub issue in the appropriate repo or raise a question in Discord.

**If you're unsure,** err on the side of caution and reach out using the reporting process before
raising your issue through GitHub, Discord, or another channel. 

### Explicitly Not Covered: Vulnerability Scanner Reports

We do not accept reports which amount to copy and pasted output from a vulnerability
scanning tool **unless** work has specifically been done to confirm that a vulnerability
reported by the tool _actually exists_ in Dapr, including the CLI, Dapr SDKs, the components-contrib repo,
or any other repo under the Dapr org.

We make use of these tools ourselves and try to act on the output they produce.
We tend to find, however, that when these reports are sent to our security
mailing list they almost always represent false positives, since these tools tend to check
for the presence of a library without considering how the library is used in context.

If we receive a report which seems to simply be a vulnerability list from a scanner, we
reserve the right to ignore it.

This applies especially when tools produce vulnerability identifiers which are not publicly
visible or which are proprietary in some way. We can look up CVEs or other publicly-available
identifiers for further details, but cannot do the same for proprietary identifiers.

## Security Contacts

The people who should have access to read your security report are listed in [`maintainers.md`](https://github.com/dapr/community/blob/master/MAINTAINERS.md).

## Reporting Process

1. Describe the issue in English, ideally with some example configuration or
   code which allows the issue to be reproduced. Explain why you believe this
   to be a security issue in Dapr.
2. Put that information into an email. Use a descriptive title.
3. Send an email to [Security (security@dapr.io)](mailto:security@dapr.io?subject=[Security%20Disclosure]:%20ISSUE%20TITLE)

## Response

Response times could be affected by weekends, holidays, breaks or time zone
differences. That said, the maintainers team endeavours to reply as
soon as possible, ideally within 3 working days.

If the team concludes that the reported issue is indeed a security
vulnerability in a Dapr project, at least two members of the maintainers
team discuss the next steps together as soon as possible, ideally
within 24 hours.

As soon as the team decides that the report is of a genuine vulnerability,
one of the team responds to the reporter acknowledging the issue and
establishing a disclosure timeline, which should be as soon as possible.

Triage, response, patching and announcement should all happen within 30 days.
