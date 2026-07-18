export type RagStatus = "done" | "progress" | "notstarted";

export type Priority = 1 | 2 | 3 | 4 | 5;

export type DateTagState = "ontrack" | "risk" | "late" | "complete";

export interface Workstream {
  id: string;
  name: string;
  descriptor: string;
  status: RagStatus;
  priority: Priority;
  blocker: string | null;
  details: string;
  nextSteps: string;
  targetDate: string;
  dateTag: DateTagState;
  /** 1-5 stars: how difficult / demanding this was */
  difficulty: number;
  /** 1-5 stars: how much this was enjoyed */
  enjoyment: number;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  descriptor: string;
  owner: string;
  /** e.g. "28 Jul" */
  nextMilestoneDate: string;
  nextMilestoneLabel: string;
  /** the decision or input needed, and from whom/by when */
  needToKnow: string;
  createdAt: string;
  workstreams: Workstream[];
}

export interface Area {
  id: string;
  name: string;
  descriptor: string;
  /** hex accent used for the area's orb / accent line / icon */
  color: string;
  archived: boolean;
  createdAt: string;
  owner: string;
  projects: Project[];
}

export const RAG_LABEL: Record<RagStatus, string> = {
  done: "Done",
  progress: "In progress",
  notstarted: "Not started",
};

export const DATE_TAG_LABEL: Record<DateTagState, string> = {
  ontrack: "On track",
  risk: "At risk",
  late: "Blocked",
  complete: "Complete",
};

export const AREA_ACCENTS = [
  "#7c6cf0", // electric
  "#00d4a0", // mint
  "#4da6ff", // sky
  "#f5a623", // amber
  "#e84393", // pink
  "#ff6b6b", // coral
];
