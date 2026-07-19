/* ======================
   session.js
   Session guard for authenticated pages (index.html, subscriptions.html, analytics.html).
   - Uses Supabase authentication
   - Redirects to login.html if no session is found.
   - Renders the logged-in user's email in the sidebar.
   - Wires up the logout button.

   Plain classic script (not type="module") — see supabase.js. Must load AFTER
   config.js + supabase.js and BEFORE subscriptions.js on any protected page.
   ====================== */

// This file is loaded from both the site root (index.html) and pages/*.html.
// login.html lives in pages/, so the relative path to it differs depending on where we are.
// `var`, not const — see supabase.js for why (safe if this script re-runs via live-reload).
var loginPath = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html'

async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession()
    return session
}

async function getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser()
    return user
}

function logout() {
    localStorage.removeItem('subtrack_current_user')
    supabaseClient.auth.signOut().catch((err) => console.error('signOut failed:', err))
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

// User pill toggles the collapsed logout action beneath it.
var userPill = document.getElementById('userPill')
if (userPill) {
    userPill.addEventListener('click', () => {
        var footer = userPill.closest('.sidebar-footer')
        var open = footer.classList.toggle('is-open')
        userPill.setAttribute('aria-expanded', open)
    })
}

// The page starts hidden (see the inline `style="visibility:hidden"` on <html>) so an
// unauthenticated visitor never sees a flash of dashboard content before this redirects them.
// Wrapped in an async IIFE since top-level `await` isn't valid in a classic (non-module) script.
;(async () => {
    try {
        const session = await checkSession()
        if (!session) {
            window.location.href = loginPath
        } else {
            const user = await getCurrentUser()
            if (user) {
                document.querySelectorAll('.user-name').forEach((el) => { el.textContent = user.email })
            }
            document.documentElement.style.visibility = 'visible'
        }
    } catch (err) {
        console.error('Session check failed:', err)
        window.location.href = loginPath
    }
})()
