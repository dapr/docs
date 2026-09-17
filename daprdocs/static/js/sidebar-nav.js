// Fetches the per-language sidebar nav fragment (/sidebar-nav.html), injects it
// into #td-section-nav, and applies active-item highlighting client-side.
// The tree is rendered once per language instead of being serialized into every
// page. See _partials/sidebar.html and home.sidebarnav.html.
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var nav = document.getElementById("td-section-nav");
    if (!nav) {
      return; // page has no section nav (e.g. layouts without a sidebar)
    }
    var src = nav.getAttribute("data-nav-src");
    var mid = nav.getAttribute("data-nav-mid");
    if (!src) {
      return;
    }

    fetch(src, { credentials: "same-origin" })
      .then(function (resp) {
        if (!resp.ok) {
          throw new Error("sidebar-nav fetch failed: " + resp.status);
        }
        return resp.text();
      })
      .then(function (html) {
        nav.innerHTML = html; // replaces the <noscript> fallback
        markActive(mid);
      })
      .catch(function (err) {
        // On failure leave the empty nav; the navbar and in-content links keep
        // the page navigable. Log for diagnostics.
        if (window.console && console.warn) {
          console.warn(err);
        }
      });
  });

  function markActive(mid) {
    if (!mid) {
      return;
    }
    var activeLink = document.getElementById(mid);
    if (!activeLink) {
      return; // current page not present in the tree; nothing to highlight
    }
    activeLink.classList.add("active");
    var span = activeLink.querySelector("span");
    if (span) {
      span.classList.add("td-sidebar-nav-active-item");
    }

    // Mark every ancestor <li> as active-path + show, and check foldable inputs.
    var li = activeLink.closest("li");
    while (li) {
      li.classList.add("active-path", "show");
      var input = li.querySelector(":scope > input");
      if (input) {
        input.checked = true;
      }
      var parent = li.parentElement;
      li = parent ? parent.closest("li") : null;
    }

    // Reveal siblings of the active item and its direct children (compact mode).
    var activeLi = document.getElementById(mid + "-li");
    if (activeLi) {
      activeLi.classList.add("td-sidebar-active-li"); // styling hook for the active item's <li>

      var container = activeLi.parentElement;
      if (container) {
        Array.prototype.forEach.call(container.children, function (el) {
          if (el.tagName === "LI") {
            el.classList.add("show");
          }
        });
      }
      var childUl = activeLi.querySelector(":scope > ul");
      if (childUl) {
        Array.prototype.forEach.call(childUl.children, function (el) {
          if (el.tagName === "LI") {
            el.classList.add("show");
          }
        });
      }
      centerInScroller(activeLi);
    }
  }

  // Vertically center an element within its OWN scrollable ancestor, without ever
  // scrolling the window. activeLi.scrollIntoView({ block: "center" }) centers the
  // item in every scrollport up the chain, including the viewport — on load that
  // scrolls the whole document so the active nav item is centered, dragging the
  // page content (and the page's H1) up behind the fixed navbar. We only want the
  // sidebar's overflow:auto container to move.
  function scrollableAncestor(el) {
    var node = el.parentElement;
    while (node && node !== document.body && node !== document.documentElement) {
      var oy = window.getComputedStyle(node).overflowY;
      if ((oy === "auto" || oy === "scroll") && node.scrollHeight > node.clientHeight) {
        return node;
      }
      node = node.parentElement;
    }
    return null; // no dedicated scroll area (e.g. mobile) — leave the window alone
  }

  function centerInScroller(el) {
    var scroller = scrollableAncestor(el);
    if (!scroller) {
      return;
    }
    var elRect = el.getBoundingClientRect();
    var scRect = scroller.getBoundingClientRect();
    var delta =
      elRect.top - scRect.top - (scroller.clientHeight - elRect.height) / 2;
    scroller.scrollTop += delta;
  }
})();
