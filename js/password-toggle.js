// Wire a show/hide eye icon to toggle an input's password visibility.
// Plain classic script — see supabase.js for why this isn't type="module".
function wirePasswordToggle(toggleBtn, input) {
    if (!toggleBtn || !input) return
    function toggle() {
        const showing = input.type === 'text'
        input.type = showing ? 'password' : 'text'
        toggleBtn.classList.toggle('ti-eye', showing)
        toggleBtn.classList.toggle('ti-eye-off', !showing)
        toggleBtn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password')
    }
    toggleBtn.addEventListener('click', toggle)
    toggleBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() }
    })
}
