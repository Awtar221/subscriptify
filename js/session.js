/* ======================
   session.js
   Session guard for authenticated pages (index.html, subscriptions.html, analytics.html).
   - Redirects to login.html if no session is found.
   - Renders the logged-in user's name and initials in the sidebar.
   - Wires up the logout button.

   Load this BEFORE simple_CRUD.js on any protected page.
   ====================== */

(function initSession() {
  var currentUser = localStorage.getItem('subtrack_current_user');

  // Redirect unauthenticated visitors to the login page
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Populate avatar initials (first two characters of username, uppercased)
  var avatarEl = document.querySelector('.avatar');
  if (avatarEl) {
    avatarEl.textContent = currentUser.substring(0, 2).toUpperCase();
  }

  // Populate display name
  var userNameEl = document.querySelector('.user-name');
  if (userNameEl) {
    userNameEl.textContent = currentUser;
  }

  // Wire up logout — the icon/button must have id="logoutBtn"
  var logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    var doLogout = function () {
      localStorage.removeItem('subtrack_current_user');
      window.location.href = 'login.html';
    };
    logoutBtn.addEventListener('click', doLogout);
    // logoutBtn is an <i> icon, not a native <button> — wire Enter/Space for keyboard users
    logoutBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        doLogout();
      }
    });
  }
})();