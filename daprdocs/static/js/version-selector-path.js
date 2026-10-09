// Each docs version is hosted on its own subdomain (v1-17.docs.dapr.io,
// v1-18.docs.dapr.io, etc.), and Docsy's stock navbar-version-selector.html
// renders a bare link to each version's root ("https://v1-17.docs.dapr.io")
// with no path. Clicking a version in the dropdown therefore always drops
// the reader on that version's homepage, losing their place on every page
// except the homepage itself — reported as "docs broken navigating to a
// non-current version" (2026-10-07).
//
// This appends the current page's path to each version link so the reader
// lands on the same page on the target version instead. If that exact page
// does not exist on the target version (renamed or new since), the reader
// hits that version's own 404 page rather than being silently redirected —
// a reasonable, visible degradation rather than a silent loss of place.
//
// No-ops when there is no version dropdown (pages always have one here, but
// this guards against a future layout change) or when the current path is
// the site root (nothing to append).
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var currentPath = window.location.pathname;
    if (!currentPath || currentPath === "/") {
      return;
    }

    var links = document.querySelectorAll(
      '.dropdown-menu .dropdown-item[href^="https://v1-"]'
    );
    links.forEach(function (link) {
      try {
        var url = new URL(link.getAttribute("href"));
        url.pathname = currentPath;
        link.setAttribute("href", url.toString());
      } catch (e) {
        // Malformed href: leave the link pointing at the version's homepage.
      }
    });
  });
})();
