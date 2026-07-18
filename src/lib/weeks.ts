const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const WEEKDAY_OPTIONS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

/** The start (local midnight) of the week containing `date`, per a 0(Sun)-6(Sat) week-start day. */
export function startOfWeekFor(date: Date, weekStartsOn: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function fmtDay(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** Formats a week-start ISO date as e.g. "14 – 20 Jul 2026". */
export function formatWeekLabel(weekStartISO: string): string {
  const start = new Date(weekStartISO + "T00:00:00");
  const end = addDays(start, 6);
  const startStr = start.getMonth() === end.getMonth() ? String(start.getDate()).padStart(2, "0") : fmtDay(start);
  return `${startStr} – ${fmtDay(end)} ${end.getFullYear()}`;
}
