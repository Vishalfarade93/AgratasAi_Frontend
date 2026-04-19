import { useEffect, useState } from 'react'
import { getLatestAnalytics } from '../api/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { C } from '../colors'
import { useNavigate } from 'react-router-dom'

function Skel({ width = '100%', height = 16, radius = 6, style = {} }) {
  return (
    <div style={{
      width, height,
      borderRadius: radius,
      background: `linear-gradient(90deg, ${C.navy} 25%, ${C.panel2} 50%, ${C.navy} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style
    }} />
  )
}

function KpiSkeleton() {
  return (
    <div style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px' }}>
      <Skel width="55%" height={11} style={{ marginBottom: 12 }} />
      <Skel width="38%" height={26} style={{ marginBottom: 8 }} />
      <Skel width="65%" height={11} />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ marginBottom: 24 }}>
        <Skel width={190} height={24} style={{ marginBottom: 8 }} />
        <Skel width={130} height={13} />
      </div>
      <div className="kpi-grid">
        {[...Array(4)].map((_,i) => <KpiSkeleton key={i} />)}
      </div>
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        {[...Array(4)].map((_,i) => <KpiSkeleton key={i} />)}
      </div>
      <div className="charts-row">
        <Skel height={280} radius={10} />
        <Skel height={280} radius={10} />
      </div>
      <Skel height={180} radius={10} style={{ marginTop: 20 }} />
    </div>
  )
}
//--------------------------------------------
export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getLatestAnalytics().then(res => setData(res.data)).finally(() => setLoading(false))
  }, [])

  
  if (loading) return <DashboardSkeleton />

  // Empty state with upload button 
  if (!data?.success) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>📦</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 8 }}>No reports yet</div>
      <div style={{ color: C.muted, marginBottom: 24 }}>Upload your first weekly SQP CSV to get started</div>
      <button onClick={() => navigate('/reports')} style={{
        padding: '10px 24px', borderRadius: 8,
        background: 'linear-gradient(135deg,#58A6FF,#BC8CFF)',
        border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer'
      }}>
        Upload CSV →
      </button>
    </div>
  )

  const { metrics, period_start, data_quality } = data
  const { summary, funnel, brand_share, price_gap_analysis, top_opportunities } = metrics

  const funnelData = [
    { name: 'Impressions', value: summary.total_impressions, color: C.orange },
    { name: 'Clicks',      value: summary.total_clicks,      color: C.purple },
    { name: 'Cart Adds',   value: summary.total_cart_adds,   color: C.yellow },
    { name: 'Purchases',   value: summary.total_purchases,   color: C.teal   },
  ]

  return (
    <div>
      {/* Header — unchanged */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.white }}>Market Overview</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Week of {period_start}</p>
        </div>
        <span style={{
          padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: data_quality === 'COMPLETE' ? 'rgba(63,185,80,0.12)' : 'rgba(210,153,34,0.12)',
          color: data_quality === 'COMPLETE' ? C.teal : C.yellow,
          border: `1px solid ${data_quality === 'COMPLETE' ? 'rgba(63,185,80,0.3)' : 'rgba(210,153,34,0.3)'}`
        }}>
          {data_quality === 'COMPLETE' ? '✓' : '⚠'} {data_quality}
        </span>
      </div>

      {/* KPI Row 1 —  */}
      <div className="kpi-grid">
        <KpiCard label="Market CTR"      value={`${funnel.market_ctr_pct}%`}          sub="Impressions → Clicks"  gradient="linear-gradient(135deg,#58A6FF22,#58A6FF08)" accent={C.orange} />
        <KpiCard label="Market CVR"      value={`${funnel.market_cvr_pct}%`}          sub="Clicks → Purchases"   gradient="linear-gradient(135deg,#3FB95022,#3FB95008)" accent={C.teal}   />
        <KpiCard label="Purchase Share"  value={`${brand_share.avg_purchase_share}%`} sub="Your brand share"      gradient="linear-gradient(135deg,#BC8CFF22,#BC8CFF08)" accent={C.purple} />
        <KpiCard label="Cart Conversion" value={`${funnel.cart_to_purchase_pct}%`}    sub="Cart → Purchase"       gradient="linear-gradient(135deg,#D2992222,#D2992208)" accent={C.yellow} />
      </div>

      {/* KPI Row 2 —  */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <KpiCard label="Impression Share"  value={`${brand_share.avg_impression_share}%`}              sub="Brand visibility avg" gradient="linear-gradient(135deg,#39D5D522,#39D5D508)" accent={C.cyan}   />
        <KpiCard label="Click Share"       value={`${brand_share.avg_click_share}%`}                   sub="Brand clicks avg"     gradient="linear-gradient(135deg,#FF7B7222,#FF7B7208)" accent={C.pink}   />
        <KpiCard label="Total Purchases"   value={summary.total_purchases.toLocaleString()}             sub="Market this week"     gradient="linear-gradient(135deg,#3FB95022,#3FB95008)" accent={C.green}  />
        <KpiCard label="Total Impressions" value={`${(summary.total_impressions/1000000).toFixed(2)}M`} sub="Market this week"    gradient="linear-gradient(135deg,#58A6FF22,#58A6FF08)" accent={C.orange} />
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 10, padding: '18px 20px' }}>
          <h3 style={{ color: C.white, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Market Funnel</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnelData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.subtle, fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: C.panel2, border: 'none', boxShadow: 'none', borderRadius: 8, fontSize: 12, color: C.white }}
                labelStyle={{ color: C.white, fontWeight: 600 }}
                itemStyle={{ color: C.muted }}
                cursor={{ fill: 'rgba(16, 14, 24, 0)' }}
                formatter={v => [v.toLocaleString(), '']}
              />
              <Bar dataKey="value" radius={[5,5,0,0]}>
                {funnelData.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 10, padding: '18px 20px' }}>
          <h3 style={{ color: C.white, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Price Gap Analysis</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Keyword','Market','Brand','Gap %','Position'].map(h => (
                  <th key={h} style={{ color: C.subtle, fontSize: 10, textAlign: 'left', padding: '0 8px 10px 0', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {price_gap_analysis.map((p,i) => (
                <tr key={i}>
                  <td style={{ color: C.white,  fontSize: 13, padding: '9px 8px 9px 0', borderBottom: `1px solid ${C.border}` }}>{p.search_query}</td>
                  <td style={{ color: C.muted,  fontSize: 12, padding: '9px 8px 9px 0', borderBottom: `1px solid ${C.border}` }}>₹{p.market_price}</td>
                  <td style={{ color: C.muted,  fontSize: 12, padding: '9px 8px 9px 0', borderBottom: `1px solid ${C.border}` }}>₹{p.brand_price}</td>
                  <td style={{ color: p.price_gap_pct > 5 ? C.red : C.teal, fontSize: 12, fontWeight: 700, padding: '9px 8px 9px 0', borderBottom: `1px solid ${C.border}` }}>{p.price_gap_pct}%</td>
                  <td style={{ padding: '9px 0', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'rgba(88,166,255,0.12)', color: C.orange, border: `1px solid rgba(88,166,255,0.25)`, whiteSpace: 'nowrap' }}>
                      {p.positioning}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Growth Opportunities — unchanged */}
      <div style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 10, padding: '18px 20px', marginTop: 20 }}>
        <h3 style={{ color: C.white, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>🎯 Top Growth Opportunities</h3>
        <div className="opp-grid">
          {top_opportunities.map((opp,i) => (
            <div key={i} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, borderTop: `2px solid ${[C.orange,C.purple,C.teal,C.pink,C.yellow][i]}` }}>
              <div style={{ color: C.white, fontWeight: 600, fontSize: 12, marginBottom: 8, lineHeight: 1.3 }}>{opp.search_query}</div>
              <div style={{ color: C.orange, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                {opp.volume.toLocaleString()}<span style={{ color: C.subtle, fontWeight: 400 }}> /wk</span>
              </div>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>
                Share: <strong style={{ color: C.teal }}>{opp.brand_purchase_share}%</strong>
              </div>
              <div style={{ color: C.subtle, fontSize: 10 }}>
                {opp.purchases_brand.toLocaleString()} / {opp.purchases_total.toLocaleString()} purchases
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, gradient, accent }) {
  return (
    <div style={{ background: gradient, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent, opacity: 0.7 }} />
      <div style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>{label}</div>
      <div style={{ color: accent, fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{value}</div>
      <div style={{ color: C.subtle, fontSize: 11 }}>{sub}</div>
    </div>
  )
}