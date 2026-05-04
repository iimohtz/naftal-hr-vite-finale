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
    const raw = localStorage.getItem("org_settings");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    
    if (parsed.holidays && typeof parsed.holidays === "string") {
      try { 
        parsed.holidays = JSON.parse(parsed.holidays); 
      } catch { 
        parsed.holidays = []; 
      }
    }
    return parsed;
  } catch {
    return {};
  }
}

export default function SettingsPage() {
  const { addToast } = useApp();
  const saved = loadSettings();

  const [lateThreshold, setLateThreshold] = useState(saved.lateThreshold || "08:30");
  const [endWorkTime, setEndWorkTime] = useState(saved.endWorkTime || "16:30");
  const [saving, setSaving] = useState(false);

  // ── Holidays state (Strictly enforced as an array) ────────────────
  const [holidays, setHolidays] = useState(() => {
    return Array.isArray(saved.holidays) ? saved.holidays : [];
  });
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

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    const settings = { lateThreshold, endWorkTime, holidays };

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
          const dbLateThreshold = typeof data.settings.late_threshold === 'string' 
            ? data.settings.late_threshold.substring(0, 5) 
            : "08:30";
            
          const dbEndWorkTime = typeof data.settings.end_work_time === 'string' 
            ? data.settings.end_work_time.substring(0, 5) 
            : "16:30";

          setLateThreshold(dbLateThreshold);
          setEndWorkTime(dbEndWorkTime);
          
          let safeHolidays = [];
          if (Array.isArray(data.settings.holidays)) {
            safeHolidays = data.settings.holidays;
          } else if (typeof data.settings.holidays === "string") {
            try { 
              safeHolidays = JSON.parse(data.settings.holidays); 
            } catch { 
              safeHolidays = []; 
            }
          }
          
          setHolidays(safeHolidays);
          
          localStorage.setItem(
            "org_settings",
            JSON.stringify({
              lateThreshold: dbLateThreshold,
              endWorkTime: dbEndWorkTime,
              holidays: safeHolidays,
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
          <p className={styles.pageSub}>Configure operational parameters for your unit.</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>ATTENDANCE RULES</span>
          </div>
          <p className={styles.cardDesc}>Define late arrival and workday thresholds.</p>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>LATE ARRIVAL THRESHOLD</label>
              <div className={styles.timeSelector}>
                <select
                  className={styles.timeSelect}
                  value={lateThreshold}
                  onChange={(e) => setLateThreshold(e.target.value)}
                >
                  {MORNING_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>END OF WORK TIME</label>
              <div className={styles.timeSelector}>
                <select
                  className={styles.timeSelect}
                  value={endWorkTime}
                  onChange={(e) => setEndWorkTime(e.target.value)}
                >
                  {ENDWORK_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>HOLIDAY MANAGEMENT</span>
          </div>
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
              placeholder="Label"
              value={holidayLabel}
              onChange={(e) => setHolidayLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHoliday()}
            />
            <button className={styles.addBtn} onClick={addHoliday}>ADD</button>
          </div>

          <div className={styles.holidayList}>
            {Array.isArray(holidays) && holidays.length > 0 ? (
              holidays.map((h) => (
                <div key={h.date} className={styles.holidayItem}>
                  <div className={styles.holidayItemLeft}>
                    <span className={styles.holidayDate}>{formatDate(h.date)}</span>
                    <span className={styles.holidayLabel}>{h.label}</span>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeHoliday(h.date)}>
                    REMOVE
                  </button>
                </div>
              ))
            ) : (
              <div className={styles.emptyHolidays}>No holidays added yet.</div>
            )}
          </div>
        </div>

        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? "SAVING…" : "SAVE ALL SETTINGS"}
        </button>
      </div>
    </div>
  );
}
