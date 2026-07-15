/* ======================
   simple_CRUD.js
   SubscriptionManager class — full CRUD for subscriptions.
   Reads/writes to localStorage under the key 'subscriptions'.
   Renders the subscription table and stat cards dynamically.

   Loaded by: index.html, pages/subscriptions.html
   ====================== */

// `var X = class {}` not `class X {}` — a top-level class declaration is a lexical binding
// like let/const and throws "already declared" if this script re-runs via live-reload.
var SubscriptionManager = class {
  constructor() {
    this.subscriptions = [];   // In-memory list (synced with localStorage)
    this.currentFilter = 'all'; // Active filter: 'all' | 'active' | 'cancelled' | 'renewing-soon'
    this.searchTerm    = '';    // Current search string
    this.init();
  }

  /* ===== INIT ===== */

  init() {
    this.loadData();
    this.bindEvents();
    this.render();
    this.updateStats();
  }

  /* ===== DATA PERSISTENCE ===== */

  /** Load subscriptions from localStorage; seed demo data if empty. */
  loadData() {
    this.subscriptions = ensureSubscriptionsSeeded();
  }

  /** Persist in-memory list to localStorage and refresh the stats row. */
  saveData() {
    localStorage.setItem('subscriptions', JSON.stringify(this.subscriptions));
    this.updateStats();
  }

  /* ===== STAT CARDS ===== */

  /** Recalculate and update the four summary stat cards. */
  updateStats() {
    var active    = this.subscriptions.filter(function (s) { return s.status === 'active'; });
    var cancelled = this.subscriptions.filter(function (s) { return s.status === 'cancelled'; });
    var total     = active.reduce(function (sum, s) { return sum + s.cost; }, 0);
    var renewingSoon = active.filter(isRenewingSoon);

    this.setText('totalMonthly',     'RM ' + total.toFixed(2));
    this.setText('activeCount',      active.length);
    this.setText('activeSubCount',   active.length);
    this.setText('cancelledCount',   cancelled.length);
    this.setText('renewingSoonCount', renewingSoon.length);
  }

  /** Set an element's text by id, animating numeric changes (no-op if element not found). */
  setText(id, value) {
    var el = document.getElementById(id);
    if (el) animateStatValue(el, value);
  }

  /* ===== CRUD OPERATIONS ===== */

  /** Create a new subscription from form data. */
  createSubscription(formData) {
    var newSub = {
      id:          Date.now(),           // Simple unique id using timestamp
      name:        formData.name,
      category:    formData.category,
      cost:        parseFloat(formData.cost),
      renewalDate: formData.renewalDate,
      status:      formData.status,
      notes:       formData.notes || ''
    };
    this.subscriptions.push(newSub);
    this.saveData();
    this.render();
    this.showToast('Subscription added.', 'success');
  }

  /** Update an existing subscription by id. */
  updateSubscription(id, formData) {
    var index = this.subscriptions.findIndex(function (s) { return s.id === id; });
    if (index === -1) return;

    this.subscriptions[index] = {
      id:          id,
      name:        formData.name,
      category:    formData.category,
      cost:        parseFloat(formData.cost),
      renewalDate: formData.renewalDate,
      status:      formData.status,
      notes:       formData.notes || ''
    };
    this.saveData();
    this.render();
    this.showToast('Subscription updated.', 'success');
  }

  /** Prompt for confirmation then delete a subscription by id. */
  deleteSubscription(id) {
    var sub = this.subscriptions.find(function (s) { return s.id === id; });
    if (!sub) return;

    this.showConfirmDialog(
      'Delete',
      sub.name,
      () => {
        this.subscriptions = this.subscriptions.filter(function (s) { return s.id !== id; });
        this.saveData();
        this.render();
        this.showToast('Subscription deleted.', 'success');
      }
    );
  }

  /* ===== FILTERING & SEARCH ===== */

  /** Return subscriptions filtered by current tab and search term, sorted by renewal date. */
  getFilteredSubscriptions() {
    var result = this.subscriptions.slice();

    // Tab filter
    if (this.currentFilter === 'active') {
      result = result.filter(function (s) { return s.status === 'active'; });
    } else if (this.currentFilter === 'cancelled') {
      result = result.filter(function (s) { return s.status === 'cancelled'; });
    } else if (this.currentFilter === 'renewing-soon') {
      result = result.filter(isRenewingSoon);
    }

    // Search filter (name or category)
    if (this.searchTerm) {
      var term = this.searchTerm.toLowerCase();
      result = result.filter(function (s) {
        return s.name.toLowerCase().includes(term) ||
               s.category.toLowerCase().includes(term);
      });
    }

    // Sort ascending by renewal date
    var priorityOrder = {
        'Design': 1,
        'Productivity': 2,
        'Streaming': 3,
        'Other': 4
    };

    result.sort(function (a, b) {
        var pA = priorityOrder[a.category] || 99;
        var pB = priorityOrder[b.category] || 99;
        return pA - pB;
    });

    return result;
  }

  /* ===== RENDERING ===== */

/** Re-render the subscription table from the filtered list. */
  render() {
    var container = document.getElementById('subscriptionsTable');
    if (!container) return;

    // Dashboard variant: fixed "top 5 most expensive active" list, no filters.
    var isTop5 = container.dataset.view === 'top5';
    var list = isTop5
      ? this.subscriptions
          .filter(function (s) { return s.status === 'active'; })
          .sort(function (a, b) { return b.cost - a.cost; })
          .slice(0, 5)
      : this.getFilteredSubscriptions();

    // Keep the dashboard side panels (donut, renewals) in sync with every re-render.
    if (typeof renderDashboardExtras === 'function') renderDashboardExtras(this.subscriptions);

    if (list.length === 0) {
      container.innerHTML = '<div class="empty-state">No subscriptions yet. Add one to get started.</div>';
      return;
    }


var rows = list.map((sub) => {
      var badgeClass  = sub.status === 'active' ? 'badge-active' : 'badge-cancelled';
      var statusLabel = sub.status === 'active' ? 'Active' : 'Cancelled';
      var icon        = this.getCategoryIcon(sub.category);

      return (
        '<div class="table-row">' +
          '<div class="td sub-name-wrap">' +
            '<div class="sub-icon"><i class="ti ' + icon + '"></i></div>' +
            '<div class="sub-name-text">' +
              '<div class="sub-name" title="' + this.escapeHtml(sub.name) + '">' + this.escapeHtml(sub.name) + '</div>' +
              '<div class="sub-category">' + sub.category + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="td td-cost">RM ' + sub.cost.toFixed(2) + '</div>' +
          '<div class="td">' + this.formatDate(sub.renewalDate) + '</div>' +
          '<div class="td">' +
            '<span class="badge ' + badgeClass + '">' +
              '<span class="badge-dot"></span>' + statusLabel +
            '</span>' +
          '</div>' +
          '<div class="row-actions">' +
            '<button class="icon-btn edit-btn" data-id="' + sub.id + '" title="Edit" aria-label="Edit ' + this.escapeHtml(sub.name) + '">' +
              '<i class="ti ti-edit"></i>' +
            '</button>' +
            '<button class="icon-btn delete-btn" data-id="' + sub.id + '" title="Delete" aria-label="Delete ' + this.escapeHtml(sub.name) + '">' +
              '<i class="ti ti-trash"></i>' +
            '</button>' +
          '</div>' +
        '</div>'
      );
    });


container.innerHTML =
  '<div class="table-head">' +
    '<div class="th">Service</div>' +
    '<div class="th">Cost / mo</div>' +
    '<div class="th">Renewal Date</div>' +
    '<div class="th">Status</div>' +
    '<div class="th" style="justify-content: flex-end;">Actions</div>' +
  '</div>' +
  rows.join('');

    this.attachRowEvents();
  }

  /** Attach click handlers to edit and delete buttons after render. */
  attachRowEvents() {
    document.querySelectorAll('.edit-btn').forEach((btn) => {
      btn.onclick = (e) => { e.stopPropagation(); this.openEditModal(parseInt(btn.dataset.id)); };
    });

    document.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.onclick = (e) => { e.stopPropagation(); this.deleteSubscription(parseInt(btn.dataset.id)); };
    });
  }

  /* ===== MODAL ===== */

  openModal() {
    this.flushPendingReset();
    var overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.add('is-open');
  }

  closeModal() {
    var overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('is-open');
    // Defer the reset until the overlay's 0.2s fade-out finishes, otherwise the
    // title/button flip back to "Add Subscription" while the modal is still visible.
    var self = this;
    this._resetTimer = setTimeout(function () {
      self._resetTimer = null;
      self.resetForm();
    }, 250);
  }

  /** Run a still-pending deferred reset now (called before reopening the modal). */
  flushPendingReset() {
    if (this._resetTimer) {
      clearTimeout(this._resetTimer);
      this._resetTimer = null;
      this.resetForm();
    }
  }

  /** Pre-fill the modal form for editing an existing subscription. */
  openEditModal(id) {
    this.flushPendingReset();
    var sub = this.subscriptions.find(function (s) { return s.id === id; });
    if (!sub) return;

    document.getElementById('editId').value      = sub.id;
    document.getElementById('sub-name').value    = sub.name;
    document.getElementById('sub-cat').value     = sub.category;
    document.getElementById('sub-cost').value    = sub.cost;
    document.getElementById('sub-date').value    = sub.renewalDate;
    document.getElementById('sub-status').value  = sub.status;
    document.getElementById('sub-notes').value   = sub.notes || '';
    document.getElementById('modalTitle').textContent = 'Edit Subscription';
    document.getElementById('saveBtn').textContent    = 'Save Changes';

    this.openModal();
  }

  /** Clear all form inputs and reset modal title to "Add". */
  resetForm() {
    var fields = ['editId', 'sub-name', 'sub-cat', 'sub-cost', 'sub-date', 'sub-notes'];
    fields.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    var statusEl = document.getElementById('sub-status');
    if (statusEl) statusEl.value = 'active';

    var titleEl = document.getElementById('modalTitle');
    if (titleEl) titleEl.textContent = 'Add Subscription';
    var saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.textContent = 'Add Subscription';
  }

  /** Read all form values into a plain object. */
  getFormData() {
    return {
      name:        document.getElementById('sub-name').value.trim(),
      category:    document.getElementById('sub-cat').value,
      cost:        document.getElementById('sub-cost').value,
      renewalDate: document.getElementById('sub-date').value,
      status:      document.getElementById('sub-status').value,
      notes:       document.getElementById('sub-notes').value.trim()
    };
  }

  /** Return false and show a toast if any required field is missing/invalid. */
  validateForm(data) {
    if (!data.name)                { this.showToast('Enter a service name.', 'error'); return false; }
    if (!data.category)            { this.showToast('Select a category.', 'error');    return false; }
    if (!data.cost || data.cost <= 0 || data.cost > 999999.99) { this.showToast('Enter a valid monthly cost.', 'error');  return false; }
    if (!data.renewalDate)         { this.showToast('Enter a renewal date.', 'error'); return false; }
    return true;
  }

  /** Handle form submission for both create and update. */
  handleSubmit(e) {
    e.preventDefault();
    var editId   = document.getElementById('editId').value;
    var formData = this.getFormData();
    if (!this.validateForm(formData)) return;

    if (editId) {
      this.updateSubscription(parseInt(editId), formData);
    } else {
      this.createSubscription(formData);
    }
    this.closeModal();
  }

  /* ===== EVENT BINDING ===== */

  bindEvents() {
    // Form submit
    var form = document.getElementById('subscriptionForm');
    if (form) form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Open modal button
    var openBtn = document.getElementById('openModalBtn');
    if (openBtn) openBtn.onclick = () => { this.resetForm(); this.openModal(); };

    // Close / cancel buttons
    var closeBtn  = document.getElementById('closeModalBtn');
    var cancelBtn = document.getElementById('cancelModalBtn');
    if (closeBtn)  closeBtn.onclick  = () => this.closeModal();
    if (cancelBtn) cancelBtn.onclick = () => this.closeModal();

    // Close on backdrop click
    var overlay = document.getElementById('modalOverlay');
    if (overlay) {
      overlay.onclick = (e) => { if (e.target === overlay) this.closeModal(); };
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        var ov = document.getElementById('modalOverlay');
        if (ov && ov.classList.contains('is-open')) this.closeModal();
      }
    });

    // Search input with debounce
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
      var timer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          this.searchTerm = e.target.value;
          this.render();
        }, 300);
      });
    }

    // Filter tabs
    var tabs = document.querySelectorAll('#filterTabs .tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
       
        tabs.forEach(function (t) { t.classList.remove('active'); });
        
        tab.classList.add('active');
        
        this.currentFilter = tab.dataset.filter;
        this.render();
      });
    });

  }

  /* ===== UI HELPERS ===== */

  /**
   * Show a slide-in toast notification.
   * @param {string} message
   * @param {'success'|'error'|'warning'} type
   */
  showToast(message, type) {
    type = type || 'success';

    // Remove any existing toast first
    var existing = document.querySelector('.custom-toast');
    if (existing) existing.remove();

    var iconMap = {
      success: 'ti ti-circle-check',
      error:   'ti ti-alert-circle',
      warning: 'ti ti-alert-triangle'
    };

    var toast = document.createElement('div');
    toast.className = 'custom-toast ' + type;
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<i class="' + (iconMap[type] || 'ti ti-info-circle') + '"></i>' +
      '<div class="toast-content">' + message + '</div>' +
      '<i class="ti ti-x toast-close" role="button" tabindex="0" aria-label="Dismiss"></i>';

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.body.appendChild(toast);

    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      if (reduceMotion || typeof anime === 'undefined') { toast.remove(); return; }
      anime.animate(toast, {
        translateX: [0, 24],
        opacity: [1, 0],
        duration: 200,
        ease: 'inQuad',
        onComplete: function () { toast.remove(); }
      });
    }

    if (reduceMotion || typeof anime === 'undefined') {
      toast.style.opacity = 1;
    } else {
      anime.animate(toast, {
        translateX: [24, 0],
        opacity: [0, 1],
        duration: 280,
        ease: 'outQuint'
      });
    }

    toast.querySelector('.toast-close').onclick = dismiss;
    setTimeout(dismiss, 3000);
  }

  /**
   * Show a custom confirm dialog before a destructive action.
   * @param {string}   message          Body text before the name
   * @param {string}   subscriptionName Name to highlight
   * @param {Function} onConfirm        Called if user confirms
   */
  showConfirmDialog(message, subscriptionName, onConfirm) {
    var existing = document.querySelector('.custom-dialog-overlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.className = 'custom-dialog-overlay';
    overlay.innerHTML =
      '<div class="custom-dialog">' +
        '<div class="custom-dialog-header">' +
          '<i class="ti ti-trash"></i>' +
          '<h3>Delete subscription?</h3>' +
        '</div>' +
        '<div class="custom-dialog-body">' +
          message + ' <span class="subscription-name">"' + this.escapeHtml(subscriptionName) + '"</span>?' +
          '<span class="dialog-note">This can\'t be undone.</span>' +
        '</div>' +
        '<div class="custom-dialog-footer">' +
          '<button class="dialog-cancel">Cancel</button>' +
          '<button class="dialog-confirm">Delete</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    var dialog = overlay.querySelector('.custom-dialog');
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduceMotion && typeof anime !== 'undefined') {
      anime.animate(overlay, { opacity: [0, 1], duration: 180, ease: 'outQuad' });
      anime.animate(dialog, { scale: [0.94, 1], opacity: [0, 1], duration: 220, ease: 'outQuint' });
    }

    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', escHandler);
      if (reduceMotion || typeof anime === 'undefined') { overlay.remove(); return; }
      anime.animate(overlay, { opacity: [1, 0], duration: 150, ease: 'inQuad', onComplete: function () { overlay.remove(); } });
      anime.animate(dialog, { scale: [1, 0.96], opacity: [1, 0], duration: 150, ease: 'inQuad' });
    }

    overlay.querySelector('.dialog-cancel').onclick  = close;
    overlay.querySelector('.dialog-confirm').onclick = function () { onConfirm(); close(); };
    overlay.onclick = function (e) { if (e.target === overlay) close(); };

    // Close on Escape
    var escHandler = function (e) {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', escHandler);
  }

  /* ===== UTILITY ===== */

  /** Map a category name to a Tabler icon class. */
  getCategoryIcon(category) {
    var map = {
      'Streaming':   'ti-device-tv',
      'Music':       'ti-music',
      'Storage':     'ti-cloud',
      'Design':      'ti-brand-adobe',
      'Productivity':'ti-file-text',
      'Other':       'ti-package'
    };
    return map[category] || 'ti-receipt';
  }

  /** Format a YYYY-MM-DD string to "1 Jun 2025". */
  formatDate(dateStr) {
    var d = parseRenewalDate(dateStr);
    return d.getDate() + ' ' +
           d.toLocaleString('default', { month: 'short' }) + ' ' +
           d.getFullYear();
  }

  /** Safely escape HTML to prevent XSS in dynamic content. */
  escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

/* Instantiate once the DOM is ready */
document.addEventListener('DOMContentLoaded', function () {
  window.subscriptionManager = new SubscriptionManager();
});


