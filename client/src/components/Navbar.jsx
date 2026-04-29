import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, KeyRound, Github } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await logout()
            toast.success('Logged out successfully')
            navigate('/login')
        } catch {
            toast.error('Logout failed. Please try again.')
        }
    }

    return (
        <>
            <nav style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
                position: 'sticky', top: 0, zIndex: 50,
                boxShadow: '0 2px 20px rgba(30,27,75,0.4)',
            }}>
                <div style={{
                    maxWidth: '1200px', margin: '0 auto',
                    padding: '0 1.5rem', height: '62px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>

                    {/* Logo */}
                    <Link
                        to={user ? '/dashboard' : '/login'}
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}
                    >
                        <div style={{
                            width: '34px', height: '34px', borderRadius: '9px',
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(8px)',
                        }}>
                            <KeyRound size={17} color="#a5b4fc" />
                        </div>
                        <span style={{
                            fontSize: '1.15rem', fontWeight: '800',
                            color: '#fff', letterSpacing: '-0.02em', fontFamily: 'inherit',
                        }}>
                            Pass<span style={{ color: '#a5b4fc' }}>Op</span>
                        </span>
                    </Link>

                    {/* Right side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>

                        {/* GitHub button — always visible */}
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.375rem 0.75rem',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '0.5rem',
                                color: '#c7d2fe', textDecoration: 'none',
                                fontSize: '0.8rem', fontWeight: '500',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            <Github size={15} />
                            GitHub
                        </a>

                        {user ? (
                            <>
                                {/* User chip */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.3rem 0.75rem',
                                    background: 'rgba(255,255,255,0.12)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                    borderRadius: '9999px',
                                }}>
                                    <div style={{
                                        width: '22px', height: '22px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.65rem', fontWeight: '700', color: '#fff',
                                        flexShrink: 0,
                                    }}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: '#e0e7ff', fontWeight: '500', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user.name}
                                    </span>
                                </div>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                                        padding: '0.375rem 0.75rem',
                                        background: 'rgba(239,68,68,0.15)',
                                        border: '1px solid rgba(239,68,68,0.3)',
                                        borderRadius: '0.5rem',
                                        color: '#fca5a5', cursor: 'pointer',
                                        fontSize: '0.8rem', fontWeight: '500',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                                >
                                    <LogOut size={14} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    style={{
                                        color: '#c7d2fe', textDecoration: 'none',
                                        fontSize: '0.875rem', fontWeight: '500',
                                        padding: '0.375rem 0.625rem', borderRadius: '0.5rem',
                                        transition: 'color 0.2s',
                                    }}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    style={{
                                        background: '#4f46e5', color: '#fff', textDecoration: 'none',
                                        padding: '0.4rem 1rem', borderRadius: '0.5rem',
                                        fontSize: '0.875rem', fontWeight: '600',
                                        transition: 'background 0.2s',
                                    }}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Footer bar */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40 }}>
                <div style={{
                    background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                    borderTop: '1px solid rgba(99,102,241,0.3)',
                    padding: '0.5rem 1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{ fontSize: '0.75rem', color: '#818cf8' }}>
                        Created with <span style={{ color: '#f472b6' }}>♥</span> by PassOp &nbsp;·&nbsp; AES-256 Encrypted
                    </span>
                </div>
            </div>
        </>
    )
}
