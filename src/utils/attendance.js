/**
 * Attendance helpers — sessions from API: { date, person_id, late_duration?, ... }
 */

export function parseSessionDate(session) {
  if (!session?.date) return null;
  const d = new Date(session.date);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Weekdays (Mon–Fri) from day 1 through today (or month end if past month). */
export function countWeekdaysInMonth(year, month, referenceDate = new Date()) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let lastDay = daysInMonth;

  if (year === referenceDate.getFullYear() && month === referenceDate.getMonth()) {
    lastDay = Math.min(daysInMonth, referenceDate.getDate());
  } else if (
    year > referenceDate.getFullYear() ||
    (year === referenceDate.getFullYear() && month > referenceDate.getMonth())
  ) {
    return 0;
  }

  let count = 0;
  for (let day = 1; day <= lastDay; day++) {
    const dow = new Date(year, month, day).getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

export function sessionsInMonth(sessions, year, month) {
  if (!Array.isArray(sessions)) return [];
  return sessions.filter((s) => {
    const d = parseSessionDate(s);
    return d && d.getFullYear() === year && d.getMonth() === month;
  });
}

/**
 * Monthly stats for UI counters (present / total / efficiency %).
 */
export function computeMonthlyAttendance(sessions, referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const present = sessionsInMonth(sessions, year, month).length;
  const total = countWeekdaysInMonth(year, month, referenceDate);
  const efficiency =
    total > 0 ? Math.round((present / total) * 100) : present > 0 ? 100 : 0;

  return { present, total, efficiency };
}

export function getAttendanceRatePercent(present, total) {
  if (!total || total <= 0) return 0;
  return Math.round((present / total) * 100);
}

/** Team-wide attendance rate (weighted by working days). */
export function computeTeamAttendanceRate(employees) {
  if (!employees?.length) return 0;
  let presentSum = 0;
  let totalSum = 0;
  for (const emp of employees) {
    presentSum += emp.present ?? 0;
    totalSum += emp.total ?? 0;
  }
  return totalSum > 0 ? Math.round((presentSum / totalSum) * 1000) / 10 : 0;
}

export function computePunctuality(sessions) {
  const list = Array.isArray(sessions) ? sessions : [];
  const totalSessions = list.length;
  const lateSessions = list.filter(
    (s) => s.late_duration && s.late_duration !== "00:00",
  ).length;
  const onTimeSessions = totalSessions - lateSessions;
  const efficiency =
    totalSessions > 0
      ? Math.round((onTimeSessions / totalSessions) * 100)
      : 0;
  return { totalSessions, lateSessions, onTimeSessions, efficiency };
}
