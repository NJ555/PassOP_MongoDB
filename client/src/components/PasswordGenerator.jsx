import { useState, useCallback } from 'react'
import { RefreshCw, Copy, Check, Sliders } from 'lucide-react'
import toast from 'react-hot-toast'

const CHARS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

/**
 * Generates a cryptographically-random password using crypto.getRandomValues.
 * Falls back gracefully if a character set is empty.
 */
const generatePassword = (length, opts) => {
    let charset = CHARS.lower
    if (opts.uppercase) charset += CHARS.upper
    if (opts.numbers) charset += CHARS.numbers
    if (opts.symbols) charset += CHARS.symbols

    const arr = new Uint32Array(length)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, (n) => charset[n % charset.length]).join('')
}

/**
 * PasswordGenerator
 *
 * A self-contained password generator with:
 *  - Length slider (8–64 chars)
 *  - Toggles for uppercase, numbers, symbols
 *  - One-click copy
 *  - onSelect callback to inject the password into a form field
 */
export default function PasswordGenerator({ onSelect }) {
    const [options, setOptions] = useState({
        length: 16,
        uppercase: true,
        numbers: true,
        symbols: true,
    })
    const [generated, setGenerated] = useState(() => generatePassword(16, { uppercase: true, numbers: true, symbols: true }))
    const [copied, setCopied] = useState(false)

    const regenerate = useCallback((opts = options) => {
        setGenerated(generatePassword(opts.length, opts))
        setCopied(false)
    }, [options])

    const toggle = (key) => {
        setOptions((prev) => {
            const next = { ...prev, [key]: !prev[key] }
            regenerate(next)
            return next
        })
    }

    const changeLength = (v) => {
        const next = { ...options, length: Number(v) }
        setOptions(next)
        regenerate(next)
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generated)
            setCopied(true)
            toast.success('Password copied!')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Copy failed')
        }
    }

    const useThis = () => {
        onSelect?.(generated)
    }

    const optionBtn = (label, key) => (
        <button
            type="button"
            onClick={() => toggle(key)}
            style={{
                padding: '0.25rem 0.625rem',
                borderRadius: '0.375rem',
                fontSize: '0.72rem',
                fontWeight: '600',
                border: options[key] ? 'none' : '1px solid #334155',
                background: options[key] ? 'rgba(99,102,241,0.25)' : 'transparent',
                color: options[key] ? '#a78bfa' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s',
            }}
        >
            {label}
        </button>
    )

    return (
        <div
            style={{
                background: 'rgba(15,23,42,0.6)',
                border: '1px solid #1e293b',
                borderRadius: '0.75rem',
                padding: '1rem',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
                <Sliders size={13} color="#6366f1" />
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Password Generator
                </span>
            </div>

            {/* Generated password display */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#0f172a',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    marginBottom: '0.75rem',
                    border: '1px solid #1e293b',
                }}
            >
                <span
                    style={{
                        flex: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        color: '#a78bfa',
                        wordBreak: 'break-all',
                        letterSpacing: '0.02em',
                    }}
                >
                    {generated}
                </span>
                <button
                    type="button"
                    onClick={() => regenerate()}
                    title="Regenerate"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '2px', display: 'flex', flexShrink: 0 }}
                >
                    <RefreshCw size={14} />
                </button>
                <button
                    type="button"
                    onClick={copyToClipboard}
                    title="Copy"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#4ade80' : '#475569', padding: '2px', display: 'flex', flexShrink: 0, transition: 'color 0.2s' }}
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>

            {/* Length slider */}
            <div style={{ marginBottom: '0.625rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Length</span>
                    <span style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: '700' }}>{options.length}</span>
                </div>
                <input
                    type="range"
                    min="8"
                    max="64"
                    value={options.length}
                    onChange={(e) => changeLength(e.target.value)}
                    style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
                />
            </div>

            {/* Option toggles */}
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {optionBtn('A–Z', 'uppercase')}
                {optionBtn('0–9', 'numbers')}
                {optionBtn('!@#', 'symbols')}
            </div>

            {/* Use this password button */}
            {onSelect && (
                <button
                    type="button"
                    onClick={useThis}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', fontSize: '0.78rem' }}
                >
                    Use this password
                </button>
            )}
        </div>
    )
}
