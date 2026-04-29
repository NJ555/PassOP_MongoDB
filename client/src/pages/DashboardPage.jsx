import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Plus, RefreshCw, AlertCircle, Loader2, Star, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { getVaultEntries, createVaultEntry, updateVaultEntry, deleteVaultEntry, toggleFavorite } from '../api/vault'
import { useAuth } from '../context/AuthContext'
import StrengthMeter from '../components/StrengthMeter'

const CATEGORIES = ['General', 'Social', 'Work', 'Banking', 'Shopping', 'Entertainment', 'Email', 'Other']
const CATEGORY_COLORS = {
    General: '#64748b', Social: '#818cf8', Work: '#34d399',
    Banking: '#fbbf24', Shopping: '#f472b6', Entertainment: '#fb923c',
    Email: '#60a5fa', Other: '#94a3b8',
}

// ── Icons (inline SVG for Copy, Edit, Delete) ──────────────────
const CopyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
)
const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
)
const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
)

// ── Copy-cell helper ───────────────────────────────────────────
function CopyCell({ value, masked }) {
    const [visible, setVisible] = useState(false)
    const [copied, setCopied] = useState(false)

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            toast.success('Copied!')
            setTimeout(() => setCopied(false), 1800)
        } catch { toast.error('Copy failed') }
    }

    if (masked) {
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#475569', letterSpacing: visible ? '0.02em' : '0.15em' }}>
                    {visible ? value : '•'.repeat(Math.min(value?.length || 10, 14))}
                </span>
                <button className="btn-icon" onClick={() => setVisible(v => !v)} title={visible ? 'Hide' : 'Show'}
                    style={{ color: '#94a3b8' }}>
                    {visible ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button className="btn-icon" onClick={copy} title="Copy" style={{ color: copied ? '#059669' : '#94a3b8' }}>
                    <CopyIcon />
                </button>
            </span>
        )
    }

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', maxWidth: '200px' }}>
            <span style={{ fontSize: '0.83rem', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {value}
            </span>
            <button className="btn-icon" onClick={copy} title="Copy" style={{ color: copied ? '#059669' : '#cbd5e1', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                onMouseLeave={e => e.currentTarget.style.color = copied ? '#059669' : '#cbd5e1'}>
                <CopyIcon />
            </button>
        </span>
    )
}

// ── Empty form state ───────────────────────────────────────────
const EMPTY = { siteName: '', siteUrl: '', username: '', password: '', category: 'General', notes: '' }

export default function DashboardPage() {
    const { user } = useAuth()

    // ── State ─────────────────────────────────────────────────────
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [formLoading, setFormLoading] = useState(false)

    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState(null)      // null = adding, id = editing
    const [formErrors, setFormErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)

    const [search, setSearch] = useState('')
    const [activeCat, setActiveCat] = useState('All')

    // ── Fetch ─────────────────────────────────────────────────────
    const fetchEntries = useCallback(async () => {
        setLoading(true); setError(null)
        try {
            const { data } = await getVaultEntries()
            setEntries(data.data)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load vault.')
        } finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchEntries() }, [fetchEntries])

    // ── Filtered list ─────────────────────────────────────────────
    const filtered = useMemo(() => entries.filter(e => {
        const q = search.toLowerCase()
        const matchSearch = !q || e.siteName.toLowerCase().includes(q) || e.username.toLowerCase().includes(q)
        const matchCat = activeCat === 'All' || (activeCat === 'Favorites' && e.isFavorite) || e.category === activeCat
        return matchSearch && matchCat
    }), [entries, search, activeCat])

    // ── Form helpers ──────────────────────────────────────────────
    const handleFieldChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }))
        if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }))
    }

    const validateForm = () => {
        const e = {}
        if (!form.siteName.trim()) e.siteName = 'Site name required'
        if (!form.username.trim()) e.username = 'Username required'
        if (!form.password) e.password = 'Password required'
        setFormErrors(e)
        return Object.keys(e).length === 0
    }

    const resetForm = () => { setForm(EMPTY); setEditId(null); setFormErrors({}); setShowPassword(false) }

    // ── Save / Update ─────────────────────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault()
        if (!validateForm()) return
        setFormLoading(true)
        try {
            if (editId) {
                const { data } = await updateVaultEntry(editId, form)
                setEntries(prev => prev.map(en => en._id === editId ? data.data : en))
                toast.success(`"${form.siteName}" updated!`)
            } else {
                const { data } = await createVaultEntry(form)
                setEntries(prev => [data.data, ...prev])
                toast.success(`"${form.siteName}" added!`)
            }
            resetForm()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed.')
        } finally { setFormLoading(false) }
    }

    // ── Edit (pre-fill form) ──────────────────────────────────────
    const startEdit = (entry) => {
        setForm({
            siteName: entry.siteName || '',
            siteUrl: entry.siteUrl || '',
            username: entry.username || '',
            password: entry.password || '',
            category: entry.category || 'General',
            notes: entry.notes || '',
        })
        setEditId(entry._id)
        setFormErrors({})
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // ── Delete ────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        const entry = entries.find(e => e._id === id)
        if (!window.confirm(`Delete "${entry?.siteName}"? This cannot be undone.`)) return
        try {
            await deleteVaultEntry(id)
            setEntries(prev => prev.filter(e => e._id !== id))
            if (editId === id) resetForm()
            toast.success(`"${entry?.siteName}" deleted.`)
        } catch { toast.error('Delete failed.') }
    }

    // ── Favorite ──────────────────────────────────────────────────
    const handleFavorite = async (id) => {
        try {
            const { data } = await toggleFavorite(id)
            setEntries(prev => prev.map(e => e._id === id ? { ...e, isFavorite: data.isFavorite } : e))
        } catch { toast.error('Could not update favorite.') }
    }

    // ── Style helpers ─────────────────────────────────────────────
    const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.3rem' }
    const errorStyle = { color: '#f43f5e', fontSize: '0.72rem', marginTop: '0.2rem' }

    // ─────────────────────────────────────────────────────────────
    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.75rem 1rem 5rem' }}>

            {/* ── Page title ─────────────────────────────────────────── */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Secure Vault
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    Welcome back, <strong style={{ color: '#4f46e5' }}>{user?.name}</strong>
                </p>
            </div>

            {/* ── Stats strip ────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.875rem', marginBottom: '1.75rem' }}>
                {[
                    { icon: <KeyRound size={18} color="#4f46e5" />, label: 'Total', value: entries.length, bg: '#eef2ff', border: '#c7d2fe' },
                    { icon: <Star size={18} color="#d97706" fill="#d97706" />, label: 'Favorites', value: entries.filter(e => e.isFavorite).length, bg: '#fffbeb', border: '#fde68a' },
                    { icon: <ShieldCheck size={18} color="#059669" />, label: 'AES-Encrypted', value: entries.length, bg: '#ecfdf5', border: '#a7f3d0' },
                ].map(s => (
                    <div key={s.label} style={{
                        background: s.bg, border: `1px solid ${s.border}`,
                        borderRadius: '0.875rem', padding: '1rem 1.125rem',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                    }}>
                        <div style={{ background: '#fff', borderRadius: '8px', padding: '7px', display: 'flex', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                            {s.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Add / Edit Form card ────────────────────────────────── */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
                {/* Form header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            background: editId ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {editId
                                ? <EditIcon />
                                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            }
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>
                            {editId ? 'Edit Password Entry' : 'Add New Password'}
                        </h2>
                    </div>
                    {editId && (
                        <button onClick={resetForm} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}>
                            ✕ Cancel Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleSave} noValidate>
                    {/* Row 1: Site Name + Category */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                        <div>
                            <label style={labelStyle}>Site / App Name *</label>
                            <input type="text" className="input-field" placeholder="e.g. GitHub"
                                value={form.siteName} onChange={handleFieldChange('siteName')}
                                style={{ borderColor: formErrors.siteName ? '#f43f5e' : undefined }}
                            />
                            {formErrors.siteName && <p style={errorStyle}>{formErrors.siteName}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Category</label>
                            <select className="input-field" value={form.category} onChange={handleFieldChange('category')} style={{ cursor: 'pointer' }}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Row 2: URL */}
                    <div style={{ marginBottom: '0.875rem' }}>
                        <label style={labelStyle}>Website URL <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                        <input type="url" className="input-field" placeholder="https://github.com"
                            value={form.siteUrl} onChange={handleFieldChange('siteUrl')}
                        />
                    </div>

                    {/* Row 3: Username + Password */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                        <div>
                            <label style={labelStyle}>Username / Email *</label>
                            <input type="text" className="input-field" placeholder="your@email.com"
                                value={form.username} onChange={handleFieldChange('username')}
                                style={{ borderColor: formErrors.username ? '#f43f5e' : undefined }}
                            />
                            {formErrors.username && <p style={errorStyle}>{formErrors.username}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Password *</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? 'text' : 'password'} className="input-field"
                                    placeholder="Enter password"
                                    value={form.password} onChange={handleFieldChange('password')}
                                    style={{ paddingRight: '2.25rem', borderColor: formErrors.password ? '#f43f5e' : undefined }}
                                />
                                <button type="button" onClick={() => setShowPassword(s => !s)}
                                    style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {formErrors.password && <p style={errorStyle}>{formErrors.password}</p>}
                            <StrengthMeter password={form.password} />
                        </div>
                    </div>

                    {/* Notes */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={labelStyle}>Notes <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                        <textarea className="input-field" placeholder="Recovery codes, backup keys, etc."
                            value={form.notes} onChange={handleFieldChange('notes')}
                            rows={2} style={{ resize: 'vertical', lineHeight: 1.5 }}
                        />
                    </div>

                    {/* Submit */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button type="submit"
                            className={`btn ${editId ? 'btn-success' : 'btn-primary'}`}
                            disabled={formLoading}
                            style={{ minWidth: '180px', justifyContent: 'center', padding: '0.65rem 2rem', fontSize: '0.9rem' }}
                        >
                            {formLoading
                                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                                : editId ? '✓ Update Password' : '+ Save Password'
                            }
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Search + Filter ────────────────────────────────────── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                    <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" className="input-field" placeholder="Search passwords…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: '2.25rem' }}
                    />
                </div>
                <button className="btn btn-ghost" onClick={fetchEntries} disabled={loading}
                    title="Refresh" style={{ padding: '0.55rem 0.75rem' }}>
                    <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                </button>
            </div>

            {/* Category pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {['All', 'Favorites', ...CATEGORIES].map(cat => (
                    <button key={cat} onClick={() => setActiveCat(cat)}
                        style={{
                            padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem',
                            fontWeight: '600', border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s',
                            background: activeCat === cat ? '#4f46e5' : 'transparent',
                            borderColor: activeCat === cat ? '#4f46e5' : '#e2e8f0',
                            color: activeCat === cat ? '#fff' : '#64748b',
                        }}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* ── Error banner ───────────────────────────────────────── */}
            {error && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: '#fff1f2', border: '1px solid #fecdd3',
                    borderRadius: '0.75rem', padding: '0.875rem 1rem', marginBottom: '1rem',
                }}>
                    <AlertCircle size={16} color="#e11d48" />
                    <span style={{ color: '#be123c', fontSize: '0.85rem' }}>{error}</span>
                    <button className="btn btn-ghost" onClick={fetchEntries}
                        style={{ marginLeft: 'auto', fontSize: '0.78rem', padding: '0.25rem 0.75rem' }}>Retry</button>
                </div>
            )}

            {/* ── Loading skeleton ────────────────────────────────────── */}
            {loading && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                {['Site', 'Username', 'Password', 'Category', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3].map(i => (
                                <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                                    {[1, 2, 3, 4, 5].map(j => (
                                        <td key={j} style={{ padding: '0.875rem 1rem' }}>
                                            <div style={{ height: '12px', borderRadius: '6px', background: '#f1f5f9', width: j === 5 ? '60px' : `${60 + j * 10}%`, animation: 'pulse 1.5s ease-in-out infinite' }} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Empty vault ────────────────────────────────────────── */}
            {!loading && !error && entries.length === 0 && (
                <div className="card" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.25rem',
                    }}>
                        <KeyRound size={28} color="#6366f1" />
                    </div>
                    <h3 style={{ color: '#0f172a', fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.375rem' }}>
                        Your vault is empty
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Add your first password using the form above</p>
                </div>
            )}

            {/* ── No results ─────────────────────────────────────────── */}
            {!loading && !error && entries.length > 0 && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                    <Search size={32} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                    <p style={{ fontSize: '0.9rem' }}>
                        No results for <strong style={{ color: '#64748b' }}>"{search}"</strong>
                        {activeCat !== 'All' && ` in ${activeCat}`}
                    </p>
                    <button className="btn btn-ghost" onClick={() => { setSearch(''); setActiveCat('All') }}
                        style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
                        Clear filters
                    </button>
                </div>
            )}

            {/* ── Passwords TABLE ────────────────────────────────────── */}
            {!loading && !error && filtered.length > 0 && (
                <>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.625rem' }}>
                        {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
                        {activeCat !== 'All' && ` · ${activeCat}`}
                        {search && ` · "${search}"`}
                    </p>

                    <div className="card" style={{ overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>

                                {/* Table header */}
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
                                        {['Site', 'Username', 'Password', 'Category', 'Actions'].map(h => (
                                            <th key={h} style={{
                                                padding: '0.875rem 1rem', textAlign: 'left',
                                                fontSize: '0.72rem', fontWeight: '700', color: '#c7d2fe',
                                                textTransform: 'uppercase', letterSpacing: '0.07em',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                {/* Table body */}
                                <tbody>
                                    {filtered.map((entry, idx) => {
                                        const isEven = idx % 2 === 0
                                        const isEditing = editId === entry._id
                                        return (
                                            <tr key={entry._id}
                                                style={{
                                                    background: isEditing ? '#fefce8' : isEven ? '#fff' : '#f8fafc',
                                                    borderTop: '1px solid #f1f5f9',
                                                    transition: 'background 0.15s',
                                                    outline: isEditing ? '2px solid #f59e0b' : 'none',
                                                    outlineOffset: '-2px',
                                                }}
                                                onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = '#f0f9ff' }}
                                                onMouseLeave={e => { e.currentTarget.style.background = isEditing ? '#fefce8' : isEven ? '#fff' : '#f8fafc' }}
                                            >
                                                {/* Site */}
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        {/* Favicon / initial */}
                                                        <div style={{
                                                            width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                                                            background: `${CATEGORY_COLORS[entry.category] || '#94a3b8'}18`,
                                                            border: `1px solid ${CATEGORY_COLORS[entry.category] || '#94a3b8'}33`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '0.7rem', fontWeight: '700', color: CATEGORY_COLORS[entry.category] || '#94a3b8',
                                                            overflow: 'hidden',
                                                        }}>
                                                            {entry.siteUrl
                                                                ? <img src={`https://www.google.com/s2/favicons?domain=${entry.siteUrl}&sz=32`} width={16} height={16} alt="" onError={e => { e.target.style.display = 'none' }} />
                                                                : entry.siteName?.charAt(0).toUpperCase()
                                                            }
                                                        </div>
                                                        <div>
                                                            <CopyCell value={entry.siteName} masked={false} />
                                                            {entry.siteUrl && (
                                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '1px' }}>
                                                                    <a href={entry.siteUrl} target="_blank" rel="noopener noreferrer"
                                                                        style={{ color: '#818cf8', textDecoration: 'none' }}>
                                                                        {entry.siteUrl.replace(/^https?:\/\//, '').split('/')[0]}
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Username */}
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    <CopyCell value={entry.username} masked={false} />
                                                </td>

                                                {/* Password */}
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    <CopyCell value={entry.password} masked={true} />
                                                </td>

                                                {/* Category */}
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    <span style={{
                                                        padding: '0.2rem 0.6rem', borderRadius: '9999px',
                                                        fontSize: '0.68rem', fontWeight: '600',
                                                        background: `${CATEGORY_COLORS[entry.category] || '#94a3b8'}1a`,
                                                        color: CATEGORY_COLORS[entry.category] || '#94a3b8',
                                                        border: `1px solid ${CATEGORY_COLORS[entry.category] || '#94a3b8'}33`,
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        {entry.category}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>

                                                        {/* Favorite */}
                                                        <button className="btn-icon" onClick={() => handleFavorite(entry._id)}
                                                            title={entry.isFavorite ? 'Unfavorite' : 'Favorite'}
                                                            style={{ color: entry.isFavorite ? '#f59e0b' : '#94a3b8' }}
                                                            onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                                                            onMouseLeave={e => e.currentTarget.style.color = entry.isFavorite ? '#f59e0b' : '#cbd5e1'}>
                                                            <Star size={14} fill={entry.isFavorite ? '#f59e0b' : 'none'} />
                                                        </button>

                                                        {/* Edit */}
                                                        <button className="btn-icon" onClick={() => startEdit(entry)}
                                                            title="Edit"
                                                            style={{ color: isEditing ? '#f59e0b' : '#94a3b8', background: isEditing ? '#fef3c7' : 'transparent' }}
                                                            onMouseEnter={e => { e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.background = '#eef2ff' }}
                                                            onMouseLeave={e => { e.currentTarget.style.color = isEditing ? '#f59e0b' : '#94a3b8'; e.currentTarget.style.background = isEditing ? '#fef3c7' : 'transparent' }}>
                                                            <EditIcon />
                                                        </button>

                                                        {/* Delete */}
                                                        <button className="btn-icon" onClick={() => handleDelete(entry._id)}
                                                            title="Delete"
                                                            style={{ color: '#94a3b8' }}
                                                            onMouseEnter={e => { e.currentTarget.style.color = '#e11d48'; e.currentTarget.style.background = '#fff1f2' }}
                                                            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent' }}>
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
        </div>
    )
}
