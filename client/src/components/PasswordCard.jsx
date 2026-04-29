import { useState } from 'react'
import {
    Eye, EyeOff, Copy, Check, Pencil, Trash2, Star, Globe, ChevronDown, ChevronUp,
} from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORY_COLORS = {
    General: '#64748b',
    Social: '#818cf8',
    Work: '#34d399',
    Banking: '#facc15',
    Shopping: '#f472b6',
    Entertainment: '#fb923c',
    Email: '#60a5fa',
    Other: '#94a3b8',
}

/**
 * PasswordCard
 *
 * Displays a single vault entry. Features:
 *  - Reveal/hide password toggle
 *  - One-click copy to clipboard
 *  - Favorite star toggle
 *  - Edit / Delete actions
 *  - Expandable notes section
 */
export default function PasswordCard({ entry, onEdit, onDelete, onToggleFavorite }) {
    const [showPassword, setShowPassword] = useState(false)
    const [copied, setCopied] = useState(false)
    const [showNotes, setShowNotes] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const categoryColor = CATEGORY_COLORS[entry.category] || '#64748b'

    const copyPassword = async () => {
        try {
            await navigator.clipboard.writeText(entry.password)
            setCopied(true)
            toast.success(`Password for ${entry.siteName} copied!`)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Copy failed')
        }
    }

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${entry.siteName}"? This cannot be undone.`)) return
        setDeleting(true)
        try {
            await onDelete(entry._id)
        } finally {
            setDeleting(false)
        }
    }

    // Derive a favicon URL from siteUrl if available
    const faviconUrl = entry.siteUrl
        ? `https://www.google.com/s2/favicons?domain=${entry.siteUrl}&sz=32`
        : null

    // Abbreviated site initial as fallback avatar
    const initial = entry.siteName?.charAt(0)?.toUpperCase() || '?'

    return (
        <div
            className="card"
            style={{
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
            {/* Accent bar at left edge based on category */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: categoryColor, borderRadius: '0.75rem 0 0 0.75rem' }} />

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', paddingLeft: '0.5rem' }}>

                {/* Site icon / initial */}
                <div
                    style={{
                        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                        background: `${categoryColor}22`,
                        border: `1px solid ${categoryColor}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                >
                    {faviconUrl
                        ? <img src={faviconUrl} alt="" width={20} height={20} onError={(e) => { e.target.style.display = 'none' }} />
                        : <span style={{ fontSize: '1rem', fontWeight: '700', color: categoryColor }}>{initial}</span>
                    }
                </div>

                {/* Site name + username */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {entry.siteName}
                        </h3>
                        <span className="badge" style={{ background: `${categoryColor}22`, color: categoryColor, borderColor: `${categoryColor}44` }}>
                            {entry.category}
                        </span>
                    </div>
                    <p style={{ margin: '0.125rem 0 0', fontSize: '0.78rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.username}
                    </p>
                    {entry.siteUrl && (
                        <a
                            href={entry.siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: '#4f46e5', textDecoration: 'none', marginTop: '0.125rem' }}
                        >
                            <Globe size={10} /> {entry.siteUrl.replace(/^https?:\/\//, '').split('/')[0]}
                        </a>
                    )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flexShrink: 0 }}>
                    {/* Favorite */}
                    <button
                        type="button"
                        onClick={() => onToggleFavorite(entry._id)}
                        title={entry.isFavorite ? 'Remove favorite' : 'Add to favorites'}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '5px',
                            color: entry.isFavorite ? '#facc15' : '#334155',
                            display: 'flex', borderRadius: '6px', transition: 'color 0.2s',
                        }}
                    >
                        <Star size={15} fill={entry.isFavorite ? '#facc15' : 'none'} />
                    </button>
                    {/* Edit */}
                    <button
                        type="button"
                        onClick={() => onEdit(entry)}
                        title="Edit"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: '#475569', display: 'flex', borderRadius: '6px', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#a78bfa'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                    >
                        <Pencil size={14} />
                    </button>
                    {/* Delete */}
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        title="Delete"
                        className="btn-danger"
                        style={{ opacity: deleting ? 0.5 : 1 }}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Password row */}
            <div
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    marginTop: '0.75rem', paddingLeft: '0.5rem',
                    background: 'rgba(15,23,42,0.5)', borderRadius: '0.5rem',
                    padding: '0.5rem 0.625rem', border: '1px solid #1e293b',
                }}
            >
                <span
                    style={{
                        flex: 1, fontFamily: 'monospace', fontSize: '0.8rem',
                        color: showPassword ? '#a78bfa' : '#475569',
                        letterSpacing: showPassword ? '0.02em' : '0.2em',
                        userSelect: showPassword ? 'text' : 'none',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                >
                    {showPassword ? entry.password : '•'.repeat(Math.min(entry.password?.length || 12, 20))}
                </span>
                {/* Show/hide */}
                <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '2px', display: 'flex', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                {/* Copy */}
                <button
                    type="button"
                    onClick={copyPassword}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#4ade80' : '#6366f1', padding: '2px', display: 'flex', transition: 'color 0.2s' }}
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>

            {/* Notes toggle */}
            {entry.notes && (
                <button
                    type="button"
                    onClick={() => setShowNotes((s) => !s)}
                    style={{
                        marginTop: '0.625rem', paddingLeft: '0.5rem',
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        fontSize: '0.7rem', color: '#475569', transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                    {showNotes ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {showNotes ? 'Hide notes' : 'Show notes'}
                </button>
            )}

            {showNotes && entry.notes && (
                <div
                    style={{
                        marginTop: '0.375rem',
                        padding: '0.5rem 0.625rem',
                        background: 'rgba(15,23,42,0.4)',
                        borderRadius: '0.375rem',
                        fontSize: '0.78rem', color: '#94a3b8',
                        lineHeight: 1.6, whiteSpace: 'pre-wrap',
                        border: '1px solid #1e293b',
                    }}
                >
                    {entry.notes}
                </div>
            )}
        </div>
    )
}
