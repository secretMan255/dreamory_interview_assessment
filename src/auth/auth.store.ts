const KEY: string = 'auth:accessToken'
const KEY_USER: string = 'auth:user'

let _token: string | null = null
let _user: any | null = null

// TOKEN
export function setAccessToken(t: string) {
    _token = t
    try { localStorage.setItem(KEY, t) } catch { }
}

export function getAccessToken(): string | null {
    if (_token) return _token
    try { _token = localStorage.getItem(KEY) } catch { }

    return _token
}

export function clearAccessToken() {
    _token = null
    try { localStorage.removeItem(KEY) } catch { }
}

// USER
export function setAuthUser(u: any) {
    _user = u
    try { localStorage.setItem(KEY_USER, JSON.stringify(u)) } catch { }
}

export function getAuthUser<T = any>(): T | null {
    if (_user) return _user as T
    try {
        const raw = localStorage.getItem(KEY_USER)
        _user = raw ? JSON.parse(raw) : null
    } catch { }
    return _user as T | null
}

export function clearAuthUser() {
    _user = null
    try { localStorage.removeItem(KEY_USER) } catch { }
}

// PERMISSION
export function hasPerm(p: string): boolean {
    const u = getAuthUser<any>()
    return !!u?.perms?.includes(p)
}

export function hasAnyPerm(list: string[]): boolean {
    const u = getAuthUser<any>()
    const perms: string[] = u?.perms || []
    return list.some(p => perms.includes(p))
}