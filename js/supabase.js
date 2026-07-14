const { url: supabaseUrl, anonKey: supabaseAnonKey } = window.SUPABASE_CONFIG

// Use window.supabase from CDN
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey)

export { supabase }