import { C } from '../colors'

// Full page loader
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: 16
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: `3px solid ${C.border}`,
        borderTop: `3px solid ${C.orange}`,
        animation: 'spin 0.8s linear infinite'
      }} />
      <span style={{ color: C.muted, fontSize: 13 }}>{message}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// Skeleton block — mimics content shape while loading
export function Skeleton({ width = '100%', height = 20, borderRadius = 6, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius,
      background: `linear-gradient(90deg, ${C.panel} 25%, ${C.panel2} 50%, ${C.panel} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style
    }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </div>
  )
}

// KPI card skeleton
export function KpiSkeleton() {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '16px 18px'
    }}>
      <Skeleton width="60%" height={11} style={{ marginBottom: 12 }} />
      <Skeleton width="40%" height={26} style={{ marginBottom: 8 }} />
      <Skeleton width="70%" height={11} />
    </div>
  )
}

// Dashboard skeleton — full page
export function DashboardSkeleton() {
  return (
    <div>
      <Skeleton width={200} height={24} style={{ marginBottom: 6 }} />
      <Skeleton width={300} height={13} style={{ marginBottom: 28 }} />

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 20 }}>
        {[...Array(8)].map((_, i) => <KpiSkeleton key={i} />)}
      </div>

      {/* Chart */}
      <Skeleton height={220} borderRadius={12} style={{ marginBottom: 20 }} />

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Skeleton height={180} borderRadius={12} />
        <Skeleton height={180} borderRadius={12} />
      </div>
    </div>
  )
}

// Trends skeleton
export function TrendsSkeleton() {
  return (
    <div>
      <Skeleton width={220} height={24} style={{ marginBottom: 6 }} />
      <Skeleton width={280} height={13} style={{ marginBottom: 24 }} />
      <Skeleton height={80} borderRadius={10} style={{ marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[...Array(4)].map((_, i) => <Skeleton key={i} height={70} borderRadius={10} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
        <Skeleton height={400} borderRadius={10} />
        <Skeleton height={400} borderRadius={10} />
      </div>
    </div>
  )
}