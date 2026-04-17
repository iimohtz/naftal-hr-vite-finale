import { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  StatusBadge,
  Avatar,
  Button,
  Modal,
  FormField,
  Input,
} from "../../components/UI/UI";
import styles from "./ProfilePage.module.css";

/* ─────────────────────────────────────────────────────────────
   ADMIN ACCESS LIST
   Add the numeric database IDs of users who have admin access.
   ───────────────────────────────────────────────────────────── */
const ADMIN_IDS = [1];

/* ─────────────────────────────────────────────────────────────
   Helper – read the user saved by LoginPage from localStorage.
   LoginPage does:  localStorage.setItem('user', JSON.stringify(data.person))
   So data.person fields are available here directly.
   ───────────────────────────────────────────────────────────── */
function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function getAttendanceSessions() {
  try {
    return JSON.parse(localStorage.getItem('attendance') || '[]')
  } catch { return [] }
}





/* ─── Mini Icons ────────────────────────────────────────────── */
const IDIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M4.5 7h5M4.5 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const EmailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M1 4l6 4 6-4" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M4.5 1.5h5a1 1 0 011 1v9a1 1 0 01-1 1h-5a1 1 0 01-1-1v-9a1 1 0 011-1zM6.5 11h1"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M7 1.5a4 4 0 014 4c0 2.5-4 7-4 7S3 8 3 5.5a4 4 0 014-4z"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

/* Position / unit icon – briefcase */
const PositionIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M4.5 5V3.5A1.5 1.5 0 016 2h2a1.5 1.5 0 011.5 1.5V5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path d="M1 9h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const CalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M1 7h14M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/* ─── Edit Profile Modal ────────────────────────────────────── */
function EditProfileModal({ user, onClose }) {
  const { addToast } = useApp();
  const [form, setForm] = useState({
    name:     user.name     || "",
    email:    user.email    || "",
    phone:    user.phone    || "",
    location: user.location || "",
  });
  return (
    <Modal isOpen onClose={onClose} title="EDIT PROFILE" subtitle="Update your account information">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FormField label="Full Name">
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </FormField>
        <FormField label="Email">
          <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </FormField>
        <FormField label="Phone">
          <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </FormField>
        <FormField label="Location">
          <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
        </FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
          <Button variant="secondary" onClick={onClose}>CANCEL</Button>
          <Button variant="primary" onClick={() => { addToast("Profile updated successfully."); onClose(); }}>
            SAVE CHANGES
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Change Password Modal ─────────────────────────────────── */
function ChangePasswordModal({ onClose }) {
  const { addToast } = useApp();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [err, setErr] = useState("");

  const handleSave = () => {
    if (!form.current)              { setErr("Enter your current password."); return; }
    if (form.next.length < 6)       { setErr("New password must be at least 6 characters."); return; }
    if (form.next !== form.confirm)  { setErr("Passwords do not match."); return; }
    addToast("Password changed successfully.");
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title="CHANGE PASSWORD" subtitle="Update your secure access credential">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {err && (
          <div style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: "var(--radius)", padding: "10px 14px", color: "var(--red)", fontSize: 12 }}>
            {err}
          </div>
        )}
        <FormField label="Current Password">
          <Input type="password" value={form.current} onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))} placeholder="••••••••" />
        </FormField>
        <FormField label="New Password">
          <Input type="password" value={form.next} onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))} placeholder="••••••••" />
        </FormField>
        <FormField label="Confirm Password">
          <Input type="password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} placeholder="••••••••" />
        </FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
          <Button variant="secondary" onClick={onClose}>CANCEL</Button>
          <Button variant="primary" onClick={handleSave}>UPDATE PASSWORD</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function ProfilePage() {
  const { currentUser } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen,  setPwdOpen]  = useState(false);

  const sessions = getAttendanceSessions()

  // Sort descending, take 5 most recent for the weekly view
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  // Compute real stats from all sessions
  const totalSessions  = sessions.length
  const lateSessions   = sessions.filter(s => s.late_duration && s.late_duration !== '00:00').length
  const onTimeSessions = totalSessions - lateSessions
  const efficiency     = totalSessions > 0 ? Math.round((onTimeSessions / totalSessions) * 100) : 0

  // Date range label from sessions
  const sortedDates   = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date))
  const firstDate     = sortedDates[0]?.date
  const lastDate      = sortedDates[sortedDates.length - 1]?.date
  const dateRangeLabel = firstDate && lastDate
    ? `${new Date(firstDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short' })} – ${new Date(lastDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}`
    : 'N/A'

  const storedUser   = getStoredUser();
  const firstName    = storedUser?.firstname  || storedUser?.first_name  || "";
  const lastName     = storedUser?.lastname   || storedUser?.last_name   || "";
  const fullName     = firstName && lastName ? `${firstName} ${lastName}` : storedUser?.name || currentUser?.name || "Unknown";
  const userEmail    = storedUser?.email      || currentUser?.email    || "—";
  const userPhone    = storedUser?.phone      || storedUser?.phone_number || currentUser?.phone || "—";
  const userLocation = storedUser?.location   || currentUser?.location || "—";
  const userPosition = storedUser?.unit_name  || storedUser?.position  || storedUser?.department || "—";
  const userId       = storedUser?.id         || currentUser?.id       || "—";
  const numericId    = Number(storedUser?.id);
  const isAdmin      = ADMIN_IDS.includes(numericId) || currentUser?.type === "admin";

  const session = {
    lastLogin: lastDate
      ? new Date(lastDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }).toUpperCase()
      : "—",
    ip:        currentUser?.ip        || "—",
    sessionId: currentUser?.sessionId || "—",
  };

  const metaRows = [
    { key: "id",       icon: <IDIcon />,       val: userId       },
    { key: "email",    icon: <EmailIcon />,    val: userEmail    },
    { key: "phone",    icon: <PhoneIcon />,    val: userPhone    },
    { key: "location", icon: <LocationIcon />, val: userLocation },
    { key: "position", icon: <PositionIcon />, val: userPosition },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            {isAdmin ? "ADMINISTRATOR PROFILE" : "MY PROFILE"}
          </h1>
          <p className={styles.pageSub}>
            SYSTEM ACCESS LEVEL:{" "}
            {isAdmin ? "TIER 1 OPERATIONAL CONTROL" : "TIER 2 SHIFT MANAGEMENT"}
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* ── Left column ──────────────────────────── */}
        <div className={styles.leftCol}>
          <div className={styles.identityCard}>
            <div className={styles.avatarWrap}>
              <Avatar name={fullName} size={88} />
              <div className={styles.avatarBadge}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9l-3 1.5.5-3.5L2 4.5 5.5 4z" fill="currentColor" />
                </svg>
              </div>
            </div>
            <div className={styles.idName}>{fullName.toUpperCase()}</div>
            <div className={styles.idRole}>{currentUser?.role || storedUser?.role || ""}</div>
            <div className={styles.idMeta}>
              {metaRows.map(({ key, icon, val }) => (
                <div key={key} className={styles.idMetaRow}>
                  <span className={styles.idMetaIcon}>{icon}</span>
                  <span className={styles.idMetaVal}>{val || "—"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Attendance card — now fully dynamic ── */}
          <div className={styles.attCard}>
            <div className={styles.attHeader}>
              <span className={styles.attTitle}>PERSONAL ATTENDANCE</span>
              <span className={styles.attBadge}>{totalSessions} SESSIONS</span>
            </div>
            <div className={styles.attStats}>
              <div className={styles.attStat}>
                <span className={styles.attStatLabel}>ON TIME</span>
                <span className={styles.attStatVal}>{onTimeSessions}/{totalSessions}</span>
              </div>
              <div className={styles.attStat}>
                <span className={styles.attStatLabel}>LATE</span>
                <span className={styles.attStatVal} style={{ color: 'var(--red)' }}>
                  {lateSessions}x
                </span>
              </div>
            </div>
            <div className={styles.effRow}>
              <span className={styles.attStatLabel}>PUNCTUALITY INDEX</span>
              <span className={styles.effVal}>{efficiency}%</span>
            </div>
            <div className={styles.effTrack}>
              <div
                className={styles.effFill}
                style={{
                  width: `${efficiency}%`,
                  background: efficiency >= 90 ? 'var(--green)' : efficiency >= 75 ? 'var(--amber)' : 'var(--red)',
                }}
              />
            </div>
          </div>

          {/* Session card */}
          <div className={styles.sessionCard}>
            <div className={styles.sessionHeader}>
              <span className={styles.sessionTitle}>SESSION SECURITY</span>
              <div className={styles.sessionStatus}>
                <span className={styles.sessionDot} />
                <span className={styles.sessionStatusText}>SECURED</span>
              </div>
            </div>
            <div className={styles.sessionGrid}>
              <div className={styles.sessionItem}>
                <span className={styles.sessionLabel}>LAST ATTENDANCE</span>
                <span className={styles.sessionVal}>{session.lastLogin}</span>
              </div>
              <div className={styles.sessionItem}>
                <span className={styles.sessionLabel}>IP ADDRESS</span>
                <span className={styles.sessionVal}>{session.ip}</span>
              </div>
              <div className={styles.sessionItem} style={{ gridColumn: "1 / -1" }}>
                <span className={styles.sessionLabel}>SESSION ID</span>
                <span className={styles.sessionVal} style={{ color: "var(--orange)", fontFamily: "var(--font-display)", fontWeight: 700 }}>
                  {session.sessionId}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column ─────────────────────────── */}
        <div className={styles.rightCol}>

          {/* ── Weekly attendance — now from real data ── */}
          <div className={styles.weekCard}>
            <div className={styles.weekHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CalIcon />
                <span className={styles.weekTitle}>RECENT ATTENDANCE SESSIONS</span>
              </div>
              <span className={styles.weekRange}>{dateRangeLabel}</span>
            </div>

            {recentSessions.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No attendance data available.
              </div>
            ) : (
              recentSessions.map((s, i) => {
                const isLate   = s.late_duration && s.late_duration !== '00:00'
                const status   = isLate ? 'LATE' : 'ON TIME'
                const dayLabel = new Date(s.date).toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
                const dateLbl  = new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

                return (
                  <div key={i} className={styles.weekRow}>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 52 }}>
                      <span className={styles.weekDay}>{dayLabel}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{dateLbl}</span>
                    </div>
                    <div className={styles.weekTimes}>
                      {isLate ? (
                        <>
                          <div className={styles.weekTime}>
                            <span className={styles.weekTimeLabel}>LATE BY</span>
                            <span className={styles.weekTimeVal} style={{ color: 'var(--red)' }}>
                              {s.late_duration}
                            </span>
                          </div>
                          {s.late_remark && (
                            <div className={styles.weekTime} style={{ maxWidth: 200 }}>
                              <span className={styles.weekTimeLabel}>REMARK</span>
                              <span className={styles.weekTimeVal} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {s.late_remark}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className={styles.weekTime}>
                          <span className={styles.weekTimeLabel}>PUNCTUALITY</span>
                          <span className={styles.weekTimeVal} style={{ color: 'var(--green)' }}>ON TIME</span>
                        </div>
                      )}
                    </div>
                    <StatusBadge status={status} />
                  </div>
                )
              })
            )}
          </div>

          {/* ── Activity log — still static for now ── */}
          <div className={styles.logCard}>
            <div className={styles.logHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ClockIcon />
                <span className={styles.logTitle}>ALL LATE SESSIONS</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {lateSessions} total
              </span>
            </div>
            {sessions
              .filter(s => s.late_duration && s.late_duration !== '00:00')
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((s, i) => (
                <div key={i} className={styles.logItem}>
                  <div className={styles.logIconWrap} style={{ background: 'var(--red)18', color: 'var(--red)' }}>
                    L
                  </div>
                  <div className={styles.logContent}>
                    <span className={styles.logText}>
                      LATE BY {s.late_duration}
                    </span>
                    <span className={styles.logMeta}>
                      {new Date(s.date).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
                      {s.late_remark ? ` · ${s.late_remark}` : ''}
                    </span>
                  </div>
                  <span className={styles.logTag} style={{ color: 'var(--red)' }}>LATE</span>
                </div>
              ))
            }
            {lateSessions === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--green)', fontSize: '12px' }}>
                ✓ No late sessions recorded
              </div>
            )}
          </div>

        </div>
      </div>

      {editOpen && <EditProfileModal user={{ name: fullName, email: userEmail, phone: userPhone, location: userLocation }} onClose={() => setEditOpen(false)} />}
      {pwdOpen  && <ChangePasswordModal onClose={() => setPwdOpen(false)} />}
    </div>
  );
}