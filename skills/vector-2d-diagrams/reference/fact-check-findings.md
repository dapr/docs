# What the conversion found wrong, and what happened to it

Step 1 of the per-page procedure is a fact-check against the page's own prose,
and its rule is that **the prose wins and a discrepancy is raised, never
resolved silently.** Twenty-five are recorded below, grouped by what became of
each. A few bundle more than one correction to the same drawing.

Nothing here changed a page's words except where a maintainer ruling says so -
the first section below is the set that was ruled on, and those edits are in
this branch. Every replaced PNG is still on disk and none was edited: a PNG
that is off the page is no longer the thing a reader sees, and correcting the
file is a separate job.

Each per-page finding is also written in full in the scene file that carries
it, under a `DISCREPANCY` heading - that is the copy to read before changing a
drawing, because it holds the reasoning. This page is the index.

## Raised, then ruled on by the maintainer - 2026-11-06

These seven were carried open to the end of the conversion, because fixing each
one meant editing a page's words rather than a drawing. All seven were then
ruled on and acted on in the same session. **The page edits are part of this
branch.**

| Where | What was wrong | What was done |
| --- | --- | --- |
| `pubsub/howto-publish-subscribe.md` | The PNG had **publish and subscribe the wrong way round** - checkout publishing to RabbitMQ, order processing subscribing. The page said the opposite four times over: its opening bullets, `subscription.yaml`, every code sample in five languages, and both `dapr run` commands | The drawing already followed the prose, so the only mismatch left was reading order: the bullets listed the subscriber first while the diagram runs publisher-to-subscriber. **Bullets reordered**, publisher first. Nothing factual moved. The PNG stays wrong on disk; it is no longer on the page, and its wrong alt text - "state management of example service", copied from another page - went with the `<img>` |
| `service-invocation/service-invocation-overview.md` | The mDNS PNG **had the caller calling itself**: "Service A" on the left, "Service A Instance 1/2/3" on the right, directly above a note explaining that app id is per-application, not per-instance | **Left as is.** `service-invocation-mdns` draws `FrontEnd` calling `Cart`, as the paragraph above the figure does. The PNG is off the page |
| `secrets/howto-secrets.md` | The source image's component YAML **would not load**: `secretsFile` directly under `spec`, no `type` | **The drawn YAML is now the page's own file**, complete enough to paste and run - `apiVersion`, `kind`, `type` and `version` all drawn. Only the optional `nestedSeparator` entry is left out |
| `bindings/howto-triggers.md` | The three numbered points under the input-binding diagram were byte-identical to the ones on `howto-bindings.md`, the OUTPUT binding page - calling `/binding` with an `operation` field, which is not what an input binding does | **The three points were rewritten** to describe an input binding, using the page's own component settings: Dapr consumes the `topics` and `consumerGroup`, invokes `POST /checkout` on the app, and `direction: input` says which way the binding runs |
| `distributed-lock/howto-use-distributed-lock.md` | Both runs in the source were captioned "acquires lock on resource for mutually exclusive access"; read together they cannot both be true of one resource | **A line of prose was added** under the figure: locks are scoped to a Dapr app-id, so the two locks are independent and each excludes only other instances of its own application. The source's captions stay, since each is correct read alone |
| `pubsub/howto-namespace.md` | The page called the topic `order` in the setup paragraph and in all three images, then `orders` in its closing paragraph | **Renamed to `order`** in all three places, including the broker entity, which becomes `team-aorder` |
| `developing-ai/dapr-agents/dapr-agents-why.md` | `components-concept` sat under "Agent-Centric Design" but illustrates "Modular Component Model" | **Moved** to the end of the Modular Component Model section, which also makes all three principle sections end with their own figure |

## Settled by a maintainer ruling during the conversion

Each was put to the maintainer and answered; the date is the ruling.

| Finding | Ruling |
| --- | --- |
| Stored keys drawn as `myApp-dbname` / `myApp-weapon`. The separator is a double pipe, `myApp\|\|dbname` - `\|\|` is reserved, which is why it is the separator | Corrected in the drawing, 2026-11-02. Applies to `configuration-api-overview` and `state-management-overview` |
| `cryptography-overview` draws six components; `supported-cryptography/` lists four. Google KMS and AWS Secrets Manager are not among them, and AWS Secrets Manager is listed under secret stores instead | Drawn as the source has them, 2026-11-02. If the reference pages are what is behind, the diagram is already right and the gap closes itself |
| The conversation provider list: the PNG shows six, the reference holds ten, one of which (`local-echo`) is a test component | Draw the nine real providers, 2026-11-02. Five marks were vendored for it |
| `service-invocation-overview` says "Service A"/"Service B" while the streaming section of the same page says "App A"/"App B" | Rename to App A / App B, 2026-11-03. The page's own seven steps were renamed with the picture - the one place a page's words changed |

## Corrected in the drawing, against this repository's own reference

The page's prose named none of these values, so the check ran against the
reference pages in this repo. A diagram cannot show a call wrongly while
sitting on the page about that call.

- **`configuration-api-overview`** - the PNG puts the key in the path
  (`/v1.0/configuration/myconfigstore/dbname`); the reference gives it as a
  query parameter. The PNG's response is a bare string; the reference returns
  JSON-encoded key/value pairs.
- **`conversation-overview`** - the PNG shows `v1.0-alpha1`; the reference gives
  `v1.0-alpha2` throughout.
- **`state-management-overview`** - four more beyond the key separator above:
  saving state answers **204, not 200** (the reference lists no 200 and no
  body); the query body has **no `query` wrapper**; a query filter key is
  relative to the value, so `value.name` is `name`; and a query result carries
  `data` and an `etag`, not `value`.
- **`actors-calling-method`** - step three is a **PUT, not a POST**. The two
  calls are different endpoints on different servers, and the app-side one is
  documented as `PUT .../actors/<type>/<id>/method/<name>`.
- **`actors-placement-registration`** - the source labels **two different
  instances "Instance 1"**, and numbers two steps of its own where the page
  numbers three. The scene uses the page's steps in the page's order.
- **`actors-id-hashing`** - the source draws a **live link to the Placement
  service** right beside the callout saying the caller "looks this up in the
  local cache". A reader cannot have both. The link is drawn as the broadcast
  that fills the cache, which is what it is.
- **`service-invocation-overview`** - the source puts **step 3 on the return
  arrow**, beside the padlock. The page's list makes 3 the hop out and 6 the hop
  back, so a reader following the numbers finds the arrow pointing the wrong
  way. The padlock moved too, to between the two lines: mTLS protects both
  directions, and hanging it off the return leg alone reads as the response
  being the encrypted half.
- **`pubsub-competing-consumers`** - the source illustrates a **different
  claim**: five producers feeding a queue, captioned as a consumer pool. The
  page's sentence is about subscribers - many instances of one application, one
  consumer group, one delivery each.

## The six from phase 1, and where they ended

These came out of the look-at-every-image pass, before any page was converted.

| # | Finding | Outcome |
| --- | --- | --- |
| 1 | "External Configuration" should be "Configuration" (in three images) | Corrected; `overview` and `hosting-standalone` both draw "Configuration" |
| 2 | "Encrypt and Decrypt AI" in `cryptography-overview.png` - a typo for API | Corrected; the scene says API |
| 3 | "Twillio" in `home_concepts_principles_modular.png` - the vendor is Twilio | Corrected; spelled Twilio |
| 4 | "Schedule r" in `scheduler-architecture.png`, a broken word wrap, plus visible red spell-check squiggles under `WatchJobs` and `OnJobEvent` | Corrected; the scene predates the conversion and already had it right |
| 5 | `service-invocation-overview-non-dapr-endpoint.png` bakes its title into the drawing | Resolved by the format: `service-invocation-non-dapr-endpoint` puts the title in `title`/`desc`, which the shortcode renders as the caption |
| 6 | `buildingblocks-overview.png` shows 12 API tiles; the shared catalogue holds more | Resolved by shopping, not drawing: the page now draws `apis.mjs`, which holds 16 APIs and 3 cross-cutting concerns, so the count follows the catalogue instead of a frozen picture |
