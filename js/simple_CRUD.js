// simple_CRUD.js - 完整修复版

class SubscriptionManager {
  constructor() {
    this.subscriptions = [];
    this.currentFilter = 'all';
    this.searchTerm = '';
    this.init();
  }

  init() {
    this.loadData();
    this.bindEvents();
    this.render();
    this.updateStats();
  }

  loadData() {
    const stored = localStorage.getItem('subscriptions');
    if (stored) {
      this.subscriptions = JSON.parse(stored);
    } else {
      this.subscriptions = [
        { id: 1, name: 'Netflix', category: 'Streaming', cost: 54.90, renewalDate: '2025-06-01', status: 'active', notes: '' },
        { id: 2, name: 'Spotify', category: 'Music', cost: 17.90, renewalDate: '2025-06-15', status: 'active', notes: '' },
        { id: 3, name: 'iCloud 200GB', category: 'Storage', cost: 5.90, renewalDate: '2025-06-22', status: 'cancelled', notes: '' },
        { id: 4, name: 'Adobe CC', category: 'Design', cost: 109.00, renewalDate: '2025-06-30', status: 'active', notes: '' }
      ];
      this.saveData();
    }
  }

  saveData() {
    localStorage.setItem('subscriptions', JSON.stringify(this.subscriptions));
    this.updateStats();
  }

  updateStats() {
    const activeSubs = this.subscriptions.filter(s => s.status === 'active');
    const cancelledSubs = this.subscriptions.filter(s => s.status === 'cancelled');
    const totalMonthly = activeSubs.reduce((sum, s) => sum + s.cost, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewingSoon = activeSubs.filter(s => {
      const renewDate = new Date(s.renewalDate);
      renewDate.setHours(0, 0, 0, 0);
      const diffTime = renewDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });

    const totalMonthlyEl = document.getElementById('totalMonthly');
    const activeCountEl = document.getElementById('activeCount');
    const activeSubCountEl = document.getElementById('activeSubCount');
    const cancelledCountEl = document.getElementById('cancelledCount');
    const renewingSoonCountEl = document.getElementById('renewingSoonCount');

    if (totalMonthlyEl) totalMonthlyEl.innerHTML = `RM ${totalMonthly.toFixed(2)}`;
    if (activeCountEl) activeCountEl.innerHTML = activeSubs.length;
    if (activeSubCountEl) activeSubCountEl.innerHTML = activeSubs.length;
    if (cancelledCountEl) cancelledCountEl.innerHTML = cancelledSubs.length;
    if (renewingSoonCountEl) renewingSoonCountEl.innerHTML = renewingSoon.length;
  }

  createSubscription(formData) {
    const newSubscription = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      cost: parseFloat(formData.cost),
      renewalDate: formData.renewalDate,
      status: formData.status,
      notes: formData.notes || ''
    };
    this.subscriptions.push(newSubscription);
    this.saveData();
    this.render();
    this.showToast('Subscription added successfully!', 'success');
  }

  updateSubscription(id, formData) {
    const index = this.subscriptions.findIndex(sub => sub.id === id);
    if (index !== -1) {
      this.subscriptions[index] = {
        id: id,
        name: formData.name,
        category: formData.category,
        cost: parseFloat(formData.cost),
        renewalDate: formData.renewalDate,
        status: formData.status,
        notes: formData.notes || ''
      };
      this.saveData();
      this.render();
      this.showToast('Subscription updated successfully!', 'success');  // 修复：加上 this.
    }
  }

  deleteSubscription(id) {
    const subscription = this.subscriptions.find(sub => sub.id === id);
    if (!subscription) return;
    
    this.showConfirmDialog(
      'Are you sure you want to delete',
      subscription.name,
      () => {
        this.subscriptions = this.subscriptions.filter(sub => sub.id !== id);
        this.saveData();
        this.render();
        this.showToast('Subscription deleted successfully!', 'success');
      }
    );
  }

  // ========== 自定义通知 ==========
  showToast(message, type = 'success') {
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    
    let icon = '';
    if (type === 'success') icon = 'ti ti-circle-check';
    else if (type === 'error') icon = 'ti ti-alert-circle';
    else if (type === 'warning') icon = 'ti ti-alert-triangle';
    else icon = 'ti ti-info-circle';
    
    toast.innerHTML = `
      <i class="${icon}"></i>
      <div class="toast-content">${message}</div>
      <i class="ti ti-x toast-close"></i>
    `;
    
    document.body.appendChild(toast);
    
    toast.querySelector('.toast-close').onclick = () => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    };
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, 3000);
  }

  // ========== 自定义删除确认对话框 ==========
  showConfirmDialog(message, subscriptionName, onConfirm) {
    const existingDialog = document.querySelector('.custom-dialog-overlay');
    if (existingDialog) existingDialog.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'custom-dialog-overlay';
    
    overlay.innerHTML = `
      <div class="custom-dialog">
        <div class="custom-dialog-header">
          <i class="ti ti-trash"></i>
          <h3>Delete Subscription</h3>
        </div>
        <div class="custom-dialog-body">
          ${message} <span class="subscription-name">"${subscriptionName}"</span> ?
          <div style="margin-top: 8px; font-size: 12px; color: var(--mc-200);">This action cannot be undone.</div>
        </div>
        <div class="custom-dialog-footer">
          <button class="dialog-cancel">Cancel</button>
          <button class="dialog-confirm">Delete</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('.dialog-cancel').onclick = () => {
      overlay.remove();
    };
    
    overlay.querySelector('.dialog-confirm').onclick = () => {
      onConfirm();
      overlay.remove();
    };
    
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };
    
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  getFilteredSubscriptions() {
    let filtered = [...this.subscriptions];
    
    if (this.currentFilter !== 'all') {
      if (this.currentFilter === 'active') {
        filtered = filtered.filter(sub => sub.status === 'active');
      } else if (this.currentFilter === 'cancelled') {
        filtered = filtered.filter(sub => sub.status === 'cancelled');
      } else if (this.currentFilter === 'renewing-soon') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(sub => {
          if (sub.status !== 'active') return false;
          const renewDate = new Date(sub.renewalDate);
          renewDate.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((renewDate - today) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 7;
        });
      }
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.name.toLowerCase().includes(term) || 
        sub.category.toLowerCase().includes(term)
      );
    }
    
    filtered.sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate));
    return filtered;
  }

  render() {
    const container = document.getElementById('subscriptionsTable');
    if (!container) return;
    
    const filteredSubs = this.getFilteredSubscriptions();
    
    if (filteredSubs.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 60px; color: var(--mc-200);">No subscription data</div>`;
      return;
    }
    
    let html = `<div class="table-head">
      <div class="th">Service</div>
      <div class="th">Cost / mo</div>
      <div class="th">Renewal Date</div>
      <div class="th">Status</div>
      <div class="th"></div>
    </div>`;
    
    for (let sub of filteredSubs) {
      const statusClass = sub.status === 'active' ? 'badge-active' : 'badge-cancelled';
      const statusText = sub.status === 'active' ? 'Active' : 'Cancelled';
      const icon = this.getIcon(sub.category);
      
      html += `<div class="table-row">
        <div class="sub-name-wrap">
          <div class="sub-icon"><i class="ti ${icon}"></i></div>
          <div>
            <div class="sub-name">${this.escapeHtml(sub.name)}</div>
            <div class="sub-category">${sub.category}</div>
          </div>
        </div>
        <div class="td">RM ${sub.cost.toFixed(2)}</div>
        <div class="td">${this.formatDate(sub.renewalDate)}</div>
        <div class="td" style="display: flex; align-items: center; justify-content: space-between;">
          <span class="badge ${statusClass}">
            <span class="badge-dot"></span>${statusText}
          </span>
          <button class="status-menu-btn" data-id="${sub.id}" style="background: #000000; border: 1px solid #555555; color: white; cursor: pointer; padding: 6px 12px; border-radius: 6px; margin-left: 10px;">
            ⋮
          </button>
        </div>
        <div class="row-actions">
          <button class="icon-btn edit-btn" data-id="${sub.id}"><i class="ti ti-edit"></i></button>
          <button class="icon-btn delete-btn" data-id="${sub.id}"><i class="ti ti-trash"></i></button>
        </div>
      </div>`;
    }
    
    container.innerHTML = html;
    this.attachButtonEvents();
  }

  getIcon(category) {
    const icons = {
      'Streaming': 'ti-device-tv',
      'Music': 'ti-music',
      'Storage': 'ti-cloud',
      'Design': 'ti-brand-adobe',
      'Productivity': 'ti-file-text',
      'Other': 'ti-package'
    };
    return icons[category] || 'ti-receipt';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  attachButtonEvents() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.openEditModal(parseInt(btn.dataset.id));
      };
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.deleteSubscription(parseInt(btn.dataset.id));
      };
    });
    
    document.querySelectorAll('.status-menu-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        this.showStatusMenu(e.target, id);
      };
    });
  }

  showStatusMenu(element, id) {
    const existingMenu = document.querySelector('.status-popup-menu');
    if (existingMenu) existingMenu.remove();
    
    const rect = element.getBoundingClientRect();
    
    const menu = document.createElement('div');
    menu.className = 'status-popup-menu';
    menu.style.cssText = `
      position: fixed;
      top: ${rect.bottom + 5}px;
      left: ${rect.left}px;
      background: #2d1e17;
      border: 1px solid #5b3d2e;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      min-width: 120px;
      overflow: hidden;
    `;
    
    menu.innerHTML = `
      <div class="menu-item" data-action="edit" style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; cursor: pointer; color: #fadcb6; font-size: 13px;">
        <i class="ti ti-edit"></i>
        <span>Edit</span>
      </div>
      <div class="menu-item" data-action="delete" style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; cursor: pointer; color: #ef4444; font-size: 13px; border-top: 1px solid #5b3d2e;">
        <i class="ti ti-trash"></i>
        <span>Delete</span>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    menu.querySelector('[data-action="edit"]').onclick = () => {
      this.openEditModal(id);
      menu.remove();
    };
    
    menu.querySelector('[data-action="delete"]').onclick = () => {
      this.deleteSubscription(id);
      menu.remove();
    };
    
    const closeMenu = (e) => {
      if (!menu.contains(e.target) && e.target !== element) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  }

  openEditModal(id) {
    const sub = this.subscriptions.find(s => s.id === id);
    if (sub) {
      document.getElementById('editId').value = sub.id;
      document.getElementById('sub-name').value = sub.name;
      document.getElementById('sub-cat').value = sub.category;
      document.getElementById('sub-cost').value = sub.cost;
      document.getElementById('sub-date').value = sub.renewalDate;
      document.getElementById('sub-status').value = sub.status;
      document.getElementById('sub-notes').value = sub.notes || '';
      document.getElementById('modalTitle').textContent = 'Edit Subscription';
      document.getElementById('saveBtn').textContent = 'Update Subscription';
      this.openModal();
    }
  }

  resetForm() {
    document.getElementById('editId').value = '';
    document.getElementById('sub-name').value = '';
    document.getElementById('sub-cat').value = '';
    document.getElementById('sub-cost').value = '';
    document.getElementById('sub-date').value = '';
    document.getElementById('sub-status').value = 'active';
    document.getElementById('sub-notes').value = '';
    document.getElementById('modalTitle').textContent = 'Add Subscription';
    document.getElementById('saveBtn').textContent = 'Add Subscription';
  }

  getFormData() {
    return {
      name: document.getElementById('sub-name').value.trim(),
      category: document.getElementById('sub-cat').value,
      cost: document.getElementById('sub-cost').value,
      renewalDate: document.getElementById('sub-date').value,
      status: document.getElementById('sub-status').value,
      notes: document.getElementById('sub-notes').value.trim()
    };
  }

  validateForm(data) {
    if (!data.name) { this.showToast('Please enter service name', 'error'); return false; }
    if (!data.category) { this.showToast('Please select a category', 'error'); return false; }
    if (!data.cost || data.cost <= 0) { this.showToast('Please enter a valid cost', 'error'); return false; }
    if (!data.renewalDate) { this.showToast('Please select a renewal date', 'error'); return false; }
    return true;
  }

  handleSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('editId').value;
    const formData = this.getFormData();
    if (!this.validateForm(formData)) return;
    if (editId) {
      this.updateSubscription(parseInt(editId), formData);
    } else {
      this.createSubscription(formData);
    }
    this.closeModal();
  }

  openModal() {
    document.getElementById('modalOverlay').classList.add('is-open');
  }

  closeModal() {
    document.getElementById('modalOverlay').classList.remove('is-open');
    this.resetForm();
  }

  bindEvents() {
    const form = document.getElementById('subscriptionForm');
    if (form) form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    const openBtn = document.getElementById('openModalBtn');
    if (openBtn) openBtn.onclick = () => { this.resetForm(); this.openModal(); };
    
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) closeBtn.onclick = () => this.closeModal();
    
    const cancelBtn = document.getElementById('cancelModalBtn');
    if (cancelBtn) cancelBtn.onclick = () => this.closeModal();
    
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.onclick = (e) => { if (e.target === overlay) this.closeModal(); };
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const overlay = document.getElementById('modalOverlay');
        if (overlay && overlay.classList.contains('is-open')) this.closeModal();
      }
    });
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.searchTerm = e.target.value;
          this.render();
        }, 300);
      });
    }
    
    const tabs = document.querySelectorAll('#filterTabs .tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.dataset.filter;
        this.render();
      });
    });
    
    const filterLinks = document.querySelectorAll('.filter-link');
    filterLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = link.dataset.filter;
        this.currentFilter = filter;
        const tabs = document.querySelectorAll('#filterTabs .tab');
        tabs.forEach(tab => {
          if (tab.dataset.filter === filter) {
            tab.classList.add('active');
          } else {
            tab.classList.remove('active');
          }
        });
        this.render();
      });
    });
    
    const viewBtns = document.querySelectorAll('.vbtn');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.subscriptionManager = new SubscriptionManager();
});