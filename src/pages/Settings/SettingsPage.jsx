import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import styles from './SettingsPage.module.css'

// ── Helper: generate time options every 5 minutes ──────────
function generateTimeOptions(startHour, endHour) {
  const options = []
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += 5) {
      if (h === endHour && m > 0) break
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      options.push(`${hh}:${mm}`)
    }
  }
  return options
}

const MORNING_OPTIONS  = generateTimeOptions(8, 11)   // 07:00 → 10:00
const ENDWORK_OPTIONS  = generateTimeOptions(14, 18)   // 14:00 → 18:00

// ── Persist to localStorage ────────────────────────────────
function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem('org_settings') || '{}')
  } catch { return {} }
}

export default function SettingsPage() {
  const { addToast } = useApp()
  const saved = loadSettings()

  const [lateThreshold,  setLateThreshold]  = useState(saved.lateThreshold  || '08:30')
  const [endWorkTime,    setEndWorkTime]     = useState(saved.endWorkTime    || '16:30')
  const [saving,         setSaving]          = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const settings = { lateThreshold, endWorkTime }
    localStorage.setItem('org_settings', JSON.stringify(settings))

    // ── When backend is ready, send to API ──
    // const token = localStorage.getItem('token')
    // await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    //   body: JSON.stringify(settings)
    // })

    setTimeout(() => {
      addToast('Settings saved successfully.')
      setSaving(false)
    }, 400)
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>SETTINGS</h1>
          <p className={styles.pageSub}>Configure operational parameters for your unit.</p>
        </div>
      </div>

      <div className={styles.grid}>

        {/* ── Attendance Rules card ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span className={styles.cardTitle}>ATTENDANCE RULES</span>
          </div>
          <p className={styles.cardDesc}>
            Define the thresholds used to determine late arrivals and end of workday for employees in your unit.
          </p>

          <div className={styles.fieldGroup}>

            {/* Late threshold */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                LATE ARRIVAL THRESHOLD
              </label>
              <p className={styles.fieldHint}>
                Employees arriving after this time will be marked as late.
              </p>
              <div className={styles.timeSelector}>
                <select
                  className={styles.timeSelect}
                  value={lateThreshold}
                  onChange={e => setLateThreshold(e.target.value)}
                >
                  {MORNING_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span className={styles.timeBadge}>
                  Arrivals after {lateThreshold} → LATE
                </span>
              </div>
            </div>

            {/* End work time */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                END OF WORK TIME
              </label>
              <p className={styles.fieldHint}>
                The official end of the workday for attendance tracking.
              </p>
              <div className={styles.timeSelector}>
                <select
                  className={styles.timeSelect}
                  value={endWorkTime}
                  onChange={e => setEndWorkTime(e.target.value)}
                >
                  {ENDWORK_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span className={styles.timeBadge}>
                  Workday ends at {endWorkTime}
                </span>
              </div>
            </div>

          </div>

          {/* Preview */}
          <div className={styles.preview}>
            <div className={styles.previewTitle}>CURRENT CONFIGURATION</div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Late if arriving after</span>
              <span className={styles.previewVal} style={{ color: 'var(--red)' }}>{lateThreshold}</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Workday ends at</span>
              <span className={styles.previewVal} style={{ color: 'var(--green)' }}>{endWorkTime}</span>
            </div>
          </div>

          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'SAVING…' : 'SAVE SETTINGS'}
            {!saving && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}