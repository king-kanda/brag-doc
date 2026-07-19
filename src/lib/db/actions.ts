"use server";

import { and, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { areas, projects, whiteboards, workstreamEvents, workstreams } from "./schema";
import { Area, Priority, Project, RagStatus, Whiteboard, Workstream, WorkstreamEvent } from "../types";
import { startOfWeekFor, toISODate } from "../weeks";

function toWorkstream(row: typeof workstreams.$inferSelect): Workstream {
  return {
    id: row.id,
    name: row.name,
    descriptor: row.descriptor,
    status: row.status as RagStatus,
    priority: row.priority as Priority,
    blocker: row.blocker,
    details: row.details,
    nextSteps: row.nextSteps,
    targetDate: row.targetDate,
    dateTag: row.dateTag as Workstream["dateTag"],
    difficulty: row.difficulty,
    enjoyment: row.enjoyment,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toProject(row: typeof projects.$inferSelect, ws: Workstream[]): Project {
  return {
    id: row.id,
    weekStart: row.weekStart,
    descriptor: row.descriptor,
    owner: row.owner,
    nextMilestoneDate: row.nextMilestoneDate,
    nextMilestoneLabel: row.nextMilestoneLabel,
    needToKnow: row.needToKnow,
    createdAt: row.createdAt.toISOString(),
    workstreams: ws,
  };
}

function toArea(row: typeof areas.$inferSelect, projs: Project[]): Area {
  return {
    id: row.id,
    name: row.name,
    descriptor: row.descriptor,
    color: row.color,
    archived: row.archived,
    createdAt: row.createdAt.toISOString(),
    owner: row.owner,
    weekStartsOn: row.weekStartsOn,
    projects: projs,
  };
}

function toEvent(row: typeof workstreamEvents.$inferSelect): WorkstreamEvent {
  return {
    id: row.id,
    areaId: row.areaId,
    areaName: row.areaName,
    projectId: row.projectId,
    projectName: row.projectName,
    workstreamId: row.workstreamId,
    workstreamName: row.workstreamName,
    workstreamDescriptor: row.workstreamDescriptor,
    fromStatus: row.fromStatus as RagStatus | null,
    toStatus: row.toStatus as RagStatus,
    timestamp: row.timestamp.toISOString(),
  };
}

function toWhiteboard(row: typeof whiteboards.$inferSelect): Whiteboard {
  return {
    id: row.id,
    areaId: row.areaId,
    workstreamId: row.workstreamId,
    name: row.name,
    data: row.data,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function fetchAllData(): Promise<{ areas: Area[]; events: WorkstreamEvent[]; whiteboards: Whiteboard[] }> {
  const [areaRows, projectRows, workstreamRows, eventRows, whiteboardRows] = await Promise.all([
    db.select().from(areas),
    db.select().from(projects),
    db.select().from(workstreams),
    db.select().from(workstreamEvents),
    db.select().from(whiteboards),
  ]);

  const workstreamsByProject = new Map<string, Workstream[]>();
  for (const row of workstreamRows) {
    const list = workstreamsByProject.get(row.projectId) ?? [];
    list.push(toWorkstream(row));
    workstreamsByProject.set(row.projectId, list);
  }

  const projectsByArea = new Map<string, Project[]>();
  for (const row of projectRows) {
    const list = projectsByArea.get(row.areaId) ?? [];
    list.push(toProject(row, workstreamsByProject.get(row.id) ?? []));
    projectsByArea.set(row.areaId, list);
  }

  const resultAreas = areaRows.map((row) => toArea(row, projectsByArea.get(row.id) ?? []));
  const resultEvents = eventRows.map(toEvent);
  const resultWhiteboards = whiteboardRows.map(toWhiteboard);

  return { areas: resultAreas, events: resultEvents, whiteboards: resultWhiteboards };
}

/** Persists an area the client has already constructed (with its final id). */
export async function createAreaAction(area: Omit<Area, "projects">): Promise<void> {
  await db.insert(areas).values({
    id: area.id,
    name: area.name,
    descriptor: area.descriptor,
    color: area.color,
    archived: area.archived,
    owner: area.owner,
    weekStartsOn: area.weekStartsOn,
    createdAt: new Date(area.createdAt),
  });
}

export async function updateAreaAction(
  id: string,
  patch: Partial<Pick<Area, "name" | "descriptor" | "color" | "weekStartsOn" | "archived">>
): Promise<void> {
  await db.update(areas).set(patch).where(eq(areas.id, id));
}

export async function deleteAreaAction(id: string): Promise<void> {
  await db.delete(areas).where(eq(areas.id, id));
}

/**
 * Server-authoritative: reads current DB state to decide whether this
 * area already has a project for the current week, creating one (with
 * not-done workstreams carried forward from the prior week) if not.
 */
export async function ensureCurrentWeekProjectAction(areaId: string): Promise<Project> {
  const [area] = await db.select().from(areas).where(eq(areas.id, areaId));
  if (!area) throw new Error("Area not found");

  const weekStart = toISODate(startOfWeekFor(new Date(), area.weekStartsOn));

  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.areaId, areaId), eq(projects.weekStart, weekStart)));
  if (existing) {
    const ws = await db.select().from(workstreams).where(eq(workstreams.projectId, existing.id));
    return toProject(existing, ws.map(toWorkstream));
  }

  const [priorProject] = await db
    .select()
    .from(projects)
    .where(eq(projects.areaId, areaId))
    .orderBy(desc(projects.weekStart))
    .limit(1);

  const carriedSource = priorProject
    ? (await db.select().from(workstreams).where(eq(workstreams.projectId, priorProject.id))).filter(
        (w) => w.status !== "done"
      )
    : [];

  const [newProjectRow] = await db
    .insert(projects)
    .values({
      id: crypto.randomUUID(),
      areaId,
      weekStart,
      descriptor: "",
      owner: priorProject?.owner ?? "You",
      nextMilestoneDate: "",
      nextMilestoneLabel: "",
      needToKnow: "",
    })
    .returning();

  let carriedWorkstreams: Workstream[] = [];
  if (carriedSource.length > 0) {
    const inserted = await db
      .insert(workstreams)
      .values(
        carriedSource.map((w) => ({
          id: crypto.randomUUID(),
          projectId: newProjectRow.id,
          name: w.name,
          descriptor: w.descriptor,
          status: w.status,
          priority: w.priority,
          blocker: w.blocker,
          details: w.details,
          nextSteps: w.nextSteps,
          targetDate: w.targetDate,
          dateTag: w.dateTag,
          difficulty: w.difficulty,
          enjoyment: w.enjoyment,
        }))
      )
      .returning();
    carriedWorkstreams = inserted.map(toWorkstream);
  }

  return toProject(newProjectRow, carriedWorkstreams);
}

export async function updateProjectMetaAction(
  projectId: string,
  patch: Partial<Pick<Project, "descriptor" | "owner" | "nextMilestoneDate" | "nextMilestoneLabel" | "needToKnow">>
): Promise<void> {
  await db.update(projects).set(patch).where(eq(projects.id, projectId));
}

function eventToRow(event: WorkstreamEvent) {
  return { ...event, timestamp: new Date(event.timestamp) };
}

/** Persists a workstream (and its creation event) the client has already constructed. */
export async function addWorkstreamAction(projectId: string, workstream: Workstream, event: WorkstreamEvent): Promise<void> {
  await db.insert(workstreams).values({
    id: workstream.id,
    projectId,
    name: workstream.name,
    descriptor: workstream.descriptor,
    status: workstream.status,
    priority: workstream.priority,
    blocker: workstream.blocker,
    details: workstream.details,
    nextSteps: workstream.nextSteps,
    targetDate: workstream.targetDate,
    dateTag: workstream.dateTag,
    difficulty: workstream.difficulty,
    enjoyment: workstream.enjoyment,
    updatedAt: new Date(workstream.updatedAt),
  });
  await db.insert(workstreamEvents).values(eventToRow(event));
}

export async function updateWorkstreamAction(
  workstreamId: string,
  patch: Partial<Workstream>,
  event: WorkstreamEvent | null
): Promise<void> {
  const { id: _id, updatedAt, ...safePatch } = patch;
  void _id;
  await db
    .update(workstreams)
    .set({ ...safePatch, ...(updatedAt ? { updatedAt: new Date(updatedAt) } : {}) })
    .where(eq(workstreams.id, workstreamId));
  if (event) {
    await db.insert(workstreamEvents).values(eventToRow(event));
  }
}

export async function deleteWorkstreamAction(workstreamId: string): Promise<void> {
  await db.delete(workstreams).where(eq(workstreams.id, workstreamId));
}

/** Persists a whiteboard the client has already constructed. */
export async function createWhiteboardAction(board: Whiteboard): Promise<void> {
  await db.insert(whiteboards).values({
    id: board.id,
    areaId: board.areaId,
    workstreamId: board.workstreamId,
    name: board.name,
    data: board.data,
    createdAt: new Date(board.createdAt),
    updatedAt: new Date(board.updatedAt),
  });
}

export async function updateWhiteboardAction(
  id: string,
  patch: Partial<Pick<Whiteboard, "name" | "data">>
): Promise<void> {
  await db
    .update(whiteboards)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(whiteboards.id, id));
}

export async function deleteWhiteboardAction(id: string): Promise<void> {
  await db.delete(whiteboards).where(eq(whiteboards.id, id));
}
