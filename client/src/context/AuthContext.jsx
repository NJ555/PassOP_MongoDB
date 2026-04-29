import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

// Configure axios to always send cookies with every request
axios.defaults.withCredentials = true
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api'

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true) // true while we check existing session

    // On mount: check if the user already has a valid session (token in cookie)
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data } = await axios.get('/auth/me')
                if (data.success) setUser(data.user)
            } catch {
                setUser(null) // No active session — stay logged out
            } finally {
                setLoading(false)
            }
        }
        checkSession()
    }, [])

    const signup = useCallback(async (name, email, password) => {
        const { data } = await axios.post('/auth/signup', { name, email, password })
        setUser(data.user)
        return data
    }, [])

    const login = useCallback(async (email, password) => {
        const { data } = await axios.post('/auth/login', { email, password })
        setUser(data.user)
        return data
    }, [])

    const logout = useCallback(async () => {
        await axios.post('/auth/logout')
        setUser(null)
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook — throws a clear error if used outside AuthProvider
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within an AuthProvider')
    return context
}
