import React, { createContext, useContext, useState } from 'react';
import { getAccessToken, setAccessToken, clearAccessToken } from './auth.store'

type AuthContextType = {
    token: string | null
    isAuthed: boolean
    login: (token: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => getAccessToken() || null)

    const login = (token: string) => {
        setAccessToken(token)
        setToken(token)
    }

    const logout = () => {
        clearAccessToken()
        setToken('')
    }

    return (
        <AuthContext.Provider value={{ token, isAuthed: true/*!!token*/, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}