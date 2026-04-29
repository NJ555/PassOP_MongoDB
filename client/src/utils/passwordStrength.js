/**
 * Calculates a password strength score from 0 to 100.
 * Returns { score, label, color } for rendering the visual meter.
 */
export const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '#475569', segments: 0 }

    let score = 0
    const checks = {
        length8: password.length >= 8,
        length12: password.length >= 12,
        length16: password.length >= 16,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /[0-9]/.test(password),
        symbols: /[^a-zA-Z0-9]/.test(password),
        noRepeat: !/(.)\1{2,}/.test(password), // No 3+ repeated chars
    }

    if (checks.length8) score += 15
    if (checks.length12) score += 15
    if (checks.length16) score += 10
    if (checks.lowercase) score += 10
    if (checks.uppercase) score += 15
    if (checks.numbers) score += 15
    if (checks.symbols) score += 15
    if (checks.noRepeat) score += 5

    score = Math.min(score, 100)

    let label, color, segments
    if (score < 30) {
        label = 'Weak'; color = '#f87171'; segments = 1
    } else if (score < 55) {
        label = 'Fair'; color = '#fb923c'; segments = 2
    } else if (score < 75) {
        label = 'Good'; color = '#facc15'; segments = 3
    } else if (score < 90) {
        label = 'Strong'; color = '#4ade80'; segments = 4
    } else {
        label = 'Very Strong'; color = '#6366f1'; segments = 5
    }

    return { score, label, color, segments }
}
