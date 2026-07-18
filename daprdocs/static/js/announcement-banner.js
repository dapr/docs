(function () {
  var STORAGE_KEY = "dapr_announcement_dismissed";
  var banner = document.getElementById("announcement-banner");
  if (!banner) {
    return;
  }

  var navbar = document.querySelector(".td-navbar");
  var mq = window.matchMedia
    ? window.matchMedia("(min-width: 768px)")
    : null;

  // Per-session dismissal: if already dismissed this session, remove and stop.
  try {
    if (window.sessionStorage && sessionStorage.getItem(STORAGE_KEY) === "1") {
      if (banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
      return;
    }
  } catch (e) {
    /* sessionStorage unavailable (e.g. privacy mode) — show banner normally */
  }

  var slides = banner.querySelectorAll(".announcement-banner__slide");
  var dots = banner.querySelectorAll(".announcement-banner__dot");
  var prevBtn = banner.querySelector(".announcement-banner__prev");
  var nextBtn = banner.querySelector(".announcement-banner__next");
  var closeBtn = banner.querySelector(".announcement-banner__close");

  var current = 0;
  var timer = null;
  var interval = parseInt(banner.getAttribute("data-rotate-interval"), 10) || 0;
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(i) {
    if (i < 0) {
      i = slides.length - 1;
    }
    if (i >= slides.length) {
      i = 0;
    }
    for (var s = 0; s < slides.length; s++) {
      var on = s === i;
      slides[s].classList.toggle("is-active", on);
      if (on) {
        slides[s].removeAttribute("hidden");
      } else {
        slides[s].setAttribute("hidden", "");
      }
    }
    for (var d = 0; d < dots.length; d++) {
      var dotOn = d === i;
      dots[d].classList.toggle("is-active", dotOn);
      dots[d].setAttribute("aria-current", dotOn ? "true" : "false");
    }
    current = i;
  }

  function startRotate() {
    if (timer || interval <= 0 || reduceMotion || slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      show(current + 1);
    }, interval);
  }

  function stopRotate() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function bannerHeight() {
    return banner.offsetHeight;
  }

  // The Docsy navbar is position:fixed only at >= md (768px). Below that it is
  // in normal flow and naturally sits below the in-flow banner — no offset needed.
  function navbarIsFixed() {
    return mq ? mq.matches : true;
  }

  // Publish the fixed header's actual bottom edge (banner + navbar, or just the
  // navbar once the banner has scrolled away) so the sticky sidebars can offset
  // beneath it instead of a static 4rem — otherwise the pushed-down navbar
  // overlaps the top of the right aside (page-meta) while the banner is visible.
  function setHeaderBottom() {
    if (!navbar) {
      return;
    }
    var bottom = navbar.getBoundingClientRect().bottom;
    document.documentElement.style.setProperty(
      "--dapr-header-bottom",
      Math.max(0, bottom) + "px"
    );
  }

  // At >= md, push the fixed navbar down by the banner height so the banner sits
  // above it. At < md, clear any inline top so the navbar keeps its flow position.
  function applyOffset() {
    if (!navbar) {
      return;
    }
    if (navbarIsFixed()) {
      navbar.style.top = bannerHeight() + "px";
    } else {
      navbar.style.top = "";
    }
    setHeaderBottom();
  }

  // As the page scrolls, slide the fixed navbar up until it pins to the top, by
  // which point the in-flow banner has scrolled out of view.
  function onScroll() {
    if (!navbar || !navbarIsFixed()) {
      return;
    }
    var h = bannerHeight();
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    navbar.style.top = Math.max(0, h - y) + "px";
    setHeaderBottom();
  }

  function onResize() {
    applyOffset();
    onScroll();
  }

  function removeBanner() {
    stopRotate();
    if (banner.parentNode) {
      banner.parentNode.removeChild(banner);
    }
    if (navbar) {
      navbar.style.top = "";
    }
    setHeaderBottom(); // navbar back at the top → sidebars re-offset to its bottom
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
  }

  // Controls
  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      show(current - 1);
      stopRotate();
      startRotate();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      show(current + 1);
      stopRotate();
      startRotate();
    });
  }
  for (var di = 0; di < dots.length; di++) {
    (function (idx) {
      dots[idx].addEventListener("click", function () {
        show(idx);
        stopRotate();
        startRotate();
      });
    })(di);
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      try {
        if (window.sessionStorage) {
          sessionStorage.setItem(STORAGE_KEY, "1");
        }
      } catch (e) {
        /* ignore */
      }
      removeBanner();
    });
  }

  // Pause rotation while the user is interacting with the banner.
  banner.addEventListener("mouseenter", stopRotate);
  banner.addEventListener("mouseleave", startRotate);
  banner.addEventListener("focusin", stopRotate);
  banner.addEventListener("focusout", startRotate);

  // Init
  show(0);
  applyOffset();
  onScroll();
  startRotate();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
})();
