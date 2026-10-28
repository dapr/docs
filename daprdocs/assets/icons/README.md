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

Go and PHP were Simple Icons single-colour marks and are now the full-colour
Commons files; Kubernetes went the other way, from the Commons wordmark to the
Simple Icons helm, which the diagram tints with the brand blue and names beside
itself. All three are byte-identical to the files dapr.io vendors at
`assets/images/icons/`, so the two diagrams show the same logos.

Add a row here for every file you add. `diagrams/icons.test.mjs` fails if a
`.svg` in this folder has no row.

| File | Mark | Source | Licence | Colour | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| `nodejs.svg` | Node.js logo with wordmark | [Commons file page](https://commons.wikimedia.org/wiki/File:Node.js_logo.svg), downloaded from https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg | MIT, author Ryan Dahl (as recorded on Commons). Node.js is a trademark of the OpenJS Foundation. | full | `dc8800bf2811` |
| `python.svg` | Python logo and wordmark | [Commons file page](https://commons.wikimedia.org/wiki/File:Python_logo_and_wordmark.svg), downloaded from https://upload.wikimedia.org/wikipedia/commons/f/f8/Python_logo_and_wordmark.svg | GPL, as recorded on Commons, marked trademarked, credited to the Python Software Foundation. Python and the logos are trademarks of the Python Software Foundation; see the PSF trademark policy. | full | `6e2d5537fdf5` |
| `dotnet.svg` | Microsoft .NET logo | [Commons file page](https://commons.wikimedia.org/wiki/File:Microsoft_.NET_logo.svg), downloaded from https://upload.wikimedia.org/wikipedia/commons/7/7d/Microsoft_.NET_logo.svg | Public domain, as recorded on Commons (author Microsoft), marked trademarked. | full | `f222062c4f59` |
| `go.svg` | Go logo, blue wordmark with speed lines | [Commons file page](https://commons.wikimedia.org/wiki/File:Go_Logo_Blue.svg), downloaded from https://upload.wikimedia.org/wikipedia/commons/0/05/Go_Logo_Blue.svg | Public domain, as recorded on Commons (author The Go Authors), marked trademarked. Go and the Go logo are trademarks of Google LLC. | full | `70388e1c0dc7` |
| `java.svg` | Java coffee cup with wordmark | [English Wikipedia file page](https://en.wikipedia.org/wiki/File:Java_programming_language_logo.svg), downloaded from https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg | **Not freely licensed.** English Wikipedia hosts it as non-free, fair use only ("Fair use of copyrighted material in the context of Java (programming language)"). Java and the cup logo are trademarks of Oracle. **Used by maintainer decision:** dapr/website ships this same mark on an explicit maintainer decision recorded in its icons README, and the controller ruled that this repository, the same project with the same maintainers, does the same. Remove it if the maintainers withdraw that decision. | full | `ca39393cb704` |
| `consul.svg` | HashiCorp Consul logo, no wordmark | [Simple Icons 16.36.0](https://github.com/simple-icons/simple-icons/blob/16.36.0/icons/consul.svg), downloaded from https://raw.githubusercontent.com/simple-icons/simple-icons/16.36.0/icons/consul.svg | CC0 1.0 (Simple Icons). Consul is a trademark of HashiCorp. | single | `e02fc7a81731` |
| `cpp.svg` | C++ hexagon | [Simple Icons 16.36.0](https://github.com/simple-icons/simple-icons/blob/16.36.0/icons/cplusplus.svg), downloaded from https://raw.githubusercontent.com/simple-icons/simple-icons/16.36.0/icons/cplusplus.svg (saved as `cpp.svg`) | CC0 1.0 (Simple Icons). The C++ logo is a trademark of the Standard C++ Foundation. | single | `adf33f5026f3` |
| `php.svg` | PHP logo, purple wordmark in an oval | [Commons file page](https://commons.wikimedia.org/wiki/File:PHP-logo.svg), downloaded from https://upload.wikimedia.org/wikipedia/commons/2/27/PHP-logo.svg | Public domain, as recorded on Commons (author Colin Viebrock). The PHP logo is a trademark of the PHP Group. | full | `bf8b7e48afe9` |
| `redis.svg` | Redis logo, no wordmark | [Simple Icons 16.36.0](https://github.com/simple-icons/simple-icons/blob/16.36.0/icons/redis.svg), downloaded from https://raw.githubusercontent.com/simple-icons/simple-icons/16.36.0/icons/redis.svg | CC0 1.0 (Simple Icons). Redis and the Redis logo are trademarks of Redis Ltd. | single | `428b86deb14c` |
| `rust.svg` | Rust gear logo | [Simple Icons 16.36.0](https://github.com/simple-icons/simple-icons/blob/16.36.0/icons/rust.svg), downloaded from https://raw.githubusercontent.com/simple-icons/simple-icons/16.36.0/icons/rust.svg | CC0 1.0 (Simple Icons). Rust and its logo are trademarks of the Rust Foundation. | single | `95a291d88876` |
| `azure.svg` | Microsoft Azure logo | [Commons file page](https://commons.wikimedia.org/wiki/File:Microsoft_Azure.svg), downloaded from https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg | Public domain, as recorded on Commons (author Microsoft Corporation), marked trademarked. Microsoft's logo terms still apply: do not crop, flip, rotate, distort or recolour. | full | `77d2e821402b` |
| `alibaba-cloud.svg` | Alibaba Cloud logo, no wordmark | [Simple Icons 16.36.0](https://github.com/simple-icons/simple-icons/blob/16.36.0/icons/alibabacloud.svg), downloaded from https://raw.githubusercontent.com/simple-icons/simple-icons/16.36.0/icons/alibabacloud.svg (saved as `alibaba-cloud.svg`) | CC0 1.0 (Simple Icons). Alibaba Cloud and its logo are trademarks of Alibaba Group. | single | `c8b18c07ebc4` |
| `aws.svg` | Amazon Web Services logo | [Commons file page](https://commons.wikimedia.org/wiki/File:Amazon_Web_Services_Logo.svg), downloaded from https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg | Apache License 2.0, as recorded on Commons (author Amazon.com Inc.), marked trademarked. The licence covers the file, not the AWS trademarks. | full | `1f52a1d5f3c1` |
| `google-cloud.svg` | Google Cloud logo | [Commons file page](https://commons.wikimedia.org/wiki/File:Google_Cloud_logo.svg), downloaded from https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg | Public domain, as recorded on Commons (author Google), marked trademarked. | full | `0a70f8a71ec5` |
| `kubernetes.svg` | Kubernetes helm, no wordmark | [Simple Icons 16.36.0](https://github.com/simple-icons/simple-icons/blob/16.36.0/icons/kubernetes.svg), downloaded from https://raw.githubusercontent.com/simple-icons/simple-icons/16.36.0/icons/kubernetes.svg | CC0 1.0 (Simple Icons). Kubernetes and its logo are trademarks of The Linux Foundation. | single | `ceee2f4e87fa` |
| `logo.svg` | Dapr logo, white on dark | https://github.com/dapr/docs, in this repository since the site migration (a234e10fa) | Dapr project artwork, shipped with the dapr/docs repository (Apache-2.0). The Dapr name and logo are marks of the Dapr project. | full | `dd907d4ebd95` |
| `logo-black.svg` | Dapr logo, black | https://github.com/dapr/docs, in this repository since the site migration (a234e10fa) | As `logo.svg`. | full | `80284e879721` |
| `logo-blue.svg` | Dapr logo, blue | https://github.com/dapr/docs, in this repository since the site migration (a234e10fa) | As `logo.svg`. | full | `6828a4d9aa63` |

`logo.png` is the raster Dapr logo from the same source and is not used by the
diagrams.

## Fluent UI System Icons

The glyphs inside the API tiles, one per Dapr API. The homepage diagrams on
dapr.io draw this same set in its `apis` scene, and the homepage's API cards use
it too, so these files are copied byte for byte from
[`dapr/website`](https://github.com/dapr/website) at
`assets/images/icons/fluent-*.svg`, where they were fetched from the
[Iconify API](https://api.iconify.design) as `/fluent/<name>-24-regular.svg`
(the 24px regular weight). Upstream is
[microsoft/fluentui-system-icons](https://github.com/microsoft/fluentui-system-icons).

Every one is a single `<path fill="currentColor">` on a 24x24 viewBox, so
`icons.mjs` treats them as single-colour marks and `icon({ color })` tints them.
They need no plate.

**Licence for every row below:** MIT, Copyright (c) 2020 Microsoft Corporation,
as [`LICENSE`](https://github.com/microsoft/fluentui-system-icons/blob/main/LICENSE)
records it, read on 2026-10-28. The repository states no additional trademark or
asset terms. The full notice is under [LICENSES](#licenses).

| File | Glyph | Source | Licence | Colour | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| `fluent-flowchart.svg` | Workflows | https://api.iconify.design/fluent/flowchart-24-regular.svg | MIT (Microsoft) | single | `e177454a2ae2` |
| `fluent-mail-copy.svg` | Publish and subscribe, message brokers | https://api.iconify.design/fluent/mail-copy-24-regular.svg | MIT (Microsoft) | single | `d15c9c38de81` |
| `fluent-arrow-step-in-right.svg` | Service invocation | https://api.iconify.design/fluent/arrow-step-in-right-24-regular.svg | MIT (Microsoft) | single | `d3c871a61861` |
| `fluent-database.svg` | State management | https://api.iconify.design/fluent/database-24-regular.svg | MIT (Microsoft) | single | `19fb77317c94` |
| `fluent-people-team.svg` | Actors | https://api.iconify.design/fluent/people-team-24-regular.svg | MIT (Microsoft) | single | `502a8aed9372` |
| `fluent-clock.svg` | Jobs | https://api.iconify.design/fluent/clock-24-regular.svg | MIT (Microsoft) | single | `1d0f36f0cb12` |
| `fluent-settings-cog-multiple.svg` | Configuration | https://api.iconify.design/fluent/settings-cog-multiple-24-regular.svg | MIT (Microsoft) | single | `00a4721ba568` |
| `fluent-key.svg` | Secrets | https://api.iconify.design/fluent/key-24-regular.svg | MIT (Microsoft) | single | `4b0ae6a0e982` |
| `fluent-plug-disconnected.svg` | Bindings, services | https://api.iconify.design/fluent/plug-disconnected-24-regular.svg | MIT (Microsoft) | single | `2ccb5e4c3f74` |
| `fluent-arrow-move.svg` | Middleware | https://api.iconify.design/fluent/arrow-move-24-regular.svg | MIT (Microsoft) | single | `51ed8d2bdc98` |
| `fluent-lock-closed-key.svg` | Cryptography | https://api.iconify.design/fluent/lock-closed-key-24-regular.svg | MIT (Microsoft) | single | `628b92240ab7` |
| `fluent-table-lock.svg` | Distributed lock | https://api.iconify.design/fluent/table-lock-24-regular.svg | MIT (Microsoft) | single | `a7c0fd03ca91` |
| `fluent-certificate.svg` | Certificate glyph | [Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons), 24px regular, downloaded from https://api.iconify.design/fluent/certificate-24-regular.svg | MIT (see the notice above) | single | `201b98732deb` |
| `fluent-chat.svg` | Conversation | https://api.iconify.design/fluent/chat-24-regular.svg | MIT (Microsoft) | single | `781b8555615e` |
| `fluent-cloud-archive.svg` | Binary Store | https://api.iconify.design/fluent/cloud-archive-24-regular.svg | MIT (Microsoft) | single | `7f275c14d54a` |
| `fluent-document-search.svg` | Search | https://api.iconify.design/fluent/document-search-24-regular.svg | MIT (Microsoft) | single | `b393ca9a0cc8` |
| `fluent-data-scatter.svg` | Vector | https://api.iconify.design/fluent/data-scatter-24-regular.svg | MIT (Microsoft) | single | `be7c7ccb0239` |
| `fluent-heart-pulse.svg` | Observability | https://api.iconify.design/fluent/heart-pulse-24-regular.svg | MIT (Microsoft) | single | `8a33d2f3a7f9` |
| `fluent-shield-lock.svg` | Security | https://api.iconify.design/fluent/shield-lock-24-regular.svg | MIT (Microsoft) | single | `8b4ee87169d3` |
| `fluent-arrow-clockwise.svg` | Resiliency | https://api.iconify.design/fluent/arrow-clockwise-24-regular.svg | MIT (Microsoft) | single | `5dcc08ab343d` |
| `fluent-server.svg` | Virtual or physical machines | https://api.iconify.design/fluent/server-24-regular.svg | MIT (Microsoft) | single | `2db217b22228` |
| `zipkin.svg` | Zipkin symbol, no wordmark | [openzipkin/openzipkin.github.io](https://github.com/openzipkin/openzipkin.github.io/blob/master/public/img/logo_svg/zipkin_symbol.svg), downloaded from https://raw.githubusercontent.com/openzipkin/openzipkin.github.io/master/public/img/logo_svg/zipkin_symbol.svg | Apache-2.0 (the repository's licence). Zipkin is a trademark of the OpenZipkin project. | full (a raster PNG inside an svg wrapper, which is how the project publishes it) | `c3b9961675dd` |

All twenty glyphs `dapr/website` vendors are here, drawn the same way its `apis`
scene draws them.

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

## LICENSES

Notice text for the files whose licence requires it to travel with the
redistributed file. The notices are as the Commons file pages record them (the
`{{MIT|Ryan Dahl}}` and `{{Apache|Amazon Web Services}}` templates, read on
2026-10-26). Commons records no copyright year for either file, so none is
given here. These licences cover the files, not the Node.js or AWS trademarks.

### `nodejs.svg`: MIT License

Source: https://commons.wikimedia.org/wiki/File:Node.js_logo.svg

```
MIT License

Copyright (c) Ryan Dahl

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### `aws.svg`: Apache License, Version 2.0

Source: https://commons.wikimedia.org/wiki/File:Amazon_Web_Services_Logo.svg

The file is unmodified. The full licence text is at
https://www.apache.org/licenses/LICENSE-2.0 and applies to this file.

```
Copyright Amazon.com Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

### `fluent-*.svg`: MIT License

Source: https://github.com/microsoft/fluentui-system-icons/blob/main/LICENSE

The files are unmodified. This notice covers all twenty `fluent-*.svg` files.

```
MIT License

Copyright (c) 2020 Microsoft Corporation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
