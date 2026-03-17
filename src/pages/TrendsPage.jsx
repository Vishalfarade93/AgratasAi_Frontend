import { useEffect, useState, useMemo } from 'react'
import { getTrends } from '../api/client'
import {
  ComposedChart, Line, Bar, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend
} from 'recharts'
import { C } from '../colors'

const patternColor  = p => p?.includes('RISING') ? C.teal : p?.includes('DECLINING') ? C.red : C.muted
const momentumColor = m => m === 'GAINING' ? C.teal : m === 'LOSING' ? C.red : C.muted

const TIME_FILTERS = [
  { key: '4weeks',     label: '4W'        },
  { key: '6weeks',     label: '6W'        },
  { key: '8weeks',     label: '8W'        },
  { key: 'this_month', label: 'This Month'},
  { key: 'last_month', label: 'Last Month'},
  { key: 'all',        label: 'All Time'  },
]

export default function TrendsPage() {

  // ── ALL HOOKS FIRST ──────────────────────────────────────────
  const [data,           setData]           = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [selected,       setSelected]       = useState(null)
  const [view,           setView]           = useState('volume')
  const [timeFilter,     setTimeFilter]     = useState('6weeks')
  const [patternFilter,  setPatternFilter]  = useState('all') // all | rising | declining | stable
  const [flagFilter,     setFlagFilter]     = useState('all') // all | priceHurting | losingShare

  useEffect(() => {
    setLoading(true)
    getTrends(timeFilter)
      .then(res => {
        setData(res.data)
        setSelected(prev => {
          const found = res.data.keyword_trends?.find(k => k.search_query === prev?.search_query)
          return found || res.data.keyword_trends?.[0] || null
        })
      })
      .finally(() => setLoading(false))
  }, [timeFilter])

  const filteredKeywords = useMemo(() => {
    const keywords = data?.keyword_trends
    if (!keywords?.length) return []
    return keywords.filter(k => {
      const pattern = k.volume_trend?.pattern || ''
      if (patternFilter === 'rising'    && !pattern.includes('RISING'))   return false
      if (patternFilter === 'declining' && !pattern.includes('DECLINING')) return false
      if (patternFilter === 'stable'    && (pattern.includes('RISING') || pattern.includes('DECLINING'))) return false
      if (flagFilter === 'priceHurting' && !k.price_analysis?.price_hurting_share) return false
      if (flagFilter === 'losingShare'  && k.share_trend?.momentum !== 'LOSING')   return false
      return true
    })
  }, [data, patternFilter, flagFilter])

  useEffect(() => {
    if (!selected || !filteredKeywords.length) return
    const stillExists = filteredKeywords.some(k => k.search_query === selected.search_query)
    if (!stillExists) setSelected(filteredKeywords[0] || null)
  }, [filteredKeywords])

  // ── EARLY RETURNS after all hooks ────────────────────────────
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
      <div style={{ color: C.muted }}>Loading {TIME_FILTERS.find(f => f.key === timeFilter)?.label}...</div>
    </div>
  )

  if (!data?.success) return (
    <p style={{ color: C.muted, padding: 20 }}>{data?.message || 'No data'}</p>
  )

  const { summary, ml_active } = data

  const getChartData = (keyword) => {
    if (!keyword) return []
    const rows = (keyword.history || []).map((h, i) => ({
      week:     h.week.slice(5),
      volume:   h.volume,
      smoothed: keyword.smoothed_volumes?.[i],
      share:    h.purchase_share,
      priceGap: h.price_gap_pct,
    }))
    if (keyword.forecast?.next_week_volume) {
      rows.push({ week: 'Forecast', volume: null, smoothed: keyword.forecast.next_week_volume, forecast: keyword.forecast.next_week_volume, share: null, priceGap: null })
    }
    return rows
  }

  const chartData = getChartData(selected)

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', minWidth: 160 }}>
        <div style={{ color: C.muted, fontSize: 11, marginBottom: 8, textTransform: 'uppercase' }}>
          {label === 'Forecast' ? '🔮 Forecast' : `Week ${label}`}
        </div>
        {payload.map((p, i) => p.value != null && (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
            <span style={{ color: C.muted, fontSize: 12 }}>{p.name}:</span>
            <span style={{ color: C.white, fontSize: 12, fontWeight: 600 }}>
              {p.value > 1000 ? p.value.toLocaleString() : p.value}
              {p.name === 'Share' || p.name === 'Price Gap' ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Filter pill helper
 const Pill = ({ active, onClick, color, label, icon }) => (
  <button onClick={onClick}
    style={{
      padding: '5px 14px', borderRadius: 20,
      border: `1px solid ${active ? (color || C.orange) : C.border}`,
      background: active ? `${color || C.orange}18` : 'transparent',
      color: active ? (color || C.orange) : C.muted,
      fontSize: 12, fontWeight: active ? 700 : 400, cursor: 'pointer',
      transition: 'all 0.15s', whiteSpace: 'nowrap',
      display: 'flex', alignItems: 'center', gap: 6
    }}>
    {icon && <i className={icon} style={{ fontSize: 12, color: active ? (color || C.orange) : C.muted }} />}
    {label}
  </button>
)

  return (
    <div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.white }}>Trends & ML Analysis</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            {data.total_reports_analysed} weeks · {data.total_keywords_tracked} keywords
            {data.date_range && <span style={{ color: C.subtle, marginLeft: 8 }}>({data.date_range.from} → {data.date_range.to})</span>}
          </p>
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────── */}
      <div style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>

        {/* Time Range Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ color: C.subtle, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, minWidth: 80 }}>Time Range</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TIME_FILTERS.map(f => (
              <Pill key={f.key} label={f.label} active={timeFilter === f.key} onClick={() => setTimeFilter(f.key)} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: C.border, marginBottom: 10 }} />

        {/* Pattern + Flag Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: C.subtle, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, minWidth: 80 }}>Pattern</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Pill label="All"       active={patternFilter === 'all'}       onClick={() => setPatternFilter('all')} />
              <Pill label="↑ Rising"  active={patternFilter === 'rising'}    onClick={() => setPatternFilter('rising')}    color={C.teal}  />
              <Pill label="↓ Declining" active={patternFilter === 'declining'} onClick={() => setPatternFilter('declining')} color={C.red}   />
              <Pill label="→ Stable"  active={patternFilter === 'stable'}    onClick={() => setPatternFilter('stable')}    color={C.muted} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: C.subtle, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, minWidth: 60 }}>Flags</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Pill label="All"           active={flagFilter === 'all'}          onClick={() => setFlagFilter('all')} />
             <Pill
                label="Price Hurting"
                icon="bi bi-tag-fill"
                active={flagFilter === 'priceHurting'}
                onClick={() => setFlagFilter('priceHurting')}
                color={C.pink}
              />
              <Pill
                label="Losing Share"
                icon="bi bi-exclamation-triangle"
                active={flagFilter === 'losingShare'}
                onClick={() => setFlagFilter('losingShare')}
                color={C.yellow}
              />
            </div>
          </div>

          <span style={{ marginLeft: 'auto', color: C.subtle, fontSize: 11, whiteSpace: 'nowrap' }}>
            {filteredKeywords.length} / {data.total_keywords_tracked} shown
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Rising',        value: summary.rising_keywords,              color: C.teal,   icon: <i className="bi bi-graph-up-arrow"      style={{ color: C.teal,   fontSize: 20 }} /> },
          { label: 'Declining',     value: summary.declining_keywords,           color: C.red,    icon: <i className="bi bi-graph-down-arrow"    style={{ color: C.red,    fontSize: 20 }} /> },
          { label: 'Losing Share',  value: summary.keywords_losing_share,        color: C.yellow, icon: <i className="bi bi-exclamation-triangle" style={{ color: C.yellow, fontSize: 20 }} /> },
          { label: 'Price Hurting', value: summary.keywords_where_price_hurting, color: C.pink,   icon: <i className="bi bi-tag"                 style={{ color: C.pink,   fontSize: 20 }} /> },
        ].map((s, i) => (
          <div key={i} style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderLeft: `3px solid ${s.color}` }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <div>
              <div style={{ color: s.color, fontSize: 24, fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panel — Keyword List + Detail */}
      <div className="trends-main">

        {/* Keyword List */}
        <div style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, background: C.panel2 }}>
            <span style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
              {filteredKeywords.length} Keywords
            </span>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 600 }}>
            {filteredKeywords.length === 0 ? (
              <div style={{ color: C.subtle, fontSize: 12, padding: '20px 14px', textAlign: 'center' }}>No keywords match filters</div>
            ) : filteredKeywords.map((k, i) => (
              <div key={i} onClick={() => setSelected(k)}
                style={{
                  padding: '10px 14px', cursor: 'pointer',
                  borderLeft: `3px solid ${selected?.search_query === k.search_query ? C.orange : 'transparent'}`,
                  background: selected?.search_query === k.search_query ? 'rgba(88,166,255,0.07)' : 'transparent',
                  borderBottom: `1px solid rgba(48,54,61,0.6)`
                }}>
                <div style={{ color: C.white, fontSize: 12, fontWeight: 500, marginBottom: 3 }}>{k.search_query}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ color: patternColor(k.volume_trend?.pattern), fontSize: 10 }}>
                    {k.volume_trend?.pattern?.includes('RISING') ? '↑' : k.volume_trend?.pattern?.includes('DECLINING') ? '↓' : '→'}
                    {' '}{k.volume_trend?.pattern?.replace(/_/g, ' ')}
                  </span>
                  {k.price_analysis?.price_hurting_share && <span style={{ fontSize: 9 }}><i className="bi bi-currency-rupee" style={{ color: C.pink }}></i></span>}
                  {k.share_trend?.momentum === 'LOSING' && <span style={{ fontSize: 9 }}><i className="bi bi-exclamation-triangle" style={{ color: C.yellow }}></i></span>}
                </div>
                <div style={{ color: C.subtle, fontSize: 10, marginTop: 2 }}>
                  {k.volume_trend?.latest_volume?.toLocaleString()} vol · {k.weeks_tracked}wk
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selected ? (
          <div style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, minWidth: 0 }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ color: C.white, fontSize: 15, fontWeight: 700 }}>{selected.search_query}</h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selected.volume_trend?.confidence != null && (
                  <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: 'rgba(63,185,80,0.1)', color: C.teal, border: '1px solid rgba(63,185,80,0.25)' }}>
                  <i className="bi bi-robot" style={{ fontSize: 11 }} /> {selected.volume_trend.confidence}% conf
                  </span>
                )}
                <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: `${patternColor(selected.volume_trend?.pattern)}18`, color: patternColor(selected.volume_trend?.pattern), border: `1px solid ${patternColor(selected.volume_trend?.pattern)}40` }}>
                  {selected.volume_trend?.pattern?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* View Switcher */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
  {[
    { key: 'volume',   label: 'Volume + Forecast', icon: 'bi bi-bar-chart-line' },
    { key: 'share',    label: 'Share Trend',        icon: 'bi bi-graph-up'       },
    { key: 'combined', label: 'Full Analysis',      icon: 'bi bi-layers'         },
  ].map(v => (
    <button key={v.key} onClick={() => setView(v.key)}
      style={{
        padding: '5px 12px', borderRadius: 6,
        border: `1px solid ${view === v.key ? C.orange : C.border}`,
        background: view === v.key ? 'rgba(88,166,255,0.12)' : 'transparent',
        color: view === v.key ? C.orange : C.muted,
        fontSize: 11, fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6
      }}>
      <i className={v.icon} style={{ fontSize: 13, color: view === v.key ? C.orange : C.muted }} />
      {v.label}
    </button>
  ))}
</div>

            {/* Chart */}
            <div style={{ background: C.panel2, borderRadius: 10, padding: '14px 8px 8px', marginBottom: 16, border: `1px solid ${C.border}` }}>
              {view === 'volume' && (
                <ResponsiveContainer width="100%" height={190}>
                  <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#58A6FF" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#58A6FF" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} opacity={0.5} />
                    <XAxis dataKey="week"    tick={{ fill: C.muted,  fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis                  tick={{ fill: C.subtle, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="volume"   fill="url(#volGrad)" stroke={C.orange} strokeWidth={2}   dot={false} name="Volume" />
                    <Line type="monotone" dataKey="smoothed"                       stroke={C.purple} strokeWidth={2.5} dot={props => props.payload.week === 'Forecast' ? <ForecastDot {...props} /> : null} strokeDasharray="5 3" name="ML Trend" />
                    {chartData.some(d => d.forecast) && (
                      <ReferenceLine x="Forecast" stroke={C.purple} strokeDasharray="4 2" label={{ value: '🔮', fill: C.purple, fontSize: 12 }} />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              )}

              {view === 'share' && (
                <ResponsiveContainer width="100%" height={190}>
                  <ComposedChart data={chartData.filter(d => d.share != null)} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="shareGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#3FB950" stopOpacity={0.3}  />
                        <stop offset="100%" stopColor="#3FB950" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} opacity={0.5} />
                    <XAxis dataKey="week" tick={{ fill: C.muted,  fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis               tick={{ fill: C.subtle, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="share" fill="url(#shareGrad)" stroke={C.teal} strokeWidth={2.5} dot={{ fill: C.teal, r: 4, strokeWidth: 2, stroke: C.panel2 }} name="Share" />
                    <ReferenceLine y={selected.share_trend?.first_week_share} stroke={C.subtle} strokeDasharray="4 2" label={{ value: 'Start', fill: C.subtle, fontSize: 9, position: 'right' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}

              {view === 'combined' && (
                <ResponsiveContainer width="100%" height={190}>
                  <ComposedChart data={chartData.filter(d => d.volume != null)} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} opacity={0.4} />
                    <XAxis dataKey="week"  tick={{ fill: C.muted,  fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="vol"  tick={{ fill: C.subtle, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <YAxis yAxisId="pct" orientation="right" tick={{ fill: C.subtle, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar  yAxisId="vol" dataKey="volume"   fill={C.orange} opacity={0.2} radius={[3,3,0,0]} name="Volume" />
                    <Line yAxisId="vol" type="monotone" dataKey="smoothed" stroke={C.orange} strokeWidth={2.5} dot={false} name="ML Trend" />
                    <Line yAxisId="pct" type="monotone" dataKey="share"    stroke={C.teal}   strokeWidth={2}   dot={{ fill: C.teal, r: 3 }} name="Share" />
                    <Line yAxisId="pct" type="monotone" dataKey="priceGap" stroke={C.red}    strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Price Gap" />
                    <Legend wrapperStyle={{ color: C.muted, fontSize: 11, paddingTop: 8 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: 14 }}>
              {[
                { label: 'Volume Pattern',   value: selected.volume_trend?.pattern?.replace(/_/g,' '),                                                             color: patternColor(selected.volume_trend?.pattern) },
                { label: 'Weekly Growth',    value: `${selected.volume_trend?.slope_pct_per_week}% /wk`,                                                          color: C.orange },
                { label: 'Total Change',     value: `${selected.volume_trend?.total_change_pct >= 0 ? '+' : ''}${selected.volume_trend?.total_change_pct}%`,      color: C.purple },
                { label: 'Next Wk Forecast', value: selected.forecast?.next_week_volume?.toLocaleString(),                                                         color: C.cyan   },
                { label: 'Share Momentum',   value: selected.share_trend?.momentum,                                                                               color: momentumColor(selected.share_trend?.momentum) },
                { label: 'Share Change',     value: `${selected.share_trend?.total_share_change >= 0 ? '+' : ''}${selected.share_trend?.total_share_change}%`,   color: selected.share_trend?.total_share_change >= 0 ? C.teal : C.red },
              ].map((s, i) => (
                <div key={i} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ color: C.subtle, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ color: s.color, fontWeight: 700, fontSize: 13 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Price Alert */}
            {selected.price_analysis?.price_hurting_share && (
              <div style={{ background: 'rgba(248,81,73,0.07)', border: '1px solid rgba(248,81,73,0.25)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ color: C.red, fontSize: 13, fontWeight: 700, marginBottom: 4 }}><i className="bi bi-exclamation-triangle"></i> Price is hurting your market share</div>
                <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5 }}>
                  Gap widened from <strong style={{ color: C.white }}>{selected.price_analysis.first_week_gap_pct}%</strong> to <strong style={{ color: C.red }}>{selected.price_analysis.latest_gap_pct}%</strong> ·
                  Correlation: <strong style={{ color: C.red }}>{selected.price_analysis.correlation}</strong> ({selected.price_analysis.correlation_strength})
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: C.muted, fontSize: 13 }}>
            Select a keyword to view details
          </div>
        )}
      </div>
    </div>
  )
}

function ForecastDot({ cx, cy }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="rgba(188,140,255,0.15)" />
      <circle cx={cx} cy={cy} r={5}  fill={C.purple} />
    </g>
  )
}

