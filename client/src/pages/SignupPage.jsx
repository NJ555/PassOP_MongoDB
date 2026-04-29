import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, KeyRound, Loader2 } from 'lucide-react'
import StrengthMeter from '../components/StrengthMeter'
import toast from 'react-hot-toast'

export default function SignupPage() {
    const { signup } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Name is required'
        if (!form.email) e.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
        if (!form.password) e.password = 'Password is required'
        else if (form.password.length < 8) e.password = 'Must be at least 8 characters'
        if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password'
        else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return
        setLoading(true)
        try {
            await signup(form.name, form.email, form.password)
            toast.success('Account created! Welcome to PassOp 🎉')
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Sign up failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
    }

    const label = (text) => (
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.375rem' }}>
            {text}
        </label>
    )
    const errMsg = (field) =>
        errors[field] ? <p style={{ color: '#f43f5e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors[field]}</p> : null
    const iconL = { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }

    return (
        <div style={{
            minHeight: 'calc(100vh - 124px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem 1rem',
            background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0fdf4 100%)',
        }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #059669, #0d9488)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(5,150,105,0.35)',
                    }}>
                        <KeyRound size={26} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
                        Create your account
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        Secure, encrypted password management
                    </p>
                </div>

                {/* Card */}
                <div className="card" style={{ padding: '1.75rem' }}>
                    <form onSubmit={handleSubmit} noValidate>

                        {/* Name */}
                        <div style={{ marginBottom: '1rem' }}>
                            {label('Full name')}
                            <div style={{ position: 'relative' }}>
                                <User size={15} color="#9ca3af" style={iconL} />
                                <input type="text" className="input-field" placeholder="Your name"
                                    value={form.name} onChange={handleChange('name')}
                                    style={{ paddingLeft: '2.25rem', borderColor: errors.name ? '#f43f5e' : undefined }}
                                    autoComplete="name"
                                />
                            </div>
                            {errMsg('name')}
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: '1rem' }}>
                            {label('Email address')}
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} color="#9ca3af" style={iconL} />
                                <input type="email" className="input-field" placeholder="you@example.com"
                                    value={form.email} onChange={handleChange('email')}
                                    style={{ paddingLeft: '2.25rem', borderColor: errors.email ? '#f43f5e' : undefined }}
                                    autoComplete="email"
                                />
                            </div>
                            {errMsg('email')}
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '1rem' }}>
                            {label('Master password')}
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} color="#9ca3af" style={iconL} />
                                <input type={showPassword ? 'text' : 'password'} className="input-field"
                                    placeholder="Min. 8 characters"
                                    value={form.password} onChange={handleChange('password')}
                                    style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem', borderColor: errors.password ? '#f43f5e' : undefined }}
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowPassword((s) => !s)}
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {errMsg('password')}
                            <StrengthMeter password={form.password} />
                        </div>

                        {/* Confirm Password */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            {label('Confirm password')}
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} color="#9ca3af" style={iconL} />
                                <input type={showConfirm ? 'text' : 'password'} className="input-field"
                                    placeholder="Re-enter your password"
                                    value={form.confirmPassword} onChange={handleChange('confirmPassword')}
                                    style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem', borderColor: errors.confirmPassword ? '#f43f5e' : undefined }}
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowConfirm((s) => !s)}
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {errMsg('confirmPassword')}
                        </div>

                        <button type="submit" className="btn btn-success" disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', fontSize: '0.9rem' }}>
                            {loading
                                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating account…</>
                                : '🚀 Create Account'
                            }
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: '#64748b' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#4f46e5', fontWeight: '600', textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </p>
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    🔒 AES-256 encrypted · bcrypt secured
                </p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
