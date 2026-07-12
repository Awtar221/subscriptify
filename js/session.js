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

// Require authentication for protected pages
export async function requireAuth() {
    const session = await checkSession()
    if (!session) {
        window.location.href = 'login.html'
    }
    return session
}

// Auto-run when page loads
(async function initSession() {
    const session = await checkSession()
    
    // Redirect unauthenticated visitors to the login page
    if (!session) {
        window.location.href = 'login.html'
        return
    }

    // Get current user
    const user = await getCurrentUser()
    
    // Populate avatar initials (first two characters of email, uppercased)
    const avatarEl = document.querySelector('.avatar')
    if (avatarEl && user) {
        const email = user.email || 'User'
        avatarEl.textContent = email.substring(0, 2).toUpperCase()
    }

    // Populate display name with email
    const userNameEl = document.getElementById('userEmailDisplay')
    if (userNameEl && user) {
        userNameEl.textContent = user.email || 'User'
    }

    // Also populate the old .user-name if it exists
    const oldUserNameEl = document.querySelector('.user-name')
    if (oldUserNameEl && user) {
        oldUserNameEl.textContent = user.email || 'User'
    }

    // Wire up logout — the icon/button must have id="logoutBtn"
    const logoutBtn = document.getElementById('logoutBtn')
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function (e) {
            e.preventDefault()
            await logout()
        })
    }
})()