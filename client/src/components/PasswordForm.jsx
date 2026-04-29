import { useState, useEffect } from 'react'
import {
    X, Globe, User, Lock, Eye, EyeOff, Tag, FileText, Wand2, Save, Loader2,
} from 'lucide-react'
import StrengthMeter from './StrengthMeter'
import PasswordGenerator from './PasswordGenerator'

const CATEGORIES = ['General', 'Social', 'Work', 'Banking', 'Shopping', 'Entertainment', 'Email', 'Other']

/**
 * PasswordForm — Add / Edit modal
 *
 * Props:
 *  onClose()          — close the modal
 *  onSubmit(data)     — called with form data on valid submit
 *  initialData        — pre-populated when editing (null when adding)
 *  loading            — disables the submit button while the API call is in-flight
 */
export default function PasswordForm({ onClose, onSubmit, initialData = null, loading = false }) {
    const isEdit = Boolean(initialData)
    const [showGenerator, setShowGenerator] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const [form, setForm] = useState({
        siteName: '',
        siteUrl: '',
        username: '',
        password: '',
        category: 'General',
        notes: '',
    })
    const [errors, setErrors] = useState({})

    // Pre-fill form when editing
    useEffect(() => {
        if (initialData) {
            setForm({
                siteName: initialData.siteName || '',
                siteUrl: initialData.siteUrl || '',
                username: initialData.username || '',
                password: initialData.password || '',
                category: initialData.category || 'General',
                notes: initialData.notes || '',
            })
        }
    }, [initialData])

    const validate = () => {
        const e = {}
        if (!form.siteName.trim()) e.siteName = 'Site name is required'
        if (!form.username.trim()) e.username = 'Username is required'
        if (!form.password) e.password = 'Password is required'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validate()) onSubmit(form)
    }

    // Close on backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose()
    }

    const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: '500', color: '#94a3b8', marginBottom: '0.3rem' }
    const errorStyle = { color: '#f87171', fontSize: '0.72rem', margin: '0.2rem 0 0' }
    const rowStyle = { marginBottom: '1rem' }

    return (
        /* Backdrop */
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 100, padding: '1rem',
            }}
        >
            {/* Modal */}
            <div
                style={{
                    width: '100%', maxWidth: '520px',
                    maxHeight: '92vh', overflowY: 'auto',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '1rem',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid #334155',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), transparent)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Lock size={16} color="white" />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#f1f5f9' }}>
                            {isEdit ? 'Edit Entry' : 'Add New Entry'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', display: 'flex', borderRadius: '6px', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>

                    {/* Site Name + Category row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Site / App Name *</label>
                            <div style={{ position: 'relative' }}>
                                <Globe size={14} color="#475569" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. GitHub"
                                    value={form.siteName}
                                    onChange={handleChange('siteName')}
                                    style={{ paddingLeft: '2.25rem', borderColor: errors.siteName ? '#f87171' : undefined }}
                                />
                            </div>
                            {errors.siteName && <p style={errorStyle}>{errors.siteName}</p>}
                        </div>

                        <div>
                            <label style={labelStyle}>Category</label>
                            <div style={{ position: 'relative' }}>
                                <Tag size={14} color="#475569" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <select
                                    className="input-field"
                                    value={form.category}
                                    onChange={handleChange('category')}
                                    style={{ paddingLeft: '2.25rem', cursor: 'pointer' }}
                                >
                                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Site URL */}
                    <div style={rowStyle}>
                        <label style={labelStyle}>Site URL <span style={{ color: '#475569' }}>(optional)</span></label>
                        <div style={{ position: 'relative' }}>
                            <Globe size={14} color="#475569" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                type="url"
                                className="input-field"
                                placeholder="https://github.com"
                                value={form.siteUrl}
                                onChange={handleChange('siteUrl')}
                                style={{ paddingLeft: '2.25rem' }}
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div style={rowStyle}>
                        <label style={labelStyle}>Username / Email *</label>
                        <div style={{ position: 'relative' }}>
                            <User size={14} color="#475569" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                className="input-field"
                                placeholder="your@email.com"
                                value={form.username}
                                onChange={handleChange('username')}
                                style={{ paddingLeft: '2.25rem', borderColor: errors.username ? '#f87171' : undefined }}
                            />
                        </div>
                        {errors.username && <p style={errorStyle}>{errors.username}</p>}
                    </div>

                    {/* Password */}
                    <div style={rowStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                            <label style={{ ...labelStyle, margin: 0 }}>Password *</label>
                            <button
                                type="button"
                                onClick={() => setShowGenerator((s) => !s)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                    background: showGenerator ? 'rgba(99,102,241,0.2)' : 'transparent',
                                    border: '1px solid',
                                    borderColor: showGenerator ? '#6366f1' : '#334155',
                                    borderRadius: '0.375rem',
                                    padding: '0.2rem 0.5rem',
                                    fontSize: '0.68rem', fontWeight: '600',
                                    color: showGenerator ? '#a78bfa' : '#64748b',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                            >
                                <Wand2 size={11} /> Generator
                            </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={14} color="#475569" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input-field"
                                placeholder="Enter or generate a password"
                                value={form.password}
                                onChange={handleChange('password')}
                                style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem', borderColor: errors.password ? '#f87171' : undefined }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, display: 'flex' }}
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        {errors.password && <p style={errorStyle}>{errors.password}</p>}
                        <StrengthMeter password={form.password} />

                        {/* Inline generator panel */}
                        {showGenerator && (
                            <div style={{ marginTop: '0.75rem' }}>
                                <PasswordGenerator
                                    onSelect={(pwd) => {
                                        setForm((prev) => ({ ...prev, password: pwd }))
                                        setErrors((prev) => ({ ...prev, password: '' }))
                                        setShowGenerator(false)
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div style={rowStyle}>
                        <label style={labelStyle}>Notes <span style={{ color: '#475569' }}>(optional)</span></label>
                        <div style={{ position: 'relative' }}>
                            <FileText size={14} color="#475569" style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', pointerEvents: 'none' }} />
                            <textarea
                                className="input-field"
                                placeholder="Recovery codes, 2FA backup, etc."
                                value={form.notes}
                                onChange={handleChange('notes')}
                                rows={2}
                                style={{ paddingLeft: '2.25rem', resize: 'vertical', lineHeight: 1.5 }}
                            />
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '1rem', marginTop: '0.5rem' }}>
                        <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                            {loading
                                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                                : <><Save size={14} /> {isEdit ? 'Save Changes' : 'Add to Vault'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
            <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
        </div>
    )
}
