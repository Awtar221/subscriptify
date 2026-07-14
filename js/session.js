/* ======================
   session.js
   Session guard for authenticated pages (index.html, subscriptions.html, analytics.html).
   - Uses Supabase authentication
   - Redirects to login.html if no session is found.
   - Renders the logged-in user's email in the sidebar.
   - Wires up the logout button.

   Load this BEFORE simple_CRUD.js on any protected page.
   ====================== */

import { supabase } from './supabase.js'

// Check if user is logged in
export async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

// Get current user
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

// Logout
export async function logout() {
    await supabase.auth.signOut()
    window.location.href = 'login.html'
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