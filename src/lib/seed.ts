import { Area, Project, Workstream, WorkstreamEvent } from "./types";

function id() {
  return Math.random().toString(36).slice(2, 10);
}

const now = new Date().toISOString();

function ws(w: Omit<Workstream, "id" | "updatedAt">): Workstream {
  return { ...w, id: id(), updatedAt: now };
}

function project(p: Omit<Project, "id" | "createdAt">): Project {
  return { ...p, id: id(), createdAt: now };
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function seedAreas(): Area[] {
  return [
    {
      id: id(),
      name: "Nexus Wave AI",
      descriptor: "Full-time role",
      color: "#7c6cf0",
      archived: false,
      createdAt: now,
      owner: "You",
      projects: [
        project({
          name: "Conversations Platform",
          descriptor: "Customer intelligence",
          owner: "You",
          nextMilestoneDate: "28 Jul",
          nextMilestoneLabel: "Escalation revamp ships to staging",
          needToKnow: "Need design sign-off on the triage scoring model by 25 Jul.",
          workstreams: [
            ws({
              name: "Signal escalation revamp",
              descriptor: "Customer intelligence",
              status: "progress",
              priority: 1,
              blocker: "Waiting on design review from platform team",
              details: "Rebuilding the escalation queue so high-signal conversations reach a human expert faster.",
              nextSteps: "Ship the triage scoring model to staging, then get design sign-off.",
              targetDate: "28 Jul",
              dateTag: "ontrack",
              difficulty: 4,
              enjoyment: 5,
            }),
            ws({
              name: "Virtual agent SOP coverage",
              descriptor: "Conversations platform",
              status: "done",
              priority: 2,
              blocker: null,
              details: "Extended SOP coverage to the top 12 unresolved intents, cutting handoff rate.",
              nextSteps: "Monitor resolution rate for two weeks before expanding further.",
              targetDate: "10 Jul",
              dateTag: "complete",
              difficulty: 3,
              enjoyment: 4,
            }),
          ],
        }),
        project({
          name: "Career Growth",
          descriptor: "Performance",
          owner: "You",
          nextMilestoneDate: "02 Aug",
          nextMilestoneLabel: "Quarterly review submitted",
          needToKnow: "Nothing blocking — just needs focus time.",
          workstreams: [
            ws({
              name: "Quarterly perf review prep",
              descriptor: "Career",
              status: "notstarted",
              priority: 3,
              blocker: null,
              details: "Need to pull together the wins from this quarter into a review doc.",
              nextSteps: "Block time this week to draft it.",
              targetDate: "02 Aug",
              dateTag: "ontrack",
              difficulty: 2,
              enjoyment: 2,
            }),
          ],
        }),
      ],
    },
    {
      id: id(),
      name: "Palda",
      descriptor: "Startup · founder",
      color: "#00d4a0",
      archived: false,
      createdAt: now,
      owner: "You",
      projects: [
        project({
          name: "Fundraising",
          descriptor: "Seed round",
          owner: "You",
          nextMilestoneDate: "22 Jul",
          nextMilestoneLabel: "Seed deck v3 finalized",
          needToKnow: "Need updated ARR numbers from finance sheet before it can go to advisors.",
          workstreams: [
            ws({
              name: "Seed deck v3",
              descriptor: "Fundraising",
              status: "progress",
              priority: 1,
              blocker: "Need updated ARR numbers from finance sheet",
              details: "Tightening the narrative around traction and the Q3 growth curve.",
              nextSteps: "Finalize numbers, then send to two advisors for feedback.",
              targetDate: "22 Jul",
              dateTag: "risk",
              difficulty: 5,
              enjoyment: 3,
            }),
          ],
        }),
        project({
          name: "Go-to-Market",
          descriptor: "Early sales",
          owner: "You",
          nextMilestoneDate: "25 Jul",
          nextMilestoneLabel: "First pilot kicked off",
          needToKnow: "None right now.",
          workstreams: [
            ws({
              name: "First paid pilot",
              descriptor: "Sales",
              status: "progress",
              priority: 1,
              blocker: null,
              details: "Onboarding the first paying design partner onto the platform.",
              nextSteps: "Kickoff call scheduled, then configure their workspace.",
              targetDate: "25 Jul",
              dateTag: "ontrack",
              difficulty: 4,
              enjoyment: 5,
            }),
          ],
        }),
      ],
    },
    {
      id: id(),
      name: "Personal Life",
      descriptor: "Health · family · growth",
      color: "#4da6ff",
      archived: false,
      createdAt: now,
      owner: "You",
      projects: [
        project({
          name: "Health",
          descriptor: "Fitness",
          owner: "You",
          nextMilestoneDate: "14 Sep",
          nextMilestoneLabel: "Half-marathon race day",
          needToKnow: "None — on schedule.",
          workstreams: [
            ws({
              name: "Half-marathon training block",
              descriptor: "Health",
              status: "progress",
              priority: 2,
              blocker: null,
              details: "Week 6 of 12, long runs progressing on schedule.",
              nextSteps: "Hit the 14km long run this weekend.",
              targetDate: "14 Sep",
              dateTag: "ontrack",
              difficulty: 3,
              enjoyment: 5,
            }),
          ],
        }),
        project({
          name: "Family",
          descriptor: "Trip planning",
          owner: "You",
          nextMilestoneDate: "05 Aug",
          nextMilestoneLabel: "Dates and flights locked",
          needToKnow: "Need buy-in on travel dates from family by 05 Aug.",
          workstreams: [
            ws({
              name: "Family trip planning",
              descriptor: "Family",
              status: "notstarted",
              priority: 3,
              blocker: null,
              details: "Need to lock dates and flights for the December trip home.",
              nextSteps: "Compare flight prices and propose two date ranges.",
              targetDate: "05 Aug",
              dateTag: "ontrack",
              difficulty: 1,
              enjoyment: 4,
            }),
          ],
        }),
      ],
    },
    {
      id: id(),
      name: "BDH Consulting",
      descriptor: "Consulting business",
      color: "#f5a623",
      archived: false,
      createdAt: now,
      owner: "You",
      projects: [
        project({
          name: "Client Delivery",
          descriptor: "Retail client",
          owner: "You",
          nextMilestoneDate: "30 Jul",
          nextMilestoneLabel: "Ops audit findings delivered",
          needToKnow: "Need data warehouse access from client IT before interviews can start.",
          workstreams: [
            ws({
              name: "Client audit — retail client",
              descriptor: "Delivery",
              status: "progress",
              priority: 1,
              blocker: "Access to client's data warehouse still pending",
              details: "Running the ops efficiency audit for the Q3 engagement.",
              nextSteps: "Escalate access request, start with the interviews in the meantime.",
              targetDate: "30 Jul",
              dateTag: "risk",
              difficulty: 4,
              enjoyment: 3,
            }),
          ],
        }),
        project({
          name: "Operations",
          descriptor: "Back office",
          owner: "You",
          nextMilestoneDate: "20 Jul",
          nextMilestoneLabel: "Invoices sent",
          needToKnow: "None — just overdue.",
          workstreams: [
            ws({
              name: "Invoice backlog",
              descriptor: "Ops",
              status: "notstarted",
              priority: 4,
              blocker: null,
              details: "Two invoices from June still need to go out.",
              nextSteps: "Send both by end of week.",
              targetDate: "20 Jul",
              dateTag: "late",
              difficulty: 1,
              enjoyment: 1,
            }),
          ],
        }),
      ],
    },
  ];
}

/** Fabricates a plausible status-change history for the seeded workstreams, so reports have something to show out of the box. */
export function seedEvents(areas: Area[]): WorkstreamEvent[] {
  const events: WorkstreamEvent[] = [];
  let offset = 3;

  for (const area of areas) {
    for (const proj of area.projects) {
      for (const w of proj.workstreams) {
        const base = {
          areaId: area.id,
          areaName: area.name,
          projectId: proj.id,
          projectName: proj.name,
          workstreamId: w.id,
          workstreamName: w.name,
          workstreamDescriptor: w.descriptor,
        };
        const createdDaysAgo = offset + 12;

        events.push({ ...base, id: id(), fromStatus: null, toStatus: "notstarted", timestamp: daysAgo(createdDaysAgo) });

        if (w.status !== "notstarted") {
          events.push({
            ...base,
            id: id(),
            fromStatus: "notstarted",
            toStatus: "progress",
            timestamp: daysAgo(createdDaysAgo - 4),
          });
        }
        if (w.status === "done") {
          events.push({
            ...base,
            id: id(),
            fromStatus: "progress",
            toStatus: "done",
            timestamp: daysAgo(Math.max(offset, 1)),
          });
        }
        offset += 2;
      }
    }
  }

  return events;
}
