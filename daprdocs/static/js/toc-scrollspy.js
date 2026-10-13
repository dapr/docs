// Highlights the current section's link in the right-hand "On this page" TOC
// as the reader scrolls. Docsy v0.12.0 renders the TOC markup but ships no
// scrollspy behavior (no Bootstrap Scrollspy init, no data-bs-spy attrs), so
// this fills the gap with a minimal, dependency-free IntersectionObserver.
// No-ops entirely when the page has no .td-toc (short pages, index pages).
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var toc = document.querySelector(".td-toc");
    if (!toc) {
      return;
    }

    var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
    if (!links.length || typeof IntersectionObserver === "undefined") {
      return;
    }

    var linkByHeadingId = {};
    var headings = [];
    links.forEach(function (link) {
      var id = decodeURIComponent(link.getAttribute("href").slice(1));
      var heading = id ? document.getElementById(id) : null;
      if (heading) {
        linkByHeadingId[id] = link;
        headings.push(heading);
      }
    });

    if (!headings.length) {
      return;
    }

    function setActive(id) {
      links.forEach(function (link) {
        link.classList.remove("active");
      });
      var active = linkByHeadingId[id];
      if (active) {
        active.classList.add("active");
      }
    }

    // Shrinks the observed viewport to its top third: a heading counts as
    // "current" once it crosses that line, and stays current until the next
    // heading crosses it — the standard scrollspy trick.
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach(function (heading) {
      observer.observe(heading);
    });
  });
})();
