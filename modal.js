/* ======================
   modal.js
   Opens and closes the Add Subscription modal.
   No data logic — UI only.
   ====================== */

(function () {
  const overlay     = document.getElementById('modalOverlay');
  const openBtn     = document.getElementById('openModalBtn');
  const closeBtn    = document.getElementById('closeModalBtn');
  const cancelBtn   = document.getElementById('cancelModalBtn');

  function openModal() {
    overlay.classList.add('is-open');
  }

  function closeModal() {
    overlay.classList.remove('is-open');
  }

  if (openBtn)   openBtn.addEventListener('click', openModal);
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeModal();
    }
  });
})();
