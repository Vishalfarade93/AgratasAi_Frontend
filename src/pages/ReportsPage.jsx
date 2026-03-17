import { useEffect, useState, useRef } from 'react'
import { getReports, uploadSQP } from '../api/client'
import { C } from '../colors'

export default function ReportsPage() {
  const [reports, setReports]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg]             = useState(null)
  const fileRef = useRef()

  const fetchReports = () => {
    getReports().then(res => setReports(res.data.reports || [])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchReports() }, [])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true); setMsg(null)
    try {
      const res = await uploadSQP(file)
      setMsg({ ok: true, text: `✅  Uploaded successfully — ${res.data.keywords_stored} keywords stored · Report #${res.data.report_id}` })
      fetchReports()
    } catch (err) {
      setMsg({ ok: false, text: `❌  ${err.response?.data?.error || 'Upload failed. Check your CSV format.'}` })
    } finally {
      setUploading(false)
      fileRef.current.value = ''
    }
  }

  return (
    <div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.white }}>Reports</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Upload and manage your weekly SQP CSV files</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleUpload} />
          <button onClick={() => fileRef.current.click()} disabled={uploading}
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#58A6FF,#BC8CFF)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(88,166,255,0.3)' }}>
            {uploading ? '⏳ Uploading...' : '+ Upload Weekly CSV'}
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13, background: msg.ok ? 'rgba(63,185,80,0.08)' : 'rgba(248,81,73,0.08)', border: `1px solid ${msg.ok ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`, color: msg.ok ? C.teal : C.red }}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <p style={{ color: C.muted }}>Loading reports...</p>
      ) : reports.length === 0 ? (
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
                {['Report','Week Starting','Type','Data Quality','Source','Uploaded'].map(h => (
                  <th key={h} style={{ color: C.subtle, fontSize: 10, textAlign: 'left', padding: '12px 18px', textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r,i) => (
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
