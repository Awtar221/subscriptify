// window.SUPABASE_CONFIG is set by config.js, loaded as a classic <script> before this module on every page.
const supabaseUrl = window.SUPABASE_CONFIG.url
const supabaseAnonKey = window.SUPABASE_CONFIG.anonKey

// "Remember me" unchecked at login -> use sessionStorage so the session dies with the tab/browser
// instead of localStorage, which survives restarts. Flag itself is not sensitive, always in localStorage.
function getAuthStorage() {
    return localStorage.getItem('subtrack_remember') === 'false' ? window.sessionStorage : window.localStorage
}

// Factory so login.js can build a fresh client right after setting the remember-me flag,
// since a client's storage is fixed at creation time (a singleton could not pick it up).
function createSupabaseClient() {
    return window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
        auth: { storage: getAuthStorage() }
    })
}

// Shared singleton for pages that just need to read/act on an existing session.
const supabase = createSupabaseClient()

export { supabase, createSupabaseClient }
