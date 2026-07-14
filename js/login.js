import { supabase } from './supabase.js'
import { wirePasswordToggle } from './ui.js'

const form = document.getElementById('login-form')
const errorDiv = document.getElementById('error-message')
const loginText = document.getElementById('loginText')
const loginSpinner = document.getElementById('loginSpinner')

wirePasswordToggle(document.getElementById('togglePassword'), document.getElementById('loginPassword'))

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const email = document.getElementById('loginUsername').value
    const password = document.getElementById('loginPassword').value

    // Show loading
    loginText.classList.add('hidden')
    loginSpinner.classList.add('active')
    errorDiv.style.display = 'none'

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })
        
        if (error) throw error
        
        window.location.href = 'index.html'
        
    } catch (error) {
        showError('Invalid email or password. Please try again.')
    } finally {
        // Hide loading
        loginText.classList.remove('hidden')
        loginSpinner.classList.remove('active')
    }
})

function showError(message) {
    errorDiv.textContent = message
    errorDiv.style.display = 'block'
    setTimeout(() => {
        errorDiv.style.display = 'none'
    }, 5000)
}