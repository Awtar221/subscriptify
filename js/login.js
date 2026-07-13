import { supabase } from './supabase.js'

const form = document.getElementById('login-form')
const errorDiv = document.getElementById('error-message')
const loginText = document.getElementById('loginText')
const loginSpinner = document.getElementById('loginSpinner')

// Toggle password visibility
const togglePassword = document.getElementById('togglePassword')
const passwordInput = document.getElementById('loginPassword')

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text'
            togglePassword.textContent = '🙈'
        } else {
            passwordInput.type = 'password'
            togglePassword.textContent = '👁️'
        }
    })
}

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const email = document.getElementById('loginUsername').value
    const password = document.getElementById('loginPassword').value
    const rememberMe = document.getElementById('rememberMe')
    
    // Show loading
    loginText.classList.add('hidden')
    loginSpinner.classList.add('active')
    errorDiv.style.display = 'none'
    
    try {
        // Set session options
        const options = {}
        if (rememberMe && rememberMe.checked) {
            // Keep session alive longer (default is already persistent)
            console.log('Remember me enabled')
        }
        
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