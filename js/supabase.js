// window.SUPABASE_CONFIG is set by config.js, loaded as a classic <script> before this module on every page.
// `var` (not const/let): these are top-level in a classic script sharing the page's global scope,
// so a dev-server live-reload that re-runs scripts without a full navigation won't throw a
// "already declared" SyntaxError and brick the page.
var supabaseUrl = window.SUPABASE_CONFIG.url
var supabaseAnonKey = window.SUPABASE_CONFIG.anonKey

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
// Plain classic script (not type="module") so it works even when opened via file://
// without a local server — module scripts are blocked by CORS in that case.
// NAMED supabaseClient, NOT supabase: a top-level `var supabase = ...` would alias
// `window.supabase`, clobbering the Supabase CDN library object (which has `.createClient`)
// with our client instance and breaking every later call to createSupabaseClient().
var supabaseClient = createSupabaseClient()
