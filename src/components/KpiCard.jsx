import { C } from '../colors'

export default function KpiCard({ label, value, sub, gradient, accent, icon }) {
  return (
    <div style={{ background: gradient || `linear-gradient(135deg, ${accent}22, ${accent}08)`, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent, opacity: 0.7 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        {icon && <i className={icon} style={{ color: accent, fontSize: 14 }} />}
        <div style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
      </div>
      <div style={{ color: accent, fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{value}</div>
      <div style={{ color: C.subtle, fontSize: 11 }}>{sub}</div>
    </div>
  )
}