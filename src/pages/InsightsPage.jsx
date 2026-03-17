import { useEffect, useState } from 'react'
import { getInsights } from '../api/client'
import { C } from '../colors'
import 'bootstrap-icons/font/bootstrap-icons.css'

const TYPE_CFG = {
  OPPORTUNITY: { icon: 'bi bi-rocket-takeoff-fill',       color: C.teal,   bg: 'rgba(56,213,100,0.07)',  border: 'rgba(56,213,100,0.2)',  label: 'Opportunity' },
  WARNING:     { icon: 'bi bi-exclamation-triangle-fill',  color: C.yellow, bg: 'rgba(210,153,34,0.07)',  border: 'rgba(210,153,34,0.2)',  label: 'Warning'     },
  PRICING:     { icon: 'bi bi-tag-fill',                   color: C.pink,   bg: 'rgba(255,123,114,0.07)', border: 'rgba(255,123,114,0.2)', label: 'Pricing'     },
  ALERT:       { icon: 'bi bi-graph-down-arrow',           color: C.red,    bg: 'rgba(248,81,73,0.07)',   border: 'rgba(248,81,73,0.2)',   label: 'Alert'       },
  SHARE:       { icon: 'bi bi-pie-chart-fill',             color: C.purple, bg: 'rgba(188,140,255,0.07)', border: 'rgba(188,140,255,0.2)', label: 'Share'       },
}

export default function InsightsPage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInsights().then(res => setData(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ color: C.muted, padding: 40, textAlign: 'center' }}>
      <i className="bi bi-hourglass-split" style={{ fontSize: 32, display: 'block', marginBottom: 12 }} />
      Generating insights...
    </div>
  )

  if (!data?.success) return (
    <div style={{ color: C.muted, padding: 20 }}>No data available</div>
  )

  const { insights, ai_status, note } = data

  return (
    <div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.white }}>Insights</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Automated strategic alerts based on your market data</p>
        </div>
        <span style={{ padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: C.panel2, border: `1px solid ${C.border}`, color: C.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
          {ai_status === 'RULE_BASED'
            ? <><i className="bi bi-lightning-charge-fill" style={{ fontSize: 11 }} /> Rule-Based Engine</>
            : <><i className="bi bi-robot"                 style={{ fontSize: 11 }} /> Claude AI Powered</>
          }
        </span>
      </div>

      {/* Note */}
      {note && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 16px', background: 'rgba(88,166,255,0.07)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: 8, color: C.muted, fontSize: 13, marginBottom: 24 }}>
          <i className="bi bi-lightbulb-fill" style={{ fontSize: 14, color: C.orange, marginTop: 1, flexShrink: 0 }} />
          {note}
        </div>
      )}

      {/* Empty state */}
      {insights.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <i className="bi bi-check-circle-fill" style={{ fontSize: 52, color: C.teal, display: 'block', marginBottom: 16 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: C.white }}>Everything looks good!</div>
          <div style={{ color: C.muted, marginTop: 8 }}>No critical alerts at this time.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {insights.map((insight, i) => {
            const cfg = TYPE_CFG[insight.type] || TYPE_CFG.ALERT
            return (
              <div key={i} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '18px 22px', borderLeft: `4px solid ${cfg.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <i className={cfg.icon} style={{ fontSize: 18, color: cfg.color, flexShrink: 0 }} />
                  <span style={{ color: cfg.color, fontWeight: 700, fontSize: 13, flex: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {cfg.label}
                  </span>
                  <span style={{
                    padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                    background: insight.priority === 'HIGH' ? 'rgba(248,81,73,0.15)' : 'rgba(210,153,34,0.15)',
                    color:      insight.priority === 'HIGH' ? C.red : C.yellow,
                    border:     `1px solid ${insight.priority === 'HIGH' ? 'rgba(248,81,73,0.3)' : 'rgba(210,153,34,0.3)'}`
                  }}>
                    {insight.priority} PRIORITY
                  </span>
                </div>
                <p style={{ color: C.white, fontSize: 14, lineHeight: 1.65, margin: 0 }}>
                  {insight.message}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
