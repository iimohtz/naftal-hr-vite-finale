import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { useApp } from "../../context/AppContext";
import { StatusBadge, Avatar, Button, Modal } from "../../components/UI/UI";
import EmployeeProfileDrawer from "../../components/EmployeeProfileDrawer/EmployeeProfileDrawer";
import styles from "./DashboardPage.module.css";

/* ── Icons ─────────────────────────────────────────────────── */
const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 3v10M6 9l4 4 4-4M3 16h14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const PrintIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect
      x="4"
      y="7"
      width="12"
      height="9"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M7 7V4h6v3M7 13h6M7 16h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const LogIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M6 4h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M7 9h6M7 12h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const ExportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M7 10l3-3 3 3M10 7v8M4 16h12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ── KPI Strip ─────────────────────────────────────────────── */
function KpiStrip() {
  const { employees, requests, gatePasses } = useApp();
  const total = employees.length;
  const active = employees.filter((e) => e.status === "ACTIVE").length;
  const attRate = Math.round((active / total) * 1000) / 10;
  const pendGP = gatePasses.filter((g) => g.status === "PENDING").length;
  const pendReq = requests.filter((r) => r.status === "PENDING").length;
  return (
    <div className={styles.kpiStrip}>
      {[
        {
          label: "ACTIVE SHIFTS",
          value: total.toLocaleString(),
          accent: "var(--orange)",
          border: "var(--orange)",
        },
        {
          label: "ATTENDANCE RATE",
          value: `${attRate}%`,
          accent: "var(--green)",
          border: "var(--green)",
        },
        {
          label: "PENDING PASSES",
          value: pendGP,
          accent: "var(--text)",
          border: "#64748B",
        },
        {
          label: "LEAVE REQUESTS",
          value: pendReq < 10 ? `0${pendReq}` : pendReq,
          accent: "var(--red)",
          border: "var(--red)",
        },
      ].map((k, i) => (
        <div
          key={i}
          className={styles.kpiCard}
          style={{ borderTopColor: k.border }}
        >
          <span className={styles.kpiLabel}>{k.label}</span>
          <span className={styles.kpiValue} style={{ color: k.accent }}>
            {k.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── My Employees ──────────────────────────────────────────── */
function MyEmployees({ onViewEmployee }) {
  const { employees } = useApp();
  const navigate = useNavigate();
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>MY EMPLOYEES</span>
        <button
          className={styles.linkBtn}
          onClick={() => navigate("/employees")}
        >
          DETAIL <span>›</span>
        </button>
      </div>
      {employees.slice(0, 5).map((emp) => (
        <div key={emp.id} className={styles.empRow}>
          {/* Clicking the avatar or name opens the profile drawer */}
          <button
            className={styles.empClickable}
            onClick={() => onViewEmployee(emp)}
            title="View profile"
          >
            <Avatar name={emp.name} size={36} />
          </button>
          <div className={styles.empInfo}>
            <button
              className={styles.empNameBtn}
              onClick={() => onViewEmployee(emp)}
            >
              {emp.name}
            </button>
            <span className={styles.empId}>ID: {emp.id}</span>
          </div>
          <StatusBadge status={emp.status} />
          <button
            className={styles.viewBtn}
            onClick={() => onViewEmployee(emp)}
            title="View employee profile"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <ellipse
                cx="8"
                cy="8"
                rx="7"
                ry="4.5"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <circle
                cx="8"
                cy="8"
                r="2"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── Document Hub Quick ────────────────────────────────────── */
function DocHubQuick() {
  const navigate = useNavigate();
  const docs = [
    { icon: <DownloadIcon />, label: "PAYROLL", tab: "payroll" },
    { icon: <PrintIcon />, label: "PASSES", tab: "passes" },
    { icon: <LogIcon />, label: "LOGS", tab: "logs" },
    { icon: <ExportIcon />, label: "EXPORT", tab: "export" },
  ];
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>DOCUMENT HUB</span>
      </div>
      <div className={styles.docGrid}>
        {docs.map((d) => (
          <button
            key={d.tab}
            className={styles.docItem}
            onClick={() => navigate(`/documents?tab=${d.tab}`)}
          >
            <span className={styles.docIcon}>{d.icon}</span>
            <span className={styles.docLabel}>{d.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Gate Passes Panel ─────────────────────────────────────── */
function GatePassesPanel() {
  const { gatePasses } = useApp();
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>ACTIVE GATE PASSES</span>
        <button className={styles.linkBtn}>
          FULL LIST <span>›</span>
        </button>
      </div>
      <table className={styles.miniTable}>
        <thead>
          <tr>
            {["REFERENCE", "EMPLOYEE", "DESTINATION", "WINDOW", "STATUS"].map(
              (h) => (
                <th key={h} className={styles.th}>
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {gatePasses.slice(0, 4).map((gp) => (
            <tr key={gp.id} className={styles.tr}>
              <td className={`${styles.td} ${styles.tdMono}`}>{gp.id}</td>
              <td className={`${styles.td} ${styles.tdBold}`}>{gp.employee}</td>
              <td className={styles.td}>{gp.destination}</td>
              <td className={`${styles.td} ${styles.tdOrange}`}>{gp.window}</td>
              <td className={styles.td}>
                <StatusBadge status={gp.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Demands Chart ─────────────────────────────────────────── */
function DemandsChart({ onSliceClick }) {
  const { requests } = useApp();
  // Aggregate data by type
  const dataMap = requests.reduce((acc, req) => {
    acc[req.type] = (acc[req.type] || 0) + 1;
    return acc;
  }, {});

  const data = Object.keys(dataMap).map((key) => ({
    name: key,
    value: dataMap[key],
  }));
  const COLORS = [
    "var(--brand-blue)",
    "var(--brand-yellow)",
    "var(--brand-green)",
    "#ff8042",
    "#a4de6c",
  ];

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>DEMANDS BY TYPE</span>
      </div>
      <div style={{ width: "100%", height: 220, padding: "10px 0" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              onClick={(entry) => onSliceClick(entry.name)}
              style={{ cursor: "pointer" }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend verticalAlign="bottom" height={24} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Requests Panel ────────────────────────────────────────── */
function RequestsPanel({ selectedType, onClearFilter }) {
  const { requests, updateRequestStatus, employees } = useApp();
  const [showHistory, setShowHistory] = useState(false);

  const getAttendanceRate = (empName) => {
    const emp = employees.find((e) => e.name === empName);
    if (!emp) return "—";
    return `${Math.round((emp.present / emp.total) * 100)}%`;
  };

  let pendingList = requests.filter((r) => r.status === "PENDING");
  let historyList = requests.filter((r) => r.status !== "PENDING");

  if (selectedType) {
    pendingList = pendingList.filter((r) => r.type === selectedType);
    historyList = historyList.filter((r) => r.type === selectedType);
  }

  const renderTable = (list, isHistory) => (
    <div
      style={{
        overflowX: "auto",
        borderTop: isHistory ? "1px solid var(--border)" : "none",
      }}
    >
      {isHistory && (
        <div
          style={{
            padding: "12px 20px",
            background: "var(--bg-subtle)",
            borderBottom: "1px solid var(--border)",
            fontSize: "11px",
            fontWeight: "bold",
            color: "var(--text-muted)",
          }}
        >
          HISTORY LOG (EVALUATED REQUESTS)
        </div>
      )}
      <table className={styles.miniTable}>
        <thead>
          <tr>
            {["ID", "EMPLOYEE", "ATT. %", "TYPE", "DAYS", "ACTIONS"].map(
              (h) => (
                <th key={h} className={styles.th}>
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles.emptyRow}>
                No {isHistory ? "past" : "pending"} requests found
              </td>
            </tr>
          ) : (
            list.map((req) => (
              <tr key={req.id} className={styles.tr}>
                <td className={`${styles.td} ${styles.tdMono}`}>{req.id}</td>
                <td className={`${styles.td} ${styles.tdBold}`}>
                  {req.employee}
                </td>
                <td
                  className={`${styles.td} ${styles.tdBold}`}
                  style={{ color: "var(--brand-blue)" }}
                >
                  {getAttendanceRate(req.employee)}
                </td>
                <td className={styles.td}>{req.type}</td>
                <td className={`${styles.td} ${styles.tdBold}`}>{req.days}</td>
                <td className={styles.td}>
                  {req.status === "PENDING" ? (
                    <div className={styles.actionBtns}>
                      <button
                        className={styles.approveBtn}
                        onClick={() => updateRequestStatus(req.id, "APPROVED")}
                      >
                        APPROVE
                      </button>
                      <button
                        className={styles.reviewBtn}
                        onClick={() => updateRequestStatus(req.id, "REJECTED")}
                      >
                        REJECT
                      </button>
                    </div>
                  ) : (
                    <StatusBadge status={req.status} />
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>
          {selectedType
            ? `${selectedType.toUpperCase()} REQUESTS`
            : "PENDING REQUESTS"}
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          {selectedType && (
            <button className={styles.linkBtn} onClick={onClearFilter}>
              CLEAR FILTER
            </button>
          )}
          <button
            className={styles.linkBtn}
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "HIDE HISTORY" : "VIEW HISTORY"} <span>›</span>
          </button>
        </div>
      </div>

      {/* Pending Table */}
      {renderTable(selectedType ? pendingList : pendingList.slice(0, 3), false)}

      {/* History Table rendered conditionally underneath but natively independent */}
      {showHistory && renderTable(historyList, true)}
    </div>
  );
}
function RequestDetailModal({ request, onClose }) {
  const detail = request.detail || {};
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`REQUEST — #${request.id}`}
      subtitle={request.type}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              STATUS
            </div>
            <StatusBadge status={request.status.toUpperCase()} />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              TYPE
            </div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              {request.type || "—"}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              SUBMISSION DATE
            </div>
            <div style={{ fontSize: "0.85rem" }}>
              {request.submission_date || "—"}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              PASS TYPE
            </div>
            <div style={{ fontSize: "0.85rem" }}>{detail.pass_type || "—"}</div>
          </div>
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              DATE
            </div>
            <div style={{ fontSize: "0.85rem" }}>{detail.date || "—"}</div>
          </div>
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              EXIT TIME
            </div>
            <div style={{ fontSize: "0.85rem" }}>{detail.exit_time || "—"}</div>
          </div>
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              EXPECTED RETURN
            </div>
            <div style={{ fontSize: "0.85rem" }}>
              {detail.expected_return_time || "—"}
            </div>
          </div>
        </div>

        {detail.destination && (
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              DESTINATION
            </div>
            <div style={{ fontSize: "0.85rem", whiteSpace: "pre-line" }}>
              {detail.destination}
            </div>
          </div>
        )}

        {detail.reason && (
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              REASON
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                fontStyle: "italic",
              }}
            >
              {detail.reason}
            </div>
          </div>
        )}

        {request.justification && (
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              JUSTIFICATION
            </div>
            <div style={{ fontSize: "0.85rem" }}>{request.justification}</div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: 8,
            borderTop: "1px solid var(--border)",
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            CLOSE
          </Button>
        </div>
      </div>
    </Modal>
  );
}
/* ── Manager Gate Passes ───────────────────────────────────── */
function GatePassesManager({ requests = [] }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>MY REQUESTS</span>
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
          {requests.length} total
        </span>
      </div>

      {requests.length === 0 ? (
        <div className={styles.emptyRow}>No requests found.</div>
      ) : (
        <table className={styles.miniTable}>
          <thead>
            <tr>
              {["ID", "TYPE", "DATE", "STATUS", ""].map((h) => (
                <th key={h} className={styles.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className={styles.tr}>
                <td className={`${styles.td} ${styles.tdMono}`}>{req.id}</td>
                <td className={`${styles.td} ${styles.tdBold}`}>
                  {req.type || "—"}
                </td>
                <td className={styles.td}>{req.submission_date}</td>
                <td className={styles.td}>
                  <StatusBadge status={req.status.toUpperCase()} />
                </td>
                <td className={styles.td}>
                  <button
                    onClick={() => setSelected(req)}
                    title="View details"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <ellipse
                        cx="7.5"
                        cy="7.5"
                        rx="6.5"
                        ry="4"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                      <circle
                        cx="7.5"
                        cy="7.5"
                        r="2"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <RequestDetailModal
          request={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { currentUser, setRequests, setGatePasses, addToast } = useApp();
  const isAdmin = currentUser?.type === "admin";
  const [profileEmp, setProfileEmp] = useState(null);
  const [selectedDemandType, setSelectedDemandType] = useState(null);
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) return;
        const data = await res.json();
        if (data.Requests) setMyRequests(data.Requests);
        if (data.requests) setMyRequests(data.requests)
        console.log('Dashboard raw response:', data)
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        addToast("Could not sync with server. Showing local data.", "warning");
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className={styles.page}>
      <KpiStrip />
      <div className={styles.grid}>
        <div className={styles.col}>
          {isAdmin && <MyEmployees onViewEmployee={setProfileEmp} />}
          {isAdmin && <DemandsChart onSliceClick={setSelectedDemandType} />}
          <DocHubQuick />
        </div>
        <div className={styles.col}>
          {isAdmin && <GatePassesPanel />}
          {isAdmin && (
            <RequestsPanel
              selectedType={selectedDemandType}
              onClearFilter={() => setSelectedDemandType(null)}
            />
          )}
          {!["direction", "department"].includes(currentUser?.unit_type) && (
            <GatePassesManager requests={myRequests} />
          )}
        </div>
      </div>

      {/* Floating profile drawer */}
      {profileEmp && (
        <EmployeeProfileDrawer
          employee={profileEmp}
          onClose={() => setProfileEmp(null)}
          readOnly
        />
      )}
    </div>
  );
}
