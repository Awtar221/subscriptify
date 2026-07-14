import { supabase } from './supabase.js'
import { wirePasswordToggle } from './ui.js'

const form = document.getElementById('register-form')
const errorDiv = document.getElementById('error-message')
const registerText = document.getElementById('registerText')
const registerSpinner = document.getElementById('registerSpinner')

const passwordInput = document.getElementById('regPassword')
wirePasswordToggle(document.getElementById('togglePassword'), passwordInput)
wirePasswordToggle(document.getElementById('toggleConfirmPassword'), document.getElementById('regConfirm'))

// Password strength indicator
const strengthFill = document.getElementById('strengthFill')
const strengthText = document.getElementById('strengthText')

passwordInput.addEventListener('input', function() {
    const password = this.value
    const strength = getPasswordStrength(password)
    
    strengthFill.style.width = strength.percentage + '%'
    strengthFill.style.background = strength.color
    strengthText.textContent = strength.label
    strengthText.style.color = strength.color
})

function getPasswordStrength(password) {
    if (password.length === 0) {
        return { percentage: 0, color: '#e0e0e0', label: 'Enter a password' }
    }
    if (password.length < 6) {
        return { percentage: 25, color: '#ff4444', label: 'Too short (min 6 characters)' }
    }
    
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++
    
    const strengths = [
        { percentage: 30, color: '#ff4444', label: 'Weak' },
        { percentage: 50, color: '#ff9800', label: 'Fair' },
        { percentage: 70, color: '#ffc107', label: 'Good' },
        { percentage: 90, color: '#4CAF50', label: 'Strong' },
        { percentage: 100, color: '#2e7d32', label: 'Very Strong' }
    ]
    
    const index = Math.min(score, strengths.length - 1)
    return strengths[index]
}

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
    
    // Show loading
    registerText.classList.add('hidden')
    registerSpinner.classList.add('active')
    errorDiv.style.display = 'none'
    removeSuccess()
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        })
        
        if (error) throw error
        
        // Show success message on page
        showSuccess('Registration successful! Please login.')
        setTimeout(() => {
            window.location.href = 'login.html'
        }, 2000)
        
    } catch (error) {
        showError(error.message)
    } finally {
        // Hide loading
        registerText.classList.remove('hidden')
        registerSpinner.classList.remove('active')
    }
})

function showError(message) {
    errorDiv.textContent = message
    errorDiv.style.display = 'block'
    setTimeout(() => {
        errorDiv.style.display = 'none'
    }, 5000)
}

function showSuccess(message) {
    const successDiv = document.createElement('div')
    successDiv.id = 'success-message'
    successDiv.style.cssText = 'background:#4CAF50; color:white; padding:10px; border-radius:6px; margin-bottom:15px; text-align:center;'
    successDiv.textContent = message
    
    // Remove old success message if exists
    removeSuccess()
    
    // Insert after error message
    errorDiv.parentNode.insertBefore(successDiv, errorDiv.nextSibling)
}

function removeSuccess() {
    const oldSuccess = document.getElementById('success-message')
    if (oldSuccess) oldSuccess.remove()
}