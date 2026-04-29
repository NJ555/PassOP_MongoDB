import { getPasswordStrength } from '../utils/passwordStrength'

/**
 * Visual password strength meter.
 * Renders 5 color-coded segments and a label (Weak → Very Strong).
 */
export default function StrengthMeter({ password }) {
    if (!password) return null

    const { label, color, segments } = getPasswordStrength(password)

    return (
        <div style={{ marginTop: '0.5rem' }}>
            {/* 5 segment bar */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '0.3rem' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        style={{
                            flex: 1,
                            height: '4px',
                            borderRadius: '2px',
                            background: i <= segments ? color : '#1e293b',
                            transition: 'background 0.3s ease',
                            border: '1px solid #334155',
                        }}
                    />
                ))}
            </div>

            {/* Label */}
            <span
                style={{
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    color: color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    transition: 'color 0.3s ease',
                }}
            >
                {label}
            </span>
        </div>
    )
}
