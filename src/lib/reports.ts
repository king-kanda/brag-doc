import { RagStatus, WorkstreamEvent } from "./types";

export type PeriodPreset = "week" | "month" | "quarter" | "year" | "custom";

export interface ReportPeriod {
  from: Date;
  to: Date;
  label: string;
}

export type ReportScope =
  | { level: "area"; areaId: string }
  | { level: "project"; areaId: string; projectId: string };

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function fmtDay(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_SHORT[d.getMonth()]}`;
}

function fmtDayYear(d: Date): string {
  return `${fmtDay(d)} ${d.getFullYear()}`;
}

function startOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function endOfDay(d: Date): Date {
  const date = new Date(d);
  date.setHours(23, 59, 59, 999);
  return date;
}

/** Computes the from/to/label for the "current" instance of a preset, anchored at the given date. */
export function computePeriod(preset: PeriodPreset, anchor: Date): ReportPeriod {
  if (preset === "week") {
    const from = startOfWeek(anchor);
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    return { from, to: endOfDay(to), label: `${fmtDay(from)} – ${fmtDayYear(to)}` };
  }
  if (preset === "month") {
    const from = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const to = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    return { from, to: endOfDay(to), label: `${MONTHS_FULL[from.getMonth()]} ${from.getFullYear()}` };
  }
  if (preset === "quarter") {
    const q = Math.floor(anchor.getMonth() / 3);
    const from = new Date(anchor.getFullYear(), q * 3, 1);
    const to = new Date(anchor.getFullYear(), q * 3 + 3, 0);
    return { from, to: endOfDay(to), label: `Q${q + 1} ${from.getFullYear()}` };
  }
  // year
  const from = new Date(anchor.getFullYear(), 0, 1);
  const to = new Date(anchor.getFullYear(), 11, 31);
  return { from, to: endOfDay(to), label: `${from.getFullYear()}` };
}

/** Moves the anchor date backward/forward by one unit of the given preset (delta: -1 or +1). */
export function shiftAnchor(preset: PeriodPreset, anchor: Date, delta: number): Date {
  const d = new Date(anchor);
  if (preset === "week") d.setDate(d.getDate() + delta * 7);
  else if (preset === "month") d.setMonth(d.getMonth() + delta);
  else if (preset === "quarter") d.setMonth(d.getMonth() + delta * 3);
  else if (preset === "year") d.setFullYear(d.getFullYear() + delta);
  return d;
}

export function customPeriod(from: Date, to: Date): ReportPeriod {
  const sameYear = from.getFullYear() === to.getFullYear();
  const label = sameYear ? `${fmtDay(from)} – ${fmtDayYear(to)}` : `${fmtDayYear(from)} – ${fmtDayYear(to)}`;
  return { from, to: endOfDay(to), label };
}

export function filterEvents(events: WorkstreamEvent[], scope: ReportScope, period: ReportPeriod): WorkstreamEvent[] {
  return events
    .filter((e) => {
      const t = new Date(e.timestamp).getTime();
      if (t < period.from.getTime() || t > period.to.getTime()) return false;
      if (scope.level === "project") return e.areaId === scope.areaId && e.projectId === scope.projectId;
      return e.areaId === scope.areaId;
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

type TransitionKind = "created" | "started" | "completed" | "reopened" | "paused" | "updated";

function describeTransition(fromStatus: RagStatus | null, toStatus: RagStatus): { kind: TransitionKind; verb: string; emoji: string } {
  if (fromStatus === null) return { kind: "created", verb: "Started tracking", emoji: "\u{1F195}" };
  if (toStatus === "done") return { kind: "completed", verb: "Completed", emoji: "✅" };
  if (fromStatus === "done") return { kind: "reopened", verb: "Reopened", emoji: "↩️" };
  if (fromStatus === "notstarted" && toStatus === "progress") return { kind: "started", verb: "Started", emoji: "\u{1F680}" };
  if (toStatus === "notstarted") return { kind: "paused", verb: "Paused", emoji: "⏸️" };
  return { kind: "updated", verb: "Updated", emoji: "•" };
}

export interface ReportCounts {
  created: number;
  started: number;
  completed: number;
  reopened: number;
  paused: number;
}

export function summarizeCounts(events: WorkstreamEvent[]): ReportCounts {
  const counts: ReportCounts = { created: 0, started: 0, completed: 0, reopened: 0, paused: 0 };
  for (const e of events) {
    const { kind } = describeTransition(e.fromStatus, e.toStatus);
    if (kind === "updated") continue;
    counts[kind]++;
  }
  return counts;
}

export function buildMarkdownReport(opts: {
  scope: ReportScope;
  areaName: string;
  projectName?: string;
  period: ReportPeriod;
  events: WorkstreamEvent[];
}): string {
  const { scope, areaName, projectName, period, events } = opts;
  const title = scope.level === "project" ? projectName ?? "Project" : areaName;
  const lines: string[] = [];

  lines.push(`# ${title} — Report`);
  lines.push(`**${period.label}**`);
  lines.push("");

  if (events.length === 0) {
    lines.push("_No status changes recorded in this period._");
  } else if (scope.level === "project") {
    for (const e of events) {
      const { verb, emoji } = describeTransition(e.fromStatus, e.toStatus);
      lines.push(`- ${emoji} ${verb} **${e.workstreamName}** — ${fmtDay(new Date(e.timestamp))}`);
    }
  } else {
    const byProject = new Map<string, WorkstreamEvent[]>();
    for (const e of events) {
      if (!byProject.has(e.projectId)) byProject.set(e.projectId, []);
      byProject.get(e.projectId)!.push(e);
    }
    for (const projEvents of byProject.values()) {
      lines.push(`## ${projEvents[0].projectName}`);
      for (const e of projEvents) {
        const { verb, emoji } = describeTransition(e.fromStatus, e.toStatus);
        lines.push(`- ${emoji} ${verb} **${e.workstreamName}** — ${fmtDay(new Date(e.timestamp))}`);
      }
      lines.push("");
    }
  }

  const counts = summarizeCounts(events);
  lines.push("---");
  lines.push(
    `${counts.started} started · ${counts.completed} completed · ${counts.reopened} reopened · ${counts.paused} paused`
  );
  lines.push("");
  lines.push("_Generated by Brag Doc_");

  return lines.join("\n");
}
