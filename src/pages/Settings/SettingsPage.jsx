import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import styles from "./SettingsPage.module.css";

function generateTimeOptions(startHour, endHour) {
  const options = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += 5) {
      if (h === endHour && m > 0) break;
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      options.push(`${hh}:${mm}`);
    }
  }
  return options;
}

const MORNING_OPTIONS = generateTimeOptions(8, 12);
const ENDWORK_OPTIONS = generateTimeOptions(14, 18);

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem("org_settings") || "{}");
  } catch {
    return {};
  }
}

export default function SettingsPage() {
  const { addToast } = useApp();
  const saved = loadSettings();

  const [lateThreshold, setLateThreshold] = useState(
    saved.lateThreshold || "08:30",
  );
  const [endWorkTime, setEndWorkTime] = useState(saved.endWorkTime || "16:30");
  const [saving, setSaving] = useState(false);

  // ── Holidays state ─────────────────────────────────────────
  const [holidays, setHolidays] = useState(() => saved.holidays || []);
  const [pickedDate, setPickedDate] = useState("");
  const [holidayLabel, setHolidayLabel] = useState("");

  const addHoliday = () => {
    if (!pickedDate) {
      addToast("Please pick a date.", "error");
      return;
    }
    if (holidays.find((h) => h.date === pickedDate)) {
      addToast("This date is already marked as a holiday.", "error");
      return;
    }
    const updated = [
      ...holidays,
      { date: pickedDate, label: holidayLabel.trim() || "Holiday" },
    ].sort((a, b) => a.date.localeCompare(b.date));
    setHolidays(updated);
    setPickedDate("");
    setHolidayLabel("");
  };

  const removeHoliday = (date) => {
    setHolidays((prev) => prev.filter((h) => h.date !== date));
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // ── Save all settings together ────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    const settings = { lateThreshold, endWorkTime, holidays };

    // Save locally first
    localStorage.setItem("org_settings", JSON.stringify(settings));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          late_threshold: lateThreshold,
          end_work_time: endWorkTime,
          holidays: holidays,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Server error");
      }

      addToast("Settings saved successfully.");
    } catch (err) {
      addToast(`Saved locally. Sync failed: ${err.message}`, "warning");
    }

    setSaving(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.settings) {
          if (data.settings.late_threshold)
            setLateThreshold(data.settings.late_threshold);
          if (data.settings.end_work_time)
            setEndWorkTime(data.settings.end_work_time);
          if (data.settings.holidays) setHolidays(data.settings.holidays);
          // Also update localStorage
          localStorage.setItem(
            "org_settings",
            JSON.stringify({
              lateThreshold: data.settings.late_threshold,
              endWorkTime: data.settings.end_work_time,
              holidays: data.settings.holidays,
            }),
          );
        }
      } catch (err) {
        console.warn("Could not load settings from server:", err);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>SETTINGS</h1>
          <p className={styles.pageSub}>
            Configure operational parameters for your unit.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* ── Attendance Rules card ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle
                cx="8"
                cy="8"
                r="7"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M8 4v4l3 2"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <span className={styles.cardTitle}>ATTENDANCE RULES</span>
          </div>
          <p className={styles.cardDesc}>
            Define the thresholds used to determine late arrivals and end of
            workday for employees in your unit.
          </p>

          <div className={styles.fieldGroup}>
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
                  onChange={(e) => setLateThreshold(e.target.value)}
                >
                  {MORNING_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <span className={styles.timeBadge}>
                  Arrivals after {lateThreshold} → LATE
                </span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>END OF WORK TIME</label>
              <p className={styles.fieldHint}>
                The official end of the workday for attendance tracking.
              </p>
              <div className={styles.timeSelector}>
                <select
                  className={styles.timeSelect}
                  value={endWorkTime}
                  onChange={(e) => setEndWorkTime(e.target.value)}
                >
                  {ENDWORK_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <span className={styles.timeBadge}>
                  Workday ends at {endWorkTime}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.preview}>
            <div className={styles.previewTitle}>CURRENT CONFIGURATION</div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>
                Late if arriving after
              </span>
              <span
                className={styles.previewVal}
                style={{ color: "var(--red)" }}
              >
                {lateThreshold}
              </span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Workday ends at</span>
              <span
                className={styles.previewVal}
                style={{ color: "var(--green)" }}
              >
                {endWorkTime}
              </span>
            </div>
          </div>
        </div>

        {/* ── Holiday Management card ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect
                x="1"
                y="3"
                width="14"
                height="12"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M1 7h14M5 1v4M11 1v4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <span className={styles.cardTitle}>HOLIDAY MANAGEMENT</span>
          </div>
          <p className={styles.cardDesc}>
            Mark specific dates as official holidays. These days will be
            excluded from attendance and late calculations.
          </p>

          {/* ── Add holiday row ── */}
          <div className={styles.addHolidayRow}>
            <input
              type="date"
              className={styles.dateInput}
              value={pickedDate}
              onChange={(e) => setPickedDate(e.target.value)}
            />
            <input
              type="text"
              className={styles.labelInput}
              placeholder="Label (e.g. Eid Al-Fitr)"
              value={holidayLabel}
              onChange={(e) => setHolidayLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHoliday()}
            />
            <button className={styles.addBtn} onClick={addHoliday}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M6.5 1v11M1 6.5h11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              ADD
            </button>
          </div>

          {/* ── Holiday list ── */}
          {holidays.length === 0 ? (
            <div className={styles.emptyHolidays}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                opacity="0.3"
              >
                <rect
                  x="1"
                  y="5"
                  width="26"
                  height="22"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M1 11h26M9 1v6M19 1v6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>No holidays added yet.</span>
            </div>
          ) : (
            <div className={styles.holidayList}>
              <div className={styles.holidayListHeader}>
                <span>
                  {holidays.length} holiday{holidays.length !== 1 ? "s" : ""}{" "}
                  configured
                </span>
              </div>
              {holidays.map((h) => (
                <div key={h.date} className={styles.holidayItem}>
                  <div className={styles.holidayItemLeft}>
                    <span className={styles.holidayDate}>
                      {formatDate(h.date)}
                    </span>
                    <span className={styles.holidayLabel}>{h.label}</span>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeHoliday(h.date)}
                    title="Remove holiday"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path
                        d="M2 2l9 9M11 2l-9 9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Single save button for everything ── */}
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "SAVING…" : "SAVE ALL SETTINGS"}
          {!saving && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7h10M8 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
