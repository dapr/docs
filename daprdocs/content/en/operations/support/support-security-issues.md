---
type: docs
title: "Reporting security issues"
linkTitle: "Reporting security issues "
weight: 3000
description: "How to report a security concern or vulnerability to the Dapr maintainers."
---

The Dapr organization and team makes security a central focus of how we operate and design our software. From the Dapr binaries to the GitHub release processes, we take numerous steps to ensure user applications and data is secure. For more information visit the [security page]({{< ref security-concept.md >}}).

## Reporting security issues

To report a security issue there are two options:
1. Disclose privately to the [Dapr Maintainers (dapr@dapr.io)](mailto:dapr@dapr.io?subject=[Security%20Disclosure]:%20ISSUE%20TITLE)
   - Use this option if you find an issue in Dapr that needs to be patched ASAP.
   - The Dapr maintainers will triage, patch, and send an annoucement within 30 days.
1. Report publicly via [GitHub issue](https://github.com/dapr/dapr/issues/new/choose)
   - Use this option if there is a Dapr dependency or software package that needs to be patched or investigated (*eg. CodeCov disclosed a breach of their GitHub Action in April 2021).
   - The Dapr maintainers will triage, resolve, and update the GitHub issue ASAP. Announcements will be made on a case-by-case basis.