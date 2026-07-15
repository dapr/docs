# Local preview for restyle work

## macOS (works)

```bash
hugo server
# or, to force full rebuilds on every change:
hugo server --disableFastRender
```

Then open <http://localhost:1313/>. This serves from memory, compiles the Docsy
SCSS to `/scss/main.css`, and renders pages. Use Docsy's theme toggle (top nav)
to switch light/dark — it sets `data-bs-theme="dark"` on `<html>`.

Verified: Hugo `v0.162.0+extended` (Homebrew), macOS. `/scss/main.css` served at
~449 KB, HTTP 200.

## Known-broken paths (do NOT use locally)

- `npm run serve` / `npm run build:production` — invoke PostCSS/autoprefixer and
  fail with `POSTCSS: failed to transform "/scss/main.css" ... node: bad option:
  --permission`.
- Windows — same PostCSS `--permission` failure.

In dev, Docsy skips autoprefixer, so `hugo server` previews standard CSS fine.
Vendor-prefixed output only matters for the **production** build, which is
verified in CI (Hugo `0.147.9`) — CI remains authoritative for the final build.

## Content-only validation fallback

```bash
hugo list all | grep <slug>
```

Parses front-matter and the content tree without rendering CSS/templates.
