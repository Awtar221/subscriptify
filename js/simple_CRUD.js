/* ======================
   simple_CRUD.js
   SubscriptionManager class — full CRUD for subscriptions.
   Reads/writes to localStorage under the key 'subscriptions'.
   Renders the subscription table and stat cards dynamically.

   Loaded by: index.html, pages/subscriptions.html
   ====================== */

class SubscriptionManager {
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
    var stored = localStorage.getItem('subscriptions');
    if (stored) {
      this.subscriptions = JSON.parse(stored);
    } else {
      // Demo seed data shown on first run
      this.subscriptions = [
        { id: 1,  name: 'Netflix',        category: 'Streaming',    cost: 54.90,  renewalDate: '2025-06-01', status: 'active',    notes: '' },
        { id: 2,  name: 'Spotify',        category: 'Music',        cost: 17.90,  renewalDate: '2025-06-15', status: 'active',    notes: '' },
        { id: 3,  name: 'iCloud 200GB',   category: 'Storage',      cost: 5.90,   renewalDate: '2025-06-22', status: 'cancelled', notes: '' },
        { id: 4,  name: 'Adobe CC',       category: 'Design',       cost: 109.00, renewalDate: '2025-06-30', status: 'active',    notes: '' },
        { id: 5,  name: 'Disney+',        category: 'Streaming',    cost: 29.90,  renewalDate: '2025-07-03', status: 'active',    notes: '' },
        { id: 6,  name: 'YouTube Premium',category: 'Streaming',    cost: 20.90,  renewalDate: '2025-07-08', status: 'cancelled', notes: '' },
        { id: 7,  name: 'Notion',         category: 'Productivity', cost: 32.00,  renewalDate: '2025-07-05', status: 'active',    notes: '' },
        { id: 8,  name: 'Microsoft 365',  category: 'Productivity', cost: 25.90,  renewalDate: '2025-07-12', status: 'active',    notes: '' },
        { id: 9,  name: 'Google One',     category: 'Storage',      cost: 9.90,   renewalDate: '2025-07-01', status: 'active',    notes: '' },
        { id: 10, name: 'Apple Music',    category: 'Music',        cost: 15.90,  renewalDate: '2025-07-20', status: 'cancelled', notes: '' },
        { id: 11, name: 'Canva Pro',      category: 'Design',       cost: 22.00,  renewalDate: '2025-07-02', status: 'active',    notes: '' },
        { id: 12, name: 'PS Plus',        category: 'Other',        cost: 39.90,  renewalDate: '2025-07-18', status: 'active',    notes: '' }
      ];
      this.saveData();
    }
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

    // Count active subs renewing within 7 days from today
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var renewingSoon = active.filter(function (s) {
      var d    = new Date(s.renewalDate);
      d.setHours(0, 0, 0, 0);
      var diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 7;
    });

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
    this.showToast('Added! Welcome to the list.', 'success');
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
    this.showToast('Updated! Looking good.', 'success');
  }

  /** Prompt for confirmation then delete a subscription by id. */
  deleteSubscription(id) {
    var sub = this.subscriptions.find(function (s) { return s.id === id; });
    if (!sub) return;

    this.showConfirmDialog(
      'Ready to say goodbye to',
      sub.name,
      () => {
        this.subscriptions = this.subscriptions.filter(function (s) { return s.id !== id; });
        this.saveData();
        this.render();
        this.showToast('Gone. Bye bye!', 'success');
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
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter(function (s) {
        if (s.status !== 'active') return false;
        var d    = new Date(s.renewalDate);
        d.setHours(0, 0, 0, 0);
        var diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 7;
      });
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
    result.sort(function (a, b) {
      return new Date(a.renewalDate) - new Date(b.renewalDate);
    });

    return result;
  }

  /* ===== RENDERING ===== */

  /** Re-render the subscription table from the filtered list. */
  render() {
    var container = document.getElementById('subscriptionsTable');
    if (!container) return;

    var list = this.getFilteredSubscriptions();

    if (list.length === 0) {
      container.innerHTML = '<div class="empty-state">Nothing here. Add a sub to get started!</div>';
      return;
    }

    var rows = list.map((sub) => {
      var badgeClass  = sub.status === 'active' ? 'badge-active' : 'badge-cancelled';
      var statusLabel = sub.status === 'active' ? 'Active' : 'Cancelled';
      var icon        = this.getCategoryIcon(sub.category);

      return (
        '<div class="table-row">' +
          '<div class="sub-name-wrap">' +
            '<div class="sub-icon"><i class="ti ' + icon + '"></i></div>' +
            '<div>' +
              '<div class="sub-name">' + this.escapeHtml(sub.name) + '</div>' +
              '<div class="sub-category">' + sub.category + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="td">RM ' + sub.cost.toFixed(2) + '</div>' +
          '<div class="td">' + this.formatDate(sub.renewalDate) + '</div>' +
          '<div class="td" style="display:flex;align-items:center;">' +
            '<span class="badge ' + badgeClass + '">' +
              '<span class="badge-dot"></span>' + statusLabel +
            '</span>' +
            '<button class="status-menu-btn" data-id="' + sub.id + '" aria-label="More actions for ' + this.escapeHtml(sub.name) + '">&#8942;</button>' +
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
        '<div class="th"></div>' +
      '</div>' +
      rows.join('');

    this.attachRowEvents();
  }

  /** Attach click handlers to edit, delete, and three-dot buttons after render. */
  attachRowEvents() {
    document.querySelectorAll('.edit-btn').forEach((btn) => {
      btn.onclick = (e) => { e.stopPropagation(); this.openEditModal(parseInt(btn.dataset.id)); };
    });

    document.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.onclick = (e) => { e.stopPropagation(); this.deleteSubscription(parseInt(btn.dataset.id)); };
    });

    document.querySelectorAll('.status-menu-btn').forEach((btn) => {
      btn.onclick = (e) => { e.stopPropagation(); this.showStatusMenu(btn, parseInt(btn.dataset.id)); };
    });
  }

  /* ===== CONTEXT MENU (three-dot) ===== */

  /** Show a small floating menu near the clicked button. */
  showStatusMenu(triggerEl, id) {
    // Remove any existing menu first
    var existing = document.querySelector('.status-popup-menu');
    if (existing) existing.remove();

    var rect = triggerEl.getBoundingClientRect();
    var menu = document.createElement('div');
    menu.className = 'status-popup-menu';
    menu.style.top  = (rect.bottom + 5) + 'px';
    menu.style.left = rect.left + 'px';

    menu.innerHTML =
      '<div class="menu-item" data-action="edit"><i class="ti ti-edit"></i><span>Edit</span></div>' +
      '<div class="menu-item danger" data-action="delete"><i class="ti ti-trash"></i><span>Delete</span></div>';

    document.body.appendChild(menu);

    menu.querySelector('[data-action="edit"]').onclick   = () => { this.openEditModal(id); menu.remove(); };
    menu.querySelector('[data-action="delete"]').onclick = () => { this.deleteSubscription(id); menu.remove(); };

    // Close menu when clicking elsewhere
    setTimeout(function () {
      document.addEventListener('click', function handler() {
        menu.remove();
        document.removeEventListener('click', handler);
      });
    }, 0);
  }

  /* ===== MODAL ===== */

  openModal() {
    var overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.add('is-open');
  }

  closeModal() {
    var overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('is-open');
    this.resetForm();
  }

  /** Pre-fill the modal form for editing an existing subscription. */
  openEditModal(id) {
    var sub = this.subscriptions.find(function (s) { return s.id === id; });
    if (!sub) return;

    document.getElementById('editId').value      = sub.id;
    document.getElementById('sub-name').value    = sub.name;
    document.getElementById('sub-cat').value     = sub.category;
    document.getElementById('sub-cost').value    = sub.cost;
    document.getElementById('sub-date').value    = sub.renewalDate;
    document.getElementById('sub-status').value  = sub.status;
    document.getElementById('sub-notes').value   = sub.notes || '';
    document.getElementById('modalTitle').textContent = 'Edit This Sub';
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
    if (titleEl) titleEl.textContent = 'Add a Sub';
    var saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.textContent = 'Add It';
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
    if (!data.name)                { this.showToast('Give it a name first!', 'error'); return false; }
    if (!data.category)            { this.showToast('Pick a category.', 'error');    return false; }
    if (!data.cost || data.cost <= 0) { this.showToast('That cost doesn\'t look right.', 'error');  return false; }
    if (!data.renewalDate)         { this.showToast('When does this renew?', 'error'); return false; }
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

    // Sidebar filter links — sync with tabs
    var filterLinks = document.querySelectorAll('.filter-link');
    filterLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentFilter = link.dataset.filter;
        tabs.forEach(function (tab) {
          tab.classList.toggle('active', tab.dataset.filter === link.dataset.filter);
        });
        this.render();
      });
    });

    // View toggle (list / grid) — UI only for now
    var viewBtns = document.querySelectorAll('.vbtn');
    viewBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        viewBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
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

    document.body.appendChild(toast);

    // Manual close
    toast.querySelector('.toast-close').onclick = function () {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(function () { toast.remove(); }, 300);
    };

    // Auto-dismiss after 3 seconds
    setTimeout(function () {
      if (toast.parentNode) {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(function () { toast.remove(); }, 300);
      }
    }, 3000);
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
          '<h3>Wait, Really?</h3>' +
        '</div>' +
        '<div class="custom-dialog-body">' +
          message + ' <span class="subscription-name">"' + this.escapeHtml(subscriptionName) + '"</span>?' +
          '<span class="dialog-note">No undo button here — it\'s gone for good.</span>' +
        '</div>' +
        '<div class="custom-dialog-footer">' +
          '<button class="dialog-cancel">Never Mind</button>' +
          '<button class="dialog-confirm">Yep, Delete It</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.querySelector('.dialog-cancel').onclick  = function () { overlay.remove(); };
    overlay.querySelector('.dialog-confirm').onclick = function () { onConfirm(); overlay.remove(); };
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };

    // Close on Escape
    var escHandler = function (e) {
      if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', escHandler); }
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
    var d = new Date(dateStr);
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