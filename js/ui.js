// Wire a show/hide eye icon to toggle an input's password visibility.
export function wirePasswordToggle(toggleBtn, input) {
    if (!toggleBtn || !input) return
    toggleBtn.addEventListener('click', function () {
        const showing = input.type === 'text'
        input.type = showing ? 'password' : 'text'
        toggleBtn.textContent = showing ? '👁️' : '🙈'
    })
}
