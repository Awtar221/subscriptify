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

      var subs = window.subscriptionManager ? window.subscriptionManager.subscriptions : [];
      if (!subs.length) {
        if (window.subscriptionManager) {
          window.subscriptionManager.showToast('Nothing to export yet.', 'warning');
        }
        return;
      }

      // Create a temporary download link
      var blob = new Blob([JSON.stringify(subs)], { type: 'application/json' });
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

        reader.onload = async function (readerEvent) {
          var parsed;
          try {
            parsed = JSON.parse(readerEvent.target.result);
            if (!Array.isArray(parsed)) throw new Error('not an array');
          } catch (err) {
            alert('That file isn\'t a valid backup. Try another one.');
            return;
          }

          var user = await getCurrentUser();
          if (!user) return;
          var rows = parsed.map(function (s) { return Object.assign({ user_id: user.id }, toRow(s)); });
          var res = await supabaseClient.from('subscriptions').insert(rows);
          if (res.error) { alert('Import failed: ' + res.error.message); return; }

          if (window.subscriptionManager) {
            window.subscriptionManager.showToast('Data imported. Reloading...', 'success');
          }
          setTimeout(function () { window.location.reload(); }, 1500);
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
          async function () {
            var user = await getCurrentUser();
            if (!user) return;
            var res = await supabaseClient.from('subscriptions').delete().eq('user_id', user.id);
            if (res.error) { window.subscriptionManager.showToast('Clear failed.', 'error'); return; }
            window.subscriptionManager.showToast('All data cleared.', 'warning');
            setTimeout(function () { window.location.reload(); }, 1500);
          }
        );
      }
    });
  }
})();