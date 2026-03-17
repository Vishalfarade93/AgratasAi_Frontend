import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const sellerData = localStorage.getItem('seller')
    if (token && sellerData) setSeller(JSON.parse(sellerData))
    setLoading(false)
  }, [])

  const loginSuccess = (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('seller', JSON.stringify({ id: data.seller_id, name: data.name, brand_name: data.brand_name }))
    setSeller({ id: data.seller_id, name: data.name, brand_name: data.brand_name })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('seller')
    setSeller(null)
  }

  return (
    <AuthContext.Provider value={{ seller, loading, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)