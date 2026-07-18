import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Area, Project, Workstream, WorkstreamEvent } from "./types";
import { seedAreas } from "./seed";
import { formatWeekLabel, startOfWeekFor, toISODate } from "./weeks";

function id() {
  return Math.random().toString(36).slice(2, 10);
}

function mapProject(area: Area, projectId: string, fn: (p: Project) => Project): Area {
  return { ...area, projects: area.projects.map((p) => (p.id === projectId ? fn(p) : p)) };
}

interface AreaState {
  areas: Area[];
  events: WorkstreamEvent[];
  activeAreaId: string | null;
  setActiveArea: (id: string) => void;
  addArea: (input: { name: string; descriptor: string; color: string; weekStartsOn: number }) => void;
  updateArea: (id: string, patch: Partial<Pick<Area, "name" | "descriptor" | "color" | "weekStartsOn">>) => void;
  archiveArea: (id: string) => void;
  restoreArea: (id: string) => void;
  deleteArea: (id: string) => void;
  /** Returns the id of the current week's project for this area, creating it (with not-done workstreams carried forward) if it doesn't exist yet. */
  ensureCurrentWeekProject: (areaId: string) => string;
  updateProjectMeta: (
    areaId: string,
    projectId: string,
    patch: Partial<Pick<Project, "descriptor" | "owner" | "nextMilestoneDate" | "nextMilestoneLabel" | "needToKnow">>
  ) => void;
  addWorkstream: (areaId: string, projectId: string, ws: Omit<Workstream, "id" | "updatedAt">) => void;
  updateWorkstream: (areaId: string, projectId: string, wsId: string, patch: Partial<Workstream>) => void;
  deleteWorkstream: (areaId: string, projectId: string, wsId: string) => void;
}

export const useAreaStore = create<AreaState>()(
  persist(
    (set, get) => ({
      areas: seedAreas(),
      events: [],
      activeAreaId: null,
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
      },
      updateArea: (areaId, patch) =>
        set((s) => ({
          areas: s.areas.map((a) => (a.id === areaId ? { ...a, ...patch } : a)),
        })),
      archiveArea: (areaId) => {
        set((s) => ({
          areas: s.areas.map((a) => (a.id === areaId ? { ...a, archived: true } : a)),
        }));
        const { areas, activeAreaId } = get();
        if (activeAreaId === areaId) {
          const nextActive = areas.find((a) => !a.archived && a.id !== areaId);
          set({ activeAreaId: nextActive ? nextActive.id : null });
        }
      },
      restoreArea: (areaId) =>
        set((s) => ({
          areas: s.areas.map((a) => (a.id === areaId ? { ...a, archived: false } : a)),
        })),
      deleteArea: (areaId) => {
        set((s) => ({ areas: s.areas.filter((a) => a.id !== areaId) }));
        const { activeAreaId, areas } = get();
        if (activeAreaId === areaId) {
          const nextActive = areas.find((a) => !a.archived);
          set({ activeAreaId: nextActive ? nextActive.id : null });
        }
      },
      ensureCurrentWeekProject: (areaId) => {
        const area = get().areas.find((a) => a.id === areaId);
        if (!area) return "";

        const weekStart = toISODate(startOfWeekFor(new Date(), area.weekStartsOn));
        const existing = area.projects.find((p) => p.weekStart === weekStart);
        if (existing) return existing.id;

        const priorProject = [...area.projects].sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0];
        const timestamp = new Date().toISOString();
        const carried: Workstream[] = priorProject
          ? priorProject.workstreams
              .filter((w) => w.status !== "done")
              .map((w) => ({ ...w, id: id(), updatedAt: timestamp }))
          : [];

        const newProject: Project = {
          id: id(),
          weekStart,
          descriptor: "",
          owner: priorProject?.owner ?? "You",
          nextMilestoneDate: "",
          nextMilestoneLabel: "",
          needToKnow: "",
          createdAt: timestamp,
          workstreams: carried,
        };

        set((s) => ({
          areas: s.areas.map((a) => (a.id === areaId ? { ...a, projects: [...a.projects, newProject] } : a)),
        }));

        return newProject.id;
      },
      updateProjectMeta: (areaId, projectId, patch) =>
        set((s) => ({
          areas: s.areas.map((a) =>
            a.id === areaId ? mapProject(a, projectId, (p) => ({ ...p, ...patch })) : a
          ),
        })),
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
      },
      updateWorkstream: (areaId, projectId, wsId, patch) => {
        const area = get().areas.find((a) => a.id === areaId);
        const project = area?.projects.find((p) => p.id === projectId);
        const existing = project?.workstreams.find((w) => w.id === wsId);
        const timestamp = new Date().toISOString();
        const statusChanged =
          existing !== undefined && patch.status !== undefined && patch.status !== existing.status;
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
      },
      deleteWorkstream: (areaId, projectId, wsId) =>
        set((s) => ({
          areas: s.areas.map((a) =>
            a.id === areaId
              ? mapProject(a, projectId, (p) => ({
                  ...p,
                  workstreams: p.workstreams.filter((w) => w.id !== wsId),
                }))
              : a
          ),
        })),
    }),
    {
      name: "brag-doc-areas",
      version: 4,
      migrate: (_persistedState, version) => {
        // Projects changed from arbitrarily-named to fixed weekly buckets in
        // v4 — there's no sensible automatic mapping from an old named
        // project to a week, so installs from before this shipped start
        // fresh rather than carrying over a shape that no longer fits.
        if (version < 4) {
          return { areas: seedAreas(), events: [], activeAreaId: null };
        }
        return _persistedState as AreaState;
      },
    }
  )
);

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
