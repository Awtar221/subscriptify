import { supabase } from './supabase.js'

const form = document.getElementById('login-form')
const errorDiv = document.getElementById('error-message')

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const email = document.getElementById('loginUsername').value
    const password = document.getElementById('loginPassword').value
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })
        
        if (error) throw error
        
        window.location.href = 'index.html'
        
    } catch (error) {
        showError('Invalid email or password. Please try again.')
    }
})

function showError(message) {
    errorDiv.textContent = message
    errorDiv.style.display = 'block'
    setTimeout(() => {
        errorDiv.style.display = 'none'
    }, 5000)
}