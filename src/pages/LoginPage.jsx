import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { C } from '../colors'
import '../css/LoginPage.css'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '', brand_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginSuccess } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = isLogin
        ? await login({ email: form.email, password: form.password })
        : await register(form)
      loginSuccess(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-area">
          <div className="logo-wrapper">
            <div className="logo-square">A</div>
            <span className="logo-text-large">agratas</span>
            <span className="logo-ai-badge">AI</span>
          </div>
          <p className="tagline">Amazon SQP Market Intelligence Platform</p>
        </div>

        <div className="card">
          <div className="tabs">
            {['Sign In', 'Create Account'].map((label, i) => (
              <button
                key={i}
                onClick={() => setIsLogin(i === 0)}
                className={`tab-btn ${(isLogin ? i === 0 : i === 1) ? 'active' : 'inactive'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="form">
            {!isLogin && (
              <>
                <Field label="Your Name"   value={form.name}       onChange={v => setForm({ ...form, name: v })}       required />
                <Field label="Brand Name"  value={form.brand_name} onChange={v => setForm({ ...form, brand_name: v })} />
              </>
            )}
            <Field label="Email"    type="email"    value={form.email}    onChange={v => setForm({ ...form, email: v })}    required />
            <Field label="Password" type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} required />

            {error && (
              <div className="error-box">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`submit-btn ${loading ? 'disabled' : 'active'}`}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>
        </div>

        <p className="footer-note">Powered by Amazon Selling Partner API</p>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, required }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={e => onChange(e.target.value)}
        className="field-input"
      />
    </div>
  )
}