// Adds a "copy link to this section" button to content headings (h2–h6).
//
// Headings already carry an `id` (from Hugo's heading render hook), so the
// anchors work — but there was no affordance to grab the link. This injects a
// small Font Awesome link icon after each heading that copies the heading's
// absolute URL to the clipboard. Mirrors how Docsy's js/click-to-copy.js adds
// the code-block copy button entirely client-side, so heading id generation
// (which the TOC scrollspy depends on) is left untouched.
(function () {
  "use strict";

  var RESET_MS = 1500;

  function copyText(text) {
    // Prefer the async Clipboard API (secure contexts: https + localhost).
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for non-secure contexts / older browsers.
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  function makeButton(id) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dapr-anchor-copy fas fa-link";
    btn.setAttribute("aria-label", "Copy link to this section");
    btn.setAttribute("title", "Copy link to this section");

    var resetTimer = null;
    btn.addEventListener("click", function () {
      var url = window.location.origin + window.location.pathname + "#" + id;
      copyText(url).then(
        function () {
          btn.classList.remove("fa-link");
          btn.classList.add("fa-check", "is-copied");
          btn.setAttribute("title", "Copied!");
          if (resetTimer) {
            window.clearTimeout(resetTimer);
          }
          resetTimer = window.setTimeout(function () {
            btn.classList.remove("fa-check", "is-copied");
            btn.classList.add("fa-link");
            btn.setAttribute("title", "Copy link to this section");
          }, RESET_MS);
        },
        function () {
          /* copy failed — leave the button as-is */
        }
      );
    });

    return btn;
  }

  function init() {
    var headings = document.querySelectorAll(
      ".td-content h2[id], .td-content h3[id], .td-content h4[id], .td-content h5[id], .td-content h6[id]"
    );
    headings.forEach(function (h) {
      // Idempotent: never add a second button to the same heading.
      if (h.querySelector(":scope > .dapr-anchor-copy")) {
        return;
      }
      h.appendChild(makeButton(h.id));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
