# Brand marks

Vendored logos that `diagrams/icons.mjs` inlines into the generated diagrams. Every
file is **unmodified**, byte for byte, as published by its source (`.gitattributes`
marks these files `-text` so git does not normalise line endings). The SHA-256
prefix in each row lets you check that. Do not crop, recolour, reproportion,
re-minify or "clean up" a file here: the Azure terms forbid it explicitly, and the
others expect the same. The code that inlines a mark changes only its in-memory
copy (it prefixes ids and classes, and drops the outer `<svg>`).

All marks are trademarks of their owners. A licence on the *file* does not grant
rights in the *mark*. They appear here only to name the product or language, as
`overview.png` always did.

Sources, in order of preference:

1. [Simple Icons](https://simpleicons.org), CC0 1.0, pinned to release tag `16.36.0`.
   Single-colour; the diagram tints them with `icon({ color })`.
2. Wikimedia Commons, for company logos and for full-colour marks that Simple
   Icons does not carry in the form `overview.png` shows. The file URL and licence
   are from the Commons API
   (`https://commons.wikimedia.org/w/api.php?action=query&titles=File:<name>&prop=imageinfo&iiprop=url|extmetadata&format=json`),
   read on 2026-10-26. The licence column is the one Commons records. The vendor's
   architecture-icon terms do not cover the company mark, so the AWS, Azure and
   Google Cloud icon sets are not used for these.

Add a row here for every file you add. `diagrams/icons.test.mjs` fails if a
`.svg` in this folder has no row.

| File | Mark | Source | Licence | Colour | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| `nodejs.svg` | Node.js logo with wordmark | [Commons file page](https://commons.wikimedia.org/wiki/File:Node.js_logo.svg), downloaded from https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg | MIT, author Ryan Dahl (as recorded on Commons). Node.js is a trademark of the OpenJS Foundation. | full | `dc8800bf2811` |
| `python.svg` | Python logo and wordmark | [Commons file page](https://commons.wikimedia.org/wiki/File:Python_logo_and_wordmark.svg), downloaded from https://upload.wikimedia.org/wikipedia/commons/f/f8/Python_logo_and_wordmark.svg | GPL, as recorded on Commons, marked trademarked, credited to the Python Software Foundation. Python and the logos are trademarks of the Python Software Foundation; see the PSF trademark policy. | full | `6e2d5537fdf5` |
| `dotnet.svg` | Microsoft .NET logo | [Commons file page](https://commons.wikimedia.org/wiki/File:Microsoft_.NET_logo.svg), downloaded from https://upload.wikimedia.org/wikipedia/commons/7/7d/Microsoft_.NET_logo.svg | Public domain, as recorded on Commons (author Microsoft), marked trademarked. | full | `f222062c4f59` |
| `go.svg` | Go wordmark with speed lines | [Simple Icons 16.36.0](https://github.com/simple-icons/simple-icons/blob/16.36.0/icons/go.svg), downloaded from https://raw.githubusercontent.com/simple-icons/simple-icons/16.36.0/icons/go.svg | CC0 1.0 (Simple Icons). Go and the Go logo are trademarks of Google LLC. | single | `36a745fe1558` |
| `java.svg` | Java coffee cup with wordmark | [English Wikipedia file page](https://en.wikipedia.org/wiki/File:Java_programming_language_logo.svg), downloaded from https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg | **Not freely licensed.** English Wikipedia hosts it as non-free, fair use only ("Fair use of copyrighted material in the context of Java (programming language)"). Java and the cup logo are trademarks of Oracle. **Used by maintainer decision:** dapr/website ships this same mark on an explicit maintainer decision recorded in its icons README, and the controller ruled that this repository, the same project with the same maintainers, does the same. Remove it if the maintainers withdraw that decision. | full | `ca39393cb704` |
| `cpp.svg` | C++ hexagon | [Simple Icons 16.36.0](https://github.com/simple-icons/simple-icons/blob/16.36.0/icons/cplusplus.svg), downloaded from https://raw.githubusercontent.com/simple-icons/simple-icons/16.36.0/icons/cplusplus.svg (saved as `cpp.svg`) | CC0 1.0 (Simple Icons). The C++ logo is a trademark of the Standard C++ Foundation. | single | `adf33f5026f3` |
| `php.svg` | PHP elephant-oval logo | [Simple Icons 16.36.0](https://github.com/simple-icons/simple-icons/blob/16.36.0/icons/php.svg), downloaded from https://raw.githubusercontent.com/simple-icons/simple-icons/16.36.0/icons/php.svg | CC0 1.0 (Simple Icons). The PHP logo is a trademark of the PHP Group. | single | `cd1beaa0dde7` |
| `rust.svg` | Rust gear logo | [Simple Icons 16.36.0](https://github.com/simple-icons/simple-icons/blob/16.36.0/icons/rust.svg), downloaded from https://raw.githubusercontent.com/simple-icons/simple-icons/16.36.0/icons/rust.svg | CC0 1.0 (Simple Icons). Rust and its logo are trademarks of the Rust Foundation. | single | `95a291d88876` |
| `azure.svg` | Microsoft Azure logo | [Commons file page](https://commons.wikimedia.org/wiki/File:Microsoft_Azure.svg), downloaded from https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg | Public domain, as recorded on Commons (author Microsoft Corporation), marked trademarked. Microsoft's logo terms still apply: do not crop, flip, rotate, distort or recolour. | full | `77d2e821402b` |
| `aws.svg` | Amazon Web Services logo | [Commons file page](https://commons.wikimedia.org/wiki/File:Amazon_Web_Services_Logo.svg), downloaded from https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg | Apache License 2.0, as recorded on Commons (author Amazon.com Inc.), marked trademarked. The licence covers the file, not the AWS trademarks. | full | `1f52a1d5f3c1` |
| `google-cloud.svg` | Google Cloud logo | [Commons file page](https://commons.wikimedia.org/wiki/File:Google_Cloud_logo.svg), downloaded from https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg | Public domain, as recorded on Commons (author Google), marked trademarked. | full | `0a70f8a71ec5` |
| `kubernetes.svg` | Kubernetes helm with wordmark | [Commons file page](https://commons.wikimedia.org/wiki/File:Kubernetes_logo.svg), downloaded from https://upload.wikimedia.org/wikipedia/commons/6/67/Kubernetes_logo.svg | Public domain, as recorded on Commons (author recorded as unknown), marked trademarked. Kubernetes is a trademark of The Linux Foundation. | full | `ac11ddefc7dd` |
| `logo.svg` | Dapr logo, white on dark | https://github.com/dapr/docs, in this repository since the site migration (a234e10fa) | Dapr project artwork, shipped with the dapr/docs repository (Apache-2.0). The Dapr name and logo are marks of the Dapr project. | full | `dd907d4ebd95` |
| `logo-black.svg` | Dapr logo, black | https://github.com/dapr/docs, in this repository since the site migration (a234e10fa) | As `logo.svg`. | full | `80284e879721` |
| `logo-blue.svg` | Dapr logo, blue | https://github.com/dapr/docs, in this repository since the site migration (a234e10fa) | As `logo.svg`. | full | `6828a4d9aa63` |

`logo.png` is the raster Dapr logo from the same source and is not used by the
diagrams.

## Notes

- **Google Cloud and yellow.** The official Google Cloud logo contains Google yellow
  (`#fbbc05`). It is the vendor's own mark, kept unmodified. The "never yellow" rule
  is about the diagram palette, not about third-party logos. The mark always sits on
  a `plate()`.
- **Full-colour marks need a plate.** Draw `plate({ x, y, w, h })` behind every
  full-colour mark. `--d-diagram-plate` is near-white in both themes, so the mark
  keeps the contrast its vendor designed for on the light and the dark page.
- **Java is the only mark that is not freely licensed.** Every other row has a
  licence that permits redistribution of the file itself (CC0, MIT, Apache-2.0,
  public domain or GPL as Commons records it), though the trademarks remain
  with their owners.
- **Checks on every file.** `diagrams/icons.mjs` rejects a mark that contains
  `<script>`, `<foreignObject>`, an event handler attribute, an `href` or `url()`
  that is not a same-document fragment, or a `<style>` rule that is not scoped to
  a class. Run `node --test "diagrams/**/*.test.mjs"` after adding a file.
