# Design: Diagrid commercial offerings in Dapr Docs

**Date:** 2026-07-20
**Branch:** `docs-diagrid-commercial-offerings` (off `v1.18`)
**Repo:** dapr/docs (Hugo + Docsy)

## Goal

Update how Diagrid's commercial offerings are represented in the Dapr documentation:

1. Promote the **Integrations** section from a child of "Developing applications" to a
   top-level left-menu item.
2. Build out the **Integrations > Diagrid** subsection with light overview pages for
   Catalyst, Conductor, Dapr enterprise support, and the Dev Dashboard.
3. Reconcile with the existing top-level **Enterprise support & services** section by
   cross-linking rather than duplicating.

## Context / current state

- Integrations currently lives at `content/en/developing-applications/integrations/`
  (weight `60`), URL `/developing-applications/integrations/`. It contains 19 files
  (AWS, Azure, KEDA, Argo CD, GitHub Actions, Kratix, Kubernetes operator, Diagrid).
- The Diagrid subsection currently has only `_index.md` + `diagrid-conductor.md`.
- A separate top-level section **Enterprise support & services**
  (`content/en/enterprise-support/`, weight `70`, added in commit `8ec7607cd`) already
  provides a high-level landing covering OSS support, D3E, Conductor, and Catalyst, with
  "Learn more" buttons out to the same Diagrid docs URLs.
- The repo already uses Hugo `aliases:` front matter for URL redirects.
- Only 1 genuine external in-repo reference points at the integrations path:
  `reference/components-reference/supported-configuration-stores/azure-appconfig-configuration-store.md`.

## Decisions (confirmed with user)

- **Keep both** the enterprise-support landing and the Integrations/Diagrid detail pages,
  serving different purposes; cross-link them.
- **Light page style**: short intro + 3–5 feature highlights + a `{{< button >}}` to the
  Diagrid docs. No deep marketing copy.
- Integrations section **weight `35`** (after "Developing AI" 31, before "Operations" 40).
- Keep the folder name `Diagrid` (capitalized) as-is.

## Part 1 — Promote Integrations to top-level

- Move `content/en/developing-applications/integrations/` → `content/en/integrations/`
  (use `git mv` to preserve history for all 19 files).
- Set the section `_index.md` weight `60` → `35`.
- Add `aliases:` front matter to each moved page and section index pointing to its old
  `/developing-applications/integrations/...` URL so external/bookmarked links keep
  working. (Hugo derives URLs from file path; aliases are the repo's redirect mechanism.)
- Update the 1 external in-repo reference in
  `reference/.../azure-appconfig-configuration-store.md` to the new path.

## Part 2 — Diagrid subsection content

Under `content/en/integrations/Diagrid/`:

| File | Status | linkTitle | Learn-more target | Weight |
|---|---|---|---|---|
| `_index.md` | update | Diagrid | (landing intro listing offerings) | 1000 |
| `diagrid-dev-dashboard.md` | new | Diagrid Dev Dashboard | https://docs.diagrid.io/develop/local-development/dev-dashboard | 1000 |
| `diagrid-conductor.md` | update | Diagrid Conductor | https://docs.diagrid.io/dapr-open-source/conductor | 2000 |
| `diagrid-catalyst.md` | new | Diagrid Catalyst | https://www.diagrid.io/catalyst | 3000 |
| `diagrid-dapr-support.md` | new | Dapr enterprise support | https://docs.diagrid.io/dapr-open-source/dapr-support | 4000 |

### Page content sources (fetched 2026-07-20)

- **Catalyst** — agentic AI orchestration platform for governing, securing, and running
  agents and durable workflows in production; built on Dapr. Highlights: durable
  execution, zero-trust security (cryptographic identity + policy access control),
  framework compatibility (CrewAI, LangGraph, OpenAI Agents, Pydantic AI), built-in
  resilience, Cloud (managed) and Enterprise (self-hosted/air-gapped) deployment.
- **Conductor** — SaaS that automates and manages Dapr across Kubernetes clusters.
  Highlights: automated install/upgrade/cert-rotation, 150+ metrics with 20+ dashboards +
  app topology, 50+ best-practice/security checks (Advisor), multi-cluster control plane,
  zero-downtime/canary updates, resource usage recommendations.
- **Dapr enterprise support** — 24/7 support for open source Dapr, 1-hour response for
  critical production issues, CVSS-based security patching. Tiers: Standard, Select,
  Premium (Premium adds 24×7 and D3E coverage). Delivered by Dapr's lead maintainers.
- **Dev Dashboard** — free companion for local Dapr development; single binary for
  macOS/Linux/Windows. Highlights: app monitoring, workflow inspection with live event
  histories, component/config viewers + builder wizards, log streaming, resiliency
  builder. Works with `dapr run`, Docker Compose, TestContainers, Aspire.

## Part 3 — Reconcile with enterprise-support

In `content/en/enterprise-support/_index.md`, update the Conductor, Catalyst, and
Dapr open source support blurbs so their "Learn more" (or an added secondary) links point
to the new detailed `/integrations/Diagrid/...` pages, keeping the landing as the
high-level overview and the Integrations pages as the detail.

## Out of scope (YAGNI)

- No D3E page under Integrations (stays in enterprise-support; not requested).
- No deep marketing copy.
- No SCSS/restyle work.

## Verification

- Run `hugo server` locally (macOS SCSS compiles fine per project notes) and confirm:
  - "Integrations" appears as a top-level left-nav item.
  - The four Diagrid pages render with working Learn-more buttons.
  - Old `/developing-applications/integrations/...` URLs redirect via aliases.
  - No broken internal links (`hugo --printPathWarnings` / build has no ref errors).
