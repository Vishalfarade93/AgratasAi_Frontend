import { useEffect, useState } from 'react'
import { getInsights } from '../api/client'
import { C } from '../colors'
import { useNavigate } from 'react-router-dom'
import 'bootstrap-icons/font/bootstrap-icons.css'

const TYPE_CFG = {
  OPPORTUNITY: { icon: 'bi bi-rocket-takeoff-fill',      color: C.teal,   bg: 'rgba(56,213,100,0.07)',  border: 'rgba(56,213,100,0.2)',  label: 'Opportunity' },
  WARNING:     { icon: 'bi bi-exclamation-triangle-fill', color: C.yellow, bg: 'rgba(210,153,34,0.07)',  border: 'rgba(210,153,34,0.2)',  label: 'Warning'     },
  PRICING:     { icon: 'bi bi-tag-fill',                  color: C.pink,   bg: 'rgba(255,123,114,0.07)', border: 'rgba(255,123,114,0.2)', label: 'Pricing'     },
  ALERT:       { icon: 'bi bi-graph-down-arrow',          color: C.red,    bg: 'rgba(248,81,73,0.07)',   border: 'rgba(248,81,73,0.2)',   label: 'Alert'       },
  SHARE:       { icon: 'bi bi-pie-chart-fill',            color: C.purple, bg: 'rgba(188,140,255,0.07)', border: 'rgba(188,140,255,0.2)', label: 'Share'       },
}

// ── Skeleton — only addition ──────────────────────────────────────
function Skel({ width = '100%', height = 16, radius = 6, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: `linear-gradient(90deg, ${C.navy} 25%, ${C.panel2} 50%, ${C.navy} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style
    }} />
  )
}

function InsightsSkeleton() {
  return (
    <div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div><Skel width={100} height={24} style={{ marginBottom: 8 }} /><Skel width={300} height={13} /></div>
        <Skel width={130} height={32} radius={20} />
      </div>
      <Skel height={200} radius={12} style={{ marginBottom: 28 }} />
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 10, padding: '18px 22px', borderLeft: `4px solid ${C.border}`, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Skel width={18} height={18} radius={4} />
            <Skel width={100} height={13} />
            <Skel width={80} height={20} radius={20} style={{ marginLeft: 'auto' }} />
          </div>
          <Skel width="90%" height={13} style={{ marginBottom: 6 }} />
          <Skel width="65%" height={13} />
        </div>
      ))}
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────

function AiAnalysis({ text }) {
  const lines = text.split('\n')
  return (
    <div style={{ background: 'rgba(88,166,255,0.05)', border: '1px solid rgba(88,166,255,0.22)', borderRadius: 12, padding: '22px 26px', marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <i className="bi bi-stars" style={{ color: '#58A6FF', fontSize: 17 }} />
        <span style={{ color: '#58A6FF', fontWeight: 700, fontSize: 14 }}>AI Strategic Analysis</span>
        <span style={{ marginLeft: 'auto', padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'rgba(88,166,255,0.15)', color: '#58A6FF', border: '1px solid rgba(88,166,255,0.3)' }}>
          GROK
        </span>
      </div>
      {lines.map((line, i) => {
        if (line.startsWith('## ') || (line.startsWith('**') && line.endsWith('**'))) {
          return (
            <div key={i} style={{ color: C.white, fontWeight: 700, fontSize: 14, marginTop: i === 0 ? 0 : 20, marginBottom: 8, paddingBottom: 7, borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 7 }}>
              <i className="bi bi-chevron-right" style={{ color: '#58A6FF', fontSize: 11 }} />
              {line.replace(/^##\s*/, '').replace(/\*\*/g, '')}
            </div>
          )
        }
        if (/^[•\-\*]\s/.test(line)) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 7 }}>
              <i className="bi bi-arrow-right-short" style={{ color: '#58A6FF', fontSize: 16, flexShrink: 0, marginTop: 2 }} />
              <span style={{ color: C.white, fontSize: 13, lineHeight: 1.75 }}>{line.replace(/^[•\-\*]\s/, '')}</span>
            </div>
          )
        }
        if (!line.trim()) return <div key={i} style={{ height: 6 }} />
        return <p key={i} style={{ color: C.muted, fontSize: 13, lineHeight: 1.8, margin: '0 0 5px 0' }}>{line}</p>
      })}
    </div>
  )
}

export default function InsightsPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getInsights().then(res => setData(res.data)).finally(() => setLoading(false))
  }, [])

  // ── Skeleton while loading ────────────────────────────────────
  if (loading) return <InsightsSkeleton />

  // ── No data — with upload button ─────────────────────────────
  if (!data?.success) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <i className="bi bi-bar-chart-line" style={{ fontSize: 48, color: C.muted, display: 'block', marginBottom: 16 }} />
      <div style={{ fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 8 }}>No data available</div>
      <div style={{ color: C.muted, marginBottom: 24 }}>Upload a weekly SQP CSV to generate insights</div>
      <button onClick={() => navigate('/reports')} style={{
        padding: '10px 24px', borderRadius: 8,
        background: 'linear-gradient(135deg,#58A6FF,#BC8CFF)',
        border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer'
      }}>Upload CSV →</button>
    </div>
  )

  const { insights, ai_status, ai_insights, note } = data

  return (
    <div>

      {/* Header — unchanged */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.white }}>Insights</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Automated strategic alerts based on your market data</p>
        </div>
        <span style={{ padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: C.panel2, border: `1px solid ${C.border}`, color: C.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
          {ai_status === 'GROQ_POWERED'
            ? <><i className="bi bi-stars" style={{ fontSize: 11, color: '#58A6FF' }} /> AI Powered</>
            : <><i className="bi bi-lightning-charge-fill" style={{ fontSize: 11 }} /> Rule-Based Engine</>
          }
        </span>
      </div>

      {/* Note — unchanged */}
      {note && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 16px', background: 'rgba(88,166,255,0.07)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: 8, color: C.muted, fontSize: 13, marginBottom: 24 }}>
          <i className="bi bi-lightbulb-fill" style={{ fontSize: 14, color: C.orange, marginTop: 1, flexShrink: 0 }} />
          {note}
        </div>
      )}

      {/* AI Analysis — unchanged */}
      {ai_insights && <AiAnalysis text={ai_insights} />}

      {/* Alert cards — unchanged */}
      {insights.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <i className="bi bi-check-circle-fill" style={{ fontSize: 52, color: C.teal, display: 'block', marginBottom: 16 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: C.white }}>Everything looks good!</div>
          <div style={{ color: C.muted, marginTop: 8 }}>No critical alerts at this time.</div>
        </div>
      ) : (
        <>
          {ai_insights && (
            <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Quick Alerts
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {insights.map((insight, i) => {
              const cfg = TYPE_CFG[insight.type] || TYPE_CFG.ALERT
              return (
                <div key={i} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '18px 22px', borderLeft: `4px solid ${cfg.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <i className={cfg.icon} style={{ fontSize: 18, color: cfg.color, flexShrink: 0 }} />
                    <span style={{ color: cfg.color, fontWeight: 700, fontSize: 13, flex: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>{cfg.label}</span>
                    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: insight.priority === 'HIGH' ? 'rgba(248,81,73,0.15)' : 'rgba(210,153,34,0.15)', color: insight.priority === 'HIGH' ? C.red : C.yellow, border: `1px solid ${insight.priority === 'HIGH' ? 'rgba(248,81,73,0.3)' : 'rgba(210,153,34,0.3)'}` }}>
                      {insight.priority} PRIORITY
                    </span>
                  </div>
                  <p style={{ color: C.white, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{insight.message}</p>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}