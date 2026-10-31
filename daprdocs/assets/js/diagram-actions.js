// Copy button for a generated diagram.
//
// The diagram on the page is an inlined svg painted in var(--d-*), which only
// resolves against this page's tokens. Copying THAT would hand someone a file
// that comes out black or blank anywhere else, so this fetches the standalone
// copy under /diagrams/, which has the light values baked in. The download link
// beside it needs no JavaScript at all and points at the same file.
(function () {
  'use strict';

  var RESET_AFTER = 2000;

  function say(button, text) {
    button.textContent = text;
    window.setTimeout(function () {
      button.textContent = button.dataset.diagramLabel;
    }, RESET_AFTER);
  }

  function copy(button) {
    var url = button.getAttribute('data-diagram-copy');
    button.disabled = true;

    window
      .fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error(response.status);
        return response.text();
      })
      .then(function (svg) {
        // Older Safari and any non-secure context have no clipboard API.
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('no clipboard');
        return navigator.clipboard.writeText(svg);
      })
      .then(function () {
        say(button, 'Copied');
      })
      .catch(function () {
        // Never leave the button in a lie: if it did not copy, say so and let
        // the reader fall back to the download link next to it.
        say(button, 'Copy failed');
      })
      .finally(function () {
        window.setTimeout(function () {
          button.disabled = false;
        }, RESET_AFTER);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var buttons = document.querySelectorAll('[data-diagram-copy]');
    Array.prototype.forEach.call(buttons, function (button) {
      button.dataset.diagramLabel = button.textContent;
      button.addEventListener('click', function () {
        copy(button);
      });
    });
  });
})();
