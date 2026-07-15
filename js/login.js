// Plain classic script — see supabase.js for why this isn't type="module".
// Loaded after config.js, supabase.js, and ui.js. `var`, not const — see supabase.js.
var form = document.getElementById('login-form')
var errorDiv = document.getElementById('error-message')
var loginText = document.getElementById('loginText')
var loginSpinner = document.getElementById('loginSpinner')

wirePasswordToggle(document.getElementById('togglePassword'), document.getElementById('loginPassword'))

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const email = document.getElementById('loginUsername').value
    const password = document.getElementById('loginPassword').value
    const rememberMe = document.getElementById('rememberMe').checked

    // Must be set before creating the client, since a client's storage is fixed at creation time.
    localStorage.setItem('subtrack_remember', rememberMe ? 'true' : 'false')
    const freshSupabaseClient = createSupabaseClient()

    // Show loading
    loginText.classList.add('hidden')
    loginSpinner.classList.add('active')
    errorDiv.classList.remove('is-visible')

    try {
        const { data, error } = await freshSupabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        })

        if (error) throw error

        // Cinematic exit wipe (auth-fx.js), then redirect; falls through instantly without it.
        if (window.authFxExit) {
            window.authFxExit(function () { window.location.href = '../index.html' })
        } else {
            window.location.href = '../index.html'
        }

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
    errorDiv.classList.add('is-visible')
    if (window.authFxShake) window.authFxShake()
    setTimeout(() => {
        errorDiv.classList.remove('is-visible')
    }, 5000)
}