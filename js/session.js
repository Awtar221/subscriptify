/* ======================
   session.js
   Session guard for authenticated pages (index.html, subscriptions.html, analytics.html).
   - Uses Supabase authentication
   - Redirects to login.html if no session is found.
   - Renders the logged-in user's email in the sidebar.
   - Wires up the logout button.

   Loaded as type="module" BEFORE simple_CRUD.js on any protected page.
   ====================== */

import { supabase } from './supabase.js'

// This file is loaded from both the site root (index.html) and pages/*.html.
// login.html lives in pages/, so the relative path to it differs depending on where we are.
const loginPath = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html'

export async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export function logout() {
    localStorage.removeItem('subtrack_current_user')
    supabase.auth.signOut().catch((err) => console.error('signOut failed:', err))
    window.location.href = loginPath
}

// Wire up logout first — any element with id="logoutBtn" (icon or link) —
// so a failure in the session check below can never leave the button dead.
document.querySelectorAll('#logoutBtn').forEach((btn) => {
    btn.addEventListener('click', (e) => { e.preventDefault(); logout() })
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); logout() }
    })
})

try {
    const session = await checkSession()
    if (!session) {
        window.location.href = loginPath
    } else {
        const user = await getCurrentUser()
        if (user) {
            document.querySelectorAll('.user-name').forEach((el) => { el.textContent = user.email })
        }
    }
} catch (err) {
    console.error('Session check failed:', err)
}
