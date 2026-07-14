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
      this.subscriptions = [];
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
   
    var parts = s.renewalDate.split(/[/-]/); 
    var d;
    
    if (parts.length === 3) {
        
        if (parts[0].length === 4) {
            d = new Date(parts[0], parts[1] - 1, parts[2]); 
        } else {
            d = new Date(parts[2], parts[1] - 1, parts[0]); 
        }
    } else {
        d = new Date(s.renewalDate); 
    }

    d.setHours(0, 0, 0, 0);
    
    if (isNaN(d.getTime())) return false; 

    var diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
});

    this.setText('totalMonthly',     'RM ' + total.toFixed(2));
    this.setText('activeCount',      active.length);
    this.setText('activeSubCount',   active.length);
    this.setText('cancelledCount',   cancelled.length);
    this.setText('renewingSoonCount', renewingSoon.length);
  }

  /** Set innerHTML of an element by id (no-op if element not found). */
  setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = value;
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
    this.showToast('Subscription added!', 'success');
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
    this.showToast('Subscription updated!', 'success');
  }

  /** Prompt for confirmation then delete a subscription by id. */
  deleteSubscription(id) {
    var sub = this.subscriptions.find(function (s) { return s.id === id; });
    if (!sub) return;

    this.showConfirmDialog(
      'Are you sure you want to delete',
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

    var list = this.getFilteredSubscriptions();

    if (list.length === 0) {
      container.innerHTML = '<div class="empty-state">No subscriptions found.</div>';
      return;
    }


var rows = list.map((sub) => {
      var badgeClass  = sub.status === 'active' ? 'badge-active' : 'badge-cancelled';
      var statusLabel = sub.status === 'active' ? 'Active' : 'Cancelled';
      var icon        = this.getCategoryIcon(sub.category);

      return (
        '<div class="table-row">' +
          '<div class="td sub-name-wrap">' + // 增加 td 类
            '<div class="sub-icon"><i class="ti ' + icon + '"></i></div>' +
            '<div>' +
              '<div class="sub-name">' + this.escapeHtml(sub.name) + '</div>' +
              '<div class="sub-category">' + sub.category + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="td">RM ' + sub.cost.toFixed(2) + '</div>' +
          '<div class="td">' + this.formatDate(sub.renewalDate) + '</div>' +
          '<div class="td">' +
            '<span class="badge ' + badgeClass + '">' +
              '<span class="badge-dot"></span>' + statusLabel +
            '</span>' +
          '</div>' +
          '<div class="td row-actions">' + // 增加 td 类
            '<button class="icon-btn edit-btn" data-id="' + sub.id + '" title="Edit">' +
              '<i class="ti ti-edit"></i>' +
            '</button>' +
            '<button class="icon-btn delete-btn" data-id="' + sub.id + '" title="Delete">' +
              '<i class="ti ti-trash"></i>' +
            '</button>' +
            '<button class="status-menu-btn" data-id="' + sub.id + '">&#8942;</button>' +
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
    '<div class="th" style="justify-content: flex-end;">Actions</div>' + // 这里加个样式靠右对齐
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
    document.getElementById('modalTitle').textContent = 'Edit Subscription';
    document.getElementById('saveBtn').textContent    = 'Update Subscription';

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
    if (!data.name)                { this.showToast('Please enter a service name.', 'error'); return false; }
    if (!data.category)            { this.showToast('Please select a category.', 'error');    return false; }
    if (!data.cost || data.cost <= 0) { this.showToast('Please enter a valid cost.', 'error');  return false; }
    if (!data.renewalDate)         { this.showToast('Please select a renewal date.', 'error'); return false; }
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
    toast.innerHTML =
      '<i class="' + (iconMap[type] || 'ti ti-info-circle') + '"></i>' +
      '<div class="toast-content">' + message + '</div>' +
      '<i class="ti ti-x toast-close"></i>';

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
          '<h3>Delete Subscription</h3>' +
        '</div>' +
        '<div class="custom-dialog-body">' +
          message + ' <span class="subscription-name">"' + subscriptionName + '"</span>?' +
          '<span class="dialog-note">This action cannot be undone.</span>' +
        '</div>' +
        '<div class="custom-dialog-footer">' +
          '<button class="dialog-cancel">Cancel</button>' +
          '<button class="dialog-confirm">Delete</button>' +
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

