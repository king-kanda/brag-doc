import { Area, Project, RagStatus, Workstream } from "./types";

export interface WorkstreamSummary {
  done: number;
  progress: number;
  notstarted: number;
  total: number;
  blockers: number;
  laneStatus: RagStatus;
  avgDifficulty: number;
  avgEnjoyment: number;
}

function summarizeWorkstreams(workstreams: Workstream[]): WorkstreamSummary {
  const done = workstreams.filter((w) => w.status === "done").length;
  const progress = workstreams.filter((w) => w.status === "progress").length;
  const notstarted = workstreams.filter((w) => w.status === "notstarted").length;
  const blockers = workstreams.filter((w) => !!w.blocker).length;
  const total = workstreams.length;

  let laneStatus: RagStatus = "done";
  if (blockers > 0 || notstarted > 0) laneStatus = "notstarted";
  else if (progress > 0) laneStatus = "progress";

  const avg = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);
  const avgDifficulty = avg(workstreams.map((w) => w.difficulty));
  const avgEnjoyment = avg(workstreams.map((w) => w.enjoyment));

  return { done, progress, notstarted, total, blockers, laneStatus, avgDifficulty, avgEnjoyment };
}

export function summarizeProject(project: Project): WorkstreamSummary {
  return summarizeWorkstreams(project.workstreams);
}

export function summarizeArea(area: Area): WorkstreamSummary {
  const allWorkstreams = area.projects.flatMap((p) => p.workstreams);
  return summarizeWorkstreams(allWorkstreams);
}
