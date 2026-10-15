(function () {
  var COOKIE_NAME = "dapr_cookie_consent";
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 12 months in seconds

  function readConsent() {
    var prefix = COOKIE_NAME + "=";
    var parts = document.cookie ? document.cookie.split("; ") : [];
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].indexOf(prefix) === 0) {
        return parts[i].substring(prefix.length);
      }
    }
    return null;
  }

  function writeConsent(value) {
    var secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
      COOKIE_NAME + "=" + value +
      "; Max-Age=" + COOKIE_MAX_AGE +
      "; Path=/; SameSite=Lax" + secure;
  }

  function hideBanner() {
    var el = document.getElementById("cookie-banner");
    if (el) {
      el.setAttribute("hidden", "");
    }
  }

  function showBanner() {
    var el = document.getElementById("cookie-banner");
    if (el) {
      el.removeAttribute("hidden");
    }
  }

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    var consent = readConsent();
    if (consent === null) {
      showBanner();
    }

    var acceptBtn = document.getElementById("cookie-banner-accept");
    var rejectBtn = document.getElementById("cookie-banner-reject");

    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        writeConsent("accepted");
        hideBanner();
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener("click", function () {
        writeConsent("rejected");
        hideBanner();
      });
    }
  });
})();
