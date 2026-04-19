import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getKeywordDetail } from '../api/client'
import { C } from '../colors'
import KpiCard from '../components/KpiCard'
import 'bootstrap-icons/font/bootstrap-icons.css'
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart
} from 'recharts'
import '../css/KeywordPage.css'

const shortWeek = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`
}

const PATTERN_CFG = {
  CONSISTENTLY_RISING:    { color: '#3FB950', icon: 'bi bi-graph-up-arrow',  label: 'Consistently Rising'    },
  RISING:                 { color: '#3FB950', icon: 'bi bi-arrow-up-right',   label: 'Rising'                 },
  CONSISTENTLY_DECLINING: { color: '#F85149', icon: 'bi bi-graph-down-arrow', label: 'Consistently Declining' },
  DECLINING:              { color: '#F85149', icon: 'bi bi-arrow-down-right', label: 'Declining'              },
  STABLE:                 { color: '#D29922', icon: 'bi bi-dash-lg',          label: 'Stable'                 },
  INSUFFICIENT_DATA:      { color: '#8B949E', icon: 'bi bi-question-circle',  label: 'Insufficient Data'      },
}

const MOMENTUM_CFG = {
  GAINING: { color: '#3FB950', icon: 'bi bi-arrow-up',   label: 'Gaining Share' },
  LOSING:  { color: '#F85149', icon: 'bi bi-arrow-down', label: 'Losing Share'  },
  STABLE:  { color: '#D29922', icon: 'bi bi-dash',       label: 'Stable Share'  },
}

const CORR_CFG = {
  STRONG:            { color: '#F85149', label: 'Strong Correlation'   },
  MODERATE:          { color: '#D29922', label: 'Moderate Correlation' },
  WEAK:              { color: '#3FB950', label: 'Weak Correlation'     },
  INSUFFICIENT_DATA: { color: '#8B949E', label: 'Not Enough Data'      },
}

// ── Tooltip — same as TrendsPage ──────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: C.panel2, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '12px 16px', minWidth: 160
    }}>
      <div style={{ color: C.muted, fontSize: 11, marginBottom: 8, textTransform: 'uppercase' }}>
        {label === 'Forecast' ? '🔮 Forecast' : `Week ${label}`}
      </div>
      {payload.map((p, i) => p.value != null && (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: C.muted, fontSize: 12 }}>{p.name}:</span>
          <span style={{ color: C.white, fontSize: 12, fontWeight: 600 }}>
            {p.value > 1000 ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── ForecastDot — same as TrendsPage ─────────────────────────────
function ForecastDot({ cx, cy }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="rgba(188,140,255,0.15)" />
      <circle cx={cx} cy={cy} r={5}  fill={C.purple} />
    </g>
  )
}

// ── KPI-style card for funnel stage counts ────────────────────────
function FunnelCountCard({ label, value, color, icon }) {
  return (
    <div style={{
      background:   `linear-gradient(135deg, ${color}22, ${color}08)`,
      border:       `1px solid ${C.border}`,
      borderRadius: 12,
      padding:      '16px 16px',
      position:     'relative',
      overflow:     'hidden'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, opacity: 0.75 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <i className={icon} style={{ color, fontSize: 13 }} />
        <span style={{ color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7 }}>
          {label}
        </span>
      </div>
      <div style={{ color, fontSize: 22, fontWeight: 800 }}>
        {value.toLocaleString()}
      </div>
    </div>
  )
}

// ── Pill for conversion rates — same visual language as TrendsPage filter pills
function MetricPill({ label, value, icon, color }) {
  return (
    <div style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          8,
      padding:      '7px 16px',
      borderRadius: 24,
      border:       `1px solid ${color}40`,
      background:   `${color}12`,
      whiteSpace:   'nowrap'
    }}>
      {icon && <i className={icon} style={{ color, fontSize: 12 }} />}
      <span style={{ color: C.muted, fontSize: 12 }}>{label}</span>
      <span style={{ color, fontSize: 15, fontWeight: 800 }}>{value}%</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function KeywordPage() {
  const { keyword }  = useParams()
  const navigate     = useNavigate()
  const location     = useLocation()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const queryParams = new URLSearchParams(location.search)
  const filterType  = queryParams.get('filter') || '6weeks'

  useEffect(() => {
    const decoded = decodeURIComponent(keyword)
    setLoading(true)
    getKeywordDetail(decoded, filterType)
      .then(res => {
        if (res.data.success) setData(res.data)
        else setError(res.data.message)
      })
      .catch(() => setError('Failed to load keyword data'))
      .finally(() => setLoading(false))
  }, [keyword, filterType])

  if (loading) return (
    <div className="keyword-container">
      <div style={{ textAlign: 'center', padding: '60px 20px', color: C.muted }}>
        <i className="bi bi-hourglass-split" style={{ fontSize: 36, display: 'block', marginBottom: 12 }} />
        Loading keyword analysis...
      </div>
    </div>
  )

  if (error) return (
    <div className="keyword-container">
      <div style={{ textAlign: 'center', padding: '60px 20px', color: C.red }}>
        <i className="bi bi-exclamation-triangle" style={{ fontSize: 48, display: 'block', marginBottom: 16 }} />
        {error}
        <button onClick={() => navigate('/trends')} className="back-button" style={{ marginTop: 20 }}>
          Back to Trends
        </button>
      </div>
    </div>
  )

  const {
    search_query, weeks_tracked, volume_trend, share_trend,
    price_analysis, funnel, ai_insight, ml_active, date_range
  } = data

  const vt = volume_trend
  const st = share_trend
  const pa = price_analysis
  const pc = PATTERN_CFG[vt.pattern]          || PATTERN_CFG.INSUFFICIENT_DATA
  const mc = MOMENTUM_CFG[st.share_momentum]  || MOMENTUM_CFG.STABLE
  const cc = CORR_CFG[pa.corr_strength]       || CORR_CFG.INSUFFICIENT_DATA

  // ── Chart data — same structure as TrendsPage getChartData ────
  const volumeChartData = vt.weeks.map((w, i) => ({
    week:     shortWeek(w),
    volume:   vt.volumes[i],
    smoothed: vt.smoothed?.[i] ?? null,
  }))
  if (vt.forecast?.next_week_volume) {
    volumeChartData.push({
      week: 'Forecast', volume: null,
      smoothed: vt.forecast.next_week_volume,
      forecast: vt.forecast.next_week_volume,
    })
  }
  const hasForecast = volumeChartData.some(d => d.forecast)

  const shareChartData = st.weeks.map((w, i) => ({
    week: shortWeek(w), share: st.shares[i],
  }))

  const priceChartData = pa.weeks.map((w, i) => ({
    week: shortWeek(w), market: pa.market_prices[i], brand: pa.brand_prices[i],
  }))

  const filterLabels = {
    '4weeks': 'Last 4 weeks', '6weeks': 'Last 6 weeks', '8weeks': 'Last 8 weeks',
    'this_month': 'This month', 'last_month': 'Last month', 'all': 'All time'
  }

  return (
    <div className="keyword-container">

      {/* ── Back button ─────────────────────────────────────────── */}
      <button onClick={() => navigate('/trends')} className="back-button">
        <i className="bi bi-arrow-left" style={{ fontSize: 13 }} /> Back to Trends
      </button>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="keyword-header">
        <div className="keyword-title">
          <h1 className="keyword-name">{search_query}</h1>
          <span className="pattern-badge"
            style={{ background: `${pc.color}18`, borderColor: `${pc.color}40`, color: pc.color }}>
            <i className={pc.icon} style={{ fontSize: 12 }} /> {pc.label}
          </span>
          {vt.confidence && (
            <span className="confidence-badge">
              <i className="bi bi-robot" style={{ fontSize: 11 }} /> {vt.confidence}% confidence
            </span>
          )}
         
        </div>
        <p className="keyword-stats">
          {weeks_tracked} weeks analysed ({filterLabels[filterType] || filterType})
          {date_range && ` · ${date_range.from} → ${date_range.to}`}
          {vt.slope_pct_per_week && ` · ${vt.slope_pct_per_week > 0 ? '+' : ''}${vt.slope_pct_per_week}% per week`}
        </p>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      <div className="kpi-grid">
        <KpiCard
          label="Volume Growth"
          value={`${vt.growth_pct > 0 ? '+' : ''}${vt.growth_pct}%`}
          sub="over tracked period"
          gradient={`linear-gradient(135deg,${vt.growth_pct >= 0 ? '#3FB950' : '#F85149'}22,${vt.growth_pct >= 0 ? '#3FB950' : '#F85149'}08)`}
          accent={vt.growth_pct >= 0 ? '#3FB950' : '#F85149'}
          icon="bi bi-graph-up"
        />
        <KpiCard
          label="Share Momentum"
          value={`${st.share_change > 0 ? '+' : ''}${st.share_change}%`}
          sub={mc.label}
          gradient={`linear-gradient(135deg,${mc.color}22,${mc.color}08)`}
          accent={mc.color} icon={mc.icon}
        />
        <KpiCard
          label="Price Correlation"
          value={pa.correlation ?? 'N/A'}
          sub={cc.label}
          gradient={`linear-gradient(135deg,${cc.color}22,${cc.color}08)`}
          accent={cc.color} icon="bi bi-tag"
        />
        <KpiCard
          label="Next Week Forecast"
          value={vt.forecast ? vt.forecast.next_week_volume.toLocaleString() : 'N/A'}
          sub={vt.forecast ? `±${(vt.forecast.forecast_upper - vt.forecast.next_week_volume).toLocaleString()} range` : 'Need 3+ weeks'}
          gradient="linear-gradient(135deg,#BC8CFF22,#BC8CFF08)"
          accent="#BC8CFF" icon="bi bi-calendar-week"
        />
      </div>

      {/* ── Volume Trend — identical render to TrendsPage volume view */}
      <div className="chart-card">
        <div className="section-title">
          <i className="bi bi-bar-chart-line" />
          <span>Volume Trend & Forecast</span>
        </div>

        {/* Chart wrapper matches TrendsPage inner panel */}
        <div style={{
          background: C.panel2, borderRadius: 10,
          padding: '14px 8px 8px', border: `1px solid ${C.border}`
        }}>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={volumeChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="kwVolGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#58A6FF" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#58A6FF" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} opacity={0.5} />
              <XAxis dataKey="week" tick={{ fill: C.muted,  fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis               tick={{ fill: C.subtle, fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              {/* Area — same orange fill as TrendsPage */}
              <Area
                type="monotone" dataKey="volume" name="Volume"
                fill="url(#kwVolGrad)" stroke={C.orange} strokeWidth={2} dot={false}
              />
              {/* Dashed purple ML trend line + ForecastDot — same as TrendsPage */}
              <Line
                type="monotone" dataKey="smoothed" name="ML Trend"
                stroke={C.purple} strokeWidth={2.5} strokeDasharray="5 3"
                dot={props => props.payload.week === 'Forecast' ? <ForecastDot {...props} /> : null}
              />
              {hasForecast && (
                <ReferenceLine x="Forecast" stroke={C.purple} strokeDasharray="4 2"
                  label={{ value: '🔮', fill: C.purple, fontSize: 12 }} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {vt.forecast && (
          <div className="forecast-stats">
            <span><span style={{ color: C.purple }}>●</span> Forecast: <strong>{vt.forecast.next_week_volume.toLocaleString()}</strong></span>
            <span><span style={{ color: '#58A6FF' }}>◆</span> Confidence: {vt.forecast.confidence}%</span>
          </div>
        )}
      </div>

      {/* ── Share + Price side by side ───────────────────────────── */}
      <div className="two-columns">

        <div className="chart-card" style={{ marginBottom: 0 }}>
          <div className="section-title">
            <i className="bi bi-pie-chart-fill" />
            <span>Brand Share Trend</span>
          </div>
          <div style={{ background: C.panel2, borderRadius: 10, padding: '14px 8px 8px', border: `1px solid ${C.border}` }}>
            <ResponsiveContainer width="100%" height={170}>
              <ComposedChart data={shareChartData.filter(d => d.share != null)} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="kwShareGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={mc.color} stopOpacity={0.3}  />
                    <stop offset="100%" stopColor={mc.color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} opacity={0.5} />
                <XAxis dataKey="week" tick={{ fill: C.muted,  fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis               tick={{ fill: C.subtle, fontSize: 9  }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="share" name="Share %"
                  fill="url(#kwShareGrad)" stroke={mc.color} strokeWidth={2.5}
                  dot={{ fill: mc.color, r: 4, strokeWidth: 2, stroke: C.panel2 }}
                />
                <ReferenceLine y={st.shares[0]} stroke={C.subtle} strokeDasharray="4 2"
                  label={{ value: '', fill: C.subtle, fontSize: 9, position: 'right' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-footer">
            <span>Start: <strong>{st.shares[0]}%</strong></span>
            <span>Latest: <strong>{st.shares[st.shares.length - 1]}%</strong></span>
            <span style={{ color: mc.color, fontWeight: 700 }}>
              {st.share_change > 0 ? '+' : ''}{st.share_change}%
            </span>
          </div>
        </div>

        <div className="chart-card" style={{ marginBottom: 0 }}>
          <div className="section-title">
            <i className="bi bi-cash-stack" />
            <span>Price Analysis</span>
          </div>
          <div style={{ background: C.panel2, borderRadius: 10, padding: '14px 8px 8px', border: `1px solid ${C.border}` }}>
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={priceChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} opacity={0.5} />
                <XAxis dataKey="week" tick={{ fill: C.muted,  fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis               tick={{ fill: C.subtle, fontSize: 9  }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="market" name="Market Price" stroke="#58A6FF" strokeWidth={2.5} dot={{ fill: '#58A6FF', r: 3 }} />
                <Line type="monotone" dataKey="brand"  name="Your Price"   stroke="#F85149" strokeWidth={2.5} strokeDasharray="5 3" dot={{ fill: '#F85149', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-footer">
            <span><span style={{ color: '#58A6FF' }}>●</span> Market ₹{pa.market_prices[pa.market_prices.length - 1]}</span>
            <span><span style={{ color: '#F85149' }}>●</span> Brand ₹{pa.brand_prices[pa.brand_prices.length - 1]}</span>
            <span style={{ color: cc.color, fontWeight: 700 }}>{cc.label}</span>
          </div>
        </div>

      </div>

      {/* ── Funnel ───────────────────────────────────────────────── */}
      <div className="chart-card">
        <div className="section-title">
          <i className="bi bi-funnel-fill" />
          <span>Keyword Funnel (Latest Week)</span>
        </div>

        {/* Stage counts — Dashboard KPI card style with gradients */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 0 }}>
          <FunnelCountCard label="Impressions" value={funnel.impressions} color="#58A6FF" icon="bi bi-eye"       />
          <FunnelCountCard label="Clicks"      value={funnel.clicks}      color="#BC8CFF" icon="bi bi-cursor"    />
          <FunnelCountCard label="Cart Adds"   value={funnel.cart_adds}   color="#D29922" icon="bi bi-cart-plus" />
          <FunnelCountCard label="Purchases"   value={funnel.purchases}   color="#3FB950" icon="bi bi-bag-check" />
        </div>

        {/* Conversion rates — pill style matching TrendsPage filter pills */}
        <div style={{
          borderTop:  `1px solid ${C.border}`,
          marginTop:  18,
          paddingTop: 16,
          display:    'flex',
          alignItems: 'center',
          gap:        10,
          flexWrap:   'wrap'
        }}>
          <span style={{
            color: C.muted, fontSize: 11, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: 0.8, marginRight: 4
          }}>
            Conversion Rates
          </span>
          <MetricPill label="CTR"             value={funnel.ctr}              icon="bi bi-cursor-fill" color="#58A6FF" />
          <MetricPill label="Click → Cart"    value={funnel.click_to_cart}    icon="bi bi-cart-fill"   color="#D29922" />
          <MetricPill label="Cart → Purchase" value={funnel.cart_to_purchase} icon="bi bi-bag-fill"    color="#BC8CFF" />
          <MetricPill label="CVR"             value={funnel.cvr}              icon="bi bi-graph-up"    color="#3FB950" />
        </div>
      </div>

      {/* ── AI Insight ────────────────────────────────────────────── */}
      {ai_insight && (
        <div className="ai-card">
          <div className="ai-header">
            <i className="bi bi-stars" />
            <span className="ai-title">AI Strategic Insight — {search_query}</span>
            <span className="ai-model">Llama 3.3 70B</span>
          </div>
          <p className="ai-text">{ai_insight}</p>
        </div>
      )}

    </div>
  )
}