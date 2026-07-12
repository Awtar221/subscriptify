import { supabase } from './supabase.js'

const form = document.getElementById('register-form')
const errorDiv = document.getElementById('error-message')

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const email = document.getElementById('regUsername').value
    const password = document.getElementById('regPassword').value
    const confirmPassword = document.getElementById('regConfirm').value
    
    // Validate password match
    if (password !== confirmPassword) {
        showError('Passwords do not match!')
        return
    }
    
    // Validate password length
    if (password.length < 6) {
        showError('Password must be at least 6 characters!')
        return
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        })
        
        if (error) throw error
        
        alert('Registration successful! Please login.')
        window.location.href = 'login.html'
        
    } catch (error) {
        showError(error.message)
    }
})

function showError(message) {
    errorDiv.textContent = message
    errorDiv.style.display = 'block'
    setTimeout(() => {
        errorDiv.style.display = 'none'
    }, 5000)
}