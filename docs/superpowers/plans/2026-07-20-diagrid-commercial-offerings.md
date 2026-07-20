# Diagrid Commercial Offerings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the Dapr docs **Integrations** section to a top-level left-menu item and build out the **Integrations > Diagrid** subsection with light overview pages for the Dev Dashboard, Conductor, Catalyst, and Dapr enterprise support.

**Architecture:** Pure Hugo/Docsy content change. Move the `integrations/` content directory up one level (changing its URL), preserve every old URL with `aliases:` front matter, then add/update four Diagrid pages in the established "intro + feature highlights + Learn more button" style. Finally cross-link the existing top-level Enterprise-support landing to the new detail pages.

**Tech Stack:** Hugo static site generator, Docsy theme, Markdown with Hugo shortcodes (`{{< button >}}`, `{{< ref >}}`).

## Global Constraints

- Hugo config is `hugo.yaml` at the **repo root**; all Hugo commands run from the repo root (`/Users/marcduiker/dev/dapr/docs`), not from `daprdocs/`. Content lives under `daprdocs/content/en` (mounted to `content/`).
- **Verification command (headless, tested):** from the repo root run
  `hugo --environment development --renderToMemory --logLevel error`
  The `development` environment avoids the known production PostCSS `--permission` error; `--renderToMemory` avoids writing files; a broken `{{< ref >}}` or bad front matter prints an `ERROR` line and fails the build. A task's build gate = the command exits cleanly and prints **no** `ERROR`/`REF_NOT_FOUND` lines (a clean run ends with a `Total in NNN ms` line and a page-count table). Do **not** use `hugo server` (it blocks) or `npm run serve` / `hugo --minify` (PostCSS error).
- Per-task gate is a clean dev build plus confirming the changed source file contains the expected front matter/content. Visual checks (left-nav placement/order, browser redirects) are deferred to the controller's final verification.
- URLs are lowercased by the site config: folder `Diagrid` → URL `/integrations/diagrid/`. All alias values and internal links must be **lowercase**.
- Page style is **light**: 1–2 sentence intro, 3–5 short **bold-label** feature highlights each with a one-line description, and a `{{< button >}}` to the Diagrid docs. No long marketing copy.
- Internal cross-links use the `{{< ref "filename.md" >}}` shortcode (Hugo validates it at build time and fails loudly on typos). External links use full `https://` URLs.
- Preserve git history on the move with `git mv`.
- Commit after each task. Branch: `docs-diagrid-commercial-offerings` (already created off `v1.18`).
- **Task order matters:** Task 1 relocates the tree; Tasks 2–5 create/update the four child pages; Task 6 rewrites the Diagrid landing page (whose `{{< ref >}}` links depend on Tasks 2–5 existing); Task 7 cross-links the enterprise-support landing. Do them in order so every task's build is clean.

---

### Task 1: Promote Integrations to a top-level section

Move the whole `integrations/` tree up one level, bump its weight so it appears as a top-level nav item, add aliases so old URLs keep resolving, and fix the one external in-repo reference.

**Files:**
- Move: `daprdocs/content/en/developing-applications/integrations/` → `daprdocs/content/en/integrations/` (all 19 files, `git mv`)
- Modify: `daprdocs/content/en/integrations/_index.md` (weight + alias)
- Modify (add/append `aliases:`): the relocated pages listed below **except** `Diagrid/_index.md` and `Diagrid/diagrid-conductor.md` (those get their aliases when rewritten in Tasks 6 and 3)
- Modify: `daprdocs/content/en/reference/components-reference/supported-configuration-stores/azure-appconfig-configuration-store.md`

**Interfaces:**
- Produces: new base path `/integrations/` and the Diagrid subsection path `/integrations/diagrid/` used by all later tasks.

**Alias mapping** (old URL each relocated page must keep serving):

| File (relative to `content/en/integrations/`) | `aliases:` entry to add |
|---|---|
| `_index.md` | `/developing-applications/integrations/` |
| `argo-cd.md` | `/developing-applications/integrations/argo-cd/` |
| `autoscale-keda.md` | `/developing-applications/integrations/autoscale-keda/` |
| `AWS/_index.md` | `/developing-applications/integrations/aws/` |
| `AWS/authenticating-aws.md` | `/developing-applications/integrations/aws/authenticating-aws/` (append to existing aliases) |
| `Azure/_index.md` | `/developing-applications/integrations/azure/` |
| `Azure/azure-api-management.md` | `/developing-applications/integrations/azure/azure-api-management/` |
| `Azure/azure-authentication/_index.md` | `/developing-applications/integrations/azure/azure-authentication/` |
| `Azure/azure-authentication/authenticating-azure.md` | `/developing-applications/integrations/azure/azure-authentication/authenticating-azure/` (append to existing aliases) |
| `Azure/azure-authentication/howto-aad.md` | `/developing-applications/integrations/azure/azure-authentication/howto-aad/` |
| `Azure/azure-authentication/howto-mi.md` | `/developing-applications/integrations/azure/azure-authentication/howto-mi/` (append to existing aliases) |
| `Azure/azure-authentication/howto-wif.md` | `/developing-applications/integrations/azure/azure-authentication/howto-wif/` |
| `Azure/azure-functions.md` | `/developing-applications/integrations/azure/azure-functions/` |
| `Azure/azure-kubernetes-service-extension.md` | `/developing-applications/integrations/azure/azure-kubernetes-service-extension/` |
| `github_actions.md` | `/developing-applications/integrations/github_actions/` |
| `kratix-marketplace.md` | `/developing-applications/integrations/kratix-marketplace/` |
| `kubernetes-operator.md` | `/developing-applications/integrations/kubernetes-operator/` |

- [ ] **Step 1: Move the directory (preserving history)**

```bash
cd /Users/marcduiker/dev/dapr/docs
git mv daprdocs/content/en/developing-applications/integrations daprdocs/content/en/integrations
```

- [ ] **Step 2: Bump the section weight to top-level**

Edit `daprdocs/content/en/integrations/_index.md` — change `weight: 60` to `weight: 35` and add the section alias. Result:

```yaml
---
type: docs
title: "Integrations"
linkTitle: "Integrations"
weight: 35
description: "Dapr integrations with other technologies"
aliases:
  - /developing-applications/integrations/
---
```

- [ ] **Step 3: Add/append aliases to the relocated pages**

For each row in the Alias mapping table above (excluding `_index.md`, done in Step 2, and excluding the two Diagrid files handled in Tasks 3/6):
- If the file has **no** `aliases:` block, add one directly under the front-matter fields:
  ```yaml
  aliases:
    - /developing-applications/integrations/<...>/
  ```
- If the file **already has** an `aliases:` block (`AWS/authenticating-aws.md`, `Azure/azure-authentication/authenticating-azure.md`, `Azure/azure-authentication/howto-mi.md`), append the new entry as an additional list item; do not remove existing entries.

- [ ] **Step 4: Fix the external in-repo reference**

In `daprdocs/content/en/reference/components-reference/supported-configuration-stores/azure-appconfig-configuration-store.md`, both occurrences (lines ~55–56) link to `https://docs.dapr.io/developing-applications/integrations/azure/azure-authentication/authenticating-azure/`. Replace with `https://docs.dapr.io/integrations/azure/azure-authentication/authenticating-azure/`.

```bash
sed -i '' 's#docs.dapr.io/developing-applications/integrations/#docs.dapr.io/integrations/#g' \
  daprdocs/content/en/reference/components-reference/supported-configuration-stores/azure-appconfig-configuration-store.md
```

- [ ] **Step 5: Build and verify**

```bash
hugo --environment development --renderToMemory --logLevel error
```
Expected: build succeeds with no `REF_NOT_FOUND` errors. In the browser, confirm **Integrations** is a top-level left-nav item (between "Developing AI with Dapr" and "Deploying and configuring…"), and that `http://localhost:1313/developing-applications/integrations/` redirects to `/integrations/`. Stop the server (Ctrl-C).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Promote Integrations to a top-level docs section with URL aliases

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Create the Diagrid Dev Dashboard page

**Files:**
- Create: `daprdocs/content/en/integrations/Diagrid/diagrid-dev-dashboard.md`

**Interfaces:**
- Consumes: `/integrations/diagrid/` path from Task 1.
- Produces: page resolvable as `{{< ref diagrid-dev-dashboard.md >}}`.

- [ ] **Step 1: Create the file**

```markdown
---
type: docs
title: "Diagrid Dev Dashboard"
linkTitle: "Diagrid Dev Dashboard"
description: "A free companion for local Dapr development that gives real-time visibility into your Dapr applications"
weight: 1000
---

[Diagrid Dev Dashboard](https://docs.diagrid.io/develop/local-development/dev-dashboard) is a free companion for local Dapr development. It automatically discovers Dapr applications running on your machine and provides visualization and inspection tools to speed up your development workflow. It is distributed as a single binary for macOS, Linux, and Windows.

**Application monitoring**

Track all running Dapr apps with details on health, ports, PIDs, and runtime information.

**Workflow inspection**

View workflow executions across your apps with live event histories and execution status.

**Component and configuration viewers**

Browse Dapr components and configurations, and use builder wizards to create component and resiliency policy definitions without hand-editing YAML.

**Log streaming**

Stream real-time sidecar and application logs with filtering and highlighting.

The Dev Dashboard works with applications started through `dapr run`, Docker Compose, TestContainers, or Aspire.

{{< button text="Learn more about the Diagrid Dev Dashboard" link="https://docs.diagrid.io/develop/local-development/dev-dashboard" >}}
```

- [ ] **Step 2: Build and verify**

```bash
hugo --environment development --renderToMemory --logLevel error
```
Expected: build succeeds. Confirm the page renders at `/integrations/diagrid/diagrid-dev-dashboard/` and the Learn-more button works. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add daprdocs/content/en/integrations/Diagrid/diagrid-dev-dashboard.md
git commit -m "Add Diagrid Dev Dashboard integration page

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Update the Diagrid Conductor page

**Files:**
- Modify: `daprdocs/content/en/integrations/Diagrid/diagrid-conductor.md`

**Interfaces:**
- Consumes: `/integrations/diagrid/` path from Task 1.
- Produces: page resolvable as `{{< ref diagrid-conductor.md >}}`.

- [ ] **Step 1: Replace the file contents**

Updates the Learn-more link to the Diagrid docs URL, refreshes the feature highlights, and adds the alias for its old URL (this file was intentionally skipped in Task 1).

```markdown
---
type: docs
title: "Diagrid Conductor"
linkTitle: "Diagrid Conductor"
description: "Automate operations, enforce best practices, and gain observability across your Dapr clusters"
weight: 2000
aliases:
  - /developing-applications/integrations/diagrid/diagrid-conductor/
---

<br /><img src="/images/diagrid-conductor.png" alt="Diagrid Conductor diagram" width="800">

[Diagrid Conductor](https://docs.diagrid.io/dapr-open-source/conductor) is a SaaS platform that automates and manages Dapr deployments across your Kubernetes clusters, delivering operational excellence, security and reliability, and insights and collaboration from development through production.

**Automated operations**

One-click installation, upgrades, certificate rotation, and configuration synchronization keep Dapr up to date across all your clusters, with scheduled and canary updates for zero downtime.

**Advisor: discover and apply best practices**

Continuous checks against 50+ production standards catch security misconfigurations and optimization opportunities before they reach production.

**Deep observability**

150+ metrics with 20+ built-in dashboards, plus a dynamic application graph that visualizes your services and infrastructure components.

**Resource usage reporting**

Recommendations based on past resource behavior lead to significant CPU and memory cost savings.

{{< button text="Learn more about Diagrid Conductor" link="https://docs.diagrid.io/dapr-open-source/conductor" >}}
```

- [ ] **Step 2: Build and verify**

```bash
hugo --environment development --renderToMemory --logLevel error
```
Expected: build succeeds. Confirm the page renders with the Conductor image and the button links to `docs.diagrid.io/dapr-open-source/conductor`, and that `/developing-applications/integrations/diagrid/diagrid-conductor/` redirects. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add daprdocs/content/en/integrations/Diagrid/diagrid-conductor.md
git commit -m "Refresh Diagrid Conductor integration page

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Create the Diagrid Catalyst page

**Files:**
- Create: `daprdocs/content/en/integrations/Diagrid/diagrid-catalyst.md`

**Interfaces:**
- Consumes: `/integrations/diagrid/` path from Task 1.
- Produces: page resolvable as `{{< ref diagrid-catalyst.md >}}`.

- [ ] **Step 1: Create the file**

```markdown
---
type: docs
title: "Diagrid Catalyst"
linkTitle: "Diagrid Catalyst"
description: "An agentic AI orchestration platform for governing, securing, and running agents and durable workflows in production"
weight: 3000
---

[Diagrid Catalyst](https://www.diagrid.io/catalyst) is an agentic AI orchestration platform for governing, securing, and running agents and durable workflows in production. Built on open source Dapr, it adds production-grade governance, security, and durability for AI workloads while remaining compatible with popular agent frameworks.

**Durable execution**

Agents and workflows automatically resume from failures — from simple restarts to complete system outages — with checkpointing and self-recovery built in.

**Zero-trust security**

Issue cryptographic identities to agents, MCP servers, and tools, and apply policy-based access control across your organization.

**Framework compatibility**

Works with existing agent frameworks such as CrewAI, LangGraph, OpenAI Agents, and Pydantic AI, across any language or cloud.

**Flexible deployment**

Available as Catalyst Cloud, a fully managed serverless platform, or Catalyst Enterprise for self-hosted and air-gapped environments.

{{< button text="Learn more about Diagrid Catalyst" link="https://www.diagrid.io/catalyst" >}}
{{< button text="Compare Dapr and Catalyst" link="https://docs.diagrid.io/dapr-open-source/dapr-vs-catalyst" color="secondary" >}}
```

- [ ] **Step 2: Build and verify**

```bash
hugo --environment development --renderToMemory --logLevel error
```
Expected: build succeeds. Confirm the page renders at `/integrations/diagrid/diagrid-catalyst/` with both buttons working. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add daprdocs/content/en/integrations/Diagrid/diagrid-catalyst.md
git commit -m "Add Diagrid Catalyst integration page

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Create the Dapr enterprise support page

**Files:**
- Create: `daprdocs/content/en/integrations/Diagrid/diagrid-dapr-support.md`

**Interfaces:**
- Consumes: `/integrations/diagrid/` path from Task 1.
- Produces: page resolvable as `{{< ref diagrid-dapr-support.md >}}`.

- [ ] **Step 1: Create the file**

```markdown
---
type: docs
title: "Dapr enterprise support"
linkTitle: "Dapr enterprise support"
description: "Commercial 24/7 support for open source Dapr from the project's lead maintainers"
weight: 4000
---

[Dapr enterprise support](https://docs.diagrid.io/dapr-open-source/dapr-support) from Diagrid provides commercial 24/7 support for open source Dapr, delivered by the project's lead maintainers. It is available across three tiers so you can match the level of support to your production needs.

**Guaranteed response times**

A one-hour response time for critical production issues, with severity-based service-level agreements.

**Security patching**

CVE patching prioritized by CVSS score, including custom builds with fixes backported to your version.

**Support tiers**

Choose from Standard, Select, and Premium. Premium adds 24×7 coverage and support for the Diagrid Dapr Distribution for Enterprise (D3E).

**Expert guidance**

Architecture reviews and tailored training sessions from the engineers who build Dapr.

{{< button text="Learn more about Dapr enterprise support" link="https://docs.diagrid.io/dapr-open-source/dapr-support" >}}
```

- [ ] **Step 2: Build and verify**

```bash
hugo --environment development --renderToMemory --logLevel error
```
Expected: build succeeds. Confirm the page renders at `/integrations/diagrid/diagrid-dapr-support/` and the Learn-more button works. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add daprdocs/content/en/integrations/Diagrid/diagrid-dapr-support.md
git commit -m "Add Dapr enterprise support integration page

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Update the Diagrid subsection landing page

**Files:**
- Modify: `daprdocs/content/en/integrations/Diagrid/_index.md`

**Interfaces:**
- Consumes: the four Diagrid pages from Tasks 2–5 (referenced via `{{< ref >}}`) and `/integrations/diagrid/` from Task 1.

- [ ] **Step 1: Replace the file contents**

```markdown
---
type: docs
title: "Integrations with Diagrid"
linkTitle: "Diagrid"
description: "Dapr tooling and commercial offerings from Diagrid"
weight: 1000
aliases:
  - /developing-applications/integrations/diagrid/
---

[Diagrid](https://www.diagrid.io/) is a leading contributor to the Dapr project and offers a range of tooling and commercial products that build on open source Dapr. The pages in this section describe the Diagrid offerings you can use alongside your Dapr applications:

- [**Diagrid Dev Dashboard**]({{< ref diagrid-dev-dashboard.md >}}) — a free companion for local Dapr development.
- [**Diagrid Conductor**]({{< ref diagrid-conductor.md >}}) — automated operations and observability for Dapr on Kubernetes.
- [**Diagrid Catalyst**]({{< ref diagrid-catalyst.md >}}) — an agentic AI orchestration platform built on Dapr.
- [**Dapr enterprise support**]({{< ref diagrid-dapr-support.md >}}) — commercial support for open source Dapr.

For a high-level overview of commercial support and managed services across the Dapr ecosystem, see the [Enterprise support & services]({{< ref "enterprise-support" >}}) section.
```

- [ ] **Step 2: Build and verify**

```bash
hugo --environment development --renderToMemory --logLevel error
```
Expected: build succeeds with **no** `REF_NOT_FOUND` — all five `{{< ref >}}` links resolve. Confirm the Diagrid subsection lists all four child pages in order: Dev Dashboard, Conductor, Catalyst, Dapr enterprise support. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add daprdocs/content/en/integrations/Diagrid/_index.md
git commit -m "Update Diagrid integrations landing page

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Cross-link the Enterprise-support landing to the detail pages

Keep the top-level Enterprise-support section as the high-level overview, but point readers to the new detailed Integrations/Diagrid pages.

**Files:**
- Modify: `daprdocs/content/en/enterprise-support/_index.md`

**Interfaces:**
- Consumes: the four Diagrid pages from Tasks 2–5, referenced via `{{< ref >}}`.

- [ ] **Step 1: Add cross-link sentences**

In `daprdocs/content/en/enterprise-support/_index.md`, add a one-line cross-link immediately after the existing `{{< button >}}` line for each relevant section, using `{{< ref >}}` so Hugo validates the targets:

- After the **Dapr open source support** button, add:
  ```markdown
  See the [Dapr enterprise support]({{< ref diagrid-dapr-support.md >}}) integration page for a summary.
  ```
- After the **Diagrid Conductor** button, add:
  ```markdown
  See the [Diagrid Conductor]({{< ref diagrid-conductor.md >}}) integration page for a summary.
  ```
- After the **Diagrid Catalyst** buttons, add:
  ```markdown
  See the [Diagrid Catalyst]({{< ref diagrid-catalyst.md >}}) integration page for a summary.
  ```

Leave the **D3E** section unchanged (no Integrations page for D3E — it lives only here).

- [ ] **Step 2: Build and verify**

```bash
hugo --environment development --renderToMemory --logLevel error
```
Expected: build succeeds, no `REF_NOT_FOUND`. Confirm the three cross-links render and navigate to the correct Integrations/Diagrid pages. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add daprdocs/content/en/enterprise-support/_index.md
git commit -m "Cross-link enterprise support landing to Diagrid integration pages

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Final verification

- [ ] From the repo root, run the headless dev build (`hugo --environment development --renderToMemory --logLevel error`) and separately `hugo server` for a visual pass. Confirm:
  - Build completes with no `REF_NOT_FOUND` or other errors.
  - **Integrations** is a top-level left-nav item.
  - The **Diagrid** subsection shows: Dev Dashboard, Conductor, Catalyst, Dapr enterprise support (in that order).
  - Spot-check that a few old URLs redirect, e.g. `/developing-applications/integrations/`, `/developing-applications/integrations/diagrid/diagrid-conductor/`, `/developing-applications/integrations/azure/azure-authentication/authenticating-azure/`.
  - All Learn-more buttons and cross-links resolve.
