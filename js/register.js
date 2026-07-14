// Plain classic script — see supabase.js for why this isn't type="module".
// Loaded after config.js, supabase.js, and ui.js. `var`, not const — see supabase.js.
var form = document.getElementById('register-form')
var errorDiv = document.getElementById('error-message')
var registerText = document.getElementById('registerText')
var registerSpinner = document.getElementById('registerSpinner')

var passwordInput = document.getElementById('regPassword')
wirePasswordToggle(document.getElementById('togglePassword'), passwordInput)
wirePasswordToggle(document.getElementById('toggleConfirmPassword'), document.getElementById('regConfirm'))

// Password strength indicator
var strengthFill = document.getElementById('strengthFill')
var strengthText = document.getElementById('strengthText')

passwordInput.addEventListener('input', function() {
    const password = this.value
    const strength = getPasswordStrength(password)

    strengthFill.style.transform = 'scaleX(' + (strength.percentage / 100) + ')'
    strengthFill.style.background = strength.color
    strengthText.textContent = strength.label
    strengthText.style.color = strength.color
})

function getPasswordStrength(password) {
    if (password.length === 0) {
        return { percentage: 0, color: 'var(--mc-500)', label: 'Enter a password' }
    }
    if (password.length < 6) {
        return { percentage: 25, color: 'var(--danger)', label: 'Too short (min 6 characters)' }
    }

    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    const strengths = [
        { percentage: 30, color: 'var(--danger)', label: 'Weak' },
        { percentage: 50, color: 'var(--warning)', label: 'Fair' },
        { percentage: 70, color: 'var(--attention)', label: 'Good' },
        { percentage: 90, color: 'var(--success)', label: 'Strong' },
        { percentage: 100, color: 'color-mix(in oklch, var(--success) 80%, black)', label: 'Very Strong' }
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
    errorDiv.classList.remove('is-visible')
    removeSuccess()

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        })

        if (error) throw error

        // Show success message on page
        showSuccess('Registration successful! Please log in.')
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
    errorDiv.classList.add('is-visible')
    setTimeout(() => {
        errorDiv.classList.remove('is-visible')
    }, 5000)
}

function showSuccess(message) {
    removeSuccess()
    const successDiv = document.createElement('div')
    successDiv.id = 'success-message'
    successDiv.className = 'auth-banner success is-visible'
    successDiv.setAttribute('role', 'status')
    successDiv.textContent = message
    errorDiv.parentNode.insertBefore(successDiv, errorDiv.nextSibling)
}

function removeSuccess() {
    const oldSuccess = document.getElementById('success-message')
    if (oldSuccess) oldSuccess.remove()
}