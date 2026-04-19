import { useNavigate } from 'react-router-dom'
import { C } from '../colors'

export function EmptyState({ icon, title, message, action, actionLabel }) {
  const navigate = useNavigate()
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '50vh', textAlign: 'center', padding: '40px 20px'
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'rgba(88,166,255,0.08)',
        border: '1px solid rgba(88,166,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20
      }}>
        <i className={icon} style={{ fontSize: 32, color: C.blue || '#58A6FF' }} />
      </div>
      <h3 style={{ color: C.white, fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
        {title}
      </h3>
      <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, maxWidth: 340, margin: '0 0 24px' }}>
        {message}
      </p>
      {action && (
        <button onClick={() => navigate(action)} style={{
          padding: '10px 24px', borderRadius: 8,
          background: 'rgba(88,166,255,0.15)',
          border: '1px solid rgba(88,166,255,0.3)',
          color: '#58A6FF', fontSize: 14, fontWeight: 600,
          cursor: 'pointer'
        }}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// No reports uploaded yet
export function NoReportsState() {
  return (
    <EmptyState
      icon="bi bi-cloud-upload"
      title="No data yet"
      message="Upload your first SQP CSV to start tracking market trends, brand share, and AI-powered insights."
      action="/reports"
      actionLabel="Upload SQP CSV →"
    />
  )
}

// No keywords match filter
export function NoKeywordsState({ onReset }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted }}>
      <i className="bi bi-funnel" style={{ fontSize: 28, display: 'block', marginBottom: 10 }} />
      <div style={{ fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 6 }}>No keywords match</div>
      <div style={{ fontSize: 13, marginBottom: 16 }}>Try changing the filters above</div>
      <button onClick={onReset} style={{
        padding: '6px 16px', borderRadius: 8,
        background: 'transparent', border: `1px solid ${C.border}`,
        color: C.muted, fontSize: 12, cursor: 'pointer'
      }}>
        Clear filters
      </button>
    </div>
  )
}