import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Area, Project, Workstream, WorkstreamEvent } from "./types";
import { seedAreas, seedEvents } from "./seed";

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
  addArea: (input: { name: string; descriptor: string; color: string }) => void;
  archiveArea: (id: string) => void;
  restoreArea: (id: string) => void;
  renameArea: (id: string, patch: Partial<Pick<Area, "name" | "descriptor" | "color">>) => void;
  addProject: (areaId: string, input: Omit<Project, "id" | "createdAt" | "workstreams">) => string;
  updateProject: (areaId: string, projectId: string, patch: Partial<Omit<Project, "id" | "workstreams">>) => void;
  deleteProject: (areaId: string, projectId: string) => void;
  addWorkstream: (areaId: string, projectId: string, ws: Omit<Workstream, "id" | "updatedAt">) => void;
  updateWorkstream: (areaId: string, projectId: string, wsId: string, patch: Partial<Workstream>) => void;
  deleteWorkstream: (areaId: string, projectId: string, wsId: string) => void;
}

const initialAreas = seedAreas();

export const useAreaStore = create<AreaState>()(
  persist(
    (set, get) => ({
      areas: initialAreas,
      events: seedEvents(initialAreas),
      activeAreaId: null,
      setActiveArea: (areaId) => set({ activeAreaId: areaId }),
      addArea: ({ name, descriptor, color }) => {
        const newArea: Area = {
          id: id(),
          name,
          descriptor,
          color,
          archived: false,
          createdAt: new Date().toISOString(),
          owner: "You",
          projects: [],
        };
        set((s) => ({ areas: [...s.areas, newArea], activeAreaId: newArea.id }));
      },
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
      renameArea: (areaId, patch) =>
        set((s) => ({
          areas: s.areas.map((a) => (a.id === areaId ? { ...a, ...patch } : a)),
        })),
      addProject: (areaId, input) => {
        const newProject: Project = { ...input, id: id(), createdAt: new Date().toISOString(), workstreams: [] };
        set((s) => ({
          areas: s.areas.map((a) => (a.id === areaId ? { ...a, projects: [...a.projects, newProject] } : a)),
        }));
        return newProject.id;
      },
      updateProject: (areaId, projectId, patch) =>
        set((s) => ({
          areas: s.areas.map((a) =>
            a.id === areaId ? mapProject(a, projectId, (p) => ({ ...p, ...patch })) : a
          ),
        })),
      deleteProject: (areaId, projectId) =>
        set((s) => ({
          areas: s.areas.map((a) =>
            a.id === areaId ? { ...a, projects: a.projects.filter((p) => p.id !== projectId) } : a
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
          projectName: project?.name ?? "",
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
                projectName: project?.name ?? "",
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
      version: 3,
      migrate: (persistedState, version) => {
        if (version < 2) {
          const areas = seedAreas();
          return { areas, events: seedEvents(areas), activeAreaId: null };
        }
        if (version < 3) {
          // Existing installs predate the event log — backfill a plausible
          // history from whatever areas/projects/workstreams the user already
          // has, instead of leaving `events` empty and making everything
          // they'd already done invisible to reports.
          const state = persistedState as { areas: Area[]; activeAreaId: string | null };
          return { ...state, events: seedEvents(state.areas) };
        }
        return persistedState as AreaState;
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
