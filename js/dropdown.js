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

  /* Toggle dropdown open/closed */
  menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var isOpen = dropdownPanel.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', isOpen);
  });

  /* Close dropdown when clicking anywhere else */
  document.addEventListener('click', function () {
    dropdownPanel.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  });

  /* ---------- EXPORT ---------- */
  var exportBtn = document.getElementById('exportDataBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function (e) {
      e.preventDefault();
      dropdownPanel.classList.remove('is-open');

      var data = localStorage.getItem('subscriptions');
      if (!data) {
        if (window.subscriptionManager) {
          window.subscriptionManager.showToast('No data to export.', 'warning');
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
        window.subscriptionManager.showToast('Data exported successfully!', 'success');
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
            localStorage.setItem('subscriptions', JSON.stringify(parsed));

            if (window.subscriptionManager) {
              window.subscriptionManager.showToast('Data imported! Refreshing...', 'success');
            }
            setTimeout(function () { window.location.reload(); }, 1500);
          } catch (err) {
            alert('Invalid file. Please select a valid backup JSON file.');
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
          'This will permanently delete all subscriptions.',
          'ALL DATA',
          function () {
            localStorage.removeItem('subscriptions');
            window.subscriptionManager.showToast('All data cleared!', 'warning');
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