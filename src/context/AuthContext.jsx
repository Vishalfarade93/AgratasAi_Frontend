import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [seller,  setSeller]  = useState(null)
  const [loading, setLoading] = useState(true)  // true while we check localStorage

  // On first load — restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('seller')
    const token  = localStorage.getItem('token')

    if (stored && token) {
      try {
        setSeller(JSON.parse(stored))
      } catch {
        // Corrupted data — clear it
        localStorage.removeItem('seller')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const loginSeller = (sellerData, token) => {
    localStorage.setItem('token',  token)
    localStorage.setItem('seller', JSON.stringify(sellerData))
    setSeller(sellerData)
  }

  const logoutSeller = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('seller')
    setSeller(null)
  }

  return (
    <AuthContext.Provider value={{ seller, loading, loginSeller, logoutSeller }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}