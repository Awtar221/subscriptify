const supabaseUrl = 'https://stdqfevaqvqajtsrxina.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0ZHFmZXZhcXZxYWp0c3J4aW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NzAzMjksImV4cCI6MjA5OTQ0NjMyOX0.rjBQZQn-zozpY75THyij2eb_5AH88dcN77iDU1DLwLo'

// Use window.supabase from CDN
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey)

export { supabase }