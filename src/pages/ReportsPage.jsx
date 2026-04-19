import { useEffect, useState, useRef } from 'react'
import { getReports, uploadSQP } from '../api/client'
import { C } from '../colors'

// ── Skeleton shimmer ──────────────────────────────────────────────
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

function ReportsSkeleton() {
  return (
    <div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Skel width={100} height={24} style={{ marginBottom: 8 }} />
          <Skel width={260} height={13} />
        </div>
        <Skel width={160} height={38} radius={8} />
      </div>
      {/* Table rows */}
      <div style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ background: C.panel2, padding: '10px 20px', borderBottom: `1px solid ${C.border}` }}>
          <Skel width={120} height={11} />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 24 }}>
            <Skel width={30} height={13} />
            <Skel width={80} height={13} />
            <Skel width={60} height={13} />
            <Skel width={70} height={20} radius={20} />
            <Skel width={90} height={13} />
            <Skel width={80} height={13} />
          </div>
        ))}
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const fetchReports = () => {
    getReports().then(res => setReports(res.data.reports || [])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchReports() }, [])

  const handleFile = async (file) => {
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      setMsg({ ok: false, text: '❌ Please upload a CSV file.' })
      return
    }
    setUploading(true); setMsg(null)
    try {
      const res = await uploadSQP(file)
      if (res.data.success) {
        setMsg({ ok: true, text: `✅ Uploaded successfully — ${res.data.keywords_stored || res.data.keywords_inserted || 0} keywords stored · Report #${res.data.report_id}` })
        fetchReports()
      } else {
        setMsg({ ok: false, text: `❌ ${res.data.error || res.data.message || 'Upload failed.'}` })
      }
    } catch (err) {
      setMsg({ ok: false, text: `❌ ${err.response?.data?.error || 'Upload failed. Check your CSV format.'}` })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onFileChange = (e) => handleFile(e.target.files[0])
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)

  if (loading) return <ReportsSkeleton />

  return (
    <div>
      {/* Header — same as before */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.white }}>Reports</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Upload and manage your weekly SQP CSV files</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={onFileChange} />
          <button onClick={() => fileRef.current.click()} disabled={uploading}
            style={{ display: 'none' }}
          // style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#58A6FF,#BC8CFF)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(88,166,255,0.3)', opacity: uploading ? 0.7 : 1 }}
          >
            {/* {uploading ? '⏳ Uploading...' : '+ Upload Weekly CSV'} */}
          </button>
        </div>
      </div>

      {/* Drag & drop */}
      <div
        onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
        onClick={() => !uploading && fileRef.current?.click()
        }
        style={{
          border: `3px dashed ${dragOver ? '#58A6FF' : C.orange2}`,
          borderRadius: 15,
          backgroundColor: ' #15161d',
          padding: '50px',
          textAlign: 'center',
          margin: ' 30px 100px 30px 100px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragOver ? 'rgba(88,166,255,0.05)' : 'transparent',
          transition: 'all 0.2s',
          color: dragOver ? '#58A6FF' : C.muted,
          fontSize: 15
        }}
      >
        {uploading
          ? '⏳ Processing your CSV...'
          : dragOver
            ? ' Drop to upload'
            : ' Upload Or Drag & Drop your CSV here'
        }
      </div>

      {/* Message banner */}
      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13, background: msg.ok ? 'rgba(63,185,80,0.08)' : 'rgba(248,81,73,0.08)', border: `1px solid ${msg.ok ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`, color: msg.ok ? C.teal : C.red, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 16, lineHeight: 1, marginLeft: 12 }}>×</button>
        </div>
      )}

      {/* Reports list — same as before */}
      {reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📁</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 8 }}>No reports yet</div>
          <div style={{ color: C.muted }}>Upload your first weekly SQP CSV to get started</div>
        </div>
      ) : (
        <div style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ background: C.panel2, padding: '10px 20px', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {reports.length} report{reports.length !== 1 ? 's' : ''} uploaded
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Report', 'Week Starting', 'Type', 'Data Quality', 'Source', 'Uploaded'].map(h => (
                  <th key={h} style={{ color: C.subtle, fontSize: 10, textAlign: 'left', padding: '12px 18px', textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid rgba(48,54,61,0.6)` }}>
                  <td style={{ padding: '13px 18px' }}>
                    <span style={{ color: C.orange, fontWeight: 700, fontSize: 13 }}>#{r.report_id}</span>
                  </td>
                  <td style={{ color: C.white, fontSize: 13, padding: '13px 18px', fontWeight: 500 }}>{r.period_start}</td>
                  <td style={{ color: C.muted, fontSize: 12, padding: '13px 18px' }}>{r.period_type}</td>
                  <td style={{ padding: '13px 18px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: r.data_quality === 'COMPLETE' ? 'rgba(63,185,80,0.12)' : 'rgba(210,153,34,0.12)', color: r.data_quality === 'COMPLETE' ? C.teal : C.yellow, border: `1px solid ${r.data_quality === 'COMPLETE' ? 'rgba(63,185,80,0.3)' : 'rgba(210,153,34,0.3)'}` }}>
                      {r.data_quality === 'COMPLETE' ? '✓ ' : '⚠ '}{r.data_quality}
                    </span>
                  </td>
                  <td style={{ color: C.muted, fontSize: 12, padding: '13px 18px' }}>{r.data_source}</td>
                  <td style={{ color: C.subtle, fontSize: 12, padding: '13px 18px' }}>{new Date(r.uploaded_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}