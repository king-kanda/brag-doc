import { pgTable, text, boolean, integer, timestamp, date } from "drizzle-orm/pg-core";

export const areas = pgTable("areas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  descriptor: text("descriptor").notNull().default(""),
  color: text("color").notNull(),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  owner: text("owner").notNull().default("You"),
  weekStartsOn: integer("week_starts_on").notNull().default(1),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  areaId: text("area_id")
    .notNull()
    .references(() => areas.id, { onDelete: "cascade" }),
  weekStart: date("week_start", { mode: "string" }).notNull(),
  descriptor: text("descriptor").notNull().default(""),
  owner: text("owner").notNull().default("You"),
  nextMilestoneDate: text("next_milestone_date").notNull().default(""),
  nextMilestoneLabel: text("next_milestone_label").notNull().default(""),
  needToKnow: text("need_to_know").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workstreams = pgTable("workstreams", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  descriptor: text("descriptor").notNull().default(""),
  status: text("status").notNull(),
  priority: integer("priority").notNull(),
  blocker: text("blocker"),
  details: text("details").notNull().default(""),
  nextSteps: text("next_steps").notNull().default(""),
  targetDate: text("target_date").notNull().default(""),
  dateTag: text("date_tag").notNull(),
  difficulty: integer("difficulty").notNull(),
  enjoyment: integer("enjoyment").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Intentionally denormalized, no foreign keys: events must remain readable
// (and reportable on) even after the area/project/workstream they describe
// has been deleted.
export const workstreamEvents = pgTable("workstream_events", {
  id: text("id").primaryKey(),
  areaId: text("area_id").notNull(),
  areaName: text("area_name").notNull(),
  projectId: text("project_id").notNull(),
  projectName: text("project_name").notNull(),
  workstreamId: text("workstream_id").notNull(),
  workstreamName: text("workstream_name").notNull(),
  workstreamDescriptor: text("workstream_descriptor").notNull().default(""),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});
