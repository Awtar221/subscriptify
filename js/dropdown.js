/* ======================
   dropdown.js
   Controls the three-dot dropdown menu on subscriptions.html.
   Handles Export, Import, and Clear All actions.

   Loaded by: pages/subscriptions.html
   ====================== */

(function initDropdown() {
  var menuBtn       = document.getElementById('menuBtn');
  var dropdownPanel = document.getElementById('dropdownPanel');

  if (!menuBtn || !dropdownPanel) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function openPanel() {
    dropdownPanel.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    if (!reduceMotion && typeof anime !== 'undefined') {
      anime.animate(dropdownPanel, { scale: [0.92, 1], opacity: [0, 1], duration: 160, ease: 'outQuint' });
    }
  }

  function closePanel() {
    if (!dropdownPanel.classList.contains('is-open')) return;
    menuBtn.setAttribute('aria-expanded', 'false');
    if (!reduceMotion && typeof anime !== 'undefined') {
      anime.animate(dropdownPanel, {
        scale: [1, 0.92],
        opacity: [1, 0],
        duration: 120,
        ease: 'inQuad',
        onComplete: function () { dropdownPanel.classList.remove('is-open'); }
      });
    } else {
      dropdownPanel.classList.remove('is-open');
    }
  }

  /* Toggle dropdown open/closed */
  menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (dropdownPanel.classList.contains('is-open')) closePanel();
    else openPanel();
  });

  /* Close dropdown when clicking anywhere else */
  document.addEventListener('click', closePanel);

  /* ---------- EXPORT ---------- */
  var exportBtn = document.getElementById('exportDataBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function (e) {
      e.preventDefault();
      dropdownPanel.classList.remove('is-open');

      var data = localStorage.getItem('subscriptions');
      if (!data) {
        if (window.subscriptionManager) {
          window.subscriptionManager.showToast('Nothing to export yet.', 'warning');
        }
        return;
      }

      // Create a temporary download link
      var blob = new Blob([data], { type: 'application/json' });
      var url  = URL.createObjectURL(blob);
      var link = document.createElement('a');
      var date = new Date().toISOString().split('T')[0];

      link.href     = url;
      link.download = 'subscriptions_backup_' + date + '.json';
      link.click();
      URL.revokeObjectURL(url);

      if (window.subscriptionManager) {
        window.subscriptionManager.showToast('Data exported.', 'success');
      }
    });
  }

  /* ---------- IMPORT ---------- */
  var importBtn = document.getElementById('importDataBtn');
  if (importBtn) {
    importBtn.addEventListener('click', function (e) {
      e.preventDefault();
      dropdownPanel.classList.remove('is-open');

      // Open a hidden file input
      var fileInput   = document.createElement('input');
      fileInput.type  = 'file';
      fileInput.accept = 'application/json';

      fileInput.onchange = function (event) {
        var file   = event.target.files[0];
        var reader = new FileReader();

        reader.onload = function (readerEvent) {
          try {
            var parsed = JSON.parse(readerEvent.target.result);
            if (!Array.isArray(parsed)) throw new Error('not an array');
            localStorage.setItem('subscriptions', JSON.stringify(parsed));

            if (window.subscriptionManager) {
              window.subscriptionManager.showToast('Data imported. Reloading...', 'success');
            }
            setTimeout(function () { window.location.reload(); }, 1500);
          } catch (err) {
            alert('That file isn\'t a valid backup. Try another one.');
          }
        };

        reader.readAsText(file);
      };

      fileInput.click();
    });
  }

  /* ---------- CLEAR ALL ---------- */
  var clearBtn = document.getElementById('clearAllBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function (e) {
      e.preventDefault();
      dropdownPanel.classList.remove('is-open');

      // Use the custom confirm dialog if available, otherwise native confirm
      if (window.subscriptionManager) {
        window.subscriptionManager.showConfirmDialog(
          'This deletes every subscription in',
          'Subtrack',
          function () {
            localStorage.removeItem('subscriptions');
            window.subscriptionManager.showToast('All data cleared.', 'warning');
            setTimeout(function () { window.location.reload(); }, 1500);
          }
        );
      } else if (confirm('Delete ALL subscriptions? This cannot be undone.')) {
        localStorage.removeItem('subscriptions');
        window.location.reload();
      }
    });
  }
})();