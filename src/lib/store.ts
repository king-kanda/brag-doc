import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Area, Project, Workstream, WorkstreamEvent } from "./types";
import { formatWeekLabel } from "./weeks";
import {
  fetchAllData,
  createAreaAction,
  updateAreaAction,
  deleteAreaAction,
  ensureCurrentWeekProjectAction,
  updateProjectMetaAction,
  addWorkstreamAction,
  updateWorkstreamAction,
  deleteWorkstreamAction,
} from "./db/actions";
import { toast } from "sonner";

function id() {
  return crypto.randomUUID();
}

function mapProject(area: Area, projectId: string, fn: (p: Project) => Project): Area {
  return { ...area, projects: area.projects.map((p) => (p.id === projectId ? fn(p) : p)) };
}

function reportError(action: string, err: unknown) {
  console.error(`[store] ${action} failed`, err);
  toast.error(`Couldn't save — ${action} may not have persisted. Check your connection.`);
}

const ensuringWeeks = new Set<string>();

interface AreaState {
  areas: Area[];
  events: WorkstreamEvent[];
  loaded: boolean;
  activeAreaId: string | null;
  hydrate: () => Promise<void>;
  setActiveArea: (id: string) => void;
  addArea: (input: { name: string; descriptor: string; color: string; weekStartsOn: number }) => void;
  updateArea: (id: string, patch: Partial<Pick<Area, "name" | "descriptor" | "color" | "weekStartsOn">>) => void;
  archiveArea: (id: string) => void;
  restoreArea: (id: string) => void;
  deleteArea: (id: string) => void;
  ensureCurrentWeekProject: (areaId: string) => void;
  updateProjectMeta: (
    areaId: string,
    projectId: string,
    patch: Partial<Pick<Project, "descriptor" | "owner" | "nextMilestoneDate" | "nextMilestoneLabel" | "needToKnow">>
  ) => void;
  addWorkstream: (areaId: string, projectId: string, ws: Omit<Workstream, "id" | "updatedAt">) => void;
  updateWorkstream: (areaId: string, projectId: string, wsId: string, patch: Partial<Workstream>) => void;
  deleteWorkstream: (areaId: string, projectId: string, wsId: string) => void;
}

export const useAreaStore = create<AreaState>()((set, get) => ({
  areas: [],
  events: [],
  loaded: false,
  activeAreaId: null,

  hydrate: async () => {
    try {
      const { areas, events } = await fetchAllData();
      set({ areas, events, loaded: true });
    } catch (err) {
      console.error("[store] hydrate failed", err);
      toast.error("Couldn't load your data — check your connection and reload.");
      set({ loaded: true });
    }
  },

  setActiveArea: (areaId) => set({ activeAreaId: areaId }),

  addArea: ({ name, descriptor, color, weekStartsOn }) => {
    const newArea: Area = {
      id: id(),
      name,
      descriptor,
      color,
      archived: false,
      createdAt: new Date().toISOString(),
      owner: "You",
      weekStartsOn,
      projects: [],
    };
    set((s) => ({ areas: [...s.areas, newArea], activeAreaId: newArea.id }));
    createAreaAction(newArea).catch((err) => reportError("adding the area", err));
  },

  updateArea: (areaId, patch) => {
    set((s) => ({ areas: s.areas.map((a) => (a.id === areaId ? { ...a, ...patch } : a)) }));
    updateAreaAction(areaId, patch).catch((err) => reportError("updating the area", err));
  },

  archiveArea: (areaId) => {
    set((s) => ({ areas: s.areas.map((a) => (a.id === areaId ? { ...a, archived: true } : a)) }));
    const { areas, activeAreaId } = get();
    if (activeAreaId === areaId) {
      const nextActive = areas.find((a) => !a.archived && a.id !== areaId);
      set({ activeAreaId: nextActive ? nextActive.id : null });
    }
    updateAreaAction(areaId, { archived: true }).catch((err) => reportError("archiving the area", err));
  },

  restoreArea: (areaId) => {
    set((s) => ({ areas: s.areas.map((a) => (a.id === areaId ? { ...a, archived: false } : a)) }));
    updateAreaAction(areaId, { archived: false }).catch((err) => reportError("restoring the area", err));
  },

  deleteArea: (areaId) => {
    set((s) => ({ areas: s.areas.filter((a) => a.id !== areaId) }));
    const { activeAreaId, areas } = get();
    if (activeAreaId === areaId) {
      const nextActive = areas.find((a) => !a.archived);
      set({ activeAreaId: nextActive ? nextActive.id : null });
    }
    deleteAreaAction(areaId).catch((err) => reportError("deleting the area", err));
  },

  ensureCurrentWeekProject: (areaId) => {
    const area = get().areas.find((a) => a.id === areaId);
    if (!area || ensuringWeeks.has(areaId)) return;
    ensuringWeeks.add(areaId);
    ensureCurrentWeekProjectAction(areaId)
      .then((project) => {
        set((s) => ({
          areas: s.areas.map((a) =>
            a.id === areaId
              ? a.projects.some((p) => p.id === project.id)
                ? a
                : { ...a, projects: [...a.projects, project] }
              : a
          ),
        }));
      })
      .catch((err) => reportError("setting up this week", err))
      .finally(() => ensuringWeeks.delete(areaId));
  },

  updateProjectMeta: (areaId, projectId, patch) => {
    set((s) => ({
      areas: s.areas.map((a) => (a.id === areaId ? mapProject(a, projectId, (p) => ({ ...p, ...patch })) : a)),
    }));
    updateProjectMetaAction(projectId, patch).catch((err) => reportError("updating this week", err));
  },

  addWorkstream: (areaId, projectId, ws) => {
    const area = get().areas.find((a) => a.id === areaId);
    const project = area?.projects.find((p) => p.id === projectId);
    const timestamp = new Date().toISOString();
    const newWorkstream: Workstream = { ...ws, id: id(), updatedAt: timestamp };
    const event: WorkstreamEvent = {
      id: id(),
      areaId,
      areaName: area?.name ?? "",
      projectId,
      projectName: project ? formatWeekLabel(project.weekStart) : "",
      workstreamId: newWorkstream.id,
      workstreamName: newWorkstream.name,
      workstreamDescriptor: newWorkstream.descriptor,
      fromStatus: null,
      toStatus: newWorkstream.status,
      timestamp,
    };
    set((s) => ({
      areas: s.areas.map((a) =>
        a.id === areaId
          ? mapProject(a, projectId, (p) => ({ ...p, workstreams: [...p.workstreams, newWorkstream] }))
          : a
      ),
      events: [...s.events, event],
    }));
    addWorkstreamAction(projectId, newWorkstream, event).catch((err) => reportError("adding the workstream", err));
  },

  updateWorkstream: (areaId, projectId, wsId, patch) => {
    const area = get().areas.find((a) => a.id === areaId);
    const project = area?.projects.find((p) => p.id === projectId);
    const existing = project?.workstreams.find((w) => w.id === wsId);
    const timestamp = new Date().toISOString();
    const statusChanged = existing !== undefined && patch.status !== undefined && patch.status !== existing.status;
    const event: WorkstreamEvent | null =
      statusChanged && existing
        ? {
            id: id(),
            areaId,
            areaName: area?.name ?? "",
            projectId,
            projectName: project ? formatWeekLabel(project.weekStart) : "",
            workstreamId: wsId,
            workstreamName: patch.name ?? existing.name,
            workstreamDescriptor: patch.descriptor ?? existing.descriptor,
            fromStatus: existing.status,
            toStatus: patch.status!,
            timestamp,
          }
        : null;
    set((s) => ({
      areas: s.areas.map((a) =>
        a.id === areaId
          ? mapProject(a, projectId, (p) => ({
              ...p,
              workstreams: p.workstreams.map((w) => (w.id === wsId ? { ...w, ...patch, updatedAt: timestamp } : w)),
            }))
          : a
      ),
      events: event ? [...s.events, event] : s.events,
    }));
    updateWorkstreamAction(wsId, { ...patch, updatedAt: timestamp }, event).catch((err) =>
      reportError("updating the workstream", err)
    );
  },

  deleteWorkstream: (areaId, projectId, wsId) => {
    set((s) => ({
      areas: s.areas.map((a) =>
        a.id === areaId
          ? mapProject(a, projectId, (p) => ({ ...p, workstreams: p.workstreams.filter((w) => w.id !== wsId) }))
          : a
      ),
    }));
    deleteWorkstreamAction(wsId).catch((err) => reportError("removing the workstream", err));
  },
}));

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: null,
      login: (email) => set({ isAuthenticated: true, email }),
      logout: () => set({ isAuthenticated: false, email: null }),
    }),
    { name: "brag-doc-auth" }
  )
);
